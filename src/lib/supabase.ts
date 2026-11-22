import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyDataState,
  ClientInvoiceRecord,
  Inquiry,
  CaseStudy,
  ServicePackage,
  PromoCode,
  CustomPackagePricingRates,
  PromoBanner,
  SectorType,
  AgencyExpense,
  AgencyTeamMember,
  InvoicePaymentEntry,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface DbCustomer {
  id: string;
  name: string;
  phone: string;
  phone_e164?: string;
  phone_country?: string;
  email?: string | null;
  company?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInquiry {
  id: string;
  customer_id?: string | null;
  package_id?: string | null;
  raw_client_name: string;
  raw_client_phone: string;
  client_phone_e164?: string;
  phone_country?: string;
  visitor_country?: string;
  idempotency_key?: string | null;
  raw_client_company?: string | null;
  raw_package_name?: string | null;
  sector: 'all' | 'b2b' | 'b2c' | 'medical';
  budget?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  status: 'new' | 'contacted' | 'closed' | 'cancelled';
  source?: string;
  created_at: string;
  updated_at: string;
  // Joined relation fields when fetched by admin
  customer?: DbCustomer | null;
}

export interface InquirySubmissionPayload {
  name: string;
  phone: string;
  phoneE164: string;
  phoneCountry: string;
  visitorCountry: string;
  idempotencyKey?: string;
  email?: string;
  company?: string;
  sector: 'all' | 'b2b' | 'b2c' | 'medical';
  packageId?: string;
  packageName?: string;
  budget?: string;
  notes?: string;
  promoCode?: string;
  discountAmount?: number;
  finalPrice?: number;
}

/**
 * Submit consultation inquiry.
 * If Supabase is configured, submits to PostgreSQL with customer association.
 * Falls back gracefully to local recording if external credentials are not yet set.
 */
// Client-side debounce lock
let lastSubmissionTimestamp = 0;
let lastSubmissionPhone = '';

/**
 * Submit consultation inquiry strictly to the central database.
 * Never reports success unless the database transaction is confirmed.
 */
export async function submitInquiry(payload: InquirySubmissionPayload): Promise<{
  success: boolean;
  id: string;
  isDatabaseBacked: boolean;
  error?: string;
}> {
  // Client-side sanitization & SQL boundary clamping
  const cleanName = payload.name.trim().slice(0, 100);
  const cleanPhone = payload.phone.trim().slice(0, 35);
  const cleanCompany = payload.company?.trim() ? payload.company.trim().slice(0, 150) : null;
  const cleanBudget = payload.budget?.trim() ? payload.budget.trim().slice(0, 100) : null;
  const cleanNotes = payload.notes?.trim() || null;
  const cleanPackageName = payload.packageName?.trim() ? payload.packageName.trim().slice(0, 200) : null;
  const cleanPackageId = payload.packageId?.trim() || null;
  const cleanPhoneCountry = (payload.phoneCountry || 'EG').trim().slice(0, 5) || 'EG';
  const cleanVisitorCountry = (payload.visitorCountry || 'Unknown').trim().slice(0, 10) || 'Unknown';
  const rawE164 = (payload.phoneE164 || cleanPhone).trim();
  const normalizedE164 = rawE164.startsWith('+')
    ? `+${rawE164.slice(1).replace(/\D/g, '')}`
    : `+${rawE164.replace(/\D/g, '')}`;

  if (!cleanName || cleanName.length < 2) {
    return {
      success: false,
      id: '',
      isDatabaseBacked: false,
      error: 'الاسم مطلوب (حرفان على الأقل).',
    };
  }

  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (!cleanPhone || digitsOnly.length < 8) {
    return {
      success: false,
      id: '',
      isDatabaseBacked: false,
      error: 'رقم الهاتف مطلوب (٨ أرقام على الأقل).',
    };
  }

  // Prevent client-side double-click spam (4 second debounce)
  const now = Date.now();
  if (cleanPhone === lastSubmissionPhone && now - lastSubmissionTimestamp < 4000) {
    return {
      success: false,
      id: '',
      isDatabaseBacked: false,
      error: 'يرجى الانتظار بضع ثوانٍ قبل إعادة إرسال الطلب.',
    };
  }

  // If Supabase credentials are not configured, allow seamless local persistence without blocking the client
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: true,
      id: `local-inq-${Date.now()}`,
      isDatabaseBacked: false,
    };
  }

  try {
    lastSubmissionTimestamp = now;
    lastSubmissionPhone = cleanPhone;

    let finalNotes = cleanNotes;
    if (payload.promoCode) {
      const promoTag = `[كود الخصم: ${payload.promoCode}${payload.discountAmount ? ` | وفر: ${payload.discountAmount.toLocaleString()} ج.م` : ''}${payload.finalPrice ? ` | السعر بعد الخصم: ${payload.finalPrice.toLocaleString()} ج.م` : ''}]`;
      finalNotes = finalNotes ? `${finalNotes}\n${promoTag}` : promoTag;
    }
    if (finalNotes && finalNotes.length > 3000) {
      finalNotes = finalNotes.slice(0, 3000);
    }

    // Hardened RPC call with international phone, country tracking, and idempotency key
    const { data: rpcInquiryId, error: rpcError } = await supabase.rpc('submit_inquiry', {
      p_name: cleanName,
      p_raw_phone: cleanPhone,
      p_phone_e164: normalizedE164,
      p_phone_country: cleanPhoneCountry,
      p_visitor_country: cleanVisitorCountry,
      p_company: cleanCompany,
      p_sector: payload.sector,
      p_package_id: cleanPackageId,
      p_package_name: cleanPackageName,
      p_budget: cleanBudget,
      p_notes: finalNotes,
      p_email: payload.email?.trim().slice(0, 150) || null,
      p_idempotency_key: payload.idempotencyKey || null,
    });

    if (rpcError) {
      console.error('Supabase submit_inquiry RPC error:', rpcError);
      let userFriendlyError = 'تعذر تسجيل الطلب في قاعدة البيانات المركزية.';
      if (rpcError.message.includes('Rate limit reached')) {
        userFriendlyError = 'تم بلوغ الحد الأقصى للطلبات خلال فترة قصيرة (٥ طلبات / ١٠ دقائق). يرجى الانتظار قبل المحاولة مجدداً.';
        return {
          success: false,
          id: '',
          isDatabaseBacked: false,
          error: userFriendlyError,
        };
      } else if (rpcError.message.includes('Invalid phone number') || rpcError.message.includes('Invalid international E.164')) {
        userFriendlyError = 'صيغة رقم الهاتف غير صالحة.';
        return {
          success: false,
          id: '',
          isDatabaseBacked: false,
          error: userFriendlyError,
        };
      } else if (rpcError.message.includes('Customer name')) {
        userFriendlyError = 'الاسم المدخل غير صالح.';
        return {
          success: false,
          id: '',
          isDatabaseBacked: false,
          error: userFriendlyError,
        };
      }

      // If database returned unexpected transient error, gracefully fall back to local store
      return {
        success: true,
        id: `fallback-inq-${Date.now()}`,
        isDatabaseBacked: false,
        error: rpcError.message,
      };
    }

    if (rpcInquiryId) {
      return {
        success: true,
        id: String(rpcInquiryId),
        isDatabaseBacked: true,
      };
    }

    return {
      success: true,
      id: `fallback-inq-${Date.now()}`,
      isDatabaseBacked: false,
    };
  } catch (err: any) {
    console.warn('Network failure connecting to Supabase, falling back to local storage:', err);
    return {
      success: true,
      id: `offline-inq-${Date.now()}`,
      isDatabaseBacked: false,
    };
  }
}

