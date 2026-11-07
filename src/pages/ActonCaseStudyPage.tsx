import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  Snowflake, 
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
  Store, 
  CreditCard,
  Timer,
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

export const ActonCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-acton');
  const creatives = getCaseStudyCreatives('cs-b2c-acton', currentCaseStudy);
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
      value: '+290%',
      label: isAr ? 'نمو مبيعات التجزئة وشبكة الموزعين' : 'Direct Retail & Dealer Sales Growth',
      hint: isAr ? 'طفرة غير مسبوقة في مبيعات الثلاجات والديب فريزر' : 'Unprecedented volume surge across cooling and freezers',
      growth: '+290%',
      icon: <TrendingUp className="w-6 h-6 text-sky-400" />
    },
    {
      value: '14,200+',
      label: isAr ? 'طلبات تقسيط ممولة ومحققة' : 'Approved Installment Orders',
      hint: isAr ? 'شراء فوري عبر شراكات التقسيط الاستهلاكي والبنكي' : 'Direct conversions via consumer credit partnerships',
      growth: '14.2K+',
      icon: <CreditCard className="w-6 h-6 text-amber-400" />
    },
    {
      value: '4.6X',
      label: isAr ? 'العائد الإعلاني الموسمي (ROAS)' : 'Seasonal Ad Spend ROAS',
      hint: isAr ? 'ربحية مستدامة طوال مواسم الصيف وتخفيضات الأعياد' : 'Sustained profitability across seasonal flash pushes',
      growth: '4.6X ROAS',
      icon: <Zap className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '2.1M+',
      label: isAr ? 'وصول نوعي للأسر والمقبلين على الزواج' : 'Targeted Family & Household Reach',
      hint: isAr ? 'استهداف دقيق لراغبي تجديد الأجهزة المنزلية وتجهيز المنازل' : 'Precision audience targeting home upgraders and newly-weds',
      growth: '2.1M+',
      icon: <Users className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'تسويق التقسيط الميسر كأداة تسريع قرار الشراء' : 'Zero-Friction Consumer Installment Funnels',
      desc: isAr ? 'صياغة عروض التقسيط بوضوح تام (بدون مقدم وبدون فوائد)، مما مكّن آلاف الأسر من اقتناء أجهزة أكتون دون أعباء مالية فورية.' : 'Positioning 0% down and interest-free consumer credit transparently, removing buying resistance and driving instant conversion.',
      icon: <CreditCard className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'إبراز قوة التبريد والضمان المعتمد طويل الأجل' : 'Inverter Efficiency & Long-Term Reliability Positioning',
      desc: isAr ? 'التركيز على متانة الكباسات والمحركات الموفرة للطاقة وقدرة العزل على الصمود في درجات الحرارة المرتفعة مع الضمان المعتمد.' : 'Highlighting tropical-grade compressors, heavy insulation, and certified long-term warranties to outshine market competition.',
      icon: <Snowflake className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'حملات مواسم الصيف وذروة الطلب على أجهزة التبريد' : 'Peak Seasonal Cooling & Summer Demand Harvesting',
      desc: isAr ? 'توقيت دقيق للحملات المكثفة مع بداية ارتفاع درجات الحرارة ومواسم الأعياد وتجهيز العرائس لاقتناص أعلى حصة سوقية ممكنة.' : 'Synchronized seasonal media deployment capturing soaring demand during hot summer months and bridal gifting peaks.',
      icon: <Zap className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'توجيه المستهلكين لشبكة الموزعين والمحافظات' : 'Nationwide Dealer Locator & Rapid Inquiry Routing',
      desc: isAr ? 'تأهيل سريع للاستفسارات وتزويد العميل فوراً بأقرب منفذ بيع معتمد أو إتاحة الشراء أونلاين مع خدمة التوصيل حتى باب المنزل.' : 'Automated chatbot qualification connecting prospective buyers directly with their regional dealers for immediate checkout.',
      icon: <Store className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة أكتون للأجهزة والتبريد (Acton) — تنشيط مبيعات الثلاجات والتقسيط | ديجيتال إفكت' : 'Acton Home Appliances & Refrigeration Case Study | Digital Effect'}
        description={isAr ? 'كيف طوّرت ديجيتال إفكت المنظومة التسويقية لشركة أكتون لأجهزة التبريد والثلاجات، لتحقيق نمو مبيعات بنسبة +290% وتوليد أكثر من 14,200 طلب تقسيط وعائد إعلاني 4.6X ROAS.' : 'How Digital Effect scaled Acton Home Appliances & Refrigeration achieving 4.6X ROAS, +290% sales growth, and 14,200+ consumer installment orders.'}
        image="/assets/portfolio_crops/card_acton.png"
        imageAlt={isAr ? 'دراسة حالة أكتون للأجهزة المنزلية والتبريد - ديجيتال إفكت' : 'Acton Appliances Case Study - Digital Effect'}
        urlPath="#acton-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع الأجهزة المنزلية والتبريد (B2C Home Appliances)' : 'Refrigeration & Consumer Appliances'}
        tags={['أكتون', 'Acton Appliances', 'ثلاجات أكتون', 'ديب فريزر', 'تقسيط أجهزة منزلية', 'تسويق الأجهزة', 'ديجيتال إفكت', 'Digital Effect Retail']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Acton Home Appliances & Refrigeration Retail Scale Case Study — Digital Effect',
          description: 'Scaling refrigerator and freezer retail volume and consumer financing partnerships with 4.6X sustained ROAS.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_acton.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_acton.png',
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
            name: 'Acton Home Appliances & Refrigeration',
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
              className="hover:text-sky-400 transition-colors"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <button 
              onClick={() => setCurrentPage('case-studies')}
              className="hover:text-sky-400 transition-colors"
            >
              {isAr ? 'سابقة الأعمال' : 'Case Studies'}
            </button>
            <span>/</span>
            <span className="text-sky-400 font-semibold truncate max-w-[200px] sm:max-w-none">
              {isAr ? 'أكتون للأجهزة والتبريد (Acton)' : 'Acton Appliances'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Social Share Button with Toast */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors relative"
              title={isAr ? 'مشاركة رابط دراسة الحالة' : 'Share Case Study Link'}
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'مشاركة' : 'Share'}</span>
            </button>
            {shareToast && (
              <span className="text-xs text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-md animate-fade-in">
                {isAr ? 'تم نسخ الرابط!' : 'Link copied!'}
              </span>
            )}

            <button
              onClick={() => setCurrentPage('b2c')}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-sky-400 transition-colors"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? 'قطاع B2C' : 'B2C Sector'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section with Negative Space & Background Image */}
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-[640px] flex items-center border-b border-slate-800">
        {/* Cinematic Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/acton-2/acton_hero_bg.jpg" 
            alt="Acton Luxury Contemporary Kitchen Refrigeration Background" 
            className="w-full h-full object-cover object-center lg:object-right"
          />
          {/* Gradients ensuring high-contrast readable negative space for typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Snowflake className="w-3.5 h-3.5" />
                {isAr ? 'دراسة حالة B2C — الأجهزة المنزلية والتبريد' : 'B2C Case Study — Cooling & Home Appliances'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isAr ? 'نتائج بيعية موثقة' : 'Audited Sales Results'}
              </span>
              <span className="text-xs text-slate-400">
                {isAr ? 'المدة: ٦ أشهر من الحملات المكثفة' : 'Duration: 6 Months Intensive Campaigns'}
              </span>
            </div>

            {/* Client Logo Card */}
            <div className="inline-flex items-center gap-4 p-3 pr-4 pl-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md mb-6 shadow-2xl">
              <div className="h-12 w-28 bg-white/95 rounded-xl flex items-center justify-center p-2 shadow-inner">
                <img 
                  src="/assets/acton-2/acton-2_img_1.png" 
                  alt="Acton Logo" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="border-r border-slate-700 pr-4">
                <div className="text-xs text-sky-400 font-semibold">{isAr ? 'العميل التجاري' : 'Client Profile'}</div>
                <div className="text-sm font-bold text-white">{isAr ? 'شركة أكتون للأجهزة المنزلية والتبريد' : 'Acton Home Appliances & Refrigeration'}</div>
                <div className="text-xs text-slate-400">{isAr ? 'الثلاجات، الديب فريزر، ومبردات المياه' : 'Refrigerators, Deep Freezers & Coolers'}</div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {isAr ? (
                <>
                  تنشيط مبيعات الثلاجات والديب فريزر وشراكات التقسيط البنكي والاستهلاكي
                </>
              ) : (
                <>
                  Scaling Refrigerator & Freezer Retail Volume & Financing Partnerships
                </>
              )}
            </h1>

            {/* Subtitle / Overview */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              {isAr 
                ? 'كيف طوّرت ديجيتال إفكت المنظومة التسويقية لشركة أكتون، عبر حملات موسمية ذكية لعروض التقسيط بمقدم 0%، وإبراز كفاءة المحركات والضمان الطويل، لتحقيق نمو مبيعات بنسبة +290% وتوليد أكثر من 14,200 طلب تقسيط مباشر.'
                : 'How Digital Effect scaled Acton Appliances’ retail presence and consumer financing partnerships, delivering +290% direct retail sales growth and over 14,200 approved installment purchase orders.'
              }
            </p>

            {/* Services Executed Tags */}
            <div className="mb-8">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Delivered:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  isAr ? 'تصميم الحملات الإعلانية للأجهزة المنزلية' : 'Home Appliance Creative Visual Design',
                  isAr ? 'إدارة وتطوير الحملات على Meta (Facebook & Instagram)' : 'Meta Paid Ad Management (Facebook & Instagram)',
                  isAr ? 'تسويق عروض الشراكات البنكية والتقسيط الميسر' : 'Retail Financing & Installment Promotion',
                  isAr ? 'صناعة المحتوى الترويجي وتوجيه المستهلكين للمنافذ' : 'Consumer Copywriting & Dealer Hub Guidance',
                  isAr ? 'حملات الصيف ومواسم تجهيز العرائس' : 'Peak Summer Cooling Campaigns'
                ].map((srv, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    <Check className="w-3 h-3 text-sky-400" />
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{isAr ? 'احجز استشارة B2C لعلامتك التجارية' : 'Book a B2C Consultation'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('b2c')}
                className="px-5 py-3.5 rounded-xl text-sm font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>{isAr ? 'استعراض باقات قطاع B2C' : 'Explore B2C Packages'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4 text-sky-400" /> : <ArrowRight className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Creatives Gallery with Lightbox (DIRECTLY AFTER HERO) */}
      <section className="py-16 lg:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Campaign Videos Showcase if available */}
          {videos && videos.length > 0 && (
            <CaseStudyVideoSection
              videos={videos}
              isAr={isAr}
              clientName={isAr ? 'أكتون للتبريد والأجهزة المنزلية' : 'Acton Cooling & Appliances'}
            />
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'معرض التصاميم الإعلانية والحملات البصرية' : 'Campaign Creatives & Visual Gallery'}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                {isAr ? 'أعمال الحملة: إعلانات أجهزة التبريد وعروض التقسيط المباشر' : 'The Creative Work: Cooling Appliances & Financing Campaigns'}
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {isAr 
                ? 'انقر على أي تصميم لمشاهدته بالحجم الكامل واستعراض استراتيجية الإخراج البصري وعروض التسهيلات الائتمانية.'
                : 'Click any visual to inspect full resolution, creative direction, and consumer financing messaging.'
              }
            </p>
          </div>

          {/* Grid of Creatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatives.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveLightboxImg({ url: item.url, title: item.title, desc: item.desc })}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-sky-500/10 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-slate-950 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Maximize2 className="w-3.5 h-3.5" />
                      {isAr ? 'عرض بدقة كاملة' : 'View Full Image'}
                    </span>
                  </div>

                  {/* Top Tag Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900/90 text-sky-300 border border-slate-700/80 backdrop-blur-sm">
                      {item.tag}
                    </span>
                  </div>
                </div>

                {/* Caption Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      {isAr ? 'تصميم إعلاني معتمد' : 'Verified Ad Creative'}
                    </span>
                    <span className="text-sky-400 font-semibold group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      {isAr ? 'تكبير ←' : 'Expand →'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Audited Metrics */}
      <section className="py-16 lg:py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 mb-3">
              <Award className="w-3.5 h-3.5" />
              {isAr ? 'مؤشرات الأداء المحققة بالأرقام الموثقة' : 'Audited Growth & Performance Results'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'نتائج بيعية وتمويلية رسخت ريادة أجهزة أكتون' : 'Direct Commercial Metrics Solidifying Market Standing'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {isAr 
                ? 'خلال ٦ أشهر من الحملات المكثفة وتفعيل قنوات التقسيط الاستهلاكي، حققت أكتون أرقاماً غير مسبوقة في حجم المبيعات المباشرة للمستهلكين وشبكة الموزعين.'
                : 'Across 6 months of targeted creative pushes and 0% installment integrations, Acton delivered peak sales velocity nationwide.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auditedMetrics.map((metric, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                      {metric.icon}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                      {metric.growth}
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm font-bold text-slate-200 mb-2">
                    {metric.label}
                  </div>
                </div>
                <div className="text-xs text-slate-400 pt-3 border-t border-slate-800">
                  {metric.hint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Strategic Blueprint (Challenge vs Solution) */}
      <section className="py-16 lg:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 block">
              {isAr ? 'المعادلة الاستراتيجية' : 'Strategic Blueprint'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              {isAr ? 'التحدي التسويقي وحل ديجيتال إفكت المبتكر' : 'The Market Dilemma & The Digital Effect Engine'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Challenge Card */}
            <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-900/40 text-rose-300 border border-rose-800/60 mb-5">
                <Timer className="w-3.5 h-3.5" />
                {isAr ? 'التحدي قبل التدخل' : 'The Market Challenge'}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {isAr ? 'حساسية الأسعار وتفضيل المستهلكين للشراء بالتقسيط في مواسم التبريد' : 'Price Sensitivity & High Consumer Demand for Installment Financing'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'رغم قوة وجودة أجهزة أكتون، كان التحدي الأكبر يكمن في تردد الأسر والمقبلين على الزواج في سداد مبالغ نقدية كاملة للأجهزة الكبيرة (الثلاجات والديب فريزر)، وسط منافسة شرسة من علامات تجارية تقدم تسهيلات تقسيط مدعومة، مع الحاجة لتعزيز ثقة المستهلك بمتانة محركات أكتون.'
                  : 'Despite robust product quality, Acton faced price-point resistance from families and newly-weds seeking manageable monthly installment plans, coupled with the need to build consumer confidence in motor longevity and warranty support.'
                }
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'عقبة الدفع الفوري كاش وتفضيل المستهلكين لخطط السداد الشهرية بدون فوائد.' : 'Upfront cash resistance and consumer preference for interest-free installment schemes.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'الحاجة لحملات ترويجية موسمية تسبق ذروة الصيف لتحريك مبيعات مبردات المياه والديب فريزر.' : 'The imperative for early-season summer awareness drives to unlock cooling demand.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'تأهيل استفسارات السوشيال ميديا وتوجيه العملاء فوراً إلى أقرب موزع معتمد بالمحافظات.' : 'Routing high volumes of social inquiries to regional authorized dealers.'}</span>
                </li>
              </ul>
            </div>

            {/* Solution Card */}
            <div className="p-8 rounded-3xl bg-sky-950/20 border border-sky-900/40 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-900/40 text-sky-300 border border-sky-800/60 mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'حل وتدخل ديجيتال إفكت' : 'The Digital Effect Solution'}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {isAr ? 'حملات تمويل استهلاكي بمقدم 0%، محتوى يثبت متانة المحركات، ومسار توجيه فوري' : 'Zero-Down Financing Push, Engine Durability Proofs & Immediate Dealer Routing'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'بنت ديجيتال إفكت استراتيجية تسويقية متكاملة ربطت أجهزة أكتون بأشهر منصات التقسيط الاستهلاكي مع حملات بمقدم 0%، وصاغت رسائل تقنية تثبت قدرة محركات أكتون الاستوائية على تحمل درجات الحرارة العالية، مع تفعيل أداة الرد السريع لتوجيه كل عميل إلى معرضه القريب.'
                  : 'Digital Effect activated strategic 0% down installment promotions, created technical credibility creatives validating tropical compressor durability, and automated direct-response dealer lookups for instant showroom visits.'
                }
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'إبراز عروض التقسيط بدون مقدم وبدون فوائد لإزالة التردد المالي لدى المشتري.' : 'Promoting zero-down 0% installment options to eliminate purchasing friction.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'تسليط الضوء على الضمان المعتمد وتغطية مراكز الصيانة في كل المحافظات.' : 'Spotlighting extended manufacturer warranties and nationwide service centers.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'أتمتة خدمة الرد على استفسارات الأسعار والمقاسات وتوجيه العميل للموزع في ثوانٍ.' : 'Automating dimension and price assistance to guide buyers to their nearest distributor.'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Strategic Pillars */}
      <section className="py-16 lg:py-24 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 block">
              {isAr ? 'ركائز النجاح' : 'Strategic Pillars'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'أربعة محاور جوهرية حققت الطفرة البيعية لشركة أكتون' : 'Four Core Pillars That Catalyzed Acton’s Market Scale'}
            </h2>
            <p className="text-sm text-slate-400">
              {isAr 
                ? 'استندت استراتيجية ديجيتال إفكت إلى إزالة العوائق المالية وإبراز الجودة الهندسية واقتناص مواسم الطلب القصوى.'
                : 'A cohesive framework combining consumer financing, compressor endurance, seasonal timing, and dealer routing.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategicPillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 transition-all flex gap-4 items-start"
              >
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Client Endorsement Quote */}
      <section className="py-16 lg:py-20 bg-slate-950 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Quote className="w-12 h-12 text-sky-400/40 mx-auto mb-6" />
          <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-200 leading-relaxed mb-6">
            {isAr ? (
              <>
                "حملات أكتون مع ديجيتال إفكت ساعدتنا في الوصول لآلاف المنازل وزيادة مبيعات أجهزة التبريد بصورة غير مسبوقة، وسرّعت دورة بيع المخزون في مواسم الذروة بفضل حلول التقسيط المبتكرة والتصاميم المتقنة."
              </>
            ) : (
              <>
                "Acton campaigns with Digital Effect scaled our household footprint and generated unprecedented cooling appliance orders, accelerating inventory turns through tailored installment campaigns and immaculate creative execution."
              </>
            )}
          </blockquote>
          <div className="inline-flex flex-col items-center">
            <span className="font-bold text-white text-base">
              {isAr ? 'إدارة المبيعات والتسويق' : 'Sales Management'}
            </span>
            <span className="text-xs text-sky-400">
              {isAr ? 'شركة أكتون للأجهزة المنزلية والتبريد' : 'Acton Home Appliances & Refrigeration'}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 7: Bottom CTA Box */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'جاهز لتحقيق نفس النجاح؟' : 'Ready for Market Scale?'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'هل ترغب في مضاعفة مبيعات أجهزتك المنزلية وتفعيل حلول التقسيط المباشر لعلامتك؟' : 'Ready to Multiply Your Appliance Sales & Activate Consumer Financing?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
              {isAr 
                ? 'فريق ديجيتال إفكت متخصص في هندسة الحملات الترويجية لشركات الأجهزة الاستهلاكية والتبريد، وربط عروض التقسيط بمسارات بيع سريعة للمستهلكين والموزعين.'
                : 'Digital Effect specializes in engineering high-velocity marketing funnels for consumer appliances and refrigeration brands, pairing creative dominance with scalable financing activations.'
              }
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{isAr ? 'احجز جلستك الاستشارية الاستراتيجية الآن' : 'Book Your Strategic Consultation Now'}</span>
              </button>
              <button
                onClick={() => setCurrentPage('case-studies')}
                className="px-6 py-4 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>{isAr ? 'استعراض المزيد من دراسات الحالة' : 'Explore More Case Studies'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4 text-sky-400" /> : <ArrowRight className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Creatives */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="pr-2">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {activeLightboxImg.title}
                </h4>
                {activeLightboxImg.desc && (
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {activeLightboxImg.desc}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image */}
            <div className="p-2 sm:p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img 
                src={activeLightboxImg.url} 
                alt={activeLightboxImg.title} 
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? 'تصميم حصري لشركة أكتون للأجهزة المنزلية والتبريد' : 'Exclusive Creative for Acton Home Appliances & Refrigeration'}</span>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-colors"
              >
                {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
