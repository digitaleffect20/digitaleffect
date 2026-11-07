import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  ArrowLeft, 
  ArrowRight, 
  Share2,
  ExternalLink, 
  Eye, 
  TrendingUp, 
  Building2, 
  Users, 
  Factory, 
  MapPin, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Quote, 
  Maximize2,
  X,
  ShieldCheck,
  Briefcase,
  Layers,
  Compass,
  Cpu,
  Check
} from 'lucide-react';

import { getCaseStudyCreatives, getCaseStudyVideos } from '../utils/caseStudyMedia';
import { CaseStudyVideoSection } from '../components/CaseStudyVideoSection';

export const BsiziaCaseStudyPage: React.FC = () => {
  const { data, language, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2b-bsizia');
  const creatives = getCaseStudyCreatives('cs-b2b-bsizia', currentCaseStudy);
  const videos = getCaseStudyVideos(currentCaseStudy);

  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; title: string; desc?: string } | null>(null);
  const [shareToast, setShareToast] = useState(false);

  const pageTitle = isAr 
    ? 'دراسة حالة جمعية مستثمري بني سويف BSIZIA | ديجيتال إفكت' 
    : 'BSIZIA Industrial Investors Association Case Study | Digital Effect';

  const pageDescription = isAr
    ? 'بناء الهوية والمنظومة الرقمية لجمعية مستثمري مناطق بني سويف الصناعية BSIZIA لترويج الاستثمار الصناعي وتمثيل المصانع وجذب رؤوس الأموال مع ديجيتال إفكت.'
    : 'Digital ecosystem & corporate branding for BSIZIA Industrial Investors Association by Digital Effect: representing factories and scaling industrial investments.';

  const handleShare = async () => {
    const shareData = {
      title: pageTitle,
      text: pageDescription,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const auditedMetrics = [
    {
      label: isAr ? 'نمو التفاعل المؤسسي والصناعي' : 'Industrial & B2B Engagement',
      value: '+380%',
      growth: '3.8X Growth',
      hint: isAr ? 'تفاعل نوعي من أصحاب المصانع والمستثمرين' : 'high-intent interaction from plant owners',
      icon: <TrendingUp className="w-5 h-5 text-sky-400" />,
    },
    {
      label: isAr ? 'وصول الحملات لرجال الأعمال والمستثمرين' : 'Targeted Executive Reach',
      value: '1,800,000+',
      growth: 'B2B Authority',
      hint: isAr ? 'صناع قرار ومستثمرون في القطاع الصناعي في مصر والخليج' : 'targeted B2B decision-makers in Egypt & GCC',
      icon: <Eye className="w-5 h-5 text-sky-400" />,
    },
    {
      label: isAr ? 'المناطق والمراكز الصناعية الممثلة' : 'Industrial Zones Represented',
      value: '8 مناطق',
      growth: 'Full Coverage',
      hint: isAr ? 'الواسطى، ناصر، ببا، وادي غراب والمراكز الصناعية' : 'Bayad Al-Arab, Kom Abu Radi, Wadi Ghorab & more',
      icon: <MapPin className="w-5 h-5 text-sky-400" />,
    },
    {
      label: isAr ? 'زيادة طلبات الانضمام والاستفسارات' : 'Membership & Zone Inquiries',
      value: '+145%',
      growth: 'Direct Inbound',
      hint: isAr ? 'طلبات عضوية واستفسارات تخصيص أراضٍ ومرافق' : 'direct applications & land allocation queries',
      icon: <Building2 className="w-5 h-5 text-sky-400" />,
    },
  ];

  const zoneHighlights = [
    {
      name: isAr ? 'منطقة بياض العرب الصناعية' : 'Bayad Al-Arab Industrial Area',
      desc: isAr ? 'من أقدم وأعرق المناطق الصناعية في بني سويف بمساحة شاسعة تحتضن صناعات النسيج والكيماويات ومواد البناء.' : 'One of the largest established industrial parks hosting textiles, chemicals, and building materials.',
    },
    {
      name: isAr ? 'منطقة كوم أبو راضي الصناعية' : 'Kom Abu Radi Industrial Zone',
      desc: isAr ? 'القطب الصناعي العملاق لتصنيع الإلكترونيات والأجهزة المنزلية والصناعات الهندسية الثقيلة.' : 'Flagship mega-cluster hosting international consumer electronics and heavy fabrication plants.',
    },
    {
      name: isAr ? 'منطقة جبل وادي غراب الصناعية' : 'Wadi Ghorab Industrial District',
      desc: isAr ? 'المنطقة الواعدة للصناعات التعدينية، المحاجر، ومواد التشييد بالقرب من الطرق الإقليمية السريعة.' : 'High-growth corridor for mining, quarrying, and advanced construction materials.',
    },
    {
      name: isAr ? 'المراكز الصناعية بالمحافظة' : 'Regional Production Centers',
      desc: isAr ? 'مناطق مهيأة ومجهزة بالمرافق في الواسطى، ناصر، إهناسيا، ببا، سمسطا، والفشن لخدمة التكتلات الإنتاجية.' : 'Fully serviced industrial nodes across Al-Wasta, Nasser, Biba, Samasta, and Al-Fashn.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Dynamic OpenGraph, Twitter Cards & Structured Data */}
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/portfolio_crops/card_bsizia.png"
        imageAlt={isAr ? 'دراسة حالة جمعية مستثمري مناطق بني سويف الصناعية BSIZIA - ديجيتال إفكت' : 'BSIZIA Industrial Zones Association Case Study - Digital Effect'}
        urlPath="#bsizia-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع الشركات والمؤسسات الصناعية (B2B Enterprise)' : 'Industrial B2B Enterprise & Manufacturing'}
        tags={['جمعية مستثمري بني سويف', 'BSIZIA', 'تسويق B2B', 'استثمار صناعي', 'مصانع مصر', 'الهوية المؤسسية', 'ديجيتال إفكت', 'Digital Effect Industrial']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: pageTitle,
          description: pageDescription,
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_bsizia.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_bsizia.png',
          datePublished: '2024-03-01T08:00:00Z',
          inLanguage: isAr ? 'ar' : 'en',
          author: {
            '@type': 'Organization',
            name: 'Digital Effect',
            alternateName: 'ديجيتال إفكت للحلول الرقمية والتسويق',
            url: 'https://digitaleffect.net'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Digital Effect',
            url: 'https://digitaleffect.net'
          },
          about: {
            '@type': 'Organization',
            name: 'BSIZIA Industrial Zones Association',
            alternateName: 'جمعية مستثمري مناطق بني سويف الصناعية',
            areaServed: 'Beni Suef Industrial Zones'
          }
        }}
      />

      {/* Top Breadcrumb Navigation */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button 
              onClick={() => setCurrentPage('home')}
              className="hover:text-sky-400 transition-colors"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <button 
              onClick={() => setCurrentPage('b2b')}
              className="hover:text-sky-400 transition-colors"
            >
              {isAr ? 'قطاع B2B' : 'B2B Sector'}
            </button>
            <span>/</span>
            <span className="text-sky-400 font-semibold truncate max-w-[200px] sm:max-w-none">
              {isAr ? 'جمعية مستثمري بني سويف الصناعية (BSIZIA)' : 'Beni Suef Industrial Zones (BSIZIA)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Social Share Button with Toast */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title={isAr ? 'مشاركة رابط دراسة الحالة عبر السوشيال ميديا' : 'Share case study link'}
            >
              {shareToast ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
              <span>{shareToast ? (isAr ? 'تم نسخ الرابط!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share')}</span>
            </button>

            <button
              onClick={() => setCurrentPage('b2b')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              {isAr ? 'العودة لقطاع B2B' : 'Back to B2B'}
            </button>

            <a
              href="https://digitaleffect.net/bsizia/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {isAr ? 'الرابط الأصلي للدراسة' : 'Original Case Study'}
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section with Cinematic Industrial Background */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pb-28 border-b border-slate-800/80 bg-slate-950">
        {/* Cinematic Industrial Complex Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/bsizia/bsizia_hero_bg.jpg" 
            alt="Beni Suef Industrial Zones Complex" 
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          {/* Heavy Gradient Overlays for Maximum Contrast & Negative Space behind Text */}
          <div className="absolute inset-0 bg-slate-950/75 mix-blend-multiply"></div>
          {/* Directional gradient: Deep dark slate on the text side (right in RTL, left in LTR) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-950/85 to-slate-950 rtl:from-slate-950/30 rtl:via-slate-950/90 rtl:to-slate-950"></div>
          {/* Top and Bottom Fades */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl lg:max-w-4xl space-y-7 text-start">
            {/* Category Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-md shadow-lg">
                <Factory className="w-3.5 h-3.5 text-sky-400" />
                {isAr ? 'دراسة حالة B2B صناعية متقدمة' : 'Industrial B2B Flagship Case Study'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'نتائج موثقة رسمياً' : 'Audited Growth Record'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
                <MapPin className="w-3 h-3 text-sky-400" />
                {isAr ? 'محافظة بني سويف — مصر' : 'Beni Suef Governorate — Egypt'}
              </span>
            </div>

            {/* Client Logo & Identity Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-5 inline-flex max-w-full">
              <div className="p-3 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 max-w-[280px]">
                <img 
                  src="/assets/bsizia/bsizia_img_1.png" 
                  alt={isAr ? 'شعار جمعية مستثمري مناطق بني سويف الصناعية' : 'Beni Suef Industrial Zones (BSIZIA) Logo'} 
                  className="h-10 sm:h-12 w-auto max-w-full object-contain"
                />
              </div>
              <div className="text-center sm:text-start">
                <div className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                  {isAr ? 'العميل الصناعي' : 'Industrial Client'}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {isAr ? 'جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)' : 'Beni Suef Industrial Zones Investors Association'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isAr ? 'الكيان الممثل للمصانع والترويج الاستثماري بالمحافظة | شراكة استراتيجية' : 'Official Industrial Representative & Regional Investment Promotion Hub'}
                </p>
              </div>
            </div>

            {/* Title & Headline */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.18] tracking-tight drop-shadow-md">
                {isAr 
                  ? 'بناء الهوية والمنظومة الرقمية للترويج الصناعي وجذب الاستثمار'
                  : 'Institutional Digital Authority & Industrial Investment Promotion Ecosystem'}
              </h1>
              <p className="text-base sm:text-xl text-slate-200/90 leading-relaxed font-light max-w-3xl drop-shadow-sm">
                {isAr 
                  ? 'كيف طوّرت ديجيتال إفكت منصة رقمية رصينة وهوية بصرية موحدة لجمعية مستثمري بني سويف؛ تمكّن المصانع القائمة، توحد صوت المستثمرين، وتروّج للمناطق الصناعية لجذب كبرى رؤوس الأموال المحلية والدولية.'
                  : 'How Digital Effect engineered an authoritative B2B digital footprint and visual identity for BSIZIA, empowering existing manufacturers, unifying investor representation, and promoting prime industrial zones to regional conglomerates.'}
              </p>
            </div>

            {/* Quick Services Pill Grid */}
            <div className="pt-1">
              <div className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Executed:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {(isAr ? [
                  'إدارة التواجد الرقمي المؤسسي B2B',
                  'تصميم الهوية والحملات الترويجية للمناطق الصناعية',
                  'صناعة المحتوى الترويجي والخرائط التفاعلية',
                  'إعلانات الاستهداف الدقيق لرجال الأعمال (Meta Ads)',
                  'تغطية الفعاليات ومبادرات دعم المستثمرين والمصانع'
                ] : [
                  'B2B Social Media & Presence',
                  'Industrial Visual Identity & Campaigns',
                  'Zoning Content & Investment Maps',
                  'Targeted Executive Advertising (Meta Ads)',
                  'Investor Advocacy & Operational Support'
                ]).map((srv, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 text-slate-200 font-medium shadow-xs"
                  >
                    ✓ {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Live KPI Chips right inside the banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { val: '+380%', label: isAr ? 'نمو التفاعل الصناعي' : 'B2B Engagement' },
                { val: '1.8M+', label: isAr ? 'وصول الحملات للمستثمرين' : 'Executive Reach' },
                { val: '8 مناطق', label: isAr ? 'مناطق صناعية مشمولة' : 'Industrial Zones' },
                { val: '+145%', label: isAr ? 'طلبات الاستثمار والعضوية' : 'Inward Enquiries' },
              ].map((kpi, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70">
                  <div className="text-xl sm:text-2xl font-black text-sky-400 tabular-nums">
                    {kpi.val}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {isAr ? 'احجز استشارة B2B لمؤسستك أو مصنعك' : 'Book a B2B Consultation for Your Enterprise'}
              </button>

              <button
                onClick={() => setCurrentPage('b2b')}
                className="px-5 py-3.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 backdrop-blur-sm transition-all cursor-pointer"
              >
                {isAr ? 'استعراض باقات قطاع B2B' : 'View B2B Retainer Packages'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Size Creatives Gallery (Main Showcase - Moved immediately after Hero) */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Campaign Videos Showcase if available */}
          {videos && videos.length > 0 && (
            <CaseStudyVideoSection
              videos={videos}
              isAr={isAr}
              clientName={isAr ? 'جمعية مستثمري بني سويف BSIZIA' : 'BSIZIA Industrial Investors Association'}
            />
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'معرض الأعمال والحملات الإعلانية' : 'Creative Campaign Portfolio'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {isAr ? 'تصاميم الحملات بالحجم الكامل والوضوح الفائق' : 'Full-Resolution Creative Campaign Showcase'}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-light">
                {isAr 
                  ? 'استعرض كافة تصاميم الحملة المعتمدة بجودتها الأصلية بدون اقتصاص أو ضغط، مع تفاصيل الخطاب التسويقي لكل محور.'
                  : 'Explore all certified campaign visuals in uncompressed high resolution, showcasing the precise messaging hierarchy for each industrial pillar.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'اضغط على أي تصميم لتكبيره واستعراضه بجودة كاملة' : 'Click any visual to enlarge and inspect in full detail'}</span>
            </div>
          </div>

          {/* Grid of Creatives (2 columns on tablet, 3 on desktop for optimal large visual display) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creatives.map((creative, idx) => (
              <div 
                key={idx}
                className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all duration-300 shadow-xl group flex flex-col"
              >
                {/* Visual Image Container - Generous size so user can inspect clearly */}
                <div 
                  className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => setActiveLightboxImg({ url: creative.url, title: creative.title, desc: creative.desc })}
                >
                  <img 
                    src={creative.url} 
                    alt={creative.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity"></div>

                  {/* Category Pill on Image */}
                  <div className="absolute top-4 start-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-sky-400 border border-slate-700/80 backdrop-blur-md shadow-lg">
                      {creative.tag}
                    </span>
                  </div>

                  {/* Expand Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-4 h-4" />
                      {isAr ? 'تكبير بالحجم الكامل' : 'View Full Size'}
                    </span>
                  </div>
                </div>

                {/* Content Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {creative.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed font-light">
                      {creative.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-slate-400">#0{idx + 1} / BSIZIA B2B</span>
                    <button 
                      onClick={() => setActiveLightboxImg({ url: creative.url, title: creative.title, desc: creative.desc })}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      {isAr ? 'تفاصيل التصميم' : 'Enlarge'}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audited Metrics Ribbon */}
      <section className="py-12 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isAr ? 'أرقام ونتائج معتمدة في قيادة الترويج الصناعي' : 'Verified Growth Metrics & Industrial Outreach'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isAr ? 'مؤشرات الأداء المحققة للحملات الرقمية والتواصل المؤسسي لقطاع B2B' : 'Key Performance Indicators achieved across institutional B2B communication'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {auditedMetrics.map((metric, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 transition-all shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                    {metric.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                    {metric.growth}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {metric.label}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-light">
                  {metric.hint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge vs Solution Blueprint */}
      <section className="py-16 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* The Challenge */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900 border border-rose-900/30 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold text-lg border border-rose-500/30">
                  !
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    {isAr ? 'التحدي المؤسسي والصناعي' : 'The Strategic Challenge'}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isAr ? 'عزلة جغرافية وضعف استقطاب المستثمرين الجدد' : 'Regional Isolation & Traditional Advocacy'}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-light">
                <p>
                  {isAr 
                    ? 'على الرغم من امتلاك محافظة بني سويف لمناطق صناعية كبرى وبنية تحتية متطورة (شبكة طرق سريعة، محاور نيلية، وقرب من ميناء السخنة والقاهرة)، إلا أن التواصل التسويقي كان يعتمد على المراسلات التقليدية والمؤتمرات المغلقة، دون وجود حضور رقمي احترافي يجذب المستثمرين الجدد من خارج المحافظة ومن منطقة الخليج.'
                    : 'Despite Beni Suef hosting prime industrial clusters with advanced highway networks and access to export ports, marketing outreach was hindered by legacy offline correspondence and internal seminars, lacking high-authority digital touchpoints to attract domestic and international capital.'}
                </p>
                <div className="space-y-2 pt-2">
                  {[
                    isAr ? 'غياب منصة رقمية تفاعلية تعرض المزايا اللوجستية والتنافسية للمناطق الصناعية.' : 'Lack of an authoritative interactive platform detailing territorial logistics.',
                    isAr ? 'حاجة المصانع القائمة لصوت تمثيلي موحد يبرز ثقل التكتل أمام صناع القرار.' : 'Need for unified corporate advocacy representing factories before regulators.',
                    isAr ? 'صعوبة وصول المستثمر الراغب في التوسع إلى بيانات المرافق والأراضي الصناعية المتاحة.' : 'High friction for expanding investors seeking parcel availability and infrastructure readiness.',
                    isAr ? 'نمطية الخطاب التسويقي القديم وعدم مواكبته لمتطلبات قيادات الأعمال والشركات الدولية.' : 'Traditional marketing language failing to resonate with modern enterprise executives.'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <span className="text-rose-400 font-bold shrink-0">✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-900 border border-sky-500/30 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    {isAr ? 'الحل الاستراتيجي لديجيتال إفكت' : 'Digital Effect Strategic Solution'}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isAr ? 'منظومة تسويق استثماري متكاملة وهوية رصينة' : 'Holistic Investment Ecosystem & Brand Overhaul'}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-light">
                <p>
                  {isAr 
                    ? 'قامت ديجيتال إفكت بهندسة استراتيجية ترويجية B2B مزدوجة المسار: المسار الأول يركز على «قوة العضوية» وتمكين المصانع الأعضاء عبر إبراز الحلول العملية والتمثيل الموحد، والمسار الثاني يركز على «جذب الاستثمار» عبر استعراض الخريطة الصناعية الشاملة، وقرب سلاسل الإمداد، وتوجيه إعلانات دقيقة لمديري الشركات والمستثمرين.'
                    : 'Digital Effect deployed a dual-track B2B marketing engine: Track 1 centered on "Membership Leverage", articulating regulatory solutions and factory solidarity; Track 2 focused on "Capital Inflow", packaging the regional investment map and executing hyper-targeted executive Meta campaigns.'}
                </p>
                <div className="space-y-2 pt-2">
                  {[
                    isAr ? 'تصميم هوية بصرية صناعية فخمة تعكس القوة، التكنولوجيا، وحجم الاستثمارات القائمة.' : 'Designed premium industrial visual identity embodying engineering authority.',
                    isAr ? 'صياغة شعارات وحملات رنانة: «العضوية قوة»، «كيان متكامل لنمو يدوم»، «كل نجاح صناعي خلفه قرار صح».' : 'Crafted resonating campaign themes driving B2B urgency and stakeholder pride.',
                    isAr ? 'تطوير خريطة استثمارية رقمية للمناطق الصناعية (الواسطى، ناصر، ببا، وادي غراب).' : 'Engineered comprehensive logistical and industrial zoning visual assets.',
                    isAr ? 'استهداف دقيق لرواد الأعمال، مديري المشتريات، والمستثمرين الصناعيين في مصر والخليج.' : 'Hyper-targeted advertising to corporate executives, procurement leads, and industrial investors.'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Zones Breakdown */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              {isAr ? 'تغطية جغرافية وصناعية شاملة' : 'Territorial & Production Clusters'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">
              {isAr ? 'المناطق الصناعية المشمولة في الحملات الترويجية' : 'Key Industrial Zones Showcased in the Campaigns'}
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              {isAr 
                ? 'إبراز المزايا التنافسية لكل منطقة صناعية لتسهيل اختيار موقع المشروع المناسب لكل قطاع'
                : 'Highlighting strategic logistical advantages across each manufacturing zone to guide capital allocation'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {zoneHighlights.map((zone, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 font-bold">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {zone.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {zone.desc}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-900 flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isAr ? 'جاهزية كاملة للمرافق' : 'Fully Serviced Infrastructure'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Client Testimonial Quote */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Quote className="w-16 h-16 text-sky-500/20 mx-auto mb-4" />
          <blockquote className="text-lg sm:text-2xl font-medium text-slate-200 leading-relaxed font-serif">
            {isAr 
              ? '«شراكتنا مع ديجيتال إفكت أعطت صوتاً رقمياً قوياً لمناطق بني سويف الصناعية؛ استطاعوا بلورة رسالتنا ودور الجمعية في دعم المصانع وجذب الاستثمارات بأسلوب بصري واحترافي راقٍ يليق بالصناعة الوطنية.»'
              : '"Our partnership with Digital Effect gave Beni Suef Industrial Zones an authoritative digital presence. They articulated our mission to empower manufacturers and attract regional investment with unmatched visual quality."'}
          </blockquote>

          <div className="mt-6 flex flex-col items-center">
            <div className="font-bold text-white text-base sm:text-lg">
              {isAr ? 'مجلس إدارة جمعية مستثمري بني سويف الصناعية' : 'Board of Directors — BSIZIA'}
            </div>
            <div className="text-xs sm:text-sm text-sky-400 mt-1">
              {isAr ? 'جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)' : 'Beni Suef Industrial Zones Investors Association'}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA & Navigation to B2B Sector */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-blue-950/60 border border-sky-500/30 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto relative z-10 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Briefcase className="w-3.5 h-3.5" />
                {isAr ? 'شريك التسويق لقطاع الصناعة والأعمال' : 'Your B2B & Industrial Marketing Partner'}
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {isAr 
                  ? 'هل تريد بناء منظومة تسويق B2B تجذب كبار العملاء والمستثمرين لمصنعك؟'
                  : 'Ready to Build a High-Caliber B2B Marketing Engine for Your Enterprise?'}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-light">
                {isAr 
                  ? 'اكتشف باقات ديجيتال إفكت المخصصة لقطاع الشركات والمصانع (B2B)، أو احجز استشارة تسويقية مباشرة مع خبرائنا.'
                  : 'Explore Digital Effect customized retainers for industrial and enterprise firms, or schedule an executive consultation today.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setIsConsultationOpen(true)}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAr ? 'طلب استشارة تسويق B2B فورية' : 'Request Instant B2B Consultation'}
                </button>

                <button
                  onClick={() => setCurrentPage('b2b')}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  {isAr ? 'استعراض باقات قطاع B2B' : 'View B2B Retainers'}
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full Resolution Viewing */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="truncate pr-4">
                <div className="text-xs text-sky-400 font-semibold">
                  {isAr ? 'عرض التصميم بالحجم الكامل' : 'Full Resolution Preview'}
                </div>
                <div className="text-sm sm:text-base font-bold text-white truncate">
                  {activeLightboxImg.title}
                </div>
              </div>
              <button 
                onClick={() => setActiveLightboxImg(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 w-full overflow-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/50 max-h-[72vh]">
              <img 
                src={activeLightboxImg.url} 
                alt={activeLightboxImg.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            {activeLightboxImg.desc && (
              <div className="w-full px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 text-center font-light">
                {activeLightboxImg.desc}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
