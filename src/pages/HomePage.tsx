import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { StatsRibbon } from '../components/StatsRibbon';
import { RoiCalculator } from '../components/RoiCalculator';

export const HomePage: React.FC = () => {
  const { data, language, t, setCurrentPage, setSelectedCaseStudy, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const sectorCards = [
    {
      page: 'b2b' as const,
      title: t.sectors.b2bTitle,
      subtitle: t.sectors.b2bSub,
      desc: isAr
        ? 'تسويق مبني على الحسابات (ABM)، إعلانات LinkedIn الموجهة، وتأهيل الصفقات الكبرى لفرق المبيعات الصناعية والتجارية.'
        : 'Account-Based Marketing (ABM), high-precision LinkedIn campaigns, and enterprise lead qualification.',
      icon: <Building2 className="w-6 h-6 text-sky-600" />,
      colorClass: 'border-sky-200 hover:border-sky-400',
      badgeClass: 'bg-sky-50 text-sky-700',
      kpi: isAr ? '+٣٤٠% نمو الصفقات المؤهلة' : '+340% Deal Growth',
      btnLabel: t.home.browseB2B,
    },
    {
      page: 'b2c' as const,
      title: t.sectors.b2cTitle,
      subtitle: t.sectors.b2cSub,
      desc: isAr
        ? 'مضاعفة مبيعات المتاجر، إنتاج مقاطع UGC عالية التأثير، تحسين معدل التحويل، وحملات ميتا وتيك توك الذكية.'
        : 'E-commerce scaling, viral UGC video creation, checkout CRO, and high sustained ROAS ad funnels.',
      icon: <ShoppingBag className="w-6 h-6 text-amber-600" />,
      colorClass: 'border-amber-200 hover:border-amber-400',
      badgeClass: 'bg-amber-50 text-amber-800',
      kpi: isAr ? '٥.٢X متوسط العائد الإعلاني ROAS' : '5.2X Average ROAS',
      btnLabel: t.home.browseB2C,
    },
    {
      page: 'medical' as const,
      title: t.sectors.medTitle,
      subtitle: t.sectors.medSub,
      desc: isAr
        ? 'تسويق طبي معتمد وأخلاقي؛ بناء براند الأطباء الاستشاريين، تصدر المركز الأول في خرائط جوجل، ومسارات حجز مؤكدة.'
        : 'Ethical healthcare marketing, consultant doctor branding, #1 Google Maps local SEO, and confirmed patient bookings.',
      icon: <Stethoscope className="w-6 h-6 text-emerald-600" />,
      colorClass: 'border-emerald-200 hover:border-emerald-400',
      badgeClass: 'bg-emerald-50 text-emerald-800',
      kpi: isAr ? '+٣٨٠% حجوزات كشوفات مؤكدة' : '+380% Patient Bookings',
      btnLabel: t.home.browseMedical,
    },
  ];

  // Top featured projects
  const featuredProjects = data.caseStudies.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Master Hero Section with Glass Banner Background */}
      <section className="relative overflow-hidden bg-slate-900/5 pt-14 sm:pt-20 pb-20 sm:pb-28 border-b border-slate-200">
        {/* Banner Graphic Background Layer */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img 
            src="/assets/aistudio/Glass_banner_2138c06f.png" 
            alt="Digital Effect Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Soft center spotlight to preserve 3D glass icons while keeping headline perfectly readable */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.48)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-sky-200/90 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.home.heroKicker}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.2] text-balance drop-shadow-2xs">
              {t.home.heroTitle}{' '}
              <span className="text-sky-600 underline decoration-sky-300 decoration-wavy underline-offset-8">
                {t.home.heroHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {t.home.heroDesc}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-md hover:shadow-xl hover:shadow-sky-600/25 cursor-pointer whitespace-nowrap"
              >
                <span>{t.nav.bookCall}</span>
                <CalendarCheck className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage('case-studies')}
                className="inline-flex items-center gap-2 px-6 py-4 text-sm font-bold text-slate-800 bg-white/90 backdrop-blur-md hover:bg-white rounded-xl transition-all border border-slate-300/90 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
              >
                <span>{t.home.allCaseStudiesLink}</span>
                {isAr ? <ArrowLeft className="w-4 h-4 text-sky-600" /> : <ArrowRight className="w-4 h-4 text-sky-600" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Dedicated Standalone Sector Portal Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            {isAr ? 'أقسام الوكالة المستقلة' : 'Dedicated Agency Divisions'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAr ? 'تصفح القسم المخصص لمجال عملك بدون تشتت' : 'Explore Your Dedicated Sector Division Without Confusion'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.home.portalPrompt}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sectorCards.map((card) => (
            <div
              key={card.page}
              onClick={() => setCurrentPage(card.page)}
              className={`bg-white rounded-3xl p-6 sm:p-8 border-2 ${card.colorClass} shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-start cursor-pointer group hover:-translate-y-1`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${card.badgeClass}`}>
                    {card.kpi}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {card.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-500">
                    {card.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-2">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                <span>{card.btnLabel}</span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Ribbon */}
      <StatsRibbon />

      {/* Featured Projects Showcase across sectors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-start">
          <div className="space-y-1">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              {t.home.featuredProjects}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? 'نماذج حقيقية من نتائج أعمالنا' : 'Real Measurable Client Growth'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.home.featuredProjectsDesc}
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('case-studies')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer shrink-0"
          >
            <span>{t.home.allCaseStudiesLink}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((study) => {
            const title = isAr ? study.title : study.titleEn;
            const client = isAr ? study.client : study.clientEn;
            const industry = isAr ? study.industry : study.industryEn;
            const mainMetric = study.metrics[0];
            const metricVal = mainMetric?.value;
            const metricLabel = isAr ? mainMetric?.label : mainMetric?.labelEn;

            const isIpt = study.id === 'cs-med-ipt';
            const isPenguin = study.id === 'cs-b2c-penguin';
            const isBsizia = study.id === 'cs-b2b-bsizia';

            return (
              <div
                key={study.id}
                onClick={() => {
                  if (isIpt) {
                    setCurrentPage('ipt-case-study');
                  } else if (isPenguin) {
                    setCurrentPage('penguin-case-study');
                  } else if (isBsizia) {
                    setCurrentPage('bsizia-case-study');
                  } else {
                    setSelectedCaseStudy(study);
                  }
                }}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between text-start cursor-pointer group ${
                  isIpt 
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20 hover:border-emerald-500' 
                    : isPenguin
                    ? 'border-sky-300 ring-1 ring-sky-400/20 hover:border-sky-500'
                    : isBsizia
                    ? 'border-blue-400 ring-1 ring-blue-400/20 hover:border-blue-500'
                    : 'border-slate-200/90 hover:border-sky-300'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={study.thumbnailUrl || study.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 start-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/20">
                      {study.sector.toUpperCase()}
                    </span>
                  </div>

                  <div className="absolute bottom-3 start-3 end-3 flex items-end justify-between text-white">
                    <div className="text-xl font-black text-emerald-400 tabular-nums">
                      {metricVal}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-[150px]">
                      {metricLabel}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">{client} · {industry}</div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                      {title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                    <span>{t.common.viewDetails}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <RoiCalculator />

      {/* Agency Credibility & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 text-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-white/10 px-3 py-1 rounded-full">
                <Award className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.common.experienceBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                {isAr
                  ? 'لماذا تفصل «ديجيتال إفكت» بين قطاعات العمل؟'
                  : 'Why Does Digital Effect Isolate Each Business Sector?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {isAr
                  ? 'لأن استهداف مصنع كيميائي أو مستشفى جراحي أو متجر أزياء سريع يتطلب استراتيجيات وفهماً سلوكياً مختلفاً بنسبة ١٨٠ درجة. التخصص الكامل هو سر تحقيقنا معدل تجديد عقود سنوية يفوق ٩٤٪.'
                  : 'Because marketing a chemical manufacturing plant, an aesthetic surgery hospital, or a fast-fashion e-commerce brand demands entirely different methodologies. Complete sector dedication is why 94% of our enterprise clients renew annually.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="w-full py-4 px-6 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 transition-colors shadow-lg cursor-pointer text-center"
              >
                {t.nav.bookCall}
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 transition-colors border border-white/20 cursor-pointer text-center"
              >
                {isAr ? 'قراءة المزيد عن مسيرتنا وفلسفتنا' : 'Read Our Full Heritage & Methodology'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
