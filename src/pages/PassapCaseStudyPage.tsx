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
  PhoneCall,
  Timer,
  Check,
  Wrench
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

export const PassapCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-passap');
  const creatives = getCaseStudyCreatives('cs-b2c-passap', currentCaseStudy);
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
      value: '+360%',
      label: isAr ? 'نمو مبيعات سخانات الغاز والكهرباء' : 'Winter Water Heater Sales Scale',
      hint: isAr ? 'في أشهر ذروة البرودة الشتوية وموسم التدفئة' : 'During peak winter freeze and household heating months',
      growth: '+360%',
      icon: <Flame className="w-6 h-6 text-amber-400" />
    },
    {
      value: '+180%',
      label: isAr ? 'اتصالات الخط الساخن 16898 ومنافذ البيع' : 'Hotline 16898 Direct Inbound Calls',
      hint: isAr ? 'استفسارات شراء فورية، طلبات صيانة، وتوجيه للموزعين' : 'Immediate retail purchasing, warranty service, & dealer triage',
      growth: '+180%',
      icon: <PhoneCall className="w-6 h-6 text-sky-400" />
    },
    {
      value: '5.1X',
      label: isAr ? 'العائد الإعلاني الموسمي (ROAS)' : 'Seasonal Campaign Ad ROAS',
      hint: isAr ? 'معدل ربحية استثنائي لإعلانات التحويل المباشر Meta Ads' : 'Exceptional profitability across direct-response Meta Ads',
      growth: '5.1X ROAS',
      icon: <Zap className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '4.2M+',
      label: isAr ? 'وصول الحملات على فيسبوك وإنستغرام' : 'Social Media Reach Volume',
      hint: isAr ? 'وصول واسع النطاق للأسر في كافة محافظات مصر' : 'Extensive household reach across Egyptian governorates',
      growth: '4.2M+',
      icon: <Users className="w-6 h-6 text-rose-400" />
    }
  ];

  const strategicPillars = [
    {
      title: isAr ? 'التمركز الموسمي العاطفي «دش ساخن في عز البرد»' : 'Seasonal Emotional Positioning ("Hot Shower in Deep Cold")',
      desc: isAr ? 'ربط اسم باساب بالدفء الفوري والأمان النفسي في أقسى ليالي الشتاء، مما جعل السخان خياراً لا غنى عنه لكل أسرة.' : 'Anchoring Passap to instant warmth and comforting reassurance during freezing winter cold, converting seasonal need into urgent purchase.',
      icon: <Flame className="w-5 h-5 text-amber-400" />
    },
    {
      title: isAr ? 'كسر مخاوف أمان الغاز بأنظمة الحماية الثلاثية' : 'Overcoming Safety Objections with Triple Protection Tech',
      desc: isAr ? 'تفنيد مخاوف المستهلكين حول سخانات الغاز عبر شرح علمي مبسط لصمامات الأمان الأوتوماتيكية وحساسات العادم المعتمدة.' : 'Refuting gas heater hesitations through clear educational content showcasing automatic shut-off sensors and flue gas safety valves.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'تنشيط الخط الساخن 16898 ومسارات الشراء الفوري' : 'Hotline 16898 Direct Triage & Instant Conversion Path',
      desc: isAr ? 'دمج رقم الخط الساخن في كافة المواد البصرية والإعلانات الممولة لتحويل استفسار العميل فوراً إلى طلب شراء أو توجيه لأقرب معرض.' : 'Seamlessly embedding hotline 16898 in all creative and ad funnels, converting digital impressions into verified phone orders.',
      icon: <PhoneCall className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'دعم شبكة الموزعين المعتمدين والمراكز بالمحافظات' : 'Authorized Dealer Footfall & Regional Service Network',
      desc: isAr ? 'إطلاق حملات جغرافية موجهة (Local Awareness) تدعم الموزعين المحليين بأسماء معارضهم وتسهيلات الدفع والتقسيط المتاحة.' : 'Deploying location-targeted local campaigns routing nearby shoppers directly to showroom partners with installment financing options.',
      icon: <Store className="w-5 h-5 text-amber-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة باساب للأجهزة والسخانات (Passap) — حملات الشتاء والخط الساخن | ديجيتال إفكت' : 'Passap Appliances & Water Heaters Case Study | Digital Effect'}
        description={isAr ? 'كيف ضاعفت ديجيتال إفكت مبيعات سخانات باساب بنسبة +360% عبر حملات «دش ساخن في عز البرد» وتنشيط الخط الساخن 16898 بعائد 5.1X ROAS.' : 'How Digital Effect scaled Passap Water Heaters by +360% sales with 5.1X ROAS and 4.2M+ household reach via winter campaigns and Hotline 16898.'}
        image="/assets/portfolio_crops/card_passap.png"
        imageAlt={isAr ? 'دراسة حالة باساب للأجهزة المنزلية والسخانات - ديجيتال إفكت' : 'Passap Home Appliances & Water Heaters Case Study - Digital Effect'}
        urlPath="#passap-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'قطاع الأجهزة المنزلية والسخانات (B2C Home Appliances & Heating)' : 'Household Appliances & Water Heating'}
        tags={['باساب', 'Passap', 'سخانات باساب', 'سخان غاز باساب', 'دش ساخن في عز البرد', 'الخط الساخن 16898', 'تسويق الأجهزة المنزلية', 'ديجيتال إفكت']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Passap Water Heaters Winter Sales Scale Case Study — Digital Effect',
          description: 'Winter campaign strategy scaling gas and electric water heater orders by +360% with 4.2M+ reach, 5.1X ROAS and Hotline 16898 triage.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_passap.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_passap.png',
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
            name: 'Passap Home Appliances & Water Heaters',
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
              {isAr ? 'باساب للأجهزة والسخانات (Passap)' : 'Passap Appliances'}
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
            src="/assets/passap-2/passap_hero_bg.jpg" 
            alt="Passap Water Heater and Home Appliances Warmth Background" 
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6 backdrop-blur-sm">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'قطاع B2C — الأجهزة المنزلية وسخانات المياه' : 'B2C Sector — Water Heaters & Household Tech'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
              <span>{isAr ? 'نتائج موثقة رسمياً' : 'Audited Results'}</span>
            </div>

            {/* Client Logo & Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-700/60 shadow-lg">
                <img 
                  src="/assets/passap-2/passap-2_img_2.png" 
                  alt="Passap Home Appliances Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  {isAr ? 'العميل التجاري' : 'Retail Client'}
                </p>
                <h2 className="text-lg font-bold text-slate-200">
                  {isAr ? 'شركة باساب للأجهزة المنزلية والسخانات' : 'Passap Home Appliances & Water Heaters'}
                </h2>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              {isAr 
                ? 'تعزيز ريادة باساب في سخانات المياه وإشعال زخم المبيعات الشتوية' 
                : 'Scaling Passap Water Heater Retail Leadership & Winter Peak Velocity'}
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 font-normal">
              {isAr
                ? 'كيف طوّرت ديجيتال إفكت الحملات الموسمية «دش ساخن في عز البرد»، ونشّطت الخط الساخن 16898، لترفع مبيعات سخانات الغاز والكهرباء بنسبة +360% وتصل إلى 4.2M+ أسرة مصرية بعائد إعلاني 5.1X ROAS.'
                : 'How Digital Effect orchestrated high-impact winter activations ("Hot showers in the deepest cold"), activated hotline 16898 direct triage, scaling heater sales by +360% with 4.2M+ household reach and 5.1X ROAS.'}
            </p>

            {/* Services Rendered Badges */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-400 mb-3">
                {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Delivered:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  isAr ? 'إدارة الحملات الإعلانية الموسمية (Meta Ads)' : 'Seasonal Meta Ads Campaigns',
                  isAr ? 'صياغة رسائل «دش ساخن في عز البرد»' : 'Winter Campaign Positioning',
                  isAr ? 'تفعيل وتوجيه اتصالات الخط الساخن (16898)' : 'Hotline 16898 Lead Triage',
                  isAr ? 'حملات التوعية بأمان صمامات الغاز والضمان' : 'Safety Valves & Warranty Marketing'
                ].map((service, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-300 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{service}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isAr ? 'احجز استشارة لتسويق منتجاتك الاستهلاكية' : 'Book a Retail Growth Consultation'}</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('passap-creatives');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'معرض التصاميم والحملات' : 'View Campaign Creatives'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Creatives Gallery (Directly below Hero as requested) */}
      <section id="passap-creatives" className="py-20 bg-slate-900/60 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Campaign Videos Showcase if available */}
          {videos && videos.length > 0 && (
            <CaseStudyVideoSection
              videos={videos}
              isAr={isAr}
              clientName={isAr ? 'باساب للأجهزة وسخانات الغاز' : 'Passap Home Appliances'}
            />
          )}

          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'معرض الإبداع والحملات البصرية' : 'Campaign Creatives & Visual Gallery'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              {isAr ? 'تصاميم حملات الشتاء وسخانات وأجهزة باساب' : 'Passap Water Heaters & Household Campaign Creatives'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {isAr
                ? 'استعراض بالحجم الكامل للمواد الإعلانية الرقمية، حملات التوعية بالأمان، وتنشيط الخط الساخن 16898. انقر على أي تصميم لمشاهدته بالحجم الكامل.'
                : 'Full-size exhibition of digital campaigns, safety education, and hotline 16898 direct triage activations. Click any creative for high-resolution inspection.'}
            </p>
          </div>

          {/* Creatives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {creatives.map((item, idx) => (
              <div 
                key={idx}
                className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/50 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
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
                  <span className="absolute top-3 end-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-amber-400">
                    {item.tag}
                  </span>

                  {/* Expand Overlay Hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'عرض مكبّر' : 'Expand'}</span>
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                      {isAr ? item.title : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {isAr ? item.desc : item.descEn}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-amber-400/90 font-medium">{isAr ? 'تصميم رقمي معتمد' : 'Verified Ad Asset'}</span>
                    <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-amber-400 transition-colors">
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
              {isAr ? 'نتائج حملات باساب الموثقة في موسم الشتاء' : 'Verified Passap Winter Campaign Performance'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {isAr
                ? 'مؤشرات أداء رقمية وتجارية موثقة تثبت النجاح المباشر في مضاعفة المبيعات وتنشيط مراكز الخدمة والخط الساخن.'
                : 'Audited digital and retail performance proving tangible expansion in unit sales, hotline volume, and ad efficiency.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auditedMetrics.map((metric, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-6 relative overflow-hidden shadow-lg hover:border-amber-500/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    {metric.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {metric.growth}
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight group-hover:text-amber-400 transition-colors">
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
                <span>{isAr ? 'تحدي السوق وسخانات الشتاء' : 'The Seasonal Challenge'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isAr ? 'المنافسة المحمومة ومخاوف أمان السخانات' : 'Fierce Seasonal Competition & Water Heater Safety Hesitations'}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                {isAr
                  ? 'يشهد موسم الشتاء سباقاً حاداً بين كبرى شركات الأجهزة المنزلية للاستحواذ على مبيعات سخانات الغاز والكهرباء. واجهت باساب تحدي تشتت انتباه المستهلك ووجود تخوفات لدى بعض الأسر من سخانات الغاز، فضلاً عن الحاجة الماسة لتسهيل التواصل الفوري مع الصيانة المعتمدة وطلب المنتجات قبل انتهاء موجة البرد.'
                  : 'Winter triggers an intense rivalry among appliance manufacturers competing for gas and electric water heater market share. Passap needed to overcome consumer safety hesitations, stand out amidst heavy competitor advertising, and provide frictionless instant ordering before cold waves subsided.'}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{isAr ? 'تزاحم إعلاني خانق في أشهر الشتاء القصيرة من المنافسين المحليين والمستوردين' : 'Severe advertising clutter during short winter peaks from domestic and imported competitors'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{isAr ? 'حاجة المستهلكين للتأكد من مواصفات الأمان وصمامات ضغط المياه قبل اتخاذ قرار الشراء' : 'Buyer anxiety surrounding gas safety valves, flue systems, and low-pressure ignition'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{isAr ? 'بطء استجابة قنوات الشراء التقليدية وصعوبة حجز الصيانة الرسمية في مواسم الضغط' : 'Frictional legacy inquiry channels slowing down purchases during rapid temperature drops'}</span>
                </li>
              </ul>
            </div>

            {/* The Digital Effect Solution */}
            <div className="bg-slate-900/90 rounded-2xl border border-amber-900/30 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 start-0 w-2 h-full bg-amber-500" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold mb-4">
                <span>{isAr ? 'حل ومنهجية ديجيتال إفكت' : 'The Digital Effect Solution'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isAr ? 'حملة «دش ساخن في عز البرد» وتفعيل الخط الساخن 16898' : 'Viral "Hot Showers in Deep Cold" & Direct Hotline 16898 Engine'}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                {isAr
                  ? 'صممت ديجيتال إفكت استراتيجية تحويل موسمية متكاملة ركزت على زرع الرغبة في الدفء الفوري («مع باساب حتاخد دش ساخن في عز البرد»)، مع إبراز تقنيات الأمان الثلاثية وصمامات النحاس المعتمدة، وربط كافة الإعلانات المباشرة برقم الخط الساخن 16898 وأقرب موزعي المحافظات.'
                  : 'Digital Effect engineered a high-velocity seasonal campaign turning freezing cold into an urgent catalyst for purchase ("Take a hot shower in the deepest cold with Passap"). The strategy demystified safety features, highlighted factory warranties, and integrated direct Hotline 16898 ordering.'}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'حملات إعلانات تحويلية عالية الدقة على منصات Meta استهدفت الأسر والمقبلين على الزواج' : 'Precision Meta performance ads targeting heads of households and newlywed home renovators'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'تنشيط الخط الساخن 16898 بروابط اتصال مباشر ونظام فرز سريع لطلبات الشراء والصيانة' : 'Hotline 16898 click-to-call integration with fast lead routing to nearest distributors'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isAr ? 'إبراز عروض الأعياد وباقات الديب فريزر والتبريد المنزلي لتحقيق مبيعات متقاطعة (Cross-Selling)' : 'Cross-selling campaigns bundling seasonal freezers, refrigerators, and water dispensers'}</span>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'محاور الاستراتيجية' : 'Strategic Pillars'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              {isAr ? 'أربعة ركائز قادت نمو باساب الاستثنائي' : '4 Pillars That Catalyzed Passap Growth'}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {isAr
                ? 'كيف جمعنا بين الابتكار الإعلاني العاطفي وهندسة مسارات التحويل المباشر لخدمة المستهلك وشبكة الموزعين.'
                : 'Blending emotional campaign storytelling with rigorous direct-conversion engineering across channels.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategicPillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-8 shadow-lg hover:border-amber-500/40 transition-all duration-300"
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
          <Quote className="w-12 h-12 text-amber-400/30 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-6">
            {isAr
              ? '«حملات «دش ساخن في عز البرد» وتفعيل الخط الساخن 16898 حققت أرقاماً استثنائية لمبيعات سخانات الغاز والكهرباء في أشهر ذروة الشتاء، مع دعم كامل لشبكة مراكز الصيانة والموزعين في كافة المحافظات.»'
              : '"The \'Hot Showers in Deep Cold\' activations and Hotline 16898 direct triage generated record gas and electric water heater orders across all governorates during peak winter cold, with comprehensive distributor support."'}
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/95 p-1.5 rounded-lg border border-slate-700">
              <img 
                src="/assets/passap-2/passap-2_img_2.png" 
                alt="Passap Logo" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="text-start">
              <div className="font-bold text-white text-sm">
                {isAr ? 'إدارة التسويق وتطوير المنتجات' : 'Marketing & Product Strategy Directorate'}
              </div>
              <div className="text-xs text-amber-400 font-medium">
                {isAr ? 'شركة باساب للأجهزة المنزلية والسخانات' : 'Passap Home Appliances & Water Heaters'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Box */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'نمو علامتك التجارية يبدأ هنا' : 'Your Growth Engine Starts Here'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
            {isAr 
              ? 'هل ترغب في تصدر مبيعات قطاع الأجهزة والمنتجات الاستهلاكية؟' 
              : 'Ready to Lead Consumer Appliance & Household Retail Sales?'}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAr
              ? 'سواء كنت تطلق منتجاً جديداً أو تستعد لمواسم المبيعات الكبرى، يطور فريق ديجيتال إفكت حملات إعلانية تخاطب رغبات المستهلكين وتحقق أعلى عائد استثماري.'
              : 'Whether launching new home appliances or preparing for peak seasonal retail rushes, Digital Effect crafts high-conversion ad engines that maximize your ROAS.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
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
              <span>{isAr ? 'معاينة بالحجم الكامل لدراسة حالة باساب' : 'High-Resolution Asset Preview — Passap Case Study'}</span>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="text-amber-400 hover:underline font-semibold"
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
