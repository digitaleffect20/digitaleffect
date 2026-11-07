import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  ShoppingBag, 
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
  Shirt, 
  Store, 
  Crown,
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

export const ConcreteCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-concrete');
  const creatives = getCaseStudyCreatives('cs-b2c-concrete', currentCaseStudy);
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
      value: '5.4X',
      label: isAr ? 'العائد المستدام على الإنفاق الإعلاني (ROAS)' : 'Sustained Ad Spend ROAS',
      hint: isAr ? 'متوسط مستقر طوال مواسم الإطلاق وتخفيضات المجموعات' : 'Sustained across seasonal drops & new collection launches',
      growth: '5.4X ROAS',
      icon: <Zap className="w-6 h-6 text-amber-400" />
    },
    {
      value: '+240%',
      label: isAr ? 'نمو طلبات المتجر وزيارات الفروع' : 'E-Com Orders & Store Footfall Growth',
      hint: isAr ? 'إقبال غير مسبوق على الشراء الرقمي ومبيعات صالات العرض' : 'Direct scale across digital checkouts and flagship showrooms',
      growth: '+240%',
      icon: <TrendingUp className="w-6 h-6 text-sky-400" />
    },
    {
      value: '3.8M+',
      label: isAr ? 'وصول نوعي لجمهور الأزياء الراقية' : 'Targeted Luxury Menswear Reach',
      hint: isAr ? 'استهداف دقيق لرجال الأعمال والمهنيين والمقبلين على الزواج' : 'Targeted impressions reaching affluent professionals and grooms',
      growth: '3.8M+',
      icon: <Users className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '52,000+',
      label: isAr ? 'تفاعل واستفسار شراء على التشكيلات' : 'Direct Buyer Inquiries & Engagements',
      hint: isAr ? 'رسائل استفسار عن الفروع والمقاسات وحجوزات التجهيز' : 'High-intent sizing, branch location, and styling requests',
      growth: '52K+',
      icon: <Store className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'إعلانات المواسم وتوجيه الحركة للفروع والمتجر' : 'Omnichannel Retail & E-Commerce Funnels',
      desc: isAr ? 'حملات متكاملة تربط بين إعلانات التفاعل الرقمي وتوجيه العميل إلى أقرب فرع لتجربة القياس، أو إتمام الشراء الفوري أونلاين.' : 'Unified performance funnels synchronizing online catalog ads with nearest showroom navigation and single-click checkout.',
      icon: <Store className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'المحتوى التحريري وكتالوجات الإطلالات (Lookbooks)' : 'Editorial Lookbooks & Style Guides',
      desc: isAr ? 'صناعة محتوى فوتوغرافي راقٍ يعامل الملابس كقطع فنية متكاملة، مما يرفع متوسط قيمة سلة الشراء (AOV).' : 'High-fashion editorial photography presenting complete ready-to-wear ensembles to maximize average order value (AOV).',
      icon: <Shirt className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'إعادة الاستهداف الذكي لحقائب الشراء المتروكة' : 'High-Intent Cart Retargeting & Urgency Triggers',
      desc: isAr ? 'مسارات إعادة استهداف سريعة للمهتمين بالبدل والقطع الحصرية مع إشعارات نفاد المقاسات لتسريع وتيرة اتخاذ القرار.' : 'Dynamic retargeting funnels re-engaging suiting prospects with low-inventory scarcity cues to drive rapid checkout.',
      icon: <Zap className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'ترسيخ الهيبة الإيطالية والفخامة الراقية' : 'Heritage Luxury Menswear Positioning',
      desc: isAr ? 'إبراز عراقة الأقمشة الإيطالية، جودة التفصيل، والتاريخ العريض لعلامة كونكريت في تصدر الأزياء الرجالية بمصر.' : 'Reinforcing certified Italian wool provenance and master tailoring heritage to command premium category pricing.',
      icon: <Crown className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة كونكريت للأزياء (Concrete) — حملات الأزياء الراقية ومضاعفة المبيعات | ديجيتال إفكت' : 'Concrete Menswear & Fashion Case Study | Digital Effect'}
        description={isAr ? 'كيف طوّرت ديجيتال إفكت الحملات الرقمية وهوية عروض المواسم لعلامة كونكريت للأزياء الرجالية الفاخرة لتحقيق عائد إعلاني 5.4X وزيادة مبيعات الفروع والمتجر بنسبة 240%.' : 'How Digital Effect scaled Concrete luxury menswear campaigns achieving 5.4X ROAS and +240% omnichannel sales growth.'}
        image="/assets/portfolio_crops/card_concrete.png"
        imageAlt={isAr ? 'دراسة حالة كونكريت للأزياء الرجالية الفاخرة - ديجيتال إفكت' : 'Concrete Fashion & Menswear Case Study - Digital Effect'}
        urlPath="#concrete-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع التجارة والتجزئة والأزياء الراقية (B2C Fashion Retail)' : 'Luxury Fashion Retail & Menswear Apparel'}
        tags={['كونكريت', 'Concrete', 'أزياء رجالية', 'بدل رجالي', 'تسويق أزياء', 'تجارة إلكترونية', 'ديجيتال إفكت', 'Digital Effect Fashion']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Concrete Luxury Menswear Omnichannel Scale Case Study — Digital Effect',
          description: 'Scaling luxury menswear fashion campaigns and omnichannel showroom sales with 5.4X sustained ROAS.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_concrete.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_concrete.png',
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
            name: 'Concrete Fashion & Menswear',
            areaServed: 'Egypt & Regional Retail'
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
              {isAr ? 'كونكريت للأزياء والملابس (Concrete)' : 'Concrete Menswear'}
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
              href="https://digitaleffect.net/concrete/"
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

      {/* Main Hero Header with Cinematic Luxury Fashion Boutique Background */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pb-28 border-b border-slate-800 bg-slate-950">
        {/* Cinematic Boutique Interior Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/concrete/concrete_hero_bg.jpg" 
            alt="Concrete Luxury Menswear Boutique Showroom Background" 
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
                  src="/assets/concrete/concrete_img_1.png"
                  alt="Concrete Fashion & Menswear Official Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'شريك ديجيتال إفكت في تسويق الأزياء الرجالية الفاخرة' : 'Premier Luxury Menswear Fashion Partner'}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {isAr ? 'أزياء راقية · بدل ومناسبات · كاجوال ذكي · متجر إلكتروني وفروع' : 'Luxury Menswear · Bespoke Suiting · Smart Casual · E-Com & Showrooms'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://digitaleffect.net/concrete/"
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
                <span>{isAr ? 'طلب خطة نمو لبراند أزياء أو تجزئة' : 'Request Fashion Growth Plan'}</span>
              </button>
            </div>
          </div>

          {/* Headline and Narrative */}
          <div className="space-y-4 max-w-4xl text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{isAr ? 'دراسة حالة B2C أزياء وتجزئة موثقة بالأرقام' : 'Audited B2C Luxury Fashion & Retail Case Study'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {isAr ? (
                <>
                  إطلاق حملات المواسم والأزياء الراقية وتحقيق <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">عائد إعلاني 5.4X</span>
                </>
              ) : (
                'Seasonal Fashion Campaigns & Scaling Retail Showrooms and Online Orders'
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl font-light">
              {isAr
                ? 'كيف صممت ديجيتال إفكت استراتيجية تسويقية متكاملة لعلامة كونكريت؛ جمعت بين التصوير التحريري الأنيق، كتالوجات الإطلالات الرقمية، ومسارات إعلانات التحويل المباشر التي ضاعفت مبيعات الفروع والمتجر الإلكتروني بنسبة 240% وحققت عائداً إعلانياً مستداماً بلغ 5.4X ROAS.'
                : 'How Digital Effect engineered an elevated fashion marketing playbook for Concrete, combining editorial visual storytelling, digital lookbooks, and high-intent performance ads that drove +240% omnichannel sales and sustained 5.4X ROAS.'}
            </p>

            {/* Services Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                isAr ? 'تصميم الحملات الإعلانية ومجموعات الأزياء' : 'Fashion Editorial & Campaign Design',
                isAr ? 'إعلانات زيادة المبيعات والتجارة الإلكترونية' : 'Omni-Channel Retail Performance Ads',
                isAr ? 'إدارة منصات التواصل الاجتماعي ومحتوى الأناقة' : 'Social Media Management & Style Guides',
                isAr ? 'توجيه حركة الشراء للفروع والمتاجر الإلكترونية' : 'Store Traffic & Digital Cart Funnels',
                isAr ? 'إعادة استهداف حقائب الشراء وسلات التسوق' : 'Cart Abandonment Retargeting'
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
              {isAr ? 'احجز استشارة لعلامتك التجارية أو متجرك' : 'Book a Fashion Retail Consultation'}
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
            clientName={isAr ? 'كونكريت للملابس الرجالية الفاخرة' : 'Concrete Luxury Menswear'}
          />
        )}

        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'معرض المنشورات بالحجم الواضح الكامل' : 'Full-Resolution Creative Showcase'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'تصاميم حملات الأزياء الراقية بالحجم الكامل والوضوح الفائق' : 'Selected Concrete Campaign Visuals & Creative Assets'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'نماذج من التصاميم الإعلانية المعتمدة لحملات كونكريت بدقتها الكاملة (1080x1350 و 1024x1536)؛ تبرز جمالية الأقمشة الصوفية والبدل الفاخرة وإطلالات الكاجوال الذكي. انقر على أي تصميم لتكبيره.'
              : 'Full resolution creative assets showcasing Italian suiting, seasonal outerwear, and smart casual collections. Click any visual to inspect.'}
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
              <span>{isAr ? 'أرقام النجاح والنتائج المعتمدة' : 'Audited Growth Performance'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isAr ? 'نتائج قياسية لمبيعات الفروع والتجارة الإلكترونية' : 'Record Retail Footfall & E-Commerce Metrics'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'مؤشرات أداء رقمية وتجارية موثقة خلال ٥ أشهر من إدارة الحملات الموسمية وعروض الإطلاق لعلامة كونكريت.'
                : 'Audited campaign and retail conversion data during 5 months of precision seasonal fashion execution.'}
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
            {isAr ? 'تحدي سوق الأزياء الراقية.. والحل المبتكر من ديجيتال إفكت' : 'Fashion Market Challenge & Digital Effect Strategic Solution'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'كيف واجهنا معضلة تنشيط المبيعات اليومية مع الحفاظ على المكانة الفاخرة للعلامة التجارية.'
              : 'How we solved the classic luxury dilemma: scaling commercial volume while protecting brand equity.'}
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
                  {isAr ? 'التحدي التسويقي' : 'The Fashion Challenge'}
                </h3>
                <p className="text-xs text-red-400/90 font-medium">
                  {isAr ? 'معادلة الفخامة مقابل سرعة المبيعات في مواسم التخفيضات' : 'Balancing heritage luxury with urgent seasonal sales velocity'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {isAr
                  ? 'الحفاظ على فخامة ورقي البراند مع تنشيط المبيعات اليومية في مواسم التخفيضات ومجموعات الأزياء الجديدة دون المساس بصورة العلامة المترسخة في أذهان كبار العملاء.'
                  : 'Balancing heritage luxury positioning with urgent direct-response commercial velocity across retail stores and digital shopping carts without cheapening brand perception.'}
              </p>
              <ul className="space-y-2 pt-2 text-slate-400 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{isAr ? 'خطر ابتذال صورة البراند الفاخر عند طرح العروض الترويجية التقليدية' : 'Risk of diluting luxury brand equity during price-led clearance periods'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{isAr ? 'ارتفاع معدلات التخلي عن سلة الشراء في المنتجات عالية القيمة السعرية' : 'High shopping cart abandonment rates for high-ticket suiting'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{isAr ? 'صعوبة ربط زوار المنصات الرقمية بتجربة القياس والشراء المباشر بالفروع' : 'Friction in funneling online viewers into brick-and-mortar showroom fitting'}</span>
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
                  {isAr ? 'كتالوجات رقمية أنيقة + مسارات تحويل متكاملة للفروع والمتجر' : 'Editorial digital lookbooks + synchronized omnichannel conversion'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {isAr
                  ? 'تصميم حملات بصرية فائقة الأناقة، إطلاق كتالوجات تفاعلية للمجموعات الجديدة، وإعلانات إعادة استهداف للمهتمين بالبدل والملابس الكاجوال الراقية مع ربط الحجز بالفروع.'
                  : 'Curated editorial fashion visual assets, launched interactive new-collection lookbooks, and ran high-intent social ads driving store footfall and online checkout.'}
              </p>
              <ul className="space-y-2 pt-2 text-slate-300 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'صياغة عروض المواسم بأسلوب "مجموعات الأناقة المتكاملة" بدلاً من التخفيضات العشوائية' : 'Framing seasonal promotions as curated capsule bundles rather than generic clearance'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'إعلانات الاستهداف الجغرافي لفروع المتاجر مع خرائط تفاعلية لحجز مواعيد القياس' : 'Showroom geotargeting paired with direct in-store VIP fitting appointment booking'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'إعادة استهداف ذكية حققت عائداً إعلانياً قياسياً بلغ 5.4X ROAS' : 'Automated abandoned checkout retargeting sustaining 5.4X verified ROAS'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Fashion Pillars */}
      <section className="bg-slate-900/60 border-t border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-start space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAr ? 'ركائز التفوق التسويقي' : 'Fashion Growth Pillars'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isAr ? 'المنظومة التسويقية التي قادت لنمو علامة كونكريت' : 'The Omnichannel Engine Powering Concrete Retail Scale'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'استراتيجية متعددة القنوات جمعت بين صناعة المحتوى التحريري وإدارة ميزانيات الأداء التجاري.'
                : 'A high-impact framework marrying editorial fashion creativity with rigorous commercial media buying.'}
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
              ? '«ديجيتال إفكت جمعت بين الذوق الرفيع المطلوب في عالم الموضة والنتائج الرقمية القوية في المبيعات وزيارات الفروع، وهو ما نحتاجه تماماً لمواصلة تصدر سوق الأزياء الرجالية الفاخرة.»'
              : '"Digital Effect brilliantly merged premium fashion aesthetics with hardcore commercial performance and showroom footfall, exactly what we needed to maintain category leadership."'}
          </p>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                C
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isAr ? 'إدارة العلامة التجارية — كونكريت' : 'Brand Directorate — Concrete'}
                </div>
                <div className="text-xs text-amber-400">
                  {isAr ? 'كونكريت للأزياء والملابس الرجالية' : 'Concrete Fashion & Menswear'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {isAr ? 'شراكة تسويق أزياء وتجزئة مستمرة' : 'Ongoing Fashion Retail Marketing Partnership'}
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
              <span>{isAr ? 'هل تدير علامة أزياء أو سلسلة متاجر تجزئة؟' : 'Managing a Fashion Brand or Retail Chain?'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {isAr ? 'جاهز لمضاعفة مبيعات المواسم وتحقيق عائد إعلاني يفوق 5X؟' : 'Ready to Multiply Seasonal Sales with 5X+ ROAS?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {isAr
                ? 'فريق ديجيتال إفكت جاهز لبناء الحملات التحريرية ومسارات إعلانات التحويل المباشر التي ترفع مبيعات فروعك ومتجرك الإلكتروني بأعلى كفاءة.'
                : 'Digital Effect team is prepared to craft tailored fashion campaigns and direct-response retail funnels that scale both physical store footfall and online checkouts.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 transition-all text-center cursor-pointer"
            >
              {isAr ? 'احجز جلستك الاستشارية الآن' : 'Book Fashion Strategy Session'}
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
                  {isAr ? 'كونكريت للأزياء والملابس الرجالية — ديجيتال إفكت' : 'Concrete Fashion & Menswear — Digital Effect'}
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
