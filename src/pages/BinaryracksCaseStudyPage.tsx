import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  Server, 
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
  Cpu, 
  CloudRain, 
  Database,
  Lock,
  Headphones
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

export const BinaryracksCaseStudyPage: React.FC = () => {
  const { language, setCurrentPage, setIsConsultationOpen, data } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2c-binaryracks');
  const creatives = getCaseStudyCreatives('cs-b2c-binaryracks', currentCaseStudy);
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
      value: '+280%',
      label: isAr ? 'نمو الاشتراكات السحابية الشهرية' : 'Monthly Subscriptions Surge',
      hint: isAr ? 'في باقات السيرفرات السحابية المشتركة والـ VPS' : 'Across shared & managed VPS hosting tiers',
      growth: '+280%',
      icon: <TrendingUp className="w-6 h-6 text-sky-400" />
    },
    {
      value: '1.2M+',
      label: isAr ? 'وصول الحملات للمطورين والمتاجر' : 'Targeted Tech Impressions',
      hint: isAr ? 'صناع قرار المواقع الرقمية ورواد الأعمال' : 'Digital entrepreneurs & store decision-makers',
      growth: '1.2M+',
      icon: <Users className="w-6 h-6 text-emerald-400" />
    },
    {
      value: '42%',
      label: isAr ? 'انخفاض تكلفة الاستحواذ على المشترك (CAC)' : 'Customer Acquisition Cost Reduction',
      hint: isAr ? 'تحسين كفاءة التحويل عبر مسارات Meta و Google' : 'Optimized paid acquisition funnels on Meta & Search',
      growth: '-42%',
      icon: <Zap className="w-6 h-6 text-amber-400" />
    },
    {
      value: '99.98%',
      label: isAr ? 'معدل استقرار الخدمة والـ SLA المعتمد' : 'Certified SLA Uptime Reliability',
      hint: isAr ? 'بنية سحابية محمية من الأعطال وتوقف المتاجر' : 'Redundant high-availability data infrastructure',
      growth: '99.98%',
      icon: <ShieldCheck className="w-6 h-6 text-sky-400" />
    }
  ];

  const techFeatures = [
    {
      title: isAr ? 'سيرفرات سحابية فائقة الأداء (NVMe SSD)' : 'High-Performance Cloud VPS (NVMe SSD)',
      desc: isAr ? 'معالجات حوسبة سحابية متطورة مع وسائط تخزين فائقة السرعة تضمن سرعة فتح المواقع في أقل من ثانية واحدة.' : 'Enterprise compute instances backed by ultra-fast NVMe storage ensuring sub-second page loads.',
      icon: <Cpu className="w-5 h-5 text-sky-400" />
    },
    {
      title: isAr ? 'حماية متقدمة ضد هجمات حجب الخدمة (DDoS)' : 'Multi-Layer DDoS Mitigation & Security',
      desc: isAr ? 'أنظمة تصفية حركة المرور الفورية لمنع الهجمات الخبيثة وضمان استمرار عمل المتاجر وقت الحملات والمواسم.' : 'Real-time traffic filtering shielding e-commerce storefronts during high-volume sales and promo peaks.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />
    },
    {
      title: isAr ? 'نسخ احتياطي يومي تلقائي واستعادة فورية' : 'Automated Daily Backups & Disaster Recovery',
      desc: isAr ? 'حفظ نسخ دورية من قواعد البيانات والملفات مع إمكانية الاستعادة بضغطة زر واحدة لحماية أصول العميل الرقمية.' : 'Continuous snapshot backups with one-click rollback preventing operational data loss.',
      icon: <Database className="w-5 h-5 text-indigo-400" />
    },
    {
      title: isAr ? 'دعم فني متخصص 24/7 باللغة العربية' : '24/7 Dedicated Support & Monitoring',
      desc: isAr ? 'مهندسو شبكات وسيرفرات جاهزون للتدخل الفوري عبر التذاكر والشات المباشر لحل التحديات التقنية بدون تأخير.' : 'Direct access to certified system engineers via live chat and ticketing for zero resolution delay.',
      icon: <Headphones className="w-5 h-5 text-amber-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500 selection:text-white">
      {/* SEO & Social Share Meta */}
      <SeoHead
        title={isAr ? 'دراسة حالة باينري راكس (Binaryracks) — الاستضافة السحابية ومضاعفة الاشتراكات | ديجيتال إفكت' : 'Binaryracks Cloud Infrastructure Case Study | Digital Effect'}
        description={isAr ? 'كيف طوّرت ديجيتال إفكت الحملات الرقمية وهوية باينري راكس لمضاعفة اشتراكات السيرفرات السحابية بنسبة 280% وتخفيض تكلفة الاستحواذ بنسبة 42%.' : 'How Digital Effect scaled Binaryracks cloud hosting subscriptions by 280% with 42% lower CAC.'}
        image="/assets/portfolio_crops/card_binaryracks.png"
        imageAlt={isAr ? 'دراسة حالة باينري راكس للحوسبة السحابية والاستضافة - ديجيتال إفكت' : 'Binaryracks Cloud Infrastructure Case Study - Digital Effect'}
        urlPath="#binaryracks-case-study"
        type="article"
        publishedTime="2024-03-01T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'الحوسبة السحابية والبنية التحتية للمواقع والمتاجر' : 'Cloud Infrastructure & Managed Web Hosting'}
        tags={['باينري راكس', 'Binaryracks', 'استضافة سحابية', 'سيرفرات سحابية', 'Cloud VPS', 'تسويق رقمي', 'ديجيتال إفكت', 'Digital Effect Cloud']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Binaryracks Cloud Hosting Growth Case Study — Digital Effect',
          description: 'Scaling cloud hosting subscriptions and e-commerce infrastructure adoption with high-converting performance marketing.',
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_binaryracks.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_binaryracks.png',
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
            name: 'Binaryracks Cloud Infrastructure',
            areaServed: 'Egypt & MENA'
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
              {isAr ? 'باينري راكس (Binaryracks)' : 'Binaryracks Cloud'}
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
              {shareToast && (
                <span className="absolute -bottom-8 end-0 bg-sky-500 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  {isAr ? 'تم نسخ الرابط!' : 'Link copied!'}
                </span>
              )}
            </button>

            <a
              href="https://digitaleffect.net/binaryracks/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'رابط الموقع الأصلي' : 'Live Client Link'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Hero Header with Cinematic Cloud Datacenter Background */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pb-28 border-b border-slate-800 bg-slate-950">
        {/* Cinematic Datacenter Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/binaryracks/binaryracks_hero_bg.jpg" 
            alt="Binaryracks Cloud Infrastructure Datacenter Background" 
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
                  src="/assets/binaryracks/binaryracks_img_1.png"
                  alt="Binaryracks Cloud Infrastructure Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30 backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? 'شريك ديجيتال إفكت في الحوسبة السحابية والاستضافة' : 'Premier Cloud Hosting Partner'}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {isAr ? 'سيرفرات سحابية · استضافة ووردبريس ومتاجر · حماية بيانات 24/7' : 'Cloud Servers · Managed WordPress & E-Commerce · 24/7 Security'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://digitaleffect.net/binaryracks/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors backdrop-blur-sm"
              >
                <span>{isAr ? 'رابط صفحة العميل الأصلية ↗' : 'Official Case Study Link ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'طلب خطة تسويق لخدمات السحابة' : 'Request Cloud Growth Plan'}</span>
              </button>
            </div>
          </div>

          {/* Headline and Narrative */}
          <div className="space-y-4 max-w-4xl text-start">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
              <span className="text-sky-400 font-extrabold tracking-wider bg-sky-950/70 px-2.5 py-1 rounded-md border border-sky-500/30">CLOUD INFRASTRUCTURE & SAAS</span>
              <span>·</span>
              <span>PERFORMANCE ADS (META & GOOGLE)</span>
              <span>·</span>
              <span>CONVERSION FUNNELS</span>
              <span>·</span>
              <span>{isAr ? 'المدة: ٦ أشهر' : 'Duration: 6 Months'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] drop-shadow-md">
              {isAr ? (
                <>
                  دراسة حالة باينري راكس (Binaryracks) —{' '}
                  <span className="text-sky-400 underline decoration-sky-500 decoration-wavy underline-offset-8">
                    مضاعفة اشتراكات السيرفرات السحابية
                  </span>{' '}
                  وتخفيض تكلفة الاستحواذ CAC
                </>
              ) : (
                <>
                  Binaryracks Cloud Infrastructure —{' '}
                  <span className="text-sky-400">Scaling Inbound Hosting Subscriptions</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-slate-200/90 font-light leading-relaxed max-w-3xl drop-shadow-sm">
              {isAr
                ? 'كيف استطاعت ديجيتال إفكت تحويل باينري راكس إلى الخيار الأول لآلاف المتاجر والمواقع الناشئة؛ عبر صياغة عروض استضافة تجريبية، إبراز مؤشرات الأداء الحقيقية، وإطلاق مسارات إعلانية ذكية على شبكات البحث ومنصات الأعمال.'
                : 'How Digital Effect positioned Binaryracks as the premier regional cloud infrastructure choice for thousands of online businesses through high-converting risk-free trial funnels and audited SLA performance messaging.'}
            </p>
          </div>

          {/* Services Executed Chips */}
          <div className="pt-1">
            <div className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
              {isAr ? 'الخدمات المنفذة في المشروع:' : 'Services Executed:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isAr ? [
                'إدارة الحملات الإعلانية على Meta و Google Ads',
                'تصميم الهوية الرقمية للمنتجات السحابية',
                'كتابة المحتوى التقني الجاذب للمطورين وأصحاب المتاجر',
                'تحسين مسار التسجيل والدفع الإلكتروني (Checkout Optimization)',
                'بناء مسارات التحويل للسيرفرات المشتركة والخاصة VPS'
              ] : [
                'Meta & Google Search Performance Ads',
                'Cloud Visual Identity & Creative Collateral',
                'Developer & Merchant Tech Copywriting',
                'Checkout & Trial Funnel Optimization',
                'Shared & VPS Inbound Acquisition Funnels'
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

          {/* Quick KPI Highlights inside Hero Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-4xl">
            {auditedMetrics.map((kpi, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70">
                <div className="text-xl sm:text-2xl font-black text-sky-400 tabular-nums">
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
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              {isAr ? 'احجز استشارة لخدماتك السحابية أو متجرك' : 'Book a Cloud Strategy Consultation'}
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

      {/* Video Showcase Section */}
      {videos.length > 0 && (
        <CaseStudyVideoSection
          videos={videos}
          title={isAr ? 'مقاطع الفيديو والوسائط المرئية لشركة باينري راكس' : 'Binaryracks Cloud Video Showcase'}
          subtitle={isAr ? 'عروض توثيقية وشروحات لبنية السيرفرات السحابية ومؤشرات الأداء' : 'Official infrastructure walkthroughs and audited benchmark reels'}
          badgeText={isAr ? 'فيديو الحملة والبنية السحابية' : 'Cloud Video Reel'}
          accentColor="sky"
        />
      )}

      {/* Full-Size Creatives Gallery (Main Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'معرض المنشورات والبلان بالحجم الكامل' : 'Full-Resolution Creative & Plan Showcase'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'تصاميم الحملات والبلان بالحجم الكامل والوضوح الفائق' : 'Selected Cloud Campaign Visuals & Plan Assets'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'نماذج من التصاميم الرقمية وخطط الحملات المعتمدة لباينري راكس بدقتها الكاملة. انقر على أي تصميم لتكبيره بالكامل.'
              : 'Full resolution creative assets and plans demonstrating cloud architecture, scalability, and 24/7 support. Click any visual to inspect.'}
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
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 max-h-[720px]"
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
                    <span className="bg-sky-950 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-800 font-semibold text-[11px]">
                      {itemTag}
                    </span>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 border-t border-slate-800">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'النتائج الرئيسية المدققة (Key Results)' : 'Audited Growth Figures'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'أرقام حقيقية تثبت فاعلية الحملات السحابية' : 'Real Measurable Growth Metrics'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'مؤشرات أداء مسجلة على مدار ٦ أشهر من الحملات وإعادة هيكلة مسارات التحويل لشركة باينري راكس.'
              : 'Performance metrics audited over 6 months of paid media scaling and conversion optimization.'}
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
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 group-hover:scale-110 transition-transform">
                  {metric.icon}
                </div>
                <span className="text-xs font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-500/20">
                  {metric.growth}
                </span>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                  {metric.value}
                </div>
                <div className="text-sm font-bold text-slate-200 mt-1">
                  {metric.label}
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {metric.hint}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Blueprint: Challenge vs Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 border-t border-slate-800">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'خطة التدخل الاستراتيجي' : 'Strategic Intervention Blueprint'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'من الشكوك في المزود المحلي إلى الثقة وتخفيض الـ CAC' : 'From Skepticism to Regional Cloud Authority'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* The Challenge */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-3xl p-8 space-y-4 text-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/15 rounded-2xl border border-rose-500/30 text-rose-400 font-bold">
                !
              </div>
              <div>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  {isAr ? 'التحدي السوقي' : 'The Market Challenge'}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isAr ? 'المنافسة مع العمالقة العالميين وتخوف المستهلكين' : 'Global Hyperscaler Dominance & Consumer Friction'}
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {isAr
                ? 'المنافسة الشديدة من منصات الاستضافة العالمية، وصعوبة إقناع المستخدم العربي بالاعتماد على مزود سحابي إقليمي دون تجربة ملموسة ودعم فني موثوق على مدار الساعة، بالإضافة إلى ارتفاع تكلفة الاستحواذ على المشتركين الجدد.'
                : 'High competition from global hosting platforms and consumer hesitation over local cloud providers without demonstrated SLA uptime and 24/7 localized support.'}
            </p>
          </div>

          {/* The Solution */}
          <div className="bg-slate-900/80 border border-sky-500/30 rounded-3xl p-8 space-y-4 text-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/15 rounded-2xl border border-sky-500/30 text-sky-400 font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  {isAr ? 'حل ديجيتال إفكت' : 'The Digital Effect Blueprint'}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isAr ? 'مسارات تجريبية وإثبات الأداء الحقيقي' : 'Risk-Free Trial Funnels & Audited Benchmarks'}
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {isAr
                ? 'صياغة عروض استضافة تجريبية سريعة خالية من المخاطر، إنتاج تصاميم توضح سرعة التحميل وأمان البيانات، وإطلاق إعلانات استهداف دقيقة لأصحاب المتاجر والمطورين تركز على سرعة الاستجابة وتوفير التكاليف بالعملة المحلية.'
                : 'Designed high-converting risk-free trial funnels, showcased audited uptime benchmarks, and ran targeted search and social campaigns acquiring online store owners.'}
            </p>
          </div>
        </div>
      </section>

      {/* Cloud Infrastructure Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 border-t border-slate-800">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
            <Server className="w-3.5 h-3.5" />
            <span>{isAr ? 'المزايا التقنية المروّج لها' : 'Highlighted Technology Pillars'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'أعمدة القوة التقنية التي بنيت عليها الحملات' : 'Technical Pillars Powering the Funnels'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3 text-start hover:border-sky-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/80 w-fit rounded-2xl border border-slate-700/60">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-sky-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'معتمد في باقات باينري راكس' : 'Active in Client Retainers'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Client Quote & Testimonial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 rounded-3xl p-8 sm:p-12 border border-sky-500/30 relative overflow-hidden text-start shadow-2xl">
          <Quote className="w-16 h-16 text-sky-500/20 absolute top-6 end-6" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'شهادة العميل الشريك' : 'Official Client Endorsement'}</span>
            </div>

            <p className="text-lg sm:text-2xl font-medium text-slate-100 leading-relaxed font-serif">
              {isAr
                ? '«استطاعت ديجيتال إفكت صياغة عروض استضافة وسيرفرات سحابية جذبت آلاف أصحاب المتاجر والمواقع الرقمية الناشئة في مصر والعالم العربي، مع انخفاض بنسبة 42% في تكلفة الاستحواذ على المشترك (CAC). شراكتنا معهم نقلتنا لمستوى تنافسي جديد كلياً.»'
                : '"Digital Effect architected high-converting cloud hosting funnels that acquired thousands of online stores and SaaS founders across MENA, slashing our customer acquisition cost by 42%. A game-changing partnership for Binaryracks."'}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="h-12 w-12 rounded-2xl bg-white p-1 border border-white/20 flex items-center justify-center shrink-0">
                <img
                  src="/assets/binaryracks/binaryracks_img_1.png"
                  alt="Binaryracks"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isAr ? 'فريق العمليات وتجربة العملاء' : 'Operations & Customer Experience Team'}
                </div>
                <div className="text-xs text-sky-400">
                  {isAr ? 'شركة باينري راكس للاستضافة السحابية' : 'Binaryracks Cloud Infrastructure & Web Hosting'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-14 text-center sm:text-start flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'جاهز لمضاعفة اشتراكاتك الرقمية؟' : 'Ready to Scale Your Cloud Subscriptions?'}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {isAr ? 'حوّل خدماتك الرقمية إلى ماكينة نمو واستحواذ مستمر' : 'Transform Your Digital Service into a High-Converting Engine'}
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 font-light leading-relaxed">
              {isAr
                ? 'فريق ديجيتال إفكت يمتلك الخبرة والأرقام المؤكدة في قطاعات التكنولوجيا والسيرفرات والبرمجيات كخدمة (SaaS). احجز جلستك الاستشارية الآن.'
                : 'Digital Effect has the proven track record scaling Tech, Cloud, and SaaS businesses. Book your strategic consultation today.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-slate-950 font-black text-sm hover:bg-sky-50 transition-all shadow-xl cursor-pointer"
            >
              {isAr ? 'احجز استشارتك المجانية' : 'Book Free Consultation'}
            </button>
            <button
              onClick={() => setCurrentPage('case-studies')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              {isAr ? 'سابقة الأعمال' : 'All Case Studies'}
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full Creatives Inspection */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="space-y-0.5 text-start">
                <span className="text-xs font-bold text-sky-400">
                  {isAr ? 'معاينة التصميم بالحجم الكامل' : 'Full Resolution Preview'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                  {activeLightboxImg.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-950">
              <img 
                src={activeLightboxImg.url} 
                alt={activeLightboxImg.title} 
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-xl"
              />
            </div>

            {activeLightboxImg.desc && (
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-300 text-start">
                {activeLightboxImg.desc}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
