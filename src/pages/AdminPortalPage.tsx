import React, { useState, useEffect, useMemo } from 'react';
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
import { ServicePackage, PromoCode, SectorType, Inquiry } from '../types';
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
  RotateCcw,
  TrendingUp,
  DollarSign,
  Eye,
  BarChart3,
  Edit3,
  Plus,
  X,
  Percent,
  Check,
  Copy,
  Clock,
  Layers,
  Film,
  FileText,
  CheckCheck,
  Sparkle,
  Globe,
  Code2,
  Image as ImageIcon,
  Sliders,
  Calculator,
  UserPlus,
  UserCheck,
  AlertTriangle,
  BellRing
} from 'lucide-react';
import { CrmAnalyticsHub } from '../components/CrmAnalyticsHub';
import { SeoGeneratorWidget } from '../components/SeoGeneratorWidget';
import { CaseStudyMediaManager } from '../components/CaseStudyMediaManager';
import { CustomPackageCalculator } from '../components/CustomPackageCalculator';
import { AddClientModal } from '../components/AddClientModal';
import { ClientAccountDrawer } from '../components/ClientAccountDrawer';
import { ClientWorkflowStepper, DEFAULT_WORKFLOW_STAGES } from '../components/ClientWorkflowStepper';
import { ClientPackageDeliverablesCard } from '../components/ClientPackageDeliverablesCard';
import { getClientOverdueStatus, getClientDeliverableTargets } from '../utils/workflowUtils';
import { generateClientInvoicePdf } from '../utils/invoicePdfGenerator';

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
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    updateBanner,
    resetToDefaults,
    exportDataJson,
    importDataJson,
    clearAllInquiries,
    updateInquiry,
    deleteInquiry
  } = useAgencyData();

  const isAr = language === 'ar';

  // Auth States
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Local testing bypass state (persisted across page reloads in sessionStorage)
  const [localBypassAuth, setLocalBypassAuth] = useState(() => {
    try {
      return sessionStorage.getItem('digital_effect_admin_session') === 'true';
    } catch {
      return false;
    }
  });

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'inquiries' | 'clients' | 'analytics' | 'packages' | 'projects' | 'banner' | 'backup'>('inquiries');
  const [showAnalyticsInInquiriesTab, setShowAnalyticsInInquiriesTab] = useState(true);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClientForAccount, setSelectedClientForAccount] = useState<Inquiry | null>(null);
  const [isClientAccountOpen, setIsClientAccountOpen] = useState(false);
  const [clientSectorFilter, setClientSectorFilter] = useState<'all' | 'b2b' | 'b2c' | 'medical'>('all');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'active' | 'renewal_due' | 'paused' | 'completed'>('all');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [workflowTaskFilter, setWorkflowTaskFilter] = useState<'all' | 'in_progress' | 'completed' | 'delayed' | 'overdue'>('all');
  const [workflowStageFilter, setWorkflowStageFilter] = useState<string>('all');
  const [downloadingInvoiceClientId, setDownloadingInvoiceClientId] = useState<string | null>(null);
  const [invoiceDownloadNotice, setInvoiceDownloadNotice] = useState<string | null>(null);

  // Generate & Download Client Invoice PDF via jsPDF
  const handleDownloadClientInvoice = async (client: Inquiry) => {
    setDownloadingInvoiceClientId(client.id);
    try {
      const res = await generateClientInvoicePdf({
        client,
        isAr,
      });
      if (res.success) {
        setInvoiceDownloadNotice(
          isAr
            ? `تم تحميل فاتورة ${client.company || client.name} بنجاح!`
            : `Invoice for ${client.company || client.name} downloaded successfully!`
        );
        setTimeout(() => setInvoiceDownloadNotice(null), 3500);
      }
    } catch (err) {
      console.error('Invoice download error:', err);
    } finally {
      setDownloadingInvoiceClientId(null);
    }
  };

  // Commercial & Packages Tab States
  const [commercialSubTab, setCommercialSubTab] = useState<'packages' | 'custom-calculator' | 'promos'>('packages');
  const [packageFilterSector, setPackageFilterSector] = useState<'all' | 'b2b' | 'b2c' | 'medical'>('all');
  const [isCreatingNewPackage, setIsCreatingNewPackage] = useState(false);

  // Projects & Media / SEO Generator States
  const [projectsSection, setProjectsSection] = useState<'media' | 'seo'>('media');
  const [selectedCaseStudyForSeo, setSelectedCaseStudyForSeo] = useState<string | null>(null);
  const [seoGeneratorMode, setSeoGeneratorMode] = useState<'case-study' | 'page'>('case-study');

  // Package Edit Modal State
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [newFeatureTextAr, setNewFeatureTextAr] = useState('');
  const [newFeatureTextEn, setNewFeatureTextEn] = useState('');

  // Promo Code Modal & Form State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoFormCode, setPromoFormCode] = useState('');
  const [promoFormTitle, setPromoFormTitle] = useState('');
  const [promoFormTitleEn, setPromoFormTitleEn] = useState('');
  const [promoFormType, setPromoFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [promoFormValue, setPromoFormValue] = useState<number>(20);
  const [promoFormMinSpend, setPromoFormMinSpend] = useState<string>('');
  const [promoFormExpiry, setPromoFormExpiry] = useState<string>('');
  const [promoFormSector, setPromoFormSector] = useState<SectorType>('all');
  const [promoFormMaxUsage, setPromoFormMaxUsage] = useState<string>('');
  const [promoFormActive, setPromoFormActive] = useState<boolean>(true);
  const [copiedPromoId, setCopiedPromoId] = useState<string | null>(null);

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

  const handleOpenEditPackage = (pkg: ServicePackage) => {
    setIsCreatingNewPackage(false);
    setEditingPackage(JSON.parse(JSON.stringify(pkg)));
    setNewFeatureTextAr('');
    setNewFeatureTextEn('');
  };

  const handleOpenCreatePackage = (initialSector: SectorType = 'b2c') => {
    setIsCreatingNewPackage(true);
    const chosenSector: 'b2b' | 'b2c' | 'medical' = initialSector === 'all' ? 'b2c' : initialSector;
    const defaultPrice = chosenSector === 'b2b' ? 4000 : chosenSector === 'medical' ? 19500 : 15000;
    const defaultPosts = chosenSector === 'b2b' ? 4 : chosenSector === 'medical' ? 8 : 12;
    const defaultReels = chosenSector === 'b2b' ? 0 : chosenSector === 'medical' ? 8 : 2;
    const defaultStories = chosenSector === 'b2c' ? 2 : 0;

    setEditingPackage({
      id: `pkg-${Date.now()}`,
      sector: chosenSector,
      name: '',
      nameEn: '',
      badge: '',
      badgeEn: '',
      tagline: '',
      taglineEn: '',
      price: defaultPrice,
      originalPrice: undefined,
      quarterlyPrice: chosenSector === 'medical' ? 49750 : undefined,
      currency: 'ج.م',
      currencyEn: 'EGP',
      period: 'شهرياً',
      periodEn: 'Monthly',
      idealFor: '',
      idealForEn: '',
      features: [
        'إدارة وتنسيق كامل للحسابات الرسمية',
        'تصاميم وبوستات احترافية فائقة الجودة',
        'ريلز وفيديوهات تسويقية بالذكاء الاصطناعي',
        'تقرير أداء وإحصائيات شهرية مفصلة',
      ],
      featuresEn: [
        'Full management of official social accounts',
        'High-velocity premium visual graphics',
        'AI-enhanced reels & video content',
        'Monthly comprehensive performance report',
      ],
      postsCount: defaultPosts,
      reelsCount: defaultReels,
      storiesCount: defaultStories,
      frequency: chosenSector === 'b2b' ? 'منشور أسبوعياً' : '٣ منشورات / أسبوع',
      hasMonthlyPlan: true,
      isPopular: false,
      hasOffer: false,
    });
    setNewFeatureTextAr('');
    setNewFeatureTextEn('');
  };

  const handleDuplicatePackage = (pkg: ServicePackage) => {
    const duplicated: ServicePackage = {
      ...JSON.parse(JSON.stringify(pkg)),
      id: `pkg-${Date.now()}`,
      name: `${pkg.name} (نسخة جديدة)`,
      nameEn: `${pkg.nameEn || pkg.name} (Copy)`,
      isPopular: false,
    };
    addPackage(duplicated);
    showNotice(isAr ? 'تم استنساخ الباقة بنجاح، يمكنك الآن تعديل بياناتها!' : 'Package duplicated successfully!');
  };

  const handleDeletePackage = (pkg: ServicePackage) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من رغبتك في حذف باقة "${pkg.name}" نهائياً من الموقع؟`
      : `Are you sure you want to delete package "${pkg.nameEn || pkg.name}"?`;
    if (window.confirm(confirmMsg)) {
      deletePackage(pkg.id);
      if (editingPackage?.id === pkg.id) {
        setEditingPackage(null);
        setIsCreatingNewPackage(false);
      }
      showNotice(isAr ? 'تم حذف الباقة بنجاح من الموقع.' : 'Package deleted successfully.');
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    if (!editingPackage.name.trim()) {
      showNotice(isAr ? 'يرجى إدخال اسم الباقة باللغة العربية.' : 'Please enter package name.');
      return;
    }

    if (isCreatingNewPackage) {
      addPackage(editingPackage);
      showNotice(isAr ? 'تمت إضافة الباقة الجديدة بنجاح للموقع!' : 'New package added successfully!');
    } else {
      updatePackage(editingPackage);
      showNotice(isAr ? 'تم حفظ وتحديث بيانات الباقة والأسعار والمواصفات بنجاح!' : 'Package updated successfully!');
    }
    setEditingPackage(null);
    setIsCreatingNewPackage(false);
  };

  const handleAddFeatureToEditingPackage = () => {
    if (!editingPackage || !newFeatureTextAr.trim()) return;
    setEditingPackage({
      ...editingPackage,
      features: [...editingPackage.features, newFeatureTextAr.trim()],
      featuresEn: [...(editingPackage.featuresEn || []), newFeatureTextEn.trim() || newFeatureTextAr.trim()],
    });
    setNewFeatureTextAr('');
    setNewFeatureTextEn('');
  };

  const handleRemoveFeatureFromEditingPackage = (index: number) => {
    if (!editingPackage) return;
    setEditingPackage({
      ...editingPackage,
      features: editingPackage.features.filter((_, i) => i !== index),
      featuresEn: (editingPackage.featuresEn || []).filter((_, i) => i !== index),
    });
  };

  const handleOpenCreatePromo = () => {
    setEditingPromoId(null);
    setPromoFormCode('');
    setPromoFormTitle('');
    setPromoFormTitleEn('');
    setPromoFormType('percentage');
    setPromoFormValue(15);
    setPromoFormMinSpend('');
    setPromoFormExpiry('');
    setPromoFormSector('all');
    setPromoFormMaxUsage('');
    setPromoFormActive(true);
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo: PromoCode) => {
    setEditingPromoId(promo.id);
    setPromoFormCode(promo.code);
    setPromoFormTitle(promo.title);
    setPromoFormTitleEn(promo.titleEn || '');
    setPromoFormType(promo.discountType);
    setPromoFormValue(promo.discountValue);
    setPromoFormMinSpend(promo.minSpend ? String(promo.minSpend) : '');
    setPromoFormExpiry(promo.expiresAt || '');
    setPromoFormSector(promo.applicableSector || 'all');
    setPromoFormMaxUsage(promo.maxUsage ? String(promo.maxUsage) : '');
    setPromoFormActive(promo.isActive);
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoFormCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (editingPromoId) {
      updatePromoCode({
        id: editingPromoId,
        code: cleanCode,
        title: promoFormTitle.trim() || cleanCode,
        titleEn: promoFormTitleEn.trim() || promoFormTitle.trim() || cleanCode,
        discountType: promoFormType,
        discountValue: Number(promoFormValue) || 10,
        minSpend: promoFormMinSpend ? Number(promoFormMinSpend) : undefined,
        expiresAt: promoFormExpiry || undefined,
        applicableSector: promoFormSector,
        maxUsage: promoFormMaxUsage ? Number(promoFormMaxUsage) : undefined,
        isActive: promoFormActive,
        usageCount: (data.promoCodes || []).find((p) => p.id === editingPromoId)?.usageCount || 0,
        createdAt: (data.promoCodes || []).find((p) => p.id === editingPromoId)?.createdAt || new Date().toISOString(),
      });
      showNotice(isAr ? 'تم تحديث كود الخصم بنجاح!' : 'Promo code updated!');
    } else {
      addPromoCode({
        code: cleanCode,
        title: promoFormTitle.trim() || cleanCode,
        titleEn: promoFormTitleEn.trim() || promoFormTitle.trim() || cleanCode,
        discountType: promoFormType,
        discountValue: Number(promoFormValue) || 10,
        minSpend: promoFormMinSpend ? Number(promoFormMinSpend) : undefined,
        expiresAt: promoFormExpiry || undefined,
        applicableSector: promoFormSector,
        maxUsage: promoFormMaxUsage ? Number(promoFormMaxUsage) : undefined,
        isActive: promoFormActive,
      });
      showNotice(isAr ? 'تم إنشاء كود الخصم الجديد بنجاح!' : 'New promo code created!');
    }

    setIsPromoModalOpen(false);
  };

  const handleCopyPromoCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromoId(id);
    setTimeout(() => setCopiedPromoId(null), 2000);
  };

  // 1. Check existing Supabase session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const isLocalSession = sessionStorage.getItem('digital_effect_admin_session') === 'true';
        if (isLocalSession && mounted) {
          setLocalBypassAuth(true);
          setSessionUser({ email: 'digitaleffect20@gmail.com', user_metadata: { role: 'admin' } });
        }
      } catch {}

      if (!isSupabaseConfigured || !supabase) {
        if (mounted) setAuthChecking(false);
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

    const cleanEmail = email.trim() || 'digitaleffect20@gmail.com';

    // In local development / preview mode without cloud Supabase credentials,
    // grant immediate full administrative access so you can edit & preview without obstacle.
    if (!isSupabaseConfigured || !supabase) {
      try {
        sessionStorage.setItem('digital_effect_admin_session', 'true');
      } catch {}
      setLocalBypassAuth(true);
      setSessionUser({ email: cleanEmail, user_metadata: { role: 'admin' } });
      setPassword('');
      showNotice(isAr ? 'تم تسجيل الدخول في وضع المعاينة والتطوير بنجاح!' : 'Logged in to preview mode successfully!');
      return;
    }

    if (!cleanEmail || !password) {
      setAuthError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter your email and password.');
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
    try {
      sessionStorage.removeItem('digital_effect_admin_session');
    } catch {}
    setSessionUser(null);
    setLocalBypassAuth(false);
    showNotice(isAr ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.');
  };

  // Status Updater
  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'closed' | 'cancelled') => {
    // Always update local inquiry store so changes persist in real-time
    updateInquiry(id, { status: newStatus });

    if (isSupabaseConfigured && sessionUser) {
      const res = await updateInquiryStatusInDb(id, newStatus);
      if (res.success) {
        setCloudInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
        showNotice(
          newStatus === 'closed'
            ? (isAr ? 'تم التعاقد! تم نقل العميل تلقائياً إلى قسم العملاء لمتابعة حسابه.' : 'Contract closed! Client transferred to Clients section.')
            : (isAr ? 'تم تحديث حالة الطلب بنجاح!' : 'Status updated!')
        );
      } else {
        alert(res.error || 'Failed to update status in cloud');
      }
    } else {
      // Local fallback updater
      setCloudInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      showNotice(
        newStatus === 'closed'
          ? (isAr ? 'تم التعاقد! تم نقل العميل تلقائياً إلى قسم العملاء لمتابعة حسابه.' : 'Contract closed! Client transferred to Clients section.')
          : (isAr ? 'تم تحديث الحالة بنجاح.' : 'Status updated successfully.')
      );
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا السجل نهائياً؟' : 'Are you sure you want to permanently delete this record?')) {
      return;
    }

    deleteInquiry(id);

    if (isSupabaseConfigured && sessionUser) {
      const res = await deleteInquiryFromDb(id);
      if (res.success) {
        setCloudInquiries(prev => prev.filter(inq => inq.id !== id));
        showNotice(isAr ? 'تم حذف السجل بنجاح.' : 'Deleted successfully.');
      } else {
        alert(res.error || 'Failed to delete inquiry');
      }
    } else {
      setCloudInquiries(prev => prev.filter(inq => inq.id !== id));
      showNotice(isAr ? 'تم حذف السجل محلياً.' : 'Deleted locally.');
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

  // Contracted Clients List (Clients with status === 'closed')
  const contractedClients: Inquiry[] = useMemo(() => {
    return (data.inquiries || []).filter((inq) => inq.status === 'closed');
  }, [data.inquiries]);

  // Workflow Task Status Counts across all contracted clients
  const workflowCounts = useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    let delayed = 0;
    let overdue = 0;

    contractedClients.forEach((client) => {
      const stages = client.workflowStages || [];
      const isAllCompleted = stages.length > 0 && stages.every((s) => s.status === 'completed');
      const hasInProgress = stages.some((s) => s.status === 'in_progress');
      const overdueStatus = getClientOverdueStatus(client, isAr);

      if (overdueStatus.isOverdue) {
        overdue++;
      }

      if (isAllCompleted) {
        completed++;
      } else if (hasInProgress) {
        inProgress++;
      } else {
        delayed++;
      }
    });

    return {
      all: contractedClients.length,
      inProgress,
      completed,
      delayed,
      overdue,
    };
  }, [contractedClients, isAr]);

  // Filtered Contracted Clients with Task Status, Overdue, and Stage filtering
  const filteredContractedClients = useMemo(() => {
    return contractedClients.filter((client) => {
      if (clientSectorFilter !== 'all' && client.sector !== clientSectorFilter) return false;
      if (clientStatusFilter !== 'all' && (client.contractStatus || 'active') !== clientStatusFilter) return false;

      // Filter by workflow task state: completed / in_progress / delayed / overdue
      if (workflowTaskFilter !== 'all') {
        const stages = client.workflowStages || [];
        const isAllCompleted = stages.length > 0 && stages.every((s) => s.status === 'completed');
        const hasInProgress = stages.some((s) => s.status === 'in_progress');
        const overdueStatus = getClientOverdueStatus(client, isAr);

        if (workflowTaskFilter === 'overdue' && !overdueStatus.isOverdue) return false;
        if (workflowTaskFilter === 'completed' && !isAllCompleted) return false;
        if (workflowTaskFilter === 'in_progress' && (!hasInProgress || isAllCompleted)) return false;
        if (workflowTaskFilter === 'delayed' && (isAllCompleted || hasInProgress)) return false;
      }

      // Filter by specific workflow stage (e.g. content, visual_design, etc.)
      if (workflowStageFilter !== 'all') {
        const stages = client.workflowStages || [];
        const targetStage = stages.find((s) => s.id === workflowStageFilter);
        if (!targetStage || targetStage.status === 'completed') return false;
      }

      if (clientSearchQuery.trim()) {
        const q = clientSearchQuery.toLowerCase();
        const matchName = client.name.toLowerCase().includes(q);
        const matchCompany = (client.company || '').toLowerCase().includes(q);
        const matchPackage = (client.packageName || '').toLowerCase().includes(q);
        const matchPhone = client.phone.toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchPackage && !matchPhone) return false;
      }
      return true;
    });
  }, [contractedClients, clientSectorFilter, clientStatusFilter, workflowTaskFilter, workflowStageFilter, clientSearchQuery]);

  // Total MRR calculation from contracted clients
  const totalClientsMrr = useMemo(() => {
    return contractedClients.reduce((acc, client) => {
      if (client.budget) {
        const digits = client.budget.replace(/,/g, '').match(/\d+/);
        if (digits) {
          const val = parseInt(digits[0], 10);
          if (!isNaN(val) && val > 0) return acc + val;
        }
      }
      return acc + 15000;
    }, 0);
  }, [contractedClients]);

  const totalDeliveredCount = useMemo(() => {
    return contractedClients.reduce((acc, c) => acc + (c.postsDelivered || 0) + (c.reelsDelivered || 0) + (c.storiesDelivered || 0), 0);
  }, [contractedClients]);

  const totalTargetCount = useMemo(() => {
    return contractedClients.reduce((acc, c) => {
      const targets = getClientDeliverableTargets(c, data.packages);
      return acc + targets.totalTarget;
    }, 0);
  }, [contractedClients, data.packages]);

  const handleToggleClientStage = (client: Inquiry, stageId: string) => {
    const currentStages = client.workflowStages && client.workflowStages.length === 5 
      ? client.workflowStages 
      : DEFAULT_WORKFLOW_STAGES;

    const updatedStages = currentStages.map((stage) => {
      if (stage.id === stageId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        return { ...stage, status: nextStatus, completedAt };
      }
      return stage;
    });

    updateInquiry(client.id, { workflowStages: updatedStages });
    showNotice(isAr ? 'تم تحديث حالة المرحلة وتسجيل تاريخ ووقت الإنجاز بنجاح!' : 'Stage updated with timestamp!');
  };

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

            {/* Dev Preview / Instant Access Banner */}
            {!isSupabaseConfigured && (
              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-sky-400">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{isAr ? 'وضع المعاينة والتعديل المباشر' : 'Live Preview & Editing Mode Active'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isAr 
                    ? 'يمكنك الدخول بنقرة واحدة لتعديل الباقات والأسعار وسابقة الأعمال ومعاينة التغييرات فوراً، أو إدخال بريدك وكلمة المرور أدناه.'
                    : 'Click below to instantly open the management dashboard, adjust packages, pricing, or case studies, and preview all changes in real-time.'}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        sessionStorage.setItem('digital_effect_admin_session', 'true');
                      } catch {}
                      setLocalBypassAuth(true);
                      setSessionUser({ email: email.trim() || 'digitaleffect20@gmail.com', user_metadata: { role: 'admin' } });
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>{isAr ? 'الدخول المباشر للوحة التحكم (معاينة فورية)' : 'Enter Admin Dashboard (Instant Preview)'}</span>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-xl transition-all shadow-md cursor-pointer"
              title={isAr ? 'الانتقال إلى واجهة الموقع الرئيسية' : 'Go to Front-end website'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? 'عرض الموقع المباشر ↗' : 'View Public Site ↗'}</span>
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
              onClick={() => setActiveTab('clients')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'clients'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? `العملاء والتعاقدات (${contractedClients.length})` : `Clients & Retainers (${contractedClients.length})`}</span>
              {contractedClients.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                  {contractedClients.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'المبيعات والترافيك والجرافات' : 'Sales & Traffic Graphs'}</span>
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

            {/* Executive Analytics, Traffic & Sales Graphs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAnalyticsInInquiriesTab(prev => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-sky-600 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>
                    {showAnalyticsInInquiriesTab 
                      ? (isAr ? 'إخفاء الرسوم البيانية ومؤشرات المبيعات' : 'Hide Graphs & Sales Analytics')
                      : (isAr ? 'عرض الرسوم البيانية، الترافيك، والمبيعات' : 'Show Graphs, Traffic & Sales Analytics')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1 hover:underline"
                >
                  <span>{isAr ? 'فتح لوحة التحليلات الموسعة' : 'Open Full Analytics View'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showAnalyticsInInquiriesTab && (
                <CrmAnalyticsHub
                  inquiries={activeInquiriesList}
                  packages={data.packages}
                  isAr={isAr}
                />
              )}
            </div>

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
                  type="button"
                  onClick={() => setIsAddClientOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة عميل وتحديد باقة' : 'Add Client & Assign Package'}</span>
                </button>

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

                          {inq.status === 'closed' && (
                            <button
                              type="button"
                              onClick={() => {
                                const fullClient = (data.inquiries || []).find(i => i.id === inq.id) || inq;
                                setSelectedClientForAccount(fullClient as Inquiry);
                                setIsClientAccountOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              title={isAr ? 'فتح ومتابعة حساب العميل' : 'Open Client Account'}
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{isAr ? 'متابعة الحساب' : 'Account'}</span>
                            </button>
                          )}

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
        {/* TAB: CONTRACTED CLIENTS & RETAINER ACCOUNTS                       */}
        {/* ================================================================== */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Retainers KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Active Clients */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{isAr ? 'إجمالي العملاء المتعاقدين' : 'Total Clients'}</span>
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <UserCheck className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {contractedClients.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>●</span>
                  <span>{isAr ? 'حسابات نشطة ومتابعة' : 'Active accounts'}</span>
                </div>
              </div>

              {/* Card 2: Total Estimated MRR */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{isAr ? 'الإيراد الشهري المتكرر (MRR)' : 'Monthly Retainer (MRR)'}</span>
                  <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {totalClientsMrr.toLocaleString(isAr ? 'ar-EG' : 'en-US')} <span className="text-xs font-normal text-slate-500">{isAr ? 'ج.م' : 'EGP'}</span>
                </div>
                <div className="text-[11px] text-sky-600 font-bold">
                  {isAr ? 'قيمة الاشتراكات الشهرية' : 'Active Monthly Scope'}
                </div>
              </div>

              {/* Card 3: Renewals Due this month */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{isAr ? 'تجديدات مستحقة' : 'Renewals Due'}</span>
                  <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Clock className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {contractedClients.filter(c => c.contractStatus === 'renewal_due' || c.paymentStatus === 'pending' || c.paymentStatus === 'overdue').length}
                </div>
                <div className="text-[11px] text-amber-600 font-bold">
                  {isAr ? 'تتطلب تواصل ومتابعة' : 'Requires follow-up'}
                </div>
              </div>

              {/* Card 4: Deliverables Completed */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{isAr ? 'المخرجات المنشورة' : 'Assets Delivered'}</span>
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Layers className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {totalDeliveredCount} <span className="text-xs font-normal text-slate-400">/ {totalTargetCount}</span>
                </div>
                <div className="text-[11px] text-purple-600 font-bold">
                  {isAr ? 'مخرجات الشهر الحالي' : 'Delivered this cycle'}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* OVERDUE TASKS URGENT NOTIFICATION BANNER                        */}
            {/* =============================================================== */}
            {workflowCounts.overdue > 0 && (
              <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-4 rounded-2xl shadow-md border border-rose-400/40 flex flex-col md:flex-row md:items-center justify-between gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                    <BellRing className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black tracking-wide">
                        {isAr 
                          ? `نظام الإشعارات: يوجد ${workflowCounts.overdue} عميل لديهم مهام متأخرة تجاوزت موعد الاستحقاق!`
                          : `Alert System: ${workflowCounts.overdue} client accounts have tasks exceeding their scheduled due date!`}
                      </h4>
                      <span className="bg-white text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                        {isAr ? 'عاجل ومطلوب اتخاذ إجراء' : 'Action Required'}
                      </span>
                    </div>
                    <p className="text-xs text-rose-100 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'تجاوزت هذه الحسابات تاريخ الاستحقاق المحدد دون اكتمال المراحل التنفيذية. يرجى المتابعة وتحديث سير العمل فوراً.'
                        : 'These accounts exceeded their target handoff date with pending stages. Please review and update stalled deliverables.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWorkflowTaskFilter(workflowTaskFilter === 'overdue' ? 'all' : 'overdue')}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer self-start md:self-center ${
                    workflowTaskFilter === 'overdue'
                      ? 'bg-slate-900 text-white ring-2 ring-white/60'
                      : 'bg-white text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    {workflowTaskFilter === 'overdue'
                      ? (isAr ? 'إلغاء التصفية (عرض الكل)' : 'Clear Filter (Show All)')
                      : (isAr ? `تصفية وعرض المتأخرين فقط (${workflowCounts.overdue})` : `Filter Overdue Only (${workflowCounts.overdue})`)}
                  </span>
                </button>
              </div>
            )}

            {/* =============================================================== */}
            {/* UPPER WORKFLOW TASK STATUS FILTER BAR                           */}
            {/* =============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Title & Description */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>{isAr ? 'تصفية ومتابعة سير عمل المهام:' : 'Workflow Tasks Status Filter:'}</span>
                      {workflowTaskFilter !== 'all' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          workflowTaskFilter === 'overdue'
                            ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
                            : workflowTaskFilter === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : workflowTaskFilter === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {workflowTaskFilter === 'overdue' ? (isAr ? '⚠️ متأخرة تجاوزت الاستحقاق' : '⚠️ Overdue')
                            : workflowTaskFilter === 'completed' ? (isAr ? 'مكتملة' : 'Completed')
                            : workflowTaskFilter === 'in_progress' ? (isAr ? 'قيد التنفيذ' : 'In Progress')
                            : (isAr ? 'متأخرة / قيد الانتظار' : 'Delayed / Pending')}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? 'تصفية فورية لبطاقات العملاء حسب حالة تقدم المهام والمراحل التنفيذية' : 'Quickly filter client accounts by active workflow progress & execution stage'}
                    </p>
                  </div>
                </div>

                {/* Specific Stage Selector Dropdown & Reset */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
                    {isAr ? 'المرحلة:' : 'Stage:'}
                  </span>
                  <select
                    value={workflowStageFilter}
                    onChange={(e) => setWorkflowStageFilter(e.target.value)}
                    className="text-xs font-bold py-1.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">{isAr ? 'كافة المراحل التنفيذية' : 'All Workflow Stages'}</option>
                    <option value="content">{isAr ? '1. صناعة المحتوى (Content Creator)' : '1. Content Creator'}</option>
                    <option value="visual_design">{isAr ? '2. التصميم البصري (Visual Design)' : '2. Visual Design'}</option>
                    <option value="final_design">{isAr ? '3. النسخة النهائية (Final Design)' : '3. Final Design'}</option>
                    <option value="client_approval">{isAr ? '4. موافقة العميل (Client Approve)' : '4. Client Approve'}</option>
                    <option value="publishing">{isAr ? '5. النشر والجدولة (Publish)' : '5. Publish'}</option>
                  </select>

                  {(workflowTaskFilter !== 'all' || workflowStageFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setWorkflowTaskFilter('all');
                        setWorkflowStageFilter('all');
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      title={isAr ? 'إعادة ضبط الفلاتر' : 'Reset task filters'}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isAr ? 'إعادة التعيين' : 'Reset'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Segmented Buttons with Live Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-100">
                {/* 1. All Tasks */}
                <button
                  type="button"
                  onClick={() => setWorkflowTaskFilter('all')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    workflowTaskFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{isAr ? 'كافة المهام' : 'All Tasks'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums ${
                    workflowTaskFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {workflowCounts.all}
                  </span>
                </button>

                {/* 2. In Progress */}
                <button
                  type="button"
                  onClick={() => setWorkflowTaskFilter('in_progress')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    workflowTaskFilter === 'in_progress'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/30'
                      : 'bg-blue-50/50 hover:bg-blue-50 text-blue-800 border-blue-200/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>{isAr ? 'قيد التنفيذ' : 'In Progress'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums ${
                    workflowTaskFilter === 'in_progress' ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {workflowCounts.inProgress}
                  </span>
                </button>

                {/* 3. Completed */}
                <button
                  type="button"
                  onClick={() => setWorkflowTaskFilter('completed')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    workflowTaskFilter === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                      : 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border-emerald-200/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? 'مكتملة بالكامل' : 'Completed'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums ${
                    workflowTaskFilter === 'completed' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {workflowCounts.completed}
                  </span>
                </button>

                {/* 4. Overdue (Exceeded Due Date) */}
                <button
                  type="button"
                  onClick={() => setWorkflowTaskFilter('overdue')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    workflowTaskFilter === 'overdue'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/30'
                      : 'bg-rose-50/60 hover:bg-rose-100/70 text-rose-800 border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    <span>{isAr ? 'تجاوزت الاستحقاق' : 'Overdue'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums ${
                    workflowTaskFilter === 'overdue' ? 'bg-rose-700 text-rose-100' : 'bg-rose-100 text-rose-800 font-black'
                  }`}>
                    {workflowCounts.overdue}
                  </span>
                </button>

                {/* 5. Delayed / Pending */}
                <button
                  type="button"
                  onClick={() => setWorkflowTaskFilter('delayed')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    workflowTaskFilter === 'delayed'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                      : 'bg-amber-50/50 hover:bg-amber-50 text-amber-800 border-amber-200/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'قيد الانتظار' : 'Pending'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums ${
                    workflowTaskFilter === 'delayed' ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {workflowCounts.delayed}
                  </span>
                </button>
              </div>
            </div>

            {/* Toolbar: Search, Sector Filter, Status Filter, Add Client */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder={isAr ? 'البحث في العملاء بالاسم، الشركة، الباقة، أو الهاتف...' : 'Search clients by name, company, package...'}
                    className="w-full ps-10 pe-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Sector filter */}
                <select
                  value={clientSectorFilter}
                  onChange={(e) => setClientSectorFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">{isAr ? 'جميع القطاعات' : 'All Sectors'}</option>
                  <option value="b2c">{isAr ? 'B2C والتجارة' : 'B2C E-commerce'}</option>
                  <option value="b2b">{isAr ? 'B2B والشركات' : 'B2B Enterprise'}</option>
                  <option value="medical">{isAr ? 'القطاع الطبي' : 'Medical'}</option>
                </select>

                {/* Contract Status filter */}
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">{isAr ? 'جميع حالات التعاقد' : 'All Contract Statuses'}</option>
                  <option value="active">{isAr ? 'نشط ومفعل (Active)' : 'Active'}</option>
                  <option value="renewal_due">{isAr ? 'قيد التجديد (Renewal Due)' : 'Renewal Due'}</option>
                  <option value="paused">{isAr ? 'موقوف مؤقتاً (Paused)' : 'Paused'}</option>
                  <option value="completed">{isAr ? 'مكتمل / منتهي (Completed)' : 'Completed'}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddClientOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isAr ? 'إضافة عميل وتحديد باقة' : 'Add Client & Scope'}</span>
              </button>
            </div>

            {/* Clients Cards Grid */}
            {filteredContractedClients.length === 0 ? (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-base font-bold text-slate-800">
                    {contractedClients.length === 0 
                      ? (isAr ? 'لا يوجد عملاء في قسم التعاقدات حالياً' : 'No contracted clients yet')
                      : (isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching clients found')}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {contractedClients.length === 0
                      ? (isAr ? 'بمجرد تحويل حالة أي استشارة في الـ CRM إلى "تم التعاقد"، سينتقل العميل تلقائياً إلى هذا القسم لتتمكن من متابعة مخرجاته الشهرية وحسابه المالي.' : 'When any lead is marked "Closed Deal", they automatically appear here for account tracking.')
                      : (isAr ? 'جرّب تعديل كلمات البحث أو تصفية القطاعات.' : 'Try adjusting your search query or filters.')}
                  </p>
                </div>
                {contractedClients.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddClientOpen(true)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة أول عميل متعاقد وتحديد باقته' : 'Add First Contracted Client'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {invoiceDownloadNotice && (
                  <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-md flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                      <span>{invoiceDownloadNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInvoiceDownloadNotice(null)}
                      className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
                {filteredContractedClients.map((client) => {
                  const resolvedTargets = getClientDeliverableTargets(client, data.packages);
                  const targetP = resolvedTargets.postsTarget;
                  const targetR = resolvedTargets.reelsTarget;
                  const targetS = resolvedTargets.storiesTarget;
                  const deliveredP = client.postsDelivered ?? 0;
                  const deliveredR = client.reelsDelivered ?? 0;
                  const deliveredS = client.storiesDelivered ?? 0;
                  const totalT = resolvedTargets.totalTarget;
                  const totalD = deliveredP + deliveredR + deliveredS;
                  const pct = Math.min(100, Math.round((totalD / totalT) * 100));

                  const cleanDigits = (client.phoneE164 || client.phone).replace(/\D/g, '');
                  const waPhone = cleanDigits.startsWith('0') ? `20${cleanDigits.slice(1)}` : cleanDigits;
                  const waText = encodeURIComponent(
                    isAr 
                      ? `مرحباً ${client.name}، معك مدير حسابك من فريق ديجيتال إفكت بخصوص متابعة خطة (${client.packageName || 'العمل'}).`
                      : `Hello ${client.name}, this is your Account Manager from Digital Effect.`
                  );

                  const overdueInfo = getClientOverdueStatus(client, isAr);

                  return (
                    <div
                      key={client.id}
                      className={`bg-white rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative border ${
                        overdueInfo.isOverdue
                          ? 'border-rose-400 ring-2 ring-rose-400/25 bg-gradient-to-b from-rose-50/25 via-white to-white'
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Header: Company Name Primary, Client Name Secondary, Sector & Status */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-11 h-11 rounded-xl font-black flex items-center justify-center text-sm shrink-0 shadow-xs text-white ${
                              overdueInfo.isOverdue ? 'bg-rose-700' : 'bg-slate-900'
                            }`}>
                              {(client.company || client.name).slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-black text-slate-900 truncate">
                                  {client.company || client.name}
                                </h4>
                                {overdueInfo.isOverdue && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs animate-pulse shrink-0">
                                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span>{isAr ? `تجاوزت الاستحقاق (${overdueInfo.badgeTextAr})` : `Overdue (${overdueInfo.badgeTextEn})`}</span>
                                  </span>
                                )}
                              </div>
                              {client.company ? (
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1 font-medium mt-0.5">
                                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{isAr ? `مسؤول الحساب: ${client.name}` : `Contact: ${client.name}`}</span>
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 font-medium">
                                  {isAr ? 'عميل مباشر' : 'Direct Client'}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                              client.sector === 'medical' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : client.sector === 'b2b'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {client.sector}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              overdueInfo.isOverdue
                                ? 'bg-rose-100 text-rose-800 border border-rose-200 font-black'
                                : client.contractStatus === 'renewal_due'
                                ? 'bg-amber-100 text-amber-800'
                                : client.contractStatus === 'paused'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {overdueInfo.isOverdue
                                ? (isAr ? '⚠️ متأخر عن الموعد' : '⚠️ Past Due')
                                : client.contractStatus === 'renewal_due' ? (isAr ? 'قيد التجديد' : 'Renewal Due')
                                : client.contractStatus === 'paused' ? (isAr ? 'موقوف' : 'Paused')
                                : (isAr ? 'نشط ومفعل' : 'Active')}
                            </span>
                          </div>
                        </div>

                        {/* Overdue Warning Alert Strip */}
                        {overdueInfo.isOverdue && (
                          <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-900 text-xs flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4 h-4 animate-bounce" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-black text-xs block text-rose-950 truncate">
                                  {isAr ? overdueInfo.alertTitleAr : overdueInfo.alertTitleEn}
                                </span>
                                <span className="text-[11px] text-rose-700 block truncate font-medium">
                                  {isAr 
                                    ? `تاريخ الاستحقاق: ${overdueInfo.dueFormatted} • المرحلة المتعطلة: ${overdueInfo.stalledStageName || 'المراحل التنفيذية'}`
                                    : `Due: ${overdueInfo.dueFormatted} • Stalled at: ${overdueInfo.stalledStageName || 'Execution Stages'}`}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white text-rose-700 border border-rose-200 shadow-2xs shrink-0">
                              {isAr ? 'عاجل ومطلوب اتخاذ إجراء 🚨' : 'Action Required 🚨'}
                            </span>
                          </div>
                        )}

                        {/* Package Deliverables 3-Box Card (Without Cost & Without Progress Bar) */}
                        <ClientPackageDeliverablesCard
                          packageName={client.packageName}
                          postsCount={targetP}
                          reelsCount={targetR}
                          storiesCount={targetS}
                          isAr={isAr}
                          className="mb-3"
                        />

                        {/* Interactive Workflow Tasks Stepper with Timestamps */}
                        <div className={`mt-3.5 rounded-2xl p-3.5 space-y-2 border ${
                          overdueInfo.isOverdue 
                            ? 'bg-rose-50/50 border-rose-200' 
                            : 'bg-slate-50/90 border-slate-200/90'
                        }`}>
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-blue-600" />
                              <span>{isAr ? 'التايم لاين ومراحل سير العمل:' : 'Workflow Tasks Pipeline:'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isAr ? 'اضغط لتحديث الحالة وتاريخ التعليم' : 'Click to toggle status & date'}
                            </span>
                          </div>

                          <ClientWorkflowStepper
                            stages={client.workflowStages}
                            onToggleStage={(stageId) => handleToggleClientStage(client, stageId)}
                            interactive={true}
                            size="sm"
                            isAr={isAr}
                          />
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <a
                            href={`https://wa.me/${waPhone}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${client.phone}`}
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Dedicated Download Invoice Button */}
                          <button
                            type="button"
                            disabled={downloadingInvoiceClientId === client.id}
                            onClick={() => handleDownloadClientInvoice(client)}
                            className="px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/90 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title={isAr ? 'تحميل الفاتورة وبيان الحساب بصيغة PDF' : 'Download Invoice PDF'}
                          >
                            {downloadingInvoiceClientId === client.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span>{isAr ? 'تحميل الفاتورة' : 'Download Invoice'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClientForAccount(client);
                            setIsClientAccountOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isAr ? 'متابعة المهام والحساب' : 'Workflow & Account'}</span>
                          <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB: DEDICATED ANALYTICS, TRAFFIC & SALES HUB                      */}
        {/* ================================================================== */}
        {/* ================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CrmAnalyticsHub
              inquiries={activeInquiriesList}
              packages={data.packages}
              isAr={isAr}
            />
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: PACKAGES & OFFERS (Protected Admin View)                    */}
        {/* ================================================================== */}
        {/* ================================================================== */}
        {/* TAB 2: PACKAGES, PRICING & PROMO CODES HUB                         */}
        {/* ================================================================== */}
        {activeTab === 'packages' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Sub-Navigation Tabs */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCommercialSubTab('packages')}
                  className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                    commercialSubTab === 'packages'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isAr ? 'باقات الخدمات والأسعار الرسمية' : 'Service Packages & Specs'}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-sky-100 text-sky-800 rounded-full font-black">
                    {data.packages.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommercialSubTab('custom-calculator')}
                  className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                    commercialSubTab === 'custom-calculator'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'حاسبة ومصمم الباقات المخصصة' : 'Custom Package Calculator'}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-black">
                    AI / EGP
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommercialSubTab('promos')}
                  className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                    commercialSubTab === 'promos'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isAr ? 'أكواد الخصم والبرومو كود' : 'Promo Codes Hub'}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-purple-100 text-purple-800 rounded-full font-black">
                    {(data.promoCodes || []).length}
                  </span>
                </button>
              </div>

              {commercialSubTab === 'packages' && (
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                    <span className="text-[11px] font-bold text-slate-400 me-1">{isAr ? 'القطاع:' : 'Sector:'}</span>
                    {(['all', 'b2c', 'b2b', 'medical'] as const).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setPackageFilterSector(sec)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase ${
                          packageFilterSector === sec
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sec === 'all' ? (isAr ? 'الكل' : 'All') : sec}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCreatePackage(packageFilterSector === 'all' ? 'b2c' : packageFilterSector)}
                    className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة باقة جديدة' : 'Add New Package'}</span>
                  </button>
                </div>
              )}

              {commercialSubTab === 'promos' && (
                <button
                  type="button"
                  onClick={handleOpenCreatePromo}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer ms-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء كود خصم جديد' : 'New Promo Code'}</span>
                </button>
              )}
            </div>

            {/* ========================================================== */}
            {/* SUB-VIEW 1: PACKAGES & SPECIFICATIONS EDITING              */}
            {/* ========================================================== */}
            {commercialSubTab === 'packages' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.packages
                    .filter((pkg) => packageFilterSector === 'all' || pkg.sector === packageFilterSector)
                    .map((pkg) => {
                      const isPopular = !!pkg.isPopular;
                      const hasOffer = !!pkg.hasOffer;
                      const hasQuarterly = !!pkg.quarterlyPrice;

                      return (
                        <div
                          key={pkg.id}
                          className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all relative ${
                            isPopular ? 'border-sky-400 shadow-md ring-2 ring-sky-400/10' : 'border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div>
                            {/* Badges strip */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                  {pkg.sector}
                                </span>
                                {pkg.badge && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-50 text-sky-700 border border-sky-100">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>

                              {isPopular && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  <span>{isAr ? 'الأكثر طلباً' : 'Popular'}</span>
                                </span>
                              )}
                            </div>

                            {/* Title & Tagline */}
                            <div className="space-y-1 mb-4">
                              <h4 className="text-base font-black text-slate-900">{isAr ? pkg.name : pkg.nameEn}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{isAr ? pkg.tagline : pkg.taglineEn}</p>
                            </div>

                            {/* Price & Offer Highlight */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4 space-y-2">
                              <div className="flex items-baseline justify-between">
                                <span className="text-xs font-bold text-slate-400">{isAr ? 'السعر الشهري:' : 'Monthly:'}</span>
                                <div className="text-end">
                                  <div className="text-lg font-black text-slate-900 tabular-nums">
                                    {pkg.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {pkg.currency}
                                  </div>
                                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                    <div className="text-[11px] text-slate-400 line-through tabular-nums">
                                      {pkg.originalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {pkg.currency}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {hasQuarterly && (
                                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                                  <span className="text-slate-500">{isAr ? 'الاشتراك الربع سنوي:' : 'Quarterly:'}</span>
                                  <span className="font-bold text-emerald-700 tabular-nums">
                                    {pkg.quarterlyPrice?.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {pkg.currency}
                                  </span>
                                </div>
                              )}

                              {hasOffer && (
                                <div className="pt-1.5 border-t border-rose-100 flex items-center justify-between text-xs">
                                  <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                                    <Tag className="w-3 h-3" />
                                    <span>{pkg.offerNote || (isAr ? 'عرض لفترة محدودة' : 'Limited Offer')}</span>
                                  </span>
                                  {pkg.offerExpiryDate && (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                      {isAr ? `ينتهي: ${pkg.offerExpiryDate}` : `Exp: ${pkg.offerExpiryDate}`}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Deliverables Matrix */}
                            <div className="grid grid-cols-3 gap-1.5 mb-4 text-center">
                              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <span className="font-black text-sky-700 text-xs block tabular-nums">{pkg.postsCount ?? 0}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">{isAr ? 'منشور' : 'Posts'}</span>
                              </div>
                              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <span className="font-black text-purple-700 text-xs block tabular-nums">{pkg.reelsCount ?? 0}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">{isAr ? 'ريلز' : 'Reels'}</span>
                              </div>
                              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <span className="font-black text-amber-700 text-xs block tabular-nums">{pkg.storiesCount ?? 0}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">{isAr ? 'ستوريز' : 'Stories'}</span>
                              </div>
                            </div>

                            {/* Features Summary */}
                            <div className="text-[11px] text-slate-500 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                              <span>{isAr ? 'المزايا التنافسية:' : 'Features list:'}</span>
                              <span className="font-bold text-slate-800">
                                {pkg.features.length} {isAr ? 'مزايا معتمدة' : 'items'}
                              </span>
                            </div>
                          </div>

                          {/* Card Actions Toolbar */}
                          <div className="grid grid-cols-12 gap-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPackage(pkg)}
                              className="col-span-8 py-2 px-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                              <span>{isAr ? 'تعديل الباقة' : 'Edit Package'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicatePackage(pkg)}
                              className="col-span-2 py-2 px-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                              title={isAr ? 'استنساخ الباقة لإنشاء باقة جديدة' : 'Duplicate Package'}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg)}
                              className="col-span-2 py-2 px-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer border border-rose-200"
                              title={isAr ? 'حذف الباقة من الموقع' : 'Delete Package'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SUB-VIEW: CUSTOM PACKAGE CALCULATOR & BUILDER               */}
            {/* ========================================================== */}
            {commercialSubTab === 'custom-calculator' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
                  <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {isAr ? 'حاسبة ومصمم الباقات المخصصة (Custom Package Builder)' : 'Custom Package Calculator & Builder'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isAr 
                            ? 'احتساب تكلفة أي باقة مخصصة بناءً على جدول الأسعار والتكاليف الرسمي، مع إمكانية نشرها كباقة رسمية في الموقع بضغطة زر أو نسخ عرض السعر للواتساب' 
                            : 'Calculate custom package pricing calibrated to official rates and publish to the live site.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <CustomPackageCalculator 
                    mode="admin" 
                    isAr={isAr} 
                    onSaveAsPackage={(newPkgData) => {
                      const newPackage: ServicePackage = {
                        ...newPkgData,
                        id: `pkg-${Date.now()}`
                      };
                      addPackage(newPackage);
                      showNotice(isAr ? '🎉 تمت إضافة الباقة المخصصة كباقة رسمية في الموقع بنجاح!' : 'Custom package added as official website package!');
                      setCommercialSubTab('packages');
                    }} 
                    showNotice={showNotice} 
                  />
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SUB-VIEW 2: PROMO CODES & COUPONS MANAGEMENT               */}
            {/* ========================================================== */}
            {commercialSubTab === 'promos' && (
              <div className="space-y-6">
                {/* Stats ribbon for promo codes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-xs text-slate-500 font-bold">{isAr ? 'إجمالي أكواد الخصم' : 'Total Promo Codes'}</span>
                    <div className="text-2xl font-black text-slate-900 tabular-nums">
                      {(data.promoCodes || []).length}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-xs text-emerald-600 font-bold">{isAr ? 'الأكواد الفعالة حالياً' : 'Active Coupons'}</span>
                    <div className="text-2xl font-black text-emerald-600 tabular-nums">
                      {(data.promoCodes || []).filter((p) => p.isActive).length}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-xs text-purple-600 font-bold">{isAr ? 'إجمالي مرات الاستخدام' : 'Total Times Redeemed'}</span>
                    <div className="text-2xl font-black text-purple-600 tabular-nums">
                      {(data.promoCodes || []).reduce((acc, curr) => acc + (curr.usageCount || 0), 0)}
                    </div>
                  </div>
                </div>

                {/* Promo Codes List */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{isAr ? 'قائمة أكواد الخصم الترويجية' : 'Active Promo Codes List'}</h4>
                      <p className="text-xs text-slate-500">{isAr ? 'الأكواد المتاحة للعملاء في نافذة طلب الاستشارة لحساب الخصم الفوري' : 'Available coupon codes redeemable at consultation checkout'}</p>
                    </div>
                  </div>

                  {(!data.promoCodes || data.promoCodes.length === 0) ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Tag className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs">{isAr ? 'لا توجد أكواد خصم حالياً. اضغط "إنشاء كود خصم جديد" لإضافة أول كود.' : 'No promo codes found.'}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {data.promoCodes.map((promo) => {
                        const isExpired = promo.expiresAt && new Date().toISOString().slice(0, 10) > promo.expiresAt;
                        const isCopied = copiedPromoId === promo.id;

                        return (
                          <div key={promo.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleCopyPromoCode(promo.code, promo.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs tracking-wider inline-flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                                  title={isAr ? 'اضغط لنسخ الكود' : 'Click to copy code'}
                                >
                                  <span>{promo.code}</span>
                                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                </button>

                                <span className={`px-2 py-0.5 text-[11px] font-black rounded-md ${
                                  promo.discountType === 'percentage'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {promo.discountType === 'percentage' ? `${promo.discountValue}% خصم` : `${promo.discountValue.toLocaleString()} ج.م خصم ثابت`}
                                </span>

                                <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-600">
                                  {promo.applicableSector === 'all' ? (isAr ? 'كافة القطاعات' : 'All Sectors') : promo.applicableSector?.toUpperCase()}
                                </span>

                                {isExpired ? (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700">
                                    {isAr ? 'منتهي الصلاحية' : 'Expired'}
                                  </span>
                                ) : promo.isActive ? (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700">
                                    {isAr ? 'نشط وفعال' : 'Active'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-600">
                                    {isAr ? 'معطل' : 'Disabled'}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-semibold text-slate-800">
                                {isAr ? promo.title : (promo.titleEn || promo.title)}
                              </p>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                                <span>{isAr ? `مرات الاستخدام: ${promo.usageCount || 0}` : `Redeemed: ${promo.usageCount || 0}`}</span>
                                {promo.maxUsage && (
                                  <span>• {isAr ? `الحد الأقصى: ${promo.maxUsage}` : `Limit: ${promo.maxUsage}`}</span>
                                )}
                                {promo.minSpend && (
                                  <span>• {isAr ? `الحد الأدنى للباقة: ${promo.minSpend.toLocaleString()} ج.م` : `Min spend: ${promo.minSpend} EGP`}</span>
                                )}
                                {promo.expiresAt && (
                                  <span>• {isAr ? `ينتهي بتاريخ: ${promo.expiresAt}` : `Expires: ${promo.expiresAt}`}</span>
                                )}
                              </div>
                            </div>

                            {/* Actions strip */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {/* Toggle active button */}
                              <button
                                type="button"
                                onClick={() => togglePromoCodeStatus(promo.id)}
                                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                                  promo.isActive
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {promo.isActive ? (isAr ? 'إيقاف مؤقت' : 'Disable') : (isAr ? 'تفعيل الكود' : 'Enable')}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditPromo(promo)}
                                className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
                                title={isAr ? 'تعديل الكود' : 'Edit Code'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(isAr ? `هل أنت متأكد من حذف كود الخصم (${promo.code})؟` : `Delete promo code ${promo.code}?`)) {
                                    deletePromoCode(promo.id);
                                    showNotice(isAr ? 'تم حذف كود الخصم بنجاح.' : 'Promo code deleted.');
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
                                title={isAr ? 'حذف الكود' : 'Delete Code'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}


        {/* ================================================================== */}
        {/* TAB 3: CASE STUDIES & PORTFOLIO                                    */}
        {/* ================================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Top Level Sub-Nav Switcher between Media Manager and SEO Suite */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProjectsSection('media')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    projectsSection === 'media'
                      ? 'bg-sky-600 text-white shadow-sm font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{isAr ? 'معرض الصور والخطط والفيديوهات (Media & Video Manager)' : 'Media & Video Manager'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectsSection('seo')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    projectsSection === 'seo'
                      ? 'bg-sky-600 text-white shadow-sm font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>{isAr ? 'أدوات الـ SEO والمخططات المنظمة (SEO & Schema Suite)' : 'SEO & Schema Suite'}</span>
                </button>
              </div>

              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {isAr ? 'إجمالي المشاريع المتاحة:' : 'Total Projects:'} {data.caseStudies.length}
              </span>
            </div>

            {projectsSection === 'media' ? (
              <CaseStudyMediaManager
                data={data}
                updateCaseStudy={updateCaseStudy}
                isAr={isAr}
                showNotice={showNotice}
                setCurrentPage={setCurrentPage}
              />
            ) : (
              <div className="space-y-6">
                {/* Top Overview & Mode Switcher */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'مشاريع ودراسات الحالة وأداة ضبط الـ SEO التلقائية' : 'Case Studies & Automated SEO Suite'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? 'إدارة دراسات الحالة وتوليد وسوم محركات البحث ومخططات Schema.org المتوافقة مع معايير جوجل' : 'Manage case studies, auto-generate SERP tags and compliant Schema.org JSON-LD'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSeoGeneratorMode('case-study')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        seoGeneratorMode === 'case-study' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isAr ? 'دراسات الحالة' : 'Case Studies'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSeoGeneratorMode('page');
                        setSelectedCaseStudyForSeo(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        seoGeneratorMode === 'page' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isAr ? 'صفحات الموقع' : 'Website Pages'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Case Studies Quick Selector Cards */}
              {seoGeneratorMode === 'case-study' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'اختر دراسة حالة لتوليد أو تحديث بيانات الـ SEO والـ Schema:' : 'Select a Case Study to Generate or Audit SEO & Schema:'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.caseStudies.map((cs) => {
                      const isSelected = selectedCaseStudyForSeo === cs.id;
                      const hasSeo = Boolean(cs.metaTitle || cs.schemaJsonLd);
                      return (
                        <div 
                          key={cs.id}
                          onClick={() => setSelectedCaseStudyForSeo(cs.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-start space-y-2 ${
                            isSelected 
                              ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20' 
                              : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-200 text-slate-700">
                              {cs.sector}
                            </span>
                            {hasSeo ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {isAr ? 'SEO مفعل' : 'SEO Ready'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {isAr ? 'يحتاج توليد' : 'Needs SEO'}
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{isAr ? cs.client : cs.clientEn}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{isAr ? cs.title : cs.titleEn}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-sky-600">
                            <span>{isSelected ? (isAr ? 'جاري الفحص والتوليد' : 'Auditing...') : (isAr ? 'توليد وضبط الـ SEO' : 'Audit SEO')}</span>
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Embedded SEO & Schema Generator Suite */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'لوحة التحكم في السيو وبيانات Schema.org المنظمة' : 'Interactive SEO & Schema Control Center'}</span>
                </h4>
                {selectedCaseStudyForSeo && (
                  <span className="text-xs text-sky-600 font-semibold">
                    {isAr ? 'المشروع المحدد:' : 'Target:'} {data.caseStudies.find(c => c.id === selectedCaseStudyForSeo)?.client}
                  </span>
                )}
              </div>

              {(() => {
                const activeCs = selectedCaseStudyForSeo 
                  ? data.caseStudies.find(c => c.id === selectedCaseStudyForSeo) 
                  : data.caseStudies[0];

                return (
                  <SeoGeneratorWidget
                    key={`${seoGeneratorMode}-${activeCs?.id || 'default'}`}
                    mode={seoGeneratorMode}
                    isAr={isAr}
                    initialCaseStudy={activeCs ? {
                      title: activeCs.title,
                      titleEn: activeCs.titleEn,
                      client: activeCs.client,
                      clientEn: activeCs.clientEn,
                      sector: activeCs.sector,
                      metrics: activeCs.metrics,
                      slug: activeCs.slug || activeCs.id.replace('cs-', ''),
                    } : undefined}
                    initialPage={{ pageType: 'b2b' }}
                    onApply={(result) => {
                      if (activeCs && seoGeneratorMode === 'case-study') {
                        updateCaseStudy({
                          ...activeCs,
                          metaTitle: result.title,
                          metaTitleEn: result.titleEn,
                          metaDescription: result.description,
                          metaDescriptionEn: result.descriptionEn,
                          slug: result.slug,
                          schemaJsonLd: result.schemaJsonLd,
                        });
                        showNotice(isAr ? `تم تحديث بيانات الـ SEO ومخطط Schema بنجاح لمشروع: ${activeCs.client}` : `Updated SEO for ${activeCs.clientEn || activeCs.client}`);
                      } else {
                        showNotice(isAr ? 'تم تأكيد وحفظ بيانات الـ SEO ومخطط Schema بنجاح!' : 'Page SEO configuration saved!');
                      }
                    }}
                  />
                );
              })()}
            </div>
          </div>
        )}
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

      {/* ================================================================== */}
      {/* MODAL 1: PACKAGE EDITOR & SPECIFICATIONS MODAL                     */}
      {/* ================================================================== */}
      {editingPackage && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setEditingPackage(null)}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1.25rem)] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-30 shrink-0 p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {isCreatingNewPackage ? <Plus className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4 text-sky-400" />}
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {isCreatingNewPackage
                      ? (isAr ? 'إضافة باقة جديدة للموقع' : 'Add New Service Package')
                      : (isAr ? `تعديل باقة: ${editingPackage.name}` : `Edit Package: ${editingPackage.nameEn || editingPackage.name}`)}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  ID: {editingPackage.id} • {editingPackage.sector.toUpperCase()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPackage(null);
                  setIsCreatingNewPackage(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSavePackage} className="overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* SECTION 0: TARGET SECTOR */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'القطاع التابع للباقة *' : 'Target Sector *'}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['b2c', 'b2b', 'medical'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingPackage({ ...editingPackage, sector: s })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        editingPackage.sector === s
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s === 'b2c' ? (isAr ? 'B2C الأفراد والتجارة' : 'B2C Consumer') : s === 'b2b' ? (isAr ? 'B2B الشركات والمصانع' : 'B2B Corporate') : (isAr ? 'Medical عيادات ومراكز' : 'Medical Healthcare')}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 1: PRICING */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <DollarSign className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'الأسعار والاشتراكات الرسمية' : 'Pricing & Retainers'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'السعر الشهري (ج.م) *' : 'Monthly Price *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={editingPackage.price}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-bold tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'السعر الأصلي قبل الخصم' : 'Original Price (Strikethrough)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      placeholder={isAr ? 'اختياري' : 'Optional'}
                      value={editingPackage.originalPrice || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'الاشتراك الربع سنوي (٣ أشهر)' : 'Quarterly Price'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      placeholder={isAr ? 'اختياري' : 'Optional'}
                      value={editingPackage.quarterlyPrice || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, quarterlyPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LIMITED-TIME OFFER */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <div>
                      <span className="text-xs font-black text-amber-900 block">
                        {isAr ? 'عرض ترويجي لفترة محدودة' : 'Limited-Time Promotional Offer'}
                      </span>
                      <span className="text-[11px] text-amber-700">
                        {isAr ? 'تفعيل بادج العرض الترويجي والعد التنازلي على كارت الباقة' : 'Activate promo badge and deadline on card'}
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingPackage.hasOffer}
                      onChange={(e) => setEditingPackage({ ...editingPackage, hasOffer: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {editingPackage.hasOffer && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">
                        {isAr ? 'نص العرض الترويجي (مثال: خصم حصري ٢٠٪)' : 'Offer Tag Note'}
                      </label>
                      <input
                        type="text"
                        value={editingPackage.offerNote || ''}
                        onChange={(e) => setEditingPackage({ ...editingPackage, offerNote: e.target.value })}
                        placeholder={isAr ? 'خصم حصري لفترة محدودة' : 'Limited time exclusive deal'}
                        className="w-full text-xs p-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">
                        {isAr ? 'تاريخ انتهاء العرض (Expiry Date)' : 'Offer Expiry Date'}
                      </label>
                      <input
                        type="date"
                        value={editingPackage.offerExpiryDate || ''}
                        onChange={(e) => setEditingPackage({ ...editingPackage, offerExpiryDate: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: DELIVERABLES & SPECS MATRIX */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>{isAr ? 'مواصفات ومخرجات المحتوى الشهرية' : 'Monthly Deliverables & Velocity'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'عدد المنشورات' : 'Posts Count'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingPackage.postsCount ?? 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, postsCount: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-bold tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'عدد الريلز (AI/فيديو)' : 'Reels Count'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingPackage.reelsCount ?? 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, reelsCount: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-bold tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'عدد الستوريز' : 'Stories Count'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingPackage.storiesCount ?? 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, storiesCount: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-bold tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'الجدولة والتردد' : 'Frequency'}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? 'مثال: ٣ منشورات/أسبوع' : 'e.g. 3 posts/week'}
                      value={editingPackage.frequency || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, frequency: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hasMonthlyPlanCheckbox"
                    checked={!!editingPackage.hasMonthlyPlan}
                    onChange={(e) => setEditingPackage({ ...editingPackage, hasMonthlyPlan: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="hasMonthlyPlanCheckbox" className="text-xs text-slate-700 font-bold cursor-pointer">
                    {isAr ? 'تتضمن الباقة خطة شهرية استراتيجية معتمدة' : 'Full strategic monthly plan included'}
                  </label>
                </div>
              </div>

              {/* SECTION 4: FEATURES LIST MANAGER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'قائمة المزايا التنافسية للباقة' : 'Package Features List'}</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {editingPackage.features.length} {isAr ? 'مزايا' : 'features'}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                  {editingPackage.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="flex-1 text-slate-800 leading-snug">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureFromEditingPackage(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title={isAr ? 'حذف الميزة' : 'Remove feature'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new feature input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureTextAr}
                    onChange={(e) => setNewFeatureTextAr(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeatureToEditingPackage();
                      }
                    }}
                    placeholder={isAr ? 'اكتب ميزة جديدة لإضافتها للباقة...' : 'Add a new feature...'}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToEditingPackage}
                    className="px-3.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shrink-0 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 5: COPYWRITING & PRESENTATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Sparkle className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'العناوين والجمهور المستهدف' : 'Copywriting & Presentation'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'اسم الباقة (عربي) *' : 'Package Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPackage.name}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                      placeholder={isAr ? 'مثال: باقة النمو الطبي Growth' : 'e.g. Growth Plan'}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'اسم الباقة (English)' : 'Package Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={editingPackage.nameEn || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, nameEn: e.target.value })}
                      placeholder="e.g. Medical Growth Retainer"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'البادج الترويجي (عربي)' : 'Badge Tag (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={editingPackage.badge || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value })}
                      placeholder={isAr ? 'مثال: الأكثر طلباً' : 'e.g. Most Popular'}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'البادج الترويجي (English)' : 'Badge Tag (English)'}
                    </label>
                    <input
                      type="text"
                      value={editingPackage.badgeEn || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, badgeEn: e.target.value })}
                      placeholder="e.g. Most Popular"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'الشعار التسويقي (Tagline عربي)' : 'Tagline (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={editingPackage.tagline}
                      onChange={(e) => setEditingPackage({ ...editingPackage, tagline: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'الشعار التسويقي (Tagline English)' : 'Tagline (English)'}
                    </label>
                    <input
                      type="text"
                      value={editingPackage.taglineEn || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, taglineEn: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'الفئة والنشاط المستهدف (عربي)' : 'Ideal For Target (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={editingPackage.idealFor}
                      onChange={(e) => setEditingPackage({ ...editingPackage, idealFor: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'الفئة المستهدفة (English)' : 'Ideal For Target (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={editingPackage.idealForEn || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, idealForEn: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPopularCheckbox"
                    checked={!!editingPackage.isPopular}
                    onChange={(e) => setEditingPackage({ ...editingPackage, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="isPopularCheckbox" className="text-xs text-slate-700 font-bold cursor-pointer">
                    {isAr ? 'تمييز الباقة كـ "الأكثر طلباً" وإبرازها بتصميم لافت على الموقع' : 'Highlight as Most Popular on website'}
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
                {!isCreatingNewPackage ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePackage(editingPackage)}
                    className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حذف هذه الباقة' : 'Delete Package'}</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackage(null);
                      setIsCreatingNewPackage(false);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isCreatingNewPackage ? (isAr ? 'إضافة الباقة للموقع' : 'Add Package') : (isAr ? 'حفظ وتحديث الباقة' : 'Save Changes')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 2: PROMO CODE CREATE / EDIT MODAL                            */}
      {/* ================================================================== */}
      {isPromoModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsPromoModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1.25rem)] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-30 shrink-0 p-4 sm:p-5 bg-purple-900 text-white flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-300" />
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {editingPromoId ? (isAr ? 'تعديل كود الخصم' : 'Edit Promo Code') : (isAr ? 'إنشاء كود خصم ترويجي جديد' : 'Create New Promo Code')}
                  </h3>
                </div>
                <p className="text-[11px] text-purple-200">
                  {isAr ? 'إتاحة كود خصم للعملاء عند طلب الاستشارة وحساب التخفيض الفوري' : 'Configure coupon parameters and expiration'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1.5 text-purple-300 hover:text-white rounded-full hover:bg-purple-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSavePromo} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'كود الخصم (Promo Code) *' : 'Promo Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EFFECT20"
                    value={promoFormCode}
                    onChange={(e) => setPromoFormCode(e.target.value.toUpperCase())}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-mono font-bold uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'نوع الخصم *' : 'Discount Type *'}
                  </label>
                  <select
                    value={promoFormType}
                    onChange={(e) => setPromoFormType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {promoFormType === 'percentage' 
                      ? (isAr ? 'نسبة الخصم المئوية (%) *' : 'Discount Percentage (%) *') 
                      : (isAr ? 'مبلغ الخصم (ج.م) *' : 'Discount Amount (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={promoFormType === 'percentage' ? 90 : 100000}
                    value={promoFormValue}
                    onChange={(e) => setPromoFormValue(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'الحد الأدنى لقيمة الباقة' : 'Minimum Package Price'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder={isAr ? 'بدون حد أدنى' : 'No min spend'}
                    value={promoFormMinSpend}
                    onChange={(e) => setPromoFormMinSpend(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'اسم أو وصف الكود (يظهر للعميل) *' : 'Coupon Title / Description *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: خصم التدشين والانطلاق الحصري ٢٠٪' : 'e.g. Launch 20% Discount'}
                  value={promoFormTitle}
                  onChange={(e) => setPromoFormTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    value={promoFormExpiry}
                    onChange={(e) => setPromoFormExpiry(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'القطاع المخصص له' : 'Applicable Sector'}
                  </label>
                  <select
                    value={promoFormSector}
                    onChange={(e) => setPromoFormSector(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="all">{isAr ? 'كافة القطاعات (B2B, B2C, Medical)' : 'All Sectors'}</option>
                    <option value="b2c">{isAr ? 'قطاع B2C فقط' : 'B2C Only'}</option>
                    <option value="b2b">{isAr ? 'قطاع B2B فقط' : 'B2B Only'}</option>
                    <option value="medical">{isAr ? 'القطاع الطبي فقط' : 'Medical Only'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'الحد الأقصى لمرات الاستخدام' : 'Max Redemptions'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder={isAr ? 'غير محدود' : 'Unlimited'}
                    value={promoFormMaxUsage}
                    onChange={(e) => setPromoFormMaxUsage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="promoActiveCheckbox"
                    checked={promoFormActive}
                    onChange={(e) => setPromoFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="promoActiveCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                    {isAr ? 'الكود نشط ومتاح للاستخدام فوراً' : 'Active and redeemable immediately'}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPromoId ? (isAr ? 'تحديث كود الخصم' : 'Update Code') : (isAr ? 'إنشاء كود الخصم' : 'Create Code')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client to CRM Modal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onClientAdded={(newClient) => {
          showNotice(
            isAr 
              ? `تم تسجيل العميل (${newClient.name}) وتحديد باقة (${newClient.packageName}) بنجاح!` 
              : `Client (${newClient.name}) assigned to (${newClient.packageName}) successfully!`
          );
          if (isSupabaseConfigured && sessionUser) {
            loadInquiries();
          }
        }}
      />

      {/* Client Account Drawer / Follow-up Profile */}
      <ClientAccountDrawer
        client={selectedClientForAccount}
        isOpen={isClientAccountOpen}
        onClose={() => {
          setIsClientAccountOpen(false);
          setSelectedClientForAccount(null);
        }}
        onClientUpdated={(updated) => {
          setSelectedClientForAccount(updated);
          showNotice(isAr ? 'تم تحديث بيانات حساب العميل بنجاح!' : 'Client account updated successfully!');
        }}
      />
    </div>
  );
};

