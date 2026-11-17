import React, { useState, useEffect, useMemo } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType, ServicePackage, Inquiry } from '../types';
import { 
  X, 
  UserPlus, 
  Building2, 
  Phone, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Layers,
  Save,
  Check,
  Sliders,
  Plus,
  Minus,
  Film,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { submitInquiry, updateInquiryStatusInDb, isSupabaseConfigured, supabase } from '../lib/supabase';
import { validateAndFormatPhone } from '../lib/phoneUtils';
import { parseInvoiceAmount } from '../utils/invoicePdfGenerator';
import { 
  calculateCustomPackageCost, 
  buildServicePackageFromCustomCalculation 
} from '../utils/pricingCalculator';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (inquiry: Inquiry) => void;
  defaultSector?: SectorType;
  defaultStatus?: Inquiry['status'];
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded,
  defaultSector = 'b2c',
  defaultStatus = 'new',
}) => {
  const { data, language, addInquiry, addPackage } = useAgencyData();
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState<SectorType>(defaultSector);
  const [status, setStatus] = useState<Inquiry['status']>(defaultStatus);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Package Mode: 'catalog' (Ready packages) vs 'builder' (Interactive Slider Customizer)
  const [packageMode, setPackageMode] = useState<'catalog' | 'builder'>('catalog');

  // Ready Package Selection State
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');

  // Interactive Package Designer Sliders
  const [postsCount, setPostsCount] = useState<number>(12);
  const [reelsCount, setReelsCount] = useState<number>(2);
  const [storiesCount, setStoriesCount] = useState<number>(2);
  const [period, setPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [saveAsWebsitePackage, setSaveAsWebsitePackage] = useState(false);

  // Manual budget override when in catalog mode or user custom edits
  const [manualBudget, setManualBudget] = useState('');
  const [isManualBudgetSet, setIsManualBudgetSet] = useState(false);

  // Available packages for the selected sector
  const sectorPackages = data.packages.filter(
    (p) => sector === 'all' || p.sector === sector
  );

  // Sync default status when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus || 'new');
      setError(null);
    }
  }, [isOpen, defaultStatus]);

  // Reset defaults when sector changes
  useEffect(() => {
    if (!isOpen) return;

    if (sector === 'b2b') {
      setPostsCount(4);
      setReelsCount(0);
      setStoriesCount(0);
    } else if (sector === 'medical') {
      setPostsCount(8);
      setReelsCount(4);
      setStoriesCount(0);
    } else {
      setPostsCount(12);
      setReelsCount(2);
      setStoriesCount(2);
    }

    const pkgs = data.packages.filter((p) => p.sector === sector);
    if (pkgs.length > 0) {
      const best = pkgs.find((p) => p.isPopular) || pkgs[0];
      setSelectedPkgId(best.id);
      setManualBudget(
        isAr 
          ? `${best.price.toLocaleString('ar-EG')} ج.م شهرياً` 
          : `${best.price.toLocaleString('en-US')} EGP / month`
      );
      setIsManualBudgetSet(false);
    } else {
      setSelectedPkgId('');
      setPackageMode('builder');
    }
  }, [sector, isOpen]);

  // Live calculation for the custom builder
  const customCalculation = useMemo(() => {
    return calculateCustomPackageCost({
      sector: sector === 'all' ? 'b2c' : sector,
      postsCount,
      reelsCount,
      storiesCount,
      period,
      includeMonthlyPlan: true,
    });
  }, [sector, postsCount, reelsCount, storiesCount, period]);

  // Effective package name and budget based on active mode
  const effectivePackageName = useMemo(() => {
    if (packageMode === 'builder') {
      return isAr ? customCalculation.recommendedName : customCalculation.recommendedNameEn;
    }
    const found = data.packages.find((p) => p.id === selectedPkgId);
    if (found) {
      return isAr ? found.name : found.nameEn;
    }
    return isAr ? 'باقة مخصصة' : 'Custom Package';
  }, [packageMode, customCalculation, selectedPkgId, data.packages, isAr]);

  const effectiveBudget = useMemo(() => {
    if (isManualBudgetSet && manualBudget) {
      return manualBudget;
    }
    if (packageMode === 'builder') {
      const price = period === 'quarterly' ? customCalculation.quarterlyPrice : customCalculation.monthlyPrice;
      return isAr 
        ? `${price.toLocaleString('ar-EG')} ج.م ${period === 'quarterly' ? '/ ربع سنوي' : '/ شهرياً'}`
        : `${price.toLocaleString('en-US')} EGP ${period === 'quarterly' ? '/ quarter' : '/ month'}`;
    }
    const found = data.packages.find((p) => p.id === selectedPkgId);
    if (found) {
      return isAr 
        ? `${found.price.toLocaleString('ar-EG')} ج.م ${found.period}` 
        : `${found.price.toLocaleString('en-US')} ${found.currencyEn} ${found.periodEn}`;
    }
    return isAr ? '15,000 ج.م شهرياً' : '15,000 EGP / month';
  }, [isManualBudgetSet, manualBudget, packageMode, period, customCalculation, selectedPkgId, data.packages, isAr]);

  if (!isOpen) return null;

  // Handle ready package selection
  const handleCatalogPackageChange = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setIsManualBudgetSet(false);
    const found = data.packages.find((p) => p.id === pkgId);
    if (found) {
      setManualBudget(
        isAr 
          ? `${found.price.toLocaleString('ar-EG')} ج.م ${found.period}` 
          : `${found.price.toLocaleString('en-US')} ${found.currencyEn} ${found.periodEn}`
      );
    }
  };

  // Switch from Catalog to Builder pre-populating counts from the chosen package
  const handleCustomizeCurrentPackage = () => {
    const found = data.packages.find((p) => p.id === selectedPkgId);
    if (found) {
      if (found.postsCount !== undefined) setPostsCount(found.postsCount);
      if (found.reelsCount !== undefined) setReelsCount(found.reelsCount);
      if (found.storiesCount !== undefined) setStoriesCount(found.storiesCount);
    }
    setIsManualBudgetSet(false);
    setPackageMode('builder');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      setError(isAr ? 'يرجى كتابة اسم العميل بالكامل.' : 'Please enter client name.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setError(isAr ? 'يرجى كتابة رقم هاتف صالح (٨ أرقام على الأقل).' : 'Please enter a valid phone number.');
      return;
    }

    const phoneVal = validateAndFormatPhone(cleanPhone, 'EG');
    const finalPhoneE164 = phoneVal.isValid && phoneVal.e164 ? phoneVal.e164 : cleanPhone;

    setError(null);
    setIsSubmitting(true);

    try {
      let finalPkgId: string | undefined = undefined;
      let finalPkgName = effectivePackageName;

      // If in builder mode and user wants to save this as a permanent package in the agency packages:
      if (packageMode === 'builder') {
        finalPkgId = undefined;
        if (saveAsWebsitePackage) {
          const newPkgData = buildServicePackageFromCustomCalculation(customCalculation);
          addPackage(newPkgData);
        }
      } else {
        finalPkgId = selectedPkgId || undefined;
      }

      // 1. Sync with Supabase if configured
      let cloudId: string | undefined = undefined;
      if (isSupabaseConfigured && supabase) {
        try {
          const subRes = await submitInquiry({
            name: cleanName,
            phone: cleanPhone,
            phoneE164: finalPhoneE164,
            phoneCountry: 'EG',
            visitorCountry: 'CRM Manual Entry',
            company: company.trim() || undefined,
            sector,
            packageId: finalPkgId,
            packageName: finalPkgName,
            budget: effectiveBudget.trim() || undefined,
            notes: notes.trim() || undefined,
          });
          if (subRes?.success && subRes?.isDatabaseBacked && subRes?.id) {
            cloudId = subRes.id;
            if (status !== 'new') {
              await updateInquiryStatusInDb(subRes.id, status);
            }
          }
        } catch (cloudErr) {
          console.warn('Could not sync newly created client to Supabase immediately:', cloudErr);
        }
      }

      // Determine deliverable targets based on mode
      const currentCatalogPkg = data.packages.find((p) => p.id === selectedPkgId);
      const finalPostsTarget = packageMode === 'builder' ? postsCount : (currentCatalogPkg?.postsCount ?? (sector === 'b2b' ? 4 : sector === 'medical' ? 8 : 12));
      const finalReelsTarget = packageMode === 'builder' ? reelsCount : (currentCatalogPkg?.reelsCount ?? (sector === 'b2b' ? 0 : sector === 'medical' ? 4 : 2));
      const finalStoriesTarget = packageMode === 'builder' ? storiesCount : (currentCatalogPkg?.storiesCount ?? (sector === 'b2c' ? 2 : 0));

      const parsedRetainer = parseInvoiceAmount(effectiveBudget);

      // 2. Persist in agency CRM state (and sync full record to crm_client_accounts)
      const createdClient = addInquiry({
        id: cloudId,
        name: cleanName,
        phone: cleanPhone,
        phoneE164: finalPhoneE164,
        phoneCountry: 'EG',
        visitorCountry: 'CRM Manual',
        company: company.trim() || undefined,
        sector,
        packageId: finalPkgId,
        packageName: finalPkgName,
        budget: effectiveBudget.trim() || undefined,
        retainerAmount: parsedRetainer > 0 ? parsedRetainer : undefined,
        billingCycle: period,
        notes: notes.trim() || undefined,
        status,
        postsTarget: finalPostsTarget,
        reelsTarget: finalReelsTarget,
        storiesTarget: finalStoriesTarget,
        postsDelivered: 0,
        reelsDelivered: 0,
        storiesDelivered: 0,
      });

      if (onClientAdded) {
        onClientAdded(createdClient);
      }

      // Reset and close
      setName('');
      setPhone('');
      setCompany('');
      setNotes('');
      setIsManualBudgetSet(false);
      onClose();
    } catch (err: any) {
      console.error('Error adding client:', err);
      setError(isAr ? 'حدث خطأ أثناء حفظ بيانات العميل.' : 'Failed to save client data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCatalogPkg = data.packages.find((p) => p.id === selectedPkgId);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1.25rem)] sm:max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
                <span>{isAr ? 'إضافة عميل جديد وتحديد / تصميم الباقة' : 'Add Client & Configure Package'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  CRM Deal
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'اختر باقة جاهزة أو صمم باقة مخصصة بالعدادات مع حساب التكلفة فورياً' : 'Select a package or design custom deliverables with live pricing calculator'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Sector Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>{isAr ? 'قطاع العميل المستهدف:' : 'Client Sector:'}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {isAr ? 'يحدد أسعار الوحدات والباقات الملائمة' : 'Sets rates & tailored deliverables'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'b2c', labelAr: 'التجارة والمتاجر (B2C)', labelEn: 'B2C E-commerce' },
                { id: 'b2b', labelAr: 'الشركات والمصانع (B2B)', labelEn: 'B2B Enterprise' },
                { id: 'medical', labelAr: 'العيادات والمراكز (طبي)', labelEn: 'Healthcare' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSector(s.id as SectorType)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-all border text-center cursor-pointer ${
                    sector === s.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isAr ? s.labelAr : s.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'اسم العميل / صانع القرار *' : 'Client Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? 'مثال: أ / كريم عزمي' : 'e.g. Michael Scott'}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{isAr ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}</span>
                <span className="text-[10px] text-slate-400 font-normal">مصر (+20)</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isAr ? '01004860386' : '+20 100 486 0386'}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors text-start"
                dir="ltr"
              />
            </div>
          </div>

          {/* Company / Brand Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAr ? 'اسم الشركة / العيادة / النشاط التجاري (اختياري)' : 'Company / Clinic / Brand Name (Optional)'}</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={isAr ? 'مثال: براند ملابس دبل وير / عيادة د. رامي' : 'e.g. Apex Health Clinic'}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          {/* ============================================================ */}
          {/* PACKAGE CONFIGURATION: READY CATALOG vs INTERACTIVE DESIGNER  */}
          {/* ============================================================ */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                <span>{isAr ? 'تحديد باقة العميل:' : 'Package Selection:'}</span>
              </label>

              <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPackageMode('catalog')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    packageMode === 'catalog'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3 h-3 text-sky-600" />
                  <span>{isAr ? 'باقة جاهزة من القائمة' : 'Ready Packages'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageMode('builder')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    packageMode === 'builder'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>{isAr ? 'تصميم باقة مخصصة بالعدادات' : 'Custom Builder'}</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                    {isAr ? 'تفاعلي' : 'Live'}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: READY CATALOG PACKAGE */}
            {packageMode === 'catalog' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isAr ? `اختر من باقات قطاع (${sector.toUpperCase()}) المعروضة في الموقع:` : `Select from active ${sector.toUpperCase()} packages:`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {sectorPackages.length} {isAr ? 'باقات متوفرة' : 'packages'}
                  </span>
                </div>

                <select
                  value={selectedPkgId}
                  onChange={(e) => handleCatalogPackageChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white font-bold text-slate-800 cursor-pointer shadow-2xs"
                >
                  {sectorPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {isAr ? pkg.name : pkg.nameEn} — ({pkg.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? pkg.currency : pkg.currencyEn} {pkg.period})
                    </option>
                  ))}
                </select>

                {/* Selected Package Deliverables */}
                {selectedCatalogPkg && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-700">
                        <span className="font-bold text-sky-800">{isAr ? 'المخرجات المتضمنة:' : 'Deliverables:'}</span>
                        {selectedCatalogPkg.postsCount !== undefined && (
                          <span className="font-semibold">{selectedCatalogPkg.postsCount} {isAr ? 'بوست' : 'posts'}</span>
                        )}
                        {selectedCatalogPkg.reelsCount !== undefined && selectedCatalogPkg.reelsCount > 0 && (
                          <span className="font-semibold">• {selectedCatalogPkg.reelsCount} {isAr ? 'ريلز' : 'reels'}</span>
                        )}
                        {selectedCatalogPkg.storiesCount !== undefined && selectedCatalogPkg.storiesCount > 0 && (
                          <span className="font-semibold">• {selectedCatalogPkg.storiesCount} {isAr ? 'ستوري' : 'stories'}</span>
                        )}
                        {selectedCatalogPkg.frequency && (
                          <span className="text-slate-400">({selectedCatalogPkg.frequency})</span>
                        )}
                      </div>

                      {selectedCatalogPkg.quarterlyPrice && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {isAr ? `ربع سنوي: ${selectedCatalogPkg.quarterlyPrice.toLocaleString('ar-EG')} ج.م` : `Quarterly: ${selectedCatalogPkg.quarterlyPrice.toLocaleString('en-US')} EGP`}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {isAr ? selectedCatalogPkg.tagline : selectedCatalogPkg.taglineEn}
                    </p>

                    {/* Customize button */}
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleCustomizeCurrentPackage}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{isAr ? 'تعديل وتخصيص مخرجات هذه الباقة في المصمم ←' : 'Customize deliverables in builder →'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INTERACTIVE CUSTOM BUILDER (SLIDERS & REAL-TIME COST) */}
            {packageMode === 'builder' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/80">
                  <span className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'حاسبة الباقات المخصصة الذكية (حساب مباشر في الوقت الفعلي):' : 'Interactive Custom Deliverables Calculator:'}</span>
                  </span>

                  {/* Contract Period Toggle */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400 font-medium me-1">{isAr ? 'المدة:' : 'Period:'}</span>
                    <button
                      type="button"
                      onClick={() => setPeriod('monthly')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        period === 'monthly' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isAr ? 'شهري' : 'Monthly'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod('quarterly')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        period === 'quarterly' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isAr ? 'ربع سنوي (خصم)' : 'Quarterly'}
                    </button>
                  </div>
                </div>

                {/* Sliders Grid */}
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  {/* SLIDER 1: POSTS */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isAr ? 'عدد البوستات / التصاميم الاحترافية:' : 'Graphic Posts:'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPostsCount(Math.max(2, postsCount - 2))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-black text-sky-900 text-sm w-7 text-center">{postsCount}</span>
                        <button
                          type="button"
                          onClick={() => setPostsCount(Math.min(36, postsCount + 2))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-400 ms-1">{isAr ? 'منشور/شهر' : '/mo'}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={36}
                      step={1}
                      value={postsCount}
                      onChange={(e) => setPostsCount(Number(e.target.value))}
                      className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* SLIDER 2: REELS */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-purple-600" />
                        <span>{isAr ? 'عدد مقاطع الريلز وفيديوهات الانتشار:' : 'Video Reels (AI & Motion):'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReelsCount(Math.max(0, reelsCount - 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-black text-purple-900 text-sm w-7 text-center">{reelsCount}</span>
                        <button
                          type="button"
                          onClick={() => setReelsCount(Math.min(20, reelsCount + 1))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-400 ms-1">{isAr ? 'فيديو/شهر' : '/mo'}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={reelsCount}
                      onChange={(e) => setReelsCount(Number(e.target.value))}
                      className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* SLIDER 3: STORIES */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isAr ? 'عدد الستوريز التفاعلية:' : 'Interactive Stories:'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStoriesCount(Math.max(0, storiesCount - 2))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-black text-amber-900 text-sm w-7 text-center">{storiesCount}</span>
                        <button
                          type="button"
                          onClick={() => setStoriesCount(Math.min(40, storiesCount + 2))}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-400 ms-1">{isAr ? 'ستوري/شهر' : '/mo'}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={1}
                      value={storiesCount}
                      onChange={(e) => setStoriesCount(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Live Cost Output Banner */}
                <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white p-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-sky-300 font-bold uppercase tracking-wider">
                      {isAr ? 'الباقة المصممة للعميل:' : 'Designed Custom Plan:'}
                    </div>
                    <div className="text-xs font-black text-white">
                      {isAr ? customCalculation.recommendedName : customCalculation.recommendedNameEn}
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
                      <span>• {postsCount} {isAr ? 'بوست' : 'posts'}</span>
                      <span>• {reelsCount} {isAr ? 'ريلز' : 'reels'}</span>
                      <span>• {storiesCount} {isAr ? 'ستوري' : 'stories'}</span>
                      <span>• {isAr ? 'خطة استراتيجية شهرية' : 'Monthly strategy included'}</span>
                    </div>
                  </div>

                  <div className="text-start sm:text-end shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/15">
                    <div className="text-[10px] text-slate-300 font-medium">
                      {period === 'quarterly' ? (isAr ? 'التكلفة الربع سنوية:' : 'Quarterly Cost:') : (isAr ? 'التكلفة الشهرية:' : 'Monthly Cost:')}
                    </div>
                    <div className="text-base font-black text-emerald-400 tabular-nums">
                      {(period === 'quarterly' ? customCalculation.quarterlyPrice : customCalculation.monthlyPrice).toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'ج.م' : 'EGP'}
                    </div>
                    {period === 'quarterly' && customCalculation.quarterlySavings > 0 && (
                      <div className="text-[10px] text-amber-300 font-bold">
                        {isAr ? `توفير ${customCalculation.quarterlySavings.toLocaleString('ar-EG')} ج.م` : `Save ${customCalculation.quarterlySavings.toLocaleString('en-US')} EGP`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Option to also publish this custom package in the public website catalog */}
                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={saveAsWebsitePackage}
                    onChange={(e) => setSaveAsWebsitePackage(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {isAr ? 'نشر هذه الباقة المصممة كباقة رسمية في الموقع أيضاً' : 'Also publish this custom package to public site packages'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Deal Value & CRM Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'قيمة التعاقد / الميزانية الشهرية' : 'Deal Value / Monthly Retainer'}</span>
                </span>
                {isManualBudgetSet && (
                  <button
                    type="button"
                    onClick={() => setIsManualBudgetSet(false)}
                    className="text-[10px] text-sky-600 hover:underline cursor-pointer"
                  >
                    {isAr ? 'إعادة ضبط للسعر المحسوب' : 'Reset to auto-calculated'}
                  </button>
                )}
              </label>
              <input
                type="text"
                value={effectiveBudget}
                onChange={(e) => {
                  setManualBudget(e.target.value);
                  setIsManualBudgetSet(true);
                }}
                placeholder={isAr ? 'مثال: 18,000 ج.م شهرياً' : 'e.g. 18,000 EGP / month'}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white font-bold text-slate-900 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{isAr ? 'حالة الصفقة في الـ CRM' : 'CRM Deal Stage'}</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Inquiry['status'])}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer"
              >
                <option value="new">{isAr ? 'جديد (وارد حديثاً / Lead)' : 'New Lead'}</option>
                <option value="contacted">{isAr ? 'قيد التواصل والتفاوض (In Discussion)' : 'In Discussion'}</option>
                <option value="closed">{isAr ? 'تم التعاقد والاتفاق (Closed Won)' : 'Closed Deal'}</option>
                <option value="cancelled">{isAr ? 'ملغي / غير مهتم (Lost)' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAr ? 'ملاحظات وتفاصيل متفق عليها مع العميل (اختياري)' : 'Contract Notes & Requirements (Optional)'}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'مثال: تم الاتفاق على بدء تصوير المنتجات الأحد القادم، والدفعة الأولى ٥٠٪ مقدم...' : 'e.g. Agreed to shoot next week, 50% upfront payment...'}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ وإضافة العميل' : 'Save & Add Client')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
