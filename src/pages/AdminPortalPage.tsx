import React, { useState, useEffect } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { 
  supabase, 
  isSupabaseConfigured, 
  fetchAdminInquiries, 
  updateInquiryStatusInDb, 
  deleteInquiryFromDb, 
  submitInquiry,
  DbInquiry 
} from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  LogOut, 
  ArrowLeft, 
  ArrowRight, 
  Inbox, 
  Search, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Trash2, 
  Download, 
  Building, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Database,
  ExternalLink,
  Tag,
  Briefcase,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const { 
    data, 
    language, 
    setCurrentPage, 
    addCaseStudy, 
    updateCaseStudy, 
    deleteCaseStudy, 
    addPackage, 
    updatePackage, 
    deletePackage,
    updateBanner,
    resetToDefaults,
    exportDataJson,
    importDataJson,
    clearAllInquiries
  } = useAgencyData();

  const isAr = language === 'ar';

  // Auth States
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Local testing bypass state (only available if Supabase credentials are not yet configured)
  const [localBypassAuth, setLocalBypassAuth] = useState(false);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'inquiries' | 'packages' | 'projects' | 'banner' | 'backup'>('inquiries');

  // Supabase Inquiries Data State
  const [cloudInquiries, setCloudInquiries] = useState<DbInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed' | 'cancelled'>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [isMigratingLocal, setIsMigratingLocal] = useState(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // 1. Check existing Supabase session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setAuthChecking(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) {
          if (!error && session) {
            setSessionUser(session.user);
          }
          setAuthChecking(false);
        }
      } catch (err) {
        if (mounted) setAuthChecking(false);
      }
    }

    checkAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setSessionUser(session?.user || null);
        }
      });

      return () => {
        mounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const [loadError, setLoadError] = useState<string | null>(null);

  // 2. Fetch inquiries when user is authenticated
  const loadInquiries = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoadingInquiries(true);
    setLoadError(null);
    try {
      const res = await fetchAdminInquiries();
      if (!res.error) {
        setCloudInquiries(res.data);
      } else {
        console.warn('Could not fetch cloud inquiries:', res.error);
        setLoadError(res.error);
      }
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      setLoadError(err?.message || 'Error fetching inquiries');
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (sessionUser && isSupabaseConfigured) {
      loadInquiries();
    }
  }, [sessionUser]);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setAuthError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter your email and password.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthError(
        isAr 
          ? 'مشروع Supabase غير مهيأ بعد. يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env وتطبيق ملف الـ Migration.'
          : 'Supabase credentials are not configured in environment variables.'
      );
      return;
    }

    setLoginLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setAuthError(isAr ? 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.' : 'Invalid email or password.');
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError(isAr ? 'البريد الإلكتروني لم يتم تأكيده بعد.' : 'Email is not confirmed yet.');
        } else {
          setAuthError(error.message);
        }
      } else if (authData?.user) {
        setSessionUser(authData.user);
        setPassword('');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setSessionUser(null);
    setLocalBypassAuth(false);
    showNotice(isAr ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.');
  };

  // Status Updater
  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'closed' | 'cancelled') => {
    if (isSupabaseConfigured && sessionUser) {
      const res = await updateInquiryStatusInDb(id, newStatus);
      if (res.success) {
        setCloudInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
        showNotice(isAr ? 'تم تحديث حالة الطلب في قاعدة البيانات السحابية!' : 'Status updated in Supabase!');
      } else {
        alert(res.error || 'Failed to update status in cloud');
      }
    } else {
      // Local fallback updater
      setCloudInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      showNotice(isAr ? 'تم تحديث الحالة محلياً.' : 'Status updated locally.');
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الطلب نهائياً؟' : 'Are you sure you want to permanently delete this inquiry?')) {
      return;
    }

    if (isSupabaseConfigured && sessionUser) {
      const res = await deleteInquiryFromDb(id);
      if (res.success) {
        setCloudInquiries(prev => prev.filter(inq => inq.id !== id));
        showNotice(isAr ? 'تم حذف الطلب من قاعدة البيانات بنجاح.' : 'Inquiry deleted from database.');
      } else {
        alert(res.error || 'Failed to delete inquiry');
      }
    } else {
      setCloudInquiries(prev => prev.filter(inq => inq.id !== id));
      showNotice(isAr ? 'تم حذف الطلب محلياً.' : 'Deleted locally.');
    }
  };

  // Safe Migration Tool: Migrate existing localStorage records into Supabase using Security Definer RPC
  const handleMigrateLocalInquiries = async () => {
    const localList = data.inquiries || [];
    if (localList.length === 0) {
      alert(isAr ? 'لا توجد طلبات مخزنة محلياً لترحيلها.' : 'No local inquiries found to migrate.');
      return;
    }

    if (!isSupabaseConfigured || !supabase || !sessionUser) {
      alert(isAr ? 'يجب تسجيل الدخول كمسؤول وتهيئة Supabase أولاً.' : 'Must be authenticated with Supabase first.');
      return;
    }

    setIsMigratingLocal(true);
    let successCount = 0;

    try {
      for (const item of localList) {
        const cleanPhone = item.phone.trim();
        const digits = cleanPhone.replace(/\D/g, '');
        const e164 = cleanPhone.startsWith('+') ? cleanPhone : (digits.startsWith('0') ? `+20${digits.slice(1)}` : `+20${digits}`);

        const res = await submitInquiry({
          name: item.name,
          phone: cleanPhone,
          phoneE164: e164,
          phoneCountry: 'EG',
          visitorCountry: 'Local Migration',
          company: item.company || undefined,
          sector: item.sector,
          packageName: item.packageName || undefined,
          budget: item.budget || undefined,
          notes: item.notes || undefined,
        });
        if (res.success) successCount++;
      }

      // Clear local storage inquiries so this banner never appears again!
      clearAllInquiries();

      showNotice(
        isAr 
          ? `تم نقل ${successCount} طلب إلى قاعدة البيانات السحابية المركزية بنجاح!` 
          : `Migrated ${successCount} inquiries to cloud database successfully!`
      );
      loadInquiries();
    } catch (err: any) {
      alert(err?.message || 'Migration error');
    } finally {
      setIsMigratingLocal(false);
    }
  };

  // Dismiss local temporary inquiries from localStorage without uploading
  const handleDismissLocalInquiries = () => {
    if (confirm(isAr ? 'هل تريد إخفاء وحذف هذه الطلبات التجريبية المحلية من المتصفح؟' : 'Dismiss and remove local temporary inquiries?')) {
      clearAllInquiries();
      showNotice(isAr ? 'تم إخفاء الطلبات المحلية.' : 'Local inquiries dismissed.');
    }
  };

  // Determine current active inquiries to display
  // If Supabase is connected and authenticated, use cloudInquiries. Otherwise fall back to local inquiries if in bypass mode.
  const activeInquiriesList: Array<{
    id: string;
    name: string;
    phone: string;
    phoneE164?: string | null;
    phoneCountry?: string | null;
    visitorCountry?: string | null;
    company?: string | null;
    sector: 'all' | 'b2b' | 'b2c' | 'medical';
    packageName?: string | null;
    budget?: string | null;
    notes?: string | null;
    status: 'new' | 'contacted' | 'closed' | 'cancelled';
    createdAt: string;
  }> = (isSupabaseConfigured && sessionUser)
    ? cloudInquiries.map(i => ({
        id: i.id,
        name: i.raw_client_name,
        phone: i.raw_client_phone,
        phoneE164: i.client_phone_e164 || i.customer?.phone_e164,
        phoneCountry: i.phone_country || i.customer?.phone_country,
        visitorCountry: i.visitor_country,
        company: i.raw_client_company || i.customer?.company,
        sector: i.sector,
        packageName: i.raw_package_name,
        budget: i.budget,
        notes: i.notes,
        status: i.status,
        createdAt: i.created_at,
      }))
    : (data.inquiries || []).map(i => ({
        id: i.id,
        name: i.name,
        phone: i.phone,
        phoneE164: i.phone,
        phoneCountry: 'EG',
        visitorCountry: 'Local Dev',
        company: i.company,
        sector: i.sector,
        packageName: i.packageName,
        budget: i.budget,
        notes: i.notes,
        status: i.status,
        createdAt: i.createdAt,
      }));

  const filteredInquiries = activeInquiriesList.filter(item => {
    if (inquiryStatusFilter !== 'all' && item.status !== inquiryStatusFilter) return false;
    if (inquirySearch.trim()) {
      const q = inquirySearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchCompany = (item.company || '').toLowerCase().includes(q);
      const matchPkg = (item.packageName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCompany && !matchPkg) return false;
    }
    return true;
  });

  const newInquiriesCount = activeInquiriesList.filter(i => i.status === 'new').length;

  // Export to Excel / CSV with UTF-8 BOM
  const exportInquiriesCsv = () => {
    if (activeInquiriesList.length === 0) {
      alert(isAr ? 'لا توجد طلبات لتصديرها.' : 'No inquiries to export.');
      return;
    }

    const headers = ['التاريخ', 'اسم العميل', 'رقم الهاتف', 'الشركة', 'القطاع', 'الباقة المختارة', 'الميزانية', 'الحالة', 'ملاحظات'];
    const rows = activeInquiriesList.map(inq => [
      `"${new Date(inq.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}"`,
      `"${(inq.name || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.company || '').replace(/"/g, '""')}"`,
      inq.sector.toUpperCase(),
      `"${(inq.packageName || '').replace(/"/g, '""')}"`,
      `"${(inq.budget || '').replace(/"/g, '""')}"`,
      inq.status,
      `"${(inq.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `digital-effect-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showNotice(isAr ? 'تم تصدير ملف الطلبات (Excel/CSV) بنجاح!' : 'Inquiries exported as CSV successfully!');
  };

  const isAuthenticated = Boolean(sessionUser || localBypassAuth);

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
          <p className="text-xs text-slate-400">{isAr ? 'التحقق من جلسة المسؤول المشفرة...' : 'Verifying administrator session...'}</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW 1: UNAUTHENTICATED — PROFESSIONAL LOGIN SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
        {/* Top return link */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'العودة للموقع الرئيسي' : 'Return to Public Site'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            SSL 256-bit Encrypted
          </span>
        </div>

        {/* Login Card */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-black text-white">
                  {isAr ? 'بوابة الإدارة المركزية (CRM)' : 'Digital Effect Admin Portal'}
                </h1>
                <p className="text-xs text-slate-400">
                  {isAr ? 'منطقة وصول مقيدة ومحمية للمسؤولين المعتمدين فقط' : 'Restricted area for authorized administrators only'}
                </p>
              </div>
            </div>

            {/* Supabase Status Alert */}
            {!isSupabaseConfigured && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isAr ? 'تنبيه: بانتظار ربط مفاتيح Supabase' : 'Notice: Supabase Credentials Pending'}</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  {isAr 
                    ? 'قاعدة البيانات السحابية بانتظار إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في إعدادات البيئة (Settings > Environment Variables) وتطبيق ملف الـ Migration.'
                    : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment and run the schema migration.'}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setLocalBypassAuth(true)}
                    className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold rounded-xl text-[11px] transition-colors border border-amber-500/30 cursor-pointer"
                  >
                    {isAr ? 'معاينة لوحة الإدارة في بيئة التطوير (Local Dev Preview)' : 'Enter Development Preview Mode'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? 'البريد الإلكتروني للمسؤول' : 'Admin Email'}</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="admin@digitaleffect.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? 'كلمة المرور المشفرة' : 'Encrypted Password'}</span>
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'التحقق وتأكيد الصلاحية...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'تسجيل الدخول الآمن' : 'Secure Admin Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="pt-2 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'التسجيل الذاتي معطل. الحسابات مصرح بها فقط عبر مدير النظام وRow Level Security.' 
                  : 'Public registration is disabled. Access enforced via Row Level Security.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-600">
          Digital Effect Enterprise CRM • Version 2.0 (PostgreSQL Auth Guard)
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW 2: AUTHENTICATED — DEDICATED CRM DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Admin Sticky Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white">Digital Effect CRM</h1>
                {isSupabaseConfigured && sessionUser ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Supabase Live</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Local Dev Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {sessionUser?.email ? `المسؤول: ${sessionUser.email}` : 'مدير النظام (جلسة نشطة)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('home')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <span>{isAr ? 'زيارة الموقع' : 'Public Site'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition-colors border border-rose-500/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {notice && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-slate-800">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inquiries'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>{isAr ? `الطلبات والاستشارات (${activeInquiriesList.length})` : `Inquiries & Orders (${activeInquiriesList.length})`}</span>
              {newInquiriesCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-slate-900 rounded-full font-bold animate-pulse">
                  {newInquiriesCount} {isAr ? 'جديد' : 'new'}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'packages'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isAr ? `الباقات والعروض (${data.packages.length})` : `Packages & Offers (${data.packages.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'projects'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isAr ? `دراسات الحالة والمشاريع (${data.caseStudies.length})` : `Case Studies (${data.caseStudies.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('banner')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'banner'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'شريط العروض والخصومات' : 'Global Promo Banner'}</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'backup'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'النسخ الاحتياطي والضبط' : 'Backup & Reset'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* ================================================================== */}
        {/* TAB 1: INQUIRIES & ORDERS HUB                                      */}
        {/* ================================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            {/* Safe Migration Banner if local inquiries exist */}
            {isSupabaseConfigured && sessionUser && (data.inquiries || []).length > 0 && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'اكتشاف طلبات سابقة في المتصفح المحلي' : 'Local browser inquiries detected'}</span>
                  </h4>
                  <p className="text-[11px] text-sky-700">
                    {isAr 
                      ? `يوجد ${(data.inquiries || []).length} طلب مسجل على هذا الجهاز. يمكنك نقلهم إلى قاعدة بيانات Supabase السحابية بضغطة واحدة لمشاركتهم عبر كافة أجهزتك.`
                      : `Found ${(data.inquiries || []).length} local inquiries. Migrate them to Supabase to access them from any device.`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDismissLocalInquiries}
                    disabled={isMigratingLocal}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isAr ? 'حذف وتجاهل' : 'Dismiss'}</span>
                  </button>

                  <button
                    onClick={handleMigrateLocalInquiries}
                    disabled={isMigratingLocal}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                  >
                    {isMigratingLocal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'ترحيل الطلبات السابقة إلى Supabase' : 'Migrate to Cloud'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'إجمالي الطلبات' : 'Total Leads'}</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{activeInquiriesList.length}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-amber-600 block">{isAr ? 'طلبات جديدة' : 'New Leads'}</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">{newInquiriesCount}</span>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-sky-600 block">{isAr ? 'قيد التواصل' : 'Contacted'}</span>
                <span className="text-2xl font-black text-sky-700 mt-1 block">
                  {activeInquiriesList.filter(i => i.status === 'contacted').length}
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-600 block">{isAr ? 'تم التعاقد' : 'Closed Deals'}</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {activeInquiriesList.filter(i => i.status === 'closed').length}
                </span>
              </div>
            </div>

            {/* Action Bar: Search, Status Filter & CSV Export */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder={isAr ? 'بحث بالاسم، رقم الهاتف، الشركة...' : 'Search by name, phone, company...'}
                    className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="new">{isAr ? 'جديد (لم يتم الرد)' : 'New'}</option>
                  <option value="contacted">{isAr ? 'قيد التواصل' : 'Contacted'}</option>
                  <option value="closed">{isAr ? 'تم التعاقد' : 'Closed Deal'}</option>
                  <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSupabaseConfigured && sessionUser && (
                  <button
                    onClick={loadInquiries}
                    disabled={loadingInquiries}
                    className="p-2 text-slate-600 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                    title={isAr ? 'تحديث البيانات من السحابة' : 'Refresh from Supabase'}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} />
                  </button>
                )}

                <button
                  onClick={exportInquiriesCsv}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title={isAr ? 'تصدير الطلبات إلى ملف Excel / CSV' : 'Export leads to Excel/CSV'}
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isAr ? 'تصدير Excel (CSV)' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Load Error Alert */}
            {loadError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold block">{isAr ? 'تعذر جلب الطلبات من قاعدة البيانات:' : 'Failed to fetch inquiries:'}</span>
                    <span className="font-mono text-[11px] text-rose-600">{loadError}</span>
                  </div>
                </div>
                <button
                  onClick={loadInquiries}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-bold cursor-pointer transition-colors shrink-0"
                >
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            )}

            {/* Inquiries Cards List */}
            {loadingInquiries ? (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" />
                <p className="text-xs text-slate-500">{isAr ? 'جاري جلب الطلبات من قاعدة البيانات المشفرة...' : 'Fetching orders from database...'}</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                <h5 className="text-sm font-bold text-slate-700">
                  {activeInquiriesList.length === 0 
                    ? (isAr ? 'لا توجد طلبات واردة حالياً' : 'No inquiries yet')
                    : (isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching inquiries found')}
                </h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeInquiriesList.length === 0
                    ? (isAr ? 'عند قيام أي عميل باختيار باقة وإرسال نموذج الاستشارة، ستظهر بياناته هنا فوراً مع روابط التواصل الفوري.' : 'When any visitor selects a package and submits the consultation form, their details will appear here.')
                    : (isAr ? 'جرّب تغيير كلمات البحث أو تصفية الحالات.' : 'Try adjusting your search query or status filter.')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => {
                  // Direct international phone string for WhatsApp (digits only with country code)
                  const cleanDigits = (inq.phoneE164 || inq.phone).replace(/\D/g, '');
                  const waPhone = cleanDigits.startsWith('0') ? `20${cleanDigits.slice(1)}` : cleanDigits;
                  const waText = encodeURIComponent(
                    isAr 
                      ? `مرحباً ${inq.name}، معك فريق ديجيتال إفكت بخصوص استفسارك عن باقة ${inq.packageName || 'التسويق'}.`
                      : `Hello ${inq.name}, Digital Effect team reaching out regarding your inquiry.`
                  );

                  return (
                    <div 
                      key={inq.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        inq.status === 'new' 
                          ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black flex items-center justify-center text-sm shrink-0">
                            {inq.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">{inq.name}</h4>
                              {inq.company && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Building className="w-3 h-3 text-slate-400" />
                                  <span>{inq.company}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(inq.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* GeoIP & Phone Country Badges */}
                          {inq.visitorCountry && (
                            <span 
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                              title={isAr ? `دولة الزائر المكتشفة من Cloudflare: ${inq.visitorCountry}` : `Cloudflare Detected Country: ${inq.visitorCountry}`}
                            >
                              🌍 {inq.visitorCountry}
                            </span>
                          )}
                          {inq.phoneCountry && inq.phoneCountry !== inq.visitorCountry && (
                            <span 
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-50 text-sky-700 border border-sky-100"
                              title={isAr ? `دولة رقم الهاتف المختارة: ${inq.phoneCountry}` : `Phone Country: ${inq.phoneCountry}`}
                            >
                              📱 {inq.phoneCountry}
                            </span>
                          )}

                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-slate-100 text-slate-700">
                            {inq.sector.toUpperCase()}
                          </span>

                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as any)}
                            className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${
                              inq.status === 'new'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : inq.status === 'contacted'
                                ? 'bg-sky-100 text-sky-800 border-sky-300'
                                : inq.status === 'closed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="new">{isAr ? 'جديد (لم يتم الرد)' : 'New'}</option>
                            <option value="contacted">{isAr ? 'قيد التواصل' : 'Contacted'}</option>
                            <option value="closed">{isAr ? 'تم التعاقد' : 'Closed Deal'}</option>
                            <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                          </select>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isAr ? 'حذف الطلب' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Order Details: Package, Budget, Notes */}
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">{isAr ? 'الباقة المطلوبة:' : 'Target Plan:'}</span>
                            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                              {inq.packageName || (isAr ? 'استشارة استراتيجية عامة' : 'General Strategy Call')}
                            </span>
                          </div>
                          {inq.budget && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">{isAr ? 'الميزانية المقترحة:' : 'Budget:'}</span>
                              <span className="font-semibold text-slate-800">{inq.budget}</span>
                            </div>
                          )}
                        </div>

                        {inq.notes && (
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 text-xs">
                            <span className="font-bold text-slate-700 block mb-0.5">{isAr ? 'ملاحظات العميل:' : 'Client Notes:'}</span>
                            <p className="line-clamp-3">{inq.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Quick Direct Actions: WhatsApp & Call */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${waPhone}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isAr ? 'محادثة واتساب مباشرة' : 'WhatsApp Client'}</span>
                          </a>

                          <a
                            href={`tel:${inq.phoneE164 || inq.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors dir-ltr"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono">{inq.phoneE164 || inq.phone}</span>
                          </a>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          ID: <span className="font-mono">{inq.id.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: PACKAGES & OFFERS (Protected Admin View)                    */}
        {/* ================================================================== */}
        {activeTab === 'packages' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{isAr ? 'قائمة باقات الوكالة والأسعار الرسمية' : 'Service Packages Catalog'}</h3>
                <p className="text-xs text-slate-500">{isAr ? 'الباقات المعتمدة المعروضة على الموقع لقطاعات B2B و B2C و Medical' : 'Active packages displayed on the public site'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.packages.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-sky-100 text-sky-800">{pkg.sector}</span>
                    <span className="font-black text-slate-900 text-sm">{pkg.price.toLocaleString()} {pkg.currency}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{isAr ? pkg.name : pkg.nameEn}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{isAr ? pkg.tagline : pkg.taglineEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: CASE STUDIES & PORTFOLIO                                    */}
        {/* ================================================================== */}
        {activeTab === 'projects' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{isAr ? 'مشاريع ودراسات الحالة المعتمدة' : 'Verified Case Studies'}</h3>
                <p className="text-xs text-slate-500">{isAr ? 'المشاريع المنشورة في معرض الأعمال والقطاعات التخصصية' : 'Published client stories and industry results'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {data.caseStudies.map((cs) => (
                <div key={cs.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-200 text-slate-700">{cs.sector}</span>
                    <h4 className="text-xs font-bold text-slate-900">{isAr ? cs.client : cs.clientEn}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{isAr ? cs.title : cs.titleEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: GLOBAL PROMO BANNER                                         */}
        {/* ================================================================== */}
        {activeTab === 'banner' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{isAr ? 'شريط العروض والخصومات' : 'Global Promo Banner'}</h3>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-200 text-sky-900 rounded">{data.banner.tag}</span>
              <p className="text-xs text-slate-700">{data.banner.text}</p>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: BACKUP & DATA CONTROL                                       */}
        {/* ================================================================== */}
        {activeTab === 'backup' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{isAr ? 'إدارة النسخ الاحتياطية وتصدير البيانات' : 'Backup & Data Export'}</h3>
              <p className="text-xs text-slate-500">{isAr ? 'تصدير كامل بيانات الموقع والإعدادات في ملف JSON آمن' : 'Export and import website state JSON'}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  const json = exportDataJson();
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `digital-effect-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  showNotice(isAr ? 'تم تصدير ملف النسخة الاحتياطية بنجاح!' : 'Backup exported successfully!');
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصدير ملف النسخة الاحتياطية JSON' : 'Export Backup JSON'}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Digital Effect Enterprise Administration Portal • Phase 1 PostgreSQL Integration
      </footer>
    </div>
  );
};
