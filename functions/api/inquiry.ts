// ==============================================================================
// Cloudflare Pages Function: /api/inquiry
// Serverless edge endpoint for secure inquiry validation and insertion
// ==============================================================================

interface Env {
  VITE_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

type PagesFunction<TEnv = Env> = (context: {
  request: Request;
  env: TEnv;
  params: Record<string, string | string[]>;
  data: Record<string, any>;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
}) => Promise<Response> | Response;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body: any = await context.request.json();
    const name = (body.name || '').trim();
    const rawPhone = (body.phone || '').trim();
    const phoneE164 = (body.phoneE164 || '').trim() || null;
    const phoneCountry = (body.phoneCountry || '').trim().toUpperCase() || 'EG';
    const company = (body.company || '').trim() || null;
    const sector = body.sector || 'b2b';
    const packageId = (body.packageId || '').trim() || null;
    const packageName = (body.packageName || '').trim() || null;
    const budget = (body.budget || '').trim() || null;
    const notes = (body.notes || '').trim() || null;
    const email = (body.email || '').trim() || null;
    const idempotencyKey = (body.idempotencyKey || '').trim() || null;

    // Detect visitor country directly from Cloudflare edge header (cannot be forged by client)
    const rawCfCountry = context.request.headers.get('cf-ipcountry') || (context.request as any).cf?.country || null;
    const visitorCountry = (rawCfCountry && rawCfCountry.length === 2 && rawCfCountry !== 'XX' && rawCfCountry !== 'T1')
      ? rawCfCountry.toUpperCase()
      : (body.visitorCountry || 'Unknown');

    // 1. Validation
    if (!name || name.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid customer name is required (min 2 chars).' }),
        { status: 400, headers }
      );
    }

    if (!rawPhone || rawPhone.length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid phone number is required.' }),
        { status: 400, headers }
      );
    }

    // 2. Resolve Supabase Environment Variables
    const supabaseUrl = context.env.SUPABASE_URL || context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_SERVICE_ROLE_KEY || context.env.SUPABASE_ANON_KEY || context.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Central database service is not yet configured.',
          isDatabaseBacked: false,
        }),
        { status: 503, headers }
      );
    }

    // 3. Post to Supabase REST API directly via submit_inquiry RPC
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_inquiry`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_name: name,
        p_raw_phone: rawPhone,
        p_phone_e164: phoneE164 || rawPhone,
        p_phone_country: phoneCountry,
        p_visitor_country: visitorCountry,
        p_company: company,
        p_sector: sector,
        p_package_id: packageId,
        p_package_name: packageName,
        p_budget: budget,
        p_notes: notes,
        p_email: email,
        p_idempotency_key: idempotencyKey,
      }),
    });

    if (rpcRes.ok) {
      const inquiryId = await rpcRes.json();
      return new Response(
        JSON.stringify({ success: true, id: inquiryId, isDatabaseBacked: true }),
        { status: 200, headers }
      );
    }

    const errData: any = await rpcRes.json().catch(() => null);
    const errMessage = errData?.message || errData?.hint || 'Database rejected inquiry submission.';
    return new Response(
      JSON.stringify({ success: false, error: errMessage }),
      { status: 400, headers }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Serverless edge failure' }),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
