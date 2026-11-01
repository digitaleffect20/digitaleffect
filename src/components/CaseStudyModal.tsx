import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { 
  X, 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Quote, 
  Briefcase 
} from 'lucide-react';

export const CaseStudyModal: React.FC = () => {
  const { selectedCaseStudy, setSelectedCaseStudy, setIsConsultationOpen, language, t } = useAgencyData();
  const isAr = language === 'ar';

  if (!selectedCaseStudy) return null;

  const title = isAr ? selectedCaseStudy.title : selectedCaseStudy.titleEn;
  const client = isAr ? selectedCaseStudy.client : selectedCaseStudy.clientEn;
  const industry = isAr ? selectedCaseStudy.industry : selectedCaseStudy.industryEn;
  const duration = isAr ? selectedCaseStudy.duration : selectedCaseStudy.durationEn;
  const challenge = isAr ? selectedCaseStudy.challenge : selectedCaseStudy.challengeEn;
  const solution = isAr ? selectedCaseStudy.solution : selectedCaseStudy.solutionEn;
  const services = isAr ? selectedCaseStudy.services : (selectedCaseStudy.servicesEn?.length ? selectedCaseStudy.servicesEn : selectedCaseStudy.services);
  const quote = selectedCaseStudy.quote;

  const getSectorLabel = (sector: string) => {
    switch (sector) {
      case 'b2b':
        return isAr ? 'قطاع الشركات والمؤسسات (B2B)' : 'B2B Enterprise Division';
      case 'b2c':
        return isAr ? 'قطاع التجزئة والمستهلكين (B2C)' : 'B2C & E-Commerce Division';
      case 'medical':
        return isAr ? 'القطاع الطبي والرعاية الصحية (Medical)' : 'Medical & Healthcare Division';
      default:
        return 'General Case Study';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative text-start flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-sky-700 font-bold">
                {getSectorLabel(selectedCaseStudy.sector)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{industry}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAr ? `المدة: ${duration}` : `Timeline: ${duration}`}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {title}
            </h3>

            <div className="flex items-center gap-3">
              {selectedCaseStudy.logoUrl && (
                <div className="h-9 w-9 rounded-lg bg-white p-1 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src={selectedCaseStudy.logoUrl}
                    alt={client}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="text-xs font-medium text-slate-600">
                {isAr ? 'العميل الشريك: ' : 'Partner Client: '}
                <span className="font-bold text-slate-900">{client}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCaseStudy(null)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Page Jump Banner if applicable */}
        {(selectedCaseStudy.id === 'cs-b2b-bsizia' || selectedCaseStudy.id === 'cs-b2c-penguin' || selectedCaseStudy.id === 'cs-med-ipt') && (
          <div className="bg-sky-50 px-6 py-3 border-b border-sky-100 flex items-center justify-between gap-3 text-xs">
            <span className="text-sky-800 font-medium">
              {isAr ? 'تتوفر دراسة الحالة هذه في صفحة مستقلة تعرض كافة التصاميم بالحجم الكامل والوضوح الفائق.' : 'This case study has a dedicated standalone page displaying all high-resolution visuals.'}
            </span>
            <button
              onClick={() => {
                const targetPage = 
                  selectedCaseStudy.id === 'cs-b2b-bsizia' ? 'bsizia-case-study' :
                  selectedCaseStudy.id === 'cs-b2c-penguin' ? 'penguin-case-study' : 'ipt-case-study';
                setSelectedCaseStudy(null);
                useAgencyData; // no-op reference check
                window.location.hash = `#${targetPage}`;
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold shrink-0 shadow-xs"
            >
              {isAr ? 'فتح الصفحة المستقلة ↗' : 'Open Dedicated Page ↗'}
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Key Metric Highlights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
            {selectedCaseStudy.metrics.map((metric, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-sky-100/60 text-center">
                <div className="text-2xl sm:text-3xl font-black text-sky-600 tabular-nums">
                  {metric.value}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {isAr ? metric.label : metric.labelEn}
                </div>
                {(isAr ? metric.hint : metric.hintEn) && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isAr ? metric.hint : metric.hintEn}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* The Challenge */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{isAr ? 'التحدي قبل التدخل:' : 'The Initial Challenge:'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {challenge}
            </p>
          </div>

          {/* The Solution */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              <span>{isAr ? 'الحل والاستراتيجية المنفذة:' : 'Implemented Strategy & Execution:'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {solution}
            </p>
          </div>

          {/* Services Applied */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              {isAr ? 'الخدمات والحلول المطبقة في المشروع:' : 'Services & Frameworks Deployed:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((svc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{svc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Visuals & Gallery Showcase if available */}
          {(selectedCaseStudy.gallery?.length || selectedCaseStudy.statsImage) && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between">
                <span>{isAr ? 'معرض نماذج الحملة والإحصائيات الموثقة:' : 'Campaign Creatives & Audited Analytics:'}</span>
                {selectedCaseStudy.clientUrl && (
                  <a
                    href={selectedCaseStudy.clientUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
                  >
                    {isAr ? 'رابط الصفحة الأصلية ↗' : 'Original Case Study ↗'}
                  </a>
                )}
              </h4>

              {/* Analytics banner if available */}
              {selectedCaseStudy.statsImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                  <img
                    src={selectedCaseStudy.statsImage}
                    alt="Audited Analytics Proof"
                    className="w-full h-auto object-cover max-h-72 hover:scale-[1.01] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Creative Posts Gallery Grid */}
              {selectedCaseStudy.gallery && selectedCaseStudy.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedCaseStudy.gallery.map((imgSrc, idx) => (
                    <div 
                      key={idx} 
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-xs"
                    >
                      <img
                        src={imgSrc}
                        alt={`Creative ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quote if available */}
          {quote && (
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl relative overflow-hidden">
              <Quote className="w-8 h-8 text-sky-400/30 absolute top-4 end-4" />
              <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed mb-3">
                "{isAr ? quote.text : quote.textEn}"
              </p>
              <div className="text-xs">
                <span className="font-bold text-white">{isAr ? quote.author : quote.authorEn}</span>
                <span className="text-slate-400 mx-2">—</span>
                <span className="text-sky-300">{isAr ? quote.role : quote.roleEn}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            {isAr ? 'هل ترغب في تحقيق نتائج مماثلة لنشاطك التجاري؟' : 'Ready to achieve similar verifiable growth for your brand?'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCaseStudy(null)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              {t.common.close}
            </button>
            <button
              onClick={() => {
                setSelectedCaseStudy(null);
                setIsConsultationOpen(true);
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isAr ? 'طلب خطة عمل مشابهة لمشروعك' : 'Request Similar Action Plan'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
