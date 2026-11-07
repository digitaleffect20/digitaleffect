import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  Flame, 
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
  ChefHat,
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

export const HamburgCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-hamburg');
  const creatives = getCaseStudyCreatives('cs-b2c-hamburg', currentCaseStudy);
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
      value: '+260%',
      label: isAr ? 'نمو مبيعات المسطحات والأفران البلت-إن' : 'Built-In Appliance Sales Growth',
      hint: isAr ? 'قفزة غير مسبوقة في مبيعات المسطحات الزجاجية وأفران الغاز' : 'Direct surge across glass cooktops and built-in ovens',
      growth: '+260%',
      icon: <TrendingUp className="w-6 h-6 text-amber-400" />
    },
    {
      value: '4.9X',
      label: isAr ? 'العائد المستدام على الإنفاق الإعلاني (ROAS)' : 'Sustained Ad Spend ROAS',
      hint: isAr ? 'أداء ثابت ومرتفع طوال فترات حملات تخفيضات الصيف والشتاء' : 'Consistently profitable return across seasonal flash campaigns',
      growth: '4.9X ROAS',
      icon: <Zap className="w-6 h-6 text-sky-400" />
    },
    {
      value: '72,000+',
      label: isAr ? 'تفاعل واستفسار شراء مؤكد' : 'Direct Consumer Inquiries & Orders',
      hint: isAr ? 'رسائل استفسار عن المقاسات، الأسعار، وأماكن أقرب الموزعين' : 'High-intent dimensions, pricing, and dealer locator requests',
      growth: '72K+',
      icon: <Users className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '1.6M+',
      label: isAr ? 'وصول لراغبي تجديد المطابخ والمقبلين على الزواج' : 'Targeted Homeowner & Renovation Reach',
      hint: isAr ? 'استهداف دقيق للمهتمين بالديكور والتجهيزات المنزلية الفاخرة' : 'Precision audience targeting home renovators and newly-weds',
      growth: '1.6M+',
      icon: <Store className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'إبراز جمالية المطابخ المودرن والاندماج المعماري' : 'Built-in Architectural Aesthetics & Space Optimization',
      desc: isAr ? 'تصميم مشاهد إعلانية ثلاثية وتصوير واقعي يبرز كيف يندمج مسطح وفرن هامبورج بأناقة فائقة داخل الرخام وخشب المطبخ.' : 'High-end visual staging demonstrating how Hamburg built-in appliances seamlessly integrate into modern marble and custom cabinetry.',
      icon: <ChefHat className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'ترسيخ الأمان الإيطالي الكامل والمواصفات المعتمدة' : 'Full Gas Thermal Safety & Certified Durability',
      desc: isAr ? 'تبديد مخاوف العملاء حول أمان الغاز وسهولة الصيانة عبر محتوى تقني واضح يشرح عمل حساسات الأمان والإشعال الذاتي السريع.' : 'Overcoming consumer friction regarding gas safety via transparent technical highlights on thermal cut-off valves and easy cleaning.',
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'باقات التجهيز الشامل ومضاعفة سلة الشراء' : 'Kitchen Suite Bundles & High Basket Value (AOV)',
      desc: isAr ? 'ابتكار باقات الأطقم (مسطح + شفاط + فرن) بعرض سعري مغرٍ يسهل على المقبلين على الزواج اتخاذ قرار التجهيز الكامل دفعة واحدة.' : 'Strategic bundle offers pairing matching hobs, chimney hoods, and ovens to maximize average purchase order and retail ticket size.',
      icon: <Flame className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'مسار الاستفسار الفوري وتوجيه المقاسات للموزعين' : 'Instant Sizing Consultation & Dealer Referral Funnel',
      desc: isAr ? 'تأهيل سريع للاستفسارات حول المقاسات (60 سم / 90 سم) وتوجيه العميل فورا إلى أقرب معرض أو إتاحة الشراء والتوصيل المنزلي.' : 'Automated inbound lead routing answering dimensional specifications and navigating buyers to their closest authorized showroom.',
      icon: <Zap className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة هامبورج للأجهزة المنزلية (Hamburg) — حملات البلت-إن ومضاعفة المبيعات | ديجيتال إفكت' : 'Hamburg Home Appliances Case Study | Digital Effect'}
        description={isAr ? 'كيف طوّرت ديجيتال إفكت الحملات الرقمية وهوية أجهزة المطابخ البلت-إن لشركة هامبورج للأجهزة المنزلية لتحقيق عائد إعلاني 4.9X ونمو مبيعات بنسبة 260%.' : 'How Digital Effect scaled Hamburg Home Appliances built-in kitchen campaigns achieving 4.9X ROAS and +260% sales growth.'}
        image="/assets/portfolio_crops/card_hamburg.png"
        imageAlt={isAr ? 'دراسة حالة هامبورج للأجهزة المنزلية والبلت-إن - ديجيتال إفكت' : 'Hamburg Built-in Appliances Case Study - Digital Effect'}
        urlPath="#hamburg-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع الأجهزة المنزلية والمطابخ (B2C Home Appliances)' : 'Kitchen Appliances & Consumer Goods'}
        tags={['هامبورج', 'Hamburg Appliances', 'أجهزة بلت إن', 'مسطحات غاز', 'شفاطات مطابخ', 'تسويق أجهزة منزلية', 'ديجيتال إفكت', 'Digital Effect Retail']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Hamburg Home Appliances Built-in Scale Case Study — Digital Effect',
          description: 'Scaling built-in kitchen appliance marketing and retail distribution network with 4.9X sustained ROAS.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_hamburg.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_hamburg.png',
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
            name: 'Hamburg Home Appliances',
            areaServed: 'Egypt & Consumer Retail'
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
              {isAr ? 'هامبورج للأجهزة المنزلية (Hamburg)' : 'Hamburg Appliances'}
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
            </button>
            {shareToast && (
              <span className="text-xs text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-md animate-fade-in">
                {isAr ? 'تم نسخ الرابط!' : 'Link copied!'}
              </span>
            )}

            <button
              onClick={() => setCurrentPage('b2c')}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors"
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
            src="/assets/hamburg-social/hamburg_hero_bg.jpg" 
            alt="Hamburg Luxury Kitchen Appliances Background" 
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
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ChefHat className="w-3.5 h-3.5" />
                {isAr ? 'دراسة حالة B2C — الأجهزة المنزلية والبلت-إن' : 'B2C Case Study — Built-in Home Appliances'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isAr ? 'نتائج بيعية موثقة' : 'Audited Sales Growth'}
              </span>
              <span className="text-xs text-slate-400">
                {isAr ? 'المدة: ٥ أشهر من الحملات المكثفة' : 'Duration: 5 Months Intensive Campaigns'}
              </span>
            </div>

            {/* Client Logo Card */}
            <div className="inline-flex items-center gap-4 p-3 pr-4 pl-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md mb-6 shadow-2xl">
              <div className="h-12 w-28 bg-white/95 rounded-xl flex items-center justify-center p-2 shadow-inner">
                <img 
                  src="/assets/hamburg-social/hamburg-social_img_1.png" 
                  alt="Hamburg Logo" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="border-r border-slate-700 pr-4">
                <div className="text-xs text-amber-400 font-semibold">{isAr ? 'العميل التجاري' : 'Client Profile'}</div>
                <div className="text-sm font-bold text-white">{isAr ? 'شركة هامبورج للأجهزة المنزلية والإلكترونية' : 'Hamburg Home Appliances'}</div>
                <div className="text-xs text-slate-400">{isAr ? 'المسطحات، الشفاطات، وأفران البلت-إن العصرية' : 'Built-in Cooktops, Hoods & Ovens'}</div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {isAr ? (
                <>
                  حملات العروض الكبرى وتوسيع شبكة البيع المباشر للمستهلكين ومضاعفة مبيعات البلت-إن
                </>
              ) : (
                <>
                  Mega Promotional Campaigns & Direct Consumer Retail Scaling for Built-in Appliances
                </>
              )}
            </h1>

            {/* Subtitle / Overview */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              {isAr 
                ? 'كيف طوّرت ديجيتال إفكت المنظومة الإعلانية والتسويقية لشركة هامبورج، عبر تصاميم جذابة لأجهزة المطابخ البلت-إن وحملات استهداف لراغبي التجديد والمقبلين على الزواج، لتحقيق نمو مبيعات بنسبة +260% وعائد إعلاني 4.9X ROAS.'
                : 'How Digital Effect scaled Hamburg Home Appliances’ retail and built-in sales via high-impact visual campaigns and targeted renovation funnels, delivering +260% sales growth and 4.9X sustained ROAS.'
              }
            </p>

            {/* Services Executed Tags */}
            <div className="mb-8">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Delivered:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  isAr ? 'تصميم الحملات الترويجية لأجهزة المطابخ' : 'Built-in Kitchen Creative Ads',
                  isAr ? 'إعلانات الاستهداف للراغبين في تجديد المطابخ' : 'Home Renovation Audience Advertising',
                  isAr ? 'صياغة المحتوى التسويقي لمزايا الأمان والمواصفات' : 'Safety & Technical Feature Copywriting',
                  isAr ? 'أتمتة خدمة الرد السريع على استفسارات الأسعار والمقاسات' : 'Rapid Sizing & Price Inquiry Routing',
                  isAr ? 'حملات تخفيضات الصيف ومواسم تجهيز العرائس' : 'Seasonal Appliance Flash Sale Campaigns'
                ].map((srv, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    <Check className="w-3 h-3 text-amber-400" />
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{isAr ? 'احجز استشارة B2C لعلامتك التجارية' : 'Book a B2C Consultation'}</span>
              </button>

              <button
                onClick={() => setCurrentPage('b2c')}
                className="px-5 py-3.5 rounded-xl text-sm font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>{isAr ? 'استعراض باقات قطاع B2C' : 'Explore B2C Packages'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4 text-amber-400" /> : <ArrowRight className="w-4 h-4 text-amber-400" />}
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
              clientName={isAr ? 'هامبورج للأجهزة المنزلية والبلت-إن' : 'Hamburg Built-in Appliances'}
            />
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'معرض التصاميم الإعلانية والحملات البصرية' : 'Campaign Creatives & Visual Gallery'}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                {isAr ? 'أعمال الحملة: إعلانات عصرية تعكس فخامة المطبخ الحديث' : 'The Creative Work: Modern Appliance Ads That Convert'}
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {isAr 
                ? 'انقر على أي تصميم لمشاهدته بالحجم الكامل واستعراض استراتيجية الإخراج الفني وصياغة الرسائل الترويجية.'
                : 'Click any visual to inspect full resolution, creative direction, and promotional copywriting strategy.'
              }
            </p>
          </div>

          {/* Grid of Creatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatives.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveLightboxImg({ url: item.url, title: item.title, desc: item.desc })}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
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
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Maximize2 className="w-3.5 h-3.5" />
                      {isAr ? 'عرض بدقة كاملة' : 'View Full Image'}
                    </span>
                  </div>

                  {/* Top Tag Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900/90 text-amber-300 border border-slate-700/80 backdrop-blur-sm">
                      {item.tag}
                    </span>
                  </div>
                </div>

                {/* Caption Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      {isAr ? 'تصميم إعلاني معتمد' : 'Verified Ad Creative'}
                    </span>
                    <span className="text-amber-400 font-semibold group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
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
              {isAr ? 'نتائج بيعية وتفاعلية ضاعفت حصة هامبورج السوقية' : 'Quantifiable Results Fueling Market Share Expansion'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {isAr 
                ? 'خلال ٥ أشهر من تفعيل منظومة الإعلانات الاستراتيجية، سجّلت شركة هامبورج قفزات ملحوظة في حجم الطلبات المباشرة والتوريد لتجار الأجهزة.'
                : 'Across 5 months of precision-targeted creative funnels, Hamburg recorded record dealer re-orders and direct buyer conversions.'
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
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
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
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 block">
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
                {isAr ? 'تردد المستهلكين تجاه تركيب البلت-إن والمنافسة السعرية الحادة' : 'Consumer Hesitation Over Built-in Fitting & Stiff Market Price Wars'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'رغم الجودة العالية لمنتجات هامبورج، واجهت العلامة تحدي تردد العملاء في التحول إلى الأجهزة البلت-إن بسبب تخوفات المقاسات وتعديلات الرخام، بالإضافة إلى تزاحم العلامات التجارية في موسم التجهيزات وضرورة إثبات كفاءة الأمان الكامل للغاز.'
                  : 'Despite superior engineering, Hamburg faced hesitation among prospective homeowners fearing cabinet modification costs, gas safety, and intense competition from imported high-priced legacy brands.'
                }
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'تخوف العملاء من صعوبة تركيب وصيانة المسطحات والأفران داخل الكبائن.' : 'Friction regarding kitchen cut-out dimensions and installation complexity.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'تأخر الرد على استفسارات الأسعار والمقاسات مما أدى لفقدان مشترين جادين.' : 'Slow response times to inbound dimension questions leading to lost sales.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'الحاجة لحملات عروض تخفيضية جذابة ترفع معدل بيع الأطقم الكاملة (Bundles).' : 'The necessity for irresistible bundle offers to drive 3-piece kitchen suite checkouts.'}</span>
                </li>
              </ul>
            </div>

            {/* Solution Card */}
            <div className="p-8 rounded-3xl bg-amber-950/20 border border-amber-900/40 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-900/40 text-amber-300 border border-amber-800/60 mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'حل وتدخل ديجيتال إفكت' : 'The Digital Effect Solution'}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {isAr ? 'إخراج بصري فائق الأناقة، باقات أطقم مغرية، ومسار استفسار آلي فوري' : 'Cinematic Kitchen Visuals, Suite Bundles & Rapid Response Lead Funnel'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'بنت ديجيتال إفكت حملة رقمية تركز على إبراز جمالية المطبخ العصري الكامل بأجهزة هامبورج، مع شرح مبسط لمزايا الأمان الإيطالي، وإطلاق عروض الخصم المجمع، وتفعيل روبوت استفسار فوري يزود العميل بالمقاسات وأماكن الشراء في ثوانٍ معدودة.'
                  : 'Digital Effect engineered an end-to-end performance engine staging Hamburg appliances in luxury architectural kitchens, launching suite bundles, and automating sizing guides for instant buyer conversion.'
                }
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'تصوير وإخراج بصري احترافي يضع أجهزة هامبورج في مصاف الماركات العالمية الفاخرة.' : 'Editorial-grade visual staging positioning Hamburg alongside tier-1 international brands.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'أتمتة دليل المقاسات والمواصفات للرد الفوري على كل تعليق ورسالة في السوشيال ميديا.' : 'Automated dimensional lookups routing buyers to nearest certified distributors.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'حملات استهداف طبقي وجغرافي للمقبلين على الزواج وراغبي تجديد الوحدات السكنية.' : 'Precision demographic targeting capturing high-intent renovation and bridal shoppers.'}</span>
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
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 block">
              {isAr ? 'ركائز النجاح' : 'Strategic Pillars'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'أربعة محاور جوهرية حققت الفارق لشركة هامبورج' : 'Four Core Pillars That Delivered Breakthrough Retail Scale'}
            </h2>
            <p className="text-sm text-slate-400">
              {isAr 
                ? 'استندت استراتيجية ديجيتال إفكت إلى تكامل الصورة البصرية الجذابة مع الأمان الهندسي وسرعة تحويل المهتمين إلى مشترين.'
                : 'A cohesive convergence of luxury visual appeal, engineered gas safety, and automated retail routing.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategicPillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex gap-4 items-start"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Quote className="w-12 h-12 text-amber-400/40 mx-auto mb-6" />
          <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-200 leading-relaxed mb-6">
            {isAr ? (
              <>
                "تصاميم ديجيتال إفكت جعلت أجهزة هامبورج تظهر بأعلى معايير الأناقة والعملية؛ استطعنا من خلال هذه الحملات إبراز جودة منتجاتنا البلت-إن وتضاعفت طلبات الموزعين وتجار الأجهزة في وقت قياسي."
              </>
            ) : (
              <>
                "Digital Effect visuals portrayed Hamburg appliances with ultimate modern elegance and practicality. Through these campaigns, our built-in range achieved unprecedented demand, doubling retail dealer orders nationwide."
              </>
            )}
          </blockquote>
          <div className="inline-flex flex-col items-center">
            <span className="font-bold text-white text-base">
              {isAr ? 'إدارة المبيعات والتسويق' : 'Sales & Marketing Directorate'}
            </span>
            <span className="text-xs text-amber-400">
              {isAr ? 'شركة هامبورج للأجهزة المنزلية والإلكترونية' : 'Hamburg Home Appliances'}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 7: Bottom CTA Box */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'جاهز لتحقيق نفس النجاح؟' : 'Ready for Exponential Retail Growth?'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'هل ترغب في مضاعفة مبيعات أجهزتك المنزلية أو منتجاتك الاستهلاكية؟' : 'Ready to Multiply Your Consumer Product & Retail Sales?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
              {isAr 
                ? 'فريق ديجيتال إفكت متخصص في إطلاق وإدارة الحملات البيعية عالية العائد لشركات الأجهزة والمنتجات الاستهلاكية، من صياغة العروض إلى أتمتة تدفق المشترين.'
                : 'Digital Effect specializes in engineering high-ROAS marketing campaigns for consumer brands and home appliance manufacturers from creative inception to automated retail conversion.'
              }
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{isAr ? 'احجز جلستك الاستشارية الاستراتيجية الآن' : 'Book Your Strategic Consultation Now'}</span>
              </button>
              <button
                onClick={() => setCurrentPage('case-studies')}
                className="px-6 py-4 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>{isAr ? 'استعراض المزيد من دراسات الحالة' : 'Explore More Case Studies'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4 text-amber-400" /> : <ArrowRight className="w-4 h-4 text-amber-400" />}
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
              <span>{isAr ? 'تصميم حصري لشركة هامبورج للأجهزة المنزلية' : 'Exclusive Creative for Hamburg Home Appliances'}</span>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
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
