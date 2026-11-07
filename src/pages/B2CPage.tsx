import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { HighlightedPackageCard } from '../components/HighlightedPackageCard';
import { 
  ShoppingBag, 
  Zap, 
  TrendingUp, 
  Video, 
  ShoppingCart, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CalendarCheck,
  CheckCircle2,
  Percent,
  Award,
  Flame,
  ExternalLink,
  Users,
  Eye
} from 'lucide-react';

export const B2CPage: React.FC = () => {
  const { data, language, t, setSelectedCaseStudy, setIsConsultationOpen, setCurrentPage } = useAgencyData();
  const isAr = language === 'ar';
  const content = isAr ? t.b2cPage : t.b2cPage;

  // Filter ONLY B2C Packages and Case Studies
  const b2cPackages = data.packages.filter((p) => p.sector === 'b2c');
  const b2cCaseStudies = data.caseStudies.filter((c) => c.sector === 'b2c');

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Dedicated B2C Hero with Custom Background Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 sm:pt-20 pb-20 sm:pb-28 border-b border-slate-800">
        {/* Banner Graphic Background Layer */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img 
            src="/assets/aistudio/_b2c_b1451d99.png" 
            alt="B2C Consumer & Retail Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Directional & subtle spotlight overlays for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/35 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 text-start">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-400/30">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{content.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] text-balance">
              {content.title}{' '}
              <span className="text-amber-400 underline decoration-amber-500 decoration-wavy underline-offset-8">
                {content.highlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              {content.desc}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl transition-all shadow-lg hover:shadow-amber-400/20 cursor-pointer whitespace-nowrap"
              >
                <span>{isAr ? 'طلب تدقيق مجاني لحساباتك الإعلانية' : 'Request Free Ad Account Audit'}</span>
                <CalendarCheck className="w-4 h-4" />
              </button>

              <a
                href="#b2c-packages"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 whitespace-nowrap"
              >
                <span>{isAr ? 'استعراض باقات الـ B2C' : 'View B2C Packages'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* B2C Verified Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
            {content.kpis.map((kpi, idx) => (
              <div key={idx} className="pt-4 md:pt-0 text-start space-y-1 px-4">
                <div className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
                  {kpi.val}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {kpi.label}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isAr ? 'معدلات أداء حقيقية عبر المتاجر وبراندات التجزئة' : 'Verified across retail and online storefronts'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated B2C Packages Section with Highlight */}
      <section id="b2c-packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start max-w-3xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? 'باقات وعروض التجارة الإلكترونية والتجزئة' : 'Dedicated B2C & E-Com Scaling Plans'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {content.packagesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {content.packagesDesc}
          </p>
        </div>

        {/* 4 Packages Grid (Active, Interact, Engage, Advance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {b2cPackages.map((pkg) => (
            <HighlightedPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* B2C E-Commerce Playbook Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="text-start mb-8 space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {isAr ? 'معادلة ديجيتال إفكت لمضاعفة مبيعات المتاجر' : 'Our High-Velocity E-Commerce Playbook'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAr ? 'كيف نحافظ على عائد ROAS مرتفع مع زيادة الإنفاق الإعلاني:' : 'How we sustain profitable ROAS while aggressively scaling ad budgets:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'محتوى فيديو UGC فيروسي' : 'Viral UGC Video Production'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'صناعة إعلانات واقعية مع صناع محتوى تحاكي الفيديوهات العادية وتجلب تفاعلاً سريعاً.' : 'Authentic creator video reels that blend natively into social feeds and drive clicks.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'مزايدة إعلانية ذكية (Advantage+)' : 'Smart Advantage+ Bidding'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'هيكلة حسابات متقدمة تمنع التداخل وتستغل خوارزميات ميتا وتيك توك لأقصى حد.' : 'Consolidated account architectures leveraging machine-learning audience signals.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'استرجاع السلات المتروكة' : 'Automated Cart Recovery'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'رسائل واتساب ورسائل بريدية فورية تخفض معدل فقدان المشترين عند الدفع.' : 'Instant automated WhatsApp & SMS triggers reclaiming lost checkout revenue.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit">
                <Percent className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{isAr ? 'رفع متوسط قيمة السلة (AOV)' : 'AOV & LTV Optimization'}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? 'عروض تكميلية وباقات ذكية ترفع ربحية كل طلب مستلم بنسبة تفوق ٢٥٪.' : 'Strategic bundle upsells and post-purchase offers boosting cart profitability.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated B2C Case Studies Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-start max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{content.caseStudiesTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'قصص نجاح موثقة لعلامات تجارية ومتاجر تجزئة' : 'Verified E-Commerce & Retail Brand Case Studies'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isAr 
              ? 'نماذج استثنائية تثبت قوة الحملات التسويقية في رفع المبيعات، ومضاعفة العائد الإعلاني ROAS، وفتح قنوات بيع وتقسيط كبرى.' 
              : 'Proven models demonstrating sales acceleration, high seasonal ROAS, and scalable retail financing funnels.'}
          </p>
        </div>

        {/* Flagship Case Study: Penguin Home Appliances */}
        {(() => {
          const penguinStudy = b2cCaseStudies.find((c) => c.id === 'cs-b2c-penguin');
          if (!penguinStudy) return null;

          return (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 border border-sky-500/30 shadow-2xl relative overflow-hidden text-start">
              {/* Background image overlay */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
                style={{
                  backgroundImage: `url('/assets/penguin/penguin_hero_bg.jpg')`,
                }}
              />

              <div className="relative z-10 space-y-8">
                {/* Header row: Client logo + Tags + Original link */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 sm:h-16 w-36 sm:w-44 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shrink-0 border border-white/20">
                      <img 
                        src="/assets/penguin/penguin_logo.png" 
                        alt="Penguin Home Appliances" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30 mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{isAr ? 'قصة نجاح متميزة — قطاع B2C والتجزئة' : 'Flagship B2C Retail Case Study'}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {isAr ? penguinStudy.client : penguinStudy.clientEn}
                      </h3>
                      <div className="text-xs text-slate-400">
                        {isAr ? penguinStudy.industry : penguinStudy.industryEn} · {isAr ? `المدة: ${penguinStudy.duration}` : `Timeline: ${penguinStudy.durationEn}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href="https://digitaleffect.net/penguin/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                    >
                      <span>{isAr ? 'رابط الصفحة الأصلية' : 'Live Client Case Study'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setCurrentPage('penguin-case-study')}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md cursor-pointer"
                    >
                      <span>{isAr ? 'عرض صفحة دراسة الحالة المستقلة' : 'View Dedicated Case Study Page'}</span>
                      {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Hero Showcase with Appliances Lineup */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-r from-sky-900/60 to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-sky-500/20">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-950 text-sky-300 rounded-full text-xs font-bold border border-sky-800">
                      <Flame className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAr ? 'حملات الصيف والتقسيط مع ValU و 2B' : 'Summer Campaign & ValU Partnerships'}</span>
                    </div>
                    <h4 className="text-lg sm:text-2xl font-black text-white leading-snug">
                      {isAr ? penguinStudy.title : penguinStudy.titleEn}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {isAr
                        ? 'إعادة هيكلة العلامة التجارية بصرياً عبر تصاميم عالية الدقة وفيديوهات موشن جرافيك تبرز كفاءة الكمبروسر الاستوائي والمكونات الإيطالية، مع قيادة حملات صيفية ضاعفت المبيعات وعروض تقسيط بدون فوائد بالتعاون مع ValU وسلاسل 2B.'
                        : 'Visual brand transformation with 15+ animated reels showcasing tropical Italian cooling efficiency and scaling retail demand through zero-friction 0% installment funnels.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-slate-200">{isAr ? 'كمبروسر استوائي' : 'Tropical Compressor'}</span>
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-slate-200">{isAr ? 'مكونات إيطالية' : 'Italian Tech'}</span>
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-slate-200">{isAr ? 'تقسيط 0% مع ValU' : 'ValU 0% Installment'}</span>
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-slate-200">{isAr ? 'موزعي 2B' : '2B Retailers'}</span>
                    </div>
                  </div>

                  {/* Figure */}
                  <div 
                    onClick={() => setCurrentPage('penguin-case-study')}
                    className="lg:col-span-5 flex justify-center cursor-pointer group"
                  >
                    <img
                      src="/assets/penguin/penguin_hero_figure.png"
                      alt="Penguin Appliances Lineup"
                      className="max-h-60 sm:max-h-72 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* The 4 audited KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/90 border border-sky-500/30 p-4 rounded-2xl relative overflow-hidden group hover:border-sky-400 transition-colors">
                    <div className="text-xs text-sky-400 font-bold mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نمو مبيعات التجزئة' : 'Retail Sales Growth'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      +310%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isAr ? 'طفرة في مبردات المياه والديب فريزر' : 'dispeners & freezers demand'}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group hover:border-sky-400 transition-colors">
                    <div className="text-xs text-sky-400 font-bold mb-1 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مشاهدات الحملات' : 'Campaign Impressions'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      3.6M+
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isAr ? 'وصول دقيق لجمهور التجهيز المنزلي' : 'targeted consumer reach'}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group hover:border-sky-400 transition-colors">
                    <div className="text-xs text-sky-400 font-bold mb-1 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" />
                      <span>{isAr ? 'عائد الإنفاق ROAS' : 'Return on Ad Spend'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      4.8X
                    </div>
                    <div className="text-[11px] text-sky-400 mt-1 font-semibold">
                      {isAr ? 'ربحية عالية خلال مواسم الذروة' : 'sustained peak efficiency'}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl relative overflow-hidden group hover:border-sky-400 transition-colors">
                    <div className="text-xs text-sky-400 font-bold mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استفسارات الشراء والموزعين' : 'Showroom Inquiries'}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      85,000+
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {isAr ? 'توجيه لمنافذ 2B والمعارض' : 'routed to 2B showrooms'}
                    </div>
                  </div>
                </div>

                {/* Creative Campaign Gallery Row */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>{isAr ? 'معرض بوستات الحملة الرسمية لبراند بينجوين:' : 'Audited Campaign Creatives & Retail Assets:'}</span>
                    <span className="text-[11px] text-sky-400">{isAr ? 'انقر على أي صورة للتكبير' : 'Click to inspect'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div 
                      onClick={() => setCurrentPage('penguin-case-study')}
                      className="cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/5] relative shadow-md"
                    >
                      <img 
                        src="/assets/penguin/penguin_top_1.jpg" 
                        alt="Penguin Back to School" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] font-bold text-white text-center p-1">
                        {isAr ? 'العودة للمدارس' : 'Back to School'}
                      </div>
                    </div>

                    <div 
                      onClick={() => setCurrentPage('penguin-case-study')}
                      className="cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/5] relative shadow-md"
                    >
                      <img 
                        src="/assets/penguin/penguin_top_2.jpg" 
                        alt="Penguin ValU Installments" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] font-bold text-white text-center p-1">
                        {isAr ? 'تقسيط ValU و 2B' : 'ValU & 2B'}
                      </div>
                    </div>

                    {[1, 2, 3, 4].map((num) => (
                      <div 
                        key={num}
                        onClick={() => setCurrentPage('penguin-case-study')}
                        className="cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/5] relative shadow-md"
                      >
                        <img 
                          src={`/assets/penguin/penguin_creative_${num}.jpg`} 
                          alt={`Penguin Creative ${num}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] font-bold text-white text-center p-1">
                          {isAr ? `بوست ${num}` : `Post ${num}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Other B2C Case Studies Grid */}
        <div className="pt-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 text-start">
            {isAr ? 'دراسات حالة إضافية في قطاع التجارة والتجزئة (B2C)' : 'Additional B2C & E-Commerce Case Studies'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {b2cCaseStudies
              .filter((study) => study.id !== 'cs-b2c-penguin')
              .map((study) => {
                const title = isAr ? study.title : study.titleEn;
                const client = isAr ? study.client : study.clientEn;
                const industry = isAr ? study.industry : study.industryEn;
                const solution = isAr ? study.solution : study.solutionEn;
                const mainMetric = study.metrics[0];
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
                const hasDedicatedPage = isBinaryracks || isGimoka || isLashin || isConcrete || isHamburg || isActon || isYoken || isSiltal || isPassap || isAlwaad;

                return (
                  <div
                    key={study.id}
                    onClick={() => {
                      if (isBinaryracks) {
                        setCurrentPage('binaryracks-case-study');
                      } else if (isGimoka) {
                        setCurrentPage('gimoka-case-study');
                      } else if (isLashin) {
                        setCurrentPage('lashin-case-study');
                      } else if (isConcrete) {
                        setCurrentPage('concrete-case-study');
                      } else if (isHamburg) {
                        setCurrentPage('hamburg-case-study');
                      } else if (isActon) {
                        setCurrentPage('acton-case-study');
                      } else if (isYoken) {
                        setCurrentPage('yoken-case-study');
                      } else if (isSiltal) {
                        setCurrentPage('siltal-case-study');
                      } else if (isPassap) {
                        setCurrentPage('passap-case-study');
                      } else if (isAlwaad) {
                        setCurrentPage('alwaad-case-study');
                      } else {
                        setSelectedCaseStudy(study);
                      }
                    }}
                    className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all p-6 sm:p-7 flex flex-col justify-between text-start cursor-pointer group overflow-hidden ${
                      isAlwaad
                        ? 'border-sky-300 ring-2 ring-sky-400/20 hover:border-sky-500'
                        : isPassap
                        ? 'border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-500'
                        : isSiltal
                        ? 'border-sky-300 ring-2 ring-sky-400/20 hover:border-sky-500'
                        : isYoken
                        ? 'border-sky-300 ring-2 ring-sky-400/20 hover:border-sky-500'
                        : isActon
                        ? 'border-sky-300 ring-2 ring-sky-400/20 hover:border-sky-500'
                        : isHamburg
                        ? 'border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-500'
                        : isConcrete
                        ? 'border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-500'
                        : isLashin
                        ? 'border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-500'
                        : isGimoka
                        ? 'border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-500'
                        : isBinaryracks 
                        ? 'border-sky-300 ring-2 ring-sky-400/20 hover:border-sky-500' 
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Meta & Logo Row */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2.5">
                          {study.logoUrl && (
                            <div className="h-8 w-16 sm:w-20 rounded-lg bg-white p-1 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                              <img src={study.logoUrl} alt={client} className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                          <span className="font-bold text-amber-600">{industry}</span>
                        </div>
                        <span>{isAr ? `المدة: ${study.duration}` : `Duration: ${study.durationEn}`}</span>
                      </div>

                      {/* Featured Creative Image if available */}
                      {study.image && (
                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-100 shadow-xs flex items-center justify-center">
                          <img 
                            src={study.image} 
                            alt={title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                          {study.gallery && study.gallery.length > 1 && (
                            <div className="absolute bottom-2 end-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                              {isAr ? `${study.gallery.length} تصاميم` : `${study.gallery.length} Creatives`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Metric Highlight Strip */}
                      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-100 flex items-center justify-between">
                        <div>
                          <div className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
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

                      {/* Title & Solution Text */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-600">{client}</div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {solution}
                        </p>
                      </div>

                      {/* Gallery thumbnail strip if available */}
                      {study.gallery && study.gallery.length > 2 && (
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {study.gallery.slice(0, 4).map((thumb, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                              <img src={thumb} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-amber-600">
                      <span>
                        {hasDedicatedPage 
                          ? (isAr ? 'عرض صفحة دراسة الحالة الكاملة ↗' : 'View Full Case Study Page ↗')
                          : t.common.viewDetails}
                      </span>
                      {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* B2C Call To Action Box */}
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
              className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer text-center"
            >
              {isAr ? 'حجز جلسة تدقيق المتجر' : 'Book E-Com Audit Call'}
            </button>
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent('مرحباً ديجيتال إفكت، أود استشارة حول حلول وباقات قطاع التجارة والمتاجر B2C')}`}
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
