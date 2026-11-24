// Cloudflare Pages Function: POST /api/team/login
// Authenticates team members server-side against Supabase admin_finance_ops,
// verifies scrypt$ or pbkdf2$ password hashes without ever sending hashes to browsers,
// and issues an HMAC-SHA256 signed Bearer session token.

import type { AgencyTeamMember } from '../../../src/types';
import {
  usernamesMatch,
  verifyStoredPasswordHash,
  signEdgeSessionToken,
  sanitizeTeamMember,
} from '../../../src/utils/teamCryptoEdge';

interface Env {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SESSION_SECRET?: string;
}

type PagesFunction<TEnv = Env> = (context: {
  request: Request;
  env: TEnv;
}) => Promise<Response> | Response;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json().catch(() => null)) as {
      username?: unknown;
      password?: unknown;
    } | null;

    const rawUsername = typeof body?.username === 'string' ? body.username.trim() : '';
    const rawPassword = typeof body?.password === 'string' ? body.password : '';

    if (!rawUsername || !rawPassword || rawPassword.length > 128) {
      return new Response(
        JSON.stringify({ ok: false, invalidCredentials: true }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const signingSecret = (env.SESSION_SECRET || '').trim() || serviceRoleKey;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          configMissing: true,
          error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on Cloudflare Pages.',
        }),
        { status: 503, headers: JSON_HEADERS }
      );
    }

    const storeRes = await fetch(
      `${supabaseUrl}/rest/v1/agency_crm_store?id=eq.admin_finance_ops&select=state_json`,
      {
        method: 'GET',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (!storeRes.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Could not reach team directory in database.',
        }),
        { status: 502, headers: JSON_HEADERS }
      );
    }

    const rows = (await storeRes.json()) as Array<{ state_json?: { teamMembers?: AgencyTeamMember[] } }>;
    const teamMembers = Array.isArray(rows?.[0]?.state_json?.teamMembers)
      ? rows[0].state_json.teamMembers
      : [];

    if (teamMembers.length === 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          directoryEmpty: true,
          invalidCredentials: true,
        }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    const matched = teamMembers.find(
      (m) => m && m.username && usernamesMatch(m.username, rawUsername)
    );

    if (!matched || !matched.passwordHash) {
      return new Response(
        JSON.stringify({ ok: false, invalidCredentials: true }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    if (matched.active === false) {
      return new Response(
        JSON.stringify({ ok: false, suspended: true }),
        { status: 403, headers: JSON_HEADERS }
      );
    }

    const valid = await verifyStoredPasswordHash(rawPassword, matched.passwordHash);
    if (!valid) {
      return new Response(
        JSON.stringify({ ok: false, invalidCredentials: true }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    const now = Date.now();
    const sessionToken = await signEdgeSessionToken(
      {
        memberId: matched.id,
        username: matched.username || rawUsername,
        iat: now,
        exp: now + 12 * 60 * 60 * 1000,
      },
      signingSecret
    );

    return new Response(
      JSON.stringify({
        ok: true,
        member: sanitizeTeamMember(matched),
        sessionToken,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'Authentication service error' }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
};
