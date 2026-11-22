import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { CaseStudy, ServicePackage, Inquiry } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Tag, 
  Briefcase, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Sparkles,
  Inbox,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  ExternalLink,
  Globe,
  Code2,
  AlertCircle,
  Copy,
  UserPlus,
  UserCheck,
  DollarSign,
  Clock,
  Layers,
  AlertTriangle,
  BellRing
} from 'lucide-react';
import { generateCaseStudySeo } from '../lib/seoGenerator';
import { AddClientModal } from './AddClientModal';
import { ClientAccountDrawer } from './ClientAccountDrawer';
import { ClientWorkflowStepper, DEFAULT_WORKFLOW_STAGES, buildReelWorkflowStages } from './ClientWorkflowStepper';
import { ClientPackageDeliverablesCard } from './ClientPackageDeliverablesCard';
import { getClientOverdueStatus, getClientDeliverableTargets } from '../utils/workflowUtils';
import { parseInvoiceAmount } from '../utils/invoicePdfGenerator';

export const AdminPanelModal: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    data, 
    language,
    addCaseStudy, 
    updateCaseStudy, 
    deleteCaseStudy, 
    addPackage, 
    updatePackage, 
    deletePackage,
    updateInquiryStatus,
    updateInquiry,
    deleteInquiry,
    clearAllInquiries,
    updateBanner,
    resetToDefaults,
    exportDataJson,
    importDataJson
  } = useAgencyData();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'inquiries' | 'clients' | 'packages' | 'projects' | 'banner' | 'backup'>('inquiries');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed' | 'cancelled'>('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClientForAccount, setSelectedClientForAccount] = useState<Inquiry | null>(null);
  const [isClientAccountOpen, setIsClientAccountOpen] = useState(false);
  const [clientSectorFilter, setClientSectorFilter] = useState<'all' | 'b2c' | 'b2b' | 'medical'>('all');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'active' | 'renewal_due' | 'paused' | 'completed'>('all');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [workflowTaskFilter, setWorkflowTaskFilter] = useState<'all' | 'in_progress' | 'completed' | 'delayed' | 'overdue'>('all');
  const [workflowStageFilter, setWorkflowStageFilter] = useState<string>('all');

  // Package Form States
  const [packageFilterSector, setPackageFilterSector] = useState<'all' | 'b2b' | 'b2c' | 'medical'>('all');
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgSector, setPkgSector] = useState<'b2b' | 'b2c' | 'medical'>('b2b');
  const [pkgPrice, setPkgPrice] = useState(25000);
  const [pkgOriginalPrice, setPkgOriginalPrice] = useState(30000);
  const [pkgQuarterlyPrice, setPkgQuarterlyPrice] = useState<number | undefined>(undefined);
  const [pkgPostsCount, setPkgPostsCount] = useState<number | undefined>(8);
  const [pkgReelsCount, setPkgReelsCount] = useState<number | undefined>(2);
  const [pkgStoriesCount, setPkgStoriesCount] = useState<number | undefined>(0);
  const [pkgFrequency, setPkgFrequency] = useState<string>('');
  const [pkgHasMonthlyPlan, setPkgHasMonthlyPlan] = useState<boolean>(false);
  const [pkgHasOffer, setPkgHasOffer] = useState(true);
  const [pkgOfferNote, setPkgOfferNote] = useState('خصم ٢٠٪ لفترة محدودة');
  const [pkgIsPopular, setPkgIsPopular] = useState(false);
  const [pkgTagline, setPkgTagline] = useState('');
  const [pkgTaglineEn, setPkgTaglineEn] = useState('');
  const [pkgIdealFor, setPkgIdealFor] = useState('');
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');

  // Project Form States
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projTitleEn, setProjTitleEn] = useState('');
  const [projSector, setProjSector] = useState<'b2b' | 'b2c' | 'medical'>('b2b');
  const [projClient, setProjClient] = useState('');
  const [projClientEn, setProjClientEn] = useState('');
  const [projIndustry, setProjIndustry] = useState('');
  const [projDuration, setProjDuration] = useState('٦ أشهر');
  const [projMetric1Value, setProjMetric1Value] = useState('+300%');
  const [projMetric1Label, setProjMetric1Label] = useState('نمو في المبيعات والطلبات');
  const [projMetric1LabelEn, setProjMetric1LabelEn] = useState('Sales & Deal Growth');
  const [projMetric2Value, setProjMetric2Value] = useState('4.5X');
  const [projMetric2Label, setProjMetric2Label] = useState('العائد الإعلاني ROAS');
  const [projMetric2LabelEn, setProjMetric2LabelEn] = useState('Campaign ROAS');
  const [projChallenge, setProjChallenge] = useState('');
  const [projSolution, setProjSolution] = useState('');
  const [projServicesText, setProjServicesText] = useState('إدارة الحملات, إنتاج المحتوى, تحسين محركات البحث');
  
  // Project SEO & Schema Metadata States
  const [projMetaTitle, setProjMetaTitle] = useState('');
  const [projMetaTitleEn, setProjMetaTitleEn] = useState('');
  const [projMetaDesc, setProjMetaDesc] = useState('');
  const [projMetaDescEn, setProjMetaDescEn] = useState('');
  const [projSlug, setProjSlug] = useState('');
  const [projSchemaJsonLd, setProjSchemaJsonLd] = useState<Record<string, unknown> | undefined>(undefined);
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [copiedSchemaSnippet, setCopiedSchemaSnippet] = useState(false);

  // Banner State
  const [bannerEnabled, setBannerEnabled] = useState(data.banner.enabled);
  const [bannerText, setBannerText] = useState(data.banner.text);
  const [bannerTextEn, setBannerTextEn] = useState(data.banner.textEn || '');
  const [bannerTag, setBannerTag] = useState(data.banner.tag);
  const [bannerTagEn, setBannerTagEn] = useState(data.banner.tagEn || '');
  const [bannerLinkText, setBannerLinkText] = useState(data.banner.linkText || 'احجز استشارتك الآن');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isAdminOpen) return null;

  // Open Edit Package Form
  const startEditPackage = (pkg: ServicePackage) => {
    setEditingPackageId(pkg.id);
    setIsAddingPackage(false);
    setPkgName(pkg.name);
    setPkgNameEn(pkg.nameEn || pkg.name);
    setPkgSector(pkg.sector);
    setPkgPrice(pkg.price);
    setPkgOriginalPrice(pkg.originalPrice || pkg.price);
    setPkgQuarterlyPrice(pkg.quarterlyPrice);
    setPkgPostsCount(pkg.postsCount);
    setPkgReelsCount(pkg.reelsCount);
    setPkgStoriesCount(pkg.storiesCount);
    setPkgFrequency(pkg.frequency || '');
    setPkgHasMonthlyPlan(!!pkg.hasMonthlyPlan);
    setPkgHasOffer(!!pkg.hasOffer);
    setPkgOfferNote(pkg.offerNote || '');
    setPkgIsPopular(!!pkg.isPopular);
    setPkgTagline(pkg.tagline);
    setPkgTaglineEn(pkg.taglineEn || pkg.tagline);
    setPkgIdealFor(pkg.idealFor);
    setPkgFeaturesText(pkg.features.join('\n'));
  };

  // Open Add Package Form
  const startAddPackage = (preferredSector?: 'b2b' | 'b2c' | 'medical') => {
    setEditingPackageId(null);
    setIsAddingPackage(true);
    const chosenSector = preferredSector || (packageFilterSector === 'all' ? 'b2c' : packageFilterSector);
    setPkgName('');
    setPkgNameEn('');
    setPkgSector(chosenSector);
    setPkgPrice(chosenSector === 'b2b' ? 4000 : chosenSector === 'medical' ? 19500 : 15000);
    setPkgOriginalPrice(chosenSector === 'b2b' ? 5000 : chosenSector === 'medical' ? 22000 : 18000);
    setPkgQuarterlyPrice(chosenSector === 'medical' ? 49750 : undefined);
    setPkgPostsCount(chosenSector === 'b2b' ? 4 : chosenSector === 'medical' ? 8 : 12);
    setPkgReelsCount(chosenSector === 'b2b' ? 0 : chosenSector === 'medical' ? 8 : 2);
    setPkgStoriesCount(chosenSector === 'b2c' ? 2 : 0);
    setPkgFrequency(chosenSector === 'b2b' ? 'منشور أسبوعياً' : '٣ منشورات / أسبوع');
    setPkgHasMonthlyPlan(true);
    setPkgHasOffer(false);
    setPkgOfferNote('');
    setPkgIsPopular(false);
    setPkgTagline(chosenSector === 'b2b' ? 'تسريع خط التعاقدات للمصانع والشركات' : chosenSector === 'medical' ? 'بناء الحضور والهيمنة الرقمية للعيادة' : 'مضاعفة المبيعات والتفاعل لمتجرك');
    setPkgTaglineEn(chosenSector === 'b2b' ? 'B2B enterprise pipeline acceleration' : chosenSector === 'medical' ? 'Healthcare clinical growth retainer' : 'E-commerce hyper-growth deliverables');
    setPkgIdealFor(chosenSector === 'b2b' ? 'المصانع والشركات الكبرى' : chosenSector === 'medical' ? 'العيادات والمراكز التخصصية' : 'المتاجر الإلكترونية والتجزئة');
    setPkgFeaturesText('إدارة كاملة لحسابات التواصل\nتصاميم إعلانية وبوستات احترافية\nمقاطع ريلز وفيديوهات بالذكاء الاصطناعي\nتقرير تحليلي شهري مفصل');
  };

  const handleDuplicatePackage = (pkg: ServicePackage) => {
    const duplicated: Omit<ServicePackage, 'id'> = {
      ...pkg,
      name: `${pkg.name} (نسخة جديدة)`,
      nameEn: `${pkg.nameEn || pkg.name} (Copy)`,
      isPopular: false,
    };
    addPackage(duplicated);
    showNotice(isAr ? 'تم استنساخ الباقة بنجاح، يمكنك الآن تعديل بياناتها!' : 'Package duplicated successfully!');
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const features = pkgFeaturesText.split('\n').map((f) => f.trim()).filter(Boolean);

    const packagePayload: Omit<ServicePackage, 'id'> = {
      name: pkgName,
      nameEn: pkgNameEn || pkgName,
      sector: pkgSector,
      price: Number(pkgPrice),
      originalPrice: pkgHasOffer ? Number(pkgOriginalPrice) : undefined,
      quarterlyPrice: pkgQuarterlyPrice ? Number(pkgQuarterlyPrice) : undefined,
      currency: 'ج.م',
      currencyEn: 'EGP',
      period: '/ شهرياً',
      periodEn: '/ month',
      isPopular: pkgIsPopular,
      hasOffer: pkgHasOffer,
      offerNote: pkgOfferNote,
      offerNoteEn: pkgOfferNote,
      tagline: pkgTagline,
      taglineEn: pkgTaglineEn || pkgTagline,
      idealFor: pkgIdealFor,
      idealForEn: pkgIdealFor,
      features,
      featuresEn: features,
      postsCount: pkgPostsCount,
      reelsCount: pkgReelsCount,
      storiesCount: pkgStoriesCount,
      frequency: pkgFrequency || undefined,
      frequencyEn: pkgFrequency || undefined,
      hasMonthlyPlan: pkgHasMonthlyPlan,
    };

    if (editingPackageId) {
      updatePackage({ ...packagePayload, id: editingPackageId });
      showNotice(isAr ? 'تم تحديث الباقة بنجاح!' : 'Package updated successfully!');
      setEditingPackageId(null);
    } else {
      addPackage(packagePayload);
      showNotice(isAr ? 'تمت إضافة الباقة الجديدة بنجاح!' : 'New package added successfully!');
      setIsAddingPackage(false);
    }
  };

  // Open Edit Project Form
  const startEditProject = (study: CaseStudy) => {
    setEditingProjectId(study.id);
    setIsAddingProject(false);
    setProjTitle(study.title);
    setProjTitleEn(study.titleEn || study.title);
    setProjSector(study.sector);
    setProjClient(study.client);
    setProjClientEn(study.clientEn || study.client);
    setProjIndustry(study.industry);
    setProjDuration(study.duration);
    setProjMetric1Value(study.metrics[0]?.value || '+100%');
    setProjMetric1Label(study.metrics[0]?.label || 'النتيجة الأولى');
    setProjMetric1LabelEn(study.metrics[0]?.labelEn || 'Metric One');
    setProjMetric2Value(study.metrics[1]?.value || '10X');
    setProjMetric2Label(study.metrics[1]?.label || 'النتيجة الثانية');
    setProjMetric2LabelEn(study.metrics[1]?.labelEn || 'Metric Two');
    setProjChallenge(study.challenge);
    setProjSolution(study.solution);
    setProjServicesText(study.services.join(', '));
    // SEO fields
    setProjMetaTitle(study.metaTitle || '');
    setProjMetaTitleEn(study.metaTitleEn || '');
    setProjMetaDesc(study.metaDescription || '');
    setProjMetaDescEn(study.metaDescriptionEn || '');
    setProjSlug(study.slug || study.id.replace('cs-', ''));
    setProjSchemaJsonLd(study.schemaJsonLd);
    setShowSeoSettings(Boolean(study.metaTitle || study.schemaJsonLd));
  };

  const startAddProject = () => {
    setEditingProjectId(null);
    setIsAddingProject(true);
    setProjTitle('');
    setProjTitleEn('');
    setProjSector('b2b');
    setProjClient('');
    setProjClientEn('');
    setProjIndustry('');
    setProjDuration('٦ أشهر');
    setProjMetric1Value('+320%');
    setProjMetric1Label('زيادة في العملاء المحتملين');
    setProjMetric1LabelEn('Growth in Inbound Deals');
    setProjMetric2Value('4.8X');
    setProjMetric2Label('عائد استثمار الحملة');
    setProjMetric2LabelEn('Campaign ROAS');
    setProjChallenge('التحدي الذي كان يواجهه العميل...');
    setProjSolution('خطة العمل والحلول التقنية المنفذة...');
    setProjServicesText('إعلانات جوجل, لينكد إن, صناعة محتوى');
    // SEO fields
    setProjMetaTitle('');
    setProjMetaTitleEn('');
    setProjMetaDesc('');
    setProjMetaDescEn('');
    setProjSlug('');
    setProjSchemaJsonLd(undefined);
    setShowSeoSettings(false);
  };

  const handleAutoGenerateProjectSeo = () => {
    const seo = generateCaseStudySeo({
      title: projTitle || `دراسة حالة ${projClient || 'العميل'}`,
      titleEn: projTitleEn || `${projClientEn || projClient || 'Client'} Case Study`,
      client: projClient || 'العميل',
      clientEn: projClientEn || 'Client',
      sector: projSector,
      industry: projIndustry,
      metrics: [
        { label: projMetric1Label, labelEn: projMetric1LabelEn, value: projMetric1Value },
        { label: projMetric2Label, labelEn: projMetric2LabelEn, value: projMetric2Value },
      ],
      solution: projSolution,
      services: projServicesText.split(',').map((s) => s.trim()).filter(Boolean),
      slug: projSlug,
    });

    setProjMetaTitle(seo.title);
    setProjMetaTitleEn(seo.titleEn);
    setProjMetaDesc(seo.description);
    setProjMetaDescEn(seo.descriptionEn);
    setProjSlug(seo.slug);
    setProjSchemaJsonLd(seo.schemaJsonLd);
    setShowSeoSettings(true);
    showNotice(isAr ? 'تم توليد إعدادات السيو وبيانات Schema.org بنجاح!' : 'SEO metadata and Schema.org generated!');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const services = projServicesText.split(',').map((s) => s.trim()).filter(Boolean);

    const projectPayload: Omit<CaseStudy, 'id'> = {
      title: projTitle,
      titleEn: projTitleEn || projTitle,
      sector: projSector,
      client: projClient,
      clientEn: projClientEn || projClient,
      industry: projIndustry,
      industryEn: projIndustry,
      duration: projDuration,
      durationEn: projDuration,
      challenge: projChallenge,
      challengeEn: projChallenge,
      solution: projSolution,
      solutionEn: projSolution,
      metrics: [
        { value: projMetric1Value, label: projMetric1Label, labelEn: projMetric1LabelEn || projMetric1Label },
        { value: projMetric2Value, label: projMetric2Label, labelEn: projMetric2LabelEn || projMetric2Label },
      ],
      services,
      servicesEn: services,
      tags: [projSector.toUpperCase(), projIndustry],
      tagsEn: [projSector.toUpperCase(), projIndustry],
      featured: true,
      metaTitle: projMetaTitle.trim() || undefined,
      metaTitleEn: projMetaTitleEn.trim() || undefined,
      metaDescription: projMetaDesc.trim() || undefined,
      metaDescriptionEn: projMetaDescEn.trim() || undefined,
      slug: projSlug.trim() || undefined,
      schemaJsonLd: projSchemaJsonLd || undefined,
    };

    if (editingProjectId) {
      updateCaseStudy({ ...projectPayload, id: editingProjectId });
      showNotice(isAr ? 'تم تحديث دراسة الحالة بنجاح!' : 'Case study updated successfully!');
      setEditingProjectId(null);
    } else {
      addCaseStudy(projectPayload);
      showNotice(isAr ? 'تمت إضافة دراسة الحالة الجديدة بنجاح!' : 'New case study added successfully!');
      setIsAddingProject(false);
    }
  };

  // Save Banner
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    updateBanner({
      enabled: bannerEnabled,
      text: bannerText,
      textEn: bannerTextEn || bannerText,
      tag: bannerTag,
      tagEn: bannerTagEn || bannerTag,
      linkText: bannerLinkText,
      linkTextEn: bannerLinkText,
    });
    showNotice(isAr ? 'تم تحديث شريط العروض العام بنجاح!' : 'Promo banner updated successfully!');
  };

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-effect-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showNotice(isAr ? 'تم تصدير ملف النسخة الاحتياطية بنجاح!' : 'Backup exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDataJson(content);
      if (ok) {
        showNotice(isAr ? 'تم استيراد البيانات وتطبيقها بنجاح!' : 'Data imported successfully!');
      } else {
        alert(isAr ? 'ملف البيانات غير صالح.' : 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const inquiries = data.inquiries || [];
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  const filteredInquiries = inquiries.filter(item => {
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

  const contractedClients = inquiries.filter(i => i.status === 'closed');

  // Workflow Task Status Counts
  const workflowCounts = {
    all: contractedClients.length,
    inProgress: contractedClients.filter((c) => {
      const stages = c.workflowStages || [];
      const isAllCompleted = stages.length > 0 && stages.every((s) => s.status === 'completed');
      return stages.some((s) => s.status === 'in_progress') && !isAllCompleted;
    }).length,
    completed: contractedClients.filter((c) => {
      const stages = c.workflowStages || [];
      return stages.length > 0 && stages.every((s) => s.status === 'completed');
    }).length,
    overdue: contractedClients.filter((c) => getClientOverdueStatus(c, isAr).isOverdue).length,
    delayed: contractedClients.filter((c) => {
      const stages = c.workflowStages || [];
      const isAllCompleted = stages.length > 0 && stages.every((s) => s.status === 'completed');
      const hasInProgress = stages.some((s) => s.status === 'in_progress');
      return !isAllCompleted && !hasInProgress;
    }).length,
  };

  const filteredContractedClients = contractedClients.filter((client) => {
    if (clientSectorFilter !== 'all' && client.sector !== clientSectorFilter) return false;
    if (clientStatusFilter !== 'all' && client.contractStatus && client.contractStatus !== clientStatusFilter) return false;

    // Filter by Workflow Task Status:
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

    // Filter by specific stage:
    if (workflowStageFilter !== 'all') {
      const stages = client.workflowStages || [];
      const targetStage = stages.find((s) => s.id === workflowStageFilter);
      if (!targetStage || targetStage.status === 'completed') return false;
    }

    if (clientSearchQuery.trim()) {
      const q = clientSearchQuery.toLowerCase();
      const matchName = client.name.toLowerCase().includes(q);
      const matchCompany = (client.company || '').toLowerCase().includes(q);
      const matchPhone = client.phone.toLowerCase().includes(q);
      const matchPackage = (client.packageName || '').toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchPhone && !matchPackage) return false;
    }
    return true;
  });

  const totalClientsMrr = contractedClients.reduce((acc, c) => {
    if (c.retainerAmount) return acc + c.retainerAmount;
    if (c.budget) {
      const num = parseInvoiceAmount(c.budget);
      if (num > 0) return acc + num;
    }
    const defaultFee = c.sector === 'b2b' ? 4000 : c.sector === 'medical' ? 19500 : 15000;
    return acc + defaultFee;
  }, 0);

  const totalDeliveredCount = contractedClients.reduce((acc, c) => 
    acc + (c.postsDelivered || 0) + (c.reelsDelivered || 0) + (c.storiesDelivered || 0), 0
  );

  const totalTargetCount = contractedClients.reduce((acc, c) => {
    const targets = getClientDeliverableTargets(c, data.packages);
    return acc + targets.totalTarget;
  }, 0);

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

  const handleToggleClientReelStage = (client: Inquiry, reelStageId: string) => {
    const resolvedTargets = getClientDeliverableTargets(client, data.packages);
    const currentReelStages = buildReelWorkflowStages(
      resolvedTargets.reelsTarget,
      client.reelStages,
      client.reelsDelivered ?? 0
    );

    const updatedReelStages = currentReelStages.map((stage) => {
      if (stage.id === reelStageId) {
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

    const syncedReelsDelivered = updatedReelStages.filter((s) => s.status === 'completed').length;
    updateInquiry(client.id, {
      reelStages: updatedReelStages,
      reelsDelivered: syncedReelsDelivered,
    });
    showNotice(isAr ? 'تم تحديث حالة الريلز وتسجيل وقت الإنجاز بنجاح!' : 'Reel status updated with timestamp!');
  };

  const exportInquiriesCsv = () => {
    if (inquiries.length === 0) {
      alert(isAr ? 'لا توجد طلبات لتصديرها حالياً.' : 'No inquiries to export.');
      return;
    }
    const headers = ['التاريخ', 'اسم العميل', 'رقم الهاتف', 'الشركة', 'القطاع', 'الباقة المختارة', 'الميزانية', 'الحالة', 'ملاحظات'];
    const rows = inquiries.map(inq => [
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

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
      onClick={() => setIsAdminOpen(false)}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1.25rem)] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 shrink-0 p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'لوحة إدارة وتعديل المحتوى والعروض (CMS)' : 'Content Management & Offers Console (CMS)'}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              {isAr ? 'أضف مشاريع جديدة، عدّل الباقات والأسعار، أو أطلق عروضاً ترويجية.' : 'Add new case studies, edit package prices, or launch promo discounts.'}
            </p>
          </div>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inquiries'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>{isAr ? `الطلبات والاستشارات (${inquiries.length})` : `Inquiries & Orders (${inquiries.length})`}</span>
            {newInquiriesCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold animate-pulse">
                {newInquiriesCount} {isAr ? 'جديد' : 'new'}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'clients'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? `العملاء والتعاقدات (${contractedClients.length})` : `Clients & Retainers (${contractedClients.length})`}</span>
            {contractedClients.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full font-bold">
                {contractedClients.length} {isAr ? 'نشط' : 'active'}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'packages'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{isAr ? `الباقات والعروض (${data.packages.length})` : `Packages & Offers (${data.packages.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAr ? `دراسات الحالة والمشاريع (${data.caseStudies.length})` : `Case Studies (${data.caseStudies.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'banner'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'شريط العروض والخصومات' : 'Global Promo Banner'}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'النسخ الاحتياطي والضبط' : 'Backup & Reset'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 0: INQUIRIES & CLIENT ORDERS */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-slate-400 block">{isAr ? 'إجمالي الطلبات' : 'Total Leads'}</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{inquiries.length}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-amber-600 block">{isAr ? 'طلبات جديدة' : 'New Leads'}</span>
                  <span className="text-2xl font-black text-amber-700 mt-1 block">{newInquiriesCount}</span>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-sky-600 block">{isAr ? 'قيد التواصل' : 'Contacted'}</span>
                  <span className="text-2xl font-black text-sky-700 mt-1 block">
                    {inquiries.filter(i => i.status === 'contacted').length}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-emerald-600 block">{isAr ? 'تم التعاقد' : 'Closed Deals'}</span>
                  <span className="text-2xl font-black text-emerald-700 mt-1 block">
                    {inquiries.filter(i => i.status === 'closed').length}
                  </span>
                </div>
              </div>

              {/* Action Bar: Search, Status Filter & CSV Export */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[180px]">
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
                  <button
                    type="button"
                    onClick={() => setIsAddClientOpen(true)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
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

                  {inquiries.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm(isAr ? 'هل أنت متأكد من مسح جميع الطلبات المسجلة؟' : 'Are you sure you want to clear all inquiries?')) {
                          clearAllInquiries();
                          showNotice(isAr ? 'تم مسح جميع الطلبات.' : 'All inquiries cleared.');
                        }
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={isAr ? 'مسح جميع الطلبات' : 'Clear all'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inquiries Cards List */}
              {filteredInquiries.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                  <h5 className="text-sm font-bold text-slate-700">
                    {inquiries.length === 0 
                      ? (isAr ? 'لا توجد طلبات واردة حالياً' : 'No inquiries yet')
                      : (isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching inquiries found')}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {inquiries.length === 0
                      ? (isAr ? 'عند قيام أي عميل باختيار باقة وإرسال نموذج الاستشارة، ستظهر بياناته هنا فوراً مع روابط التواصل الفوري.' : 'When any visitor selects a package and submits the consultation form, their details will appear here.')
                      : (isAr ? 'جرّب تغيير كلمات البحث أو تصفية الحالات.' : 'Try adjusting your search query or status filter.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInquiries.map((inq) => {
                    const waPhone = inq.phone.replace(/^0/, '20').replace(/[^0-9]/g, '');
                    const waText = encodeURIComponent(
                      isAr 
                        ? `مرحباً ${inq.name}، معك فريق ديجيتال إفكت بخصوص استفسارك عن باقة ${inq.packageName || 'التسويق'}.`
                        : `Hello ${inq.name}, Digital Effect team reaching out regarding your inquiry.`
                    );

                    return (
                      <div 
                        key={inq.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
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
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-slate-100 text-slate-700">
                              {inq.sector.toUpperCase()}
                            </span>

                            <select
                              value={inq.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                updateInquiryStatus(inq.id, newStatus);
                                if (newStatus === 'closed') {
                                  showNotice(isAr ? 'تهانينا! تم تحويل العميل إلى قسم العملاء والتعاقدات بنجاح 🎉' : 'Client transferred to Contracted Clients section 🎉');
                                } else {
                                  showNotice(isAr ? 'تم تحديث حالة الطلب!' : 'Inquiry status updated!');
                                }
                              }}
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
                                  setSelectedClientForAccount(inq);
                                  setIsClientAccountOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                                title={isAr ? 'فتح ملف ومتابعة حساب العميل' : 'Open Client Account'}
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{isAr ? 'متابعة الحساب' : 'Account'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(isAr ? 'حذف هذا الطلب؟' : 'Delete this inquiry?')) {
                                  deleteInquiry(inq.id);
                                  showNotice(isAr ? 'تم حذف الطلب.' : 'Inquiry deleted.');
                                }
                              }}
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
                              href={`tel:${inq.phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span className="font-mono">{inq.phone}</span>
                            </a>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            ID: <span className="font-mono">{inq.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: CONTRACTED CLIENTS & RETAINER ACCOUNTS */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 block">{isAr ? 'العملاء المتعاقدون' : 'Contracted Clients'}</span>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-black text-emerald-900 mt-1 block">{contractedClients.length}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{isAr ? 'حسابات ومتابعة دورية' : 'Active accounts'}</span>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-700 block">{isAr ? 'الإيراد الشهري (MRR)' : 'Monthly Retainer'}</span>
                    <DollarSign className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-2xl font-black text-sky-900 mt-1 block">
                    {totalClientsMrr.toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                  <span className="text-[10px] text-sky-600 font-bold">{isAr ? 'ج.م شهرياً' : 'EGP / month'}</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700 block">{isAr ? 'تجديدات ومتابعات' : 'Renewals Due'}</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-black text-amber-900 mt-1 block">
                    {contractedClients.filter(c => c.contractStatus === 'renewal_due' || c.paymentStatus === 'pending' || c.paymentStatus === 'overdue').length}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">{isAr ? 'تحتاج تواصل' : 'Action needed'}</span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 block">{isAr ? 'المخرجات المنشورة' : 'Assets Delivered'}</span>
                    <Layers className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-2xl font-black text-purple-900 mt-1 block">
                    {totalDeliveredCount} <span className="text-xs font-normal text-purple-500">/ {totalTargetCount}</span>
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold">{isAr ? 'مخرجات الدورة الحالية' : 'Current cycle'}</span>
                </div>
              </div>

              {/* =============================================================== */}
              {/* OVERDUE TASKS URGENT NOTIFICATION BANNER                        */}
              {/* =============================================================== */}
              {workflowCounts.overdue > 0 && (
                <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-md border border-rose-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                      <BellRing className="w-4 h-4 text-white animate-bounce" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black tracking-wide">
                          {isAr 
                            ? `نظام الإشعارات: يوجد ${workflowCounts.overdue} عميل لديهم مهام متأخرة تجاوزت موعد الاستحقاق!`
                            : `Alert System: ${workflowCounts.overdue} client accounts have tasks exceeding their scheduled due date!`}
                        </h4>
                        <span className="bg-white text-rose-700 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                          {isAr ? 'عاجل ومطلوب اتخاذ إجراء' : 'Action Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-100 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                        {isAr
                          ? 'تجاوزت هذه الحسابات تاريخ الاستحقاق المحدد دون اكتمال المراحل التنفيذية. يرجى المتابعة وتحديث سير العمل.'
                          : 'These accounts exceeded their target handoff date with pending stages. Please review and update stalled deliverables.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWorkflowTaskFilter(workflowTaskFilter === 'overdue' ? 'all' : 'overdue')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer self-start sm:self-center ${
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
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{isAr ? 'تصفية ومتابعة سير عمل المهام:' : 'Workflow Tasks Status Filter:'}</span>
                        {workflowTaskFilter !== 'all' && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            workflowTaskFilter === 'overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : workflowTaskFilter === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : workflowTaskFilter === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {workflowTaskFilter === 'overdue' ? (isAr ? 'تجاوزت الاستحقاق ⚠️' : 'Overdue ⚠️')
                              : workflowTaskFilter === 'completed' ? (isAr ? 'مكتملة' : 'Completed')
                              : workflowTaskFilter === 'in_progress' ? (isAr ? 'قيد التنفيذ' : 'In Progress')
                              : (isAr ? 'متأخرة / قيد الانتظار' : 'Delayed / Pending')}
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* Stage filter and reset */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <select
                      value={workflowStageFilter}
                      onChange={(e) => setWorkflowStageFilter(e.target.value)}
                      className="text-[11px] font-bold py-1 px-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">{isAr ? 'كافة مراحل سير العمل' : 'All Stages'}</option>
                      <option value="content">{isAr ? 'صناعة المحتوى' : 'Content Creator'}</option>
                      <option value="visual_design">{isAr ? 'التصميم البصري' : 'Visual Design'}</option>
                      <option value="final_design">{isAr ? 'النسخة النهائية' : 'Final Design'}</option>
                      <option value="client_approval">{isAr ? 'موافقة العميل' : 'Client Approve'}</option>
                      <option value="publishing">{isAr ? 'النشر والجدولة' : 'Publish'}</option>
                    </select>

                    {(workflowTaskFilter !== 'all' || workflowStageFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setWorkflowTaskFilter('all');
                          setWorkflowStageFilter('all');
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        title={isAr ? 'إعادة ضبط الفلاتر' : 'Reset task filters'}
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>{isAr ? 'إعادة تعيين' : 'Reset'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWorkflowTaskFilter('all')}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      workflowTaskFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{isAr ? 'كافة المهام' : 'All'}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black tabular-nums ${
                      workflowTaskFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {workflowCounts.all}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkflowTaskFilter('in_progress')}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      workflowTaskFilter === 'in_progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-400/40'
                        : 'bg-blue-50/50 hover:bg-blue-50 text-blue-800 border-blue-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>{isAr ? 'قيد التنفيذ' : 'In Progress'}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black tabular-nums ${
                      workflowTaskFilter === 'in_progress' ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {workflowCounts.inProgress}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkflowTaskFilter('completed')}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      workflowTaskFilter === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-400/40'
                        : 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>{isAr ? 'مكتملة' : 'Completed'}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black tabular-nums ${
                      workflowTaskFilter === 'completed' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {workflowCounts.completed}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkflowTaskFilter('overdue')}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      workflowTaskFilter === 'overdue'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-1 ring-rose-400/40'
                        : 'bg-rose-50/50 hover:bg-rose-50 text-rose-800 border-rose-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                      <span>{isAr ? 'تجاوزت الاستحقاق' : 'Overdue'}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black tabular-nums ${
                      workflowTaskFilter === 'overdue' ? 'bg-rose-700 text-rose-100' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {workflowCounts.overdue}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkflowTaskFilter('delayed')}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      workflowTaskFilter === 'delayed'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-1 ring-amber-400/40'
                        : 'bg-amber-50/50 hover:bg-amber-50 text-amber-800 border-amber-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{isAr ? 'متأخرة / انتظار' : 'Delayed'}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black tabular-nums ${
                      workflowTaskFilter === 'delayed' ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {workflowCounts.delayed}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Bar: Search, Sector Filter, Status Filter & Add Client Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      placeholder={isAr ? 'البحث بالاسم، الشركة، الباقة، أو الهاتف...' : 'Search clients...'}
                      className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={clientSectorFilter}
                    onChange={(e) => setClientSectorFilter(e.target.value as any)}
                    className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="all">{isAr ? 'جميع القطاعات' : 'All Sectors'}</option>
                    <option value="b2c">{isAr ? 'B2C والتجارة' : 'B2C'}</option>
                    <option value="b2b">{isAr ? 'B2B والشركات' : 'B2B'}</option>
                    <option value="medical">{isAr ? 'القطاع الطبي' : 'Medical'}</option>
                  </select>

                  <select
                    value={clientStatusFilter}
                    onChange={(e) => setClientStatusFilter(e.target.value as any)}
                    className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                    <option value="active">{isAr ? 'نشط ومفعل' : 'Active'}</option>
                    <option value="renewal_due">{isAr ? 'قيد التجديد' : 'Renewal Due'}</option>
                    <option value="paused">{isAr ? 'موقوف مؤقتاً' : 'Paused'}</option>
                    <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إضافة عميل وتحديد باقة' : 'Add Client'}</span>
                </button>
              </div>

              {/* Clients Cards Grid */}
              {filteredContractedClients.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-700">
                    {contractedClients.length === 0
                      ? (isAr ? 'لا يوجد عملاء متعاقدون حالياً' : 'No contracted clients yet')
                      : (isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching clients found')}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {contractedClients.length === 0
                      ? (isAr ? 'عند اختيار "تم التعاقد" على أي طلب، أو عند إضافة عميل جديد، سينتقل العميل تلقائياً إلى هذا القسم لمتابعة مخرجاته الشهرية وحسابه.' : 'Marking any lead as "Closed Deal" will automatically transfer them here for retainer management.')
                      : (isAr ? 'جرّب تعديل كلمات البحث أو تصفية القطاعات.' : 'Try adjusting your search filters.')}
                  </p>
                  {contractedClients.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddClientOpen(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة أول عميل متعاقد الآن' : 'Add First Client'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className={`bg-white rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 border ${
                          overdueInfo.isOverdue
                            ? 'border-rose-400 ring-2 ring-rose-400/25 bg-gradient-to-b from-rose-50/25 via-white to-white'
                            : 'border-slate-200'
                        }`}
                      >
                        <div>
                          {/* Client Header: Company primary, Client secondary */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm shrink-0 shadow-2xs text-white ${
                                overdueInfo.isOverdue ? 'bg-rose-700' : 'bg-slate-900'
                              }`}>
                                {(client.company || client.name).slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-sm font-black text-slate-900 truncate">
                                    {client.company || client.name}
                                  </h4>
                                  {overdueInfo.isOverdue && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs animate-pulse shrink-0">
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                      <span>{isAr ? `تجاوزت الاستحقاق (${overdueInfo.badgeTextAr})` : `Overdue (${overdueInfo.badgeTextEn})`}</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 font-medium mt-0.5">
                                  <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{client.name}</span>
                                </p>
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
                                {client.sector.toUpperCase()}
                              </span>

                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                overdueInfo.isOverdue
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200 font-black'
                                  : client.contractStatus === 'renewal_due'
                                  ? 'bg-amber-100 text-amber-800'
                                  : client.contractStatus === 'paused'
                                  ? 'bg-slate-100 text-slate-700'
                                  : client.contractStatus === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {overdueInfo.isOverdue
                                  ? (isAr ? '⚠️ متأخر عن الموعد' : '⚠️ Past Due')
                                  : client.contractStatus === 'renewal_due' ? (isAr ? 'تجديد مستحق' : 'Renewal Due')
                                  : client.contractStatus === 'paused' ? (isAr ? 'موقوف مؤقتاً' : 'Paused')
                                  : client.contractStatus === 'completed' ? (isAr ? 'منتهي' : 'Completed')
                                  : (isAr ? 'نشط ومفعل' : 'Active')}
                              </span>
                            </div>
                          </div>

                          {/* Overdue Warning Alert Strip */}
                          {overdueInfo.isOverdue && (
                            <div className="mb-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-900 text-xs flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-black text-[11px] block text-rose-950 truncate">
                                    {isAr ? overdueInfo.alertTitleAr : overdueInfo.alertTitleEn}
                                  </span>
                                  <span className="text-[10px] text-rose-700 block truncate font-medium">
                                    {isAr 
                                      ? `تاريخ الاستحقاق: ${overdueInfo.dueFormatted} • المرحلة المتعطلة: ${overdueInfo.stalledStageName || 'المراحل التنفيذية'}`
                                      : `Due: ${overdueInfo.dueFormatted} • Stalled at: ${overdueInfo.stalledStageName || 'Execution Stages'}`}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white text-rose-700 border border-rose-200 shadow-2xs shrink-0">
                                {isAr ? 'عاجل 🚨' : 'Urgent 🚨'}
                              </span>
                            </div>
                          )}

                          {/* 3-Box Deliverables Card (Image Style: Blue Posts, Purple Reels, Orange Stories - No Price) */}
                          <ClientPackageDeliverablesCard
                            packageName={client.packageName}
                            postsCount={targetP}
                            reelsCount={targetR}
                            storiesCount={targetS}
                            isAr={isAr}
                            className="mb-2.5"
                          />

                          {/* Interactive Workflow Tasks Stepper with Timestamps */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                <Layers className="w-3 h-3 text-blue-600" />
                                <span>{isAr ? 'التايم لاين ومراحل سير العمل:' : 'Workflow Tasks Pipeline:'}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isAr ? 'اضغط للتحديث وتاريخ التعليم' : 'Click to toggle status & date'}
                              </span>
                            </div>

                            <ClientWorkflowStepper
                              stages={client.workflowStages}
                              onToggleStage={(stageId) => handleToggleClientStage(client, stageId)}
                              reelsTarget={targetR}
                              reelStages={client.reelStages}
                              reelsDelivered={deliveredR}
                              onToggleReelStage={(reelId) => handleToggleClientReelStage(client, reelId)}
                              interactive={true}
                              size="sm"
                              isAr={isAr}
                            />
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${waPhone}?text=${waText}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              title={isAr ? 'واتساب العميل' : 'WhatsApp Client'}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${client.phone}`}
                              className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title={isAr ? 'اتصال هاتفي' : 'Phone Call'}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientForAccount(client);
                              setIsClientAccountOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            <span>{isAr ? 'متابعة المهام والحساب' : 'Workflow & Account'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PACKAGES & OFFERS */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              {(isAddingPackage || editingPackageId) ? (
                <form onSubmit={handleSavePackage} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">
                      {editingPackageId ? (isAr ? 'تعديل الباقة الحالية' : 'Edit Package') : (isAr ? 'إضافة باقة تسويقية جديدة' : 'Add New Package')}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPackage(false);
                        setEditingPackageId(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'اسم الباقة (عربي):' : 'Package Name (Arabic):'}</label>
                      <input
                        type="text"
                        required
                        value={pkgName}
                        onChange={(e) => setPkgName(e.target.value)}
                        placeholder="مثال: باقة مضاعفة مبيعات الـ E-Commerce"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'اسم الباقة (إنجليزي):' : 'Package Name (English):'}</label>
                      <input
                        type="text"
                        value={pkgNameEn}
                        onChange={(e) => setPkgNameEn(e.target.value)}
                        placeholder="e.g. E-Commerce Scaling Retainer"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'قطاع الباقة:' : 'Sector:'}</label>
                      <select
                        value={pkgSector}
                        onChange={(e) => setPkgSector(e.target.value as 'b2b' | 'b2c' | 'medical')}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="b2b">قطاع الشركات (B2B)</option>
                        <option value="b2c">قطاع التجارة (B2C)</option>
                        <option value="medical">القطاع الطبي (Medical)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'السعر المخفض (ج.م):' : 'Current Price (EGP):'}</label>
                      <input
                        type="number"
                        required
                        value={pkgPrice}
                        onChange={(e) => setPkgPrice(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white tabular-nums"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'السعر الأصلي قبل الخصم:' : 'Original Price (Strikethrough):'}</label>
                      <input
                        type="number"
                        value={pkgOriginalPrice}
                        onChange={(e) => setPkgOriginalPrice(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Deliverables inputs (Posts, Reels, Stories, Frequency, Quarterly Price) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-sky-50/50 rounded-xl border border-sky-100">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">{isAr ? 'عدد المنشورات:' : 'Posts Count:'}</label>
                      <input
                        type="number"
                        value={pkgPostsCount ?? ''}
                        onChange={(e) => setPkgPostsCount(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="8"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white tabular-nums"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">{isAr ? 'عدد الريلز (AI Reels):' : 'Reels Count:'}</label>
                      <input
                        type="number"
                        value={pkgReelsCount ?? ''}
                        onChange={(e) => setPkgReelsCount(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="2"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white tabular-nums"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">{isAr ? 'عدد الستوريز:' : 'Stories Count:'}</label>
                      <input
                        type="number"
                        value={pkgStoriesCount ?? ''}
                        onChange={(e) => setPkgStoriesCount(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white tabular-nums"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">{isAr ? 'سعر الربع سنوي (ج.م):' : 'Quarterly Price (EGP):'}</label>
                      <input
                        type="number"
                        value={pkgQuarterlyPrice ?? ''}
                        onChange={(e) => setPkgQuarterlyPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="مثال: 33750"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">{isAr ? 'معدل النشر (لـ B2B):' : 'Posting Frequency (e.g. 1 post/week):'}</label>
                      <input
                        type="text"
                        value={pkgFrequency}
                        onChange={(e) => setPkgFrequency(e.target.value)}
                        placeholder={isAr ? 'مثال: منشور أسبوعياً (1 post / week)' : '1 post / week'}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgHasMonthlyPlan}
                          onChange={(e) => setPkgHasMonthlyPlan(e.target.checked)}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span>{isAr ? 'خطة شهرية متضمنة (Monthly Plan Included)' : 'Monthly Plan Included'}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 py-2 flex-wrap">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkgHasOffer}
                        onChange={(e) => setPkgHasOffer(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>{isAr ? 'تفعيل شارة عرض خاص / خصم (Highlight Offer)' : 'Enable Special Discount Offer'}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkgIsPopular}
                        onChange={(e) => setPkgIsPopular(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>{isAr ? 'تمييز كـ "الأكثر طلباً" (Highlight Card)' : 'Mark as "Most Popular"'}</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'نص شارة الخصم أو العرض:' : 'Offer Note / Badge:'}</label>
                    <input
                      type="text"
                      value={pkgOfferNote}
                      onChange={(e) => setPkgOfferNote(e.target.value)}
                      placeholder={isAr ? 'مثال: خصم ٢٠٪ لفترة محدودة' : 'e.g. 20% OFF Limited Time'}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'الوصف المختصر للباقة:' : 'Package Tagline:'}</label>
                    <input
                      type="text"
                      value={pkgTagline}
                      onChange={(e) => setPkgTagline(e.target.value)}
                      placeholder={isAr ? 'شرح مختصر لقيمة الباقة...' : 'Brief summary of deliverable value...'}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'الميزات والخدمات (سطر لكل ميزة):' : 'Deliverables & Features (1 per line):'}</label>
                    <textarea
                      rows={4}
                      value={pkgFeaturesText}
                      onChange={(e) => setPkgFeaturesText(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPackage(false);
                        setEditingPackageId(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حفظ الباقة' : 'Save Package'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? 'إدارة باقات الأسعار والعروض الترويجية' : 'Manage Pricing Packages & Offers'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isAr ? 'أضف باقات مخصصة أو عدل الأسعار والمخرجات للقطاعات (B2B, B2C, الطبي) أو استنسخ باقات قائمة.' : 'Add custom packages, edit deliverables & pricing for B2B/B2C/Medical, or duplicate existing packages.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => startAddPackage(packageFilterSector === 'all' ? 'b2c' : packageFilterSector)}
                      className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة باقة جديدة' : 'Add New Package'}</span>
                    </button>
                  </div>

                  {/* Sector Filter Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] font-bold text-slate-400 me-1">{isAr ? 'القطاع:' : 'Sector:'}</span>
                    {[
                      { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                      { id: 'b2c', labelAr: 'B2C والتجارة', labelEn: 'B2C' },
                      { id: 'b2b', labelAr: 'B2B والشركات', labelEn: 'B2B' },
                      { id: 'medical', labelAr: 'الطبي والعيادات', labelEn: 'Medical' },
                    ].map((sec) => {
                      const count = sec.id === 'all' 
                        ? data.packages.length 
                        : data.packages.filter(p => p.sector === sec.id).length;
                      const isActive = packageFilterSector === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setPackageFilterSector(sec.id as any)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{isAr ? sec.labelAr : sec.labelEn}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-slate-800 text-sky-300' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-start">{isAr ? 'اسم الباقة' : 'Package Name'}</th>
                          <th className="p-3 text-start">{isAr ? 'القطاع' : 'Sector'}</th>
                          <th className="p-3 text-start">{isAr ? 'المخرجات الشهرية' : 'Deliverables'}</th>
                          <th className="p-3 text-start">{isAr ? 'السعر' : 'Price'}</th>
                          <th className="p-3 text-start">{isAr ? 'الحالة والعرض' : 'Status & Offer'}</th>
                          <th className="p-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {data.packages
                          .filter((pkg) => packageFilterSector === 'all' || pkg.sector === packageFilterSector)
                          .map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{isAr ? pkg.name : pkg.nameEn}</span>
                                {pkg.isPopular && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">
                                    {isAr ? 'الأكثر طلباً' : 'Popular'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                                {isAr ? pkg.tagline : pkg.taglineEn}
                              </p>
                            </td>
                            <td className="p-3 font-semibold text-slate-600 uppercase">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                pkg.sector === 'medical' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : pkg.sector === 'b2b'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'bg-purple-50 text-purple-700 border border-purple-100'
                              }`}>
                                {pkg.sector}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              <div className="space-y-0.5 font-medium">
                                {pkg.postsCount !== undefined && <span>{pkg.postsCount} {isAr ? 'بوست' : 'posts'}</span>}
                                {pkg.reelsCount !== undefined && pkg.reelsCount > 0 && <span> • {pkg.reelsCount} {isAr ? 'ريلز' : 'reels'}</span>}
                                {pkg.storiesCount !== undefined && pkg.storiesCount > 0 && <span> • {pkg.storiesCount} {isAr ? 'ستوري' : 'stories'}</span>}
                                {pkg.frequency && (
                                  <div className="text-[10px] text-slate-400">{pkg.frequency}</div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 tabular-nums">
                                {pkg.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? pkg.currency : pkg.currencyEn}
                              </div>
                              {pkg.quarterlyPrice && (
                                <div className="text-[10px] text-slate-500 tabular-nums">
                                  {isAr ? 'ربع سنوي: ' : 'Quarterly: '}
                                  {pkg.quarterlyPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? pkg.currency : pkg.currencyEn}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {pkg.hasOffer ? (
                                <span className="text-rose-600 text-[11px] font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                  {pkg.offerNote || (isAr ? 'عرض ترويجي' : 'Offer')}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">{isAr ? 'سعر قياسي' : 'Standard'}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => startEditPackage(pkg)}
                                  className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                  title={isAr ? 'تعديل الباقة والأسعار' : 'Edit Package'}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicatePackage(pkg)}
                                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title={isAr ? 'استنساخ الباقة لإنشاء باقة مخصصة' : 'Duplicate Package'}
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(isAr ? `هل أنت متأكد من حذف ${pkg.name}؟` : `Delete ${pkg.name}?`)) {
                                      deletePackage(pkg.id);
                                      showNotice(isAr ? 'تم حذف الباقة بنجاح.' : 'Package deleted.');
                                    }
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title={isAr ? 'حذف الباقة' : 'Delete Package'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJECTS & CASE STUDIES */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {(isAddingProject || editingProjectId) ? (
                <form onSubmit={handleSaveProject} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {editingProjectId ? (isAr ? 'تعديل دراسة الحالة' : 'Edit Case Study') : (isAr ? 'إضافة دراسة حالة جديدة' : 'Add New Case Study')}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoGenerateProjectSeo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer"
                        title={isAr ? 'توليد عناوين وأوصاف مطابقة لمعايير السيو ومخطط Schema.org' : 'Generate Schema & SEO'}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>{isAr ? 'توليد الـ SEO وبيانات Schema تلقائياً' : 'Auto-Generate SEO & Schema'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProject(false);
                          setEditingProjectId(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'العنوان الرئيسي (عربي):' : 'Title (Arabic):'}</label>
                      <input
                        type="text"
                        required
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'العنوان (إنجليزي):' : 'Title (English):'}</label>
                      <input
                        type="text"
                        value={projTitleEn}
                        onChange={(e) => setProjTitleEn(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'القطاع:' : 'Sector:'}</label>
                      <select
                        value={projSector}
                        onChange={(e) => setProjSector(e.target.value as 'b2b' | 'b2c' | 'medical')}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="b2b">قطاع الشركات (B2B)</option>
                        <option value="b2c">قطاع التجارة (B2C)</option>
                        <option value="medical">القطاع الطبي (Medical)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'اسم العميل:' : 'Client Name:'}</label>
                      <input
                        type="text"
                        required
                        value={projClient}
                        onChange={(e) => setProjClient(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{isAr ? 'المجال الصناعي:' : 'Industry:'}</label>
                      <input
                        type="text"
                        required
                        value={projIndustry}
                        onChange={(e) => setProjIndustry(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-sky-50/50 rounded-xl border border-sky-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-sky-900">{isAr ? 'المؤشر الأول (القيمة والتسمية):' : 'Primary Metric (Value & Label):'}</label>
                      <input
                        type="text"
                        required
                        value={projMetric1Value}
                        onChange={(e) => setProjMetric1Value(e.target.value)}
                        placeholder="+320%"
                        className="w-full text-xs p-2 rounded-lg border border-sky-200 bg-white"
                      />
                      <input
                        type="text"
                        required
                        value={projMetric1Label}
                        onChange={(e) => setProjMetric1Label(e.target.value)}
                        placeholder="Label (Ar)"
                        className="w-full text-xs p-2 rounded-lg border border-sky-200 bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-sky-900">{isAr ? 'المؤشر الثاني:' : 'Secondary Metric:'}</label>
                      <input
                        type="text"
                        required
                        value={projMetric2Value}
                        onChange={(e) => setProjMetric2Value(e.target.value)}
                        placeholder="4.8X"
                        className="w-full text-xs p-2 rounded-lg border border-sky-200 bg-white"
                      />
                      <input
                        type="text"
                        required
                        value={projMetric2Label}
                        onChange={(e) => setProjMetric2Label(e.target.value)}
                        placeholder="Label 2"
                        className="w-full text-xs p-2 rounded-lg border border-sky-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'التحدي قبل التدخل:' : 'Initial Challenge:'}</label>
                    <textarea
                      rows={2}
                      value={projChallenge}
                      onChange={(e) => setProjChallenge(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'الحل المنفذ من ديجيتال إفكت:' : 'Implemented Solution:'}</label>
                    <textarea
                      rows={2}
                      value={projSolution}
                      onChange={(e) => setProjSolution(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  {/* ============================================================ */}
                  {/* SEO & SCHEMA.ORG ADVANCED SETTINGS ACCORDION                */}
                  {/* ============================================================ */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                          <Globe className="w-4 h-4" />
                        </span>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{isAr ? 'بيانات الـ SEO ومخطط Schema.org المنظم' : 'SEO & Schema.org Metadata'}</span>
                            {projMetaTitle && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {isAr ? 'تم ضبطه' : 'Configured'}
                              </span>
                            )}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            {isAr ? 'عناوين وأوصاف مخصصة ومطابقة لمعايير جوجل ومخططات Schema.org الرسمية' : 'Google SERP and OpenGraph optimized tags'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoGenerateProjectSeo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isAr ? 'توليد تلقائي' : 'Auto Generate'}</span>
                      </button>
                    </div>

                    {/* SEO Fields Grid */}
                    <div className="space-y-4">
                      {/* Meta Titles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">{isAr ? 'عنوان الصفحة لمحركات البحث (عربي):' : 'SEO Meta Title (Arabic):'}</label>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              projMetaTitle.length >= 30 && projMetaTitle.length <= 60 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {projMetaTitle.length} / 60 {isAr ? 'حرف' : 'chars'}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={projMetaTitle}
                            onChange={(e) => setProjMetaTitle(e.target.value)}
                            placeholder={isAr ? 'دراسة حالة [العميل]: [أبرز نتيجة] | ديجيتال إفكت' : 'Case study title'}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">{isAr ? 'عنوان الصفحة (إنجليزي):' : 'SEO Meta Title (English):'}</label>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              projMetaTitleEn.length >= 30 && projMetaTitleEn.length <= 60 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {projMetaTitleEn.length} / 60
                            </span>
                          </div>
                          <input
                            type="text"
                            value={projMetaTitleEn}
                            onChange={(e) => setProjMetaTitleEn(e.target.value)}
                            placeholder="Client Case Study: Growth Outcome | Digital Effect"
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Meta Descriptions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">{isAr ? 'الوصف التعريفي (Meta Description عربي):' : 'Meta Description (Arabic):'}</label>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              projMetaDesc.length >= 120 && projMetaDesc.length <= 160 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {projMetaDesc.length} / 160 {isAr ? 'حرف' : 'chars'}
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={projMetaDesc}
                            onChange={(e) => setProjMetaDesc(e.target.value)}
                            placeholder={isAr ? 'اكتشف قصة نجاح العميل مع ديجيتال إفكت...' : 'Actionable meta description'}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white leading-relaxed"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">{isAr ? 'الوصف التعريفي (إنجليزي):' : 'Meta Description (English):'}</label>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              projMetaDescEn.length >= 120 && projMetaDescEn.length <= 160 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {projMetaDescEn.length} / 160
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={projMetaDescEn}
                            onChange={(e) => setProjMetaDescEn(e.target.value)}
                            placeholder="Discover how this client achieved record outcomes..."
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Slug Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">{isAr ? 'الرابط الدائم والمختصر (URL Slug):' : 'URL Slug:'}</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-mono">https://digitaleffect.net/#</span>
                          <input
                            type="text"
                            value={projSlug}
                            onChange={(e) => setProjSlug(e.target.value)}
                            placeholder="client-name"
                            className="flex-1 text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                          <span className="text-xs text-slate-400 font-mono">-case-study</span>
                        </div>
                      </div>

                      {/* Live SERP Snippet Preview */}
                      {projMetaTitle && (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-sans">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-900">digitaleffect.net</span>
                            <span className="text-slate-400">›</span>
                            <span>{projSlug || 'case-study'}</span>
                          </div>
                          <div className="text-sm font-medium text-blue-700 hover:underline line-clamp-1">
                            {isAr ? projMetaTitle : (projMetaTitleEn || projMetaTitle)}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {isAr ? projMetaDesc : (projMetaDescEn || projMetaDesc)}
                          </p>
                        </div>
                      )}

                      {/* Schema.org JSON-LD Code Snippet & Copy Action */}
                      {projSchemaJsonLd && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isAr ? 'بيانات Schema.org المنظمة (JSON-LD Article):' : 'Schema.org Article JSON-LD:'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(projSchemaJsonLd, null, 2));
                                setCopiedSchemaSnippet(true);
                                setTimeout(() => setCopiedSchemaSnippet(false), 2000);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-white border border-slate-200 px-2 py-1 rounded-lg cursor-pointer"
                            >
                              {copiedSchemaSnippet ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedSchemaSnippet ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Schema' : 'Copy Schema')}</span>
                            </button>
                          </div>
                          <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-36 dir-ltr text-left">
                            {JSON.stringify(projSchemaJsonLd, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProject(false);
                        setEditingProjectId(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حفظ دراسة الحالة' : 'Save Project'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isAr ? 'دراسات الحالة المعروضة في الأرشيف:' : 'Case studies currently featured:'}
                    </span>
                    <button
                      onClick={startAddProject}
                      className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة دراسة حالة جديدة' : 'Add New Case Study'}</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">{isAr ? 'المشروع' : 'Project'}</th>
                          <th className="p-3">{isAr ? 'القطاع' : 'Sector'}</th>
                          <th className="p-3">{isAr ? 'مؤشر الأداء' : 'Top Metric'}</th>
                          <th className="p-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.caseStudies.map((study) => (
                          <tr key={study.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{isAr ? study.title : study.titleEn}</div>
                              <div className="text-[11px] text-slate-500">{isAr ? study.client : study.clientEn}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-600 uppercase">
                              {study.sector}
                            </td>
                            <td className="p-3 font-bold text-sky-600 tabular-nums">
                              {study.metrics[0]?.value}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => startEditProject(study)}
                                  className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(isAr ? `حذف ${study.title}؟` : `Delete ${study.title}?`)) {
                                      deleteCaseStudy(study.id);
                                      showNotice(isAr ? 'تم الحذف.' : 'Deleted.');
                                    }
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMO BANNER */}
          {activeTab === 'banner' && (
            <form onSubmit={handleSaveBanner} className="space-y-4 max-w-2xl bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
                {isAr ? 'إدارة شريط الإعلانات والعروض أعلى الموقع' : 'Global Promo & Announcement Banner'}
              </h4>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => setBannerEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>{isAr ? 'تفعيل ظهور الشريط الترويجي أعلى الموقع' : 'Enable Promo Banner on Top'}</span>
              </label>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isAr ? 'شارة العرض (Tag):' : 'Tag Badge:'}</label>
                <input
                  type="text"
                  value={bannerTag}
                  onChange={(e) => setBannerTag(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isAr ? 'نص العرض الترويجي:' : 'Announcement Copy:'}</label>
                <textarea
                  rows={3}
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ إعدادات الشريط' : 'Save Banner'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: BACKUP & RESET */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  {isAr ? 'تصدير واستيراد البيانات (Data Backup)' : 'Data Export & Import'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr ? 'احفظ نسخة من كافة التعديلات والمشاريع في ملف JSON أو استعد نسخة سابقة.' : 'Save a full JSON backup of your customized packages and case studies.'}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'تنزيل نسخة احتياطية (JSON)' : 'Download Backup (JSON)'}</span>
                  </button>

                  <label className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'استيراد ملف نسخة احتياطية' : 'Import JSON Backup'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="p-6 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-3">
                <h4 className="text-sm font-bold text-rose-900">
                  {isAr ? 'استعادة البيانات الأولية للوكالة' : 'Reset to Agency Defaults'}
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {isAr ? 'إذا أردت استرجاع دراسات الحالة والباقات والأسعار الأصلية المعتمدة لوكالة «ديجيتال إفكت».' : 'Restore factory case studies, packages, and benchmarks.'}
                </p>
                <button
                  onClick={() => {
                    if (confirm(isAr ? 'استرجاع البيانات الأصلية؟' : 'Reset to defaults?')) {
                      resetToDefaults();
                      showNotice(isAr ? 'تمت استعادة البيانات الأصلية.' : 'Defaults restored.');
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isAr ? 'إعادة ضبط البيانات للوضع المصنعي' : 'Reset to Factory Defaults'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{isAr ? 'التعديلات تُحفظ تلقائياً في المتصفح وتظهر مباشرة للزوار.' : 'Changes sync in real-time and persist across sessions.'}</span>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق لوحة الإدارة' : 'Close CMS'}
          </button>
        </div>
      </div>

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
        }}
      />

      {/* Client Profile & Retainer Account Drawer */}
      <ClientAccountDrawer
        client={selectedClientForAccount}
        isOpen={isClientAccountOpen}
        onClose={() => {
          setIsClientAccountOpen(false);
          setSelectedClientForAccount(null);
        }}
        onClientUpdated={(updated) => {
          setSelectedClientForAccount(updated);
          showNotice(isAr ? 'تم حفظ وتحديث بيانات حساب العميل بنجاح!' : 'Client account updated successfully!');
        }}
      />
    </div>
  );
};
