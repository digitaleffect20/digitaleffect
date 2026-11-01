import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType } from '../types';
import { 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  Layers, 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

export const SectorHero: React.FC = () => {
  const { activeSector, setActiveSector, setIsConsultationOpen } = useAgencyData();

  // Sector specific narratives
  const sectorMeta: Record<
    SectorType,
    {
      kicker: string;
      title: string;
      highlight: string;
      description: string;
      badgeText: string;
      accentBg: string;
      primaryMetric: { value: string; label: string };
      secondaryMetric: { value: string; label: string };
    }
  > = {
    all: {
      kicker: 'ديجيتال إفكت • خبرة تأسيس تتجاوز ١٢ عاماً في السوق العربي',
      title: 'حلول تسويق رقمي متكاملة تفهم لغة عملائك وتبني',
      highlight: 'نتائج حقيقية ملموسة بالأرقام',
      description:
        'نحن لسنا مجرد وكالة إعلانات؛ نحن شريكك الاستراتيجي في قطاعات B2B، B2C، والقطاع الطبي، بخبرة تراكمية تفوق ٢٠ عاماً لفريق العمل ومئات قصص النجاح الموثقة.',
      badgeText: 'نظرة عامة على كافة القطاعات',
      accentBg: 'from-sky-50 to-blue-50/50',
      primaryMetric: { value: '+١٢ عاماً', label: 'في السوق الرقمي والتسويق' },
      secondaryMetric: { value: '٨٥M+ ج.م', label: 'مبيعات وصفقات مدارة سنوياً' },
    },
    b2b: {
      kicker: 'حلول الشركات والمؤسسات • قطاع الـ B2B',
      title: 'نحوّل علاقات الأعمال إلى خطوط إنتاج صفقات و',
      highlight: 'عقود تعاقدية سنوية مستدامة',
      description:
        'نخاطب المديرين التنفيذيين وصناع القرار ومسؤولي المشتريات بلغة الأرقام والجدوى الاستثمارية؛ من خلال التسويق المبني على الحسابات (ABM)، إعلانات لينكد إن، وبناء دراسات الجدوى والصفحات المؤسسية المتخصصة.',
      badgeText: 'موجّه خصيصاً لشركات الـ B2B والمصانع والخدمات المؤسسية',
      accentBg: 'from-slate-100 to-sky-50/80',
      primaryMetric: { value: '٣٤٠%+', label: 'متوسط نمو الصفقات المؤهلة (SQLs)' },
      secondaryMetric: { value: '٣٨%', label: 'تقليص متوسط دورة إغلاق العقود' },
    },
    b2c: {
      kicker: 'التجارة الإلكترونية والمنتجات الاستهلاكية • قطاع الـ B2C',
      title: 'نحوّل تصفح المستهلكين إلى سلات شراء متكررة و',
      highlight: 'عائد إعلاني استثنائي (ROAS)',
      description:
        'منظومة مبيعات فورية للمتاجر والعلامات الاستهلاكية: إدارة حملات ميتا وتيك توك الذكية، صناعة محتوى UGC فيروسي، رفع قيمة السلة الشرائية، وحملات إعادة استهداف تمنع فقدان العملاء.',
      badgeText: 'موجّه للمتاجر الإلكترونية، براندات التجزئة، والسلع الاستهلاكية',
      accentBg: 'from-amber-50/50 to-sky-50/60',
      primaryMetric: { value: '٥.٢X', label: 'متوسط العائد على الإنفاق الإعلاني ROAS' },
      secondaryMetric: { value: '٥٢,٠٠٠+', label: 'طلب شراء محقق في مواسم الذروة' },
    },
    medical: {
      kicker: 'الرعاية الصحية والمراكز الطبية • القطاع الطبي Medical',
      title: 'نبني ثقة المرضى ونملأ جداول العيادات والمراكز بـ',
      highlight: 'تسويق طبي معتمد وأخلاقي',
      description:
        'التسويق الطبي يحتاج رصانة والتزاماً بالمعايير الأخلاقية: نصنع سمعة الأطباء الاستشاريين، نرفع تصنيف عيادتك للمركز الأول في خرائط جوجل، ونربط الحملات بنظام حجز فوري يحول الاستفسارات لمرضى داخل العيادة.',
      badgeText: 'موجّه للأطباء، العيادات التخصصية، ومجمعات جراحة اليوم الواحد والمستشفيات',
      accentBg: 'from-emerald-50/50 to-sky-50/70',
      primaryMetric: { value: '٣٨٠%+', label: 'زيادة في حجوزات الكشوفات والجراحات' },
      secondaryMetric: { value: '#1', label: 'تصدر نتائج خرائط جوجل Google Maps' },
    },
  };

  const current = sectorMeta[activeSector];

  const sectorButtons: Array<{ id: SectorType; label: string; icon: React.ReactNode; sub: string }> = [
    {
      id: 'all',
      label: 'كافة القطاعات',
      sub: 'نظرة شاملة',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'b2b',
      label: 'قطاع الشركات (B2B)',
      sub: 'عقود وصفقات مؤسسية',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'b2c',
      label: 'المستهلكين والتجارة (B2C)',
      sub: 'مبيعات وعائد ROAS',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: 'medical',
      label: 'القطاع الطبي (Medical)',
      sub: 'حجوزات عيادات وسمعة',
      icon: <Stethoscope className="w-4 h-4" />,
    },
  ];

  return (
    <section id="sectors" className={`relative overflow-hidden bg-gradient-to-b ${current.accentBg} pt-10 pb-16 border-b border-slate-200/80`}>
      {/* Background Architectural Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0077D4 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Sector Switcher Header Ribbon - "سهل الوصول للي العميل عايزه و ميتلغبطش" */}
        <div className="mb-8 p-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <div className="text-center pb-2">
            <span className="text-xs font-semibold text-slate-500">
              اختر قطاع عملك لنخصص لك دراسات الحالة، خطاب الحملات، والباقات المناسبة لطبيعة جمهورك:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {sectorButtons.map((btn) => {
              const isActive = activeSector === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setActiveSector(btn.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 text-center cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 translate-y-[-1px]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                    {btn.icon}
                    <span>{btn.label}</span>
                  </div>
                  <span className={`text-[11px] mt-0.5 whitespace-nowrap ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                    {btn.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Right Column: Tailored Messaging Text */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-100/80 px-3 py-1.5 rounded-lg border border-sky-200/60">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{current.kicker}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.25] tracking-tight text-balance">
              {current.title}{' '}
              <span className="text-sky-600 underline decoration-sky-300 decoration-wavy underline-offset-8">
                {current.highlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              {current.description}
            </p>

            {/* Quick jump & CTA bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
              >
                <span>احجز استشارة استراتيجية مجانية</span>
                <CalendarCheck className="w-4 h-4" />
              </button>

              <a
                href="#case-studies"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-300 shadow-sm whitespace-nowrap"
              >
                <span>شاهد دراسات الحالة ({activeSector.toUpperCase()})</span>
                <ArrowLeft className="w-4 h-4 text-sky-600" />
              </a>

              <a
                href="#packages"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all border border-sky-200 whitespace-nowrap"
              >
                <span>باقات وأسعار القطاع</span>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">خبرة وكالة +١٢ سنة</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span className="font-medium">فريق تسويق بخبرة +٢٠ عاماً</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-medium">تقارير حية ومتابعة أسبوعية</span>
            </div>
          </div>

          {/* Left Column: Sector Spotlight Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700">
                    مؤشرات أداء {activeSector === 'all' ? 'Digital Effect' : `قطاع ${activeSector.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                  معتمدة ومحدثة
                </span>
              </div>

              {/* Metrics Showcase */}
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 tabular-nums">
                    {current.primaryMetric.value}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-1">
                    {current.primaryMetric.label}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {current.secondaryMetric.value}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-1">
                    {current.secondaryMetric.label}
                  </div>
                </div>
              </div>

              {/* Dynamic Sector Insight */}
              <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50/60 rounded-2xl border border-sky-100 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>طريقتنا في خدمة هذا القطاع:</span>
                </div>
                {activeSector === 'all' && (
                  <p>
                    نخصص لكل قطاع فريقاً منفصلاً؛ ففريق الـ B2B يختلف تماماً في استراتيجياته عن مسؤولي الـ E-Commerce أو خبراء التسويق الطبي.
                  </p>
                )}
                {activeSector === 'b2b' && (
                  <p>
                    نركز على بناء قوائم استهداف دقيقة (Account Lists) ومخاطبة مديري المشتريات والمدراء الماليين بما يحقق أعلى عائد على كل صفقة.
                  </p>
                )}
                {activeSector === 'b2c' && (
                  <p>
                    نعتمد على الاختبار الإعلاني السريع (Rapid A/B Testing)، ومقاطع المحتوى التفاعلي UGC مع تحسين مسار سلة المشتريات.
                  </p>
                )}
                {activeSector === 'medical' && (
                  <p>
                    نلتزم بالمعايير الأخلاقية ونبتعد عن الإثارة التجارية الرخيصة؛ نصنع محتوى تثقيفياً موثوقاً يشعر المريض بالأمان ويحفزه على الحجز.
                  </p>
                )}
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>تحدث مباشرة مع مستشار قطاعك:</span>
                <a
                  href={`https://wa.me/201002004567?text=${encodeURIComponent(`مرحباً ديجيتال إفكت، أود الاستفسار عن باقات وحلول قطاع ${activeSector.toUpperCase()}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>واتساب مباشر</span>
                  <ArrowLeft className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
