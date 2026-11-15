import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import {
  Share2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Quote,
  Maximize2,
  X,
  Palette,
  Copy,
  Check,
  Building2,
  Sliders,
  Compass,
  Play,
  Pause,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  Info,
  LayoutGrid,
  Film,
  Layers,
  Infinity as InfinityIcon
} from 'lucide-react';

export const UfarCaseStudyPage: React.FC = () => {
  const { data, language, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  // Primary View Mode: 'cinematic' (Full-Screen Scroll) or 'technical' (Grid & Guidelines)
  const [viewMode, setViewMode] = useState<'cinematic' | 'technical'>('cinematic');

  // Full-Screen Scroll State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [showCaptionCard, setShowCaptionCard] = useState(true);

  // Interactive Lightbox State
  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; title: string; desc?: string } | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Technical Explorer Tabs: 'touchpoints' | 'anatomy' | 'colors' | 'profile'
  const [explorerTab, setExplorerTab] = useState<'touchpoints' | 'anatomy' | 'colors' | 'profile'>('touchpoints');
  const [activeTouchpointFilter, setActiveTouchpointFilter] = useState<'all' | 'logo' | 'stationery'>('all');

  // Interactive Color Simulator
  const [previewBg, setPreviewBg] = useState<'light' | 'indigo' | 'coral'>('light');

  const pageTitle = isAr
    ? 'دراسة حالة يوفار UFAR (United For A Reason) | تصميم الهوية المؤسسية — ديجيتال إفكت'
    : 'UFAR (United For A Reason) Corporate Identity Case Study | Digital Effect';

  const pageDescription = isAr
    ? 'تصميم الهوية المؤسسية الكاملة لشركة يوفار (UFAR — United For A Reason) بالعاشر من رمضان: رمز الحلقة الثلاثية المتصلة، كروت العمل ثنائية الوجه، فولدر العروض، الورق الرسمي، وأظرف المراسلات.'
    : 'Complete corporate visual identity for UFAR (United For A Reason, 10th of Ramadan City): continuous 3D ribbon loop monogram, royal indigo & white business cards, corporate folder, letterhead, and coral-lined envelopes.';

  // Touchpoints with local high-resolution assets (5 curated slides from digitaleffect.net/ufar-2/)
  const touchpoints = [
    {
      id: 'tp-hero',
      category: 'logo',
      categoryLabel: isAr ? 'الشعار الموحد والتايبوجرافي' : 'Primary Monogram & Logotype',
      title: isAr ? 'شعار يوفار والتركيب النصي المعتمد (UFAR — United For A Reason)' : 'Official UFAR — United For A Reason Identity Lockup',
      desc: isAr
        ? 'رمز هندسي متصل ثلاثي الأبعاد يجسد الترابط والاتحاد (United For A Reason) بتدرجات النيلي الملكي والسيان والأرجواني والمرجاني، يقترن بتايبوجرافي مستقبلي نظيف يحمل اسم UFAR.'
        : 'Continuous interlocking 3D ribbon loop symbolizing unity ("United For A Reason") rendered in royal indigo, cyan, magenta, and vibrant coral, paired with geometric futuristic UFAR wordmark.',
      url: '/assets/case-studies/ufar/hero-logo.png',
      aspect: 'wide',
      badge: isAr ? 'الشعار المعتمد' : 'Official Mark',
    },
    {
      id: 'tp-cards',
      category: 'stationery',
      categoryLabel: isAr ? 'بطاقات العمل التنفيذية' : 'Business Cards',
      title: isAr ? 'بطاقات العمل ذات الوجهين بالنيلي الملكي والأبيض (Dual-Sided Cards)' : 'Executive Royal Indigo & Pure White Business Cards',
      desc: isAr
        ? 'كارت عمل مزدوج يدمج واجهة خلفية بالنيلي الملكي المشبع مع شعار أبيض ناصع وانحناءات طيفية بارزة، وواجهة أمامية بيضاء تضم بيانات التواصل الرسمية بالعاشر من رمضان وموقع ufar-eg.com.'
        : 'Dual-sided corporate business cards pairing a saturated royal indigo back stamped in white with a crisp white front displaying clean iconographic 10th of Ramadan & ufar-eg.com details.',
      url: '/assets/case-studies/ufar/business-card.png',
      aspect: 'wide',
      badge: isAr ? 'كروت الإدارة' : 'Executive Cards',
    },
    {
      id: 'tp-folder',
      category: 'stationery',
      categoryLabel: isAr ? 'فولدر العروض والعقود' : 'Corporate Folder',
      title: isAr ? 'فولدر التقديم المؤسسي وملفات التعاقد (Presentation Folder)' : 'Corporate Tender & Profile Presentation Folder',
      desc: isAr
        ? 'فولدر رسمي لحفظ ملفات العروض والتعاقدات يبرز انسيابية الحلقة المتداخلة من الحافة السفلية بألوانها المتدرجة الكاملة على خلفية بيضاء مشرقة تعزز حضور الشعار.'
        : 'High-impact A4 presentation pocket folder highlighting bold interlocking spectrum ribbons sweeping from the bottom spine across pristine matte white stock.',
      url: '/assets/case-studies/ufar/folder.png',
      aspect: 'tall',
      badge: isAr ? 'فولدر المشاريع' : 'Projects Folder',
    },
    {
      id: 'tp-stationery',
      category: 'stationery',
      categoryLabel: isAr ? 'المراسلات والورق الرسمي' : 'Letterhead Suite',
      title: isAr ? 'الورق الرسمي بالعلامة المائية الطيفية (Official Letterhead)' : 'A4 Official Letterhead & Translucent Ribbon Watermark',
      desc: isAr
        ? 'تصميم ورق المراسلات الرسمي A4 بلمسة مائية شفافة للشعار على الجانب الأيسر تمنح النصوص الرسمية مساحة قراءة رحبة ووضوحاً مثالياً مع تذييل بيانات الموقع والبريد info@ufar-eg.com.'
        : 'Executive A4 letterhead balancing clean reading margin with a delicate pastel watermark loop sweeping down the left edge and crisp ufar-eg.com footer typography.',
      url: '/assets/case-studies/ufar/stationery.png',
      aspect: 'tall',
      badge: isAr ? 'الورق الرسمي' : 'Official Letterhead',
    },
    {
      id: 'tp-envelopes',
      category: 'stationery',
      categoryLabel: isAr ? 'أظرف المراسلات الرسمية' : 'Corporate Envelopes',
      title: isAr ? 'أظرف المراسلات بالبطانة المرجانية البرتقالية (DL Envelopes)' : 'Custom DL Envelopes with Terracotta Coral Interior Lining',
      desc: isAr
        ? 'أظرف مراسلات أنيقة ببطانة داخلية بلون المرجان البرتقالي الدافئ مستوحاة من قلب الشعار، وتجمع في واجهتها بين العلامة المائية اللونية وبيانات العاشر من رمضان الرسمية.'
        : 'Bespoke DL correspondence envelopes finished with a saturated terracotta-coral internal lining echoing the emblem core alongside crisp 10th of Ramadan City coordinates.',
      url: '/assets/case-studies/ufar/envelopes.png',
      aspect: 'wide',
      badge: isAr ? 'أظرف المراسلات' : 'Envelopes Suite',
    },
  ];

  // Brand Color Palette with one-click copy
  const brandColors = [
    { name: isAr ? 'النيلي الملكي المتحد (Royal Indigo)' : 'Royal Indigo', hex: '#262F8A', cmyk: 'C:95 M:86 Y:6 K:0', pantone: 'PMS 2736 C', role: isAr ? 'اللون الأساسي لخلفيات الكروت والطرف الخارجي للحلقة المتصلة' : 'Primary executive surface & outer interlocking loop arm' },
    { name: isAr ? 'سيان الابتكار (Dynamic Cyan)' : 'Dynamic Cyan', hex: '#0088CE', cmyk: 'C:86 M:25 Y:0 K:0', pantone: 'PMS 2995 C', role: isAr ? 'مسارات التدفق الداخلي وأيقونات التواصل الرسمي في المطبوعات' : 'Inner flow highlights & crisp communication icons' },
    { name: isAr ? 'المرجاني النشط (Energetic Coral)' : 'Energetic Coral', hex: '#F25C2A', cmyk: 'C:0 M:78 Y:88 K:0', pantone: 'PMS 1655 C', role: isAr ? 'النواة الداخلية للشعار، بطانة الأظرف المميزة، والمسمى الوظيفي' : 'Emblem focal loop core, envelope inner lining & job titles' },
    { name: isAr ? 'بنفسجي الانتقال الطيفي (Spectrum Violet)' : 'Spectrum Violet', hex: '#8B2D7B', cmyk: 'C:50 M:92 Y:12 K:0', pantone: 'PMS 254 C', role: isAr ? 'حلقة الوصل اللونية بين الأزرق المؤسسي والمرجاني الحيوي' : 'Chromatic gradient bridge linking cool indigo to warm coral' },
  ];

  const scrollToSlide = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const slides = container.querySelectorAll('[data-slide-index]');
    if (slides[index]) {
      slides[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setCurrentSlideIndex(index);
    }
  }, []);

  const handleNextSlide = () => {
    if (currentSlideIndex < touchpoints.length - 1) {
      scrollToSlide(currentSlideIndex + 1);
    } else {
      scrollToSlide(0);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      scrollToSlide(currentSlideIndex - 1);
    }
  };

  useEffect(() => {
    if (viewMode !== 'cinematic') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-slide-index');
            if (indexAttr !== null) {
              setCurrentSlideIndex(parseInt(indexAttr, 10));
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.55,
      }
    );

    const slides = container.querySelectorAll('[data-slide-index]');
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== 'cinematic') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxImg) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        toggleNativeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentSlideIndex, activeLightboxImg]);

  useEffect(() => {
    if (!isAutoPlaying || viewMode !== 'cinematic') return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const next = (prev + 1) % touchpoints.length;
        scrollToSlide(next);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, viewMode, touchpoints.length, scrollToSlide]);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsNativeFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsNativeFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: pageTitle,
      text: pageDescription,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {}
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const filteredTouchpoints = activeTouchpointFilter === 'all'
    ? touchpoints
    : touchpoints.filter(tp => tp.category === activeTouchpointFilter);

  const activeSlide = touchpoints[currentSlideIndex] || touchpoints[0];

  void data;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-700 selection:text-white relative">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/ufar/hero-logo.png"
        urlPath="https://digitaleffect.net/ufar-2/"
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-[#262F8A] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-indigo-400/50 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-[#F25C2A]" />
          <span>{isAr ? 'تم نسخ رابط دراسة الحالة بنجاح!' : 'Case study link copied!'}</span>
        </div>
      )}

      {viewMode === 'cinematic' ? (
        /* ============================================================== */
        /* VIEW MODE 1: CINEMATIC FULL-SCREEN SCROLL (PURE WHITE BG)      */
        /* ============================================================== */
        <div className="relative w-full h-[100dvh] overflow-hidden bg-white select-none">
          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth focus:outline-none"
            tabIndex={0}
          >
            {touchpoints.map((tp, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <section
                  key={tp.id}
                  data-slide-index={idx}
                  className="relative w-full h-[100dvh] snap-start snap-always flex items-center justify-center overflow-hidden bg-white p-4 sm:p-8"
                >
                  {/* Subtle Clean Radial Background Accents */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(38,47,138,0.035)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

                  {/* Main Visual Frame */}
                  <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-24 sm:pb-28">
                    {/* Top slide identifier badge */}
                    <div className={`mb-3 transition-all duration-700 delay-100 flex items-center gap-2 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-xs">
                        {tp.badge}
                      </span>
                      <span className="text-xs text-slate-500 font-bold tracking-wide">
                        {tp.categoryLabel}
                      </span>
                    </div>

                    {/* Massive High-Definition Artwork Container */}
                    <div
                      onClick={() => setActiveLightboxImg({ url: tp.url, title: tp.title, desc: tp.desc })}
                      className="group relative w-full flex-1 max-h-[72vh] sm:max-h-[76vh] flex items-center justify-center cursor-zoom-in"
                    >
                      <img
                        src={tp.url}
                        alt={tp.title}
                        className={`max-h-[68vh] sm:max-h-[74vh] max-w-[94vw] sm:max-w-[86vw] w-auto h-auto object-contain drop-shadow-[0_20px_45px_rgba(38,47,138,0.12)] transition-all duration-700 ease-out transform ${
                          isActive
                            ? 'scale-100 opacity-100 translate-y-0 filter brightness-100'
                            : 'scale-95 opacity-30 translate-y-6 filter brightness-95'
                        } group-hover:scale-[1.015]`}
                      />

                      {/* Hover Magnify Prompt */}
                      <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 rounded-2xl bg-white/95 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xl pointer-events-none">
                        <Maximize2 className="w-4 h-4 text-indigo-700" />
                        <span>{isAr ? 'عرض الحجم الأصلي الفائق' : 'Inspect HD'}</span>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* FLOATING SIDE PROGRESS TRACK & QUICK JUMP DOTS                 */}
          {/* ============================================================== */}
          <aside className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3">
            {/* Number Indicator */}
            <div className="text-[11px] font-mono font-black text-indigo-800 bg-white px-2.5 py-1 rounded-xl border border-indigo-200 shadow-md">
              {String(currentSlideIndex + 1).padStart(2, '0')} / {String(touchpoints.length).padStart(2, '0')}
            </div>

            {/* Vertical Dots */}
            <div className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg">
              {touchpoints.map((tp, idx) => {
                const isCurrent = idx === currentSlideIndex;
                return (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => scrollToSlide(idx)}
                    className={`group relative transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? 'w-3 h-8 bg-gradient-to-b from-[#262F8A] via-[#8B2D7B] to-[#F25C2A] rounded-full shadow-md shadow-indigo-700/30'
                        : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400 rounded-full'
                    }`}
                    title={tp.title}
                  >
                    {/* Tooltip on hover */}
                    <span className="absolute end-full me-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                      {tp.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                title={isAr ? 'الصورة السابقة' : 'Previous'}
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                disabled={currentSlideIndex === touchpoints.length - 1}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                title={isAr ? 'الصورة التالية' : 'Next'}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* ============================================================== */}
          {/* FLOATING GLASSMORPHIC CAPTION CARD (LIGHT WHITE THEME)         */}
          {/* ============================================================== */}
          <div className="absolute bottom-4 sm:bottom-6 start-4 sm:start-8 z-30 max-w-xl w-[calc(100%-4rem)] sm:w-auto">
            {showCaptionCard ? (
              <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-slate-900/10 space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
                {/* Header with category and minimize button */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {activeSlide.badge}
                    </span>
                    <span className="text-xs text-[#F25C2A] font-bold">
                      {activeSlide.categoryLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCaptionCard(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={isAr ? 'إخفاء الشرح لعرض الصورة كاملة' : 'Hide info'}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {activeSlide.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 line-clamp-3">
                    {activeSlide.desc}
                  </p>
                </div>

                {/* Interactive Action Toolbar */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Auto-Play Tour Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAutoPlaying
                          ? 'bg-indigo-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={isAr ? 'تشغيل جولة آلية بين الصور' : 'Auto Play slides'}
                    >
                      {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isAutoPlaying ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'جولة آلية' : 'Auto')}</span>
                    </button>

                    {/* View mode toggle: Switch to technical explorer */}
                    <button
                      type="button"
                      onClick={() => setViewMode('technical')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                      title={isAr ? 'عرض الدليل والمواصفات الفنية' : 'Technical Specifications'}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-indigo-700" />
                      <span className="hidden sm:inline">{isAr ? 'الدليل الفني' : 'Specs'}</span>
                    </button>

                    {/* Native Fullscreen */}
                    <button
                      type="button"
                      onClick={toggleNativeFullscreen}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title={isAr ? 'ملء الشاشة الحقيقي (F)' : 'Fullscreen (F)'}
                    >
                      {isNativeFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>

                    {/* Share */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title={isAr ? 'مشاركة دراسة الحالة' : 'Share'}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Consultation Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsConsultationOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#262F8A] hover:bg-indigo-900 text-white shadow-md shadow-indigo-700/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F25C2A]" />
                    <span>{isAr ? 'طلب هوية مماثلة' : 'Get Identity'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Minimized Floating Re-open Pill */
              <button
                type="button"
                onClick={() => setShowCaptionCard(true)}
                className="bg-white/95 backdrop-blur-xl border border-slate-200 px-4 py-2 rounded-2xl shadow-xl text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-white transition-all hover:scale-105 cursor-pointer"
              >
                <Info className="w-4 h-4 text-indigo-700" />
                <span>{activeSlide.badge} — {activeSlide.title}</span>
                <ChevronUp className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW MODE 2: TECHNICAL EXPLORER & BRAND GUIDELINES (LIGHT BG)  */
        /* ============================================================== */
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          {/* Top Bar Switch Back to Cinematic */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-[#262F8A] via-[#8B2D7B] to-[#F25C2A] text-white shadow-md">
                <InfinityIcon className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? 'دليل المعايير والتحليل الفني — UFAR (United For A Reason)' : 'Technical Specifications & Brand System — UFAR'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isAr ? 'تشريح الحلقة الثلاثية المتصلة، لوحة التدرجات الطيفية، ومنظومة المطبوعات' : 'Interlocking ribbon loop anatomy, chromatic palette, and corporate stationery'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('cinematic')}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-[#262F8A] hover:bg-indigo-900 text-white shadow-md shadow-indigo-700/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>{isAr ? 'العودة للعرض السينمائي (Full Screen)' : 'Cinematic View'}</span>
              </button>
            </div>
          </div>

          {/* Explorer Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setExplorerTab('touchpoints')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'touchpoints'
                  ? 'bg-[#262F8A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{isAr ? 'معرض المطبوعات ونقاط الاتصال' : 'Touchpoints Gallery'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('anatomy')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'anatomy'
                  ? 'bg-[#262F8A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isAr ? 'تشريح الشعار المتصل والخطوط' : 'Monogram & Type Geometry'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('colors')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'colors'
                  ? 'bg-[#262F8A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isAr ? 'باليت التدرجات والألوان المعتمدة' : 'Spectrum Color Palette'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('profile')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'profile'
                  ? 'bg-[#262F8A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'عن يوفار (United For A Reason)' : 'About UFAR'}</span>
            </button>
          </div>

          {/* TAB 1: TOUCHPOINTS GRID */}
          {explorerTab === 'touchpoints' && (
            <div className="space-y-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">{isAr ? 'التصنيف:' : 'Filter:'}</span>
                {[
                  { id: 'all', label: isAr ? 'كافة النماذج (5)' : 'All Items (5)' },
                  { id: 'logo', label: isAr ? 'الشعار والتركيب النصي' : 'Logomark' },
                  { id: 'stationery', label: isAr ? 'المطبوعات والفولدرات' : 'Stationery & Folders' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTouchpointFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTouchpointFilter === tab.id
                        ? 'bg-[#262F8A] text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTouchpoints.map((tp) => (
                  <div
                    key={tp.id}
                    onClick={() => setActiveLightboxImg({ url: tp.url, title: tp.title, desc: tp.desc })}
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 p-4 shadow-sm hover:shadow-xl transition-all cursor-zoom-in flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-4">
                      <img
                        src={tp.url}
                        alt={tp.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-indigo-800 border border-indigo-200 shadow-sm">
                        {tp.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                        {tp.categoryLabel}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors mt-0.5">
                        {tp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {tp.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 font-bold">
                      <span>{isAr ? 'تكبير وفحص التفاصيل ↗' : 'Inspect HD ↗'}</span>
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GEOMETRY & ANATOMY */}
          {explorerTab === 'anatomy' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-indigo-700 uppercase">Continuous Unity Monogram</span>
                    <h3 className="text-xl font-black text-slate-900">{isAr ? 'تشريح الحلقة المتداخلة والخط المستقبلي' : 'Interlocking Loop & Geometric Wordmark Anatomy'}</h3>
                  </div>
                  <span className="p-3 rounded-2xl bg-indigo-50 text-indigo-700">
                    <Layers className="w-6 h-6" />
                  </span>
                </div>

                <div className="relative aspect-video rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-6">
                  <img
                    src="/assets/case-studies/ufar/hero-logo.png"
                    alt="UFAR Monogram Anatomy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#262F8A]" />
                      <span>{isAr ? 'شريط الترابط اللامتناهي (3D Loop)' : '3D Intertwined Unity Ribbon'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? 'شريط هندسي متصل يلتف حول محور مركزي واحد ليعكس فلسفة UNITED FOR A REASON (متحدون لهدف) بمرونة حركية وبساطة قابلة للتطبيق.'
                        : 'Single continuous folded ribbon curving smoothly around a unifying center axis, visually anchoring the United For A Reason motto.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#F25C2A]" />
                      <span>{isAr ? 'الخط المستقبلي المنحني (Geometric Display)' : 'Bespoke Rounded Futurist Type'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? 'خط مخصص بحروف مفتوحة وانحناءات متوازنة لاسمي UFAR والشعار اللفظي تحته، مما يضمن وضوح القراءة في الأختام واللافتات والويب.'
                        : 'Precision open-stroke geometric letterforms with uniform radius bends matching the ribbon curvature at both macro and stationery scale.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#262F8A] text-white rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[#F25C2A]">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase">{isAr ? 'فلسفة الاتحاد والانطلاق — United For A Reason' : 'United For A Reason Philosophy'}</h4>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    {isAr
                      ? 'صُممت هوية UFAR لتعكس روح الشراكة المتكاملة بين الكيانات والقدرات الصناعية في مدينة العاشر من رمضان. التكوين الطيفي يمزج بين رزانه النيلي المؤسسي وحيوية المرجاني البرتقالي المبتكر.'
                      : 'Crafted to represent collaborative purpose and shared industrial momentum in 10th of Ramadan City—bridging deep corporate trust with dynamic forward-looking energy.'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">{isAr ? 'حزمة المطبوعات ونقاط الاتصال' : 'Deliverables Rollout Suite'}</h4>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{isAr ? 'شعار الشريط الثلاثي المتصل والنسخة المعكوسة البيضاء' : '3D Ribbon Monogram & Pure Reversed White Lockup'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{isAr ? 'كروت عمل وجه نيلي ملكي مشبع ووجه أبيض بمعلومات دقيقة' : 'Two-Sided Royal Indigo & White Business Cards'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{isAr ? 'فولدر عروض مؤسسي بالانحناءات الطيفية الكاملة' : 'Full-Spectrum Corporate Presentation Pocket Folder'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{isAr ? 'ورق مراسلات رسمي بعلامة مائية وأظرف مبطنة بالمرجاني' : 'Pastel Watermark A4 Letterhead & Coral-Lined Envelopes'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COLORS */}
          {explorerTab === 'colors' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {brandColors.map((color) => (
                  <div
                    key={color.hex}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all space-y-4"
                  >
                    <div
                      className="w-full h-32 rounded-2xl border border-slate-200/50 shadow-inner flex items-end justify-end p-3"
                      style={{ backgroundColor: color.hex }}
                    >
                      <button
                        type="button"
                        onClick={() => copyColor(color.hex)}
                        className="px-2.5 py-1 rounded-xl bg-white/95 text-slate-900 text-[11px] font-mono font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedColor === color.hex ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{color.hex}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">{color.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{color.role}</p>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">HEX:</span>
                        <span className="font-bold">{color.hex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">CMYK:</span>
                        <span>{color.cmyk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PANTONE:</span>
                        <span>{color.pantone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contrast Simulator */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {isAr ? 'محاكي التباين اللوني على الأسطح المعتمدة' : 'Substrate Contrast Simulator'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'اختبر وضوح شعار UFAR على الورق الأبيض والنيلي الملكي والمرجاني البرتقالي' : 'Preview UFAR monogram visibility across white stock, royal indigo, and coral orange'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'light' ? 'bg-white border-indigo-600 text-slate-900 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isAr ? 'أبيض ناصع' : 'Pure White'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('indigo')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'indigo' ? 'bg-[#262F8A] border-[#F25C2A] text-white shadow-sm' : 'bg-[#262F8A]/85 border-indigo-500 text-indigo-100'
                      }`}
                    >
                      {isAr ? 'نيلي ملكي' : 'Royal Indigo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('coral')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'coral' ? 'bg-[#F25C2A] border-white text-white shadow-sm' : 'bg-[#F25C2A]/85 border-orange-300 text-white'
                      }`}
                    >
                      {isAr ? 'مرجاني دافئ' : 'Energetic Coral'}
                    </button>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl flex items-center justify-center transition-colors duration-500 min-h-[220px] ${
                  previewBg === 'light'
                    ? 'bg-white border border-slate-200'
                    : previewBg === 'indigo'
                    ? 'bg-[#262F8A]'
                    : 'bg-[#F25C2A]'
                }`}>
                  <img
                    src="/assets/case-studies/ufar/hero-logo.png"
                    alt="UFAR Logo Preview"
                    className={`max-h-24 max-w-sm object-contain transition-all ${
                      previewBg !== 'light' ? 'filter brightness-0 invert drop-shadow-lg' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY PROFILE */}
          {explorerTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-xs font-black text-indigo-700 uppercase">Corporate Identity Architecture</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {isAr ? 'شركة يوفار (UFAR — United For A Reason)' : 'UFAR — United For A Reason'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {isAr ? 'مدينة العاشر من رمضان، مصر • www.ufar-eg.com' : '10th of Ramadan City, Egypt • www.ufar-eg.com'}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isAr
                    ? 'مؤسسة أعمال متنامية انطلقت من مدينة العاشر من رمضان بشعار "متحدون لهدف" (United For A Reason)، احتاجت إلى هوية بصرية معاصرة توحد حضورها في التعاقدات المؤسسية والمراسلات الرسمية عبر لغة تصميم ثلاثية الأبعاد نابضة بالطاقة والاحترافية.'
                    : 'A dynamic commercial enterprise operating from 10th of Ramadan City under the motto "United For A Reason", requiring a forward-looking corporate identity that unifies executive tenders, client stationery, and B2B communications.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'الشعار اللفظي' : 'Brand Motto'}</span>
                    <div className="text-base font-black text-slate-900">United For A Reason</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'متحدون لهدف مشترك' : 'Shared Purpose Unity'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المقر' : 'Headquarters'}</span>
                    <div className="text-lg font-black text-slate-900">{isAr ? 'العاشر من رمضان' : '10th of Ramadan'}</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'جمهورية مصر العربية' : 'Egypt'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'التصنيف' : 'Category'}</span>
                    <div className="text-lg font-black text-slate-900">Corporate ID</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'الهوية المؤسسية B2B' : 'Corporate B2B'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-indigo-900">{isAr ? 'البيانات الرسمية والصفحة المرجعية' : 'Official Brand Reference'}</h5>
                    <p className="text-[11px] text-indigo-800 font-medium">ufar-eg.com • info@ufar-eg.com • +2 010 162 92000</p>
                  </div>
                  <a
                    href="https://digitaleffect.net/ufar-2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#262F8A] hover:bg-indigo-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{isAr ? 'الرابط المرجعي' : 'View Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#262F8A] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#F25C2A] uppercase">{isAr ? 'شهادة العميل' : 'Client Testimonial'}</span>
                  <Quote className="w-8 h-8 text-[#F25C2A]/40" />
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                    {isAr
                      ? '"ترجمت ديجيتال إفكت فلسفة United For A Reason إلى شعار متصل وتطبيقات مطبوعات مبهرة بالنيلي الملكي والمرجاني، منحت شركة يوفار حضوراً فريداً وتكاملاً بصرياً عالي المستوى."'
                      : '"Digital Effect translated our United For A Reason ethos into an iconic interlocking emblem and vivid royal indigo & coral stationery suite that gives UFAR instant executive stature."'}
                  </p>
                </div>

                <div className="pt-4 border-t border-indigo-700 space-y-1">
                  <h6 className="text-xs font-black text-white">{isAr ? 'الإدارة التنفيذية — يوفار UFAR' : 'Executive Management — UFAR'}</h6>
                  <p className="text-[11px] text-indigo-200">UFAR (United For A Reason) — 10th of Ramadan City, Egypt</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#F25C2A] hover:bg-orange-600 text-white text-xs font-black transition-all shadow-lg shadow-orange-950/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'طلب هوية مؤسسية لشركتك' : 'Request Corporate Identity'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ULTRA HIGH-DEFINITION LIGHTBOX MODAL                           */}
      {/* ============================================================== */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl max-h-[92vh] w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-black text-slate-900">{activeLightboxImg.title}</h4>
                {activeLightboxImg.desc && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{activeLightboxImg.desc}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveLightboxImg(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-white min-h-[450px]">
              <img
                src={activeLightboxImg.url}
                alt={activeLightboxImg.title}
                className="max-h-[75vh] w-auto max-w-full object-contain drop-shadow-xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs">
              <span className="text-slate-500 font-mono">UFAR (United For A Reason) — 10th of Ramadan City, Egypt • Corporate Identity</span>
              <a
                href={activeLightboxImg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
              >
                <span>{isAr ? 'فتح الصورة بالحجم الكامل ↗' : 'Open Full Res ↗'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
