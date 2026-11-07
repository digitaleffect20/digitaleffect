import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Zap, 
  Maximize2, 
  X, 
  TrendingUp, 
  Users, 
  Layers, 
  ShieldCheck, 
  Share2, 
  Eye, 
  Quote, 
  Home, 
  MapPin, 
  KeyRound,
  Star,
  Check
} from 'lucide-react';

interface CreativeItem {
  url: string;
  title: string;
  titleEn: string;
  tag: string;
  desc: string;
  descEn: string;
}

import { getCaseStudyCreatives, getCaseStudyVideos } from '../utils/caseStudyMedia';
import { CaseStudyVideoSection } from '../components/CaseStudyVideoSection';

export const LashinCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-memar-lashin');
  const creatives = getCaseStudyCreatives('cs-b2c-memar-lashin', currentCaseStudy);
  const videos = getCaseStudyVideos(currentCaseStudy);

  const [activeLightboxImg, setActiveLightboxImg] = useState<{
    url: string;
    title: string;
    desc?: string;
  } | null>(null);

  const [shareToast, setShareToast] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const auditedMetrics = [
    {
      value: '140M+',
      label: isAr ? 'إجمالي مبيعات الوحدات السكنية المحققة (جنيه)' : 'Generated Property Sales (EGP)',
      hint: isAr ? 'حجوزات وتعاقدات بيعية موثقة في مشروعات سكنية متعددة' : 'Confirmed contracts across flagship residential developments',
      growth: '140M+ EGP',
      icon: <Home className="w-6 h-6 text-amber-400" />
    },
    {
      value: '2,450+',
      label: isAr ? 'مشترٍ محتمل مؤهل للشراء الفوري' : 'Pre-Qualified Inbound Buyers',
      hint: isAr ? 'بيانات حقيقية خضعت للتأهيل مع موعد معاينة مؤكد' : 'High-intent leads vetted with scheduled site visits',
      growth: '2,450+',
      icon: <Users className="w-6 h-6 text-sky-400" />
    },
    {
      value: '6.8X',
      label: isAr ? 'عائد الاستثمار الإعلاني العقاري (ROI)' : 'Real Estate Campaign ROI',
      hint: isAr ? 'مقارنة بحجم الميزانية الإعلانية المنفقة وتكلفة الاستحواذ' : 'Revenue generated relative to total media buying ad spend',
      growth: '6.8X',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '-38%',
      label: isAr ? 'انخفاض تكلفة ليد المشتري الجاد' : 'Reduction in Cost Per Qualified Lead',
      hint: isAr ? 'بفضل استهداف المهنيين وكبار المستثمرين والمغتربين' : 'Optimized ad funnels filtering out casual non-buying inquiries',
      growth: '-38%',
      icon: <Zap className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'إعلانات الاستهداف الطبقي والجغرافي الدقيق' : 'High-Net-Worth & Expatriate Targeting',
      desc: isAr ? 'استهداف رقمي دقيق عبر Meta و Google Search لكبار المهنيين، رواد الأعمال، والمصريين بالخارج الباحثين عن تملك آمن.' : 'Pinpoint targeting across Meta and Google Search reaching affluent families and overseas executives seeking safe real estate equity.',
      icon: <MapPin className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'صياغة العروض وتفكيك تردد القرار الشرائي' : 'Frictionless Installment Value Proposition',
      desc: isAr ? 'تصميم عروض دفع مرنة بمقدمات مدروسة وأقساط ممتدة لتسهيل المقارنة وسرعة اتخاذ قرار حجز الوحدة السكنية.' : 'Engineering transparent installment models and down-payment flexibility that demystify purchasing and accelerate booking commitments.',
      icon: <KeyRound className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'تأهيل المشترين وربط مسار المبيعات الفوري' : 'Instant Lead Qualification & CRM Routing',
      desc: isAr ? 'فلترة الاستفسارات عبر مسارات محادثة سريعة لفرز العملاء الجاهزين للمعاينة وتحويلهم مباشرة لمستشاري المبيعات.' : 'Deploying conversational pre-qualification funnels ensuring only vetted buyers with scheduled site tours reach the sales team.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'إبراز القيمة المعمارية وجودة التشطيبات' : 'Architectural Showcases & Prime Location Assets',
      desc: isAr ? 'محتوى مرئي يبرز المخططات المعمارية الذكية، جودة مواد البناء، ومزايا القرب من المرافق الحيوية في التجمع والشروق.' : 'Visual storytelling communicating architectural superiority, premium materials, and proximity to major commercial hubs.',
      icon: <Building2 className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة معمار لاشين للتطوير العقاري (Memar Lashin) — مبيعات سكنية بأكثر من ١٤٠ مليون جنيه | ديجيتال إفكت' : 'Memar Lashin Real Estate Development Case Study | Digital Effect'}
        description={isAr ? 'كيف طوّرت ديجيتال إفكت الحملات الرقمية ومسارات الاستهداف العقاري لشركة معمار لاشين لتحقيق مبيعات وحدات سكنية تجاوزت 140 مليون جنيه بعائد استثماري 6.8X.' : 'How Digital Effect drove over 140M EGP in residential bookings with 6.8X ROI for Memar Lashin Developments.'}
        image="/assets/portfolio_crops/card_memar_lashin.png"
        imageAlt={isAr ? 'دراسة حالة معمار لاشين للتطوير العقاري - ديجيتال إفكت' : 'Memar Lashin Real Estate Development Case Study - Digital Effect'}
        urlPath="#lashin-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'التطوير والاستثمار العقاري السكني الفاخر (B2C Real Estate)' : 'Luxury Residential Real Estate & Property Development'}
        tags={['معمار لاشين', 'Memar Lashin', 'تسويق عقاري', 'عقارات التجمع', 'عقارات الشروق', 'حملات عقارية', 'ديجيتال إفكت', 'Digital Effect Real Estate']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Memar Lashin Real Estate Sales Scale Case Study — Digital Effect',
          description: 'Generating over 140M EGP in residential unit sales through precision buyer targeting and high-converting real estate acquisition funnels.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_memar_lashin.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_memar_lashin.png',
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
            logo: {
              '@type': 'ImageObject',
              url: 'https://digitaleffect.net/logo.png'
            }
          },
          about: {
            '@type': 'Organization',
            name: 'Memar Lashin Real Estate Development',
            areaServed: 'Egypt & New Cairo'
          }
        }}
      />

      {/* Top Breadcrumb Navigation */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button 
              onClick={() => setCurrentPage('home')}
              className="hover:text-amber-400 transition-colors"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <button 
              onClick={() => setCurrentPage('case-studies')}
              className="hover:text-amber-400 transition-colors"
            >
              {isAr ? 'سابقة الأعمال' : 'Case Studies'}
            </button>
            <span>/</span>
            <span className="text-amber-400 font-semibold truncate max-w-[200px] sm:max-w-none">
              {isAr ? 'معمار لاشين للتطوير العقاري (Memar Lashin)' : 'Memar Lashin Real Estate'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Social Share Button with Toast */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors relative"
              title={isAr ? 'مشاركة رابط دراسة الحالة' : 'Share Case Study Link'}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'مشاركة' : 'Share'}</span>
              {shareToast && (
                <span className="absolute -bottom-8 end-0 bg-amber-400 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  {isAr ? 'تم نسخ الرابط!' : 'Link copied!'}
                </span>
              )}
            </button>

            <a
              href="https://digitaleffect.net/memar-lashin/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'رابط الموقع الأصلي' : 'Live Client Link'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Hero Header with Cinematic Architectural Real Estate Background */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pb-28 border-b border-slate-800 bg-slate-950">
        {/* Cinematic Architectural Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/memar-lashin/memar_lashin_hero_bg.jpg" 
            alt="Memar Lashin Luxury Residential Architectural Background" 
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
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-7 text-start">
          {/* Client Logos & Tags Row */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-44 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl border border-white/20">
                <img
                  src="/assets/memar-lashin/memar-lashin_img_1.png"
                  alt="Memar Lashin Real Estate Development Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'شريك ديجيتال إفكت في التسويق والاستثمار العقاري السكني' : 'Premier Real Estate Marketing Partner'}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {isAr ? 'مشروعات سكنية راقية · التجمع الخامس · الشروق · مدينة نصر' : 'Luxury Residential Developments · New Cairo · Shorouk'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://digitaleffect.net/memar-lashin/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors backdrop-blur-sm"
              >
                <span>{isAr ? 'رابط صفحة العميل الأصلية ↗' : 'Official Case Study Link ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/25 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>{isAr ? 'طلب خطة تسويق لمشروع عقاري' : 'Request Real Estate Marketing Plan'}</span>
              </button>
            </div>
          </div>

          {/* Headline and Narrative */}
          <div className="space-y-4 max-w-4xl text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{isAr ? 'دراسة حالة تسويق عقاري B2C محققة بالأرقام' : 'Audited Real Estate B2C Property Acquisition Case Study'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {isAr ? (
                <>
                  مسارات استهداف ذكية حققت مبيعات سكنية بأكثر من <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">١٤٠ مليون جنيه</span>
                </>
              ) : (
                'High-Intent Real Estate Funnels Delivering Over 140M EGP in Residential Bookings'
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl font-light">
              {isAr
                ? 'كيف طوّرت ديجيتال إفكت منظومة تسويق عقاري متقدمة لشركة معمار لاشين للتطوير العقاري؛ جمعت بين التصاميم المعمارية الفاخرة، إعلانات الاستهداف الجغرافي والطبقي لكبار المهنيين والمغتربين، وتأهيل الاتصالات الفوري لخفض تكلفة ليد المشتري الجاد وتحقيق عائد استثماري بلغ 6.8X.'
                : 'How Digital Effect architected a high-converting real estate performance acquisition engine for Memar Lashin Developments, combining prestige architectural design assets, geo-targeted expat funnels, and CRM qualification to generate over 140M EGP in confirmed residential sales.'}
            </p>

            {/* Services Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                isAr ? 'تصميم وإدارة الحملات الإعلانية للمشروعات السكنية' : 'Residential Project Campaign Management',
                isAr ? 'إعلانات الاستهداف الطبقي والجغرافي (Meta & Google Search)' : 'High-Net-Worth & Expat Geo-Targeting',
                isAr ? 'صياغة عروض السداد وتسهيلات التعاقد المرنة' : 'Installment Value Proposition Messaging',
                isAr ? 'تأهيل المشترين وربط مسار المبيعات الفوري (CRM)' : 'Inbound Lead Qualification & CRM Flow',
                isAr ? 'إنتاج الكتالوجات والمواد البصرية ثلاثية الأبعاد' : 'Visual Showcases & 3D Collateral'
              ].map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 text-amber-200/90 border border-slate-700 backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  {srv}
                </span>
              ))}
            </div>
          </div>

          {/* Quick KPI Highlights inside Hero Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-4xl">
            {auditedMetrics.map((kpi, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70">
                <div className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              {isAr ? 'احجز استشارة لتسويق مشروعاتك العقارية' : 'Book a Real Estate Growth Consultation'}
            </button>

            <button
              onClick={() => setCurrentPage('case-studies')}
              className="px-5 py-3.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 backdrop-blur-sm transition-all cursor-pointer"
            >
              {isAr ? 'استعراض كافة دراسات الحالة' : 'Explore All Case Studies'}
            </button>
          </div>
        </div>
      </section>

      {/* Full-Size Creatives Gallery (Main Showcase - Directly after Hero) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        {/* Campaign Videos Showcase if available */}
        {videos && videos.length > 0 && (
          <CaseStudyVideoSection
            videos={videos}
            isAr={isAr}
            clientName={isAr ? 'معمار لاشين للتطوير العقاري' : 'Memar Lashin Real Estate'}
          />
        )}

        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'معرض المنشورات بالحجم الواضح الكامل' : 'Full-Resolution Creative Showcase'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'تصاميم الحملات العقارية بالحجم الكامل والوضوح الفائق' : 'Selected Real Estate Campaign Visuals & Creative Assets'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'نماذج من التصاميم الإعلانية المعتمدة لحملات معمار لاشين بدقتها الكاملة (1080x1350)؛ تبرز جمالية المشروعات السكنية وتفاصيل أنظمة السداد. انقر على أي تصميم لتكبيره.'
              : 'Full resolution creative assets showcasing architectural luxury, flexible payment structures, and high-converting copy. Click any visual to inspect.'}
          </p>
        </div>

        {/* 2-Column Spacious Grid for Maximum Clarity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {creatives.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all shadow-xl flex flex-col justify-between group"
            >
              {/* Image Container with high clarity */}
              <div 
                className="relative bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => setActiveLightboxImg({ url: item.url, title: item.title, desc: item.desc })}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 max-h-[720px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-4 py-2 bg-slate-900/90 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'تكبير التصميم' : 'Enlarge Image'}</span>
                  </div>
                </div>
              </div>

              {/* Text Info Below Image */}
              <div className="p-6 text-start space-y-3 bg-slate-900/95 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
                    {item.tag}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {isAr ? `تصميم #${idx + 1}` : `Creative #${idx + 1}`}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setActiveLightboxImg({ url: item.url, title: item.title, desc: item.desc })}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معاينة بحجم الشاشة الكامل' : 'Full Screen Preview'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="text-slate-500 hover:text-slate-300 p-1.5 transition-colors"
                    title={isAr ? 'مشاركة' : 'Share'}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Audited Key Results Grid */}
      <section className="bg-slate-900/60 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAr ? 'أرقام الإنجاز والنتائج المعتمدة' : 'Audited Growth Performance'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isAr ? 'مبيعات حقيقية بالأرقام وتعاقدات عقارية قياسية' : 'Audited Sales Velocity & Record Contract Bookings'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'نتائج رقمية وتجارية موثقة خلال ٨ أشهر من إدارة الحملات العقارية للمشروعات السكنية في القاهرة الجديدة والشروق.'
                : 'Audited campaign and sales performance data during 8 months of precision real estate acquisition funnels.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auditedMetrics.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all text-start space-y-4 shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {item.growth}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-sm font-bold text-amber-400">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed pt-1">
                    {item.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Blueprint: Challenge vs Digital Effect Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-start space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'المنهجية الاستراتيجية' : 'Strategic Blueprint'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'تحدي السوق العقاري.. والحل المبتكر من ديجيتال إفكت' : 'Market Challenge & Digital Effect Strategic Solution'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'كيف واجهنا بطء قرار الشراء العقاري وارتفاع تكلفة الليد لتقديم مشترين جاهزين ومؤهلين مالياً.'
              : 'How we solved prolonged buying cycles and rising lead costs to deliver finance-ready homebuyers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge Box */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-red-500/20 text-start space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                !
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isAr ? 'التحدي التسويقي العقاري' : 'The Real Estate Challenge'}
                </h3>
                <p className="text-xs text-red-400/90 font-medium">
                  {isAr ? 'طول دورة اتخاذ القرار الشرائي وتزاحم المشروعات المنافسة' : 'Extended buying consideration cycles amidst heavy market saturation'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {isAr
                  ? 'طول دورة اتخاذ قرار الشراء العقاري، وارتفاع تكلفة ليد المشتري الجاد في ظل تقلبات السوق وتزاحم المشروعات في التجمع ومدينة نصر والشروق، مما هدر جزءاً من ميزانيات الحملات التقليدية في استفسارات غير جادة.'
                  : 'High lead acquisition cost and extended consideration cycles in premium residential real estate amidst saturated competition across New Cairo, Shorouk, and Nasr City.'}
              </p>
              <ul className="space-y-2 pt-2 text-slate-400 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{isAr ? 'تزاحم مئات الإعلانات العقارية المتشابهة دون ميزة تفضيلية واضحة' : 'Crowded real estate advertising clutter lacking tangible differentiation'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{isAr ? 'إهدار وقت فريق المبيعات في اتصالات غير مؤهلة مالياً للشراء' : 'Sales agents wasting hours on unvetted, budget-mismatched leads'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{isAr ? 'صعوبة الوصول إلى المشترين المغتربين والمهنيين ذوي القدرة الشرائية العالية' : 'Difficulty engaging high-net-worth expat buyers without local presence'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Solution Box */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-emerald-500/30 text-start space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isAr ? 'حل ديجيتال إفكت' : 'Digital Effect Strategic Solution'}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {isAr ? 'استهداف طبقي ذكي + تأهيل مسبق وتفكيك تردد السداد' : 'Precision affluent targeting + automated lead qualification'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {isAr
                  ? 'تطوير خطة تسويقية تركز على تميز المواقع، جودة التشطيب، وأنظمة السداد المرنة، مع إطلاق إعلانات دقيقة تستهدف كبار المهنيين والمصريين بالخارج، وتأهيل الاتصالات قبل تحويلها لفريق المبيعات.'
                  : 'Produced 3D architectural showcases, highlighted prime locations and flexible installments, and ran precision targeting aimed at affluent buyers and expatriates with instant CRM qualification.'}
              </p>
              <ul className="space-y-2 pt-2 text-slate-300 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'استهداف أصحاب الشركات والمغتربين بحملات فيديو تفاعلية ثلاثية الأبعاد' : 'Targeted business owners and overseas expats with immersive video tours'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'فلترة مسبقة للميزانيات وتحديد مواعيد المعاينة قبل الاتصال الهاتفي' : 'Pre-qualification questionnaires locking in confirmed site inspection slots'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'حملات إعادة استهداف لزوار المشروعات أغلقت تعاقدات بأكثر من ١٤٠ مليون جنيه' : 'Multi-touch retargeting closing over 140M EGP in confirmed unit sales'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Real Estate Pillars */}
      <section className="bg-slate-900/60 border-t border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-start space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'ركائز التفوق العقاري' : 'Real Estate Growth Pillars'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isAr ? 'المنظومة التسويقية التي قادت لنجاح مشروعات لاشين' : 'The Acquisition Engine Behind Lashin Project Sell-Outs'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'استراتيجية تسويق عقاري متكاملة صممت خصيصاً لجذب المشترين الجادين وتسريع وتيرة التعاقدات.'
                : 'A cross-channel property acquisition framework engineered specifically for high-intent conversions.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategicPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all text-start space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Endorsement Quote */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl p-8 sm:p-14 border border-amber-500/30 text-start space-y-6 relative overflow-hidden">
          <Quote className="w-12 h-12 text-amber-400/40 absolute -top-2 end-6" />

          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
            <span className="text-xs font-bold text-slate-300 ms-2">
              {isAr ? 'شهادة رسمية موثقة' : 'Verified Client Endorsement'}
            </span>
          </div>

          <p className="text-lg sm:text-2xl font-medium text-slate-100 leading-relaxed italic max-w-4xl">
            {isAr
              ? '«الحملات التي نفذتها ديجيتال إفكت جعلت مشروعاتنا السكنية كاملة الحجز في وقت قياسي وبأعلى كفاءة تسويقية شهدناها، مع مشترين جادين يبحثون عن الجودة الحقيقية.»'
              : '"Digital Effect campaigns fully booked out our residential units in record time with unmatched cost per acquisition and pre-qualified buyers who appreciate true luxury."'}
          </p>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                L
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isAr ? 'القطاع التجاري — معمار لاشين' : 'Commercial Sector — Memar Lashin'}
                </div>
                <div className="text-xs text-amber-400">
                  {isAr ? 'شركة معمار لاشين للتطوير العقاري' : 'Memar Lashin Real Estate Development'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {isAr ? 'شراكة تسويق عقاري استراتيجية' : 'Strategic Real Estate Marketing Partnership'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 rounded-3xl p-8 sm:p-12 border border-amber-500/30 text-start flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'هل تطور مشروعاً عقارياً وتبحث عن مشترين جادين؟' : 'Developing a Real Estate Project and Need High-Intent Buyers?'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {isAr ? 'جاهز لتحويل مشروعاتك السكنية إلى حجز كامل بأعلى عائد استثماري؟' : 'Ready to Sell Out Your Residential Development with 6X+ ROI?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {isAr
                ? 'فريق ديجيتال إفكت جاهز لبناء مسارات إعلانات الاستهداف الطبقي وتأهيل ليدات المشترين الحقيقيين لمشروعاتك السكنية والتجارية.'
                : 'Digital Effect team is prepared to craft precision real estate buyer acquisition funnels that maximize contract velocity and minimize wasted media spend.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 transition-all text-center cursor-pointer"
            >
              {isAr ? 'احجز جلستك الاستشارية العقارية الآن' : 'Book Real Estate Strategy Session'}
            </button>
            <button
              onClick={() => setCurrentPage('case-studies')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-all text-center cursor-pointer"
            >
              {isAr ? 'تصفح دراسات أخرى' : 'Explore Other Cases'}
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full Creative Inspection */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto text-white shadow-2xl relative text-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {activeLightboxImg.title}
                </h3>
                <p className="text-xs text-amber-400">
                  {isAr ? 'معمار لاشين للتطوير العقاري — ديجيتال إفكت' : 'Memar Lashin Real Estate — Digital Effect'}
                </p>
              </div>

              <button
                onClick={() => setActiveLightboxImg(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                <img
                  src={activeLightboxImg.url}
                  alt={activeLightboxImg.title}
                  className="max-h-[70vh] w-auto object-contain mx-auto"
                />
              </div>

              {activeLightboxImg.desc && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeLightboxImg.desc}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
