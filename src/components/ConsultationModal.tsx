import React, { useState, useEffect } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType, PromoCode } from '../types';
import { X, Send, CheckCircle2, MessageSquare, Phone, Building2, User, Loader2, AlertCircle, Tag, Check, Sparkles } from 'lucide-react';
import { submitInquiry } from '../lib/supabase';
import { InternationalPhoneInput } from './InternationalPhoneInput';
import { CountryCode } from 'libphonenumber-js';
import { fetchVisitorCountry, validateAndFormatPhone } from '../lib/phoneUtils';

export const ConsultationModal: React.FC = () => {
  const { 
    data,
    isConsultationOpen, 
    setIsConsultationOpen, 
    selectedPackageForInquiry, 
    setSelectedPackageForInquiry,
    activeSector,
    language,
    t,
    validatePromoCode,
    recordPromoUsage,
  } = useAgencyData();

  const isAr = language === 'ar';
  const m = t.modal;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('EG');
  const [visitorCountry, setVisitorCountry] = useState<string>('Unknown');
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`));

  const [company, setCompany] = useState('');
  const [sector, setSector] = useState<SectorType>(
    selectedPackageForInquiry ? selectedPackageForInquiry.sector : (activeSector !== 'all' ? activeSector : 'b2b')
  );
  const [budget, setBudget] = useState(isAr ? '20,000 - 40,000 ج.م' : '20,000 - 40,000 EGP');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCloudStored, setIsCloudStored] = useState(false);

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    promo?: PromoCode;
  } | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);


  // Cloudflare GeoIP Auto-Detection on open
  useEffect(() => {
    let mounted = true;
    if (isConsultationOpen) {
      fetchVisitorCountry().then((detected) => {
        if (mounted && detected && detected !== 'Unknown') {
          setVisitorCountry(detected);
          // Default phone country matches visitor country if detected
          setPhoneCountry(detected as CountryCode);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [isConsultationOpen]);

  useEffect(() => {
    if (selectedPackageForInquiry) {
      setSector(selectedPackageForInquiry.sector);
    }
  }, [selectedPackageForInquiry]);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isConsultationOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isConsultationOpen]);

  if (!isConsultationOpen) return null;

  const handleClose = () => {
    setIsConsultationOpen(false);
    setSelectedPackageForInquiry(null);
    setSubmitted(false);
    setSubmitError(null);
    setAppliedPromo(null);
    setPromoMessage(null);
    setPromoError(null);
    setPromoCodeInput('');
    // Refresh idempotency key for the next session
    setIdempotencyKey(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`);
  };

  const handleApplyPromo = () => {
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) {
      setPromoError(isAr ? 'يرجى إدخال كود الخصم أولاً.' : 'Please enter a promo code.');
      return;
    }

    const basePrice = selectedPackageForInquiry ? selectedPackageForInquiry.price : 20000;
    const result = validatePromoCode(clean, basePrice, sector);

    if (!result.isValid) {
      setPromoError(result.message);
      setAppliedPromo(null);
      setPromoMessage(null);
    } else {
      setAppliedPromo({
        code: clean,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice,
        promo: result.promo,
      });
      const successMsg = selectedPackageForInquiry
        ? result.message
        : (isAr
            ? `تم تفعيل كود الخصم (${clean}) بنجاح! سيتم تطبيق خصم ${result.promo?.discountType === 'percentage' ? `${result.promo.discountValue}%` : `${result.promo?.discountValue.toLocaleString('ar-EG')} ج.م`} على خطتك وتعاقدك.`
            : `Promo code (${clean}) applied successfully!`);
      setPromoMessage(successMsg);
      setPromoError(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoMessage(null);
    setPromoError(null);
    setPromoCodeInput('');
  };

  const packageName = selectedPackageForInquiry ? (isAr ? selectedPackageForInquiry.name : selectedPackageForInquiry.nameEn) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      setSubmitError(isAr ? 'يرجى كتابة الاسم بالكامل (حرفان على الأقل).' : 'Please enter your full name.');
      return;
    }

    // Comprehensive international phone validation via libphonenumber-js
    const phoneVal = validateAndFormatPhone(cleanPhone, phoneCountry);
    if (!phoneVal.isValid || !phoneVal.e164) {
      setSubmitError(isAr ? phoneVal.errorMessageAr || 'رقم الهاتف غير صالح' : phoneVal.errorMessageEn || 'Invalid phone number');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await submitInquiry({
        name: cleanName,
        phone: cleanPhone,
        phoneE164: phoneVal.e164,
        phoneCountry: phoneCountry,
        visitorCountry: visitorCountry || 'Unknown',
        idempotencyKey,
        company: company.trim() || undefined,
        sector,
        packageId: selectedPackageForInquiry?.id,
        packageName: packageName || undefined,
        budget,
        notes: notes.trim() || undefined,
        promoCode: appliedPromo?.code,
        discountAmount: appliedPromo?.discountAmount,
        finalPrice: appliedPromo?.finalPrice,
      });

      // Strict enforcement: Never show success unless confirmed by database!
      if (!res.success) {
        setSubmitError(res.error || (isAr ? 'تعذر تسجيل الطلب في قاعدة البيانات المركزية. يرجى استخدام زر الواتساب للتواصل الفوري.' : 'Failed to save inquiry to database.'));
        setIsSubmitting(false);
        return;
      }

      if (appliedPromo) {
        recordPromoUsage(appliedPromo.code);
      }

      setIsCloudStored(true);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(isAr ? 'حدث خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً أو التواصل عبر الواتساب.' : 'Database connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const pkgLabel = packageName || (isAr ? 'استشارة استراتيجية عامة' : 'General Strategy Call');
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const phoneVal = validateAndFormatPhone(cleanPhone, phoneCountry);

    if (cleanName && phoneVal.isValid && phoneVal.e164 && !submitted) {
      // Fire-and-forget attempt to database without blocking WhatsApp opening
      submitInquiry({
        name: cleanName,
        phone: cleanPhone,
        phoneE164: phoneVal.e164,
        phoneCountry: phoneCountry,
        visitorCountry: visitorCountry || 'Unknown',
        idempotencyKey,
        company: company.trim() || undefined,
        sector,
        packageId: selectedPackageForInquiry?.id,
        packageName: pkgLabel,
        budget,
        notes: notes.trim() || undefined,
        promoCode: appliedPromo?.code,
        discountAmount: appliedPromo?.discountAmount,
        finalPrice: appliedPromo?.finalPrice,
      }).catch(console.error);

      if (appliedPromo) {
        recordPromoUsage(appliedPromo.code);
      }
    }

    const promoInfoAr = appliedPromo 
      ? `\nكود الخصم المطبق: ${appliedPromo.code}\nقيمة الخصم: ${appliedPromo.discountAmount.toLocaleString('ar-EG')} ج.م\nالسعر بعد الخصم: ${appliedPromo.finalPrice.toLocaleString('ar-EG')} ج.م`
      : '';
    const promoInfoEn = appliedPromo 
      ? `\nPromo Code Applied: ${appliedPromo.code}\nDiscount: ${appliedPromo.discountAmount.toLocaleString('en-US')} EGP\nFinal Price: ${appliedPromo.finalPrice.toLocaleString('en-US')} EGP`
      : '';

    const message = isAr
      ? `مرحباً فريق ديجيتال إفكت،
أنا: ${cleanName || 'مهتم'}
النشاط / الشركة: ${company.trim() || 'غير محدد'}
القطاع: ${sector.toUpperCase()}
الباقة المستهدفة: ${pkgLabel}
الميزانية المقترحة: ${budget}${promoInfoAr}
ملاحظات: ${notes.trim() || 'أود مناقشة خطة العمل معكم'}`
      : `Hello Digital Effect Team,
Name: ${cleanName || 'Interested Client'}
Company: ${company.trim() || 'Not Specified'}
Sector: ${sector.toUpperCase()}
Target Plan: ${pkgLabel}
Budget: ${budget}${promoInfoEn}
Notes: ${notes.trim() || 'Looking forward to reviewing strategic growth options'}`;

    window.open(`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1.25rem)] sm:max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Sticky at the top so it never disappears on mobile */}
        <div className="sticky top-0 z-30 px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {packageName ? `${m.selectedPkg} ${packageName}` : m.consultationTitle}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate sm:whitespace-normal">
              {m.consultationDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 sm:p-2.5 text-slate-500 hover:text-slate-900 bg-white sm:bg-slate-100/80 rounded-full border border-slate-200 hover:bg-slate-200/80 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
            aria-label={isAr ? 'إغلاق النافذة' : 'Close modal'}
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Content - Scrollable on mobile and desktop */}
        <div className="p-4 sm:p-7 overflow-y-auto overscroll-contain flex-1">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                {m.successTitle}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {m.successDesc}
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  {m.backBtn}
                </button>
                <button
                  onClick={handleWhatsAppDirect}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{m.whatsAppDirect}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Package Summary Header (Clean) */}
              {selectedPackageForInquiry && (
                <div className="bg-gradient-to-r from-sky-50 via-sky-50/60 to-indigo-50/50 rounded-2xl border border-sky-100 p-3.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      ★
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">{m.selectedPkg}</div>
                      <div className="text-xs font-bold text-slate-800">{packageName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-end">
                      {appliedPromo ? (
                        <>
                          <div className="text-[11px] text-slate-400 line-through">
                            {selectedPackageForInquiry.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? selectedPackageForInquiry.currency : selectedPackageForInquiry.currencyEn}
                          </div>
                          <div className="text-sm font-black text-emerald-600 tabular-nums">
                            {appliedPromo.finalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? selectedPackageForInquiry.currency : selectedPackageForInquiry.currencyEn}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm font-black text-sky-900 tabular-nums">
                          {selectedPackageForInquiry.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? selectedPackageForInquiry.currency : selectedPackageForInquiry.currencyEn}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageForInquiry(null);
                        handleRemovePromo();
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-600 underline font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      {isAr ? 'تغيير' : 'Change'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>{m.nameLabel}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: أ / أحمد علي' : 'e.g. John Smith'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span>{m.phoneLabel}</span>
                    </span>
                    {visitorCountry && visitorCountry !== 'Unknown' && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {isAr ? `(تم تحديد الدولة: ${visitorCountry})` : `(Detected: ${visitorCountry})`}
                      </span>
                    )}
                  </label>
                  <InternationalPhoneInput
                    value={phone}
                    selectedCountry={phoneCountry}
                    onChange={setPhone}
                    onCountryChange={setPhoneCountry}
                    onValidationChange={(valid, e164) => {
                      setIsPhoneValid(valid);
                      setPhoneE164(e164);
                    }}
                    isAr={isAr}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>{m.companyLabel}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم نشاطك التجاري' : 'Your brand or facility name'}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {m.sectorLabel}
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as SectorType)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
                  >
                    <option value="b2b">{isAr ? 'قطاع الشركات والمصانع (B2B)' : 'B2B Enterprise & Industrial'}</option>
                    <option value="b2c">{isAr ? 'التجارة والمستهلكين (B2C)' : 'B2C & E-Commerce'}</option>
                    <option value="medical">{isAr ? 'القطاع الطبي والرعاية الصحية (Medical)' : 'Medical & Healthcare Clinics'}</option>
                    <option value="all">{isAr ? 'قطاع آخر / استفسار عام' : 'Other / General Inquiry'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {m.budgetLabel}
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value={isAr ? '15,000 - 25,000 ج.م' : '15,000 - 25,000 EGP'}>
                    {isAr ? '١٥,٠٠٠ - ٢٥,٠٠٠ ج.م شهرياً' : '15,000 - 25,000 EGP / month'}
                  </option>
                  <option value={isAr ? '25,000 - 45,000 ج.م' : '25,000 - 45,000 EGP'}>
                    {isAr ? '٢٥,٠٠٠ - ٤٥,٠٠٠ ج.م شهرياً (الأنسب للباقات المتكاملة)' : '25,000 - 45,000 EGP / month (Recommended)'}
                  </option>
                  <option value={isAr ? '45,000 - 80,000 ج.م' : '45,000 - 80,000 EGP'}>
                    {isAr ? '٤٥,٠٠٠ - ٨٠,٠٠٠ ج.م شهرياً (توسع وهيمنة)' : '45,000 - 80,000 EGP / month (Scale & Authority)'}
                  </option>
                  <option value={isAr ? 'أكثر من 80,000 ج.م' : 'Over 80,000 EGP'}>
                    {isAr ? 'أكثر من ٨٠,٠٠٠ ج.م (مشاريع كبرى وتصدير)' : 'Over 80,000 EGP / month (Enterprise & Export)'}
                  </option>
                </select>
              </div>

              {/* Target Package Selector for General Registration */}
              {!selectedPackageForInquiry && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{isAr ? 'الباقة المستهدفة (اختياري)' : 'Target Package (Optional)'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {isAr ? '(يمكنك اختيار باقة محددة أو استشارة مخصصة)' : '(Select a specific package or custom plan)'}
                    </span>
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const found = data.packages.find((p) => p.id === e.target.value);
                      if (found) {
                        setSelectedPackageForInquiry(found);
                      }
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="">{isAr ? 'استشارة استراتيجية عامة وخطة عمل مخصصة' : 'General Custom Strategy Consultation'}</option>
                    {data.packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {isAr ? pkg.name : pkg.nameEn} — ({pkg.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? pkg.currency : pkg.currencyEn} / {pkg.sector.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {m.notesLabel}
                </label>
                <textarea
                  rows={3}
                  placeholder={isAr ? 'أخبرنا باختصار عن أهدافك أو التحدي الحالي...' : 'Briefly describe your objectives or current challenges...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Bottom Promo Code Section (كود الخصم في أسفل النموذج) */}
              <div className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-2xl border border-purple-100/90 p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isAr ? 'هل لديك كود خصم / برومو كود؟' : 'Have a Promo Code?'}</span>
                  </label>
                  {appliedPromo && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? 'تم تفعيل الكود بنجاح' : 'Promo Active'}</span>
                    </span>
                  )}
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-900 font-mono tracking-wider">{appliedPromo.code}</span>
                          <span className="text-emerald-700">•</span>
                          <span className="text-emerald-700 font-semibold">
                            {selectedPackageForInquiry
                              ? (isAr ? `وفرت ${appliedPromo.discountAmount.toLocaleString('ar-EG')} ج.م` : `Saved ${appliedPromo.discountAmount.toLocaleString('en-US')} EGP`)
                              : (appliedPromo.promo?.discountType === 'percentage'
                                  ? (isAr ? `خصم معتمد ${appliedPromo.promo.discountValue}%` : `${appliedPromo.promo.discountValue}% discount approved`)
                                  : (isAr ? `قسيمة خصم بقيمة ${appliedPromo.promo?.discountValue.toLocaleString('ar-EG')} ج.م` : `${appliedPromo.promo?.discountValue.toLocaleString('en-US')} EGP voucher approved`))}
                          </span>
                        </div>
                        {selectedPackageForInquiry && (
                          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            {isAr ? `السعر النهائي: ${appliedPromo.finalPrice.toLocaleString('ar-EG')} ج.م (بدلاً من ${selectedPackageForInquiry.price.toLocaleString('ar-EG')} ج.م)` : `Final price: ${appliedPromo.finalPrice.toLocaleString('en-US')} EGP instead of ${selectedPackageForInquiry.price.toLocaleString('en-US')} EGP`}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-emerald-700 hover:text-rose-600 text-[11px] font-bold underline cursor-pointer shrink-0 transition-colors"
                    >
                      {isAr ? 'إلغاء الكود' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value.toUpperCase());
                            if (promoError) setPromoError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyPromo();
                            }
                          }}
                          placeholder={isAr ? 'اكتب كود الخصم (مثال: EFFECT20)' : 'Enter promo code (e.g. EFFECT20)'}
                          className="w-full text-xs ps-8 pe-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 font-mono uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        {isAr ? 'تطبيق الكود' : 'Apply'}
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-[11px] font-semibold text-rose-600 ps-1 animate-in fade-in flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{promoError}</span>
                      </p>
                    )}
                    {promoMessage && !promoError && (
                      <p className="text-[11px] font-semibold text-emerald-600 ps-1 animate-in fade-in flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>{promoMessage}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  disabled={isSubmitting}
                  className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{m.whatsAppDirect}</span>
                </button>

                <div className="flex items-center gap-2 ms-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {isAr ? 'إلغاء وإغلاق' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{m.submitBtn}</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
