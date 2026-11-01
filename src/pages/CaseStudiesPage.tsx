import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType } from '../types';
import { Building2, ShoppingBag, Stethoscope, Layers, ArrowLeft, ArrowRight, Briefcase, Plus } from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const { data, language, t, setSelectedCaseStudy, setIsAdminOpen, setIsConsultationOpen, setCurrentPage } = useAgencyData();
  const isAr = language === 'ar';
  const [filter, setFilter] = useState<SectorType>('all');

  const filteredStudies = data.caseStudies.filter((s) => {
    if (filter === 'all') return true;
    return s.sector === filter;
  });

  const filterTabs: Array<{ id: SectorType; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: isAr ? 'كافة القطاعات' : 'All Sectors', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'b2b', label: isAr ? 'قطاع الشركات B2B' : 'B2B Enterprise', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'b2c', label: isAr ? 'قطاع التجارة B2C' : 'B2C E-Commerce', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'medical', label: isAr ? 'القطاع الطبي Medical' : 'Medical Healthcare', icon: <Stethoscope className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Page Header */}
      <section className="bg-slate-900 text-white pt-14 pb-16 border-b border-slate-800 text-start">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-white/10 px-3 py-1 rounded-full">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? 'أرشيف دراسات الحالة والنتائج المعتمدة' : 'Verified Case Studies & Portfolio'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isAr ? 'قصص نجاح تثبت الأثر بالأرقام' : 'Measurable Growth Stories That Speak In Numbers'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isAr
              ? 'تصفح دراسات حالة مفصلة عبر قطاعات B2B و B2C والقطاع الطبي؛ تتضمن التحديات، خطط التدخل، والأرقام المدققة لأداء عملائنا.'
              : 'Detailed operational breakdowns across B2B, B2C, and Medical sectors; including pre-existing obstacles, intervention strategies, and audited results.'}
          </p>
        </div>
      </section>

      {/* Filter and Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Segmented controls */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? 'إضافة مشروع جديد (CMS)' : 'Add New Case Study (CMS)'}</span>
          </button>
        </div>

        {/* Case Studies Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudies.map((study) => {
            const title = isAr ? study.title : study.titleEn;
            const client = isAr ? study.client : study.clientEn;
            const industry = isAr ? study.industry : study.industryEn;
            const solution = isAr ? study.solution : study.solutionEn;
            const mainMetric = study.metrics[0];

            const isIpt = study.id === 'cs-med-ipt';
            const isPenguin = study.id === 'cs-b2c-penguin';
            const isBsizia = study.id === 'cs-b2b-bsizia';
            const hasDedicatedPage = isIpt || isPenguin || isBsizia;

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
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden text-start cursor-pointer group ${
                  isIpt 
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20 hover:border-emerald-500' 
                    : isPenguin
                    ? 'border-sky-300 ring-2 ring-sky-500/20 hover:border-sky-500'
                    : isBsizia
                    ? 'border-blue-400 ring-2 ring-blue-500/20 hover:border-blue-500'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                {/* Header Strip with Metrics */}
                <div className={`p-6 text-white space-y-3 relative overflow-hidden ${
                  isIpt 
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' 
                    : isPenguin
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950'
                    : isBsizia
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950'
                    : 'bg-slate-900'
                }`}>
                  {study.logoUrl && (
                    <div className="absolute top-4 end-4 w-12 h-12 bg-white rounded-xl p-1 border border-white/20 shadow-md flex items-center justify-center">
                      <img src={study.logoUrl} alt={client} className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase tracking-wider ${
                        isIpt ? 'text-emerald-400' : isBsizia ? 'text-blue-400' : 'text-sky-400'
                      }`}>
                        {study.sector.toUpperCase()}
                      </span>
                      {hasDedicatedPage && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          isIpt 
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' 
                            : isBsizia
                            ? 'bg-blue-950 text-blue-300 border-blue-500/30'
                            : 'bg-sky-950 text-sky-300 border-sky-500/30'
                        }`}>
                          {isAr ? 'صفحة مستقلة ↗' : 'Dedicated Page ↗'}
                        </span>
                      )}
                    </div>
                    <span>{isAr ? `المدة: ${study.duration}` : `Duration: ${study.durationEn}`}</span>
                  </div>

                  <div>
                    <div className={`text-3xl font-black tabular-nums ${
                      isIpt ? 'text-emerald-400' : 'text-sky-400'
                    }`}>
                      {mainMetric?.value}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {isAr ? mainMetric?.label : mainMetric?.labelEn}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">{client} · {industry}</div>
                    <h3 className={`text-base font-bold transition-colors leading-snug line-clamp-2 ${
                      isIpt 
                        ? 'text-slate-900 group-hover:text-emerald-600' 
                        : isPenguin
                        ? 'text-slate-900 group-hover:text-sky-600'
                        : 'text-slate-900 group-hover:text-sky-600'
                    }`}>
                      {title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {solution}
                    </p>
                  </div>

                  <div className={`pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold ${
                    isIpt ? 'text-emerald-600' : 'text-sky-600'
                  }`}>
                    <span>
                      {hasDedicatedPage
                        ? (isAr ? 'عرض صفحة دراسة الحالة الكاملة ↗' : 'View Full Case Study Page ↗')
                        : t.common.viewDetails}
                    </span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Inquiry Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-start flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isAr ? 'هل تبحث عن دراسة حالة في نشاط تجاري محدد؟' : 'Looking for a specific industry case study?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAr ? 'لدينا أرشيف يضم أكثر من ٢٥٠ مشروعاً ناجحاً نفذناها على مدار ١٢ عاماً.' : 'Our verified 12-year archive contains 250+ enterprise case studies.'}
            </p>
          </div>

          <button
            onClick={() => setIsConsultationOpen(true)}
            className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {isAr ? 'طلب خطة عمل لمشروعك' : 'Request Tailored Action Plan'}
          </button>
        </div>
      </section>
    </div>
  );
};
