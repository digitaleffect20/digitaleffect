import React, { useState, useEffect, useMemo } from 'react';
import { useAgencyData, DEFAULT_AGENCY_TEAM_MEMBERS } from '../context/AgencyDataContext';
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
  ServicePackage,
  PromoCode,
  SectorType,
  Inquiry,
  ClientAccountNote,
  ActivityLogType,
  PortalRole,
  PortalTabKey,
  TeamMemberPermissions,
  AgencyTeamMember,
} from '../types';
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
  Upload,
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
  BellRing,
  CreditCard,
  Wallet,
  Activity,
  ClipboardList,
  Users,
  Receipt,
  Settings,
  Shield
} from 'lucide-react';
import { CrmAnalyticsHub } from '../components/CrmAnalyticsHub';
import { SeoGeneratorWidget } from '../components/SeoGeneratorWidget';
import { CaseStudyMediaManager } from '../components/CaseStudyMediaManager';
import { CustomPackageCalculator } from '../components/CustomPackageCalculator';
import { AddClientModal } from '../components/AddClientModal';
import { ClientAccountDrawer, ClientDrawerTab } from '../components/ClientAccountDrawer';
import {
  ClientWorkflowStepper,
  DEFAULT_WORKFLOW_STAGES,
  buildReelWorkflowStages,
  checkSequentialStageToggle,
  formatSequentialBlockMessage,
  formatStageDisplayTitle,
} from '../components/ClientWorkflowStepper';
import { ClientPackageDeliverablesCard } from '../components/ClientPackageDeliverablesCard';
import { ActivityTimelinePanel, getActivityTypeMeta } from '../components/ActivityTimelinePanel';
import { getClientOverdueStatus, getClientDeliverableTargets } from '../utils/workflowUtils';
import {
  generateClientInvoicePdf,
  parseInvoiceAmount,
  generateUniqueInvoiceNumber,
} from '../utils/invoicePdfGenerator';
import {
  formatInvoicePeriodLabel,
  formatOperationCycleBadge,
} from '../utils/billingPeriodUtils';
import { InvoicesArchiveHub } from '../components/InvoicesArchiveHub';
import { AccountStatementModal } from '../components/AccountStatementModal';
import { TeamTasksHub } from '../components/TeamTasksHub';
import { ExpensesProfitHub } from '../components/ExpensesProfitHub';
import { TeamAccountsModal } from '../components/TeamAccountsModal';
import { AdWalletApprovalsBanner } from '../components/ClientAdWalletPanel';
import {
  FULL_ADMIN_PERMISSIONS,
  canMemberStartNewCycle,
  getPresetPermissions,
  resolveMemberPermissions,
  usernamesMatch,
  verifyTeamPassword,
} from '../utils/teamAuth';
import crmFullMigrationSql from '../../supabase/migrations/20261117000001_crm_full_persistence.sql?raw';

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
    addInquiry,
    updateInquiry,
    logInquiryActivity,
    deleteInquiry,
    addInvoice,
    clearAllCrmData,
    cloudSyncStatus,
    supabaseMigrationNeeded,
    lastCloudSyncAt,
    syncNowToSupabase,
    refreshFromSupabase,
    hydrateTeamWorkspace,
    clearTeamSession,
  } = useAgencyData();

  const [isCloudMigrating, setIsCloudMigrating] = useState(false);
  const [cloudSyncFeedback, setCloudSyncFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const isAr = language === 'ar';

  // Auth States
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Per-Member Team Authentication & Granular Permissions (kept strictly in React memory)
  const [loginMode, setLoginMode] = useState<'admin' | 'team'>('admin');
  const [teamUsernameInput, setTeamUsernameInput] = useState('');
  const [teamPasswordInput, setTeamPasswordInput] = useState('');
  const [teamLoginLoading, setTeamLoginLoading] = useState(false);
  const [loggedInTeamMemberId, setLoggedInTeamMemberId] = useState<string | null>(null);
  const [loggedInTeamMember, setLoggedInTeamMember] = useState<AgencyTeamMember | null>(null);
  const [, setTeamSessionToken] = useState<string | null>(null);
  const [previewTeamMemberId, setPreviewTeamMemberId] = useState<string | null>(null);
  const [isTeamAccountsModalOpen, setIsTeamAccountsModalOpen] = useState(false);

  // Local testing bypass state (only allowed when Supabase is not configured)
  const [localBypassAuth, setLocalBypassAuth] = useState(() => {
    if (isSupabaseConfigured) return false;
    try {
      return sessionStorage.getItem('digital_effect_admin_session') === 'true';
    } catch {
      return false;
    }
  });

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<PortalTabKey>('inquiries');
  const [showAnalyticsInInquiriesTab, setShowAnalyticsInInquiriesTab] = useState(true);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClientForAccount, setSelectedClientForAccount] = useState<Inquiry | null>(null);
  const [isClientAccountOpen, setIsClientAccountOpen] = useState(false);
  const [clientDrawerInitialTab, setClientDrawerInitialTab] = useState<ClientDrawerTab>('overview');
  const [autoOpenCloseCycle, setAutoOpenCloseCycle] = useState(false);
  const [selectedEntityForActivityLogId, setSelectedEntityForActivityLogId] = useState<string | null>(null);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityBucketFilter, setActivityBucketFilter] = useState<'all' | 'status' | 'interactions' | 'notes' | 'billing' | 'workflow'>('all');
  const [activityEntityFilter, setActivityEntityFilter] = useState<'all' | 'leads' | 'clients'>('all');
  const [clientPendingDelete, setClientPendingDelete] = useState<Inquiry | null>(null);
  const [isDeletingClientCard, setIsDeletingClientCard] = useState(false);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isConfirmActionLoading, setIsConfirmActionLoading] = useState(false);
  const [rlsClearHelpModal, setRlsClearHelpModal] = useState<{
    error: string;
    remainingCount?: number;
  } | null>(null);
  const [rlsClearSqlCopied, setRlsClearSqlCopied] = useState(false);
  const [clientSectorFilter, setClientSectorFilter] = useState<'all' | 'b2b' | 'b2c' | 'medical'>('all');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'active' | 'renewal_due' | 'paused' | 'completed'>('all');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [workflowTaskFilter, setWorkflowTaskFilter] = useState<'all' | 'in_progress' | 'completed' | 'delayed' | 'overdue'>('all');
  const [workflowStageFilter, setWorkflowStageFilter] = useState<string>('all');
  const [downloadingInvoiceClientId, setDownloadingInvoiceClientId] = useState<string | null>(null);
  const [invoiceDownloadNotice, setInvoiceDownloadNotice] = useState<string | null>(null);

  // Generate & Download Client Invoice PDF via jsPDF + auto-archive if client has no active invoice yet
  const handleDownloadClientInvoice = async (client: Inquiry) => {
    setDownloadingInvoiceClientId(client.id);
    try {
      const existingInvoices = data.invoices || [];
      const existingClientInv = existingInvoices.find(
        (i) => i.clientId === client.id && i.paymentStatus !== 'cancelled'
      );
      const invoiceNumber =
        existingClientInv?.invoiceNumber ||
        generateUniqueInvoiceNumber(client.id, existingInvoices);
      const adAmt = existingClientInv?.adCreditAmount ?? (client.pendingInvoiceAdCredit || 0);
      const effectiveStatus = existingClientInv?.paymentStatus || client.paymentStatus || 'pending';

      const activePeriodLabel = formatInvoicePeriodLabel(
        client.contractStartDate || client.createdAt,
        client.billingCycle || 'monthly',
        isAr
      );

      const res = await generateClientInvoicePdf({
        client,
        adCreditAmount: adAmt,
        contractPeriod: existingClientInv?.contractPeriod || activePeriodLabel,
        invoiceNumber,
        paymentStatus: effectiveStatus === 'cancelled' ? 'pending' : effectiveStatus,
        isAr,
      });

      if (res.success) {
        if (!existingClientInv) {
          const parsedRet = parseInvoiceAmount(client.budget);
          const numRetainer = parsedRet > 0 ? parsedRet : (client.retainerAmount || 0);
          const grandTotal = numRetainer + adAmt;
          const today = new Date().toISOString().split('T')[0];
          const targets = getClientDeliverableTargets(client, data.packages);

          addInvoice({
            invoiceNumber,
            clientId: client.id,
            clientName: client.name,
            clientCompany: client.company,
            clientPhone: client.phone,
            sector: client.sector,
            issueDate: today,
            dueDate:
              client.renewalDate ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            packageName: client.packageName || 'باقة تسويق رقمي',
            retainerAmount: numRetainer,
            adCreditAmount: adAmt,
            grandTotal,
            billingCycle: client.billingCycle || 'monthly',
            contractPeriod: activePeriodLabel,
            paymentStatus: 'pending',
            deliverables: {
              posts: targets.postsTarget,
              reels: targets.reelsTarget,
              stories: targets.storiesTarget,
            },
          });
        }

        setInvoiceDownloadNotice(
          isAr
            ? `تم تحميل فاتورة ${client.company || client.name} وحفظها بالأرشيف بنجاح!`
            : `Invoice for ${client.company || client.name} downloaded & archived!`
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
      frequency: chosenSector === 'b2b' ? 'منشور أسبوعي' : '٣ منشورات / أسبوع',
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
    setPendingConfirmAction({
      title: isAr ? 'تأكيد حذف الباقة' : 'Confirm Package Deletion',
      message: isAr
        ? `هل أنت متأكد من رغبتك في حذف باقة "${pkg.name}" نهائياً من الموقع؟`
        : `Are you sure you want to delete package "${pkg.nameEn || pkg.name}"?`,
      confirmLabel: isAr ? 'نعم، احذف الباقة' : 'Delete Package',
      onConfirm: () => {
        deletePackage(pkg.id);
        if (editingPackage?.id === pkg.id) {
          setEditingPackage(null);
          setIsCreatingNewPackage(false);
        }
        showNotice(isAr ? 'تم حذف الباقة بنجاح من الموقع.' : 'Package deleted successfully.');
      },
    });
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
      if (!isSupabaseConfigured || !supabase) {
        try {
          const isLocalSession = sessionStorage.getItem('digital_effect_admin_session') === 'true';
          if (isLocalSession && mounted) {
            setLocalBypassAuth(true);
            setSessionUser({ email: 'digitaleffect20@gmail.com', user_metadata: { role: 'admin' } });
          }
        } catch {}
        if (mounted) setAuthChecking(false);
        return;
      }

      // When Supabase is configured, clear any stale Local Dev Mode bypass so a real Supabase JWT is enforced
      try {
        sessionStorage.removeItem('digital_effect_admin_session');
      } catch {}
      if (mounted) setLocalBypassAuth(false);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) {
          if (!error && session) {
            setSessionUser(session.user);
          } else {
            setSessionUser(null);
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

  // 2. Fetch inquiries when user is authenticated (supports silent background refreshes)
  const loadInquiries = async (options?: { silent?: boolean }) => {
    if (!isSupabaseConfigured || !supabase) return;
    const shouldShowSpinner = !options?.silent && cloudInquiries.length === 0;
    if (shouldShowSpinner) setLoadingInquiries(true);
    if (!options?.silent) setLoadError(null);
    try {
      const res = await fetchAdminInquiries();
      if (!res.error) {
        setCloudInquiries(res.data);
        setLoadError(null);
      } else {
        console.warn('Could not fetch cloud inquiries:', res.error);
        if (!options?.silent) setLoadError(res.error);
      }
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      if (!options?.silent) setLoadError(err?.message || 'Error fetching inquiries');
    } finally {
      if (shouldShowSpinner) setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (!sessionUser || !isSupabaseConfigured || !supabase) return;
    const sb = supabase;

    loadInquiries();

    // Live Supabase Realtime listener so website submissions appear instantly
    const realtimeChannel = sb
      .channel('admin-inquiries-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          loadInquiries({ silent: true });
          refreshFromSupabase();
        }
      )
      .subscribe();

    // Auto-refresh when admin switches back to this browser tab or focuses window
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        loadInquiries({ silent: true });
      }
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // Lightweight background polling fallback (every 20s while visible)
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadInquiries({ silent: true });
      }
    }, 20000);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.clearInterval(pollInterval);
      sb.removeChannel(realtimeChannel);
    };
  }, [sessionUser]);

  // Refresh inquiries automatically whenever admin opens/switches to the Inquiries tab
  useEffect(() => {
    if (activeTab === 'inquiries' && sessionUser && isSupabaseConfigured) {
      loadInquiries({ silent: true });
    }
  }, [activeTab, sessionUser]);

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

  // Handle Per-Member Team Login (Server-Side Authentication & RBAC Workspace Hydration)
  const handleTeamMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const rawUsername = teamUsernameInput.trim();
    const rawPass = teamPasswordInput;

    if (!rawUsername || !rawPass) {
      setAuthError(
        isAr
          ? 'يرجى إدخال اسم المستخدم وكلمة المرور.'
          : 'Please enter both username and password.'
      );
      return;
    }

    setTeamLoginLoading(true);
    try {
      let apiHandled = false;

      try {
        const res = await fetch('/api/team/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: rawUsername, password: rawPass }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          apiHandled = true;
          const payload = (await res.json()) as {
            ok?: boolean;
            member?: AgencyTeamMember;
            sessionToken?: string;
            configMissing?: boolean;
            directoryEmpty?: boolean;
            suspended?: boolean;
            invalidCredentials?: boolean;
            error?: string;
          };

          if (res.ok && payload.ok && payload.member && payload.sessionToken) {
            const matchedMember = payload.member;
            const resolvedPerms = resolveMemberPermissions(matchedMember);
            const firstAllowedTab: PortalTabKey =
              resolvedPerms.allowedTabs && resolvedPerms.allowedTabs.length > 0
                ? resolvedPerms.allowedTabs[0]
                : 'tasks';

            setLoggedInTeamMember(matchedMember);
            setLoggedInTeamMemberId(matchedMember.id);
            setTeamSessionToken(payload.sessionToken);
            setTeamPasswordInput('');
            setPreviewTeamMemberId(null);
            setActiveTab(firstAllowedTab);

            await hydrateTeamWorkspace(payload.sessionToken, matchedMember);

            showNotice(
              isAr
                ? `مرحباً ${matchedMember.name} (${matchedMember.roleTitle}) — تم فتح الشاشات المصرح بها لحسابك.`
                : `Welcome ${matchedMember.name} (${matchedMember.roleTitle}) — Your workspace is ready.`
            );
            return;
          }

          if (payload.configMissing) {
            setAuthError(
              isAr
                ? 'خدمة دخول أعضاء الفريق غير مفعّلة بعد على الاستضافة: يرجى إضافة متغير البيئة SUPABASE_SERVICE_ROLE_KEY في إعدادات الاستضافة ثم إعادة النشر والضغط على «مزامنة سحابية» من حساب الإدارة.'
                : 'Team login service needs SUPABASE_SERVICE_ROLE_KEY configured in hosting environment variables, followed by a redeploy and one Cloud Sync from Admin.'
            );
            return;
          }

          if (payload.suspended || res.status === 403) {
            setAuthError(
              isAr
                ? 'هذا الحساب موقوف مؤقتاً من قبل الإدارة. يرجى التواصل مع مدير النظام.'
                : 'This team account is currently suspended by the administrator.'
            );
            return;
          }

          if (payload.directoryEmpty) {
            setAuthError(
              isAr
                ? 'لم يتم مزامنة حسابات الفريق مع السحابة بعد. يرجى دخول مدير الوكالة مرة واحدة والضغط على زر «مزامنة سحابية».'
                : 'Team accounts have not been synced to the cloud yet. Please sign in as Admin once and click Cloud Sync.'
            );
            return;
          }

          setAuthError(
            isAr
              ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات أو مراجعة مدير الوكالة.'
              : 'Invalid username or password. Please check your credentials or contact the agency admin.'
          );
          return;
        }
      } catch {
        // Network/endpoint unreachable — fall back to local directory check below
      }

      if (!apiHandled) {
        const membersList =
          Array.isArray(data.teamMembers) && data.teamMembers.length > 0
            ? data.teamMembers
            : DEFAULT_AGENCY_TEAM_MEMBERS;

        const matched = membersList.find(
          (m) => m.username && usernamesMatch(m.username, rawUsername)
        );

        if (!matched || !matched.passwordHash) {
          setAuthError(
            isAr
              ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى مراجعة مدير الوكالة.'
              : 'Invalid username or password.'
          );
          return;
        }

        if (matched.active === false) {
          setAuthError(
            isAr
              ? 'هذا الحساب موقوف مؤقتاً من قبل الإدارة. يرجى التواصل مع مدير النظام.'
              : 'This team account is currently suspended by the administrator.'
          );
          return;
        }

        const verifyRes = await verifyTeamPassword(rawPass, matched.passwordHash);

        if (!verifyRes.valid) {
          setAuthError(
            isAr
              ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
              : 'Invalid username or password.'
          );
          return;
        }

        const resolvedPerms = resolveMemberPermissions(matched);
        const firstAllowedTab: PortalTabKey =
          resolvedPerms.allowedTabs && resolvedPerms.allowedTabs.length > 0
            ? resolvedPerms.allowedTabs[0]
            : 'tasks';

        setLoggedInTeamMember(matched);
        setLoggedInTeamMemberId(matched.id);
        setTeamSessionToken(verifyRes.sessionToken || null);
        setTeamPasswordInput('');
        setPreviewTeamMemberId(null);
        setActiveTab(firstAllowedTab);
        showNotice(
          isAr
            ? `مرحباً ${matched.name} (${matched.roleTitle}) — تم فتح الشاشات المصرح بها لحسابك.`
            : `Welcome ${matched.name} (${matched.roleTitle}) — Your workspace is ready.`
        );
      }
    } catch {
      setAuthError(
        isAr
          ? 'تعذر التحقق من بيانات الدخول حالياً. يرجى المحاولة مرة أخرى.'
          : 'Could not verify credentials right now. Please try again.'
      );
    } finally {
      setTeamLoginLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    try {
      sessionStorage.removeItem('digital_effect_admin_session');
      sessionStorage.removeItem('de_ops_session');
      sessionStorage.removeItem('de_portal_role');
      sessionStorage.removeItem('de_ops_name');
    } catch {}
    clearTeamSession();
    setSessionUser(null);
    setLocalBypassAuth(false);
    setLoggedInTeamMember(null);
    setLoggedInTeamMemberId(null);
    setTeamSessionToken(null);
    setPreviewTeamMemberId(null);
    setIsTeamAccountsModalOpen(false);
    setTeamPasswordInput('');
    showNotice(isAr ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.');
  };

  // Status Updater (auto-logs status transitions for both leads & clients)
  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'closed' | 'cancelled') => {
    const existsLocally = (data.inquiries || []).some((item) => item.id === id);
    if (existsLocally) {
      updateInquiry(id, { status: newStatus });
    } else {
      const cloudLead = cloudInquiries.find((c) => c.id === id);
      if (cloudLead) {
        addInquiry({
          id: cloudLead.id,
          name: cloudLead.raw_client_name,
          phone: cloudLead.raw_client_phone,
          phoneE164: cloudLead.client_phone_e164 || cloudLead.customer?.phone_e164,
          phoneCountry: cloudLead.phone_country || cloudLead.customer?.phone_country,
          visitorCountry: cloudLead.visitor_country,
          company: cloudLead.raw_client_company || cloudLead.customer?.company || undefined,
          sector: cloudLead.sector,
          packageId: cloudLead.package_id || undefined,
          packageName: cloudLead.raw_package_name || undefined,
          budget: cloudLead.budget || undefined,
          notes: cloudLead.notes || undefined,
          status: newStatus,
        });
        if (cloudLead.status !== newStatus) {
          const statusNames: Record<string, string> = {
            new: 'جديد (لم يتم الرد)',
            contacted: 'قيد التواصل',
            closed: 'تم التعاقد',
            cancelled: 'ملغي',
          };
          logInquiryActivity(id, {
            type: 'status_change',
            text: `تم تحديث حالة الطلب من (${statusNames[cloudLead.status] || cloudLead.status}) إلى (${statusNames[newStatus] || newStatus}).`,
            meta: {
              fromStatus: statusNames[cloudLead.status] || cloudLead.status,
              toStatus: statusNames[newStatus] || newStatus,
            },
          });
        }
      }
    }

    if (isSupabaseConfigured && sessionUser) {
      const res = await updateInquiryStatusInDb(id, newStatus);
      if (res.success) {
        setCloudInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
        if (newStatus === 'closed') {
          setActiveTab('clients');
        }
        showNotice(
          newStatus === 'closed'
            ? (isAr ? 'تم التعاقد! تم نقل العميل تلقائياً إلى قسم العملاء والتعاقدات.' : 'Contract closed! Client transferred to Clients section.')
            : (isAr ? 'تم تحديث حالة الطلب بنجاح!' : 'Status updated!')
        );
      } else {
        showNotice(res.error || (isAr ? 'تعذر تحديث الحالة في السحابة.' : 'Failed to update status in cloud'));
      }
    } else {
      // Local fallback updater
      setCloudInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      if (newStatus === 'closed') {
        setActiveTab('clients');
      }
      showNotice(
        newStatus === 'closed'
          ? (isAr ? 'تم التعاقد! تم نقل العميل تلقائياً إلى قسم العملاء والتعاقدات.' : 'Contract closed! Client transferred to Clients section.')
          : (isAr ? 'تم تحديث الحالة بنجاح.' : 'Status updated successfully.')
      );
    }
  };

  // Delete Inquiry (via in-app React confirmation modal so it works inside iframes)
  const handleDeleteInquiry = (id: string, clientName?: string) => {
    setPendingConfirmAction({
      title: isAr ? 'تأكيد حذف الطلب نهائياً' : 'Confirm Inquiry Deletion',
      message: isAr
        ? `هل أنت متأكد من حذف طلب "${clientName || 'هذا العميل'}" نهائياً؟ سيتم مسحه من لوحة التحكم وقاعدة بيانات Supabase.`
        : `Are you sure you want to permanently delete "${clientName || 'this inquiry'}" from CRM and Supabase?`,
      confirmLabel: isAr ? 'نعم، احذف الطلب' : 'Yes, Delete Inquiry',
      onConfirm: async () => {
        deleteInquiry(id);

        if (isSupabaseConfigured && sessionUser) {
          const res = await deleteInquiryFromDb(id);
          setCloudInquiries(prev => prev.filter(inq => inq.id !== id));
          if (res.success) {
            showNotice(isAr ? 'تم حذف الطلب بنجاح.' : 'Deleted successfully.');
          } else {
            showNotice(res.error || (isAr ? 'تم حذف السجل محلياً مع تعذر الحذف السحابي.' : 'Failed to delete inquiry from cloud.'));
          }
        } else {
          setCloudInquiries(prev => prev.filter(inq => inq.id !== id));
          showNotice(isAr ? 'تم حذف الطلب بنجاح.' : 'Deleted locally.');
        }
      },
    });
  };

  // Wipe all CRM inquiries, clients, and invoices from CRM + Supabase DB for clean production start
  const handleRequestClearAllCrm = () => {
    setPendingConfirmAction({
      title: isAr ? 'تفريغ كافة الطلبات والعملاء والفواتير نهائياً' : 'Clear All CRM Data & Database',
      message: isAr
        ? 'سيتم مسح جميع الطلبات والاستشارات، العملاء والتعاقدات، وأرشيف الفواتير وسجل النشاط من لوحة التحكم ومن قاعدة بيانات Supabase بالكامل لتبدأ ببيانات حقيقية. لن تتأثر الباقات أو دراسات الحالة أو إعدادات الموقع.'
        : 'This permanently deletes all inquiries, contracted clients, and invoices from CRM and Supabase so you can start with real data. Packages and Case Studies remain untouched.',
      confirmLabel: isAr ? 'نعم، أفرغ جميع السجلات والداتابيز' : 'Yes, Empty All CRM Records',
      onConfirm: async () => {
        const res = await clearAllCrmData();
        setCloudInquiries([]);
        if (isSupabaseConfigured && sessionUser) {
          await loadInquiries();
        }
        if (res.success) {
          showNotice(
            isAr
              ? 'تم تفريغ الطلبات والعملاء وأرشيف الفواتير من النظام والداتابيز بنجاح!'
              : 'All inquiries, clients, and invoices cleared from CRM & Database!'
          );
        } else if (res.rlsBlocked || res.remainingCount) {
          setRlsClearHelpModal({
            error: res.error || '',
            remainingCount: res.remainingCount,
          });
        } else {
          showNotice(res.error || (isAr ? 'تم التفريغ محلياً مع وجود ملاحظة بالسحابة.' : 'Cleared locally with cloud warning.'));
        }
      },
    });
  };

  // Unsynced local open inquiries (excludes contracted clients, sample seeds, and records already in cloudInquiries)
  const unsyncedLocalInquiries = useMemo(() => {
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cloudIds = new Set(cloudInquiries.map((c) => c.id));
    return (data.inquiries || []).filter((item) => {
      if (item.id.startsWith('inq-client-')) return false;
      if (item.status === 'closed') return false;
      if (cloudIds.has(item.id)) return false;
      if (uuidRe.test(item.id)) return false;
      const itemPhone = (item.phoneE164 || item.phone || '').replace(/\D/g, '');
      const itemTime = new Date(item.createdAt).getTime();
      const dupInCloud = cloudInquiries.some((c) => {
        const cPhone = (c.client_phone_e164 || c.raw_client_phone || '').replace(/\D/g, '');
        const cTime = new Date(c.created_at).getTime();
        return itemPhone && cPhone && itemPhone.slice(-9) === cPhone.slice(-9) && Math.abs(itemTime - cTime) < 300000;
      });
      return !dupInCloud;
    });
  }, [data.inquiries, cloudInquiries]);

  // Safe Migration Tool: Migrate unsynced localStorage open inquiries into Supabase without touching contracted clients
  const handleMigrateLocalInquiries = async () => {
    if (unsyncedLocalInquiries.length === 0) {
      showNotice(isAr ? 'لا توجد طلبات محلية غير مزامنة لترحيلها.' : 'No unsynced local inquiries found to migrate.');
      return;
    }

    if (!isSupabaseConfigured || !supabase || !sessionUser) {
      showNotice(isAr ? 'يجب تسجيل الدخول كمسؤول وتهيئة Supabase أولاً.' : 'Must be authenticated with Supabase first.');
      return;
    }

    setIsMigratingLocal(true);
    let successCount = 0;

    try {
      for (const item of unsyncedLocalInquiries) {
        const cleanPhone = item.phone.trim();
        const digits = cleanPhone.replace(/\D/g, '');
        const e164 = item.phoneE164 || (cleanPhone.startsWith('+') ? cleanPhone : (digits.startsWith('0') ? `+20${digits.slice(1)}` : `+20${digits}`));

        const res = await submitInquiry({
          name: item.name,
          phone: cleanPhone,
          phoneE164: e164,
          phoneCountry: item.phoneCountry || 'EG',
          visitorCountry: item.visitorCountry || 'Local',
          company: item.company || undefined,
          sector: item.sector,
          packageName: item.packageName || undefined,
          budget: item.budget || undefined,
          notes: item.notes || undefined,
        });
        if (res.success && res.isDatabaseBacked) {
          successCount++;
          deleteInquiry(item.id);
        }
      }

      showNotice(
        isAr 
          ? `تم نقل ${successCount} طلب إلى قاعدة البيانات السحابية المركزية بنجاح!` 
          : `Migrated ${successCount} inquiries to cloud database successfully!`
      );
      await loadInquiries();
    } catch (err: any) {
      showNotice(err?.message || (isAr ? 'حدث خطأ أثناء الترحيل.' : 'Migration error'));
    } finally {
      setIsMigratingLocal(false);
    }
  };

  // Dismiss only unsynced local open inquiries without removing contracted clients
  const handleDismissLocalInquiries = () => {
    setPendingConfirmAction({
      title: isAr ? 'حذف الطلبات المحلية غير المزامنة' : 'Dismiss Local Inquiries',
      message: isAr
        ? 'هل تريد حذف الطلبات المحلية غير المرفوعة من هذا المتصفح؟'
        : 'Dismiss and remove unsynced local inquiries?',
      confirmLabel: isAr ? 'نعم، احذفها' : 'Dismiss',
      onConfirm: () => {
        unsyncedLocalInquiries.forEach((item) => deleteInquiry(item.id));
        showNotice(isAr ? 'تم إخفاء الطلبات المحلية.' : 'Local inquiries dismissed.');
      },
    });
  };

  // Determine current active inquiries to display:
  // Merge cloudInquiries with any unsynced/fallback local inquiries so no website submission is ever hidden.
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
    clientNotes?: ClientAccountNote[];
  }> = useMemo(() => {
    if (isSupabaseConfigured && sessionUser) {
      const localById = new Map((data.inquiries || []).map((item) => [item.id, item]));
      const cloudMapped = cloudInquiries.map((i) => {
        const localOverride = localById.get(i.id);
        return {
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
          status: localOverride?.status || i.status,
          createdAt: i.created_at,
          clientNotes: localOverride?.clientNotes,
        };
      });

      const localExtrasMapped = unsyncedLocalInquiries.map((i) => ({
        id: i.id,
        name: i.name,
        phone: i.phone,
        phoneE164: i.phoneE164 || i.phone,
        phoneCountry: i.phoneCountry || 'EG',
        visitorCountry: i.visitorCountry || 'Local',
        company: i.company,
        sector: i.sector,
        packageName: i.packageName,
        budget: i.budget,
        notes: i.notes,
        status: i.status,
        createdAt: i.createdAt,
        clientNotes: i.clientNotes,
      }));

      return [...localExtrasMapped, ...cloudMapped].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return (data.inquiries || []).map((i) => ({
      id: i.id,
      name: i.name,
      phone: i.phone,
      phoneE164: i.phoneE164 || i.phone,
      phoneCountry: i.phoneCountry || 'EG',
      visitorCountry: i.visitorCountry || 'Local Dev',
      company: i.company,
      sector: i.sector,
      packageName: i.packageName,
      budget: i.budget,
      notes: i.notes,
      status: i.status,
      createdAt: i.createdAt,
      clientNotes: i.clientNotes,
    }));
  }, [isSupabaseConfigured, sessionUser, cloudInquiries, data.inquiries, unsyncedLocalInquiries]);

  // Inquiries tab shows only non-contracted leads (new, contacted, cancelled);
  // Once converted to 'closed' (تم التعاقد), they move exclusively to Clients & Contracts.
  const openInquiriesList = useMemo(
    () => activeInquiriesList.filter((item) => item.status !== 'closed'),
    [activeInquiriesList]
  );

  const filteredInquiries = openInquiriesList.filter(item => {
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

  const newInquiriesCount = openInquiriesList.filter(i => i.status === 'new').length;

  // Contracted Clients List (Clients with status === 'closed')
  const contractedClients: Inquiry[] = useMemo(() => {
    return (data.inquiries || []).filter((inq) => inq.status === 'closed');
  }, [data.inquiries]);

  // Live selected lead/entity for Per-Lead Activity Log Modal
  const selectedEntityForActivityLog = useMemo(() => {
    if (!selectedEntityForActivityLogId) return null;
    const localMatch = (data.inquiries || []).find((i) => i.id === selectedEntityForActivityLogId);
    if (localMatch) return localMatch;
    const activeMatch = activeInquiriesList.find((i) => i.id === selectedEntityForActivityLogId);
    if (!activeMatch) return null;
    return {
      id: activeMatch.id,
      name: activeMatch.name,
      phone: activeMatch.phone,
      phoneE164: activeMatch.phoneE164 || undefined,
      phoneCountry: activeMatch.phoneCountry || undefined,
      visitorCountry: activeMatch.visitorCountry || undefined,
      company: activeMatch.company || undefined,
      sector: activeMatch.sector,
      packageName: activeMatch.packageName || undefined,
      budget: activeMatch.budget || undefined,
      notes: activeMatch.notes || undefined,
      status: activeMatch.status,
      createdAt: activeMatch.createdAt,
      clientNotes: activeMatch.clientNotes,
    } as Inquiry;
  }, [selectedEntityForActivityLogId, data.inquiries, activeInquiriesList]);

  // Unified Global Activity Log Feed across all Leads & Contracted Clients
  const globalActivityFeed = useMemo(() => {
    const entityMap = new Map<
      string,
      {
        id: string;
        name: string;
        company?: string | null;
        phone: string;
        sector: SectorType;
        status: Inquiry['status'];
        createdAt: string;
        notes?: string | null;
        clientNotes?: ClientAccountNote[];
        fullClient?: Inquiry;
      }
    >();

    activeInquiriesList.forEach((item) => {
      entityMap.set(item.id, {
        id: item.id,
        name: item.name,
        company: item.company,
        phone: item.phoneE164 || item.phone,
        sector: item.sector,
        status: item.status,
        createdAt: item.createdAt,
        notes: item.notes,
        clientNotes: item.clientNotes,
      });
    });

    (data.inquiries || []).forEach((item) => {
      const existing = entityMap.get(item.id);
      entityMap.set(item.id, {
        id: item.id,
        name: item.name,
        company: item.company ?? existing?.company,
        phone: item.phoneE164 || item.phone,
        sector: item.sector,
        status: item.status,
        createdAt: item.createdAt,
        notes: item.notes ?? existing?.notes,
        clientNotes: item.clientNotes && item.clientNotes.length > 0 ? item.clientNotes : existing?.clientNotes,
        fullClient: item,
      });
    });

    const items: Array<{
      entry: ClientAccountNote;
      entityId: string;
      entityName: string;
      entityCompany?: string | null;
      entityPhone: string;
      entitySector: SectorType;
      entityStatus: Inquiry['status'];
      isClient: boolean;
      fullClient?: Inquiry;
    }> = [];

    entityMap.forEach((entity) => {
      const entries =
        entity.clientNotes && entity.clientNotes.length > 0
          ? entity.clientNotes
          : [
              {
                id: `${entity.id}-initial`,
                text: entity.notes
                  ? `${isAr ? 'تسجيل سجل جديد بالملاحظات:' : 'Initial record created:'} ${entity.notes}`
                  : (isAr
                      ? entity.status === 'closed'
                        ? 'تم تفعيل حساب العميل المتعاقد في النظام.'
                        : 'تم استلام طلب استشارة / تواصل جديد.'
                      : entity.status === 'closed'
                      ? 'Contracted client account activated.'
                      : 'New lead inquiry received.'),
                createdAt: entity.createdAt,
                author: isAr ? 'النظام' : 'System',
                type: 'status_change' as ActivityLogType,
              },
            ];

      entries.forEach((entry) => {
        items.push({
          entry,
          entityId: entity.id,
          entityName: entity.name,
          entityCompany: entity.company,
          entityPhone: entity.phone,
          entitySector: entity.sector,
          entityStatus: entity.status,
          isClient: entity.status === 'closed',
          fullClient: entity.fullClient,
        });
      });
    });

    return items.sort(
      (a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime()
    );
  }, [activeInquiriesList, data.inquiries, isAr]);

  const activitySummaryStats = useMemo(() => {
    const stats = {
      total: globalActivityFeed.length,
      status: 0,
      interactions: 0,
      notes: 0,
      billing: 0,
      workflow: 0,
    };
    globalActivityFeed.forEach(({ entry }) => {
      const meta = getActivityTypeMeta(entry.type, isAr);
      if (meta.bucket !== 'all') {
        stats[meta.bucket] += 1;
      }
    });
    return stats;
  }, [globalActivityFeed, isAr]);

  const filteredGlobalActivityFeed = useMemo(() => {
    return globalActivityFeed.filter((item) => {
      if (activityEntityFilter === 'leads' && item.isClient) return false;
      if (activityEntityFilter === 'clients' && !item.isClient) return false;
      if (activityBucketFilter !== 'all') {
        const meta = getActivityTypeMeta(item.entry.type, isAr);
        if (meta.bucket !== activityBucketFilter) return false;
      }
      if (activitySearch.trim()) {
        const q = activitySearch.toLowerCase();
        const matchName = item.entityName.toLowerCase().includes(q);
        const matchCompany = (item.entityCompany || '').toLowerCase().includes(q);
        const matchText = item.entry.text.toLowerCase().includes(q);
        const matchAuthor = (item.entry.author || '').toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchText && !matchAuthor) return false;
      }
      return true;
    });
  }, [globalActivityFeed, activityEntityFilter, activityBucketFilter, activitySearch, isAr]);

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

  // Total MRR calculation from contracted clients (retainer fee only, excluding ad credit)
  const totalClientsMrr = useMemo(() => {
    const invoices = data.invoices || [];
    return contractedClients.reduce((acc, client) => {
      if (client.retainerAmount && client.retainerAmount > 0) {
        return acc + client.retainerAmount;
      }
      const parsedBudget = parseInvoiceAmount(client.budget);
      if (parsedBudget > 0) {
        return acc + parsedBudget;
      }
      const clientInvoice = invoices.find((inv) => inv.clientId === client.id && inv.retainerAmount > 0);
      if (clientInvoice) {
        return acc + clientInvoice.retainerAmount;
      }
      const defaultFee = client.sector === 'b2b' ? 4000 : client.sector === 'medical' ? 19500 : 15000;
      return acc + defaultFee;
    }, 0);
  }, [contractedClients, data.invoices]);

  const totalDeliveredCount = useMemo(() => {
    return contractedClients.reduce((acc, c) => acc + (c.postsDelivered || 0) + (c.reelsDelivered || 0) + (c.storiesDelivered || 0), 0);
  }, [contractedClients]);

  const totalTargetCount = useMemo(() => {
    return contractedClients.reduce((acc, c) => {
      const targets = getClientDeliverableTargets(c, data.packages);
      return acc + targets.totalTarget;
    }, 0);
  }, [contractedClients, data.packages]);

  // Active & Pending Team Tasks count across all clients (for Tasks tab badge & Ops KPI)
  const activeTeamTasksCount = useMemo(() => {
    let count = 0;
    contractedClients.forEach((client) => {
      const stages =
        client.workflowStages && client.workflowStages.length > 0
          ? client.workflowStages
          : DEFAULT_WORKFLOW_STAGES;
      stages.forEach((s) => {
        if (s.status !== 'completed') count++;
      });
      const { reelsTarget } = getClientDeliverableTargets(client, data.packages);
      if (reelsTarget > 0) {
        const reels = buildReelWorkflowStages(reelsTarget, client.reelStages, client.reelsDelivered ?? 0);
        reels.forEach((r) => {
          if (r.status !== 'completed') count++;
        });
      }
    });
    return count;
  }, [contractedClients, data.packages]);

  // Renewal Radar: active clients whose renewalDate is overdue or within the next 5 days
  const renewalRadarClients = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const items: Array<{ client: Inquiry; daysUntil: number; renewalDate: string }> = [];

    contractedClients.forEach((client) => {
      if (client.contractStatus === 'paused' || client.contractStatus === 'completed') return;
      if (!client.renewalDate) return;
      const target = new Date(`${client.renewalDate}T00:00:00`);
      if (Number.isNaN(target.getTime())) return;
      const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 5) {
        items.push({ client, daysUntil: diffDays, renewalDate: client.renewalDate });
      }
    });

    return items.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contractedClients]);

  const getRenewalReminderWhatsAppHref = (client: Inquiry, renewalDate: string) => {
    const cleanPhone = (client.phone || '').replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const msg = isAr
      ? `السلام عليكم أستاذ/ ${client.name || client.company} 👋
تحية طيبة من فريق *ديجيتال إفكت*،

نود تذكير حضراتكم بقرب موعد تجديد باقة *${client.packageName || 'التسويق الرقمي'}* الخاصة بـ *${client.company || client.name}* بتاريخ *${renewalDate}*.
يسعدنا تأكيد التجديد للاستمرار في تنفيذ خطة المحتوى والحملات للشهر القادم دون أي توقف 🚀

شكراً لثقتكم الدائمة بنا!`
      : `Hello ${client.name || client.company},
Warm greetings from *Digital Effect*!

This is a friendly reminder that your *${client.packageName || 'Digital Marketing'}* subscription for *${client.company || client.name}* is due for renewal on *${renewalDate}*.
Please confirm renewal so we can smoothly kick off next month's content & campaign cycle without interruption. Thank you!`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  };

  const agencyTeamMembers = useMemo(
    () =>
      data.teamMembers && data.teamMembers.length > 0
        ? data.teamMembers
        : DEFAULT_AGENCY_TEAM_MEMBERS,
    [data.teamMembers]
  );

  // Effective Role & Granular Permissions Resolution
  const isEmailForcedOps = useMemo(() => {
    const userEmail = (sessionUser?.email || '').trim().toLowerCase();
    if (!userEmail) return false;
    return (data.opsAccountEmails || []).some((e) => e.trim().toLowerCase() === userEmail);
  }, [sessionUser, data.opsAccountEmails]);

  const realRole: PortalRole =
    isEmailForcedOps || Boolean(loggedInTeamMemberId) ? 'operations' : 'admin';

  const activeTeamMember: AgencyTeamMember | null = useMemo(() => {
    if (realRole === 'admin' && previewTeamMemberId) {
      return agencyTeamMembers.find((m) => m.id === previewTeamMemberId) || null;
    }
    if (loggedInTeamMemberId) {
      return (
        agencyTeamMembers.find((m) => m.id === loggedInTeamMemberId) ||
        loggedInTeamMember ||
        null
      );
    }
    return null;
  }, [realRole, previewTeamMemberId, loggedInTeamMemberId, loggedInTeamMember, agencyTeamMembers]);

  // If a signed-in team member was deleted or suspended by Admin, end their session immediately
  useEffect(() => {
    if (loggedInTeamMemberId && (!activeTeamMember || activeTeamMember.active === false)) {
      clearTeamSession();
      setLoggedInTeamMember(null);
      setLoggedInTeamMemberId(null);
      setTeamSessionToken(null);
    }
  }, [loggedInTeamMemberId, activeTeamMember]);

  const effectivePermissions: TeamMemberPermissions = useMemo(() => {
    if (realRole === 'admin' && !previewTeamMemberId) {
      return FULL_ADMIN_PERMISSIONS;
    }
    if (activeTeamMember) {
      return resolveMemberPermissions(activeTeamMember);
    }
    return getPresetPermissions('account_manager');
  }, [realRole, previewTeamMemberId, activeTeamMember]);

  const canAccessTab = (tab: PortalTabKey) => effectivePermissions.allowedTabs.includes(tab);
  const canViewFinancials = effectivePermissions.canViewFinancials;
  const canEditClients = effectivePermissions.canEditClients;
  const canDeleteRecords = effectivePermissions.canDeleteRecords;
  const canManageTeam = effectivePermissions.canManageTeam;
  const canApproveAdWallet = Boolean(effectivePermissions.canApproveAdWallet);
  const canManageAdWallet =
    Boolean(effectivePermissions.canManageAdWallet) || canApproveAdWallet || canViewFinancials;
  const canAccessAdWallet = canManageAdWallet || canApproveAdWallet || canViewFinancials;

  const effectiveRole: PortalRole =
    canViewFinancials && canManageTeam ? 'admin' : 'operations';
  const canStartNewCycle = canMemberStartNewCycle(
    effectivePermissions,
    activeTeamMember?.rolePreset,
    effectiveRole
  );

  useEffect(() => {
    if (!effectivePermissions.allowedTabs.includes(activeTab)) {
      const fallbackTab = effectivePermissions.allowedTabs[0] || 'tasks';
      if (fallbackTab !== activeTab) {
        setActiveTab(fallbackTab);
      }
    }
  }, [effectivePermissions, activeTab]);

  const handleToggleClientStage = (client: Inquiry, stageId: string) => {
    const allowedStages = effectivePermissions.allowedWorkflowStages;
    if (allowedStages && !allowedStages.includes(stageId as any)) {
      return;
    }

    const currentStages = client.workflowStages && client.workflowStages.length === 5 
      ? client.workflowStages 
      : DEFAULT_WORKFLOW_STAGES;

    const seqCheck = checkSequentialStageToggle(currentStages, stageId);
    if (!seqCheck.allowed) {
      const targetStage = currentStages.find((s) => s.id === stageId);
      showNotice(formatSequentialBlockMessage(seqCheck, targetStage?.title || stageId, isAr));
      return;
    }

    let toggledStageTitle = stageId;
    let nextStageStatusLabel = '';
    const memberStamp = activeTeamMember?.name?.trim();
    const canAssign = effectivePermissions.canAssignTasks !== false;
    const actorName = memberStamp || (isAr ? 'فريق التشغيل' : 'Operations Team');

    const updatedStages = currentStages.map((stage) => {
      if (stage.id === stageId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        toggledStageTitle = stage.title;
        nextStageStatusLabel =
          nextStatus === 'completed'
            ? (isAr ? 'مكتمل' : 'Completed')
            : nextStatus === 'in_progress'
            ? (isAr ? 'جاري التنفيذ' : 'In Progress')
            : (isAr ? 'قيد الانتظار' : 'Pending');

        let resolvedAssignee = stage.assignee;
        if (memberStamp) {
          if (nextStatus === 'pending') {
            resolvedAssignee = !canAssign ? undefined : stage.assignee;
          } else if (!canAssign || !stage.assignee) {
            resolvedAssignee = memberStamp;
          }
        }

        return { ...stage, status: nextStatus, completedAt, assignee: resolvedAssignee };
      }
      return stage;
    });

    const workflowLog: ClientAccountNote = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      text: isAr
        ? `تحديث مرحلة التنفيذ "${toggledStageTitle}" إلى (${nextStageStatusLabel}).`
        : `Updated workflow stage "${toggledStageTitle}" to ${nextStageStatusLabel}.`,
      createdAt: new Date().toISOString(),
      author: actorName,
      type: 'workflow',
      meta: { stageTitle: toggledStageTitle, toStatus: nextStageStatusLabel },
    };

    updateInquiry(client.id, {
      workflowStages: updatedStages,
      clientNotes: [workflowLog, ...(client.clientNotes || [])],
    });
    showNotice(isAr ? 'تم تحديث حالة المرحلة وتسجيل تاريخ ووقت الإنجاز بنجاح!' : 'Stage updated with timestamp!');
  };

  const handleToggleClientReelStage = (client: Inquiry, reelStageId: string) => {
    if (effectivePermissions.canUpdateReelsTrack === false) {
      return;
    }

    const resolvedTargets = getClientDeliverableTargets(client, data.packages);
    const currentReelStages = buildReelWorkflowStages(
      resolvedTargets.reelsTarget,
      client.reelStages,
      client.reelsDelivered ?? 0
    );

    const reelSeqCheck = checkSequentialStageToggle(currentReelStages, reelStageId);
    if (!reelSeqCheck.allowed) {
      const targetIdx = currentReelStages.findIndex((s) => s.id === reelStageId);
      const targetLabel = isAr ? `ريلز ${targetIdx + 1}` : `Reel ${targetIdx + 1}`;
      showNotice(formatSequentialBlockMessage(reelSeqCheck, targetLabel, isAr));
      return;
    }

    let toggledReelIndex = 0;
    let nextReelStatusLabel = '';
    const memberStamp = activeTeamMember?.name?.trim();
    const canAssign = effectivePermissions.canAssignTasks !== false;
    const actorName = memberStamp || (isAr ? 'فريق التشغيل' : 'Operations Team');

    const updatedReelStages = currentReelStages.map((stage, idx) => {
      if (stage.id === reelStageId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        toggledReelIndex = idx + 1;
        nextReelStatusLabel =
          nextStatus === 'completed'
            ? (isAr ? 'مكتمل' : 'Completed')
            : nextStatus === 'in_progress'
            ? (isAr ? 'قيد التنفيذ' : 'In Progress')
            : (isAr ? 'في الانتظار' : 'Pending');

        let resolvedAssignee = stage.assignee;
        if (memberStamp) {
          if (nextStatus === 'pending') {
            resolvedAssignee = !canAssign ? undefined : stage.assignee;
          } else if (!canAssign || !stage.assignee) {
            resolvedAssignee = memberStamp;
          }
        }

        return { ...stage, status: nextStatus, completedAt, assignee: resolvedAssignee };
      }
      return stage;
    });

    const syncedReelsDelivered = updatedReelStages.filter((s) => s.status === 'completed').length;
    const reelLabel = isAr ? `ريلز ${toggledReelIndex}` : `Reel ${toggledReelIndex}`;

    const reelLog: ClientAccountNote = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      text: isAr
        ? `تحديث تايم لاين الريلز (${reelLabel}) إلى «${nextReelStatusLabel}» (المكتمل: ${syncedReelsDelivered}/${updatedReelStages.length}).`
        : `Updated Reels timeline (${reelLabel}) to ${nextReelStatusLabel} (${syncedReelsDelivered}/${updatedReelStages.length} done).`,
      createdAt: new Date().toISOString(),
      author: actorName,
      type: 'workflow',
      meta: { stageTitle: reelLabel, toStatus: nextReelStatusLabel },
    };

    updateInquiry(client.id, {
      reelStages: updatedReelStages,
      reelsDelivered: syncedReelsDelivered,
      clientNotes: [reelLog, ...(client.clientNotes || [])],
    });
    showNotice(
      isAr
        ? `تم تحديث حالة ${reelLabel} وتسجيل الوقت بنجاح!`
        : `${reelLabel} updated with timestamp!`
    );
  };

  const handleToggleClientCarriedOverReel = (client: Inquiry, carryOverId: string) => {
    if (effectivePermissions.canUpdateReelsTrack === false) {
      return;
    }

    const currentList = client.carriedOverReels || [];
    let targetLabel = '';
    let nextStatusLabel = '';
    const memberStamp = activeTeamMember?.name?.trim();
    const canAssign = effectivePermissions.canAssignTasks !== false;
    const actorName = memberStamp || (isAr ? 'فريق التشغيل' : 'Operations Team');

    const updatedCarriedOver = currentList.map((stage) => {
      if (stage.id === carryOverId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        targetLabel = formatStageDisplayTitle(stage.title, isAr);
        nextStatusLabel =
          nextStatus === 'completed'
            ? (isAr ? 'مكتمل' : 'Completed')
            : nextStatus === 'in_progress'
            ? (isAr ? 'قيد التنفيذ' : 'In Progress')
            : (isAr ? 'مرحّل بالانتظار' : 'Pending');

        let resolvedAssignee = stage.assignee;
        if (memberStamp) {
          if (nextStatus === 'pending') {
            resolvedAssignee = !canAssign ? undefined : stage.assignee;
          } else if (!canAssign || !stage.assignee) {
            resolvedAssignee = memberStamp;
          }
        }

        return { ...stage, status: nextStatus, completedAt, assignee: resolvedAssignee };
      }
      return stage;
    });

    const completedCarried = updatedCarriedOver.filter((r) => r.status === 'completed').length;
    const carryLog: ClientAccountNote = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      text: isAr
        ? `تحديث فيديو مرحّل من الشهر السابق (${targetLabel}) إلى «${nextStatusLabel}» (${completedCarried}/${updatedCarriedOver.length}).`
        : `Updated carried-over video (${targetLabel}) to ${nextStatusLabel} (${completedCarried}/${updatedCarriedOver.length}).`,
      createdAt: new Date().toISOString(),
      author: actorName,
      type: 'workflow',
      meta: { stageTitle: targetLabel, toStatus: nextStatusLabel },
    };

    updateInquiry(client.id, {
      carriedOverReels: updatedCarriedOver,
      clientNotes: [carryLog, ...(client.clientNotes || [])],
    });
    showNotice(
      isAr
        ? `تم تحديث حالة الفيديو المرحّل (${targetLabel}) بنجاح!`
        : `Carried-over video (${targetLabel}) updated!`
    );
  };

  // Export to Excel / CSV with UTF-8 BOM
  const exportInquiriesCsv = () => {
    if (activeInquiriesList.length === 0) {
      showNotice(isAr ? 'لا توجد طلبات لتصديرها.' : 'No inquiries to export.');
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

  const isAuthenticated = Boolean(
    sessionUser ||
      localBypassAuth ||
      (loggedInTeamMemberId && activeTeamMember && activeTeamMember.active !== false)
  );

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

            {/* Role Mode Selector: Admin vs Team Member Account */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('admin');
                  setAuthError(null);
                }}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginMode === 'admin'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'الإدارة (Admin)' : 'Admin Owner'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('team');
                  setAuthError(null);
                }}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginMode === 'team'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isAr ? 'دخول أعضاء الفريق' : 'Team Member Login'}</span>
              </button>
            </div>

            {loginMode === 'admin' ? (
              /* Admin Login Form */
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
            ) : (
              /* Per-Member Team Username & Password Login Form */
              <form onSubmit={handleTeamMemberLogin} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200 leading-relaxed">
                  {isAr
                    ? 'سجّل الدخول باسم المستخدم وكلمة المرور الخاصة بحسابك لفتح الشاشات والمهام المحددة لك فقط من قبل الإدارة.'
                    : 'Sign in with your personal Username & Password to access only the screens and tasks assigned to your account.'}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'اسم المستخدم (Username):' : 'Username:'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    autoComplete="username"
                    placeholder="sara.content"
                    value={teamUsernameInput}
                    onChange={(e) => setTeamUsernameInput(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'كلمة المرور (Password):' : 'Password:'}</span>
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={teamPasswordInput}
                    onChange={(e) => setTeamPasswordInput(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={teamLoginLoading}
                  className="w-full py-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {teamLoginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري التحقق من الحساب...' : 'Verifying account...'}</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>{isAr ? 'تسجيل دخول عضو الفريق' : 'Sign In to Team Workspace'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-black text-white">Digital Effect CRM</h1>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black rounded-full border flex items-center gap-1 ${
                    activeTeamMember
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                  }`}
                >
                  {activeTeamMember ? <Users className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  <span>
                    {activeTeamMember
                      ? `${activeTeamMember.name} • ${activeTeamMember.roleTitle}`
                      : isAr
                      ? 'الإدارة (Admin)'
                      : 'Admin Role'}
                  </span>
                </span>
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
                {previewTeamMemberId && activeTeamMember
                  ? isAr
                    ? `معاينة حساب: ${activeTeamMember.name} (${effectivePermissions.allowedTabs.length} شاشات متاحة)`
                    : `Previewing: ${activeTeamMember.name} (${effectivePermissions.allowedTabs.length} screens)`
                  : loggedInTeamMemberId && activeTeamMember
                  ? `${isAr ? 'حساب الفريق:' : 'Team Account:'} ${activeTeamMember.username ? `@${activeTeamMember.username}` : activeTeamMember.name}`
                  : sessionUser?.email
                  ? `${isAr ? 'المسؤول:' : 'User:'} ${sessionUser.email}`
                  : isAr
                  ? 'مدير النظام (جلسة نشطة)'
                  : 'Admin (Active Session)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Admin Team Accounts & Permissions Management + Live Preview Exit */}
            {realRole === 'admin' && (
              <>
                {previewTeamMemberId && activeTeamMember && (
                  <button
                    type="button"
                    onClick={() => setPreviewTeamMemberId(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? `إنهاء معاينة ${activeTeamMember.name} والعودة للإدارة`
                        : `Exit ${activeTeamMember.name} Preview`}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTeamAccountsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-emerald-200 hover:text-white bg-slate-800 hover:bg-emerald-700 border border-emerald-500/40 rounded-xl transition-all cursor-pointer"
                  title={
                    isAr
                      ? 'إنشاء حسابات أعضاء الفريق (Username & Password) وتحديد الشاشات والصلاحيات لكل عضو'
                      : 'Manage team member accounts, credentials & screen permissions'
                  }
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'إدارة الفريق والصلاحيات' : 'Team & Access'}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 font-black tabular-nums">
                    {agencyTeamMembers.filter((m) => Boolean(m.username && m.passwordHash)).length}
                  </span>
                </button>
              </>
            )}

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

        {/* Admin Previewing Specific Team Member Banner */}
        {realRole === 'admin' && previewTeamMemberId && activeTeamMember && (
          <div className="bg-emerald-700 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-3 flex-wrap border-t border-emerald-500/40">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-200" />
              <span>
                {isAr
                  ? `أنت تعاين الآن لوحة التحكم كما يراها «${activeTeamMember.name}» (${activeTeamMember.roleTitle}) — الحسابات المالية ${effectivePermissions.canViewFinancials ? 'مرئية' : 'مخفية'}`
                  : `Previewing dashboard as "${activeTeamMember.name}" (${activeTeamMember.roleTitle}) — Financials ${effectivePermissions.canViewFinancials ? 'visible' : 'hidden'}`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewTeamMemberId(null)}
              className="px-3 py-1 rounded-lg bg-white text-emerald-900 font-black text-[11px] hover:bg-emerald-50 cursor-pointer"
            >
              {isAr ? 'العودة لوضع الإدارة' : 'Return to Admin'}
            </button>
          </div>
        )}

        {/* Global Toast Notification */}
        {notice && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab Navigation (Dynamically filtered by effectivePermissions.allowedTabs) */}
        <div className="bg-slate-800/80 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center gap-x-1.5 gap-y-0.5 py-1">
            {canAccessTab('inquiries') && (
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'inquiries'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>{isAr ? `الطلبات والاستشارات (${openInquiriesList.length})` : `Inquiries & Orders (${openInquiriesList.length})`}</span>
                {newInquiriesCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-slate-900 rounded-full font-bold animate-pulse">
                    {newInquiriesCount} {isAr ? 'جديد' : 'new'}
                  </span>
                )}
              </button>
            )}

            {canAccessTab('clients') && (
              <button
                onClick={() => setActiveTab('clients')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
            )}

            {canAccessTab('tasks') && (
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'tasks'
                    ? 'border-indigo-400 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? 'مهام اليوم والفريق' : 'Team Tasks'}</span>
                {activeTeamTasksCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 rounded-full font-bold">
                    {activeTeamTasksCount}
                  </span>
                )}
              </button>
            )}

            {canAccessTab('invoices') && (
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'invoices'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAr ? `أرشيف الفواتير وكشوف الحساب (${data.invoices?.length || 0})` : `Invoices & Statements (${data.invoices?.length || 0})`}</span>
                {(data.invoices?.length || 0) > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
                    {data.invoices?.length || 0}
                  </span>
                )}
              </button>
            )}

            {canAccessTab('expenses') && (
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'expenses'
                    ? 'border-rose-400 text-rose-300'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                <span>{isAr ? `الإدارة المالية والأرباح والخسائر (${(data.expenses || []).filter((e) => !e.voided).length})` : `Finance & Monthly P&L (${(data.expenses || []).filter((e) => !e.voided).length})`}</span>
              </button>
            )}

            {canAccessTab('activity') && (
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? `سجل النشاط والتفاعلات (${globalActivityFeed.length})` : `Activity Log (${globalActivityFeed.length})`}</span>
                {globalActivityFeed.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
                    {globalActivityFeed.length}
                  </span>
                )}
              </button>
            )}

            {canAccessTab('analytics') && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'المبيعات والترافيك والجرافات' : 'Sales & Traffic Graphs'}</span>
              </button>
            )}

            {canAccessTab('packages') && (
              <button
                onClick={() => setActiveTab('packages')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'packages'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{isAr ? `الباقات والعروض (${data.packages.length})` : `Packages & Offers (${data.packages.length})`}</span>
              </button>
            )}

            {canAccessTab('projects') && (
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'projects'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isAr ? `دراسات الحالة والمشاريع (${data.caseStudies.length})` : `Case Studies (${data.caseStudies.length})`}</span>
              </button>
            )}

            {canAccessTab('banner') && (
              <button
                onClick={() => setActiveTab('banner')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'banner'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'شريط العروض والخصومات' : 'Global Promo Banner'}</span>
              </button>
            )}

            {canAccessTab('backup') && (
              <button
                onClick={() => setActiveTab('backup')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'backup'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'النسخ الاحتياطي والضبط' : 'Backup & Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* ================================================================== */}
        {/* TAB 1: INQUIRIES & ORDERS HUB                                      */}
        {/* ================================================================== */}
        {canAccessTab('inquiries') && activeTab === 'inquiries' && (
          <div className="space-y-6">
            {/* Safe Migration Banner if unsynced local open inquiries exist */}
            {isSupabaseConfigured && sessionUser && unsyncedLocalInquiries.length > 0 && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'اكتشاف طلبات محلية غير مزامنة مع السحابة' : 'Unsynced local inquiries detected'}</span>
                  </h4>
                  <p className="text-[11px] text-sky-700">
                    {isAr 
                      ? `يوجد ${unsyncedLocalInquiries.length} طلب مسجل محلياً على هذا المتصفح ولم يُرحّل بعد إلى Supabase. يمكنك رفعه الآن بضغطة واحدة.`
                      : `Found ${unsyncedLocalInquiries.length} local inquiries not yet synced to Supabase.`}
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

            {/* Executive Analytics, Traffic & Sales Graphs (Financial Access Only) */}
            {canViewFinancials && (
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

                  {canAccessTab('analytics') && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('analytics')}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1 hover:underline"
                    >
                      <span>{isAr ? 'فتح لوحة التحليلات الموسعة' : 'Open Full Analytics View'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {showAnalyticsInInquiriesTab && (
                  <CrmAnalyticsHub
                    inquiries={activeInquiriesList}
                    invoices={data.invoices || []}
                    expenses={data.expenses || []}
                    packages={data.packages}
                    isAr={isAr}
                  />
                )}
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
                  <option value="all">{isAr ? 'جميع الطلبات الواردة' : 'All Active Inquiries'}</option>
                  <option value="new">{isAr ? 'جديد (لم يتم الرد)' : 'New'}</option>
                  <option value="contacted">{isAr ? 'قيد التواصل' : 'Contacted'}</option>
                  <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSupabaseConfigured && sessionUser && (
                  <button
                    onClick={() => loadInquiries()}
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

                {(activeInquiriesList.length > 0 || (data.invoices?.length || 0) > 0) && (
                  <button
                    type="button"
                    onClick={handleRequestClearAllCrm}
                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    title={isAr ? 'تفريغ الطلبات والعملاء والفواتير من النظام والداتابيز' : 'Empty all CRM records & DB'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isAr ? 'تفريغ الكل' : 'Clear All'}</span>
                  </button>
                )}
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
                  onClick={() => loadInquiries()}
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
                  {openInquiriesList.length === 0 
                    ? (isAr ? 'لا توجد طلبات واردة حالياً' : 'No inquiries yet')
                    : (isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching inquiries found')}
                </h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {openInquiriesList.length === 0
                    ? (isAr ? 'عند قيام أي عميل باختيار باقة وإرسال نموذج الاستشارة، ستظهر بياناته هنا فوراً لحين إتمام التعاقد ونقله لقسم العملاء.' : 'When any visitor submits the consultation form, their details will appear here until contracted.')
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
                                setClientDrawerInitialTab('overview');
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

                          {canDeleteRecords && (
                            <button
                              type="button"
                              onClick={() => handleDeleteInquiry(inq.id, inq.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title={isAr ? 'حذف الطلب' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                          {canViewFinancials && inq.budget && (
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

                      {/* Latest Activity Snippet if logged */}
                      {inq.clientNotes && inq.clientNotes.length > 0 && (
                        <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-bold text-amber-900 shrink-0">
                              {isAr ? 'آخر نشاط:' : 'Latest Activity:'}
                            </span>
                            <span className="text-slate-700 truncate">{inq.clientNotes[0].text}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(inq.clientNotes[0].createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      )}

                      {/* Quick Direct Actions: WhatsApp, Call & Activity Log */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={`https://wa.me/${waPhone}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() =>
                              logInquiryActivity(
                                inq.id,
                                {
                                  type: 'whatsapp',
                                  text: isAr
                                    ? `تم فتح محادثة واتساب مباشرة مع العميل المحتمل (${inq.name}).`
                                    : `Initiated direct WhatsApp message with lead (${inq.name}).`,
                                  meta: { channel: 'whatsapp' },
                                },
                                {
                                  id: inq.id,
                                  name: inq.name,
                                  phone: inq.phone,
                                  phoneE164: inq.phoneE164 || undefined,
                                  phoneCountry: inq.phoneCountry || undefined,
                                  visitorCountry: inq.visitorCountry || undefined,
                                  company: inq.company || undefined,
                                  sector: inq.sector,
                                  packageName: inq.packageName || undefined,
                                  budget: inq.budget || undefined,
                                  notes: inq.notes || undefined,
                                  status: inq.status,
                                  createdAt: inq.createdAt,
                                }
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isAr ? 'محادثة واتساب مباشرة' : 'WhatsApp Client'}</span>
                          </a>

                          <a
                            href={`tel:${inq.phoneE164 || inq.phone}`}
                            onClick={() =>
                              logInquiryActivity(
                                inq.id,
                                {
                                  type: 'call',
                                  text: isAr
                                    ? `تم إجراء اتصال هاتفي مع (${inq.name}) على رقم ${inq.phoneE164 || inq.phone}.`
                                    : `Placed phone call to (${inq.name}) at ${inq.phoneE164 || inq.phone}.`,
                                  meta: { channel: 'phone' },
                                },
                                {
                                  id: inq.id,
                                  name: inq.name,
                                  phone: inq.phone,
                                  phoneE164: inq.phoneE164 || undefined,
                                  phoneCountry: inq.phoneCountry || undefined,
                                  visitorCountry: inq.visitorCountry || undefined,
                                  company: inq.company || undefined,
                                  sector: inq.sector,
                                  packageName: inq.packageName || undefined,
                                  budget: inq.budget || undefined,
                                  notes: inq.notes || undefined,
                                  status: inq.status,
                                  createdAt: inq.createdAt,
                                }
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors dir-ltr"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono">{inq.phoneE164 || inq.phone}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedEntityForActivityLogId(inq.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                          >
                            <Activity className="w-3.5 h-3.5 text-amber-600" />
                            <span>{isAr ? 'سجل النشاط' : 'Activity Log'}</span>
                            <span className="px-1.5 py-0.2 text-[10px] bg-white text-amber-800 border border-amber-200 rounded-full font-black">
                              {inq.clientNotes?.length || 0}
                            </span>
                          </button>
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
        {canAccessTab('clients') && activeTab === 'clients' && (
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

              {/* Card 2: Total Estimated MRR (Financial Access) OR Active Team Tasks */}
              {canViewFinancials ? (
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
                    {isAr ? 'أتعاب الباقات الشهرية (بدون الرصيد الإعلاني)' : 'Monthly Retainer Fees (excl. Ad Credit)'}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => canAccessTab('tasks') && setActiveTab('tasks')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200 hover:border-indigo-400 shadow-2xs space-y-1 text-start cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{isAr ? 'مهام الفريق المفتوحة' : 'Open Team Tasks'}</span>
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-indigo-950 tabular-nums">
                    {activeTeamTasksCount}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-bold">
                    {isAr ? 'اضغط لفتح لوحة مهام اليوم ←' : 'Open Team Tasks Hub →'}
                  </div>
                </button>
              )}

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
            {/* RENEWAL RADAR BANNER (OVERDUE OR DUE WITHIN 5 DAYS)             */}
            {/* =============================================================== */}
            {renewalRadarClients.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50/90 to-rose-50/80 border border-amber-300/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                      <BellRing className="w-4 h-4 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-amber-950">
                        {isAr
                          ? `رادار استحقاق التجديد خلال 5 أيام (${renewalRadarClients.length} عملاء)`
                          : `Renewal Radar — Due Within 5 Days (${renewalRadarClients.length} clients)`}
                      </h3>
                      <p className="text-[11px] text-amber-800">
                        {isAr
                          ? 'عملاء اقترب أو حان موعد تجديد اشتراكهم الشهري — أرسل تذكير واتساب أو أغلق الدورة بضغطة واحدة.'
                          : 'Clients approaching or past their monthly renewal date — send a 1-click WhatsApp reminder or renew cycle.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {renewalRadarClients.map(({ client, daysUntil, renewalDate }) => {
                    const isLate = daysUntil < 0;
                    const isToday = daysUntil === 0;
                    return (
                      <div
                        key={client.id}
                        className="bg-white/95 rounded-xl p-3 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {client.company || client.name}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isLate
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isToday
                                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {isLate
                                ? isAr
                                  ? `متأخر ${Math.abs(daysUntil)} يوم`
                                  : `${Math.abs(daysUntil)}d overdue`
                                : isToday
                                ? isAr
                                  ? 'يستحق اليوم'
                                  : 'Due Today'
                                : isAr
                                ? `متبقي ${daysUntil} أيام`
                                : `In ${daysUntil} days`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700">{client.packageName}</span>
                            <span>•</span>
                            <span className="font-mono">{renewalDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={getRenewalReminderWhatsAppHref(client, renewalDate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              logInquiryActivity(
                                client.id,
                                {
                                  type: 'whatsapp',
                                  text: isAr
                                    ? `تم إرسال تذكير تجديد الباقة عبر واتساب (موعد التجديد: ${renewalDate}).`
                                    : `Sent WhatsApp subscription renewal reminder (due: ${renewalDate}).`,
                                  meta: { channel: 'whatsapp' },
                                },
                                client
                              );
                              showNotice(
                                isAr
                                  ? `تم فتح تذكير التجديد لـ ${client.company || client.name} وتسجيل المتابعة.`
                                  : `Renewal reminder opened and logged for ${client.company || client.name}.`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{isAr ? 'تذكير تجديد واتساب' : 'WA Renewal'}</span>
                          </a>

                          {canViewFinancials && (
                            <button
                              type="button"
                              onClick={() => {
                                setClientDrawerInitialTab('billing');
                                setSelectedClientForAccount(client);
                                setIsClientAccountOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black inline-flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-400" />
                              <span>{isAr ? 'إغلاق / تجديد' : 'Renew'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {canAccessTab('invoices') && canViewFinancials && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/90 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'أرشيف الفواتير وكشوف الحساب' : 'Invoices & Statements'}</span>
                  </button>
                )}

                {canEditClients && (
                  <button
                    type="button"
                    onClick={() => setIsAddClientOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة عميل وتحديد باقة' : 'Add Client & Scope'}</span>
                  </button>
                )}

                {canDeleteRecords && (contractedClients.length > 0 || (data.invoices?.length || 0) > 0) && (
                  <button
                    type="button"
                    onClick={handleRequestClearAllCrm}
                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    title={isAr ? 'تفريغ الطلبات والعملاء والفواتير من النظام والداتابيز' : 'Clear All CRM & DB'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isAr ? 'تفريغ السجلات' : 'Clear All'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Centralized Accountant Approval Queue for Ad Wallet Requests */}
            {canApproveAdWallet && (
              <AdWalletApprovalsBanner
                clients={contractedClients}
                reviewerName={activeTeamMember?.name || (isAr ? 'المحاسب / الإدارة المالية' : 'Accountant')}
                isAr={isAr}
                onNotify={(msg) => showNotice(msg)}
                onOpenClientWallet={(targetClient) => {
                  setClientDrawerInitialTab('ad_wallet');
                  setSelectedClientForAccount(targetClient);
                  setIsClientAccountOpen(true);
                }}
              />
            )}

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
                {contractedClients.length === 0 && canEditClients && (
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
                              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                                  <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span>
                                    {formatOperationCycleBadge(
                                      client.contractStartDate || client.createdAt,
                                      client.billingCycle || 'monthly',
                                      isAr
                                    )}
                                  </span>
                                </span>
                              </div>
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

                        {/* Client Ad Spend Wallet Strip (Media Buyer + Accountant + Admin) */}
                        {canAccessAdWallet &&
                          (canManageAdWallet ||
                            (client.adCreditBalance !== undefined && client.adCreditBalance > 0) ||
                            (client.pendingInvoiceAdCredit !== undefined && client.pendingInvoiceAdCredit > 0) ||
                            (client.adWalletRequests || []).some((r) => r.status === 'pending')) && (() => {
                            const pendingAdReqsCount = (client.adWalletRequests || []).filter(
                              (r) => r.status === 'pending'
                            ).length;
                            const availableAd = client.adCreditBalance ?? 0;
                            const pendingInvAd = client.pendingInvoiceAdCredit ?? 0;
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setClientDrawerInitialTab('ad_wallet');
                                  setSelectedClientForAccount(client);
                                  setIsClientAccountOpen(true);
                                }}
                                className="w-full text-start mb-3 p-2.5 rounded-xl bg-purple-50/90 hover:bg-purple-100/80 border border-purple-200/90 hover:border-purple-300 flex items-center justify-between text-xs gap-2 transition-colors cursor-pointer"
                                title={
                                  isAr
                                    ? 'افتح محفظة الإعلانات الممولة (إضافة رصيد / تسجيل مصروف / موافقات)'
                                    : 'Open Client Ad Spend Wallet'
                                }
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-purple-950">
                                      {isAr ? 'رصيد إعلاني متاح:' : 'Available Ad Credit:'}{' '}
                                      <span className="font-black text-purple-700 tabular-nums">
                                        {availableAd.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                                      </span>
                                    </span>
                                    {pendingInvAd > 0 && (
                                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 tabular-nums">
                                        {isAr ? 'قيد التحصيل بالفاتورة:' : 'Pending Invoice:'}{' '}
                                        {pendingInvAd.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                                      </span>
                                    )}
                                    {pendingAdReqsCount > 0 && (
                                      <span className="text-[10px] font-black text-orange-900 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                        {isAr
                                          ? `⏳ ${pendingAdReqsCount} بانتظار موافقة المحاسب`
                                          : `⏳ ${pendingAdReqsCount} Pending Approval`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-purple-700 font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs shrink-0">
                                  {isAr ? 'محفظة الإعلانات الممولة' : 'Ad Wallet'}
                                </span>
                              </button>
                            );
                          })()}

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
                            reelsTarget={targetR}
                            reelStages={client.reelStages}
                            reelsDelivered={deliveredR}
                            onToggleReelStage={(reelId) => handleToggleClientReelStage(client, reelId)}
                            carriedOverReels={client.carriedOverReels}
                            onToggleCarriedOverReel={(carryId) => handleToggleClientCarriedOverReel(client, carryId)}
                            currentCycleLabel={formatOperationCycleBadge(
                              client.contractStartDate || client.createdAt,
                              client.billingCycle || 'monthly',
                              isAr
                            )}
                            teamMembers={agencyTeamMembers}
                            allowedStageIds={effectivePermissions.allowedWorkflowStages}
                            canToggleReels={effectivePermissions.canUpdateReelsTrack !== false}
                            canAssignTasks={effectivePermissions.canAssignTasks !== false}
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
                            onClick={() =>
                              logInquiryActivity(
                                client.id,
                                {
                                  type: 'whatsapp',
                                  text: isAr
                                    ? `تم فتح محادثة واتساب مع العميل المتعاقد (${client.company || client.name}).`
                                    : `Initiated WhatsApp chat with client (${client.company || client.name}).`,
                                  meta: { channel: 'whatsapp' },
                                },
                                client
                              )
                            }
                            className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${client.phone}`}
                            onClick={() =>
                              logInquiryActivity(
                                client.id,
                                {
                                  type: 'call',
                                  text: isAr
                                    ? `تم إجراء اتصال هاتفي مع العميل (${client.company || client.name}) على ${client.phone}.`
                                    : `Placed phone call to client (${client.company || client.name}) at ${client.phone}.`,
                                  meta: { channel: 'phone' },
                                },
                                client
                              )
                            }
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Client Activity Log Shortcut Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setClientDrawerInitialTab('notes');
                              setSelectedClientForAccount(client);
                              setIsClientAccountOpen(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                            title={isAr ? 'فتح سجل النشاط والتفاعلات والملاحظات' : 'Open Client Activity Log'}
                          >
                            <Activity className="w-3.5 h-3.5 text-amber-600" />
                            <span>{isAr ? 'السجل' : 'Log'}</span>
                            <span className="px-1.5 py-0.2 text-[10px] bg-white text-amber-800 border border-amber-200 rounded-full font-black">
                              {client.clientNotes?.length || 0}
                            </span>
                          </button>

                          {/* Dedicated Download Invoice Button (Financial Access Only) */}
                          {canViewFinancials && (
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
                          )}

                          {/* Close Month / Start New Cycle Shortcut Button (Admin, Finance, AM, and Content Creator when monthly tasks complete) */}
                          {canStartNewCycle && (() => {
                            const stages =
                              client.workflowStages && client.workflowStages.length === 5
                                ? client.workflowStages
                                : DEFAULT_WORKFLOW_STAGES;
                            const doneStagesCount = stages.filter((s) => s.status === 'completed').length;
                            const allDone = doneStagesCount === stages.length;
                            const canClickNow = canViewFinancials || canEditClients || allDone;
                            return (
                              <button
                                type="button"
                                disabled={!canClickNow}
                                onClick={() => {
                                  setClientDrawerInitialTab(canViewFinancials ? 'billing' : 'overview');
                                  setAutoOpenCloseCycle(true);
                                  setSelectedClientForAccount(client);
                                  setIsClientAccountOpen(true);
                                }}
                                className={`px-2.5 py-1.5 text-xs font-bold border rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 ${
                                  canClickNow
                                    ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200/90 cursor-pointer'
                                    : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
                                }`}
                                title={
                                  canClickNow
                                    ? isAr
                                      ? 'إغلاق الشهر الحالي وبدء دورة جديدة'
                                      : 'Close Month & Start New Cycle'
                                    : isAr
                                    ? `متاح فور اكتمال مهام الشهر الأساسية (${doneStagesCount}/${stages.length})`
                                    : `Available once monthly tasks complete (${doneStagesCount}/${stages.length})`
                                }
                              >
                                <RotateCcw className={`w-3.5 h-3.5 ${canClickNow ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span>
                                  {isAr
                                    ? canClickNow
                                      ? 'دورة جديدة'
                                      : `دورة جديدة (${doneStagesCount}/5)`
                                    : canClickNow
                                    ? 'New Cycle'
                                    : `New Cycle (${doneStagesCount}/5)`}
                                </span>
                              </button>
                            );
                          })()}

                          {/* Edit Client & Package Button */}
                          {canEditClients && (
                            <button
                              type="button"
                              onClick={() => {
                                setClientDrawerInitialTab('profile');
                                setSelectedClientForAccount(client);
                                setIsClientAccountOpen(true);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                              title={isAr ? 'تعديل بيانات العميل والباقة' : 'Edit Client & Package'}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>{isAr ? 'تعديل' : 'Edit'}</span>
                            </button>
                          )}

                          {/* Delete Client Button */}
                          {canDeleteRecords && (
                            <button
                              type="button"
                              onClick={() => setClientPendingDelete(client)}
                              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 rounded-xl transition-colors cursor-pointer"
                              title={isAr ? 'حذف العميل نهائياً' : 'Delete Client'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setClientDrawerInitialTab('overview');
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
        {/* TAB: TODAY'S TASKS & TEAM WORKLOAD HUB                             */}
        {/* ================================================================== */}
        {canAccessTab('tasks') && activeTab === 'tasks' && (
          <TeamTasksHub
            clients={contractedClients}
            isAr={isAr}
            userRole={effectiveRole}
            permissions={effectivePermissions}
            currentMemberName={activeTeamMember?.name}
            onOpenTeamAccounts={
              canManageTeam ? () => setIsTeamAccountsModalOpen(true) : undefined
            }
            onOpenClient={(client) => {
              setClientDrawerInitialTab('overview');
              setSelectedClientForAccount(client);
              setIsClientAccountOpen(true);
            }}
          />
        )}

        {/* ================================================================== */}
        {/* TAB: INVOICES ARCHIVE & ACCOUNT STATEMENTS                         */}
        {/* ================================================================== */}
        {canAccessTab('invoices') && activeTab === 'invoices' && (
          <div className="space-y-4">
            {canApproveAdWallet && (
              <AdWalletApprovalsBanner
                clients={contractedClients}
                reviewerName={activeTeamMember?.name || (isAr ? 'المحاسب / الإدارة المالية' : 'Accountant')}
                isAr={isAr}
                onNotify={(msg) => showNotice(msg)}
                onOpenClientWallet={(targetClient) => {
                  setClientDrawerInitialTab('ad_wallet');
                  setSelectedClientForAccount(targetClient);
                  setIsClientAccountOpen(true);
                }}
              />
            )}
            <InvoicesArchiveHub
              isAr={isAr}
              actorName={activeTeamMember?.name || (isAr ? 'المدير العام (Admin)' : 'General Manager (Admin)')}
            />
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB: AGENCY EXPENSES & NET PROFIT HUB                              */}
        {/* ================================================================== */}
        {canAccessTab('expenses') && activeTab === 'expenses' && (
          <ExpensesProfitHub
            isAr={isAr}
            actorName={activeTeamMember?.name || (isAr ? 'المدير العام (Admin)' : 'General Manager (Admin)')}
          />
        )}

        {/* ================================================================== */}
        {/* TAB: GLOBAL CRM ACTIVITY LOG & INTERACTIONS TIMELINE               */}
        {/* ================================================================== */}
        {canAccessTab('activity') && activeTab === 'activity' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'إجمالي الأنشطة المسجلة' : 'Total Logged Activities'}
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block tabular-nums">
                  {activitySummaryStats.total}
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-amber-700 block">
                  {isAr ? 'تغييرات الحالة' : 'Status Transitions'}
                </span>
                <span className="text-2xl font-black text-amber-800 mt-1 block tabular-nums">
                  {activitySummaryStats.status}
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-700 block">
                  {isAr ? 'المكالمات والواتساب والاجتماعات' : 'Calls, WhatsApp & Meetings'}
                </span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block tabular-nums">
                  {activitySummaryStats.interactions}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600 block">
                  {isAr ? 'الملاحظات والتحديثات' : 'Notes & Updates'}
                </span>
                <span className="text-2xl font-black text-slate-800 mt-1 block tabular-nums">
                  {activitySummaryStats.notes}
                </span>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-sky-700 block">
                  {isAr ? 'الفواتير والمخرجات والمهام' : 'Billing & Workflow'}
                </span>
                <span className="text-2xl font-black text-sky-800 mt-1 block tabular-nums">
                  {activitySummaryStats.billing + activitySummaryStats.workflow}
                </span>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder={
                      isAr
                        ? 'ابحث باسم العميل، الشركة، تفاصيل المكالمة، الملاحظة أو المسؤول...'
                        : 'Search by lead/client, company, author, or activity details...'
                    }
                    className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {(
                    [
                      { id: 'all', ar: 'جميع السجلات', en: 'All Entities' },
                      { id: 'leads', ar: 'الطلبات والعملاء المحتملين', en: 'Leads Only' },
                      { id: 'clients', ar: 'العملاء المتعاقدين', en: 'Contracted Clients' },
                    ] as const
                  ).map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setActivityEntityFilter(scope.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        activityEntityFilter === scope.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isAr ? scope.ar : scope.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                {(
                  [
                    { id: 'all', ar: 'كل الأنشطة', en: 'All Activities', count: activitySummaryStats.total },
                    { id: 'status', ar: 'تغييرات الحالة', en: 'Status Changes', count: activitySummaryStats.status },
                    { id: 'interactions', ar: 'التفاعلات (مكالمات / واتساب)', en: 'Interactions', count: activitySummaryStats.interactions },
                    { id: 'notes', ar: 'الملاحظات والتعديلات', en: 'Notes', count: activitySummaryStats.notes },
                    { id: 'billing', ar: 'الفواتير والمدفوعات', en: 'Billing', count: activitySummaryStats.billing },
                    { id: 'workflow', ar: 'سير العمل والمخرجات', en: 'Workflow', count: activitySummaryStats.workflow },
                  ] as const
                ).map((bucket) => (
                  <button
                    key={bucket.id}
                    type="button"
                    onClick={() => setActivityBucketFilter(bucket.id)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      activityBucketFilter === bucket.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isAr ? bucket.ar : bucket.en}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activityBucketFilter === bucket.id
                          ? 'bg-slate-950/15 text-slate-950'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {bucket.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chronological Activity Timeline Feed */}
            {filteredGlobalActivityFeed.length === 0 ? (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
                <Activity className="w-11 h-11 text-slate-300 mx-auto" />
                <h5 className="text-sm font-bold text-slate-700">
                  {isAr ? 'لا توجد أنشطة مطابقة للتصفية الحالية' : 'No matching activities found'}
                </h5>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'جرّب تعديل كلمات البحث أو الفلتر، أو افتح أي عميل/طلب لإضافة ملاحظة أو تفاعل جديد.'
                    : 'Adjust your filters or open any lead/client to record an interaction or note.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGlobalActivityFeed.map((item) => {
                  const meta = getActivityTypeMeta(item.entry.type, isAr);
                  const IconComponent = meta.Icon;
                  const statusBadgeLabel =
                    item.entityStatus === 'closed'
                      ? (isAr ? 'عميل متعاقد' : 'Contracted')
                      : item.entityStatus === 'contacted'
                      ? (isAr ? 'قيد التواصل' : 'Contacted')
                      : item.entityStatus === 'cancelled'
                      ? (isAr ? 'ملغي' : 'Cancelled')
                      : (isAr ? 'طلب جديد' : 'New Lead');

                  return (
                    <div
                      key={`${item.entityId}-${item.entry.id}`}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBg}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${meta.badgeClass}`}>
                              {meta.label}
                            </span>

                            <span className="text-xs font-black text-slate-900">
                              {item.entityCompany || item.entityName}
                            </span>

                            {item.entityCompany && (
                              <span className="text-[11px] text-slate-500">({item.entityName})</span>
                            )}

                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                item.isClient
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.entityStatus === 'contacted'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : item.entityStatus === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {statusBadgeLabel}
                            </span>

                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 uppercase">
                              {item.entitySector}
                            </span>
                          </div>

                          {(item.entry.meta?.fromStatus || item.entry.meta?.toStatus) && (
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                              {item.entry.meta?.fromStatus && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200 line-through decoration-slate-400">
                                  {item.entry.meta.fromStatus}
                                </span>
                              )}
                              {item.entry.meta?.fromStatus && item.entry.meta?.toStatus && (
                                <ArrowRight className={`w-3.5 h-3.5 text-amber-600 ${isAr ? 'rotate-180' : ''}`} />
                              )}
                              {item.entry.meta?.toStatus && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black border border-emerald-200">
                                  {item.entry.meta.toStatus}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                            {item.entry.text}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400">
                            {item.entry.author && (
                              <span className="font-semibold text-slate-600">
                                {isAr ? `بواسطة: ${item.entry.author}` : `By: ${item.entry.author}`}
                              </span>
                            )}
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(item.entry.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.isClient && item.fullClient) {
                              setClientDrawerInitialTab('notes');
                              setSelectedClientForAccount(item.fullClient);
                              setIsClientAccountOpen(true);
                            } else {
                              setSelectedEntityForActivityLogId(item.entityId);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 text-amber-600" />
                          <span>{item.isClient ? (isAr ? 'فتح سجل العميل' : 'Open Client Log') : (isAr ? 'فتح سجل الطلب' : 'Open Lead Log')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB: DEDICATED ANALYTICS, TRAFFIC & SALES HUB                      */}
        {/* ================================================================== */}
        {/* ================================================================== */}
        {canAccessTab('analytics') && activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CrmAnalyticsHub
              inquiries={activeInquiriesList}
              invoices={data.invoices || []}
              expenses={data.expenses || []}
              packages={data.packages}
              isAr={isAr}
            />
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: PACKAGES, PRICING & PROMO CODES HUB                         */}
        {/* ================================================================== */}
        {canAccessTab('packages') && activeTab === 'packages' && (
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
                                  setPendingConfirmAction({
                                    title: isAr ? 'تأكيد حذف كود الخصم' : 'Confirm Promo Deletion',
                                    message: isAr
                                      ? `هل أنت متأكد من حذف كود الخصم (${promo.code})؟`
                                      : `Delete promo code ${promo.code}?`,
                                    confirmLabel: isAr ? 'نعم، احذف الكود' : 'Delete Code',
                                    onConfirm: () => {
                                      deletePromoCode(promo.id);
                                      showNotice(isAr ? 'تم حذف كود الخصم بنجاح.' : 'Promo code deleted.');
                                    },
                                  });
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
        {canAccessTab('projects') && activeTab === 'projects' && (
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
        {canAccessTab('banner') && activeTab === 'banner' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{isAr ? 'شريط العروض والخصومات' : 'Global Promo Banner'}</h3>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-200 text-sky-900 rounded">{data.banner.tag}</span>
              <p className="text-xs text-slate-700">{data.banner.text}</p>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: BACKUP, SUPABASE CLOUD SYNC & SQL MIGRATION                 */}
        {/* ================================================================== */}
        {canAccessTab('backup') && activeTab === 'backup' && (
          <div className="space-y-6">
            {/* Supabase Cloud Persistence Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
              <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <span>
                      {isAr
                        ? 'مزامنة وحفظ البيانات السحابي (Supabase PostgreSQL)'
                        : 'Cloud Persistence & Migration (Supabase PostgreSQL)'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'يحفظ حسابات العملاء المتعاقدين، أرشيف الفواتير، أرصدة الإعلانات، مراحل التنفيذ، والباقات مباشرة في Supabase حتى لا تتأثر بأي Publish مستقبلي.'
                      : 'Persists CRM client accounts, invoices archive, ad wallets, workflow stages, and public catalog directly to Supabase across deployments.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      supabaseMigrationNeeded
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : cloudSyncStatus === 'synced'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isSupabaseConfigured
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        supabaseMigrationNeeded
                          ? 'bg-amber-500 animate-pulse'
                          : cloudSyncStatus === 'synced'
                          ? 'bg-emerald-500'
                          : isSupabaseConfigured
                          ? 'bg-sky-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span>
                      {supabaseMigrationNeeded
                        ? isAr ? 'بانتظار تشغيل كود SQL في Supabase' : 'SQL Migration Required'
                        : cloudSyncStatus === 'synced'
                        ? isAr ? 'متزامن بالكامل مع Supabase' : 'Synced with Supabase'
                        : isSupabaseConfigured
                        ? isAr ? 'Supabase مهيّأ وجاهز للمزامنة' : 'Supabase Ready'
                        : isAr ? 'وضع محلي (بيئة تطوير بدون مفاتيح Supabase)' : 'Local Dev Mode'}
                    </span>
                  </span>
                </div>
              </div>

              {supabaseMigrationNeeded && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="font-black flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isAr
                        ? 'مطلوب خطوة واحدة لمرة واحدة: تنفيذ كود الترحيل SQL داخل Supabase'
                        : 'One-time setup required: Execute SQL migration in Supabase SQL Editor'}
                    </span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {isAr
                      ? 'قم بنسخ كود الـ SQL بالأسفل وتشغيله مرة واحدة داخل Supabase ← SQL Editor، ثم اضغط على زر "رفع ومزامنة كافة البيانات الحالية إلى Supabase".'
                      : 'Copy the SQL script below, run it once inside Supabase Dashboard -> SQL Editor, then click "Sync All Current Data to Supabase".'}
                  </p>
                </div>
              )}

              {cloudSyncFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    cloudSyncFeedback.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {cloudSyncFeedback.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{cloudSyncFeedback.msg}</span>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={isCloudMigrating}
                  onClick={async () => {
                    setIsCloudMigrating(true);
                    setCloudSyncFeedback(null);
                    const res = await syncNowToSupabase();
                    setIsCloudMigrating(false);
                    if (res.success) {
                      setCloudSyncFeedback({
                        ok: true,
                        msg: isAr
                          ? `تم ترحيل وحفظ (${res.clientsSynced}) عميل و (${res.invoicesSynced}) فاتورة وإعدادات الموقع في Supabase بنجاح!`
                          : `Synced ${res.clientsSynced} clients, ${res.invoicesSynced} invoices, and catalog to Supabase!`,
                      });
                    } else {
                      setCloudSyncFeedback({
                        ok: false,
                        msg: res.migrationNeeded
                          ? isAr
                            ? 'الجداول الجديدة غير موجودة بعد في Supabase. يرجى تشغيل كود الترحيل SQL بالأسفل أولاً ثم إعادة المحاولة.'
                            : 'Tables missing in Supabase. Run the SQL migration below first.'
                          : res.error || (isAr ? 'تعذر إتمام المزامنة مع Supabase' : 'Cloud sync failed'),
                      });
                    }
                  }}
                  className="px-4 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {isCloudMigrating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  <span>
                    {isAr
                      ? 'رفع ومزامنة كافة البيانات الحالية إلى Supabase'
                      : 'Sync & Migrate All Data to Supabase'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await refreshFromSupabase();
                    showNotice(isAr ? 'تم تحديث البيانات من Supabase بنجاح!' : 'Refreshed data from Supabase!');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سحب أحدث البيانات من Supabase' : 'Pull Latest from Supabase'}</span>
                </button>

                {lastCloudSyncAt && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isAr ? 'آخر مزامنة:' : 'Last sync:'}{' '}
                    {new Date(lastCloudSyncAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                )}
              </div>

              {/* SQL Migration Viewer & One-Click Copy/Download */}
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 space-y-3 border border-slate-800">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-xs font-black text-emerald-400 block">
                      {isAr
                        ? 'كود الترحيل SQL (20261117000001_crm_full_persistence.sql)'
                        : 'PostgreSQL Migration Script (20261117000001_crm_full_persistence.sql)'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isAr
                        ? 'انسخ هذا الكود ونفّذه داخل Supabase Dashboard ← SQL Editor لإنشاء جداول الفواتير وحسابات العملاء.'
                        : 'Copy and run inside Supabase Dashboard -> SQL Editor to create persistent CRM & Invoice tables.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(crmFullMigrationSql);
                        setSqlCopied(true);
                        setTimeout(() => setSqlCopied(false), 2500);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{sqlCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود SQL' : 'Copy SQL')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([crmFullMigrationSql], { type: 'text/sql' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = '20261117000001_crm_full_persistence.sql';
                        a.click();
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تحميل .sql' : 'Download .sql'}</span>
                    </button>
                  </div>
                </div>

                <pre
                  dir="ltr"
                  className="text-[11px] font-mono text-emerald-200/90 bg-slate-900/90 p-3 rounded-lg border border-slate-800 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed"
                >
                  {crmFullMigrationSql}
                </pre>
              </div>
            </div>

            {/* JSON Backup & Restore Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">{isAr ? 'النسخ الاحتياطي السريع (ملف JSON)' : 'Quick Local Backup (JSON)'}</h3>
                <p className="text-xs text-slate-500">{isAr ? 'تصدير أو استيراد كامل بيانات العملاء والفواتير والإعدادات كنسخة احتياطية إضافية على جهازك.' : 'Export and import website state JSON as an extra offline backup.'}</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
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

                <label className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAr ? 'استيراد نسخة احتياطية JSON' : 'Import Backup JSON'}</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const content = ev.target?.result;
                        if (typeof content === 'string' && importDataJson(content)) {
                          showNotice(isAr ? 'تم استيراد النسخة الاحتياطية بنجاح! يمكنك الآن مزامنتها مع Supabase.' : 'Backup imported successfully!');
                        } else {
                          setCloudSyncFeedback({
                            ok: false,
                            msg: isAr ? 'ملف JSON غير صالح.' : 'Invalid JSON backup file.',
                          });
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Clean Slate / Empty CRM & Database Card */}
            <div className="bg-rose-50/60 p-6 rounded-2xl border border-rose-200 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 max-w-2xl">
                  <h3 className="text-sm font-black text-rose-950 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>
                      {isAr
                        ? 'تفريغ بيانات التجارب (الطلبات والعملاء والفواتير) للبدء ببيانات حقيقية'
                        : 'Reset CRM Workspace (Empty Inquiries, Clients & Invoices in DB)'}
                    </span>
                  </h3>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {isAr
                      ? 'يمسح جميع الطلبات والاستشارات، العملاء والتعاقدات، وأرشيف الفواتير وسجلات النشاط من المتصفح والسيرفر وقاعدة بيانات Supabase بالكامل لتبدأ إدخال بياناتك الحقيقية على نظافة — مع الحفاظ على الباقات ودراسات الحالة وإعدادات الموقع كما هي.'
                      : 'Permanently empties inquiries, contracted clients, and invoices across browser state, server storage, and Supabase PostgreSQL so you can start entering real production data. Packages and Case Studies remain untouched.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestClearAllCrm}
                  className="px-4 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isAr ? 'تفريغ الطلبات والعملاء والفواتير من الداتابيز' : 'Empty All CRM & Database'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Digital Effect Enterprise Administration Portal • Phase 2 Full Supabase Cloud Persistence
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
        defaultStatus={activeTab === 'clients' ? 'closed' : 'new'}
        onClose={() => setIsAddClientOpen(false)}
        onClientAdded={(newClient) => {
          if (newClient.status === 'closed') {
            setClientSectorFilter('all');
            setClientStatusFilter('all');
            setWorkflowTaskFilter('all');
            setWorkflowStageFilter('all');
            setClientSearchQuery('');
            setActiveTab('clients');
            showNotice(
              isAr
                ? `تم التعاقد! تم تسجيل العميل (${newClient.name}) ونقله إلى قسم العملاء والتعاقدات بنجاح.`
                : `Contract closed! Client (${newClient.name}) added and moved to Clients & Contracts.`
            );
          } else {
            showNotice(
              isAr 
                ? `تم تسجيل العميل (${newClient.name}) وتحديد باقة (${newClient.packageName}) بنجاح!` 
                : `Client (${newClient.name}) assigned to (${newClient.packageName}) successfully!`
            );
          }
          if (isSupabaseConfigured && sessionUser) {
            loadInquiries();
          }
        }}
      />

      {/* Client Account Drawer / Follow-up Profile */}
      <ClientAccountDrawer
        client={
          selectedClientForAccount
            ? (data.inquiries || []).find((i) => i.id === selectedClientForAccount.id) || selectedClientForAccount
            : null
        }
        isOpen={isClientAccountOpen}
        initialTab={clientDrawerInitialTab}
        autoOpenCloseCycle={autoOpenCloseCycle}
        userRole={effectiveRole}
        rolePreset={activeTeamMember?.rolePreset}
        permissions={effectivePermissions}
        currentMemberName={activeTeamMember?.name}
        onClose={() => {
          setIsClientAccountOpen(false);
          setSelectedClientForAccount(null);
          setClientDrawerInitialTab('overview');
          setAutoOpenCloseCycle(false);
        }}
        onClientUpdated={(updated) => {
          setSelectedClientForAccount(updated);
          setCloudInquiries((prev) =>
            prev.map((inq) =>
              inq.id === updated.id
                ? {
                    ...inq,
                    raw_client_name: updated.name,
                    raw_client_phone: updated.phone,
                    raw_client_company: updated.company || null,
                    raw_package_name: updated.packageName || null,
                    budget: updated.budget || null,
                    sector: updated.sector,
                    notes: updated.notes || null,
                  }
                : inq
            )
          );
          showNotice(isAr ? 'تم تحديث بيانات العميل والباقة بنجاح!' : 'Client account updated successfully!');
        }}
        onClientDeleted={(deletedId) => {
          setCloudInquiries((prev) => prev.filter((inq) => inq.id !== deletedId));
          setSelectedClientForAccount(null);
          setIsClientAccountOpen(false);
          showNotice(isAr ? 'تم حذف العميل من النظام نهائياً.' : 'Client deleted permanently.');
        }}
      />

      {/* Admin Modal: Team Accounts (Username & Password) & Open Screen Permissions */}
      {realRole === 'admin' && (
        <TeamAccountsModal
          isOpen={isTeamAccountsModalOpen}
          onClose={() => setIsTeamAccountsModalOpen(false)}
          isAr={isAr}
          onPreviewMember={(member) => {
            setPreviewTeamMemberId(member.id);
            const firstTab =
              resolveMemberPermissions(member).allowedTabs[0] || 'tasks';
            setActiveTab(firstTab);
            showNotice(
              isAr
                ? `تم تفعيل معاينة حساب «${member.name}» (${member.roleTitle}).`
                : `Now previewing dashboard as "${member.name}" (${member.roleTitle}).`
            );
          }}
        />
      )}

      {/* Delete Client Confirmation Modal (from Clients Cards) */}
      {clientPendingDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isDeletingClientCard && setClientPendingDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  {isAr ? 'تأكيد حذف العميل نهائياً' : 'Confirm Client Deletion'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr
                    ? `هل أنت متأكد من حذف العميل "${clientPendingDelete.company || clientPendingDelete.name}"؟ سيتم مسح ملف العميل وبيانات الباقة من لوحة التحكم وقاعدة بيانات Supabase.`
                    : `Permanently remove "${clientPendingDelete.company || clientPendingDelete.name}" from CRM and Supabase?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingClientCard}
                onClick={() => setClientPendingDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingClientCard}
                onClick={async () => {
                  const targetId = clientPendingDelete.id;
                  setIsDeletingClientCard(true);
                  try {
                    deleteInquiry(targetId);
                    if (isSupabaseConfigured && sessionUser) {
                      await deleteInquiryFromDb(targetId);
                    }
                    setCloudInquiries((prev) => prev.filter((inq) => inq.id !== targetId));
                    setClientPendingDelete(null);
                    showNotice(isAr ? 'تم حذف العميل نهائياً.' : 'Client deleted permanently.');
                  } finally {
                    setIsDeletingClientCard(false);
                  }
                }}
                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeletingClientCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isAr ? 'نعم، احذف العميل' : 'Yes, Delete Client'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified In-App Confirmation Modal (Iframe-safe replacement for window.confirm) */}
      {pendingConfirmAction && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isConfirmActionLoading && setPendingConfirmAction(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  {pendingConfirmAction.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pendingConfirmAction.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isConfirmActionLoading}
                onClick={() => setPendingConfirmAction(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isConfirmActionLoading}
                onClick={async () => {
                  setIsConfirmActionLoading(true);
                  try {
                    await pendingConfirmAction.onConfirm();
                    setPendingConfirmAction(null);
                  } finally {
                    setIsConfirmActionLoading(false);
                  }
                }}
                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isConfirmActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{pendingConfirmAction.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase RLS Clear Helper Modal (shown only if Supabase RLS blocks client-side DELETE) */}
      {rlsClearHelpModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setRlsClearHelpModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    {isAr
                      ? 'إفراغ السجلات المتبقية من Supabase (صلاحيات RLS)'
                      : 'Complete Supabase Wipe (RLS Policy Required)'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rlsClearHelpModal.error}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRlsClearHelpModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 space-y-3 border border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-400">
                  {isAr
                    ? 'انسخ هذا الكود وشغّله مرة واحدة في Supabase Dashboard → SQL Editor:'
                    : 'Copy & run once in Supabase Dashboard -> SQL Editor:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sqlSnippet = `DELETE FROM public.client_invoices;\nDELETE FROM public.crm_client_accounts;\nDELETE FROM public.inquiries;\nDELETE FROM public.customers;\n\nCREATE POLICY "Authenticated admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (true);\nCREATE POLICY "Authenticated admins delete crm_client_accounts" ON public.crm_client_accounts FOR DELETE TO authenticated USING (true);`;
                    navigator.clipboard?.writeText(sqlSnippet);
                    setRlsClearSqlCopied(true);
                    setTimeout(() => setRlsClearSqlCopied(false), 2500);
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {rlsClearSqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{rlsClearSqlCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود SQL' : 'Copy SQL')}</span>
                </button>
              </div>
              <pre dir="ltr" className="text-[11px] font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed select-all">
{`DELETE FROM public.client_invoices;
DELETE FROM public.crm_client_accounts;
DELETE FROM public.inquiries;
DELETE FROM public.customers;`}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  setRlsClearHelpModal(null);
                  await refreshFromSupabase();
                  await loadInquiries();
                }}
                className="px-4 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديث البيانات الآن' : 'Refresh Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Lead / Inquiry Activity Log Modal */}
      {selectedEntityForActivityLog && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedEntityForActivityLogId(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden text-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-black truncate">
                    {isAr
                      ? `سجل النشاط والتفاعلات: ${selectedEntityForActivityLog.company || selectedEntityForActivityLog.name}`
                      : `Activity Log: ${selectedEntityForActivityLog.company || selectedEntityForActivityLog.name}`}
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate">
                    {selectedEntityForActivityLog.name} • {selectedEntityForActivityLog.phoneE164 || selectedEntityForActivityLog.phone} •{' '}
                    {selectedEntityForActivityLog.packageName || (isAr ? 'استشارة عامة' : 'General Consultation')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntityForActivityLogId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lead Quick Status & Contact Actions Strip */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">
                  {isAr ? 'تحديث الحالة:' : 'Status:'}
                </span>
                <select
                  value={selectedEntityForActivityLog.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as 'new' | 'contacted' | 'closed' | 'cancelled';
                    handleStatusChange(selectedEntityForActivityLog.id, nextStatus);
                    if (nextStatus === 'closed') {
                      setSelectedEntityForActivityLogId(null);
                    }
                  }}
                  className="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer"
                >
                  <option value="new">{isAr ? 'جديد (لم يتم الرد)' : 'New'}</option>
                  <option value="contacted">{isAr ? 'قيد التواصل' : 'Contacted'}</option>
                  <option value="closed">{isAr ? 'تم التعاقد (نقل للعملاء)' : 'Closed Deal'}</option>
                  <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {(() => {
                  const cleanDigits = (selectedEntityForActivityLog.phoneE164 || selectedEntityForActivityLog.phone).replace(/\D/g, '');
                  const waPhone = cleanDigits.startsWith('0') ? `20${cleanDigits.slice(1)}` : cleanDigits;
                  return (
                    <>
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                          logInquiryActivity(
                            selectedEntityForActivityLog.id,
                            {
                              type: 'whatsapp',
                              text: isAr
                                ? `تم فتح محادثة واتساب مع (${selectedEntityForActivityLog.name}) من نافذة سجل النشاط.`
                                : `Initiated WhatsApp chat with (${selectedEntityForActivityLog.name}) from Activity Log.`,
                              meta: { channel: 'whatsapp' },
                            },
                            selectedEntityForActivityLog
                          )
                        }
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                      </a>
                      <a
                        href={`tel:${selectedEntityForActivityLog.phoneE164 || selectedEntityForActivityLog.phone}`}
                        onClick={() =>
                          logInquiryActivity(
                            selectedEntityForActivityLog.id,
                            {
                              type: 'call',
                              text: isAr
                                ? `تم إجراء مكالمة هاتفية مع (${selectedEntityForActivityLog.name}) من نافذة سجل النشاط.`
                                : `Placed phone call to (${selectedEntityForActivityLog.name}) from Activity Log.`,
                              meta: { channel: 'phone' },
                            },
                            selectedEntityForActivityLog
                          )
                        }
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isAr ? 'اتصال' : 'Call'}</span>
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Activity Timeline Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <ActivityTimelinePanel
                entries={selectedEntityForActivityLog.clientNotes || []}
                isAr={isAr}
                createdAt={selectedEntityForActivityLog.createdAt}
                initialNotes={selectedEntityForActivityLog.notes}
                maxHeightClass="max-h-[420px]"
                onAddEntry={(entry) => {
                  logInquiryActivity(
                    selectedEntityForActivityLog.id,
                    entry,
                    selectedEntityForActivityLog
                  );
                  showNotice(isAr ? 'تم تسجيل النشاط في سجل العميل بنجاح!' : 'Activity recorded successfully!');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

