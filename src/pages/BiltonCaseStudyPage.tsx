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
  Tv
} from 'lucide-react';

export const BiltonCaseStudyPage: React.FC = () => {
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
  const [activeTouchpointFilter, setActiveTouchpointFilter] = useState<'all' | 'logo' | 'stationery' | 'brochure'>('all');

  // Interactive Color Simulator
  const [previewBg, setPreviewBg] = useState<'light' | 'navy' | 'ocean'>('light');

  const pageTitle = isAr
    ? 'دراسة حالة بيلتون BILTON | تصميم الهوية المؤسسية والكتالوج — ديجيتال إفكت'
    : 'BILTON Home Appliances & Electronics — Corporate Identity & Catalog | Digital Effect';

  const pageDescription = isAr
    ? 'تصميم الهوية المؤسسية لشركة بيلتون (BILTON — مجموعة Hurricane) بزهراء المعادي: الشعار الهندسي المتدرج، كروت العمل الليلية، الورق الرسمي، أظرف المجموعة، والكتالوج العرضي للأجهزة.'
    : 'Corporate visual identity for BILTON (Hurricane Group, Zahraa Al Maadi, Cairo): folded ribbon emblem, midnight navy business cards, letterhead, Hurricane group envelopes, and landscape product brochure.';

  // Touchpoints with local high-resolution assets (all 5 curated slides from digitaleffect.net/bilton/)
  const touchpoints = [
    {
      id: 'tp-hero',
      category: 'logo',
      categoryLabel: isAr ? 'الشعار الموحد والتايبوجرافي' : 'Emblem & Typeface',
      title: isAr ? 'شعار بيلتون المعتمد والرمز الدائري (BILTON Official Lockup)' : 'Official BILTON Geometric Ribbon Mark & Wordmark',
      desc: isAr
        ? 'رمز حرف (b) ملفوف بتدرجات الأزرق السماوي والملكي يلتف حول نواة مركزية تتكرر بذكاء داخل حرف (O) في تايبوجرافي BILTON الهندسي المستقبلي.'
        : 'Layered blue ribbon swirl forming an iconic lowercase "b" around a central blue core echoed inside the "O" of the custom rounded futuristic BILTON wordmark.',
      url: '/assets/case-studies/bilton/hero-logo.png',
      aspect: 'wide',
      badge: isAr ? 'الشعار المعتمد' : 'Official Logo',
    },
    {
      id: 'tp-cards',
      category: 'stationery',
      categoryLabel: isAr ? 'بطاقات العمل التنفيذية' : 'Business Cards',
      title: isAr ? 'بطاقات العمل الليلية ذات الوجهين (Midnight Navy Cards)' : 'Midnight Navy & Ocean Blue Dual-Sided Cards',
      desc: isAr
        ? 'بطاقة عمل فاخرة بخلفية كحلي عميق مع علامة مائية عملاقة لشعار b ومعلومات التواصل الرسمية لمقر زهراء المعادي وموقع biltoneg.com.'
        : 'Executive dark midnight navy cards overlaid with oversized tonal monogram framing, crisp white contact typography, and Zahraa Al Maadi headquarters coordinates.',
      url: '/assets/case-studies/bilton/business-card.png',
      aspect: 'wide',
      badge: isAr ? 'كروت الإدارة' : 'Executive Cards',
    },
    {
      id: 'tp-stationery',
      category: 'stationery',
      categoryLabel: isAr ? 'المراسلات والورق الرسمي' : 'Letterhead Suite',
      title: isAr ? 'الورق الرسمي بنقاط الإعصار المائية (Official Letterhead)' : 'A4 Official Letterhead & Vortex Halftone Margin',
      desc: isAr
        ? 'ورق مراسلات رسمي أبيض يتصدره شعار BILTON وتلتف حول حافته اليمنى نقاط مائية هادئة مستوحاة من مجموعة Hurricane مع شريط سفلي كحلي لأرقام التواصل.'
        : 'Clean A4 corporate letterhead anchored by a subtle halftone spiral dot texture referencing parent company Hurricane alongside crisp navy footer contacts.',
      url: '/assets/case-studies/bilton/stationery.png',
      aspect: 'tall',
      badge: isAr ? 'الورق الرسمي' : 'Official Letterhead',
    },
    {
      id: 'tp-envelopes',
      category: 'stationery',
      categoryLabel: isAr ? 'أظرف المراسلات المؤسسية' : 'Group Envelopes',
      title: isAr ? 'أظرف المراسلات لمجموعة هاريكان (HURRICANE Group Envelopes)' : 'Executive DL Envelopes — HURRICANE Parent Brand',
      desc: isAr
        ? 'أظرف مراسلات فاخرة بالكحلي الليلي العميق ونقوش دوامة النقاط السيان المضيئة لربط هوية بيلتون بصرياً بالمجموعة الأم Hurricane.'
        : 'Commanding deep navy DL envelopes stamped with vibrant cyan vortex dot arrays connecting the BILTON appliance line cleanly with parent group HURRICANE.',
      url: '/assets/case-studies/bilton/envelopes.jpg',
      aspect: 'wide',
      badge: isAr ? 'أظرف المجموعة' : 'Group Envelopes',
    },
    {
      id: 'tp-brochure',
      category: 'brochure',
      categoryLabel: isAr ? 'الكتالوج المؤسسي العرضي' : 'Landscape Product Catalog',
      title: isAr ? 'الكتالوج العرضي للأجهزة المنزلية والشاشات (Landscape Brochure)' : 'Corporate Landscape Product & Specs Brochure',
      desc: isAr
        ? 'كتالوج عرضي متكامل يستعرض خط منتجات بيلتون من الشاشات الذكية 55 و65 بوصة، الفريزرات، البوتاجازات، والثلاجات مع جداول المواصفات الدقيقة.'
        : 'Horizontal flagship brochure showcasing BILTON Chest Freezers, 55" & 65" 4K UHD Smart TVs, gas cookers, and full technical comparison matrices.',
      url: '/assets/case-studies/bilton/brochure.jpg',
      aspect: 'wide',
      badge: isAr ? 'الكتالوج العرضي' : 'Landscape Brochure',
    },
  ];

  // Brand Color Palette with one-click copy
  const brandColors = [
    { name: isAr ? 'كحلي منتصف الليل (Midnight Navy)' : 'Midnight Navy', hex: '#071038', cmyk: 'C:100 M:92 Y:32 K:56', pantone: 'PMS 2767 C', role: isAr ? 'خلفية بطاقات العمل الفاخرة والكتالوج وأظرف المجموعة الأم' : 'Executive business cards, catalog spreads & group envelopes' },
    { name: isAr ? 'أزرق المحيط الملكي (Ocean Royal Blue)' : 'Ocean Royal Blue', hex: '#3872B8', cmyk: 'C:80 M:45 Y:0 K:0', pantone: 'PMS 7684 C', role: isAr ? 'النواة الأساسية في شعار b، مركز حرف O، وأيقونات المواصفات' : 'Core of the "b" emblem, focal "O" dot & technical spec badges' },
    { name: isAr ? 'سيان الدوامة (Vortex Cyan)' : 'Vortex Cyan', hex: '#0099DB', cmyk: 'C:85 M:15 Y:0 K:0', pantone: 'PMS 299 C', role: isAr ? 'نقاط التدرج الشبكي (Halftone Vortex) المميزة للأظرف والكتالوج' : 'Halftone spiral dot pattern spanning envelopes & brochure backs' },
    { name: isAr ? 'أزرق السماء البارد (Ice Sky Tint)' : 'Ice Sky Tint', hex: '#69A9DE', cmyk: 'C:55 M:16 Y:0 K:0', pantone: 'PMS 278 C', role: isAr ? 'الطية الخلفية المشرقة لشعار بيلتون واللمسات الفاتحة' : 'Upper fold highlight inside the layered Bilton "b" monogram' },
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
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-700 selection:text-white relative">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/bilton/hero-logo.png"
        urlPath="https://digitaleffect.net/bilton/"
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-[#071038] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-sky-400/50 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-[#0099DB]" />
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,114,184,0.04)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

                  {/* Main Visual Frame */}
                  <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-24 sm:pb-28">
                    {/* Top slide identifier badge */}
                    <div className={`mb-3 transition-all duration-700 delay-100 flex items-center gap-2 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200 shadow-xs">
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
                        className={`max-h-[68vh] sm:max-h-[74vh] max-w-[94vw] sm:max-w-[86vw] w-auto h-auto object-contain drop-shadow-[0_20px_45px_rgba(7,16,56,0.14)] transition-all duration-700 ease-out transform ${
                          isActive
                            ? 'scale-100 opacity-100 translate-y-0 filter brightness-100'
                            : 'scale-95 opacity-30 translate-y-6 filter brightness-95'
                        } group-hover:scale-[1.015]`}
                      />

                      {/* Hover Magnify Prompt */}
                      <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 rounded-2xl bg-white/95 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xl pointer-events-none">
                        <Maximize2 className="w-4 h-4 text-blue-700" />
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
            <div className="text-[11px] font-mono font-black text-blue-800 bg-white px-2.5 py-1 rounded-xl border border-blue-200 shadow-md">
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
                        ? 'w-3 h-8 bg-gradient-to-b from-[#071038] via-[#3872B8] to-[#0099DB] rounded-full shadow-md shadow-blue-700/30'
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
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {activeSlide.badge}
                    </span>
                    <span className="text-xs text-[#3872B8] font-bold">
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
                          ? 'bg-[#071038] text-white shadow-sm'
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
                      <LayoutGrid className="w-3.5 h-3.5 text-blue-700" />
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
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#071038] hover:bg-blue-950 text-white shadow-md shadow-blue-950/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0099DB]" />
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
                <Info className="w-4 h-4 text-blue-700" />
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
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-[#071038] via-[#3872B8] to-[#0099DB] text-white shadow-md">
                <Tv className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? 'دليل المعايير والتحليل الفني — BILTON بيلتون' : 'Technical Specifications & Brand System — BILTON'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isAr ? 'تشريح شعار b الدائري، شبكة النقاط المائية، ومنظومة الكتالوج والمطبوعات' : 'Layered "b" crest geometry, Hurricane halftone matrix, and corporate catalog'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('cinematic')}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-[#071038] hover:bg-blue-950 text-white shadow-md shadow-blue-950/20 flex items-center gap-2 transition-all cursor-pointer"
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
                  ? 'bg-[#071038] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{isAr ? 'معرض المطبوعات والكتالوج' : 'Touchpoints Gallery'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('anatomy')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'anatomy'
                  ? 'bg-[#071038] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isAr ? 'تشريح الشعار والربط المجموعي' : 'Monogram & Group System'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('colors')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'colors'
                  ? 'bg-[#071038] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isAr ? 'باليت الألوان المعتمدة' : 'Brand Color Palette'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('profile')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'profile'
                  ? 'bg-[#071038] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'عن بيلتون ومجموعة Hurricane' : 'About BILTON & Hurricane'}</span>
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
                  { id: 'logo', label: isAr ? 'الشعار والرمز' : 'Logomark' },
                  { id: 'stationery', label: isAr ? 'الكروت والمراسلات' : 'Stationery & Envelopes' },
                  { id: 'brochure', label: isAr ? 'الكتالوج العرضي' : 'Product Brochure' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTouchpointFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTouchpointFilter === tab.id
                        ? 'bg-[#071038] text-white shadow-sm'
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
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-blue-600 p-4 shadow-sm hover:shadow-xl transition-all cursor-zoom-in flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-4">
                      <img
                        src={tp.url}
                        alt={tp.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-blue-800 border border-blue-200 shadow-sm">
                        {tp.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                        {tp.categoryLabel}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors mt-0.5">
                        {tp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {tp.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-bold">
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
                    <span className="text-xs font-black text-blue-700 uppercase">Layered Geometric Emblem</span>
                    <h3 className="text-xl font-black text-slate-900">{isAr ? 'تشريح شعار بيلتون وربط النواة البصرية' : 'Folded Ribbon "b" Emblem & Focal O Geometry'}</h3>
                  </div>
                  <span className="p-3 rounded-2xl bg-blue-50 text-blue-700">
                    <Layers className="w-6 h-6" />
                  </span>
                </div>

                <div className="relative aspect-video rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-6">
                  <img
                    src="/assets/case-studies/bilton/hero-logo.png"
                    alt="BILTON Monogram Anatomy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#3872B8]" />
                      <span>{isAr ? 'أيقونة حرف b ونواة التركيز' : 'Swirling "b" Ribbon & Focus Core'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? 'شريط متدرج ينطوي برشاقة ليشكل حرف b وتجويفاً أزرق مركزياً يتكرر داخل حرف O في كلمة BILTON لتأكيد الدقة الهندسية.'
                        : 'Layered ribbon folding cleanly into a distinctive lowercase "b" crest whose blue focal dot is mirrored inside the "O" of the logotype.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#0099DB]" />
                      <span>{isAr ? 'نسق النقاط الدوارة (Hurricane Vortex)' : 'Parent-Brand Vortex Halftone Link'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? 'توظيف شبكة النقاط الحلزونية السيان عبر الأظرف والورق الرسمي والكتالوج لخلق رابط بصري فوري مع الشركة الأم Hurricane.'
                        : 'Rotating cyan dot-matrix arrays unify corporate envelopes, letterheads, and appliance brochures directly to parent company HURRICANE.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#071038] text-white rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[#0099DB]">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase">{isAr ? 'مواءمة العلامة التجارية مع الأجهزة الذكية' : 'Smart Appliances Identity Positioning'}</h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {isAr
                      ? 'تغطي علامة بيلتون (BILTON) باقة واسعة من الشاشات الذكية 4K والأجهزة الكهربائية المنزلية، لذا ركز التصميم على دمج رصانة الكحلي الداكن مع حيوية التدرجات الزرقاء والتقنية الواضحة.'
                      : 'Spanning 4K UHD televisions, chest freezers, gas cookers, and cooling appliances, BILTON balances deep executive midnight navy with precision blue motion graphics.'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">{isAr ? 'مخرجات الهوية المعتمدة' : 'Certified Rollout Deliverables'}</h4>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{isAr ? 'تصميم الشعار الأساسي والنسخة البيضاء المعكوسة (BILTON)' : 'Primary Color Crest & White Reversed Lockup'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{isAr ? 'بطاقات عمل تنفيذية بكحلي منتصف الليل وعلامة مائية' : 'Midnight Navy Dual-Sided Business Cards'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{isAr ? 'الورق الرسمي وأظرف مراسلات المجموعة الأم (Hurricane)' : 'Vortex Dot-Matrix Letterhead & Group Envelopes'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{isAr ? 'الكتالوج العرضي للأجهزة والشاشات ومواصفاتها القياسية' : 'Landscape Product Catalog for Appliances & 4K TVs'}</span>
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
                      {isAr ? 'اختبر وضوح شعار BILTON على الورق الأبيض وكحلي منتصف الليل وأزرق المحيط' : 'Verify BILTON emblem contrast across white stock, midnight navy, and ocean blue'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'light' ? 'bg-white border-blue-600 text-slate-900 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isAr ? 'أبيض ناصع' : 'Pure White'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('navy')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'navy' ? 'bg-[#071038] border-[#0099DB] text-white shadow-sm' : 'bg-[#071038]/85 border-slate-600 text-slate-200'
                      }`}
                    >
                      {isAr ? 'كحلي منتصف الليل' : 'Midnight Navy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('ocean')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'ocean' ? 'bg-[#3872B8] border-white text-white shadow-sm' : 'bg-[#3872B8]/85 border-blue-300 text-white'
                      }`}
                    >
                      {isAr ? 'أزرق المحيط' : 'Ocean Blue'}
                    </button>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl flex items-center justify-center transition-colors duration-500 min-h-[220px] ${
                  previewBg === 'light'
                    ? 'bg-white border border-slate-200'
                    : previewBg === 'navy'
                    ? 'bg-[#071038]'
                    : 'bg-[#3872B8]'
                }`}>
                  <img
                    src="/assets/case-studies/bilton/hero-logo.png"
                    alt="BILTON Logo Preview"
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
                  <span className="text-xs font-black text-blue-700 uppercase">Home Appliances & Consumer Electronics</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {isAr ? 'شركة بيلتون (BILTON — مجموعة Hurricane)' : 'BILTON Electronics & Appliances — Hurricane Group'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {isAr ? '3 عمارات الندى، زهراء المعادي، القاهرة، مصر • bilton-eg.com' : '3 Al Nada Buildings, Zahraa Al Maadi, Cairo, Egypt • bilton-eg.com'}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isAr
                    ? 'إحدى العلامات التجارية المتخصصة في الأجهزة المنزلية وشاشات التلفزيون الذكية 4K UHD ومبردات الفريزر والبوتاجازات التابعة لمجموعة Hurricane من مقرها بزهراء المعادي بالقاهرة، حيث طورت ديجيتال إفكت منظومة هويتها الكاملة والكتالوج الموحد.'
                    : 'Operating under Hurricane Group from Zahraa Al Maadi in Cairo, BILTON delivers modern smart 4K televisions, chest freezers, gas cookers, and home appliances anchored by a unified executive identity and specification catalog.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المقر الرئيسي' : 'Headquarters'}</span>
                    <div className="text-lg font-black text-slate-900">{isAr ? 'زهراء المعادي' : 'Zahraa Al Maadi'}</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المجموعة الأم' : 'Parent Group'}</span>
                    <div className="text-lg font-black text-blue-800">HURRICANE</div>
                    <span className="text-[11px] text-slate-500">hurricane.com.eg</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'الموقع الرسمي' : 'Official Portal'}</span>
                    <div className="text-base font-black text-slate-900">bilton-eg.com</div>
                    <span className="text-[11px] text-slate-500">Corporate ID & Brochure</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-blue-900">{isAr ? 'أرقام التواصل والصفحة المرجعية' : 'Official Contacts & Brand Reference'}</h5>
                    <p className="text-[11px] text-blue-800 font-medium">+201099908095 • +201122488955 • info@hurricane.com.eg</p>
                  </div>
                  <a
                    href="https://digitaleffect.net/bilton/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#071038] hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{isAr ? 'الرابط المرجعي' : 'View Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#071038] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#0099DB] uppercase">{isAr ? 'شهادة العميل' : 'Client Testimonial'}</span>
                  <Quote className="w-8 h-8 text-[#0099DB]/40" />
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {isAr
                      ? '"نجحت ديجيتال إفكت في تأسيس هوية بصرية معاصرة لعلامة BILTON وربطها بانسيابية مع منظومة مجموعة Hurricane عبر كروت العمل والمطبوعات والكتالوج العرضي للأجهزة."'
                      : '"Digital Effect crafted a sleek, unmistakable brand identity for BILTON seamlessly aligned with Hurricane Group across executive stationery, envelopes, and our landscape appliance brochure."'}
                  </p>
                </div>

                <div className="pt-4 border-t border-blue-900 space-y-1">
                  <h6 className="text-xs font-black text-white">{isAr ? 'الإدارة التنفيذية — بيلتون / هاريكان' : 'Executive Management — BILTON / Hurricane'}</h6>
                  <p className="text-[11px] text-blue-200">Zahraa Al Maadi, Cairo, Egypt</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#3872B8] hover:bg-blue-600 text-white text-xs font-black transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 cursor-pointer"
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
              <span className="text-slate-500 font-mono">BILTON (Hurricane Group) — Zahraa Al Maadi, Cairo • Corporate Identity</span>
              <a
                href={activeLightboxImg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
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
