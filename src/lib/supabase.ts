import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  // Client-side sanitization
  const cleanName = payload.name.trim();
  const cleanPhone = payload.phone.trim();
  const cleanCompany = payload.company?.trim() || null;
  const cleanBudget = payload.budget?.trim() || null;
  const cleanNotes = payload.notes?.trim() || null;
  const cleanPackageName = payload.packageName?.trim() || null;
  const cleanPackageId = payload.packageId?.trim() || null;

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

  // If Supabase credentials are not configured, reject with clear instructions
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      id: '',
      isDatabaseBacked: false,
      error: 'قاعدة البيانات السحابية المركزية بانتظار استكمال الربط. يرجى التواصل عبر الواتساب مباشرة لتسجيل طلبك فوراً.',
    };
  }

  try {
    lastSubmissionTimestamp = now;
    lastSubmissionPhone = cleanPhone;

    // Hardened RPC call with international phone, country tracking, and idempotency key
    const { data: rpcInquiryId, error: rpcError } = await supabase.rpc('submit_inquiry', {
      p_name: cleanName,
      p_raw_phone: cleanPhone,
      p_phone_e164: payload.phoneE164 || cleanPhone,
      p_phone_country: payload.phoneCountry || 'EG',
      p_visitor_country: payload.visitorCountry || 'Unknown',
      p_company: cleanCompany,
      p_sector: payload.sector,
      p_package_id: cleanPackageId,
      p_package_name: cleanPackageName,
      p_budget: cleanBudget,
      p_notes: cleanNotes,
      p_email: payload.email?.trim() || null,
      p_idempotency_key: payload.idempotencyKey || null,
    });

    if (rpcError) {
      console.error('Supabase submit_inquiry RPC error:', rpcError);
      let userFriendlyError = 'تعذر تسجيل الطلب في قاعدة البيانات المركزية.';
      if (rpcError.message.includes('Rate limit reached')) {
        userFriendlyError = 'تم بلوغ الحد الأقصى للطلبات خلال فترة قصيرة (٣ طلبات / ١٠ دقائق). يرجى الانتظار قبل المحاولة مجدداً.';
      } else if (rpcError.message.includes('Invalid phone number')) {
        userFriendlyError = 'صيغة رقم الهاتف غير صالحة.';
      } else if (rpcError.message.includes('Customer name')) {
        userFriendlyError = 'الاسم المدخل غير صالح.';
      }

      return {
        success: false,
        id: '',
        isDatabaseBacked: false,
        error: userFriendlyError,
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
      success: false,
      id: '',
      isDatabaseBacked: false,
      error: 'لم يتم استلام تأكيد حفظ السجل من قاعدة البيانات.',
    };
  } catch (err: any) {
    console.error('Network failure connecting to Supabase:', err);
    return {
      success: false,
      id: '',
      isDatabaseBacked: false,
      error: 'فشل الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت أو استخدام خيار الواتساب المباشر.',
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
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