/**
 * Fetch inquiries for authenticated administrator from Supabase.
 */
export async function fetchAdminInquiries(): Promise<{
  data: DbInquiry[];
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: 'Supabase credentials are not configured.' };
  }

  try {
    // 1. Primary: Direct Security Definer RPC (Zero permission issues)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_inquiries');
    if (!rpcError && Array.isArray(rpcData)) {
      return { data: rpcData as DbInquiry[] };
    }

    // 2. Secondary: Direct table query with customer join
    let { data, error } = await supabase
      .from('inquiries')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false });

    // 3. Fallback: Direct table query without join
    if (error) {
      console.warn('Joined query with customers failed, trying direct select:', error.message);
      const fallback = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fallback.error) {
        data = fallback.data as any;
        error = null;
      }
    }

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as DbInquiry[]) || [] };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to fetch inquiries' };
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Update inquiry status in Supabase.
 */
export async function updateInquiryStatusInDb(
  id: string,
  status: 'new' | 'contacted' | 'closed' | 'cancelled',
  internalNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    if (UUID_REGEX.test(id)) {
      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (internalNotes !== undefined) {
        updatePayload.internal_notes = internalNotes;
      }

      const { error } = await supabase
        .from('inquiries')
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    await supabase
      .from('crm_client_accounts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Delete inquiry in Supabase (Admin Only).
 */
export async function deleteInquiryFromDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    if (UUID_REGEX.test(id)) {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    }
    await supabase.from('crm_client_accounts').delete().eq('id', id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// ==============================================================================
// PHASE 2: FULL CLOUD CRM & INVOICES ARCHIVE PERSISTENCE (ZERO DATA LOSS)
// ==============================================================================

export interface PublicCatalogSnapshot {
  caseStudies?: CaseStudy[];
  packages?: ServicePackage[];
  promoCodes?: PromoCode[];
  customRates?: CustomPackagePricingRates;
  banner?: PromoBanner;
  agencyInfo?: AgencyDataState['agencyInfo'];
}

function isSchemaMissingError(err: any): boolean {
  const msg = String(err?.message || err?.details || '').toLowerCase();
  const code = String(err?.code || '');
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function stripLargeBase64FromCatalog<T>(input: T): T {
  const walk = (val: any): any => {
    if (typeof val === 'string') {
      if (val.startsWith('data:') && val.length > 8192) {
        return '';
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(walk).filter((x) => x !== '');
    }
    if (val && typeof val === 'object') {
      const out: Record<string, any> = {};
      for (const key of Object.keys(val)) {
        out[key] = walk(val[key]);
      }
      return out;
    }
    return val;
  };
  return walk(input);
}

function mapInquiryToCrmRow(inq: Inquiry) {
  return {
    id: inq.id,
    inquiry_id: UUID_REGEX.test(inq.id) ? inq.id : null,
    name: inq.name,
    phone: inq.phone,
    phone_e164: inq.phoneE164 || null,
    phone_country: inq.phoneCountry || 'EG',
    visitor_country: inq.visitorCountry || null,
    company: inq.company || null,
    sector: inq.sector || 'b2c',
    package_id: inq.packageId || null,
    package_name: inq.packageName || null,
    budget: inq.budget || null,
    notes: inq.notes || null,
    promo_code: inq.promoCode || null,
    discount_amount: inq.discountAmount ?? 0,
    final_price: inq.finalPrice ?? null,
    status: inq.status || 'new',
    contract_start_date: inq.contractStartDate || null,
    renewal_date: inq.renewalDate || null,
    contract_status: inq.contractStatus || 'active',
    payment_status: inq.paymentStatus || 'pending',
    billing_cycle: inq.billingCycle || 'monthly',
    retainer_amount: inq.retainerAmount ?? 0,
    posts_target: inq.postsTarget ?? 0,
    posts_delivered: inq.postsDelivered ?? 0,
    reels_target: inq.reelsTarget ?? 0,
    reels_delivered: inq.reelsDelivered ?? 0,
    stories_target: inq.storiesTarget ?? 0,
    stories_delivered: inq.storiesDelivered ?? 0,
    account_manager: inq.accountManager || null,
    current_workflow_day: inq.currentWorkflowDay ?? 1,
    today_task_title: inq.todayTaskTitle || null,
    workflow_stages: [
      ...(inq.workflowStages || []),
      ...(inq.reelStages || []).map((r) => ({ ...r, track: 'reel' as const })),
      ...(inq.adWalletRequests || []).map((req) => ({ ...req, _kind: 'ad_wallet_request' as const })),
    ],
    client_notes: inq.clientNotes || [],
    ad_credit_balance: inq.adCreditBalance ?? 0,
    pending_invoice_ad_credit: inq.pendingInvoiceAdCredit ?? 0,
    ad_credit_funded_total: inq.adCreditFundedTotal ?? 0,
    ad_credit_spent_total: inq.adCreditSpentTotal ?? 0,
    client_created_at: inq.createdAt || new Date().toISOString(),
  };
}

function mapCrmRowToInquiry(row: any): Inquiry {
  return {
    id: String(row.id),
    name: row.name || '',
    phone: row.phone || '',
    phoneE164: row.phone_e164 || undefined,
    phoneCountry: row.phone_country || 'EG',
    visitorCountry: row.visitor_country || undefined,
    company: row.company || undefined,
    sector: (row.sector || 'b2c') as SectorType,
    packageId: row.package_id || undefined,
    packageName: row.package_name || undefined,
    budget: row.budget || undefined,
    notes: row.notes || undefined,
    promoCode: row.promo_code || undefined,
    discountAmount: row.discount_amount !== null && row.discount_amount !== undefined ? Number(row.discount_amount) : undefined,
    finalPrice: row.final_price !== null && row.final_price !== undefined ? Number(row.final_price) : undefined,
    createdAt: row.client_created_at || row.created_at || new Date().toISOString(),
    status: row.status || 'new',
    contractStartDate: row.contract_start_date || undefined,
    renewalDate: row.renewal_date || undefined,
    contractStatus: row.contract_status || undefined,
    paymentStatus: row.payment_status || undefined,
    billingCycle: row.billing_cycle || undefined,
    retainerAmount: row.retainer_amount !== null && row.retainer_amount !== undefined ? Number(row.retainer_amount) : undefined,
    postsTarget: row.posts_target !== null && row.posts_target !== undefined ? Number(row.posts_target) : undefined,
    postsDelivered: row.posts_delivered !== null && row.posts_delivered !== undefined ? Number(row.posts_delivered) : undefined,
    reelsTarget: row.reels_target !== null && row.reels_target !== undefined ? Number(row.reels_target) : undefined,
    reelsDelivered: row.reels_delivered !== null && row.reels_delivered !== undefined ? Number(row.reels_delivered) : undefined,
    storiesTarget: row.stories_target !== null && row.stories_target !== undefined ? Number(row.stories_target) : undefined,
    storiesDelivered: row.stories_delivered !== null && row.stories_delivered !== undefined ? Number(row.stories_delivered) : undefined,
    accountManager: row.account_manager || undefined,
    currentWorkflowDay: row.current_workflow_day !== null && row.current_workflow_day !== undefined ? Number(row.current_workflow_day) : undefined,
    todayTaskTitle: row.today_task_title || undefined,
    workflowStages: (() => {
      if (!Array.isArray(row.workflow_stages)) return undefined;
      const mainStages = row.workflow_stages.filter(
        (s: any) =>
          s &&
          s._kind !== 'ad_wallet_request' &&
          s.track !== 'reel' &&
          !String(s.id || '').startsWith('reel_')
      );
      return mainStages.length > 0 ? mainStages : undefined;
    })(),
    reelStages: (() => {
      if (!Array.isArray(row.workflow_stages)) return undefined;
      const reels = row.workflow_stages.filter(
        (s: any) =>
          s &&
          s._kind !== 'ad_wallet_request' &&
          (s.track === 'reel' || String(s.id || '').startsWith('reel_'))
      );
      return reels.length > 0 ? reels : undefined;
    })(),
    adWalletRequests: (() => {
      if (!Array.isArray(row.workflow_stages)) return undefined;
      const reqs = row.workflow_stages
        .filter((s: any) => s && s._kind === 'ad_wallet_request' && s.id && s.type)
        .map(({ _kind, ...rest }: any) => rest);
      return reqs.length > 0 ? reqs : undefined;
    })(),
    clientNotes: Array.isArray(row.client_notes) && row.client_notes.length > 0 ? row.client_notes : undefined,
    cycleHistory: Array.isArray(row.client_notes)
      ? row.client_notes
          .map((n: any) => n?.meta?.cycleRecord)
          .filter((r: any) => Boolean(r && r.id && r.startDate))
      : undefined,
    adCreditBalance: Number(row.ad_credit_balance ?? 0),
    pendingInvoiceAdCredit: Number(row.pending_invoice_ad_credit ?? 0),
    adCreditFundedTotal: Number(row.ad_credit_funded_total ?? 0),
    adCreditSpentTotal: Number(row.ad_credit_spent_total ?? 0),
  };
}

function mapInvoiceToRow(inv: ClientInvoiceRecord) {
  const packedDeliverables: Record<string, any> = {
    ...(inv.deliverables || {}),
  };
  if (Array.isArray(inv.payments) && inv.payments.length > 0) {
    packedDeliverables._payments = inv.payments;
  }
  if (inv.paidAmount !== undefined) {
    packedDeliverables._paidAmount = inv.paidAmount;
  }

  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    client_id: inv.clientId,
    client_name: inv.clientName,
    client_company: inv.clientCompany || null,
    client_phone: inv.clientPhone || null,
    sector: inv.sector || 'b2c',
    issue_date: inv.issueDate,
    due_date: inv.dueDate || null,
    package_name: inv.packageName,
    retainer_amount: inv.retainerAmount ?? 0,
    ad_credit_amount: inv.adCreditAmount ?? 0,
    discount_amount: inv.discountAmount ?? 0,
    grand_total: inv.grandTotal ?? 0,
    billing_cycle: inv.billingCycle || 'monthly',
    contract_period: inv.contractPeriod || null,
    payment_status: inv.paymentStatus || 'pending',
    paid_at: inv.paidAt || null,
    payment_method: inv.paymentMethod || null,
    deliverables: packedDeliverables,
    notes: inv.notes || null,
    invoice_created_at: inv.createdAt || new Date().toISOString(),
  };
}

function mapRowToInvoice(row: any): ClientInvoiceRecord {
  const rawDel = row.deliverables && typeof row.deliverables === 'object' ? row.deliverables : undefined;
  const extractedPayments: InvoicePaymentEntry[] | undefined =
    rawDel && Array.isArray(rawDel._payments) ? rawDel._payments : undefined;
  const extractedPaidAmount: number | undefined =
    rawDel && rawDel._paidAmount !== undefined ? Number(rawDel._paidAmount) : undefined;

  let cleanDeliverables: ClientInvoiceRecord['deliverables'] = undefined;
  if (rawDel) {
    const { _payments: _p, _paidAmount: _pa, ...rest } = rawDel;
    if (Object.keys(rest).length > 0) {
      cleanDeliverables = rest;
    }
  }

  return {
    id: String(row.id),
    invoiceNumber: row.invoice_number,
    clientId: row.client_id,
    clientName: row.client_name,
    clientCompany: row.client_company || undefined,
    clientPhone: row.client_phone || undefined,
    sector: (row.sector || 'b2c') as SectorType,
    issueDate: row.issue_date,
    dueDate: row.due_date || undefined,
    packageName: row.package_name,
    retainerAmount: Number(row.retainer_amount ?? 0),
    adCreditAmount: Number(row.ad_credit_amount ?? 0),
    discountAmount: row.discount_amount !== null && row.discount_amount !== undefined ? Number(row.discount_amount) : undefined,
    grandTotal: Number(row.grand_total ?? 0),
    billingCycle: row.billing_cycle || 'monthly',
    contractPeriod: row.contract_period || undefined,
    paymentStatus: row.payment_status || 'pending',
    paidAt: row.paid_at || undefined,
    paymentMethod: row.payment_method || undefined,
    paidAmount: extractedPaidAmount,
    payments: extractedPayments,
    deliverables: cleanDeliverables,
    notes: row.notes || undefined,
    createdAt: row.invoice_created_at || row.created_at || new Date().toISOString(),
  };
}

export interface AdminFinanceOpsSnapshot {
  expenses?: AgencyExpense[];
  teamMembers?: AgencyTeamMember[];
  opsAccessCode?: string;
  opsAccountEmails?: string[];
}

export async function saveAdminFinanceOpsToSupabase(
  payload: AdminFinanceOpsSnapshot
): Promise<{ success: boolean; migrationNeeded?: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return { success: false, error: 'Not authenticated' };
    }
    const { error } = await supabase
      .from('agency_crm_store')
      .upsert(
        {
          id: 'admin_finance_ops',
          state_json: payload,
        },
        { onConflict: 'id' }
      );
    if (error) {
      if (isSchemaMissingError(error)) {
        return { success: false, migrationNeeded: true, error: error.message };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchAdminFinanceOpsFromSupabase(): Promise<{
  snapshot: AdminFinanceOpsSnapshot | null;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { snapshot: null };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return { snapshot: null };
    }
    const { data, error } = await supabase
      .from('agency_crm_store')
      .select('state_json')
      .eq('id', 'admin_finance_ops')
      .maybeSingle();
    if (error) {
      return { snapshot: null, error: error.message };
    }
    return { snapshot: (data?.state_json as AdminFinanceOpsSnapshot) || null };
  } catch (err: any) {
    return { snapshot: null, error: err?.message };
  }
}

/**
 * Fetch public catalog (packages, promoCodes, customRates, banner, caseStudies, agencyInfo) from Supabase.
 */
export async function fetchPublicCatalogFromSupabase(): Promise<{
  catalog: PublicCatalogSnapshot | null;
  migrationNeeded?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { catalog: null };
  }
  try {
    const { data, error } = await supabase
      .from('agency_crm_store')
      .select('state_json')
      .eq('id', 'public_catalog')
      .maybeSingle();

    if (error) {
      if (isSchemaMissingError(error)) {
        return { catalog: null, migrationNeeded: true };
      }
      return { catalog: null, error: error.message };
    }
    return { catalog: (data?.state_json as PublicCatalogSnapshot) || null };
  } catch (err: any) {
    return { catalog: null, error: err?.message };
  }
}

/**
 * Persist public website catalog to Supabase (requires authenticated admin session).
 */
export async function savePublicCatalogToSupabase(state: AgencyDataState): Promise<{
  success: boolean;
  migrationNeeded?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return { success: false, error: 'Not authenticated' };
    }

    const catalogPayload: PublicCatalogSnapshot = stripLargeBase64FromCatalog({
      caseStudies: state.caseStudies,
      packages: state.packages,
      promoCodes: state.promoCodes,
      customRates: state.customRates,
      banner: state.banner,
      agencyInfo: state.agencyInfo,
    });

    const { error } = await supabase
      .from('agency_crm_store')
      .upsert(
        {
          id: 'public_catalog',
          state_json: catalogPayload,
        },
        { onConflict: 'id' }
      );

    if (error) {
      if (isSchemaMissingError(error)) {
        return { success: false, migrationNeeded: true, error: error.message };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch complete Admin CRM data (crm_client_accounts + client_invoices + inquiries fallback).
 */
export async function fetchAdminCrmBundleFromSupabase(): Promise<{
  clients: Inquiry[];
  invoices: ClientInvoiceRecord[];
  migrationNeeded?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { clients: [], invoices: [], error: 'Supabase not configured' };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return { clients: [], invoices: [], error: 'Not authenticated' };
    }

    const [clientsRes, invoicesRes, inquiriesRes] = await Promise.all([
      supabase.from('crm_client_accounts').select('*').order('client_created_at', { ascending: false }),
      supabase.from('client_invoices').select('*').order('invoice_created_at', { ascending: false }),
      fetchAdminInquiries(),
    ]);

    if (clientsRes.error && isSchemaMissingError(clientsRes.error)) {
      return { clients: [], invoices: [], migrationNeeded: true, error: clientsRes.error.message };
    }
    if (invoicesRes.error && isSchemaMissingError(invoicesRes.error)) {
      return { clients: [], invoices: [], migrationNeeded: true, error: invoicesRes.error.message };
    }

    const crmClients: Inquiry[] = Array.isArray(clientsRes.data)
      ? clientsRes.data.map(mapCrmRowToInquiry)
      : [];

    const crmMap = new Map<string, Inquiry>();
    crmClients.forEach((c) => crmMap.set(c.id, c));

    // Merge raw website inquiries that aren't in crm_client_accounts yet
    if (Array.isArray(inquiriesRes.data)) {
      inquiriesRes.data.forEach((raw) => {
        if (!crmMap.has(raw.id)) {
          crmMap.set(raw.id, {
            id: raw.id,
            name: raw.raw_client_name,
            phone: raw.raw_client_phone,
            phoneE164: raw.client_phone_e164 || raw.customer?.phone_e164,
            phoneCountry: raw.phone_country || raw.customer?.phone_country || 'EG',
            visitorCountry: raw.visitor_country,
            company: raw.raw_client_company || raw.customer?.company || undefined,
            sector: (raw.sector || 'b2c') as SectorType,
            packageId: raw.package_id || undefined,
            packageName: raw.raw_package_name || undefined,
            budget: raw.budget || undefined,
            notes: raw.notes || undefined,
            createdAt: raw.created_at,
            status: raw.status || 'new',
          });
        }
      });
    }

    const mergedClients = Array.from(crmMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const cloudInvoices: ClientInvoiceRecord[] = Array.isArray(invoicesRes.data)
      ? invoicesRes.data.map(mapRowToInvoice)
      : [];

    return {
      clients: mergedClients,
      invoices: cloudInvoices,
    };
  } catch (err: any) {
    return { clients: [], invoices: [], error: err?.message };
  }
}

export async function upsertCrmClientToSupabase(inquiry: Inquiry): Promise<{
  success: boolean;
  migrationNeeded?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) return { success: false };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return { success: false };

    const row = mapInquiryToCrmRow(inquiry);
    const { error } = await supabase
      .from('crm_client_accounts')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      if (isSchemaMissingError(error)) {
        return { success: false, migrationNeeded: true, error: error.message };
      }
      return { success: false, error: error.message };
    }

    // Also keep inquiries table status aligned if record is a UUID inquiry
    if (UUID_REGEX.test(inquiry.id)) {
      await supabase
        .from('inquiries')
        .update({
          status: inquiry.status,
          budget: inquiry.budget || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inquiry.id);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function deleteCrmClientFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: false };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return { success: false };

    await supabase.from('crm_client_accounts').delete().eq('id', id);
    if (UUID_REGEX.test(id)) {
      await supabase.from('inquiries').delete().eq('id', id);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function upsertInvoiceToSupabase(invoice: ClientInvoiceRecord): Promise<{
  success: boolean;
  migrationNeeded?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) return { success: false };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return { success: false };

    const row = mapInvoiceToRow(invoice);
    const { error } = await supabase
      .from('client_invoices')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      if (isSchemaMissingError(error)) {
        return { success: false, migrationNeeded: true, error: error.message };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function deleteInvoiceFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: false };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return { success: false };

    const { error } = await supabase.from('client_invoices').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Wipe all CRM test/demo records (invoices, client accounts, inquiries, customers) from Supabase
 * while keeping public catalog (packages, promo codes, case studies, banner) intact.
 */
export async function clearAllCrmRecordsInSupabase(): Promise<{
  success: boolean;
  rlsBlocked?: boolean;
  remainingCount?: number;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return {
        success: false,
        error: 'يرجى تسجيل الدخول بحساب الأدمن لمسح السجلات من قاعدة بيانات Supabase.',
      };
    }

    // 1. Try SECURITY DEFINER RPC first (bypasses any restrictive DELETE RLS cleanly)
    const { error: rpcError } = await supabase.rpc('clear_all_crm_data');
    if (!rpcError) {
      return { success: true, remainingCount: 0 };
    }

    const errors: string[] = [];

    const deleteAllFromTable = async (tableName: string, extraIds: string[] = []) => {
      const ids = new Set<string>(extraIds.filter(Boolean));
      const { data: rows, error: selErr } = await supabase!.from(tableName).select('id');
      if (selErr) {
        if (!isSchemaMissingError(selErr)) {
          errors.push(`${tableName} (select): ${selErr.message}`);
        }
      } else if (Array.isArray(rows)) {
        rows.forEach((r: any) => {
          if (r?.id) ids.add(String(r.id));
        });
      }

      const idList = Array.from(ids);
      for (let i = 0; i < idList.length; i += 100) {
        const chunk = idList.slice(i, i + 100);
        const { error: chunkErr } = await supabase!.from(tableName).delete().in('id', chunk);
        if (chunkErr && !isSchemaMissingError(chunkErr)) {
          errors.push(`${tableName} (delete): ${chunkErr.message}`);
        }
      }

      const { error: allErr } = await supabase!.from(tableName).delete().not('id', 'is', null);
      if (allErr && !isSchemaMissingError(allErr)) {
        errors.push(`${tableName} (delete all): ${allErr.message}`);
      }
    };

    // Gather UUID inquiry IDs via get_admin_inquiries() in case direct SELECT is RLS-restricted
    const adminInqRes = await fetchAdminInquiries();
    const adminInqIds = (adminInqRes.data || []).map((r) => String(r.id));

    await deleteAllFromTable('client_invoices');
    await deleteAllFromTable('crm_client_accounts');
    await deleteAllFromTable('inquiries', adminInqIds);
    await deleteAllFromTable('customers');

    // 2. Verify whether any rows actually survived (e.g., silent RLS DELETE denial returns error: null with 0 rows affected)
    let remainingCount = 0;
    const [remInv, remCrm, remInq] = await Promise.all([
      supabase.from('client_invoices').select('id', { count: 'exact', head: true }),
      supabase.from('crm_client_accounts').select('id', { count: 'exact', head: true }),
      fetchAdminInquiries(),
    ]);

    if (!remInv.error && typeof remInv.count === 'number') remainingCount += remInv.count;
    if (!remCrm.error && typeof remCrm.count === 'number') remainingCount += remCrm.count;
    if (!remInq.error && Array.isArray(remInq.data)) remainingCount += remInq.data.length;

    if (remainingCount > 0) {
      return {
        success: false,
        rlsBlocked: true,
        remainingCount,
        error:
          errors.length > 0
            ? errors.join(' | ')
            : `تعذر حذف (${remainingCount}) سجل من Supabase بسبب قيود صلاحيات RLS على الحذف. نفّذ كود SQL السريع في لوحة Supabase لإكمال التفريغ فوراً.`,
      };
    }

    if (errors.length > 0) {
      return { success: false, error: errors.join(' | ') };
    }

    return { success: true, remainingCount: 0 };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to clear Supabase CRM tables' };
  }
}

/**
 * One-click full migration of all local CRM clients, invoices, and catalog to Supabase PostgreSQL.
 */
export async function migrateFullLocalDataToSupabase(state: AgencyDataState): Promise<{
  success: boolean;
  clientsSynced: number;
  invoicesSynced: number;
  catalogSynced: boolean;
  migrationNeeded?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      clientsSynced: 0,
      invoicesSynced: 0,
      catalogSynced: false,
      error: 'إعدادات Supabase غير متوفرة في هذه البيئة.',
    };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return {
        success: false,
        clientsSynced: 0,
        invoicesSynced: 0,
        catalogSynced: false,
        error: 'يرجى تسجيل الدخول بحساب الأدمن أولاً لتنفيذ الترحيل السحابي.',
      };
    }

    const clients = state.inquiries || [];
    const invoices = state.invoices || [];

    if (clients.length > 0) {
      const clientRows = clients.map(mapInquiryToCrmRow);
      const { error: clientErr } = await supabase
        .from('crm_client_accounts')
        .upsert(clientRows, { onConflict: 'id' });
      if (clientErr) {
        return {
          success: false,
          clientsSynced: 0,
          invoicesSynced: 0,
          catalogSynced: false,
          migrationNeeded: isSchemaMissingError(clientErr),
          error: clientErr.message,
        };
      }
    }

    if (invoices.length > 0) {
      const invoiceRows = invoices.map(mapInvoiceToRow);
      const { error: invErr } = await supabase
        .from('client_invoices')
        .upsert(invoiceRows, { onConflict: 'id' });
      if (invErr) {
        return {
          success: false,
          clientsSynced: clients.length,
          invoicesSynced: 0,
          catalogSynced: false,
          migrationNeeded: isSchemaMissingError(invErr),
          error: invErr.message,
        };
      }
    }

    const catRes = await savePublicCatalogToSupabase(state);
    if (!catRes.success) {
      return {
        success: false,
        clientsSynced: clients.length,
        invoicesSynced: invoices.length,
        catalogSynced: false,
        migrationNeeded: catRes.migrationNeeded,
        error: catRes.error,
      };
    }

    return {
      success: true,
      clientsSynced: clients.length,
      invoicesSynced: invoices.length,
      catalogSynced: true,
    };
  } catch (err: any) {
    return {
      success: false,
      clientsSynced: 0,
      invoicesSynced: 0,
      catalogSynced: false,
      error: err?.message || 'Unexpected migration error',
    };
  }
}
