// Cloudflare Pages Function: GET & POST /api/team/workspace
// Verifies Bearer team session token on every request, enforces member RBAC permissions
// server-side against Supabase admin_finance_ops, and serves/persists only allowed slices.

import type { AgencyTeamMember, ClientInvoiceRecord, Inquiry } from '../../../src/types';
import { resolveMemberPermissions } from '../../../src/utils/teamAuth';
import {
  sanitizeTeamMember,
  verifyEdgeSessionToken,
} from '../../../src/utils/teamCryptoEdge';
import {
  mapCrmRowToInquiry,
  mapInquiryToCrmRow,
  mapInvoiceToRow,
  mapRowToInvoice,
} from '../../../src/utils/supabaseRowMappers';

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

interface AuthContext {
  supabaseUrl: string;
  serviceRoleKey: string;
  member: AgencyTeamMember;
  finOpsState: Record<string, any>;
}

async function authenticateTeamRequest(
  request: Request,
  env: Env
): Promise<{ auth?: AuthContext; errorResponse?: Response }> {
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const signingSecret = (env.SESSION_SECRET || '').trim() || serviceRoleKey;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      errorResponse: new Response(
        JSON.stringify({ ok: false, configMissing: true }),
        { status: 503, headers: JSON_HEADERS }
      ),
    };
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return {
      errorResponse: new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: JSON_HEADERS,
      }),
    };
  }

  const verified = await verifyEdgeSessionToken(token, signingSecret);
  if (!verified) {
    return {
      errorResponse: new Response(JSON.stringify({ ok: false, error: 'Invalid or expired session' }), {
        status: 401,
        headers: JSON_HEADERS,
      }),
    };
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
    return {
      errorResponse: new Response(JSON.stringify({ ok: false, error: 'Database unavailable' }), {
        status: 502,
        headers: JSON_HEADERS,
      }),
    };
  }

  const rows = (await storeRes.json()) as Array<{ state_json?: Record<string, any> }>;
  const finOpsState = rows?.[0]?.state_json || {};
  const members: AgencyTeamMember[] = Array.isArray(finOpsState.teamMembers)
    ? finOpsState.teamMembers
    : [];
  const member = members.find((m) => m && m.id === verified.memberId);

  if (!member || member.active === false) {
    return {
      errorResponse: new Response(JSON.stringify({ ok: false, error: 'Account inactive' }), {
        status: 403,
        headers: JSON_HEADERS,
      }),
    };
  }

  return {
    auth: {
      supabaseUrl,
      serviceRoleKey,
      member,
      finOpsState,
    },
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { auth, errorResponse } = await authenticateTeamRequest(request, env);
  if (errorResponse || !auth) return errorResponse!;

  const perms = resolveMemberPermissions(auth.member);
  const sbHeaders = {
    apikey: auth.serviceRoleKey,
    Authorization: `Bearer ${auth.serviceRoleKey}`,
    Accept: 'application/json',
  };

  try {
    const clientsPromise = fetch(
      `${auth.supabaseUrl}/rest/v1/crm_client_accounts?select=*&order=client_created_at.desc`,
      { method: 'GET', headers: sbHeaders }
    );

    const invoicesPromise = perms.canViewFinancials
      ? fetch(
          `${auth.supabaseUrl}/rest/v1/client_invoices?select=*&order=invoice_created_at.desc`,
          { method: 'GET', headers: sbHeaders }
        )
      : Promise.resolve(null);

    const [clientsRes, invoicesRes] = await Promise.all([clientsPromise, invoicesPromise]);

    const rawClients = clientsRes.ok ? ((await clientsRes.json()) as any[]) : [];
    const clients: Inquiry[] = Array.isArray(rawClients) ? rawClients.map(mapCrmRowToInquiry) : [];

    let invoices: ClientInvoiceRecord[] = [];
    if (invoicesRes && invoicesRes.ok) {
      const rawInv = (await invoicesRes.json()) as any[];
      invoices = Array.isArray(rawInv) ? rawInv.map(mapRowToInvoice) : [];
    }

    const safeTeamMembers = (Array.isArray(auth.finOpsState.teamMembers)
      ? auth.finOpsState.teamMembers
      : []
    ).map(sanitizeTeamMember);

    return new Response(
      JSON.stringify({
        ok: true,
        member: sanitizeTeamMember(auth.member),
        teamMembers: safeTeamMembers,
        clients,
        ...(perms.canViewFinancials
          ? {
              invoices,
              expenses: Array.isArray(auth.finOpsState.expenses) ? auth.finOpsState.expenses : [],
              financialAuditLog: Array.isArray(auth.finOpsState.financialAuditLog)
                ? auth.finOpsState.financialAuditLog
                : [],
              closedMonths: auth.finOpsState.closedMonths || {},
              financialSettings: auth.finOpsState.financialSettings || undefined,
            }
          : {}),
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Failed to load team workspace' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { auth, errorResponse } = await authenticateTeamRequest(request, env);
  if (errorResponse || !auth) return errorResponse!;

  const perms = resolveMemberPermissions(auth.member);
  const sbHeaders = {
    apikey: auth.serviceRoleKey,
    Authorization: `Bearer ${auth.serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  };

  try {
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      client?: Inquiry;
      invoice?: ClientInvoiceRecord;
      invoiceId?: string;
      financeOps?: Record<string, any>;
    } | null;

    if (!body || typeof body.action !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid action' }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    if (body.action === 'upsert_client' && body.client && body.client.id) {
      const row = mapInquiryToCrmRow(body.client);
      const res = await fetch(`${auth.supabaseUrl}/rest/v1/crm_client_accounts?on_conflict=id`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify(row),
      });
      return new Response(JSON.stringify({ ok: res.ok }), {
        status: res.ok ? 200 : 502,
        headers: JSON_HEADERS,
      });
    }

    if (body.action === 'upsert_invoice' && body.invoice && body.invoice.id) {
      if (!perms.canViewFinancials && !perms.canApproveAdWallet) {
        return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), {
          status: 403,
          headers: JSON_HEADERS,
        });
      }
      const row = mapInvoiceToRow(body.invoice);
      const res = await fetch(`${auth.supabaseUrl}/rest/v1/client_invoices?on_conflict=id`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify(row),
      });
      return new Response(JSON.stringify({ ok: res.ok }), {
        status: res.ok ? 200 : 502,
        headers: JSON_HEADERS,
      });
    }

    if (body.action === 'delete_invoice' && typeof body.invoiceId === 'string' && body.invoiceId) {
      if (!perms.canViewFinancials || !perms.canDeleteRecords) {
        return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), {
          status: 403,
          headers: JSON_HEADERS,
        });
      }
      const res = await fetch(
        `${auth.supabaseUrl}/rest/v1/client_invoices?id=eq.${encodeURIComponent(body.invoiceId)}`,
        {
          method: 'DELETE',
          headers: {
            apikey: auth.serviceRoleKey,
            Authorization: `Bearer ${auth.serviceRoleKey}`,
          },
        }
      );
      return new Response(JSON.stringify({ ok: res.ok }), {
        status: res.ok ? 200 : 502,
        headers: JSON_HEADERS,
      });
    }

    if (body.action === 'save_finance_ops' && body.financeOps && typeof body.financeOps === 'object') {
      if (!perms.canViewFinancials && !perms.canApproveAdWallet) {
        return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), {
          status: 403,
          headers: JSON_HEADERS,
        });
      }
      // Preserve server-stored teamMembers & passwordHashes; team members cannot overwrite team accounts
      const mergedSnapshot = {
        ...auth.finOpsState,
        ...(Array.isArray(body.financeOps.expenses) ? { expenses: body.financeOps.expenses } : {}),
        ...(Array.isArray(body.financeOps.financialAuditLog)
          ? { financialAuditLog: body.financeOps.financialAuditLog }
          : {}),
        ...(body.financeOps.closedMonths ? { closedMonths: body.financeOps.closedMonths } : {}),
        ...(body.financeOps.financialSettings
          ? { financialSettings: body.financeOps.financialSettings }
          : {}),
        teamMembers: auth.finOpsState.teamMembers,
      };
      const res = await fetch(`${auth.supabaseUrl}/rest/v1/agency_crm_store?on_conflict=id`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify({
          id: 'admin_finance_ops',
          state_json: mergedSnapshot,
        }),
      });
      return new Response(JSON.stringify({ ok: res.ok }), {
        status: res.ok ? 200 : 502,
        headers: JSON_HEADERS,
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Unsupported action' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Failed to save team update' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
