import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { HighlightedPackageCard } from '../components/HighlightedPackageCard';
import { 
  Stethoscope, 
  MapPin, 
  Video, 
  CalendarCheck, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  Award,
  TrendingUp,
  ExternalLink,
  Eye,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const MedicalPage: React.FC = () => {
  const { data, language, t, setSelectedCaseStudy, setIsConsultationOpen, setCurrentPage } = useAgencyData();
  const isAr = language === 'ar';
  const content = isAr ? t.medicalPage : t.medicalPage;

  // Filter ONLY Medical Packages and Case Studies
  const medicalPackages = data.packages.filter((p) => p.sector === 'medical');
  const medicalCaseStudies = data.caseStudies.filter((c) => c.sector === 'medical');

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Dedicated Medical Hero with Custom Background Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 sm:pt-20 pb-20 sm:pb-28 border-b border-slate-800">
        {/* Banner Graphic Background Layer */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img 
            src="/assets/aistudio/Med_bd512f27.png" 
            alt="Medical & Healthcare Sector Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Directional & subtle spotlight overlays for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/35 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 text-start">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-400/30">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>{content.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] text-balance">
              {content.title}{' '}
              <span className="text-emerald-400 underline decoration-emerald-500 decoration-wavy underline-offset-8">
                {content.highlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              {content.desc}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-all shadow-lg hover:shadow-emerald-400/20 cursor-pointer whitespace-nowrap"
              >
                <span>{isAr ? 'حجز جلسة استراتيجية للعيادة أو المركز' : 'Book Medical Strategy Consultation'}</span>
                <CalendarCheck className="w-4 h-4" />
              </button>

              <a
                href="#medical-packages"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 whitespace-nowrap"
              >
                <span>{isAr ? 'استعراض باقات القطاع الطبي' : 'View Healthcare Packages'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Verified Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
            {content.kpis.map((kpi, idx) => (
              <div key={idx} className="pt-4 md:pt-0 text-start space-y-1 px-4">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 tabular-nums">
                  {kpi.val}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {kpi.label}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isAr ? 'أرقام حقيقية عبر المراكز والعيادات ومجمعات الجراحة' : 'Audited across private clinics & surgery hospitals'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated Medical Packages Section with Highlight */}
      <section id="medical-packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start max-w-3xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'باقات الرعاية الصحية والعيادات المستقلة' : 'Dedicated Healthcare & Clinic Growth Plans'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {content.packagesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {content.packagesDesc}
          </p>
        </div>

        {/* 3 Packages Grid with Middle Package Highlighted */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {medicalPackages.map((pkg) => (
            <HighlightedPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* Medical Marketing Ethics & Methodology */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="text-start mb-8 space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {isAr ? 'معايير ديجيتال إفكت في التسويق الطبي الأخلاقي' : 'Our Ethical Medical Marketing Pillars'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAr ? 'كيف نحافظ على هيبة الطبيب وسمعة المركز مع مضاعفة أعداد المراجعين:' : 'Safeguarding clinical prestige while scaling patient appointments:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'تصدر خرائط جوجل محلياً' : '#1 Google Maps Healthcare SEO'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'جعل عيادتك الخيار الأول والأكثر ثقة عندما يبحث المريض في منطقته الجغرافية.' : 'Positioning your clinic at the top of local map searches when patients need care.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'فيديوهات الأطباء الاستشاريين' : 'Physician Authority Videos'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'تصوير محتوى طبي رصين يشرح الحالات العلاجية ويبني الطمأنينة قبل الزيارة.' : 'Dignified 4K medical videos where doctors explain procedures transparently.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'مسارات حجز مؤكدة' : 'Patient Triage & Booking'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'ربط الحملات بروتوكول واتساب فوري يرفع نسبة التزام المرضى بالمواعيد.' : 'Immediate WhatsApp triage bots reducing clinic no-show rates.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'إدارة السمعة والتقييمات' : 'Medical Reputation Management'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'حوكمة مراجعات المرضى وتقديم ردود مهنية تعكس مستوى الرعاية الصحية.' : 'Ethical review harvesting and dignified responses to all feedback.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Medical Case Studies Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-start max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{content.caseStudiesTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'قصص نجاح حقيقية وأرقام موثقة في القطاع الطبي' : 'Audited Medical Case Studies & Real Results'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isAr 
              ? 'نموذج موثق بالأرقام والنتائج من شراكتنا مع مركز IPT للعلاج الطبيعي والتأهيل الحركي.' 
              : 'Audited results and real patient inquiry figures from our partnership with IPT Physiotherapy Center.'}
          </p>
        </div>

        {/* Flagship Case Study: IPT Physiotherapy Center */}
        {(() => {
          const iptStudy = medicalCaseStudies.find((c) => c.id === 'cs-med-ipt');
          if (!iptStudy) return null;

          return (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl relative overflow-hidden text-start">
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 space-y-8">
                {/* Header row: Client logo + Tags + Original link */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shrink-0 border border-white/20">
                      <img 
                        src="/assets/ipt/ipt_logo.png" 
                        alt="IPT Physiotherapy Center" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{isAr ? 'قصة نجاح متميزة — شريك معتمد' : 'Flagship Medical Partner Case Study'}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {isAr ? iptStudy.client : iptStudy.clientEn}
                      </h3>
                      <div className="text-xs text-slate-400">
                        {isAr ? iptStudy.industry : iptStudy.industryEn} · {isAr ? `المدة: ${iptStudy.duration}` : `Timeline: ${iptStudy.durationEn}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href="https://digitaleffect.net/ipt/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                    >
                      <span>{isAr ? 'رابط الصفحة الأصلية' : 'Live Client Case Study'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setCurrentPage('ipt-case-study')}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md cursor-pointer"
                    >
                      <span>{isAr ? 'عرض صفحة دراسة الحالة المستقلة' : 'View Dedicated Case Study Page'}</span>
                      {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Title & Core narrative */}
                <div className="space-y-3 max-w-3xl">
                  <h4 className="text-lg sm:text-2xl font-black text-emerald-300 leading-snug">
                    {isAr ? iptStudy.title : iptStudy.titleEn}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {isAr 
                      ? 'من مجرد التواجد على منصات التواصل إلى بناء أثر رقمي حقيقي وملموس. نجحنا في نقل مركز IPT للعلاج الطبيعي والتأهيل الحركي من الحضور الروتيني إلى تحقيق أرقام مشاهدات قياسية وتفاعل استثنائي حول المتابعين إلى مرضى ومراجعين دائمين.'
                      : 'From simply existing on social platforms to generating measurable clinical bookings. We scaled IPT Physiotherapy Center into a regional authority with viral reach and consistent patient inquiries.'}
                  </p>
                </div>

                {/* The 4 audited KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نمو معدل التفاعل' : 'Engagement Growth'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      +43,576%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isAr ? 'تفاعل غير مسبوق مع المحتوى' : 'Audited multi-channel surge'}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مشاهدات الحملات' : 'Campaign Impressions'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      2.4M+
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isAr ? 'وصول دقيق لحالات التأهيل' : 'Targeted potential patients'}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مشاهدات فيديو > ٣ ث' : '3-Sec Video Views'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      654K+
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      {isAr ? '+120,522% زيادة المشاهدة' : '+120,522% video watch rate'}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تفاعل حقيقي مع المحتوى' : 'Direct Interactions'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      73,000+
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isAr ? '١٢.٧ ألف إعجاب و ٢.٧ ألف تعليق' : '12.7K reactions & 2.7K inquiries'}
                    </div>
                  </div>
                </div>

                {/* Creative Campaign Gallery Row */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>{isAr ? 'معرض بوستات الحملة والإحصائيات التوثيقية من الرابط الرسمي:' : 'Audited Campaign Creatives & Proof Banners:'}</span>
                    <span className="text-[11px] text-emerald-400">{isAr ? 'انقر على أي صورة للتكبير' : 'Click to inspect'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    <div 
                      onClick={() => setCurrentPage('ipt-case-study')}
                      className="cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square relative shadow-md"
                    >
                      <img 
                        src="/assets/ipt/ipt_stats_banner.jpg" 
                        alt="IPT Analytics Banner" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                        {isAr ? 'تقرير الأداء' : 'Analytics'}
                      </div>
                    </div>

                    <div 
                      onClick={() => setCurrentPage('ipt-case-study')}
                      className="cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square relative shadow-md"
                    >
                      <img 
                        src="/assets/ipt/ipt_hero_banner.png" 
                        alt="IPT Hero Banner" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                        {isAr ? 'الهوية والبانر' : 'Hero Banner'}
                      </div>
                    </div>

                    {[1, 2, 3, 4].map((num) => (
                      <div 
                        key={num}
                        onClick={() => setCurrentPage('ipt-case-study')}
                        className="cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square relative shadow-md"
                      >
                        <img 
                          src={`/assets/ipt/ipt_creative_${num}.jpg`} 
                          alt={`IPT Creative ${num}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                          {isAr ? `تصميم ${num}` : `Post ${num}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Other Medical Case Studies Grid (only if extra studies exist) */}
        {medicalCaseStudies.filter((study) => study.id !== 'cs-med-ipt').length > 0 && (
          <div className="pt-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 text-start">
              {isAr ? 'دراسات حالة إضافية في القطاع الطبي' : 'Additional Healthcare Case Studies'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {medicalCaseStudies
                .filter((study) => study.id !== 'cs-med-ipt')
                .map((study) => {
                  const title = isAr ? study.title : study.titleEn;
                  const client = isAr ? study.client : study.clientEn;
                  const industry = isAr ? study.industry : study.industryEn;
                  const solution = isAr ? study.solution : study.solutionEn;
                  const mainMetric = study.metrics[0];

                  return (
                    <div
                      key={study.id}
                      onClick={() => setSelectedCaseStudy(study)}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all p-6 sm:p-8 flex flex-col justify-between text-start cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-bold text-emerald-600">{industry}</span>
                          <span>{isAr ? `المدة: ${study.duration}` : `Duration: ${study.durationEn}`}</span>
                        </div>

                        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center justify-between">
                          <div>
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tabular-nums">
                              {mainMetric?.value}
                            </div>
                            <div className="text-xs font-bold text-slate-800 mt-0.5">
                              {isAr ? mainMetric?.label : mainMetric?.labelEn}
                            </div>
                          </div>
                          {study.metrics[1] && (
                            <div className="text-end">
                              <div className="text-2xl font-black text-slate-900 tabular-nums">
                                {study.metrics[1].value}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {isAr ? study.metrics[1].label : study.metrics[1].labelEn}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-bold text-slate-600">{client}</div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                            {title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {solution}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-emerald-600">
                        <span>{t.common.viewDetails}</span>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* Medical Call To Action Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-start flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {content.ctaTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {content.ctaDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer text-center"
            >
              {isAr ? 'حجز جلسة تسويق طبي' : 'Schedule Clinic Session'}
            </button>
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent('مرحباً ديجيتال إفكت، أود استشارة حول حلول وباقات القطاع الطبي والرعاية الصحية')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors text-center"
            >
              {t.common.whatsAppChat}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
