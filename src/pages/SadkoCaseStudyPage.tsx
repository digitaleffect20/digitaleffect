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
  Factory,
  Layers
} from 'lucide-react';

export const SadkoCaseStudyPage: React.FC = () => {
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
  const [previewBg, setPreviewBg] = useState<'light' | 'slate' | 'olive'>('light');

  const pageTitle = isAr 
    ? 'دراسة حالة صادكو بلاست SADKO PLAST | تصميم الهوية المؤسسية منذ 1992 — ديجيتال إفكت' 
    : 'SADKO PLAST Corporate Identity Case Study (Since 1992) | Digital Effect';

  const pageDescription = isAr
    ? 'تصميم وتحديث الهوية المؤسسية لشركة صادكو بلاست (SADKO PLAST — منذ ١٩٩٢) بالعاشر من رمضان: الدرع الذهبي التراثي ثنائي اللغة، كروت العمل، فولدر العروض، ومنظومة المراسلات.'
    : 'Corporate visual identity design for SADKO PLAST (Since 1992, 10th of Ramadan City): bilingual heritage gold crest, eco-polymer executive cards, presentation folder, and stationery suite.';

  // Touchpoints with local high-resolution assets (5 curated slides)
  const touchpoints = [
    {
      id: 'tp-hero',
      category: 'logo',
      categoryLabel: isAr ? 'الشعار التراثي ثنائي اللغة' : 'Heritage Bilingual Emblem',
      title: isAr ? 'الشعار والدرع الذهبي المعتمد (SADKO PLAST — Since 1992)' : 'Official SADKO PLAST Since 1992 Lockup',
      desc: isAr ? 'درع معيني ذهبي يحمل كلمتي SADKO و(صادكو) على طرفي حرف (S) مفرغ يتوسطه رمز إبرة التصنيع الانسيابية، مع عبارة SINCE 1992 التي توثق أكثر من ثلاثة عقود من الريادة الصناعية.' : 'Tilted metallic gold diamond crest pairing bilingual SADKO & Arabic calligraphy flanking a sleek molding needle crest, underscored by Since 1992 industrial heritage.',
      url: '/assets/case-studies/sadko/hero-logo.png',
      aspect: 'wide',
      badge: isAr ? 'الشعار المعتمد' : 'Official Mark',
    },
    {
      id: 'tp-cards',
      category: 'stationery',
      categoryLabel: isAr ? 'بطاقات العمل التنفيذية' : 'Business Cards',
      title: isAr ? 'بطاقات العمل ذات الوجهين والأمواج الخضراء (Dual-Sided Cards)' : 'Executive Two-Toned Industrial Business Cards',
      desc: isAr ? 'كارت عمل يجمع بين الواجهة الخلفية بالرمادي الصناعي وشريط أخضر بارز يتوسطه الشعار الذهبي، والواجهة الأمامية النقية مع أمواج خضراء وفضية وبيانات مصنع العاشر من رمضان.' : 'Two-sided business card pairing a cool slate graphite back crossed by an eco-green ribbon with a clean white front featuring sculpted lime polymer waves.',
      url: '/assets/case-studies/sadko/business-card.png',
      aspect: 'wide',
      badge: isAr ? 'كروت الإدارة' : 'Executive Cards',
    },
    {
      id: 'tp-folder',
      category: 'stationery',
      categoryLabel: isAr ? 'فولدرات العقود والكتالوجات' : 'Corporate Folder',
      title: isAr ? 'فولدر عروض التوريد والمواصفات القياسية (Presentation Folder)' : 'Industrial Supply & Specification Presentation Folder',
      desc: isAr ? 'فولدر رسمي لحفظ عينات الخامات وعقود التوريد الصناعية، يتميز بأقواس هندسية خضراء مفرغة ومساحة خضراء بارزة في الزاوية العليا تمنح توازناً عصرياً للشعار الذهبي.' : 'Modern B2B pocket folder built for plastics specifications and supply tenders, balancing clean wireframe curves against an upper lime-olive geometric accent block.',
      url: '/assets/case-studies/sadko/folder.png',
      aspect: 'tall',
      badge: isAr ? 'فولدر المشاريع' : 'Projects Folder',
    },
    {
      id: 'tp-stationery',
      category: 'stationery',
      categoryLabel: isAr ? 'المراسلات والعقود الرسمية' : 'Letterhead Suite',
      title: isAr ? 'الورق الرسمي وعقود التوريد (Official Letterhead)' : 'Corporate Letterhead & Undulating Wave Footer',
      desc: isAr ? 'ورق مراسلات رسمي فائق النقاء يتصدره شعار SADKO PLAST ويحتضن قوساً أخضر علوياً وقوساً مائياً هادئاً بالأسفل يرتكز عليه عنوان المنطقة الصناعية A1 وأرقام الفاكس.' : 'Crisp A4 corporate stationery framed by a dynamic green top-corner sweep and subtle bottom wave carrying factory Tel/Fax and 10th of Ramadan plot coordinates.',
      url: '/assets/case-studies/sadko/stationery.png',
      aspect: 'tall',
      badge: isAr ? 'الورق الرسمي' : 'Official Letterhead',
    },
    {
      id: 'tp-envelopes',
      category: 'stationery',
      categoryLabel: isAr ? 'أظرف المراسلات' : 'Corporate Envelopes',
      title: isAr ? 'أظرف المراسلات الفاخرة بالبطانة الخضراء (Mailing Envelopes)' : 'Official Correspondence & Contract Envelopes',
      desc: isAr ? 'أظرف مراسلات رسمية ببطانة داخلية بلون الليمون الزيتوني المميز، تنسجم فيها الأمواج الفضية والخضراء مع الشعار الذهبي وبيانات التواصل الرسمية.' : 'Custom DL envelopes lined internally with eco-polymer olive green, repeating the sculpted corner ribbons alongside crisp factory address formatting.',
      url: '/assets/case-studies/sadko/envelopes.jpg',
      aspect: 'wide',
      badge: isAr ? 'أظرف المراسلات' : 'Envelopes Suite',
    },
  ];

  // Brand Color Palette with one-click copy
  const brandColors = [
    { name: isAr ? 'الذهبي التراثي المعدني (Heritage Gold)' : 'Heritage Gold', hex: '#D8B458', cmyk: 'C:15 M:28 Y:76 K:2', pantone: 'PMS 4515 C', role: isAr ? 'درع الشعار المعيني تعبيراً عن الخبرة الصناعية منذ ١٩٩٢' : 'Metallic beveled diamond emblem symbolizing 30+ years since 1992' },
    { name: isAr ? 'أخضر البوليمر الحيوي (Eco-Polymer Lime)' : 'Eco-Polymer Lime', hex: '#72A434', cmyk: 'C:62 M:10 Y:96 K:2', pantone: 'PMS 369 C', role: isAr ? 'الأمواج التصميمية، الفولدرات، وبطانة أظرف المراسلات' : 'Sculpted waves, folder highlights & envelope lining' },
    { name: isAr ? 'رمادي المصانع المعدني (Industrial Slate)' : 'Industrial Slate', hex: '#5E6064', cmyk: 'C:62 M:54 Y:50 K:26', pantone: 'PMS Cool Gray 10 C', role: isAr ? 'خلفية البطاقات الخلفية والحدود الهندسية المتزنة' : 'Reverse business card canvas & structural borders' },
    { name: isAr ? 'أسود الكربون (Carbon Wordmark)' : 'Carbon Wordmark', hex: '#1D1D1B', cmyk: 'C:70 M:66 Y:66 K:80', pantone: 'PMS Black 6 C', role: isAr ? 'النص الطباعي لاسم SADKO PLAST وشعار SINCE 1992' : 'Crisp typographic logotype & heritage founding stamp' },
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
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-lime-700 selection:text-white relative">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/sadko/hero-logo.png"
        urlPath="https://digitaleffect.net/sadko-2/"
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-[#1D1D1B] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-lime-500/50 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-[#D8B458]" />
          <span>{isAr ? 'تم نسخ رابط دراسة الحالة بنجاح!' : 'Case study link copied!'}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW MODE 1: CINEMATIC FULL-SCREEN SCROLL (PURE WHITE BG)      */}
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,164,52,0.035)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

                  {/* Main Visual Frame */}
                  <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-24 sm:pb-28">
                    {/* Top slide identifier badge */}
                    <div className={`mb-3 transition-all duration-700 delay-100 flex items-center gap-2 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-lime-50 text-lime-800 border border-lime-200 shadow-xs">
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
                        <Maximize2 className="w-4 h-4 text-lime-700" />
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
            <div className="text-[11px] font-mono font-black text-lime-800 bg-white px-2.5 py-1 rounded-xl border border-lime-200 shadow-md">
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
                        ? 'w-3 h-8 bg-gradient-to-b from-[#D8B458] via-[#72A434] to-[#5E6064] rounded-full shadow-md shadow-lime-700/30' 
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
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-lime-50 text-lime-800 border border-lime-200">
                      {activeSlide.badge}
                    </span>
                    <span className="text-xs text-amber-700 font-bold">
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
                          ? 'bg-lime-700 text-white shadow-sm' 
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
                      <LayoutGrid className="w-3.5 h-3.5 text-lime-700" />
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
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-lime-700 hover:bg-lime-800 text-white shadow-md shadow-lime-700/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
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
                <Info className="w-4 h-4 text-lime-700" />
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
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-[#D8B458] via-[#72A434] to-[#5E6064] text-white shadow-md">
                <Factory className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? 'دليل المعايير والتحليل الفني — SADKO PLAST (Since 1992)' : 'Technical Specifications & Brand System — SADKO PLAST'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isAr ? 'تشريح الدرع التراثي ثنائي اللغة، لوحة ألوان البوليمر، ومنظومة المطبوعات' : 'Heritage diamond emblem anatomy, eco-polymer palette, and corporate collateral'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('cinematic')}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-lime-700 hover:bg-lime-800 text-white shadow-md shadow-lime-700/20 flex items-center gap-2 transition-all cursor-pointer"
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
                  ? 'bg-lime-700 text-white shadow-md'
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
                  ? 'bg-lime-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isAr ? 'تشريح الدرع التراثي والخطوط' : 'Crest & Type Geometry'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('colors')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'colors'
                  ? 'bg-lime-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isAr ? 'الألوان الصناعية المعتمدة' : 'Industrial Palette'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('profile')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'profile'
                  ? 'bg-lime-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'عن المصنع وتاريخ ١٩٩٢' : 'Factory Heritage (1992)'}</span>
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
                  { id: 'logo', label: isAr ? 'الشعار التراثي' : 'Logomark' },
                  { id: 'stationery', label: isAr ? 'المطبوعات والمراسلات' : 'Stationery & Folders' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTouchpointFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTouchpointFilter === tab.id
                        ? 'bg-lime-700 text-white shadow-sm'
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
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-lime-500 p-4 shadow-sm hover:shadow-xl transition-all cursor-zoom-in flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-4">
                      <img
                        src={tp.url}
                        alt={tp.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-lime-800 border border-lime-200 shadow-sm">
                        {tp.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-lime-700 uppercase tracking-wider">
                        {tp.categoryLabel}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-lime-700 transition-colors mt-0.5">
                        {tp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {tp.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-lime-700 font-bold">
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
                    <span className="text-xs font-black text-lime-700 uppercase">Bilingual Heritage Emblem</span>
                    <h3 className="text-xl font-black text-slate-900">{isAr ? 'تشريح الدرع الذهبي والتوازن اللغوي' : 'Diamond Crest & Bilingual Typography Balance'}</h3>
                  </div>
                  <span className="p-3 rounded-2xl bg-lime-50 text-lime-700">
                    <Layers className="w-6 h-6" />
                  </span>
                </div>

                <div className="relative aspect-video rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-6">
                  <img
                    src="/assets/case-studies/sadko/hero-logo.png"
                    alt="SADKO PLAST Emblem Anatomy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#D8B458]" />
                      <span>{isAr ? 'الدرع الذهبي المزدوج (S-Crest)' : 'Golden Diamond & Molding Crest'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr ? 'معين ذهبي ذو حواف دائرية يحافظ على الإرث الصناعي لصادكو منذ ١٩٩٢، يضم الاسم العربي (صادكو) والإنجليزي (SADKO) بانسجام متماثل.' : 'Beveled rounded gold diamond preserving SADKO equity since 1992 while balancing English and Arabic branding diagonally.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-lime-700" />
                      <span>{isAr ? 'أمواج البوليمر الخضراء (Eco-Waves)' : 'Sculpted Lime Polymer Curves'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr ? 'خطوط انسيابية خضراء تعبر عن مرونة التشكيل البلاستيكي والاستدامة البيئية عبر الفولدرات والأظرف والبطاقات.' : 'Flowing lime-olive curves applied seamlessly across print materials to symbolize polymer extrusion flow and sustainability.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#5E6064] text-white rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[#D8B458]">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase">{isAr ? 'فلسفة التحديث مع الحفاظ على الإرث' : 'Heritage Preservation Philosophy'}</h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {isAr
                      ? 'صُممت هوية صادكو بلاست (SADKO PLAST) لتوازن ببراعة بين أصالة المصنع العريق المؤسس عام ١٩٩٢ وبين متطلبات العصر الحديث في الصناعات البلاستيكية. تم تطوير الدرع الذهبي وتحديث المنظومة الورقية بأمواج خضراء وفضية تبرز الجودة أمام عملاء التصنيع محلياً ودولياً.'
                      : 'Engineered to bridge three decades of manufacturing equity (Since 1992) with clean modern polymer sustainability—giving domestic buyers and export importers unmistakable confidence.'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">{isAr ? 'تطبيقات الهوية المعتمدة' : 'Certified Rollout Scope'}</h4>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                      <span>{isAr ? 'تطوير الدرع الذهبي والشعار ثنائي اللغة (Since 1992)' : 'Gold Bilingual Heritage Crest & Lockup'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                      <span>{isAr ? 'كروت عمل تنفيذية برمادي صناعي وشريط أخضر حيوي' : 'Slate & Lime Ribbon Business Cards'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                      <span>{isAr ? 'فولدرات مناقصات وعروض المواصفات البلاستيكية' : 'Polymer Supply & Tender Folders'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                      <span>{isAr ? 'الورق الرسمي والأظرف المبطنة بالأخضر الزيتوني' : 'Corporate Letterhead & Olive-Lined Envelopes'}</span>
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
                      {isAr ? 'محاكي التباين اللوني على الأسطح الصناعية' : 'Substrate Contrast Simulator'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'اختبر وضوح شعار SADKO PLAST على الخلفية البيضاء والرمادية الصناعية والخضراء' : 'Test emblem legibility on crisp paper stock, cool slate, and olive green'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'light' ? 'bg-white border-lime-600 text-slate-900 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isAr ? 'أبيض ناصع' : 'Pure White'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('slate')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'slate' ? 'bg-[#5E6064] border-[#D8B458] text-white shadow-sm' : 'bg-[#5E6064]/80 border-slate-600 text-slate-200'
                      }`}
                    >
                      {isAr ? 'رمادي صناعي' : 'Industrial Slate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('olive')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'olive' ? 'bg-[#72A434] border-white text-white shadow-sm' : 'bg-[#72A434]/80 border-lime-400 text-white'
                      }`}
                    >
                      {isAr ? 'أخضر بوليمر' : 'Eco Lime'}
                    </button>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl flex items-center justify-center transition-colors duration-500 min-h-[220px] ${
                  previewBg === 'light' 
                    ? 'bg-white border border-slate-200' 
                    : previewBg === 'slate' 
                    ? 'bg-[#5E6064]' 
                    : 'bg-[#72A434]'
                }`}>
                  <img
                    src="/assets/case-studies/sadko/hero-logo.png"
                    alt="SADKO PLAST Logo Preview"
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
                  <span className="text-xs font-black text-lime-700 uppercase">Industrial Manufacturing Since 1992</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {isAr ? 'شركة صادكو بلاست (SADKO PLAST — منذ ١٩٩٢)' : 'SADKO PLAST — Industrial Polymers & Manufacturing'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {isAr ? 'المنطقة الصناعية A1، قطعة IXM — مدينة العاشر من رمضان، مصر' : 'Industrial Zone A1, Plot IXM, 10th of Ramadan City, Egypt'}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isAr
                    ? 'منذ تأسيسها عام ١٩٩٢ بالمنطقة الصناعية بالعاشر من رمضان، رسخت شركة صادكو بلاست مكانتها كواحدة من القلاع الصناعية العريقة في تصنيع المنتجات البلاستيكية والتعبئة الهندسية في مصر والمنطقة، بمسيرة تمتد لأكثر من ثلاثة عقود من الجودة والابتكار.'
                    : 'Established in 1992 in 10th of Ramadan Industrial City, SADKO PLAST stands as one of Egypt’s enduring plastics manufacturing pioneers with over 30 years of production quality, technical precision, and regional export supply.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'سنة التأسيس' : 'Established'}</span>
                    <div className="text-lg font-black text-slate-900">1992</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'أكثر من ٣٢ عاماً خبرة' : '32+ Years Heritage'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المقر الصناعي' : 'Industrial Site'}</span>
                    <div className="text-lg font-black text-slate-900">{isAr ? 'العاشر من رمضان' : '10th of Ramadan'}</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'المنطقة الصناعية A1' : 'Industrial Zone A1'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'التصنيف' : 'Category'}</span>
                    <div className="text-lg font-black text-slate-900">Corporate ID</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'الهوية المؤسسية B2B' : 'Industrial B2B'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-lime-900">{isAr ? 'البيانات الرسمية والصفحة المرجعية' : 'Official Brand Reference'}</h5>
                    <p className="text-[11px] text-lime-800 font-medium">sadkoplast.com • Tel: +2 0554 410385</p>
                  </div>
                  <a
                    href="https://digitaleffect.net/sadko-2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-lime-700 hover:bg-lime-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{isAr ? 'الرابط المرجعي' : 'View Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#5E6064] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#D8B458] uppercase">{isAr ? 'شهادة العميل' : 'Client Testimonial'}</span>
                  <Quote className="w-8 h-8 text-[#D8B458]/40" />
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {isAr
                      ? '"نجحت ديجيتال إفكت في تحديث هويتنا المؤسسية مع الحفاظ التام على قيمة درعنا الذهبي العريق منذ عام ١٩٩٢. المطبوعات وفولدرات العروض الجديدة تمنح عملاء التصدير والمصانع ثقة فورية في جودة منتجاتنا."'
                      : '"Digital Effect modernized our corporate visual system while respecting our iconic 1992 gold crest. The new folders and business stationery give international export partners and local plants immediate confidence in our standards."'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-500 space-y-1">
                  <h6 className="text-xs font-black text-white">{isAr ? 'الإدارة الصناعية والتنفيذية' : 'Executive & Plant Management'}</h6>
                  <p className="text-[11px] text-slate-300">SADKO PLAST (Since 1992) — 10th of Ramadan, Egypt</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3 rounded-2xl bg-lime-700 hover:bg-lime-800 text-white text-xs font-black transition-all shadow-lg shadow-lime-900/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'طلب هوية مؤسسية لمصنعك' : 'Request Corporate Identity'}</span>
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
              <span className="text-slate-500 font-mono">SADKO PLAST (Since 1992) — 10th of Ramadan, Egypt • Corporate Identity</span>
              <a
                href={activeLightboxImg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-lime-700 hover:text-lime-800 flex items-center gap-1"
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
