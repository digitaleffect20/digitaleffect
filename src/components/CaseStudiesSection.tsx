import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType, CaseStudy } from '../types';
import { 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  ArrowLeft, 
  TrendingUp, 
  Briefcase,
  Layers
} from 'lucide-react';

export const CaseStudiesSection: React.FC = () => {
  const { data, activeSector, setActiveSector, setSelectedCaseStudy } = useAgencyData();

  // Filter case studies by active sector
  const filteredStudies = data.caseStudies.filter((study) => {
    if (activeSector === 'all') return true;
    return study.sector === activeSector;
  });

  const getSectorMeta = (sector: string) => {
    switch (sector) {
      case 'b2b':
        return {
          label: 'قطاع B2B',
          icon: <Building2 className="w-3.5 h-3.5 text-sky-600" />,
          colorClass: 'text-sky-700 bg-sky-50 border-sky-200/60',
        };
      case 'b2c':
        return {
          label: 'قطاع B2C',
          icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />,
          colorClass: 'text-amber-700 bg-amber-50 border-amber-200/60',
        };
      case 'medical':
        return {
          label: 'القطاع الطبي Medical',
          icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />,
          colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
        };
      default:
        return {
          label: 'قطاع متعدد',
          icon: <Briefcase className="w-3.5 h-3.5 text-slate-600" />,
          colorClass: 'text-slate-700 bg-slate-50 border-slate-200/60',
        };
    }
  };

  const sectorFilters: Array<{ id: SectorType; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'كافة القطاعات', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'b2b', label: 'قطاع B2B', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'b2c', label: 'قطاع B2C والتجارة', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'medical', label: 'القطاع الطبي Medical', icon: <Stethoscope className="w-3.5 h-3.5" /> },
  ];

  return (
    <section id="case-studies" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 text-right">
            <div className="text-xs font-bold text-sky-600 tracking-wider">
              نتائج حقيقية مثبتة بالأرقام
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              دراسات الحالة وقصص نجاح عملائنا
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              تصفح نتائج حقيقية حققناها لشركائنا في مختلف القطاعات؛ أرقام نمو موثقة، حملات ناجحة، وتجارب استثنائية.
            </p>
          </div>

          {/* Interactive Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 overflow-x-auto max-w-full">
            {sectorFilters.map((tab) => {
              const isActive = activeSector === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSector(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudies.map((study) => {
            const meta = getSectorMeta(study.sector);
            const mainMetric = study.metrics[0];

            return (
              <div
                key={study.id}
                onClick={() => setSelectedCaseStudy(study)}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden text-right cursor-pointer"
              >
                {/* Sector Graphic / Visual Header */}
                <div className="h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 flex flex-col justify-between relative overflow-hidden text-white">
                  {/* Subtle Geometric Graphic */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-sky-500/10 blur-xl pointer-events-none" />
                  
                  {/* Card Metadata Top */}
                  <div className="flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-sky-200 border border-white/10">
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      مدة العمل: {study.duration}
                    </span>
                  </div>

                  {/* Prominent Primary Metric Result in Hero of Card */}
                  <div className="z-10">
                    <div className="text-3xl sm:text-4xl font-black text-sky-400 tabular-nums">
                      {mainMetric?.value}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {mainMetric?.label}
                    </div>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Quiet Metadata with Dot Separators (§1.A Zero-Pill) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{study.client}</span>
                      <span aria-hidden="true">·</span>
                      <span>{study.industry}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                      {study.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {study.solution}
                    </p>
                  </div>

                  {/* Secondary Metrics strip */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    {study.metrics.slice(1, 3).map((m, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                        <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                          {m.value}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={m.label}>
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                    <span className="flex items-center gap-1">
                      <span>عرض تفاصيل دراسة الحالة الكاملة</span>
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to add or inquire */}
        <div className="mt-14 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm text-right">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              هل تبحث عن دراسة حالة في نشاط محدد خارج المعروض؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              لدينا أرشيف يضم أكثر من ٢٥٠ مشروعاً ناجحاً نفذناها على مدار ١٢ عاماً في مصر والخليج العربي.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(`مرحباً ديجيتال إفكت، أود الاطلاع على دراسات حالة إضافية لقطاع ${activeSector.toUpperCase()}`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <span>طلب دراسات حالة مخصصة عبر واتساب</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
