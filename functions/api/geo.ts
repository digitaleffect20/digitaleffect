// ==============================================================================
// Cloudflare Pages Function: /api/geo
// Privacy-preserving visitor country detection via Cloudflare edge headers.
// Never exposes or stores IP addresses.
// ==============================================================================

interface Env {
  [key: string]: any;
}

type PagesFunction<TEnv = Env> = (context: {
  request: Request;
  env: TEnv;
  params: Record<string, string | string[]>;
  data: Record<string, any>;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
}) => Promise<Response> | Response;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const req = context.request;

  // Cloudflare injects the 2-letter country code via cf-ipcountry header or request.cf
  const rawCountry = req.headers.get('cf-ipcountry') || (req as any).cf?.country || null;

  // Validate ISO 3166-1 alpha-2 format (exclude internal codes like XX, T1)
  const isValidCountry = Boolean(
    rawCountry &&
    typeof rawCountry === 'string' &&
    rawCountry.length === 2 &&
    rawCountry !== 'XX' &&
    rawCountry !== 'T1'
  );

  const country = isValidCountry ? rawCountry.toUpperCase() : null;

  return new Response(
    JSON.stringify({
      country,
      isDetected: isValidCountry,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
