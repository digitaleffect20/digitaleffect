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
  MessageSquare, 
  CalendarCheck, 
  CheckCircle2, 
  Award, 
  Stethoscope, 
  Sparkles, 
  Quote, 
  Maximize2,
  X,
  Check
} from 'lucide-react';

import { getCaseStudyCreatives, getCaseStudyVideos } from '../utils/caseStudyMedia';
import { CaseStudyVideoSection } from '../components/CaseStudyVideoSection';

export const IptCaseStudyPage: React.FC = () => {
  const { data, language, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-med-ipt');
  const creatives = getCaseStudyCreatives('cs-med-ipt', currentCaseStudy);
  const videos = getCaseStudyVideos(currentCaseStudy);

  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; title: string; desc?: string } | null>(null);
  const [shareToast, setShareToast] = useState(false);

  const pageTitle = isAr 
    ? 'دراسة حالة مركز IPT للعلاج الطبيعي | ديجيتال إفكت للتسويق الطبي' 
    : 'IPT Physiotherapy Center Case Study | Digital Effect Healthcare Marketing';

  const pageDescription = isAr
    ? 'تعرف على قصة نجاح مركز IPT للعلاج الطبيعي والتأهيل الحركي مع ديجيتال إفكت: أكثر من 2.4 مليون مشاهدة، قفزة في التفاعل بنسبة +43,576% وتحويل المشاهدات إلى حجوزات عيادة حقيقية.'
    : 'Discover the IPT Physiotherapy & Movement Rehab success story with Digital Effect: 2.4M+ patient impressions, +43,576% engagement surge, and full clinic appointment funnels.';

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
      label: isAr ? 'مشاهدات الحملات التوعوية' : 'Targeted Campaign Impressions',
      value: '2,400,000+',
      growth: '+120,522%',
      hint: isAr ? 'وصول دقيق لمرضى التأهيل الحركي' : 'Hyper-targeted prospective patients',
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: isAr ? 'نمو معدل التفاعل الإجمالي' : 'Overall Engagement Growth',
      value: '+43,576%',
      growth: 'Surge',
      hint: isAr ? 'قفزة تاريخية في تفاعل المتابعين' : 'Explosive patient resonance across channels',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: isAr ? 'مشاهدات فيديو لأكثر من ٣ ثوانٍ' : '3-Second Video Views',
      value: '654,500+',
      growth: '+120,522%',
      hint: isAr ? 'معدل انتباه واستماع استثنائي' : 'High retention on educational clinical reels',
      icon: <Video className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: isAr ? 'مشاهدات فيديو كاملة > ١ دقيقة' : '1-Minute Full Video Views',
      value: '12,200+',
      growth: '+204,600%',
      hint: isAr ? 'مرضى استمعوا للشرح الطبي بالكامل' : 'Patients watching comprehensive medical advice',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const interactionStats = [
    { label: isAr ? 'إجمالي التفاعل الحقيقي' : 'Total Engagements', value: '73,100+' },
    { label: isAr ? 'إعجاب وتفاعل مباشر' : 'Reactions', value: '12,700+' },
    { label: isAr ? 'استفسار وتعليق لحجز جلسات' : 'Patient Inquiries & Comments', value: '2,700+' },
    { label: isAr ? 'مشاركة للمحتوى التوعوي' : 'Shares', value: '484+' },
  ];

  return (
    <div className="bg-slate-950 text-white min-h-screen pb-24 text-start font-sans">
      {/* Dynamic OpenGraph, Twitter Cards & Structured Data */}
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/portfolio_crops/card_ipt.png"
        imageAlt={isAr ? 'دراسة حالة مركز IPT للعلاج الطبيعي - ديجيتال إفكت' : 'IPT Physiotherapy Center Case Study - Digital Effect'}
        urlPath="#ipt-case-study"
        type="article"
        publishedTime="2024-01-15T08:00:00Z"
        author="Digital Effect | ديجيتال إفكت للحلول الرقمية"
        section={isAr ? 'التسويق الطبي والرعاية الصحية' : 'Healthcare & Medical Marketing'}
        tags={['مركز IPT', 'علاج طبيعي', 'تسويق طبي', 'ديجيتال إفكت', 'Digital Effect', 'Medical Marketing', 'Physical Therapy Egypt', 'Meta Ads Healthcare']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: pageTitle,
          description: pageDescription,
          image: typeof window !== 'undefined' ? `${window.location.origin}/assets/portfolio_crops/card_ipt.png` : 'https://digitaleffect.net/assets/portfolio_crops/card_ipt.png',
          datePublished: '2024-01-15T08:00:00Z',
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
            '@type': 'MedicalBusiness',
            name: 'IPT International Physical Therapy Center',
            alternateName: 'مركز IPT للعلاج الطبيعي والتأهيل الحركي',
            medicalSpecialty: 'Physiotherapy'
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
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <button
              onClick={() => setCurrentPage('case-studies')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isAr ? 'دراسات الحالة والأعمال' : 'Case Studies'}
            </button>
            <span>/</span>
            <button
              onClick={() => setCurrentPage('medical')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isAr ? 'القطاع الطبي' : 'Medical Sector'}
            </button>
            <span>/</span>
            <span className="text-emerald-400 font-bold">
              {isAr ? 'مركز IPT للعلاج الطبيعي' : 'IPT Physiotherapy Center'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Social Share Button with Toast */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title={isAr ? 'مشاركة رابط دراسة الحالة عبر السوشيال ميديا' : 'Share case study link'}
            >
              {shareToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
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
              onClick={() => setCurrentPage('medical')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
            >
              <span>{isAr ? 'باقات القطاع الطبي' : 'Medical Packages'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Main Hero Header with Cinematic Medical Clinic Background */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pb-28 border-b border-slate-800 bg-slate-950">
        {/* Cinematic Medical Clinic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/ipt/ipt_hero_bg.jpg" 
            alt="IPT Medical Clinic Interior Background" 
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
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-7 text-start">
          {/* Client Logos & Tags Row */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-44 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl border border-white/20">
                <img
                  src="/assets/ipt/ipt_logo.png"
                  alt="IPT Physiotherapy Center Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'شريك ديجيتال إفكت المعتمد في القطاع الطبي' : 'Accredited Medical Partner'}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {isAr ? 'علاج طبيعي وتأهيل حركي · القاهرة — مصر' : 'Physiotherapy & Movement Rehab · Cairo — Egypt'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://digitaleffect.net/ipt/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors backdrop-blur-sm"
              >
                <span>{isAr ? 'رابط صفحة العميل الأصلية ↗' : 'Official Case Study Link ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'طلب خطة مشابهة لمركزك' : 'Request Similar Strategy'}</span>
              </button>
            </div>
          </div>

          {/* Headline and Narrative */}
          <div className="space-y-4 max-w-4xl text-start">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
              <span className="text-emerald-400 font-extrabold tracking-wider bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-500/30">MEDICAL SOCIAL MEDIA</span>
              <span>·</span>
              <span>FACEBOOK & INSTAGRAM</span>
              <span>·</span>
              <span>CLINICAL REELS & MOTION</span>
              <span>·</span>
              <span>{isAr ? 'المدة: ٦ أشهر' : 'Duration: 6 Months'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] drop-shadow-md">
              {isAr ? (
                <>
                  دراسة حالة مركز IPT للعلاج الطبيعي —{' '}
                  <span className="text-emerald-400 underline decoration-emerald-500 decoration-wavy underline-offset-8">
                    أثر رقمي ملموس
                  </span>{' '}
                  ونزوح حجوزات مؤكدة
                </>
              ) : (
                <>
                  IPT Physiotherapy Center —{' '}
                  <span className="text-emerald-400">Social Media Case Study</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-slate-200/90 font-light leading-relaxed max-w-3xl drop-shadow-sm">
              {isAr
                ? 'من مجرد التواجد على منصات التواصل إلى بناء أثر رقمي حقيقي وملموس. تحويل صفحة المركز إلى وجهة موثوقة تستقبل آلاف المتابعين واستفسارات الحجوزات اليومية لحالات آلام العمود الفقري والمفاصل والتأهيل الرياضي.'
                : 'From simply being present on social media to building measurable digital impact. Transforming the center’s social presence into an authoritative patient magnet generating consistent qualified bookings.'}
            </p>
          </div>

          {/* Quick KPI Highlights inside Hero Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-4xl">
            {[
              { val: '+43,576%', label: isAr ? 'نمو التفاعل الإجمالي' : 'Total Engagement' },
              { val: '2.4M+', label: isAr ? 'وصول حقيقي للمرضى' : 'Patient Reach' },
              { val: '1,800+', label: isAr ? 'استفسار حجز عيادات' : 'Bookings Inquiries' },
              { val: '4.8X', label: isAr ? 'عائد إنفاق إعلاني ROAS' : 'Campaign ROAS' },
            ].map((kpi, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
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
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-slate-950" />
              {isAr ? 'احجز استشارة لمركزك الطبي أو عيادتك' : 'Book Clinical Growth Consultation'}
            </button>

            <button
              onClick={() => setCurrentPage('medical')}
              className="px-5 py-3.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 backdrop-blur-sm transition-all cursor-pointer"
            >
              {isAr ? 'استعراض باقات القطاع الطبي' : 'View Medical Packages'}
            </button>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      {videos.length > 0 && (
        <CaseStudyVideoSection
          videos={videos}
          title={isAr ? 'مقاطع الفيديو والريلز الطبية لمركز IPT' : 'IPT Clinical Video Reels & Motion'}
          subtitle={isAr ? 'مقاطع توعوية وشروحات طبية للأخصائيين حققت ملايين المشاهدات' : 'Medical educational reels and specialist explanations reaching millions'}
          badgeText={isAr ? 'فيديوهات المركز والريلز' : 'Clinical Video Reel'}
          accentColor="emerald"
        />
      )}

      {/* Full-Size Creatives Gallery (Main Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'معرض المنشورات والبلان بالحجم الواضح الكامل' : 'Full-Resolution Creative Showcase'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'نماذج من المنشورات والتصاميم الطبية والبلان المنفذة' : 'Selected Campaign Creatives & Medical Posts'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'تصاميم بأبعادها الأصلية الكاملة تعكس الجودة الفنية، الهوية الطبية الراقية، وكتابة المحتوى الجاذب للمرضى. انقر على أي صورة لتكبيرها.'
              : 'Full portrait resolution showcasing premium medical aesthetics, clear Arabic typography, and clinical authority. Click any image to enlarge.'}
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
                className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all shadow-xl flex flex-col justify-between group"
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
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? 'تكبير التصميم' : 'Enlarge Image'}</span>
                    </div>
                  </div>
                </div>

                {/* Text Meta info */}
                <div className="p-6 space-y-2 text-start bg-slate-900/90 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">
                      {isAr ? `نموذج الحملة #${idx + 1}` : `Creative Asset #${idx + 1}`}
                    </span>
                    {itemTag && (
                      <span className="bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800 font-semibold text-[11px]">
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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'النتائج الرئيسية المدققة (Key Results)' : 'Audited Key Results'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'أرقام حقيقية تثبت الفارق بعد التدخل' : 'Audited Impact in Hard Numbers'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'تم قياس هذه المؤشرات عبر منصات Meta Ads و Business Suite على مدار ٦ أشهر مقارنة بالفترات السابقة للمركز.'
              : 'Measured directly on Meta Ads & Business Suite over 6 months compared to prior benchmark periods.'}
          </p>
        </div>

        {/* 4 Big KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {auditedMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-emerald-950/30 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-500/30">
                  {metric.icon}
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-500/40">
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

        {/* Supplementary Interaction Breakdown Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
            {isAr ? 'تفاصيل التفاعل المباشر مع المرضى:' : 'Direct Patient Interaction Breakdown:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-800">
            {interactionStats.map((stat, i) => (
              <div key={i} className="pt-3 sm:pt-0 sm:px-4 text-start space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-300 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audited Analytics Proof Banner (Full Width as Requested) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-6">
        <div className="text-start space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
            <Video className="w-3.5 h-3.5" />
            <span>{isAr ? 'تقرير الفيديو والتحليلات الرسمية (Videos & Reach Analytics)' : 'Audited Video & Reach Analytics'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'شيت التحليلات والنمو المعتمد من منصات Meta' : 'Official Meta Analytics Proof Sheet'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isAr 
              ? 'صورة الشيت التحليلي الكامل المأخوذ من الصفحة مباشرة، يوضح قفزة المشاهدات وتفاعل الفيديوهات بأبعادها الواضحة.' 
              : 'Full analytical chart showing explosive video retention, 3-sec views (+120,522%), and 1-min views (+204,600%).'}
          </p>
        </div>

        {/* Full-width image display with high clarity */}
        <div className="rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl relative group">
          <img
            src="/assets/ipt/ipt_stats_banner.jpg"
            alt="IPT Analytics Official Proof Banner"
            className="w-full h-auto object-cover max-h-[600px] hover:scale-[1.005] transition-transform duration-300"
          />
          <button
            onClick={() => setActiveLightboxImg({ url: '/assets/ipt/ipt_stats_banner.jpg', title: 'تقرير التحليلات المعتمد — مركز IPT للعلاج الطبيعي' })}
            className="absolute bottom-4 end-4 p-3 bg-slate-950/80 hover:bg-slate-900 text-white rounded-2xl border border-white/20 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'تكبير التقرير لفحص الأرقام' : 'Enlarge Analytics Sheet'}</span>
          </button>
        </div>
      </section>

      {/* Strategic Blueprint: Challenge vs Execution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Challenge */}
          <div className="bg-slate-900/90 rounded-3xl p-8 border border-rose-500/30 space-y-4 text-start relative overflow-hidden">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <h3 className="text-xl font-black text-white">
              {isAr ? 'التحدي قبل تدخل ديجيتال إفكت' : 'The Initial Challenge'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'كان مركز IPT يعاني من مجرد تواجد تقليدي شكلي على منصات التواصل الاجتماعي؛ منشورات روتينية خالية من الروح، وصول شبه منعدم للمرضى في النطاق الجغرافي المستهدف، وغياب المحتوى المرئي الذي يوضح خبرات الأخصائيين وتجهيزات المركز المتطورة، مما جعل المركز يخسر حصة سوقية كبيرة لصالح المنافسين.'
                : 'The center suffered from a routine, passive social media presence with near-zero patient reach. A lack of video demonstrations and clinical proof made prospective patients skeptical, failing to generate qualified inquiries.'}
            </p>
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-rose-400">
                {isAr ? 'أهم المعوقات المرصودة:' : 'Observed Bottlenecks:'}
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{isAr ? 'انعدام ثقة المريض بسبب غياب مقاطع الفيديو الحقيقية من داخل المركز' : 'Lack of patient trust due to zero authentic clinical video reels'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{isAr ? 'تشتت الإعلانات السابقة بدون استهداف دقيق لنطاق العيادة الجغرافي' : 'Scattered ad budgets without hyper-local radius targeting'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{isAr ? 'تراكم التعليقات والاستفسارات دون مسار تحويل فوري للحجز' : 'Inquiries left hanging without automated triage funnels'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Solution & Execution */}
          <div className="bg-slate-900/90 rounded-3xl p-8 border border-emerald-500/40 space-y-4 text-start relative overflow-hidden">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <h3 className="text-xl font-black text-white">
              {isAr ? 'استراتيجية ديجيتال إفكت للحل والنمو' : 'Our Solution & Growth Strategy'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'إعادة بناء الحضور الرقمي للمركز عبر منظومة متكاملة: صناعة فيديوهات ريلز تعليمية قصيرة وجذابة مع الأخصائيين، تصميم بوستات طبية تشرح أسباب الألم وكيفية الوقاية، وتفعيل إعلانات ميتا بنظام الاستهداف الذكي للمرضى المحتملين مع أتمتة الردود وحجز المواعيد.'
                : 'Complete repositioning across Facebook & Instagram: produced punchy educational clinical reels, designed informative anatomical carousels, and activated smart Advantage+ ad funnels linked directly to WhatsApp bookings.'}
            </p>
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-emerald-400">
                {isAr ? 'الركائز الاستراتيجية المنفذة:' : 'Implemented Strategy Pillars:'}
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'إنتاج وتصوير مقاطع ريلز وفيديوهات توعوية طبية دورية' : 'High-impact clinical video reels & physician explainers'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'حملات إعلانات موجهة لنطاق التجمع والمناطق السكنية المحيطة' : 'Hyper-local radius advertising capturing high-intent patients'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'مسار استجابة فورية عبر الواتساب يحول الاستفسار لحجز مؤكد' : 'Instant WhatsApp triage converting comments into bookings'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Client Quote & Testimonial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-3xl p-8 sm:p-12 border border-emerald-500/30 relative overflow-hidden text-start shadow-2xl">
          <Quote className="w-16 h-16 text-emerald-500/20 absolute top-6 end-6" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'شهادة العميل الشريك' : 'Partner Client Testimonial'}</span>
            </div>

            <p className="text-base sm:text-2xl font-medium text-slate-100 leading-relaxed italic">
              {isAr
                ? '«النتائج تخطت كل توقعاتنا؛ تحولنا من مجرد صفحة هادئة إلى مركز طبي يثق به الآلاف ويتفاعل معه المرضى يومياً. أسلوب ديجيتال إفكت في تصوير وشرح الحالات الطبية ملأ جدول المواعيد وجعلنا الخيار الأول لمرضى العلاج الطبيعي والتأهيل الحركي.»'
                : '“The results surpassed all our benchmarks. We transformed from a quiet page into a vibrant regional physiotherapy destination with fully booked treatment rooms thanks to Digital Effect’s strategic execution.”'}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center border border-slate-700 shadow-md">
                <img
                  src="/assets/ipt/ipt_logo.png"
                  alt="IPT Physiotherapy Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isAr ? 'إدارة مركز IPT للعلاج الطبيعي والتأهيل الحركي' : 'IPT Medical Administration'}
                </div>
                <div className="text-xs text-emerald-400">
                  {isAr ? 'شريك ديجيتال إفكت منذ ٢٠٢٦' : 'Digital Effect Partner'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-start flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-400/30">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{isAr ? 'حلول التسويق الطبي المتكامل' : 'Integrated Medical Growth Solutions'}</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {isAr 
                ? 'هل تدير مركزاً طبياً أو عيادة وترغب في تحقيق نتائج ونمو مماثل؟' 
                : 'Ready to replicate this clinical growth for your practice?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {isAr
                ? 'نقدم استشارات تسويق طبي وباقات متخصصة تشمل إنتاج الريلز، إعلانات الاستهداف الجغرافي، وإدارة الردود الطبية بما يضمن ملء جداول الكشف وجلسات التأهيل.'
                : 'We design tailored medical marketing systems covering video production, geo-targeted Meta ads, and automated patient booking pipelines.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="w-full sm:w-auto px-7 py-4 text-xs sm:text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all shadow-lg hover:shadow-emerald-400/20 cursor-pointer text-center whitespace-nowrap"
            >
              {isAr ? 'حجز جلسة استراتيجية لمركزك' : 'Book Medical Strategy Session'}
            </button>
            <a
              href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(isAr ? 'مرحباً ديجيتال إفكت، اطلعت على دراسة حالة مركز IPT وأود مناقشة خطة نمو لمركزي الطبي' : 'Hello Digital Effect, I reviewed the IPT case study and would like to discuss a growth plan for my medical center')}`}
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
