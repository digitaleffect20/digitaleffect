import { scrypt } from '@noble/hashes/scrypt.js';
import type { AgencyTeamMember } from '../types';

/**
 * Runtime-agnostic team authentication crypto & username matching helpers.
 * Works identically across Cloudflare Pages Functions (Web Crypto), Node.js, and Browsers.
 */

export function normalizeUsername(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._@-]/g, '');
}

/**
 * Tolerant username matcher: supports both email-style (`user@gmail.com`) and
 * legacy `@`-stripped records (`usergmail.com`) saved by earlier versions.
 */
export function usernamesMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  const na = normalizeUsername(a || '');
  const nb = normalizeUsername(b || '');
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.replace(/@/g, '') === nb.replace(/@/g, '');
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const out = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function hashPasswordPbkdf2(
  password: string,
  existingSaltHex?: string
): Promise<string> {
  const saltBytes = existingSaltHex
    ? hexToBytes(existingSaltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const saltHex = existingSaltHex || bytesToHex(saltBytes);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return `pbkdf2$${saltHex}$${bytesToHex(new Uint8Array(derived))}`;
}

/**
 * Verifies a plaintext password against either `scrypt$salt$hex` (Node crypto.scrypt default params
 * N=16384, r=8, p=1, dkLen=64) or `pbkdf2$salt$hex` (100,000 iterations PBKDF2-SHA256).
 */
export async function verifyStoredPasswordHash(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!password || !storedHash || password.length > 128) return false;

  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (
      parts.length !== 3 ||
      !/^[a-f0-9]{16,64}$/i.test(parts[1]) ||
      !/^[a-f0-9]{64,256}$/i.test(parts[2])
    ) {
      return false;
    }
    const [, salt, expectedHex] = parts;
    try {
      const derived = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 64 });
      const actualHex = bytesToHex(derived);
      return timingSafeEqualStr(actualHex.toLowerCase(), expectedHex.toLowerCase());
    } catch {
      return false;
    }
  }

  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || !parts[1] || !parts[2]) return false;
    const [, saltHex, expectedHex] = parts;
    try {
      const recomputed = await hashPasswordPbkdf2(password, saltHex);
      const actualHex = recomputed.split('$')[2] || '';
      return timingSafeEqualStr(actualHex.toLowerCase(), expectedHex.toLowerCase());
    } catch {
      return false;
    }
  }

  return false;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface EdgeSessionPayload {
  memberId: string;
  username: string;
  iat: number;
  exp: number;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // Derive a clean 256-bit key scoped specifically to team sessions
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(`de-team-session-v1:${secret}`));
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function signEdgeSessionToken(
  payload: EdgeSessionPayload,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const body = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const sig = toBase64Url(new Uint8Array(sigBuf));
  return `${body}.${sig}`;
}

export async function verifyEdgeSessionToken(
  token: string,
  secret: string
): Promise<EdgeSessionPayload | null> {
  try {
    if (!token || !secret) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const enc = new TextEncoder();
    const key = await importHmacKey(secret);
    const expectedSigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    const expectedSig = toBase64Url(new Uint8Array(expectedSigBuf));
    if (!timingSafeEqualStr(sig, expectedSig)) return null;

    const jsonStr = new TextDecoder().decode(fromBase64Url(body));
    const parsed = JSON.parse(jsonStr) as EdgeSessionPayload;
    if (
      !parsed ||
      typeof parsed.memberId !== 'string' ||
      typeof parsed.exp !== 'number' ||
      Date.now() > parsed.exp
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function sanitizeTeamMember(member: AgencyTeamMember): Omit<AgencyTeamMember, 'passwordHash'> {
  const { passwordHash: _omitted, ...safe } = member;
  void _omitted;
  return safe;
}
