import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  WashingMachine, 
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
  Gift,
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

export const YokenCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-yoken');
  const creatives = getCaseStudyCreatives('cs-b2c-yoken', currentCaseStudy);
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
      value: '+275%',
      label: isAr ? 'نمو مبيعات أجهزة المطبخ والغسيل' : 'Kitchen & Laundry Sales Growth',
      hint: isAr ? 'في معارض التوزيع ومتاجر الأجهزة الكهربائية' : 'Across retail showroom distributors nationwide',
      growth: '+275%',
      icon: <TrendingUp className="w-6 h-6 text-sky-400" />
    },
    {
      value: '4.8X',
      label: isAr ? 'العائد المستدام على الإنفاق الإعلاني (ROAS)' : 'Sustained Ad Spend ROAS',
      hint: isAr ? 'طوال مواسم الأعياد وعروض تجهيز المنازل' : 'High campaign profitability across peak retail cycles',
      growth: '4.8X ROAS',
      icon: <Zap className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '48,000+',
      label: isAr ? 'استفسارات الشراء ومنافذ البيع' : 'Direct Buying & Showroom Leads',
      hint: isAr ? 'تفاعل مباشر عبر الرسائل والتعليقات والواتساب' : 'Direct customer sizing, pricing and dealer locator inquiries',
      growth: '48K+',
      icon: <Store className="w-6 h-6 text-amber-400" />
    },
    {
      value: '2.9M+',
      label: isAr ? 'وصول الحملات الإعلانية على فيسبوك' : 'Targeted Social Campaign Reach',
      hint: isAr ? 'استهداف دقيق لربات البيوت والمقبلين على الزواج' : 'Targeted impressions reaching families and homemakers',
      growth: '2.9M+',
      icon: <Users className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'التفاعل الجماهيري والمسابقات الموسمية الواسعة' : 'Viral Interactive Contests & Community Activation',
      desc: isAr ? 'ابتكار مسابقات تفاعلية جذبت آلاف المشاركات الحقيقية، مما ضاعف التفاعل العضوي والوعي بعلامة يوكين بأقل كلفة استثمارية.' : 'High-engagement giveaway mechanics and user challenges driving organic social advocacy and household brand recall.',
      icon: <Gift className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'إبراز المواصفات الأوروبية والجودة الاقتصادية' : 'European Engineering Standards at Family-Friendly Pricing',
      desc: isAr ? 'صياغة رسائل تقنية واضحة تشرح مميزات محركات الإنفرتر وكفاءة استهلاك المياه والكهرباء مع الحفاظ على سعر منافس.' : 'Transparent product feature communication emphasizing inverter motor longevity, low utility consumption, and affordability.',
      icon: <WashingMachine className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'شبكة الصيانة المعتمدة وراحة بال المستهلك' : 'Certified Nationwide Warranty & Peace-of-Mind Support',
      desc: isAr ? 'تبديد أي تردد لدى المشترين عبر إبراز شهادات الضمان المعتمد والخط الساخن وتوافر قطع الغيار الأصلية بكافة المحافظات.' : 'Dismantling buyer hesitation with prominent warranty certificates, fast-response hotline service, and genuine spare parts.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'تنشيط معارض الموزعين ومنافذ التجزئة' : 'Retail Distributor Footfall & Direct Purchase Routing',
      desc: isAr ? 'أتمتة خدمة الرد السريع على استفسارات الأسعار والمقاسات وتوجيه كل عميل إلى أقرب معرض أجهزة معتمد في منطقته.' : 'Automated dimensional support directing interested shoppers to nearest local dealers for immediate in-store checkout.',
      icon: <Store className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة يوكين للأجهزة المنزلية (Yoken) — ترسيخ الحضور الرقمي ومضاعفة المبيعات | ديجيتال إفكت' : 'Yoken Home Appliances Case Study | Digital Effect'}
        description={isAr ? 'كيف طوّرت ديجيتال إفكت المنظومة التسويقية لشركة يوكين للأجهزة المنزلية والغسالات، لتحقيق نمو مبيعات بنسبة +275% ووصول 2.9M+ أسرة وعائد إعلاني 4.8X ROAS.' : 'How Digital Effect scaled Yoken Home Appliances achieving 4.8X ROAS, +275% sales growth, and 2.9M+ family reach.'}
        image="/assets/portfolio_crops/card_yoken.png"
        imageAlt={isAr ? 'دراسة حالة يوكين للأجهزة المنزلية والغسالات - ديجيتال إفكت' : 'Yoken Home Appliances Case Study - Digital Effect'}
        urlPath="#yoken-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع الأجهزة المنزلية والغسالات (B2C Home Appliances)' : 'Home Appliances & Consumer Goods'}
        tags={['يوكين', 'Yoken Appliances', 'غسالات يوكين', 'أجهزة مطابخ', 'تسويق الأجهزة المنزلية', 'ديجيتال إفكت', 'Digital Effect Retail']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Yoken Home Appliances Digital Scaling Case Study — Digital Effect',
          description: 'Scaling home and kitchen appliance retail demand, interactive family activations, and distributor showroom footfall with 4.8X sustained ROAS.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_yoken.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_yoken.png',
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
            name: 'Yoken Home Appliances',
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
              {isAr ? 'يوكين للأجهزة المنزلية (Yoken)' : 'Yoken Appliances'}
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
            src="/assets/yoken-2/yoken_hero_bg.jpg" 
            alt="Yoken Luxury Kitchen and Laundry Appliances Background" 
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
                <WashingMachine className="w-3.5 h-3.5" />
                {isAr ? 'دراسة حالة B2C — الأجهزة المنزلية والغسالات' : 'B2C Case Study — Kitchen & Laundry Appliances'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isAr ? 'نتائج بيعية وتفاعلية موثقة' : 'Audited Growth Results'}
              </span>
              <span className="text-xs text-slate-400">
                {isAr ? 'المدة: ٦ أشهر من الحملات المكثفة' : 'Duration: 6 Months Intensive Campaigns'}
              </span>
            </div>

            {/* Client Logo Card */}
            <div className="inline-flex items-center gap-4 p-3 pr-4 pl-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md mb-6 shadow-2xl">
              <div className="h-12 w-28 bg-white/95 rounded-xl flex items-center justify-center p-2 shadow-inner">
                <img 
                  src="/assets/yoken-2/yoken-2_img_1.png" 
                  alt="Yoken Logo" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="border-r border-slate-700 pr-4">
                <div className="text-xs text-sky-400 font-semibold">{isAr ? 'العميل التجاري' : 'Client Profile'}</div>
                <div className="text-sm font-bold text-white">{isAr ? 'شركة يوكين للأجهزة المنزلية والكهربائية' : 'Yoken Home Appliances'}</div>
                <div className="text-xs text-slate-400">{isAr ? 'الغسالات، أجهزة المطبخ، والمسطحات والشفاطات' : 'Washing Machines, Kitchen & Household Tech'}</div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {isAr ? (
                <>
                  ترسيخ الحضور الرقمي وزيادة مبيعات أجهزة المطبخ والغسالات المنزلية
                </>
              ) : (
                <>
                  Digital Presence Scaling & Direct Consumer Demand for Kitchen & Laundry Appliances
                </>
              )}
            </h1>

            {/* Subtitle / Overview */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              {isAr 
                ? 'كيف طوّرت ديجيتال إفكت المنظومة الترويجية لشركة يوكين، عبر حملات محتوى تفاعلية ومسابقات كبرى وإعلانات استهداف تبرز المواصفات الأوروبية وشبكة الصيانة، لتحقيق نمو مبيعات بنسبة +275% ووصول أكثر من 2.9 مليون أسرة.'
                : 'How Digital Effect revitalized Yoken Home Appliances’ retail presence and consumer demand through viral activations, precision performance ads, and certified service reassurance, driving +275% sales growth.'
              }
            </p>

            {/* Services Executed Tags */}
            <div className="mb-8">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Delivered:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  isAr ? 'تصميم الحملات والمنشورات التفاعلية' : 'Interactive Campaign & Social Visuals',
                  isAr ? 'إدارة الحملات الإعلانية المدفوعة على منصات التواصل' : 'Targeted Social Performance Advertising',
                  isAr ? 'كتابة المحتوى التسويقي المعزز للثقة والمواصفات' : 'Trust-Building Consumer Copywriting',
                  isAr ? 'تغطية عروض الموزعين ومنافذ البيع' : 'Retail Network Promotion & Outreach',
                  isAr ? 'المسابقات الموسمية وتجهيز منازل العرائس' : 'Seasonal Giveaways & Bridal Activations'
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
              clientName={isAr ? 'يوكين للأجهزة المنزلية والغسالات' : 'Yoken Home Appliances'}
            />
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'معرض التصاميم الإعلانية والحملات البصرية' : 'Campaign Creatives & Visual Gallery'}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                {isAr ? 'أعمال الحملة: إعلانات عصرية تبرز كفاءة الأجهزة والمسابقات' : 'The Creative Work: Modern Appliance Ads & High-Engagement Activations'}
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {isAr 
                ? 'انقر على أي تصميم لمشاهدته بالحجم الكامل واستعراض استراتيجية الإخراج البصري وصياغة المحتوى التفاعلي.'
                : 'Click any visual to inspect full resolution, creative direction, and social giveaway copywriting.'
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
              {isAr ? 'نتائج بيعية وتفاعلية عززت مكانة يوكين السوقية' : 'Direct Performance Metrics Accelerating Retail Reach'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {isAr 
                ? 'خلال ٦ أشهر من الحملات الرقمية وإدارة المسابقات، سجلت يوكين طفرة استثنائية في تدفق المشترين لشبكة المعارض وتجار الأجهزة.'
                : 'Across 6 months of interactive social campaigns and retail dealer promotion, Yoken recorded peak demand across governorates.'
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
                {isAr ? 'تجديد الثقة بمنتجات يوكين وتجاوز المنافسة السعرية الحادة' : 'Refreshing Consumer Trust & Standing Out in Saturated Appliance Retail'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'احتاجت شركة يوكين إلى إعادة بناء الوعي بالعلامة التجارية وتحديث انطباع المستهلكين حول مواصفات أجهزتها المنزلية المتطورة، في ظل منافسة شرسة من ماركات آسيوية مستوردة وتخوف العائلات من صعوبة الصيانة وتوافر قطع الغيار الأصلية.'
                  : 'Yoken required a strategic brand revitalization to shift consumer perception towards its modern European build standards and reassure families regarding nationwide service and authentic spare parts availability.'
                }
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'حاجة لزيادة التفاعل العضوي والارتباط العاطفي للعلامة مع ربات البيوت والأسر.' : 'The need to build active engagement and household brand loyalty across digital channels.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'توضيح مميزات غسالات الإنفرتر وأجهزة المطبخ بلغة عملية وسهلة الفهم.' : 'Communicating technical inverter features and energy efficiency in practical relatable terms.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{isAr ? 'توجيه آلاف الاستفسارات المباشرة إلى منافذ التوزيع ومعارض الأجهزة المعتمدة.' : 'Converting online social interactions into physical showroom store visits.'}</span>
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
                {isAr ? 'مسابقات تفاعلية واسعة الانتشار، صياغة محتوى معزز للثقة، وأتمتة مسارات الشراء' : 'Viral Interactive Activations, Trust-Centric Content & Fast Showroom Funnels'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'أطلقت ديجيتال إفكت حملة رقمية متعددة المحاور تجمع بين المسابقات التفاعلية التي حفزت ملايين المشاهدات ومئات آلاف التعليقات، مع نشر محتوى بصري احترافي يركز على الضمان المعتمد والمحركات الاقتصادية وتوجيه العملاء لأقرب موزع في ثوانٍ.'
                  : 'Digital Effect executed a multi-layered campaign combining gamified giveaways and user contests that captured millions of impressions, paired with feature-centric creative storytelling validating durability and seamless dealer lookups.'
                }
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'إطلاق مسابقات موسمية ضاعفت معدلات التفاعل العضوي وربطت الأسر بمنتجات يوكين.' : 'High-impact giveaway activations multiplying organic sharing and positive sentiment.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'إبراز مراكز الصيانة المعتمدة وشهادات الضمان وقطع الغيار الأصلية.' : 'Showcasing authorized warranty centers and fast-turnaround customer service.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold mt-0.5">✓</span>
                  <span>{isAr ? 'أتمتة دليل الموزعين عبر الرسائل لتزويد المتسوقين بمواقع المعارض فوراً.' : 'Automated messaging triage guiding buyers directly to partner dealer showrooms.'}</span>
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
              {isAr ? 'أربعة محاور جوهرية حققت الطفرة التسويقية لشركة يوكين' : 'Four Core Pillars That Delivered Unprecedented Brand Impact'}
            </h2>
            <p className="text-sm text-slate-400">
              {isAr 
                ? 'استندت استراتيجية ديجيتال إفكت إلى تكامل التفاعل الجماهيري الإيجابي مع الثقة الهندسية وسهولة الشراء.'
                : 'A cohesive framework combining viral community engagement, certified reliability, and localized retail guidance.'
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
                "فريق ديجيتال إفكت أحدث نقلة نوعية في تفاعل الجمهور مع منتجاتنا؛ تصاميمهم الاحترافية وإدارتهم للمسابقات وحملات التوعية جعلت علامة يوكين حاضرة بقوة أمام ملايين الأسر وتضاعف الطلب لدى الموزعين."
              </>
            ) : (
              <>
                "Digital Effect modernized how households engage with our appliances; their creative direction, giveaway activations, and warranty messaging elevated Yoken across retail shelves nationwide."
              </>
            )}
          </blockquote>
          <div className="inline-flex flex-col items-center">
            <span className="font-bold text-white text-base">
              {isAr ? 'إدارة التسويق والتطوير' : 'Marketing & Growth Directorate'}
            </span>
            <span className="text-xs text-sky-400">
              {isAr ? 'شركة يوكين للأجهزة المنزلية والكهربائية' : 'Yoken Home Appliances'}
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
              {isAr ? 'هل ترغب في ترسيخ حضور علامتك المنزلية وتنشيط مبيعات شبكة الموزعين؟' : 'Ready to Elevate Your Appliance Brand & Drive Showroom Velocity?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
              {isAr 
                ? 'فريق ديجيتال إفكت متخصص في بناء الحملات الترويجية عالية العائد لشركات الأجهزة الاستهلاكية، من صياغة الإعلانات الجذابة إلى أتمتة تدفق المشترين للمعاطف ونقاط البيع.'
                : 'Digital Effect specializes in engineering high-impact retail marketing engines for home appliance brands, bridging creative branding with measurable dealer sales growth.'
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
              <span>{isAr ? 'تصميم حصري لشركة يوكين للأجهزة المنزلية' : 'Exclusive Creative for Yoken Home Appliances'}</span>
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
