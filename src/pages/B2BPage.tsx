import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { HighlightedPackageCard } from '../components/HighlightedPackageCard';
import { 
  Building2, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  CalendarCheck, 
  FileText,
  Users,
  Target,
  ExternalLink,
  Award,
  Sparkles,
  Factory,
  Eye,
  MapPin
} from 'lucide-react';

export const B2BPage: React.FC = () => {
  const { data, language, t, setSelectedCaseStudy, setIsConsultationOpen, setCurrentPage } = useAgencyData();
  const isAr = language === 'ar';
  const content = isAr ? t.b2bPage : t.b2bPage;

  // Filter ONLY B2B Packages and Case Studies
  const b2bPackages = data.packages.filter((p) => p.sector === 'b2b');
  const b2bCaseStudies = data.caseStudies.filter((c) => c.sector === 'b2b');

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Dedicated B2B Hero with Custom Background Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 sm:pt-20 pb-20 sm:pb-28 border-b border-slate-800">
        {/* Banner Graphic Background Layer */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img 
            src="/assets/aistudio/b2b_35422994.png" 
            alt="B2B Enterprise Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Directional & subtle spotlight overlays for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/35 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 text-start">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-300 bg-sky-950/80 px-3.5 py-1.5 rounded-full border border-sky-400/30">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>{content.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] text-balance">
              {content.title}{' '}
              <span className="text-sky-400 underline decoration-sky-500 decoration-wavy underline-offset-8">
                {content.highlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              {content.desc}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-xl transition-all shadow-lg hover:shadow-sky-400/20 cursor-pointer whitespace-nowrap"
              >
                <span>{isAr ? 'طلب مناقشة خط تعاقدات B2B' : 'Request B2B Pipeline Review'}</span>
                <CalendarCheck className="w-4 h-4" />
              </button>

              <a
                href="#b2b-packages"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 whitespace-nowrap"
              >
                <span>{isAr ? 'استعراض باقات الـ B2B' : 'View B2B Packages'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Verified Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
            {content.kpis.map((kpi, idx) => (
              <div key={idx} className="pt-4 md:pt-0 text-start space-y-1 px-4">
                <div className="text-3xl sm:text-4xl font-black text-sky-600 tabular-nums">
                  {kpi.val}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {kpi.label}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isAr ? 'موثق عبر حسابات العملاء الصناعيين والتقنيين' : 'Audited across industrial & SaaS accounts'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated B2B Packages Section with Highlight */}
      <section id="b2b-packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start max-w-3xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            <Briefcase className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? 'خطط وباقات قطاع الشركات المستقلة' : 'Dedicated B2B Enterprise Retainers'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {content.packagesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {content.packagesDesc}
          </p>
        </div>

        {/* B2B Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
          {b2bPackages.map((pkg) => (
            <HighlightedPackageCard key={pkg.id} pkg={pkg} />
          ))}

          {/* Custom Enterprise Retainer Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-start border border-slate-700 shadow-xl">
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-lg border border-sky-400/30 w-fit">
                {isAr ? 'الشركات والمصانع الكبرى' : 'Enterprise & High Volume'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isAr ? 'باقة الشركات المخصصة (Custom Scope)' : 'Custom Enterprise B2B Retainer'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'للشركات الصناعية والتقنية التي تستهدف عقوداً سنوية ضخمة وتحتاج إلى حملات ABM موجهة وصناعة أوراق عمل فنية.'
                  : 'For industrial manufacturers and tech companies targeting multi-million tenders requiring customized ABM funnels.'}
              </p>
              <div className="py-3.5 border-y border-white/10 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white">{isAr ? 'خيارات متاحة حسب الحاجة:' : 'Customized scope options:'}</div>
                <div>• {isAr ? 'حملات LinkedIn متقدمة لاستهداف صناع القرار' : 'Advanced LinkedIn ABM decision-maker campaigns'}</div>
                <div>• {isAr ? 'إنتاج وثائقيات وتغطيات ميدانية للمصانع' : 'On-site factory video shoots & technical documentation'}</div>
                <div>• {isAr ? 'ربط وأتمتة الـ CRM وتأهيل الـ Leads' : 'Full CRM integration & lead pre-qualification'}</div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer text-center"
              >
                {isAr ? 'طلب دراسة تسعير مخصص للشركات' : 'Request Custom B2B Proposal'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Strategic Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="text-start mb-8 space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {isAr ? 'كيف ندير خطوط مبيعات B2B بنجاح منذ ١٢ عاماً؟' : 'How We Engineer Predictable B2B Pipelines'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAr ? 'الركائز الأربع التي نطبقها في كل مشروع شركات:' : 'The four foundational pillars executed in every B2B project:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 w-fit">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'قوائم حسابات مستهدفة (ABM)' : 'Account-Based Targeting'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'استهداف شركات محددة بالاسم وصناع القرار ومسؤولي المشتريات بالمنطقة.' : 'Identifying specific high-value enterprise accounts and their decision-makers.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'أوراق عمل ومحتوى فني' : 'Technical Thought Leadership'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'صياغة أوراق تقنية تبرز الجدوى الاقتصادية وتقنع المديرين الماليين.' : 'Technical whitepapers and ROI analyses that persuade CFOs.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'تأهيل الصفقات المسبق (SQL)' : 'Lead Pre-Qualification'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'فرز العميل المحتمل والتأكد من ميزانيته وجديته قبل تمريره لفريق مبيعاتك.' : 'Filtering inbound inquiries for budget and authority before sales rep handoff.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'ربط وأتمتة الـ CRM' : 'Full CRM Integration'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'مزامنة فورية مع HubSpot أو Zoho لمنع تسرب أي فرصة بيعية.' : 'Instant synchronization with HubSpot or Zoho to ensure zero lead leakage.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated B2B Case Studies Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-start max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            <Factory className="w-3.5 h-3.5" />
            <span>{content.caseStudiesTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAr ? 'نتائج موثقة في القطاعات الصناعية والاستثمارية الكبرى' : 'Proven Enterprise & Industrial Success Cases'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isAr 
              ? 'نماذج شراكة حقيقية تبرز كيف تبني ديجيتال إفكت منصات رقمية وحملات B2B تقود النمو الصناعي وتجذب الاستثمارات.'
              : 'Real partnership benchmarks demonstrating how Digital Effect engineers B2B growth engines and inward capital investment.'}
          </p>
        </div>

        {/* Flagship Case Study: BSIZIA (Beni Suef Industrial Zones) */}
        {(() => {
          const bsiziaStudy = b2bCaseStudies.find((c) => c.id === 'cs-b2b-bsizia');
          if (!bsiziaStudy) return null;

          return (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 border border-sky-500/30 shadow-2xl relative overflow-hidden text-start">
              <div className="relative z-10 space-y-8">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 sm:h-16 w-36 sm:w-44 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg shrink-0 border border-white/20">
                      <img 
                        src="/assets/bsizia/bsizia_img_1.png" 
                        alt="ACTON BLUE ICE / BSIZIA" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30 mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{isAr ? 'قصة نجاح متميزة — قطاع B2B الصناعي' : 'Flagship Industrial B2B Case Study'}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {isAr ? bsiziaStudy.client : bsiziaStudy.clientEn}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{isAr ? bsiziaStudy.industry : bsiziaStudy.industryEn}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-sky-400">
                          <MapPin className="w-3 h-3" />
                          {isAr ? 'بني سويف — مصر' : 'Beni Suef — Egypt'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href="https://digitaleffect.net/bsizia/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                    >
                      <span>{isAr ? 'رابط الصفحة الأصلية' : 'Live Client Case Study'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setCurrentPage('bsizia-case-study')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 transition-colors shadow-lg shadow-sky-400/25 cursor-pointer"
                    >
                      <span>{isAr ? 'استعراض دراسة الحالة بالصفحة المستقلة' : 'Open Dedicated Case Page'}</span>
                      {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
                        {isAr ? bsiziaStudy.title : bsiziaStudy.titleEn}
                      </h4>
                      <p className="text-sm text-sky-300/90 font-medium">
                        {isAr ? bsiziaStudy.subtitle : bsiziaStudy.subtitleEn}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {isAr ? bsiziaStudy.solution : bsiziaStudy.solutionEn}
                    </p>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(isAr ? bsiziaStudy.services : bsiziaStudy.servicesEn).map((srv, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 rounded-lg text-xs bg-slate-800/90 border border-slate-700 text-slate-300 font-medium"
                        >
                          ✓ {srv}
                        </span>
                      ))}
                    </div>

                    {/* Industrial Quote */}
                    {bsiziaStudy.quote && (
                      <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-xs text-slate-300 italic">
                        "{isAr ? bsiziaStudy.quote.text : bsiziaStudy.quote.textEn}"
                        <div className="text-end text-[11px] font-bold text-sky-400 not-italic mt-2">
                          — {isAr ? bsiziaStudy.quote.author : bsiziaStudy.quote.authorEn}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Creative Showcase */}
                  <div className="lg:col-span-5 space-y-4">
                    <div 
                      onClick={() => setCurrentPage('bsizia-case-study')}
                      className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group cursor-pointer aspect-[4/3] flex items-center justify-center p-2"
                    >
                      <img 
                        src="/assets/bsizia/bsizia_img_6.png" 
                        alt="BSIZIA Industrial Campaign" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50"></div>
                      <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-xs text-white">
                        <span className="font-bold bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                          {isAr ? 'الهوية البصرية الصناعية' : 'Industrial Brand Identity'}
                        </span>
                        <span className="text-sky-400 font-semibold flex items-center gap-1 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                          {isAr ? 'عرض ٨ تصاميم بالحجم الكامل ↗' : 'View 8 Full Creatives ↗'}
                        </span>
                      </div>
                    </div>

                    {/* Creative Previews row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        '/assets/bsizia/bsizia_img_8.jpg',
                        '/assets/bsizia/bsizia_img_9.jpg',
                        '/assets/bsizia/bsizia_img_10.jpg',
                        '/assets/bsizia/bsizia_img_13.jpg'
                      ].map((img, i) => (
                        <div 
                          key={i}
                          onClick={() => setCurrentPage('bsizia-case-study')}
                          className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 hover:border-sky-500/60 transition-all cursor-pointer"
                        >
                          <img src={img} alt="Creative Thumbnail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audited Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                  {bsiziaStudy.metrics.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="text-2xl sm:text-3xl font-black text-sky-400 tabular-nums">
                        {m.value}
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        {isAr ? m.label : m.labelEn}
                      </div>
                      <div className="text-[11px] text-slate-400 font-light">
                        {isAr ? m.hint : m.hintEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Other B2B Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {b2bCaseStudies.filter(c => c.id !== 'cs-b2b-bsizia').map((study) => {
            const title = isAr ? study.title : study.titleEn;
            const client = isAr ? study.client : study.clientEn;
            const industry = isAr ? study.industry : study.industryEn;
            const solution = isAr ? study.solution : study.solutionEn;
            const mainMetric = study.metrics[0];

            return (
              <div
                key={study.id}
                onClick={() => setSelectedCaseStudy(study)}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all p-6 sm:p-8 flex flex-col justify-between text-start cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-sky-600">{industry}</span>
                    <span>{isAr ? `المدة: ${study.duration}` : `Duration: ${study.durationEn}`}</span>
                  </div>

                  <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-100 flex items-center justify-between">
                    <div>
                      <div className="text-3xl sm:text-4xl font-black text-sky-600 tabular-nums">
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
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {solution}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-sky-600">
                  <span>{t.common.viewDetails}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* B2B Call To Action Box */}
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
              className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors cursor-pointer text-center"
            >
              {isAr ? 'حجز جلسة استراتيجية B2B' : 'Schedule Strategy Session'}
            </button>
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent('مرحباً ديجيتال إفكت، أود استشارة حول حلول وباقات قطاع الشركات B2B')}`}
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
