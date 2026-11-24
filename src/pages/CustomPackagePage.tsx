import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { CustomPackageCalculator } from '../components/CustomPackageCalculator';
import { SectorFaqSection } from '../components/SectorFaqSection';
import { buildServicePackageFromCustomCalculation, CustomPackageCalculation } from '../utils/pricingCalculator';
import { 
  Sliders, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Film, 
  MessageSquare, 
  Building2,
  ShoppingBag,
  Stethoscope
} from 'lucide-react';

export const CustomPackagePage: React.FC = () => {
  const { 
    language, 
    setCurrentPage, 
    customPackageConfig, 
    setSelectedPackageForInquiry, 
    setIsConsultationOpen,
    data
  } = useAgencyData();

  const isAr = language === 'ar';

  const handleSelectCustomPackage = (calc: CustomPackageCalculation) => {
    const customPackage = {
      ...buildServicePackageFromCustomCalculation(calc),
      id: `custom-pkg-${Date.now()}`,
    };
    setSelectedPackageForInquiry(customPackage);
    setIsConsultationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Navigation & Top Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button 
              type="button" 
              onClick={() => setCurrentPage('home')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <a 
              href="#packages"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
                setTimeout(() => {
                  const el = document.getElementById('packages');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isAr ? 'الباقات والأسعار' : 'Packages'}
            </a>
            <span>/</span>
            <span className="text-sky-600 font-bold">
              {isAr ? 'حاسبة وتصميم الباقات المخصصة' : 'Custom Package Calculator'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentPage('home');
              setTimeout(() => {
                const el = document.getElementById('packages');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? 'العودة للباقات الرسمية' : 'Back to Standard Packages'}</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'حاسبة ومصمم الباقات المخصصة الذكي' : 'Interactive Custom Package Builder'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isAr 
              ? 'صمم باقة خدماتك الرقمية بدقة وبأفضل تكلفة استثمارية' 
              : 'Build Your Custom Marketing Package with Live Pricing'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? 'اختر قطاع عملك، وحدد عدد المنشورات والتصاميم ومقاطع الريلز بالذكاء الاصطناعي، وشاهد احتساب السعر المعتمد بالجنيه المصري فوراً مع خيارات الاشتراك الشهري والربع سنوي.'
              : 'Select your industry, adjust exact quantities of posts, AI reels, and stories, and get instant verified pricing in EGP based on official unit costs.'}
          </p>

          {/* Banner if customization started from a specific package */}
          {customPackageConfig?.basePkgName && (
            <div className="mt-4 p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs font-bold text-sky-900 inline-flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                {isAr
                  ? `أنت تقوم الآن بتخصيص باقة «${customPackageConfig.basePkgName}» — اضبط الكميات لتناسب ميزانيتك ومستهدفاتك:`
                  : `Customizing from base package: "${customPackageConfig.basePkgName}" — tune quantities below:`}
              </span>
            </div>
          )}
        </div>

        {/* Main Interactive Calculator Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <CustomPackageCalculator
            mode="client"
            isAr={isAr}
            initialSector={customPackageConfig?.sector || 'b2c'}
            initialPosts={customPackageConfig?.posts}
            initialReels={customPackageConfig?.reels}
            initialStories={customPackageConfig?.stories}
            basePackageName={customPackageConfig?.basePkgName}
            onSelectForInquiry={handleSelectCustomPackage}
          />
        </div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{isAr ? 'تسعير عادل وشفاف' : 'Fair Transparent Rates'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr ? 'احتساب دقيق قائم على شيت التكاليف الفعلي بدون أي مصاريف خفية.' : 'Exact unit pricing calibrated to our verified operational costs.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{isAr ? 'إنتاج فيديو وAI متطور' : 'AI Reels & Video Velocity'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr ? 'ريلز احترافية مدعومة بالذكاء الاصطناعي لرفع معدلات المشاهدة والانتشار.' : 'High-engagement viral reels powered by the latest AI tech.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{isAr ? 'خطة استراتيجية شهرية' : 'Monthly Strategic Plan'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr ? 'دراسة منافسين وجدولة دورية تضمن تحقيق أعلى عائد استثماري.' : 'Competitor intelligence and structured posting schedules.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{isAr ? 'مرونة كاملة في الترقية' : 'Flexible Scalability'}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr ? 'يمكنك زيادة عدد المخرجات أو تعديل نطاق العمل في أي شهر مع نمو نشاطك.' : 'Scale deliverables up or down seamlessly as your business expands.'}
            </p>
          </div>
        </div>

        {/* Sector Quick Insights */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {isAr ? 'إرشادات مخصصة بحسب القطاع' : 'Sector Guidelines'}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white">
              {isAr ? 'كيف تختار المزيج الأنسب لطبيعة نشاطك؟' : 'Recommended Mix for Maximum ROI'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
                <span>{isAr ? 'قطاع المستهلكين (B2C)' : 'B2C E-Commerce'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr 
                  ? 'التركيز على مقاطع الريلز (٢ إلى ٦ شهرياً) والستوريز اليومية لزيادة تفاعل الجمهور ومبيعات المتجر الإلكتروني.'
                  : 'Prioritize video reels (2–6/mo) and interactive stories to drive direct purchase conversions.'}
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Building2 className="w-4 h-4" />
                <span>{isAr ? 'قطاع الشركات (B2B)' : 'B2B Industrial'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr 
                  ? 'التركيز على المنشورات التخصصية والإنفوجرافيك الصناعي (٤ إلى ٨ شهرياً) مع حملات لينكد إن لاستهداف صناع القرار.'
                  : 'Focus on in-depth industry insights and LinkedIn thought leadership targeting key decision makers.'}
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Stethoscope className="w-4 h-4" />
                <span>{isAr ? 'القطاع الطبي (Medical)' : 'Medical Healthcare'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr 
                  ? 'التركيز على ريلز الطبيب التثقيفية ونماذج قبل/بعد، مع اختيار الاشتراك الربع سنوي للحصول على أعلى نسبة توفير.'
                  : 'Educational doctor reels and patient transformations; choose quarterly retainer for maximum discounts.'}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Packages FAQs Accordion */}
        <SectorFaqSection category="pricing" embedded />

        {/* Bottom Direct CTA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-lg font-black text-white">
              {isAr ? 'هل تحتاج إلى استشارة مباشرة مع خبير التسويق الرقمي؟' : 'Need a direct consultation with our strategists?'}
            </h3>
            <p className="text-xs text-slate-300">
              {isAr 
                ? 'فريقنا متاح دائماً لمساعدتك في تحديد خطة العمل الأنسب لنشاطك التجاري.' 
                : 'Our growth team is ready to recommend the ideal scope for your company scale.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(isAr ? 'مرحباً ديجيتال إفكت، أود استشارة حول باقة مخصصة لنشاطي' : 'Hello Digital Effect, I would like to inquire about a custom marketing package')}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isAr ? 'محادثة واتساب فورية' : 'WhatsApp Us'}</span>
            </a>

            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
            >
              {isAr ? 'طلب مكالمة استشارية' : 'Book a Strategy Call'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
