import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType, CaseStudy } from '../types';
import { 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  Eye, 
  ExternalLink, 
  X, 
  TrendingUp, 
  Sparkles,
  LayoutGrid,
  BarChart3
} from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const { 
    data, 
    language, 
    t, 
    setSelectedCaseStudy, 
    setIsConsultationOpen, 
    setCurrentPage 
  } = useAgencyData();
  
  const isAr = language === 'ar';
  const [filter, setFilter] = useState<SectorType>('all');
  const [viewMode, setViewMode] = useState<'visual' | 'detailed'>('visual');
  const [previewStudy, setPreviewStudy] = useState<CaseStudy | null>(null);

  const filteredStudies = data.caseStudies.filter((s) => {
    if (filter === 'all') return true;
    return s.sector === filter;
  });

  const filterTabs: Array<{ id: SectorType; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: isAr ? 'كافة المشاريع' : 'All Projects', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'b2b', label: isAr ? 'قطاع الشركات B2B' : 'B2B Enterprise', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'b2c', label: isAr ? 'قطاع التجارة B2C' : 'B2C Brands', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'medical', label: isAr ? 'القطاع الطبي Medical' : 'Medical Healthcare', icon: <Stethoscope className="w-3.5 h-3.5" /> },
  ];

  const handleStudyClick = (study: CaseStudy) => {
    if (study.id === 'cs-med-ipt') {
      setCurrentPage('ipt-case-study');
    } else if (study.id === 'cs-b2c-penguin') {
      setCurrentPage('penguin-case-study');
    } else if (study.id === 'cs-b2b-bsizia') {
      setCurrentPage('bsizia-case-study');
    } else if (study.id === 'cs-b2c-binaryracks') {
      setCurrentPage('binaryracks-case-study');
    } else if (study.id === 'cs-b2c-gimoka') {
      setCurrentPage('gimoka-case-study');
    } else if (study.id === 'cs-b2c-memar-lashin') {
      setCurrentPage('lashin-case-study');
    } else if (study.id === 'cs-b2c-concrete') {
      setCurrentPage('concrete-case-study');
    } else if (study.id === 'cs-b2c-hamburg') {
      setCurrentPage('hamburg-case-study');
    } else if (study.id === 'cs-b2c-acton') {
      setCurrentPage('acton-case-study');
    } else if (study.id === 'cs-b2c-yoken') {
      setCurrentPage('yoken-case-study');
    } else if (study.id === 'cs-b2c-siltal') {
      setCurrentPage('siltal-case-study');
    } else if (study.id === 'cs-b2c-passap') {
      setCurrentPage('passap-case-study');
    } else if (study.id === 'cs-b2c-alwaad-travel') {
      setCurrentPage('alwaad-case-study');
    } else {
      setSelectedCaseStudy(study);
    }
  };

  const getSectorBadge = (sector: 'b2b' | 'b2c' | 'medical') => {
    switch (sector) {
      case 'b2b':
        return {
          label: isAr ? 'قطاع الشركات B2B' : 'B2B Enterprise',
          bg: 'bg-blue-600/90 text-white border-blue-400/30',
        };
      case 'medical':
        return {
          label: isAr ? 'القطاع الطبي' : 'Medical',
          bg: 'bg-emerald-600/90 text-white border-emerald-400/30',
        };
      case 'b2c':
      default:
        return {
          label: isAr ? 'التجارة والتجزئة B2C' : 'B2C Retail',
          bg: 'bg-sky-600/90 text-white border-sky-400/30',
        };
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">
      {/* Page Header */}
      <section className="bg-slate-900 text-white pt-14 pb-16 border-b border-slate-800 text-start relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 end-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-white/10 px-3.5 py-1.5 rounded-full border border-sky-500/20 backdrop-blur-md">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? 'معرض الأعمال ودراسات الحالة المعتمدة' : 'Creative Portfolio & Verified Case Studies'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isAr ? 'أعمال بصرية مبتكرة.. وأثر تسويقي بالأرقام' : 'Creative Campaign Portfolio & Audited Growth'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isAr
              ? 'تصفح بوسترات وحملات السوشيال ميديا الإبداعية، مع دراسات حالة موثقة بالأرقام والنتائج المحققة لأكبر العلامات والمصانع والمؤسسات الطبية.'
              : 'Explore high-impact social media creative campaigns paired with audited case studies and verified growth metrics across premier regional brands.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? '١٩ دراسة حالة موثقة' : '19 Verified Case Studies'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'تركيز على الهوية البصرية وجودة المحتوى' : 'Visual Identity & High-Quality Content'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar & Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 bg-slate-50/80 rounded-3xl border border-slate-200">
          {/* Sector Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: View Mode & Add Study */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('visual')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'visual'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isAr ? 'عرض البورتفوليو المرئي (مثل الموقع الرسمي)' : 'Visual Showcase (Thumbnail-first)'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isAr ? 'البورتفوليو المرئي' : 'Visual Showcase'}</span>
              </button>

              <button
                onClick={() => setViewMode('detailed')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'detailed'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isAr ? 'عرض تحليلي مفصل' : 'Analytical Breakdown'}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض تحليلي' : 'Analytical'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Counter indicator */}
        <div className="mt-3 px-2 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            {isAr
              ? `عرض ${filteredStudies.length} من أصل ${data.caseStudies.length} مشروع`
              : `Showing ${filteredStudies.length} of ${data.caseStudies.length} projects`}
          </span>
          <span className="text-[11px] text-slate-400">
            {isAr ? 'اضغط على أي كارت للاستعراض المفصل أو المعاينة المكبرة' : 'Click on any card for full details or image preview'}
          </span>
        </div>

        {/* ======================================================== */}
        {/* VISUAL THUMBNAIL-FIRST PORTFOLIO GRID (MATCHING ATTACHMENT) */}
        {/* ======================================================== */}
        {viewMode === 'visual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9 mt-8">
            {filteredStudies.map((study) => {
              const title = isAr ? study.title : study.titleEn;
              const client = isAr ? study.client : study.clientEn;
              const industry = isAr ? study.industry : study.industryEn;
              const mainMetric = study.metrics[0];
              const sectorInfo = getSectorBadge(study.sector);
              const thumbImg = study.thumbnailUrl || study.image || '/assets/portfolio_crops/card_ipt.png';

              const isIpt = study.id === 'cs-med-ipt';
              const isPenguin = study.id === 'cs-b2c-penguin';
              const isBsizia = study.id === 'cs-b2b-bsizia';
              const isBinaryracks = study.id === 'cs-b2c-binaryracks';
              const isGimoka = study.id === 'cs-b2c-gimoka';
              const isLashin = study.id === 'cs-b2c-memar-lashin';
              const isConcrete = study.id === 'cs-b2c-concrete';
              const isHamburg = study.id === 'cs-b2c-hamburg';
              const isActon = study.id === 'cs-b2c-acton';
              const isYoken = study.id === 'cs-b2c-yoken';
              const isSiltal = study.id === 'cs-b2c-siltal';
              const isPassap = study.id === 'cs-b2c-passap';
              const isAlwaad = study.id === 'cs-b2c-alwaad-travel';
              const hasDedicatedPage = isIpt || isPenguin || isBsizia || isBinaryracks || isGimoka || isLashin || isConcrete || isHamburg || isActon || isYoken || isSiltal || isPassap || isAlwaad;

              return (
                <div
                  key={study.id}
                  className="group flex flex-col bg-white rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden text-start"
                >
                  {/* Hero Thumbnail Image Container (Centerpiece) */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer">
                    {/* The prominent creative artwork image */}
                    <img
                      src={thumbImg}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                      onClick={() => handleStudyClick(study)}
                    />

                    {/* Gradient Overlay on Hover */}
                    <div 
                      onClick={() => handleStudyClick(study)}
                      className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5"
                    >
                      <div className="flex items-center justify-between text-white text-xs font-bold">
                        <span className="inline-flex items-center gap-1.5 text-sky-300">
                          {hasDedicatedPage
                            ? (isAr ? 'فتح صفحة المشروع ↗' : 'View Dedicated Page ↗')
                            : (isAr ? 'عرض تفاصيل الحالة' : 'View Case Study')}
                        </span>
                        {isAr ? <ArrowLeft className="w-4 h-4 text-sky-400" /> : <ArrowRight className="w-4 h-4 text-sky-400" />}
                      </div>
                    </div>

                    {/* Top Floating Badges */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                      {/* Sector badge */}
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-md backdrop-blur-md ${sectorInfo.bg}`}>
                        {sectorInfo.label}
                      </span>

                      {/* Right top action: Zoom lightbox preview button & Dedicated page badge */}
                      <div className="flex items-center gap-1.5 pointer-events-auto">
                        {hasDedicatedPage && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400/40 shadow-md backdrop-blur-md">
                            {isAr ? 'صفحة مستقلة ↗' : 'Dedicated ↗'}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewStudy(study);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer backdrop-blur-md"
                          title={isAr ? 'تكبير التصميم' : 'Zoom Artwork'}
                        >
                          <Eye className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Metric Pill on Artwork */}
                    {mainMetric && (
                      <div className="absolute bottom-4 start-4 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-950/85 text-white border border-white/15 shadow-xl backdrop-blur-md">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-sm font-black text-emerald-400 tabular-nums">
                            {mainMetric.value}
                          </span>
                          <span className="text-[11px] font-medium text-slate-300 border-s border-white/20 ps-2">
                            {isAr ? mainMetric.label : mainMetric.labelEn}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Info Footer */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-700 truncate max-w-[220px]">
                          {client}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {isAr ? `المدة: ${study.duration}` : study.durationEn}
                        </span>
                      </div>

                      <h3 
                        onClick={() => handleStudyClick(study)}
                        className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer leading-snug line-clamp-2"
                      >
                        {title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {isAr ? study.solution : study.solutionEn}
                      </p>
                    </div>

                    {/* Interactive Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleStudyClick(study)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          isIpt 
                            ? 'text-emerald-600 hover:text-emerald-700' 
                            : isBsizia 
                            ? 'text-blue-600 hover:text-blue-700' 
                            : 'text-sky-600 hover:text-sky-700'
                        }`}
                      >
                        <span>
                          {hasDedicatedPage
                            ? (isAr ? 'عرض دراسة الحالة الكاملة ↗' : 'Full Case Study ↗')
                            : t.common.viewDetails}
                        </span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </button>

                      {study.clientUrl && (
                        <a
                          href={study.clientUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                          title={isAr ? 'زيارة الموقع الرسمي' : 'Official Page'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* DETAILED METRICS VIEW (FOR DEEP ANALYTICAL COMPARISON) */
          /* ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredStudies.map((study) => {
              const title = isAr ? study.title : study.titleEn;
              const client = isAr ? study.client : study.clientEn;
              const industry = isAr ? study.industry : study.industryEn;
              const solution = isAr ? study.solution : study.solutionEn;
              const mainMetric = study.metrics[0];
              const thumbImg = study.thumbnailUrl || study.image || '/assets/portfolio_crops/card_ipt.png';

              const isIpt = study.id === 'cs-med-ipt';
              const isPenguin = study.id === 'cs-b2c-penguin';
              const isBsizia = study.id === 'cs-b2b-bsizia';
              const isBinaryracks = study.id === 'cs-b2c-binaryracks';
              const isGimoka = study.id === 'cs-b2c-gimoka';
              const isLashin = study.id === 'cs-b2c-memar-lashin';
              const isConcrete = study.id === 'cs-b2c-concrete';
              const isHamburg = study.id === 'cs-b2c-hamburg';
              const isActon = study.id === 'cs-b2c-acton';
              const isYoken = study.id === 'cs-b2c-yoken';
              const isSiltal = study.id === 'cs-b2c-siltal';
              const isPassap = study.id === 'cs-b2c-passap';
              const isAlwaad = study.id === 'cs-b2c-alwaad-travel';
              const hasDedicatedPage = isIpt || isPenguin || isBsizia || isBinaryracks || isGimoka || isLashin || isConcrete || isHamburg || isActon || isYoken || isSiltal || isPassap || isAlwaad;

              return (
                <div
                  key={study.id}
                  onClick={() => handleStudyClick(study)}
                  className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden text-start cursor-pointer group ${
                    isIpt 
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20 hover:border-emerald-500' 
                      : isPenguin
                      ? 'border-sky-300 ring-2 ring-sky-500/20 hover:border-sky-500'
                      : isBsizia
                      ? 'border-blue-400 ring-2 ring-blue-500/20 hover:border-blue-500'
                      : isBinaryracks
                      ? 'border-sky-400 ring-2 ring-sky-500/20 hover:border-sky-500'
                      : isGimoka
                      ? 'border-amber-400 ring-2 ring-amber-500/20 hover:border-amber-500'
                      : isLashin
                      ? 'border-amber-400 ring-2 ring-amber-500/20 hover:border-amber-500'
                      : isConcrete
                      ? 'border-amber-400 ring-2 ring-amber-500/20 hover:border-amber-500'
                      : isHamburg
                      ? 'border-amber-400 ring-2 ring-amber-500/20 hover:border-amber-500'
                      : isActon
                      ? 'border-sky-400 ring-2 ring-sky-500/20 hover:border-sky-500'
                      : isYoken
                      ? 'border-sky-400 ring-2 ring-sky-500/20 hover:border-sky-500'
                      : isSiltal
                      ? 'border-sky-400 ring-2 ring-sky-500/20 hover:border-sky-500'
                      : isPassap
                      ? 'border-amber-400 ring-2 ring-amber-500/20 hover:border-amber-500'
                      : isAlwaad
                      ? 'border-sky-400 ring-2 ring-sky-500/20 hover:border-sky-500'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {/* Top Thumbnail Strip */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img 
                      src={thumbImg} 
                      alt={title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-3 end-3 flex items-center gap-1.5">
                      {hasDedicatedPage && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                          {isAr ? 'صفحة مستقلة ↗' : 'Dedicated ↗'}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 start-4 end-4 flex items-end justify-between text-white">
                      <div>
                        <div className="text-2xl font-black text-emerald-400 tabular-nums">
                          {mainMetric?.value}
                        </div>
                        <div className="text-[11px] font-medium text-slate-300">
                          {isAr ? mainMetric?.label : mainMetric?.labelEn}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-md">
                        {study.sector}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">{client} · {industry}</div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {solution}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
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
        )}
      </section>

      {/* Lightbox Image Preview Modal */}
      {previewStudy && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setPreviewStudy(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto text-white shadow-2xl relative text-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isAr ? previewStudy.client : previewStudy.clientEn}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? previewStudy.industry : previewStudy.industryEn}
                </p>
              </div>

              <button
                onClick={() => setPreviewStudy(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 space-y-5">
              <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                <img
                  src={previewStudy.thumbnailUrl || previewStudy.image}
                  alt={previewStudy.title}
                  className="max-h-[60vh] w-auto object-contain mx-auto"
                />
              </div>

              {/* Metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previewStudy.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
                    <div className="text-lg font-black text-sky-400 tabular-nums">{m.value}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                      {isAr ? m.label : m.labelEn}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-300 line-clamp-2">
                  {isAr ? previewStudy.solution : previewStudy.solutionEn}
                </p>

                <button
                  onClick={() => {
                    const s = previewStudy;
                    setPreviewStudy(null);
                    handleStudyClick(s);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {isAr ? 'استعراض دراسة الحالة الكاملة ↗' : 'Open Full Case Study ↗'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry & Tailored Plan Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 border border-slate-700 text-start flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'حلول تسويق رقمي متخصصة' : 'Custom Digital Marketing Solutions'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isAr ? 'تريد نفس المستوى البصري والنتائج لعلامتك التجارية؟' : 'Ready to Elevate Your Brand with Identical Impact?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {isAr 
                ? 'فريقنا المتخصص يصمم هويات بصرية وحملات استهداف رقمي مصممة خصيصاً لمضاعفة مبيعاتك وتصدر قطاعك.' 
                : 'Our dedicated creative and media team crafts bespoke campaign identities engineered to scale your revenue.'}
            </p>
          </div>

          <button
            onClick={() => setIsConsultationOpen(true)}
            className="px-7 py-3.5 text-xs sm:text-sm font-black text-white bg-sky-600 hover:bg-sky-500 rounded-2xl transition-all shadow-lg hover:shadow-sky-500/30 cursor-pointer shrink-0 relative z-10"
          >
            {isAr ? 'احجز استشارة وخطتك التسويقية' : 'Book Consultation & Action Plan'}
          </button>
        </div>
      </section>
    </div>
  );
};
