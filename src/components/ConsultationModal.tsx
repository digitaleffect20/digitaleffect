import React, { useState, useEffect } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType } from '../types';
import { X, Send, CheckCircle2, MessageSquare, Phone, Building2, User, Loader2, AlertCircle } from 'lucide-react';
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
    t
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

  if (!isConsultationOpen) return null;

  const handleClose = () => {
    setIsConsultationOpen(false);
    setSelectedPackageForInquiry(null);
    setSubmitted(false);
    setSubmitError(null);
    // Refresh idempotency key for the next session
    setIdempotencyKey(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`);
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
      });

      // Strict enforcement: Never show success unless confirmed by database!
      if (!res.success) {
        setSubmitError(res.error || (isAr ? 'تعذر تسجيل الطلب في قاعدة البيانات المركزية. يرجى استخدام زر الواتساب للتواصل الفوري.' : 'Failed to save inquiry to database.'));
        setIsSubmitting(false);
        return;
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
      }).catch(console.error);
    }

    const message = isAr
      ? `مرحباً فريق ديجيتال إفكت،
أنا: ${cleanName || 'مهتم'}
النشاط / الشركة: ${company.trim() || 'غير محدد'}
القطاع: ${sector.toUpperCase()}
الباقة المستهدفة: ${pkgLabel}
الميزانية المقترحة: ${budget}
ملاحظات: ${notes.trim() || 'أود مناقشة خطة العمل معكم'}`
      : `Hello Digital Effect Team,
Name: ${cleanName || 'Interested Client'}
Company: ${company.trim() || 'Not Specified'}
Sector: ${sector.toUpperCase()}
Target Plan: ${pkgLabel}
Budget: ${budget}
Notes: ${notes.trim() || 'Looking forward to reviewing strategic growth options'}`;

    window.open(`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative text-start flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {packageName ? `${m.selectedPkg} ${packageName}` : m.consultationTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {m.consultationDesc}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
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
              {selectedPackageForInquiry && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sky-900">{m.selectedPkg} </span>
                    <span className="text-sky-700">{packageName}</span>
                  </div>
                  <span className="font-black text-sky-900 tabular-nums">
                    {selectedPackageForInquiry.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? selectedPackageForInquiry.currency : selectedPackageForInquiry.currencyEn}
                  </span>
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

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  disabled={isSubmitting}
                  className="px-4 py-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{m.whatsAppDirect}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer ms-auto disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري الحفظ الآمن...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{m.submitBtn}</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
