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
  Video, 
  Users, 
  ShoppingBag, 
  CalendarCheck, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Quote, 
  Maximize2,
  X,
  Play,
  Percent,
  Flame,
  ShieldCheck,
  Check
} from 'lucide-react';

import { getCaseStudyCreatives, getCaseStudyVideos } from '../utils/caseStudyMedia';
import { CaseStudyVideoSection } from '../components/CaseStudyVideoSection';

export const PenguinCaseStudyPage: React.FC = () => {
  const { data, language, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-penguin');
  const creatives = getCaseStudyCreatives('cs-b2c-penguin', currentCaseStudy);
  const videos = getCaseStudyVideos(currentCaseStudy);

  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; title: string; desc?: string } | null>(null);
  const [shareToast, setShareToast] = useState(false);

  const pageTitle = isAr 
    ? 'دراسة حالة براند بينجوين للأجهزة والتبريد | ديجيتال إفكت' 
    : 'Penguin Appliances & Cooling Case Study | Digital Effect B2C Marketing';

  const pageDescription = isAr
    ? 'قصة نجاح براند بينجوين للأجهزة المنزلية والتبريد مع ديجيتال إفكت: إعادة بناء الهوية البصرية، 3.6 مليون مشاهدة، نمو مبيعات التجزئة بنسبة +310% وعائد إعلاني 4.8X ROAS.'
    : 'How Penguin Home Appliances scaled with Digital Effect: brand identity overhaul, 3.6M+ video views, +310% retail sales surge, and 4.8X sustained ROAS.';

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
      label: isAr ? 'نمو مبيعات الأجهزة والتجزئة' : 'Direct & Retail Sales Growth',
      value: '+310%',
      growth: '3.1X Scale',
      hint: isAr ? 'في مبردات المياه والديب فريزر والثلاجات' : 'across dispensers, freezers & refrigerators',
      icon: <ShoppingBag className="w-5 h-5 text-sky-400" />,
    },
    {
      label: isAr ? 'مشاهدات الحملات ومقاطع الفيديو' : 'Campaign Video Impressions',
      value: '3,600,000+',
      growth: 'Viral Reach',
      hint: isAr ? 'وصول موجه لجمهور المستهلكين والمقبلين على الزواج' : 'targeted prospective consumer reach',
      icon: <Eye className="w-5 h-5 text-sky-400" />,
    },
    {
      label: isAr ? 'العائد على الإنفاق الإعلاني ROAS' : 'Return on Ad Spend (ROAS)',
      value: '4.8X',
      growth: 'High Profitability',
      hint: isAr ? 'متوسط الحملات في مواسم الصيف وعروض التقسيط' : 'maintained across summer & installment surges',
      icon: <TrendingUp className="w-5 h-5 text-sky-400" />,
    },
    {
      label: isAr ? 'استفسارات الشراء ومنافذ التوزيع' : 'Qualified Consumer Inquiries',
      value: '85,000+',
      growth: '+180% Inbound',
      hint: isAr ? 'استفسارات أسعار وتوجيه لمنافذ 2B والمعارض' : 'buying intents routed to 2B showrooms & online',
      icon: <Users className="w-5 h-5 text-sky-400" />,
    },
  ];

  const retailPillars = [
    {
      title: isAr ? 'حملات الصيف التفاعلية' : 'Peak Summer Campaigns',
      desc: isAr ? 'شعار «الصيف الحقيقي يبدأ من الركن اللي كله برودة» ركز على مبردات المياه والميني بار في الأجواء الحارة.' : 'Catchy consumer positioning driving seasonal surges for dispensers & minibars.',
      badge: isAr ? 'موسم الذروة' : 'Peak Velocity',
    },
    {
      title: isAr ? 'شراكات التقسيط البنكي' : '0% Installment Partnerships',
      desc: isAr ? 'الترويج لعروض التقسيط 12 شهراً بدون فوائد وبدون مقدم بالتعاون مع ValU وموزعي 2B وسلاسل التجزئة.' : 'Zero-friction financing via ValU & 2B retail channels removing purchase hesitation.',
      badge: isAr ? 'تمويل استهلاكي' : 'Financing Funnels',
    },
    {
      title: isAr ? 'مقاطع موشن جرافيك وريلز' : '15+ Motion Reels & Videos',
      desc: isAr ? 'إنتاج أكثر من ١٥ مقطع فيديو وريلز متحرك يوضح التكنولوجيا الإيطالية، كفاءة الطاقة، وتفاصيل الأجهزة بدقة.' : 'High-production 3D and motion reels highlighting Italian components & compressor specs.',
      badge: isAr ? 'إنتاج فيديو' : 'High Production',
    },
    {
      title: isAr ? 'تحويل المتابعين إلى مشترين' : 'Omnichannel Retail Routing',
      desc: isAr ? 'ربط الحملات بمنافذ الشراء المباشر، المتجر الإلكتروني، وتوجيه المشترين لأقرب فرع أو معرض معتمد.' : 'Seamless store locators and direct WhatsApp order dispatch maximizing conversion.',
      badge: isAr ? 'تجزئة ومتاجر' : 'Store Footfall',
    },
  ];

  return (
    <div className="bg-slate-950 text-white min-h-screen pb-24 text-start font-sans">
      {/* Dynamic OpenGraph, Twitter Cards & Structured Data */}
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/portfolio_crops/card_penguin.png"
        imageAlt={isAr ? 'دراسة حالة براند بينجوين للأجهزة المنزلية والتبريد - ديجيتال إفكت' : 'Penguin Home Appliances & Refrigeration Case Study - Digital Effect'}
        urlPath="#penguin-case-study"
        type="article"
        publishedTime="2024-02-10T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع التجزئة والمستهلكين والأجهزة المنزلية (B2C)' : 'B2C Retail & Consumer Electronics'}
        tags={['بينجوين', 'أجهزة منزلية', 'تبريد', 'ديب فريزر', 'ثلاجات', 'تسويق B2C', 'عائد إعلاني ROAS', 'ديجيتال إفكت', 'Digital Effect', 'Penguin Appliances']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: pageTitle,
          description: pageDescription,
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_penguin.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_penguin.png',
          datePublished: '2024-02-10T08:00:00Z',
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
            '@type': 'Product',
            name: 'Penguin Home Appliances',
            alternateName: 'شركة بينجوين للأجهزة المنزلية والتبريد',
            category: 'Home Appliances, Refrigerators, Freezers & Water Dispensers'
          }
        }}
      />

      {/* Lightbox Modal for Full Image Inspection */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-12 end-0 p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImg.url}
              alt={activeLightboxImg.title}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <div className="text-center mt-3 text-sm font-semibold text-slate-200">
              {activeLightboxImg.title}
            </div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Navigation Bar */}
      <section className="border-b border-slate-800 bg-slate-900/80 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => setCurrentPage('home')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <button
              onClick={() => setCurrentPage('case-studies')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              {isAr ? 'دراسات الحالة والأعمال' : 'Case Studies'}
            </button>
            <span>/</span>
            <button
              onClick={() => setCurrentPage('b2c')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              {isAr ? 'قطاع B2C والتجارة' : 'B2C Sector'}
            </button>
            <span>/</span>
            <span className="text-sky-400 font-bold">
              {isAr ? 'براند بينجوين للأجهزة المنزلية' : 'Penguin Home Appliances'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Social Share Button with Toast */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title={isAr ? 'مشاركة رابط دراسة الحالة عبر السوشيال ميديا' : 'Share case study link'}
            >
              {shareToast ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
              <span>{shareToast ? (isAr ? 'تم نسخ الرابط!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share')}</span>
            </button>

            <button
              onClick={() => setCurrentPage('case-studies')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? 'العودة لسابقة الأعمال' : 'Back to Case Studies'}</span>
            </button>
            <button
              onClick={() => setCurrentPage('b2c')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors cursor-pointer"
            >
              <span>{isAr ? 'باقات قطاع B2C' : 'B2C Packages'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Main Hero Header with Cinematic Appliance Showroom Background */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pb-28 border-b border-slate-800 bg-slate-950">
        {/* Cinematic Appliance Showroom Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/penguin/penguin_hero_bg.jpg" 
            alt="Penguin Home Appliances Showroom Background" 
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-7 text-start">
          {/* Client Logos & Tags Row */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-44 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl border border-white/20">
                <img
                  src="/assets/penguin/penguin_logo.png"
                  alt="Penguin Home Appliances Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30 backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? 'شريك ديجيتال إفكت في قطاع الأجهزة المنزلية والتجزئة' : 'Premier B2C Consumer Brand Partner'}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {isAr ? 'أجهزة التبريد والديب فريزر ومبردات المياه · مكونات إيطالية' : 'Refrigeration, Dispensers & Freezers · Italian Technology'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://digitaleffect.net/penguin/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors backdrop-blur-sm"
              >
                <span>{isAr ? 'رابط صفحة العميل الأصلية ↗' : 'Official Case Study Link ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'طلب خطة نمو لعلامتك التجارية' : 'Request Brand Growth Strategy'}</span>
              </button>
            </div>
          </div>

          {/* Headline and Narrative */}
          <div className="space-y-4 max-w-4xl text-start">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
              <span className="text-sky-400 font-extrabold tracking-wider bg-sky-950/70 px-2.5 py-1 rounded-md border border-sky-500/30">B2C RETAIL & APPLIANCES</span>
              <span>·</span>
              <span>FACEBOOK & INSTAGRAM</span>
              <span>·</span>
              <span>MOTION GRAPHICS & REELS</span>
              <span>·</span>
              <span>{isAr ? 'المدة: ٨ أشهر' : 'Duration: 8 Months'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] drop-shadow-md">
              {isAr ? (
                <>
                  دراسة حالة براند بينجوين للأجهزة المنزلية —{' '}
                  <span className="text-sky-400 underline decoration-sky-500 decoration-wavy underline-offset-8">
                    هوية عالمية
                  </span>{' '}
                  ونمو مبيعات التجزئة
                </>
              ) : (
                <>
                  Penguin Home Appliances —{' '}
                  <span className="text-sky-400">Social Media & Retail Case Study</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-slate-200/90 font-light leading-relaxed max-w-3xl drop-shadow-sm">
              {isAr
                ? 'من مجرد منشورات روتينية إلى هوية بصرية عالمية وحملات إعلانية تفاعلية ضاعفت الطلب ومبيعات التقسيط عبر سلاسل التجزئة والمتاجر الإلكترونية.'
                : 'From routine flat posts into an authoritative consumer electronics brand scaling retail showroom velocity and direct orders through high-impact motion campaigns.'}
            </p>
          </div>

          {/* Quick KPI Highlights inside Hero Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-4xl">
            {[
              { val: '+310%', label: isAr ? 'نمو مبيعات التجزئة' : 'Retail Sales Surge' },
              { val: '4.6M+', label: isAr ? 'وصول إعلاني مستهدف' : 'Targeted Reach' },
              { val: '62K+', label: isAr ? 'تفاعل واستفسار شراء' : 'Buyer Engagements' },
              { val: '5.2X', label: isAr ? 'عائد إنفاق إعلاني ROAS' : 'Campaign ROAS' },
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

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-white" />
              {isAr ? 'احجز استشارة نمو لعلامتك التجارية' : 'Book Brand Growth Consultation'}
            </button>

            <button
              onClick={() => setCurrentPage('b2c')}
              className="px-5 py-3.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 backdrop-blur-sm transition-all cursor-pointer"
            >
              {isAr ? 'استعراض باقات قطاع B2C' : 'View B2C Packages'}
            </button>
          </div>
        </div>
      </section>

      {/* Full-Size Creatives Gallery (Main Showcase - Directly after Hero) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'معرض المنشورات والبلان بالحجم الواضح الكامل' : 'Full-Resolution Creative & Plan Showcase'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'نماذج من المنشورات والتصاميم الإعلانية والبلان لبراند بينجوين' : 'Selected Campaign Creatives & Retail Posts'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'معروضة بأبعادها الأصلية الكاملة لبيان جودة الإخراج البصري، النصوص البيعية، وتفاصيل عروض التقسيط الإيطالية. انقر على أي صورة لتكبيرها.'
              : 'Rendered in native portrait resolution highlighting commercial copywriting, Italian tech badges, and financing offers. Click any image to inspect.'}
          </p>
        </div>

        {/* 2-Column Spacious Grid for Maximum Clarity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {creatives.map((item, idx) => {
            const itemTitle = isAr ? item.title : (item.titleEn || item.title);
            const itemTag = isAr ? item.tag : (item.tagEn || item.tag);
            const itemDesc = isAr ? item.desc : (item.descEn || item.desc);
            return (
              <div
                key={item.id || idx}
                className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-sky-500/50 transition-all shadow-xl flex flex-col justify-between group"
              >
                {/* Image Container with high clarity */}
                <div 
                  className="relative bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => setActiveLightboxImg({ url: item.url, title: itemTitle, desc: itemDesc })}
                >
                  <img
                    src={item.url}
                    alt={itemTitle}
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 max-h-[760px]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-4 py-2 bg-slate-900/90 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2">
                      <Maximize2 className="w-4 h-4 text-sky-400" />
                      <span>{isAr ? 'تكبير التصميم' : 'Enlarge Image'}</span>
                    </div>
                  </div>
                </div>

                {/* Text Meta info */}
                <div className="p-6 space-y-2 text-start bg-slate-900/90 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-400">
                      {isAr ? `نموذج الحملة #${idx + 1}` : `Campaign Asset #${idx + 1}`}
                    </span>
                    {itemTag && (
                      <span className="bg-sky-950 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-800 font-semibold text-[11px]">
                        {itemTag}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {itemTitle}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {itemDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Audited Key Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-8">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'النتائج الرئيسية المدققة (Key Results)' : 'Audited Key Results'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'أرقام حقيقية تثبت قفزة المبيعات والتفاعل' : 'Verified Commercial & Audience Growth'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'تم قياس هذه المؤشرات عبر منصات Meta Ads ومعدلات التحويل إلى سلاسل التوزيع والمتجر الإلكتروني على مدار ٨ أشهر.'
              : 'Audited across Meta Ads analytics, retail showroom orders, and direct inquiries over 8 months.'}
          </p>
        </div>

        {/* 4 Big KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {auditedMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-sky-950/30 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-sky-950/80 rounded-2xl border border-sky-500/30">
                  {metric.icon}
                </div>
                <span className="text-xs font-black text-sky-400 bg-sky-950/90 px-2.5 py-1 rounded-full border border-sky-500/40">
                  {metric.growth}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {metric.label}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                {metric.hint}
              </p>
            </div>
          ))}
        </div>

        {/* Strategic Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {retailPillars.map((pillar, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 text-start">
              <div className="inline-block text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded-full border border-sky-800">
                {pillar.badge}
              </div>
              <h4 className="text-sm font-bold text-white">
                {pillar.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Blueprint: Challenge vs Execution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Challenge */}
          <div className="bg-slate-900/90 rounded-3xl p-8 border border-rose-500/30 space-y-4 text-start relative overflow-hidden">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <h3 className="text-xl font-black text-white">
              {isAr ? 'التحدي قبل تدخل ديجيتال إفكت' : 'The Initial Bottlenecks'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'سوق الأجهزة المنزلية والتبريد في مصر والشرق الأوسط مليء بالمنافسين الكبار، وكانت صفحة بينجوين تعتمد على منشورات قديمة لا تبرز ميزات التبريد الاستوائي والمكونات الإيطالية. كما كانت تفتقر إلى فيديوهات الريلز الجذابة، وضعف توجيه المشترين للمعارض وشبكات التقسيط البنكي.'
                : 'Heavy competition from legacy appliance giants; Penguin had uninspired social creatives failing to explain its tropical cooling efficiency, lack of video demonstrations, and high friction in directing consumers to retail installment offers.'}
            </p>
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-rose-400">
                {isAr ? 'أهم الصعوبات المرصودة:' : 'Specific Obstacles:'}
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{isAr ? 'غياب الهوية البصرية الجذابة وفيديوهات الموشن جرافيك الحديثة' : 'Lack of modern 3D & motion reels demonstrating internal cooling parts'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{isAr ? 'ضعف تفعيل مواسم الشراء الكبرى (موسم الصيف وموسم المدارس)' : 'Under-leveraged peak seasonal demand cycles'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{isAr ? 'عدم استغلال الشراكات البنكية وتسهيلات التقسيط مع ValU و 2B' : 'Underutilized installment partnerships to overcome consumer hesitation'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Solution & Execution */}
          <div className="bg-slate-900/90 rounded-3xl p-8 border border-sky-500/40 space-y-4 text-start relative overflow-hidden">
            <div className="w-3 h-3 rounded-full bg-sky-400" />
            <h3 className="text-xl font-black text-white">
              {isAr ? 'استراتيجية ديجيتال إفكت للتحول والنمو' : 'Our Transformation Playbook'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'إعادة صياغة كاملة للعلامة التجارية بصرياً وتسويقياً: إطلاق حملات موسمية جذابة («الصيف الحقيقي» و«العودة للمدارس»)، تصميم منشورات 4:5 عالية الدقة، إنتاج أكثر من ١٥ فيديو موشن وريلز تفاعلي، وتفعيل إعلانات ميتا المدفوعة الموجهة للمقبلين على الزواج والمنازل مع عروض التقسيط 12 شهراً بدون فوائد.'
                : 'Complete brand repositioning: high-production seasonal campaigns, full-res 4:5 creative assets, 15+ animated motion reels, and precision-targeted Meta ad funnels tied to 12-month 0% financing partnerships with ValU and 2B stores.'}
            </p>
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-sky-400">
                {isAr ? 'أهم الخطوات المنفذة:' : 'Key Executed Initiatives:'}
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{isAr ? 'حملات موسمية مركزة ضاعفت التفاعل خلال أشهر الصيف والمدارس' : 'High-resonance seasonal campaigns scaling summer & back-to-school orders'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{isAr ? 'ترويج عروض التقسيط 0% مقدم ومصاريف بالتعاون مع ValU وموزعي 2B' : 'Aggressive 0% interest financing funnels removing purchase barriers'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{isAr ? 'إنتاج مقاطع فيديو ريلز موشن جرافيك عالية الجودة تبرز المكونات الإيطالية' : '15+ Motion reels establishing European engineering authority'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Video Showcase Section */}
      {videos.length > 0 && (
        <CaseStudyVideoSection
          videos={videos}
          title={isAr ? 'فيديوهات موشن جرافيك وريلز تفاعلية لبراند بينجوين' : 'Penguin Motion Video Reels & Showcase'}
          subtitle={isAr ? 'أكثر من ١٥ مقطع فيديو ريلز إعلاني وموشن جرافيك تم إنتاجها لنشر وعي المستهلك وتوضيح كفاءة الأجهزة والتكنولوجيا الإيطالية' : '15+ high-performing motion reels produced by Digital Effect illustrating Italian compressor tech and functional home utility'}
          badgeText={isAr ? 'فيديوهات البراند والريلز' : 'Brand Video Reels'}
          accentColor="sky"
        />
      )}

      {/* Client Quote & Testimonial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 rounded-3xl p-8 sm:p-12 border border-sky-500/30 relative overflow-hidden text-start shadow-2xl">
          <Quote className="w-16 h-16 text-sky-500/20 absolute top-6 end-6" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'شهادة العميل الشريك' : 'Partner Client Testimonial'}</span>
            </div>

            <p className="text-base sm:text-2xl font-medium text-slate-100 leading-relaxed italic">
              {isAr
                ? '«التحول الذي أحدثته ديجيتال إفكت في صفحات ومبيعات بينجوين كان مبهراً؛ نقلوا تصاميمنا ومقاطع الفيديو إلى مستوى عالمي يضاهي أكبر العلامات الإيطالية، وارتفعت طلبات منتجاتنا في منافذ التوزيع والمتجر بشكل غير مسبوق.»'
                : '“The transformation Digital Effect created for Penguin was astonishing. They elevated our creatives to international standards matching premier Italian brands, driving massive retail showroom demand.”'}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center border border-slate-700 shadow-md">
                <img
                  src="/assets/penguin/penguin_logo.png"
                  alt="Penguin Home Appliances Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isAr ? 'إدارة التسويق — شركة بينجوين للأجهزة المنزلية والتبريد' : 'Marketing Directorate — Penguin Home Appliances'}
                </div>
                <div className="text-xs text-sky-400">
                  {isAr ? 'شريك ديجيتال إفكت المعتمد' : 'Digital Effect Partner'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-sky-950/80 border border-sky-500/40 rounded-3xl p-8 sm:p-12 text-start flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-900/60 px-3 py-1 rounded-full border border-sky-400/30">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAr ? 'حلول التسويق الاستهلاكي لقطاع B2C والتجزئة' : 'B2C Consumer & Retail Marketing'}</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {isAr 
                ? 'هل تمتلك علامة تجارية أو متجر تجزئة وترغب في مضاعفة المبيعات؟' 
                : 'Ready to scale your retail brand and multiply direct consumer sales?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {isAr
                ? 'نصمم منظومات تسويق متكاملة لقطاع التجزئة والمستهلكين (B2C) تشمل بناء الهوية، إنتاج مقاطع الفيديو، إعلانات الاستهداف المتقدمة، وحملات العروض والتقسيط التي ترفع المبيعات مباشرة.'
                : 'We design full-funnel B2C growth engines spanning viral UGC & motion reels, hyper-targeted ad campaigns, and retail conversion funnels.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="w-full sm:w-auto px-7 py-4 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-2xl transition-all shadow-lg hover:shadow-sky-500/20 cursor-pointer text-center whitespace-nowrap"
            >
              {isAr ? 'حجز جلسة استراتيجية لعلامتك التجارية' : 'Book B2C Strategy Consultation'}
            </button>
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(isAr ? 'مرحباً ديجيتال إفكت، اطلعت على دراسة حالة براند بينجوين وأود مناقشة خطة نمو لعلامتي التجارية' : 'Hello Digital Effect, I reviewed the Penguin case study and would like to discuss a growth plan for my brand')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-4 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-colors text-center whitespace-nowrap"
            >
              {isAr ? 'محادثة واتساب مباشرة' : 'Direct WhatsApp'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
