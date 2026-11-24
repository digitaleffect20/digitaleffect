// Cloudflare Pages Function: POST /api/team/hash-password
// Produces salted PBKDF2-SHA256 hashes portable across Edge, Node, and Browsers.

import { hashPasswordPbkdf2 } from '../../../src/utils/teamCryptoEdge';

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
    const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
    const password = typeof body?.password === 'string' ? body.password : '';
    if (password.length < 6 || password.length > 128) {
      return new Response(
        JSON.stringify({ error: 'Password must be between 6 and 128 characters.' }),
        { status: 400, headers: JSON_HEADERS }
      );
    }
    const hash = await hashPasswordPbkdf2(password);
    return new Response(JSON.stringify({ hash }), { status: 200, headers: JSON_HEADERS });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to hash password' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
