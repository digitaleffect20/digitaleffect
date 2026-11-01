import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { CaseStudy, ServicePackage } from '../types';
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
  Sparkles
} from 'lucide-react';

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
    updateBanner,
    resetToDefaults,
    exportDataJson,
    importDataJson
  } = useAgencyData();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'packages' | 'projects' | 'banner' | 'backup'>('packages');

  // Package Form States
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
  const startAddPackage = () => {
    setEditingPackageId(null);
    setIsAddingPackage(true);
    setPkgName('');
    setPkgNameEn('');
    setPkgSector('b2b');
    setPkgPrice(15000);
    setPkgOriginalPrice(18000);
    setPkgQuarterlyPrice(undefined);
    setPkgPostsCount(8);
    setPkgReelsCount(2);
    setPkgStoriesCount(0);
    setPkgFrequency('');
    setPkgHasMonthlyPlan(false);
    setPkgHasOffer(true);
    setPkgOfferNote('عرض إطلاق خاص');
    setPkgIsPopular(false);
    setPkgTagline('وصف مختصر لقيمة الباقة');
    setPkgTaglineEn('Brief high-impact package summary');
    setPkgIdealFor('الشركات والعملاء المستهدفين');
    setPkgFeaturesText('الميزة الأولى والخدمة الأساسية\nإنتاج المحتوى التخصصي\nإدارة الحملات الإعلانية\nتقارير أداء دورية');
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative text-start flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isAr ? 'قائمة الباقات والعروض المفعلة حالياً في الموقع:' : 'Manage active packages, highlights, and promotional discounts:'}
                    </span>
                    <button
                      onClick={startAddPackage}
                      className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة باقة جديدة' : 'Add New Package'}</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">{isAr ? 'اسم الباقة' : 'Package Name'}</th>
                          <th className="p-3">{isAr ? 'القطاع' : 'Sector'}</th>
                          <th className="p-3">{isAr ? 'السعر' : 'Price'}</th>
                          <th className="p-3">{isAr ? 'التمييز والعرض' : 'Highlight Status'}</th>
                          <th className="p-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.packages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-900">
                              {isAr ? pkg.name : pkg.nameEn}
                              {pkg.isPopular && (
                                <span className="ms-2 text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                                  {isAr ? 'الأكثر طلباً' : 'Popular'}
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-semibold text-slate-600 uppercase">
                              {pkg.sector}
                            </td>
                            <td className="p-3 font-bold tabular-nums">
                              {pkg.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? pkg.currency : pkg.currencyEn}
                            </td>
                            <td className="p-3">
                              {pkg.hasOffer ? (
                                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                  {pkg.offerNote || 'Offer'}
                                </span>
                              ) : (
                                <span className="text-slate-400">{isAr ? 'سعر قياسي' : 'Standard'}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => startEditPackage(pkg)}
                                  className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Package"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(isAr ? `هل أنت متأكد من حذف ${pkg.name}؟` : `Delete ${pkg.name}?`)) {
                                      deletePackage(pkg.id);
                                      showNotice(isAr ? 'تم حذف الباقة.' : 'Package deleted.');
                                    }
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Package"
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
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">
                      {editingProjectId ? (isAr ? 'تعديل دراسة الحالة' : 'Edit Case Study') : (isAr ? 'إضافة دراسة حالة جديدة' : 'Add New Case Study')}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProject(false);
                        setEditingProjectId(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
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
    </div>
  );
};
