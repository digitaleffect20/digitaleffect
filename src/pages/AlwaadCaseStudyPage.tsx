import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  Plane, 
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
  MessageCircle, 
  Compass,
  MapPin,
  Calendar,
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

export const AlwaadCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-alwaad-travel');
  const creatives = getCaseStudyCreatives('cs-b2c-alwaad-travel', currentCaseStudy);
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
      value: '+340%',
      label: isAr ? 'حجز برامج سياحية وعمرة كاملة المقاعد' : 'Fully Booked Tour Departures',
      hint: isAr ? 'إشغال كامل لمقاعد الطيران والفنادق المحجوزة مسبقاً' : '100% seat occupancy across scheduled flights & central hotels',
      growth: '+340%',
      icon: <Plane className="w-6 h-6 text-sky-400" />
    },
    {
      value: '38,500+',
      label: isAr ? 'محادثات واستفسارات حجز فورية عبر الواتساب' : 'Direct Inbound WhatsApp Booking Chats',
      hint: isAr ? 'تواصل فوري مع راغبي الحجز من مصر والخليج' : 'Immediate high-intent prospective traveler chat inquiries',
      growth: '38,500+',
      icon: <MessageCircle className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '48%',
      label: isAr ? 'انخفاض تكلفة حجز المقعد السياحي (CPA)' : 'Cost Per Booking Reduction',
      hint: isAr ? 'رفع دقة الاستهداف وخفض الهدر الإعلاني' : 'Substantial ad efficiency via hyper-targeted demographic funnels',
      growth: '-48% Cost',
      icon: <TrendingUp className="w-6 h-6 text-amber-400" />
    },
    {
      value: '4.9X',
      label: isAr ? 'العائد الإعلاني لمواسم العمرة والعطلات (ROAS)' : 'Seasonal Tour Ad ROAS',
      hint: isAr ? 'معدل ربحية استثنائي على باقات السفر المتميزة' : 'High-margin return on investment for high-ticket travel programs',
      growth: '4.9X ROAS',
      icon: <Zap className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'مسارات التحويل اللحظي عبر الواتساب (Click-to-WhatsApp)' : 'Instant Click-to-WhatsApp Conversation Funnels',
      desc: isAr ? 'تجاوز النماذج التقليدية المعقدة وتوجيه كل عميل محتمل بنقرة واحدة إلى شات واتساب مع مستشار سياحي يجيب عن الأسعار فوراً.' : 'Bypassing cumbersome lead forms by channeling ad clicks directly into live WhatsApp dialogues with travel concierges within seconds.',
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'الشفافية الكاملة في تفاصيل الفنادق ومسافة الحرم المكي' : 'Radical Transparency on Itineraries & Haram Distance',
      desc: isAr ? 'إبراز أسماء الفنادق الحقيقية، المسافة الدقيقة للأبواب، ونوعية الحافلات مما بدّد الشكوك وزاد من ثقة الأسر في برامج الوعد.' : 'Displaying verified hotel names, walking distances to Haram gates, and luxury bus models to eliminate buyer ambiguity and establish credibility.',
      icon: <MapPin className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'إدارة مواسم الذروة وسد المقاعد المتبقية (Flash Urgency)' : 'Peak Departure Management & Last-Seat Flash Urgency',
      desc: isAr ? 'إطلاق حملات سريعة قبل موعد الإقلاع بـ 10 أيام للمقاعد الشاغرة بأسعار خاصة تضمن عدم تسيير أي رحلة دون اكتمال العدد.' : 'Deploying dynamic countdown ad creatives 10 days before departure to eliminate empty seat leakage and maximize charter margins.',
      icon: <Calendar className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'إعادة استهداف العائلات وقوائم المعتمرين السابقين' : 'Retargeting Past Pilgrims & Family Holiday Cohorts',
      desc: isAr ? 'بناء جماهير مخصصة (Custom Audiences) من المسافرين السابقين لتقديم عروض تفضيلية للمواسم التالية بتكلفة اكتساب شبه معدومة.' : 'Leveraging past traveler CRM segments to cross-sell upcoming seasonal retreats and Umrah departures at near-zero ad acquisition cost.',
      icon: <Users className="w-5 h-5 text-indigo-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة الوعد للسياحة (AlWaad Travel) — حجز رحلات العمرة والسياحة | ديجيتال إفكت' : 'AlWaad Travel & Tourism Case Study | Digital Effect'}
        description={isAr ? 'كيف ضاعفت ديجيتال إفكت حجوزات رحلات العمرة والسياحة لشركة الوعد بنسبة +340% عبر مسارات الواتساب المباشرة بعائد إعلاني 4.9X ROAS.' : 'How Digital Effect scaled AlWaad Travel bookings by +340% with 38,500+ direct WhatsApp inquiries and 4.9X ROAS across Umrah and holiday funnels.'}
        image="/assets/portfolio_crops/card_alwaad.png"
        imageAlt={isAr ? 'دراسة حالة شركة الوعد للسياحة والسفر ورحلات العمرة - ديجيتال إفكت' : 'AlWaad Travel Case Study - Digital Effect'}
        urlPath="#alwaad-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع السياحة والسفر ورحلات العمرة (B2C Travel & Tourism)' : 'Travel, Tourism & Umrah Pilgrimages'}
        tags={['الوعد للسياحة', 'AlWaad Travel', 'رحلات العمرة', 'حجز رحلات سياحية', 'إعلانات السياحة', 'تسويق السفر', 'ديجيتال إفكت']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'AlWaad Travel Umrah & Holiday Booking Scale Case Study — Digital Effect',
          description: 'High-intent digital marketing funnels scaling travel and Umrah bookings by +340% with 38,500+ direct WhatsApp chats and 4.9X ROAS.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_alwaad.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_alwaad.png',
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
            name: 'AlWaad Travel & Tourism',
            areaServed: 'Egypt & Middle East'
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
              {isAr ? 'الوعد للسياحة والسفر (AlWaad)' : 'AlWaad Travel'}
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
            src="/assets/alwaad-travel/alwaad_hero_bg.jpg" 
            alt="AlWaad Travel Holy Kaaba & Mecca Spiritual Landscape Background" 
            className="w-full h-full object-cover object-center lg:object-right"
          />
          {/* Gradients ensuring high-contrast readable negative space for typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Sector & Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6 backdrop-blur-sm">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'قطاع B2C — السياحة والسفر وبرامج العمرة' : 'B2C Sector — Travel, Tourism & Umrah Tours'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60" />
              <span>{isAr ? 'نتائج موثقة رسمياً' : 'Audited Results'}</span>
            </div>

            {/* Client Logo & Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-700/60 shadow-lg">
                <img 
                  src="/assets/alwaad-travel/alwaad-travel_img_1.png" 
                  alt="AlWaad Travel Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                  {isAr ? 'العميل التجاري' : 'Travel Client'}
                </p>
                <h2 className="text-lg font-bold text-slate-200">
                  {isAr ? 'شركة الوعد للسياحة والسفر' : 'AlWaad Travel & Tourism'}
                </h2>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              {isAr 
                ? 'حجز أفواج رحلات العمرة والبرامج السياحية بأعلى إشغال وأسرع تحويل عبر الواتساب' 
                : 'Scaling Umrah & Leisure Tour Occupancy via High-Converting WhatsApp Funnels'}
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 font-normal">
              {isAr
                ? 'كيف طوّرت ديجيتال إفكت المنظومة الإعلانية لشركة الوعد للسياحة والسفر؛ محققة نمو حجز المقاعد بنسبة +340%، وأكثر من 38,500 محادثة حجز مباشرة، مع خفض تكلفة اكتساب العميل بنسبة 48% وعائد إعلاني 4.9X ROAS.'
                : 'How Digital Effect engineered hyper-targeted tourism funnels for AlWaad Travel, scaling departure occupancy by +340%, driving 38,500+ direct WhatsApp booking chats, cutting booking costs by 48% with 4.9X ROAS.'}
            </p>

            {/* Services Rendered Badges */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-400 mb-3">
                {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Delivered:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  isAr ? 'تصميم حملات البرامج السياحية ورحلات العمرة' : 'Umrah & Tour Program Creatives',
                  isAr ? 'مسارات التحويل الفوري المباشر عبر الواتساب' : 'Click-to-WhatsApp Performance Funnels',
                  isAr ? 'كتابة المحتوى التسويقي التحفيزي للأفواج' : 'High-Urgency Travel Copywriting',
                  isAr ? 'إدارة مواسم الذروة والحجوزات العاجلة' : 'Peak Season Departure Seat Management'
                ].map((service, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-300 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{service}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isAr ? 'احجز استشارة لتسويق شركتك السياحية' : 'Book a Tourism Growth Consultation'}</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('alwaad-creatives');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>{isAr ? 'معرض التصاميم والحملات' : 'View Campaign Creatives'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Creatives Gallery (Directly below Hero as requested) */}
      <section id="alwaad-creatives" className="py-20 bg-slate-900/60 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Campaign Videos Showcase if available */}
          {videos && videos.length > 0 && (
            <CaseStudyVideoSection
              videos={videos}
              isAr={isAr}
              clientName={isAr ? 'الوعد للسياحة والسفر ورحلات العمرة' : 'AlWaad Travel & Tours'}
            />
          )}

          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-4">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'معرض الإبداع والحملات البصرية' : 'Campaign Creatives & Visual Gallery'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              {isAr ? 'تصاميم حملات الوعد للسياحة والسفر ورحلات العمرة' : 'AlWaad Travel & Umrah Campaign Creatives'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {isAr
                ? 'استعراض بالحجم الكامل للمواد الإعلانية الرقمية، عروض باقات العمرة، والرحلات الترفيهية. انقر على أي تصميم لمشاهدته بدقة فائقة.'
                : 'Full-size exhibition of digital campaigns, spiritual Umrah itineraries, and leisure family tour packages. Click any creative for high-resolution inspection.'}
            </p>
          </div>

          {/* Creatives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {creatives.map((item, idx) => (
              <div 
                key={idx}
                className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-sky-500/50 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
                onClick={() => setActiveLightboxImg({
                  url: item.url,
                  title: isAr ? item.title : (item.titleEn || item.title),
                  desc: isAr ? item.desc : (item.descEn || item.desc)
                })}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                  <img 
                    src={item.url} 
                    alt={isAr ? item.title : (item.titleEn || item.title)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category Tag */}
                  <span className="absolute top-3 end-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-sky-400">
                    {item.tag}
                  </span>

                  {/* Expand Overlay Hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'عرض مكبّر' : 'Expand'}</span>
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-sky-400 transition-colors line-clamp-2">
                      {isAr ? item.title : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {isAr ? item.desc : item.descEn}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-sky-400/90 font-medium">{isAr ? 'تصميم سياحي معتمد' : 'Verified Tourism Asset'}</span>
                    <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-sky-400 transition-colors">
                      <span>{isAr ? 'تكبير' : 'Zoom'}</span>
                      <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audited Key Metrics */}
      <section className="py-20 bg-slate-950 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'الأرقام والإحصائيات الموثقة' : 'Audited Growth Metrics'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              {isAr ? 'نتائج حملات الوعد للسياحة الموثقة' : 'Verified AlWaad Travel Campaign Performance'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {isAr
                ? 'مؤشرات أداء رقمية وتجارية موثقة تثبت النجاح المباشر في حجز مقاعد الأفواج بالكامل وتحقيق أعلى عائد استثماري.'
                : 'Audited digital and commercial indicators confirming 100% departure occupancy, massive WhatsApp triage, and top-tier ROAS.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auditedMetrics.map((metric, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-6 relative overflow-hidden shadow-lg hover:border-sky-500/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    {metric.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {metric.growth}
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight group-hover:text-sky-400 transition-colors">
                  {metric.value}
                </div>
                <div className="text-sm font-bold text-slate-200 mb-1">
                  {metric.label}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {metric.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge vs Digital Effect Solution */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* The Market Challenge */}
            <div className="bg-slate-900/90 rounded-2xl border border-rose-900/30 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 start-0 w-2 h-full bg-rose-500" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-bold mb-4">
                <span>{isAr ? 'تحدي قطاع السياحة وموسمية الحجز' : 'The Seasonal Tourism Challenge'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isAr ? 'مخاطر المقاعد الشاغرة وتشتت المسافرين' : 'Departure Vacancy Risks & Severe Price Sensitivity'}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                {isAr
                  ? 'يتميز قطاع السياحة والسفر بارتفاع تكلفة المقاعد المحجوزة مسبقاً (Commitment Fees) على الطيران والفنادق. أي مقعد لا يُباع قبل الإقلاع يمثل خسارة صافية لا يمكن تعويضها. عانت الوعد من بطء استجابة النماذج التقليدية وتشكك المسافرين من شفافية الخدمات ومستوى الفنادق المعلنة.'
                  : 'Tourism operates on razor-thin deadlines where pre-booked airline blocks and hotel allotments face total loss if vacant at departure. AlWaad struggled with sluggish conversion from traditional contact forms and high traveler skepticism regarding hotel authenticity and hidden fees.'}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{isAr ? 'ضياع فرص الحجز بسبب بطء الرد على استفسارات العملاء على المنشورات العامة' : 'Lost high-intent inquiries caused by slow replies on open public social comments'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{isAr ? 'تردد الأسر في حجز رحلات العمرة لعدم وضوح بُعد الفندق الفعلي عن ساحات الحرم' : 'Hesitation among family pilgrims due to ambiguity over true walking distance to Haram gates'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{isAr ? 'تذبذب الطلب خارج مواسم العطلات الرسمية والحاجة لتدفق حجوزات منتظم' : 'Fluctuating off-peak booking volumes requiring continuous qualified travel leads'}</span>
                </li>
              </ul>
            </div>

            {/* The Digital Effect Solution */}
            <div className="bg-slate-900/90 rounded-2xl border border-sky-900/30 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 start-0 w-2 h-full bg-sky-500" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 text-sky-400 text-xs font-bold mb-4">
                <span>{isAr ? 'حل ومنهجية ديجيتال إفكت' : 'The Digital Effect Solution'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isAr ? 'مسارات الواتساب الفورية والشفافية البصرية المطلقة' : 'Click-to-WhatsApp Funnels & Visual Transparency'}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                {isAr
                  ? 'بنت ديجيتال إفكت منظومة إعلانية رقمية تفاعلية تعتمد على توجيه نقرات الإعلانات الممولة مباشرة إلى محادثات واتساب مخصصة مع مسؤولي الحجز، مع تصميمات إعلانية توضح بالصور الدقيقة اسم الفندق، المسافة للحرم، وخط سير الرحلة مع خيارات تقسيط ميسرة.'
                  : 'Digital Effect engineered a high-velocity direct response infrastructure routing qualified ad traffic into instant WhatsApp chats with dedicated travel consultants. Creatives displayed verified hotel imagery, exact gate proximity, and transparent pricing with flexible installment plans.'}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'أتمتة رسائل الواتساب الأولى للرد التلقائي على تفاصيل البرنامج وتوجيهه للمستشار المناسب' : 'Instant automated greeting triage providing immediate itinerary PDFs before agent handover'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'حملات استهداف دقيقة لمجتمعات المعتمرين ورجال الأعمال والعائلات في مصر والخليج' : 'Hyper-targeted demographic cohorts matching past pilgrim profiles and holiday seekers'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'حملات طوارئ عاجلة لملء آخر 10% من مقاعد الطيران قبل موعد الإقلاع بخصومات محسوبة' : 'Flash urgency countdown activations locking in final remaining charter seats at zero vacancy'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Brand Pillars */}
      <section className="py-20 bg-slate-950 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-4">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'محاور الاستراتيجية' : 'Strategic Pillars'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              {isAr ? 'أربعة ركائز قادت تفوق الوعد للسياحة' : '4 Pillars That Powered AlWaad Travel Scale'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {isAr
                ? 'كيف جمعنا بين سرعة الاستجابة اللحظية والشعور العاطفي بالثقة والأمان لملء المقاعد السياحية.'
                : 'Combining instant conversational responsiveness with deep emotional trust to guarantee 100% departure capacity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategicPillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-8 shadow-lg hover:border-sky-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/80">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Endorsement / Quote */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-12 h-12 text-sky-400/30 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-6">
            {isAr
              ? '«ديجيتال إفكت جعلت برامجنا السياحية ورحلات العمرة كاملة العدد قبل موعد الإقلاع بأسابيع؛ مسار الإعلانات للواتساب كان فائق الفعالية وحقق لنا أعلى عائد تشغيلي وأقل تكلفة حجز في تاريخ الشركة.»'
              : '"Digital Effect ensured our Umrah and leisure flights were 100% booked weeks ahead of departure; their WhatsApp conversion funnels were remarkably effective and delivered our highest operational returns."'}
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/95 p-1.5 rounded-lg border border-slate-700">
              <img 
                src="/assets/alwaad-travel/alwaad-travel_img_1.png" 
                alt="AlWaad Travel Logo" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="text-start">
              <div className="font-bold text-white text-sm">
                {isAr ? 'إدارة التشغيل السياحي وحجوزات العمرة' : 'Tour Operations & Umrah Directorate'}
              </div>
              <div className="text-xs text-sky-400 font-medium">
                {isAr ? 'شركة الوعد للسياحة والسفر' : 'AlWaad Travel & Tourism'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Box */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'نمو مبيعاتك السياحية يبدأ هنا' : 'Your Tourism Growth Engine Starts Here'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
            {isAr 
              ? 'هل ترغب في ملء مقاعد رحلاتك السياحية وبرامج العمرة بالكامل؟' 
              : 'Ready to Achieve 100% Occupancy for Your Tour Departures?'}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAr
              ? 'سواء كنت تدير برامج عمرة أو رحلات دولية أو منتجعات استجمام، يبني فريق ديجيتال إفكت مسارات تحويل فورية تضمن أعلى إشغال وأسرع استجابة من المسافرين.'
              : 'Whether operating spiritual pilgrimages, global vacation packages, or domestic retreats, Digital Effect builds high-velocity funnels that maximize bookings and ROAS.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-base shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>{isAr ? 'احجز جلستك الاستشارية الآن' : 'Schedule Strategy Consultation'}</span>
            </button>

            <button
              onClick={() => setCurrentPage('case-studies')}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-base font-semibold transition-colors cursor-pointer"
            >
              <span>{isAr ? 'استكشف كافة دراسات الحالة' : 'Explore All Case Studies'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Lightbox Modal */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="pe-4">
                <h4 className="text-base font-bold text-white truncate">
                  {activeLightboxImg.title}
                </h4>
                {activeLightboxImg.desc && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {activeLightboxImg.desc}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-2 sm:p-6 bg-slate-950 flex items-center justify-center overflow-auto flex-1">
              <img 
                src={activeLightboxImg.url} 
                alt={activeLightboxImg.title} 
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? 'معاينة بالحجم الكامل لدراسة حالة الوعد للسياحة والسفر' : 'High-Resolution Asset Preview — AlWaad Travel Case Study'}</span>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="text-sky-400 hover:underline font-semibold"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
