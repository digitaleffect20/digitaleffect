import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import { 
  ArrowLeft, 
  ArrowRight, 
  Share2,
  ExternalLink, 
  Eye, 
  TrendingUp, 
  Building2, 
  Users, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Quote, 
  Maximize2,
  X,
  ShieldCheck,
  Briefcase,
  Layers,
  Palette,
  Copy,
  Check,
  Cog,
  Factory,
  Package,
  Wrench,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Compass,
  Play,
  Pause,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  Info,
  LayoutGrid,
  Film
} from 'lucide-react';

export const PremiumCaseStudyPage: React.FC = () => {
  const { data, language, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2b-premium') || data.caseStudies[0];

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
  const [activeTouchpointFilter, setActiveTouchpointFilter] = useState<'all' | 'logo' | 'stationery' | 'catalog'>('all');

  // Interactive Color Simulator
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'crimson'>('light');

  const pageTitle = isAr 
    ? 'دراسة حالة بريميوم Premium | تصميم الهوية المؤسسية والكتالوج الصناعي — ديجيتال إفكت' 
    : 'Premium Machinery & Equipment Corporate Identity Case Study | Digital Effect';

  const pageDescription = isAr
    ? 'تصميم وبناء الهوية المؤسسية المتكاملة لشركة بريميوم لمعدات وآلات التعبئة والتغليف: الشعار الميكانيكي، الكتالوج الفني، فولدر العروض، ومنظومة المطبوعات الرسمية.'
    : 'Comprehensive industrial corporate identity and product catalogue design for Premium Machinery & Equipment by Digital Effect.';

  // High-resolution local assets for Premium Case Study (6 curated slides)
  const touchpoints = [
    {
      id: 'tp-hero',
      category: 'logo',
      categoryLabel: isAr ? 'الشعار والهوية' : 'Logomark',
      title: isAr ? 'الشعار والتركيبة المعتمدة (Official Premium Logomark)' : 'Official Premium Logomark & Lockup',
      desc: isAr ? 'الشعار المبتكر يدمج الحرف P مع مسار حركة تروس صناعية وسير ناقل يرمز للإنتاجية المستمرة والدقة الهندسية في خطوط التعبئة والتغليف.' : 'Engineered logomark fusing the letter "P" with an industrial gear and mechanical conveyor track, symbolizing continuous factory automation.',
      url: '/assets/case-studies/premium/hero-logo.png',
      aspect: 'wide',
      badge: isAr ? 'الشعار المعتمد' : 'Official Mark',
    },
    {
      id: 'tp-cards',
      category: 'stationery',
      categoryLabel: isAr ? 'المطبوعات الفاخرة' : 'Business Cards',
      title: isAr ? 'بطاقات العمل التنفيذية (Executive Business Cards)' : 'Smart QR Executive Business Cards',
      desc: isAr ? 'تصميم ذو وجهين باللون الكحلي الصناعي الفاخر مع خلفية بيضاء وبصمة الترس ورمز الاستجابة السريعة QR للتواصل المباشر مع المهندسين والإدارة.' : 'Dual-tone executive business cards pairing deep slate navy with pure white and direct QR code routing to engineering sales.',
      url: '/assets/case-studies/premium/business-card.png',
      aspect: 'wide',
      badge: isAr ? 'كروت العمل الذكية' : 'Smart Cards',
    },
    {
      id: 'tp-folder',
      category: 'stationery',
      categoryLabel: isAr ? 'المطبوعات والتعاقدات' : 'Proposal Folder',
      title: isAr ? 'فولدر العروض الفنية والتعاقدات (Corporate Proposals Folder)' : 'Technical Tender & Proposal Presentation Folder',
      desc: isAr ? 'فولدر مخصص لحفظ العروض الفنية والكتالوجات ومواصفات الماكينات المقدمة للمصانع الكبرى، مبرزاً الأيقونة الميكانيكية بقطع فني مهيب.' : 'Custom precision die-cut folder engineered to hold machine specifications and factory tenders with authoritative enterprise prestige.',
      url: '/assets/case-studies/premium/folder.png',
      aspect: 'video',
      badge: isAr ? 'فولدر العروض الفنية' : 'Proposals Folder',
    },
    {
      id: 'tp-stationery',
      category: 'stationery',
      categoryLabel: isAr ? 'المراسلات الرسمية' : 'Letterhead Suite',
      title: isAr ? 'الأوراق الرسمية والمراسلات (Official Letterhead & Invoicing)' : 'Corporate Letterhead & Formal Invoicing Suite',
      desc: isAr ? 'تصميم متناسق للخطابات الرسمية والفواتير والاتفاقيات مع هوامش معتمدة للأختام والبيانات القانونية وعلامة مائية رقيقة للترس الصناعي.' : 'Standardized corporate letterhead with subtle watermarked gear geometry and dedicated zones for engineering specifications and signatures.',
      url: '/assets/case-studies/premium/stationery.png',
      aspect: 'tall',
      badge: isAr ? 'الورق الرسمي' : 'Official Letterhead',
    },
    {
      id: 'tp-envelopes',
      category: 'stationery',
      categoryLabel: isAr ? 'أظرف المراسلات' : 'Envelopes',
      title: isAr ? 'أظرف المراسلات والمستندات (Official Corporate Envelopes)' : 'Corporate Correspondence & Document Envelopes',
      desc: isAr ? 'أظرف بريدية رسمية فاخرة باللون الكحلي الداكن ولمسة حمراء ميكانيكية تمنح المراسلات والمناقصات طابعاً ريادياً عند تسليمها للعملاء.' : 'Executive mailing envelopes engineered with dark slate tones and crimson gear motifs for technical tender deliveries.',
      url: '/assets/case-studies/premium/envelopes.jpg',
      aspect: 'wide',
      badge: isAr ? 'أظرف المراسلات' : 'Envelopes Suite',
    },
    {
      id: 'tp-catalog',
      category: 'catalog',
      categoryLabel: isAr ? 'الكتالوج والبروفايل' : 'Capabilities Catalog',
      title: isAr ? 'الكتالوج التعريفي وبروفايل الشركة (Company Profile & Product Catalog)' : 'Corporate Capabilities Profile & Equipment Catalogue',
      desc: isAr ? 'كتالوج فني شامل يستعرض تاريخ تأسيس الشركة، رؤيتها، شركاء التوريد الدوليين، وخطوط الإنتاج المتطورة لماكينات الأغذية والتعبئة والتغليف.' : 'Comprehensive industrial catalogue showcasing factory automation, international supplier partnerships, and turnkey packaging lines.',
      url: '/assets/case-studies/premium/catalog.png',
      aspect: 'wide',
      badge: isAr ? 'الكتالوج الفني الشامل' : 'Capabilities Catalog',
    },
  ];

  // Brand Color Palette with one-click copy
  const brandColors = [
    { name: isAr ? 'أحمر ميكانيكي (Mechanical Crimson)' : 'Mechanical Crimson', hex: '#E31E24', cmyk: 'C:0 M:95 Y:90 K:0', pantone: 'PMS 185 C', role: isAr ? 'اللون التفاعلي للأيقونة والتروس الميكانيكية' : 'Dynamic accent for gear and kinetic track' },
    { name: isAr ? 'كحلي صناعي داكن (Industrial Slate Navy)' : 'Industrial Slate Navy', hex: '#2B3445', cmyk: 'C:78 M:65 Y:45 K:40', pantone: 'PMS 432 C', role: isAr ? 'اللون الأساسي للنصوص وثقل الهوية والمطبوعات' : 'Dominant authoritative dark slate for typography & packaging' },
    { name: isAr ? 'أبيض ناصع نقي (Pure White)' : 'Pure Clean White', hex: '#FFFFFF', cmyk: 'C:0 M:0 Y:0 K:0', pantone: 'Pure White', role: isAr ? 'المساحات السلبية والتباين النقي' : 'High-contrast negative space & technical clarity' },
    { name: isAr ? 'فضي تيتانيوم تقني (Technical Titanium)' : 'Technical Titanium', hex: '#F1F5F9', cmyk: 'C:5 M:3 Y:2 K:0', pantone: 'Cool Gray 1 C', role: isAr ? 'خلفيات الكروت والأظرف والمخططات' : 'Subtle mechanical backgrounds & technical blueprint grids' },
  ];

  // Slide navigation helpers
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

  // Observe active slide while scrolling
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

  // Keyboard navigation for cinematic view
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

  // Auto-Play Tour
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

  // Sync Native Fullscreen
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

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-rose-600 selection:text-white relative">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/premium/hero-logo.png"
        urlPath="https://digitaleffect.net/premium/"
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-rose-600 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-rose-400 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4" />
          <span>{isAr ? 'تم نسخ رابط دراسة الحالة بنجاح!' : 'Case study link copied!'}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW MODE 1: CINEMATIC FULL-SCREEN SCROLL (WHITE BACKGROUND)    */}
      {/* ============================================================== */}
      {viewMode === 'cinematic' ? (
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(227,30,36,0.035)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

                  {/* Main Visual Frame */}
                  <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-24 sm:pb-28">
                    {/* Top slide identifier badge */}
                    <div className={`mb-3 transition-all duration-700 delay-100 flex items-center gap-2 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
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
                        className={`max-h-[68vh] sm:max-h-[74vh] max-w-[94vw] sm:max-w-[86vw] w-auto h-auto object-contain drop-shadow-[0_20px_45px_rgba(15,23,42,0.12)] transition-all duration-700 ease-out transform ${
                          isActive 
                            ? 'scale-100 opacity-100 translate-y-0 filter brightness-100' 
                            : 'scale-95 opacity-30 translate-y-6 filter brightness-95'
                        } group-hover:scale-[1.015]`}
                      />

                      {/* Hover Magnify Prompt */}
                      <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 rounded-2xl bg-white/95 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xl pointer-events-none">
                        <Maximize2 className="w-4 h-4 text-rose-600" />
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
            <div className="text-[11px] font-mono font-black text-rose-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-md">
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
                        ? 'w-3 h-8 bg-gradient-to-b from-rose-600 to-rose-400 rounded-full shadow-md shadow-rose-500/40' 
                        : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400 rounded-full'
                    }`}
                    title={tp.title}
                  >
                    {/* Tooltip on hover */}
                    <span className="absolute end-full me-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
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
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {activeSlide.badge}
                    </span>
                    <span className="text-xs text-rose-600 font-bold">
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
                          ? 'bg-rose-600 text-white shadow-sm' 
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
                      <LayoutGrid className="w-3.5 h-3.5 text-rose-600" />
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
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
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
                <Info className="w-4 h-4 text-rose-600" />
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
              <span className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md">
                <Cog className="w-5 h-5 animate-spin-slow" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? 'دليل المعايير والتحليل الفني — Premium Machinery' : 'Technical Specifications & Brand System — Premium'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isAr ? 'الهندسة الميكانيكية للرمز، لوحة الألوان، ومنظومة المطبوعات' : 'Mechanical geometry, color specifications, and corporate collateral'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('cinematic')}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer"
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
                  ? 'bg-rose-600 text-white shadow-md'
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
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Cog className="w-4 h-4" />
              <span>{isAr ? 'الهندسة والترس الميكانيكي' : 'Mechanical Geometry'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('colors')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'colors'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isAr ? 'لوحة الألوان المعتمدة' : 'Color System'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('profile')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'profile'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>{isAr ? 'عن الشركة وخطوط الإنتاج' : 'Company & Capabilities'}</span>
            </button>
          </div>

          {/* TAB 1: TOUCHPOINTS GRID */}
          {explorerTab === 'touchpoints' && (
            <div className="space-y-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">{isAr ? 'التصنيف:' : 'Filter:'}</span>
                {[
                  { id: 'all', label: isAr ? 'كافة النماذج (6)' : 'All Items (6)' },
                  { id: 'logo', label: isAr ? 'الشعار والهوية' : 'Logomark' },
                  { id: 'stationery', label: isAr ? 'المطبوعات والمراسلات' : 'Stationery' },
                  { id: 'catalog', label: isAr ? 'الكتالوج والبروفايل' : 'Catalog' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTouchpointFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTouchpointFilter === tab.id
                        ? 'bg-rose-600 text-white shadow-sm'
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
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-rose-400 p-4 shadow-sm hover:shadow-xl transition-all cursor-zoom-in flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-4">
                      <img
                        src={tp.url}
                        alt={tp.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-rose-700 border border-slate-200 shadow-sm">
                        {tp.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                        {tp.categoryLabel}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-rose-600 transition-colors mt-0.5">
                        {tp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {tp.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
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
                    <span className="text-xs font-black text-rose-600 uppercase">Mechanical Architecture</span>
                    <h3 className="text-xl font-black text-slate-900">{isAr ? 'الهندسة الميكانيكية للرمز والترس' : 'Mechanical Symbol Anatomy'}</h3>
                  </div>
                  <span className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                    <Cog className="w-6 h-6 animate-spin-slow" />
                  </span>
                </div>

                <div className="relative aspect-video rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-6">
                  <img
                    src="/assets/case-studies/premium/hero-logo.png"
                    alt="Premium Mechanical Anatomy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Cog className="w-4 h-4 text-rose-600" />
                      <span>{isAr ? 'الترس الصناعي (Industrial Gear)' : 'Industrial Cogwheel'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr ? 'ترس داخلي ذو 8 أسنان ميكانيكية يرمز للقوة وعزم الدوران والدقة التكنولوجية في ماكينات الأغذية.' : 'Precision 8-tooth mechanical cogwheel representing rotational power and automation reliability.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-rose-600" />
                      <span>{isAr ? 'مسار السير الناقل (Conveyor Track)' : 'Conveyor Track Profile'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr ? 'تحويل الحرف P إلى سير ناقل ذو أسنان دقيقة يعكس خطوط التعبئة والتغليف المستمرة دون توقف.' : 'The letter P contour mirrors industrial packaging conveyor belts for non-stop assembly lines.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase">{isAr ? 'فلسفة الهوية الصناعية' : 'Industrial Brand Philosophy'}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr
                      ? 'تم بناء هوية شركة بريميوم على مبدأ "الدقة الهندسية المتدفقة". لم يكن الهدف مجرد تصميم شعار، بل خلق بصمة بصرية يمكن تصنيعها كقطع ميكانيكية، حفرها بالليزر على الماكينات، وطباعتها على كافة الكتالوجات والعروض الفنية بأعلى درجات الهيبة والوقار الصناعي.'
                      : 'The identity rests on continuous engineering precision. Built to be laser-engraved onto packaging machinery, embossed on presentation binders, and showcased in enterprise bids.'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">{isAr ? 'تطبيقات الهوية المعتمدة' : 'Certified Rollout Scope'}</h4>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'كتالوج المنتجات والماكينات (40+ صفحة)' : 'Turnkey Product Catalog (40+ Pages)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'فولدرات العقود والمناقصات الهندسية' : 'Technical Tender Proposal Folders'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'كروت عمل ذكية بباركود التواصل المباشر' : 'Smart Contact QR Business Cards'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'منظومة الأوراق الرسمية والمراسلات والأظرف' : 'Official Letterhead & Envelope Suite'}</span>
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
                      {isAr ? 'محاكي التباين اللوني على الأسطح والمواد' : 'Surface Contrast Simulator'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'اختبر ظهور الشعار والأيقونة الميكانيكية فوق مختلف درجات الأسطح الصناعية' : 'Test logo visibility on industrial substrates'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'light' ? 'bg-white border-rose-500 text-slate-900 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isAr ? 'أبيض ناصع' : 'Light White'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('dark')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'dark' ? 'bg-slate-900 border-rose-500 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {isAr ? 'كحلي داكن' : 'Dark Slate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('crimson')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'crimson' ? 'bg-rose-600 border-white text-white shadow-sm' : 'bg-rose-500 border-rose-400 text-white/90'
                      }`}
                    >
                      {isAr ? 'أحمر ميكانيكي' : 'Crimson Accent'}
                    </button>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl flex items-center justify-center transition-colors duration-500 min-h-[220px] ${
                  previewBg === 'light' 
                    ? 'bg-white border border-slate-200' 
                    : previewBg === 'dark' 
                    ? 'bg-[#2B3445]' 
                    : 'bg-[#E31E24]'
                }`}>
                  <img
                    src="/assets/case-studies/premium/hero-logo.png"
                    alt="Logo Preview"
                    className={`max-h-24 max-w-sm object-contain transition-all ${
                      previewBg !== 'light' ? 'filter brightness-0 invert drop-shadow-lg' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY PROFILE & CAPABILITIES */}
          {explorerTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-xs font-black text-rose-600 uppercase">Industrial Partner</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {isAr ? 'شركة بريميوم للآلات والمعدات (Premium Machinery & Equipment)' : 'Premium Machinery & Equipment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {isAr ? 'مدينة العاشر من رمضان، مصر — رواد ماكينات التعبئة والتغليف والأغذية' : '10th of Ramadan City, Egypt — Food & Packaging Machinery Leaders'}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isAr
                    ? 'تأسست شركة بريميوم في عام 2020 كشركة هندسية متخصصة في خدمات وماكينات التعبئة والتغليف والصناعات الغذائية. تطورت الشركة لتصبح من كبرى الموردين لخطوط الإنتاج المتطورة بالشراكة مع نخبة من المصنعين الدوليين في أوروبا وآسيا، مع تركيز استراتيجي فائق على خدمات ما بعد البيع، الصيانة الدورية، وتوفير قطع الغيار الأصلية.'
                    : 'Established in 2020, Premium Machinery Company was originally founded as a service and engineering company and has evolved to become a high-quality food machinery and packaging supplier with key emphasis on after-sales support.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'سنة التأسيس' : 'Founded'}</span>
                    <div className="text-lg font-black text-slate-900">2020</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'خدمات وهندسة وتوريد' : 'Engineering & Supply'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المقر الرئيسي' : 'Headquarters'}</span>
                    <div className="text-lg font-black text-slate-900">{isAr ? 'العاشر من رمضان' : '10th of Ramadan'}</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'قلب الصناعة المصرية' : 'Industrial Capital'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'التخصص' : 'Core Focus'}</span>
                    <div className="text-lg font-black text-slate-900">{isAr ? 'ماكينات الأغذية' : 'Packaging'}</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'تعبئة وتغليف آلي' : 'Automation & Turnkey'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-rose-900">{isAr ? 'زيارة الموقع الرسمي للشركة' : 'Official Company Website'}</h5>
                    <p className="text-[11px] text-rose-700 font-medium">premiummachinery.net</p>
                  </div>
                  <a
                    href="https://digitaleffect.net/premium/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{isAr ? 'الرابط المرجعي' : 'View Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-black text-rose-400 uppercase">{isAr ? 'شهادة العميل' : 'Client Testimonial'}</span>
                  <Quote className="w-8 h-8 text-rose-500/40" />
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {isAr
                      ? '"تصميم الهوية والكتالوج من ديجيتال إفكت أعطى شركتنا وزناً وثقة كبرى أمام كبار مصنعي الأغذية والأدوية. الأيقونة الميكانيكية عكست جوهر عملنا بدقة فائقة والمطبوعات تركت انطباعاً مبهراً في كافة الاجتماعات التعاقدية."'
                      : '"The corporate identity and product catalogue developed by Digital Effect gave us immense authority in front of major food and pharmaceutical manufacturers. It perfectly captured our core engineering excellence."'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-1">
                  <h6 className="text-xs font-black text-white">{isAr ? 'الإدارة التنفيذية' : 'Executive Management'}</h6>
                  <p className="text-[11px] text-slate-400">Premium Machinery & Equipment</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
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
              <span className="text-slate-500 font-mono">Premium Machinery & Equipment — Corporate Identity</span>
              <a
                href={activeLightboxImg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
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
