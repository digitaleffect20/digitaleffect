// Cloudflare Pages Function: POST /api/team/verify-password
// Verifies both scrypt$ and pbkdf2$ password hashes securely on the edge.

import { verifyStoredPasswordHash } from '../../../src/utils/teamCryptoEdge';

type PagesFunction = (context: {
  request: Request;
  env: Record<string, string | undefined>;
}) => Promise<Response> | Response;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => null)) as {
      password?: unknown;
      hash?: unknown;
    } | null;
    const password = typeof body?.password === 'string' ? body.password : '';
    const storedHash = typeof body?.hash === 'string' ? body.hash : '';
    if (!password || !storedHash || password.length > 128) {
      return new Response(JSON.stringify({ valid: false }), { status: 200, headers: JSON_HEADERS });
    }
    const valid = await verifyStoredPasswordHash(password, storedHash);
    return new Response(JSON.stringify({ valid }), { status: 200, headers: JSON_HEADERS });
  } catch {
    return new Response(JSON.stringify({ valid: false }), { status: 200, headers: JSON_HEADERS });
  }
};
