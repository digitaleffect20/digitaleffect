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
  HardHat,
  Car,
  BookOpen,
  Layout,
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

export const AguCaseStudyPage: React.FC = () => {
  const { data, language, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const currentCaseStudy = data.caseStudies.find((c) => c.id === 'cs-b2b-agu') || data.caseStudies[0];

  // Primary View Mode: 'cinematic' (Full-Screen Scroll with animation) or 'technical' (Grid & Guidelines)
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

  // Technical Explorer Tabs: 'touchpoints' | 'anatomy' | 'colors' | 'gallery'
  const [explorerTab, setExplorerTab] = useState<'touchpoints' | 'anatomy' | 'colors' | 'gallery'>('touchpoints');
  const [activeTouchpointFilter, setActiveTouchpointFilter] = useState<'all' | 'stationery' | 'safety' | 'exhibition' | 'fleet' | 'profile'>('all');

  // Interactive Color Background Simulator
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'navy'>('light');

  const pageTitle = isAr 
    ? 'دراسة حالة الاتحاد العربي الخليجي AGU | تصميم الهوية المؤسسية — ديجيتال إفكت' 
    : 'Arab Gulf United (AGU) Corporate Identity Case Study | Digital Effect';

  const pageDescription = isAr
    ? 'تصميم وبناء الهوية المؤسسية الشاملة لشركة الاتحاد العربي الخليجي AGU: الشعار الهندسي، دليل المعايير، أجنحة المعارض، أسطول السيارات، ومعدات المواقع الهندسية.'
    : 'Complete Corporate Identity and brand architecture for Arab Gulf United (AGU) by Digital Effect: geometric logomark, brand manual, 3D exhibition booth, fleet wraps, and field safety gear.';

  // Touchpoint items with local high-resolution assets (Total 10 cinematic slides)
  const touchpoints = [
    {
      id: 'tp-hero',
      category: 'stationery',
      categoryLabel: isAr ? 'الشعار والهوية' : 'Logomark',
      title: isAr ? 'الشعار والتركيبة النصية المعتمدة (Official Logo Lockup)' : 'Official AGU Logo Lockup',
      desc: isAr ? 'الشعار الرئيسي يدمج الحروف الإنجليزية بحركية الدوائر المتدفقة مع التوازن الطباعي للاسم العربي والترجمة الإقليمية.' : 'Primary identity lockup combining dynamic geometry and bilingual typography engineered for corporate leadership.',
      url: '/assets/case-studies/agu/hero.jpg',
      aspect: 'wide',
      badge: isAr ? 'الشعار المعتمد' : 'Official Mark',
    },
    {
      id: 'tp-grid',
      category: 'anatomy',
      categoryLabel: isAr ? 'الشبكة الهندسية' : 'Construction Grid',
      title: isAr ? 'الشبكة الهندسية والنسب الذهبية (Logo Grid & Geometry)' : 'Logo Construction & Grid',
      desc: isAr ? 'بناء هندسي صارم يعتمد على دوائر متقاطعة وزوايا انحدار مدروسة تعكس التطور المعماري والتوسع الصناعي عبر الحدود.' : 'Mathematical circle grid dictating curve continuity and proportional harmony for high-precision scalability.',
      url: '/assets/case-studies/agu/logo-grid.png',
      aspect: 'video',
      badge: isAr ? 'النسب الذهبية' : 'Geometric Grid',
    },
    {
      id: 'tp-cards',
      category: 'stationery',
      categoryLabel: isAr ? 'القرطاسية والمطبوعات' : 'Stationery',
      title: isAr ? 'بطاقات العمل التنفيذية (Executive Business Cards)' : 'Executive Business Cards',
      desc: isAr ? 'تصميم بطاقات العمل الفاخرة بطباعة السبوت يو في (Spot UV) ولمسات زرقاء ميتاليك على خامات ورقية معالجة فائقة الجودة.' : 'Spot UV business cards with metallic blue edge accents crafted on premium heavyweight textured stock.',
      url: '/assets/case-studies/agu/business-card.png',
      aspect: 'video',
      badge: isAr ? 'طباعة Spot UV' : 'Executive Print',
    },
    {
      id: 'tp-stationery',
      category: 'stationery',
      categoryLabel: isAr ? 'القرطاسية والمطبوعات' : 'Stationery',
      title: isAr ? 'حزمة المراسلات والمجلدات المؤسسية (Corporate Collateral)' : 'Corporate Stationery Suite',
      desc: isAr ? 'الأظرف الرسمية، الورق المروس، ومجلدات تقديم العروض الفنية والمناقصات الحكومية والخاصة.' : 'Official letterheads, presentation folders, and tender document envelopes projecting institutional stability.',
      url: '/assets/case-studies/agu/stationery.png',
      aspect: 'square',
      badge: isAr ? 'حزمة المراسلات' : 'Official Suite',
    },
    {
      id: 'tp-hardhat-1',
      category: 'safety',
      categoryLabel: isAr ? 'معدات السلامة والمواقع' : 'Safety Gear',
      title: isAr ? 'خوذات السلامة الهندسية الميدانية (Site Safety Helmets)' : 'Field Engineering Safety Helmets',
      desc: isAr ? 'تطبيق شعار AGU المقاوم للعوامل الجوية القاسية على خوذات المهندسين ومسؤولي المواقع الإنشائية.' : 'High-durability weatherproof AGU branding on site safety helmets reflecting safety compliance and field authority.',
      url: '/assets/case-studies/agu/hard-hat-1.png',
      aspect: 'video',
      badge: isAr ? 'مواقع العمل والمشاريع' : 'Field Equipment',
    },
    {
      id: 'tp-hardhat-2',
      category: 'safety',
      categoryLabel: isAr ? 'معدات السلامة والمواقع' : 'Safety Gear',
      title: isAr ? 'خوذات الكوادر التنفيذية (Executive Hard Hat & PPE)' : 'Executive Safety Gear',
      desc: isAr ? 'منظومة الزي الهندسي الميداني المتوافق مع معايير السلامة المهنية العالمية OSHA وتأكيد الهيبة الرقابية.' : 'Field PPE compliance gear reinforcing engineering leadership, site compliance, and distinctive enterprise presence.',
      url: '/assets/case-studies/agu/hard-hat-2.png',
      aspect: 'video',
      badge: isAr ? 'معايير OSHA الدولية' : 'OSHA Standard',
    },
    {
      id: 'tp-booth',
      category: 'exhibition',
      categoryLabel: isAr ? 'أجنحة المعارض الدولية' : 'Exhibition Booth',
      title: isAr ? 'تصميم جناح المعارض ثلاثي الأبعاد (3D Trade Show Pavilion)' : '3D Exhibition Pavilion Design',
      desc: isAr ? 'تصميم معماري متكامل لجناح الشركة في المعارض الدولية مع إضاءات ليد منحنية، قاعات اجتماعات B2B وشاشات تفاعلية.' : 'Architectural trade show pavilion with dynamic LED curves, executive B2B conference lounges, and presentation tech.',
      url: '/assets/case-studies/agu/exhibition-booth.png',
      aspect: 'wide',
      badge: isAr ? 'معمار 3D تفاعلي' : '3D Architecture',
    },
    {
      id: 'tp-car',
      category: 'fleet',
      categoryLabel: isAr ? 'أسطول السيارات' : 'Vehicle Fleet',
      title: isAr ? 'تجليد أسطول سيارات الشركة الفاخرة (Fleet Livery Wrap)' : 'Executive Fleet Vehicle Livery',
      desc: isAr ? 'تصميم انسيابي يدمج حركية شعار AGU على سيارات الدفع الرباعي وسيارات المهندسين لتعزيز الظهور اليومي على الطرقات.' : 'Fluid automotive branding applied seamlessly to luxury company SUVs and sedans commanding on-road brand presence.',
      url: '/assets/case-studies/agu/company-car.png',
      aspect: 'video',
      badge: isAr ? 'أسطول النقل والمشاريع' : 'Fleet Livery',
    },
    {
      id: 'tp-profile-cover',
      category: 'profile',
      categoryLabel: isAr ? 'الملف المؤسسي' : 'Company Profile',
      title: isAr ? 'غلاف الملف التعريفي للشركة (Company Profile Cover)' : 'Corporate Profile Brochure Cover',
      desc: isAr ? 'كتيب فاخر يعرض محفظة مشروعات الشركة الاستثمارية والتنفيذية بأسلوب طباعي راقٍ وتقسيم أقسام احترافي.' : 'Prestige capability brochure showcasing heavy contracting, mechanical engineering, and regional investment portfolio.',
      url: '/assets/case-studies/agu/guidelines.png',
      aspect: 'tall',
      badge: isAr ? 'دليل المعايير والبروفايل' : 'Company Profile',
    },
    {
      id: 'tp-catalogue',
      category: 'profile',
      categoryLabel: isAr ? 'الملف المؤسسي' : 'Company Profile',
      title: isAr ? 'الصفحات الداخلية لكتالوج المشروعات (Capabilities Catalogue)' : 'Capabilities Catalogue Spread',
      desc: isAr ? 'توزيع شبكي مدروس للمحتوى والصور والمشروعات المنفذة يسهل قراءته من قبل صناع القرار ورؤساء مجالس الإدارات.' : 'Carefully structured grid layouts presenting industrial capabilities, certifications, and project galleries.',
      url: '/assets/case-studies/agu/catalogue.jpg',
      aspect: 'video',
      badge: isAr ? 'كتالوج المشروعات' : 'Projects Catalogue',
    },
  ];

  // Color Palette Definition
  const brandColors = [
    {
      name: isAr ? 'أزرق الخليج الملكي' : 'Royal Gulf Navy',
      role: isAr ? 'اللون الأساسي — يرمز للموثوقية والهيبة المؤسسية' : 'Primary — Reliability & Corporate Authority',
      hex: '#0B3B80',
      rgb: 'RGB(11, 59, 128)',
      cmyk: 'C:100 M:85 Y:15 K:10',
      textDark: false,
    },
    {
      name: isAr ? 'سماوي الطاقة والتدفق' : 'Dynamic Cyan Blue',
      role: isAr ? 'اللون الثانوي — يرمز للحركية والنمو والتوسع' : 'Secondary — Dynamic Growth & Expansion',
      hex: '#00A2E8',
      rgb: 'RGB(0, 162, 232)',
      cmyk: 'C:80 M:20 Y:0 K:0',
      textDark: false,
    },
    {
      name: isAr ? 'كحلي الدقة الهندسية' : 'Engineering Deep Navy',
      role: isAr ? 'لون المساندة والنصوص المعمارية الفاخرة' : 'Support — Architectural Precision & Solid Grounding',
      hex: '#08224D',
      rgb: 'RGB(8, 34, 77)',
      cmyk: 'C:100 M:90 Y:30 K:40',
      textDark: false,
    },
    {
      name: isAr ? 'أبيض الفضاء المفتوح' : 'Pure Platinum White',
      role: isAr ? 'التباين والمساحات التنفسية النظيفة' : 'Base — Clean Negative Space & High Contrast',
      hex: '#FFFFFF',
      rgb: 'RGB(255, 255, 255)',
      cmyk: 'C:0 M:0 Y:0 K:0',
      textDark: true,
    },
  ];

  // Smooth slide navigation
  const scrollToSlide = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>('[data-slide-index]');
    if (slides[index]) {
      slides[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSlideIndex(index);
    }
  }, []);

  const handleNextSlide = () => {
    const next = (currentSlideIndex + 1) % touchpoints.length;
    scrollToSlide(next);
  };

  const handlePrevSlide = () => {
    const prev = (currentSlideIndex - 1 + touchpoints.length) % touchpoints.length;
    scrollToSlide(prev);
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
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/agu/hero.jpg"
        urlPath="https://digitaleffect.net/agu/"
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-blue-600 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-blue-400 animate-in slide-in-from-bottom">
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(11,59,128,0.035)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

                  {/* Main Visual Frame */}
                  <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-24 sm:pb-28">
                    {/* Top slide identifier badge */}
                    <div className={`mb-3 transition-all duration-700 delay-100 flex items-center gap-2 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
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
                        <Maximize2 className="w-4 h-4 text-blue-600" />
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
            <div className="text-[11px] font-mono font-black text-blue-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-md">
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
                        ? 'w-3 h-8 bg-gradient-to-b from-blue-600 to-sky-500 rounded-full shadow-md shadow-blue-500/40' 
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
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {activeSlide.badge}
                    </span>
                    <span className="text-xs text-sky-600 font-bold">
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
                <div className="space-y-1">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {activeSlide.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-3">
                    {activeSlide.desc}
                  </p>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                      <span>{isAr ? 'السابق' : 'Prev'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm shadow-blue-600/30 cursor-pointer"
                    >
                      <span>{isAr ? 'التالي' : 'Next'}</span>
                      {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveLightboxImg({ url: activeSlide.url, title: activeSlide.title, desc: activeSlide.desc })}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تكبير عالي الدقة' : 'Zoom HD'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCaptionCard(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'عرض تفاصيل الصورة والمشروع' : 'Show Details'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW MODE 2: DETAILED GUIDELINES, COLOR PALETTE & ARCHITECTURE */
        /* ============================================================== */
        <div className="pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-300 bg-white">
          {/* Hero Branding Header */}
          <section className="relative pt-6 pb-8 border-b border-slate-200 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'الهوية المؤسسية (Corporate Identity)' : 'Corporate Identity & Brand Architecture'}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{isAr ? 'المقاولات والهندسة والتجارة B2B' : 'B2B Contracting & Regional Trade'}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? 'مشروع معتمد رسمياً' : 'Official Agency Case Study'}</span>
              </span>
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {isAr ? (
                  <>
                    الاتحاد العربي الخليجي <span className="text-blue-700">AGU</span>
                    <span className="block text-xl sm:text-3xl text-slate-600 font-bold mt-2">
                      بناء الهوية المؤسسية الشاملة والمعايير البصرية لعملاق المقاولات والتجارة الدولية
                    </span>
                  </>
                ) : (
                  <>
                    Arab Gulf United <span className="text-blue-700">AGU</span>
                    <span className="block text-xl sm:text-3xl text-slate-600 font-bold mt-2">
                      Corporate Identity & Visual Brand Architecture for Regional Heavy Engineering
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
                {isAr 
                  ? 'رحلة ابتكار منظومة بصرية متكاملة تعكس ريادة وهيبة شركة الاتحاد العربي الخليجي؛ بدءاً من صياغة الشعار الهندسي وشبكة النسب الدقيقة، وحتى التطبيقات الميدانية القاسية على خوذات المهندسين، أسطول السيارات التنفيذية، وأجنحة المعارض الدولية.'
                  : 'The creation of an authoritative corporate visual ecosystem for AGU: from mathematical logo geometry to harsh field engineering gear, luxury vehicle fleets, and international trade show pavilions.'}
              </p>
            </div>

            {/* 4 Audited Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  {isAr ? 'تغطية نقاط الاتصال المؤسسية' : 'Touchpoints Coverage'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono block">100%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isAr ? 'من المعدات الميدانية حتى أجنحة المعارض' : 'field safety gear to expo pavilions'}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  {isAr ? 'تميز الحضور المؤسسي بالمعارض' : 'Exhibition Presence'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-sky-600 font-mono block">+450%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isAr ? 'حضور طاغٍ في المحافل الاستثمارية' : 'unmatched regional expo presence'}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  {isAr ? 'اعتماد العروض الفنية والمناقصات' : 'Tender Win Rate'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block">+210%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isAr ? 'ارتفاع ثقة الجهات والمستثمرين' : 'accelerated institutional approval'}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  {isAr ? 'دليل المعايير البصرية الكامل' : 'Brand Manual Scope'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-700 font-mono block">60+ {isAr ? 'صفحة' : 'Pgs'}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isAr ? 'كتيب معايير تفصيلي للألوان والخطوط' : 'comprehensive standards manual'}
                </span>
              </div>
            </div>
          </section>

          {/* Quick Trigger to return to Fullscreen Scroll Mode */}
          <div className="bg-slate-50 border border-blue-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'هل تفضل استعراض الصور بكامل الشاشة مع الحركة التفاعلية؟' : 'Prefer the Full-Screen Scroll Experience?'}</span>
              </h3>
              <p className="text-xs text-slate-600">
                {isAr ? 'انتقل إلى الوضع السينمائي للتنقل السلس عبر الاسكرول بين صور وتطبيقات هوية AGU الضخمة.' : 'Switch back to the immersive fullscreen scroll showcase mode.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('cinematic')}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-sm cursor-pointer shrink-0"
            >
              {isAr ? 'تشغيل وضع Full Screen ↗' : 'Launch Full Screen ↗'}
            </button>
          </div>

          {/* Technical Tabs (Touchpoints / Geometry / Colors / Gallery) */}
          <section className="space-y-8">
            <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setExplorerTab('touchpoints')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    explorerTab === 'touchpoints'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Layout className="w-4 h-4" />
                  <span>{isAr ? 'تطبيقات الهوية الواقعية (Touchpoints)' : 'Brand Touchpoints'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExplorerTab('anatomy')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    explorerTab === 'anatomy'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'تشريح الشعار والشبكة الهندسية (Geometry)' : 'Logo Anatomy & Grid'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExplorerTab('colors')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    explorerTab === 'colors'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>{isAr ? 'لوحة الألوان والمعايير (Color System)' : 'Color System'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExplorerTab('gallery')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    explorerTab === 'gallery'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'معرض الصور الكامل عالي الدقة' : 'Full HD Gallery'}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Grid Touchpoints */}
            {explorerTab === 'touchpoints' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-slate-500 font-bold text-[11px]">{isAr ? 'التصنيف:' : 'Filter:'}</span>
                  {[
                    { id: 'all', label: isAr ? 'كافة التطبيقات (10)' : 'All Touchpoints' },
                    { id: 'stationery', label: isAr ? 'القرطاسية والمطبوعات' : 'Stationery' },
                    { id: 'safety', label: isAr ? 'معدات السلامة والمواقع' : 'Safety & PPE' },
                    { id: 'exhibition', label: isAr ? 'أجنحة المعارض' : 'Exhibition' },
                    { id: 'fleet', label: isAr ? 'أسطول السيارات' : 'Fleet Livery' },
                    { id: 'profile', label: isAr ? 'الملف المؤسسي والكتالوج' : 'Profile & Catalogue' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setActiveTouchpointFilter(btn.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                        activeTouchpointFilter === btn.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTouchpoints.map((tp) => (
                    <div
                      key={tp.id}
                      onClick={() => setActiveLightboxImg({ url: tp.url, title: tp.title, desc: tp.desc })}
                      className="group bg-white rounded-3xl border border-slate-200 hover:border-blue-500 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col"
                    >
                      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden flex items-center justify-center p-4 border-b border-slate-100">
                        <img
                          src={tp.url}
                          alt={tp.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-3 rounded-2xl bg-blue-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <Maximize2 className="w-4 h-4" />
                            <span>{isAr ? 'معاينة بدقة عالية' : 'View Full Image'}</span>
                          </span>
                        </div>
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/95 text-blue-700 border border-slate-200 shadow-sm">
                          {tp.badge}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-sky-600 block mb-1">
                            {tp.categoryLabel}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {tp.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {tp.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Logo Anatomy & Geometry */}
            {explorerTab === 'anatomy' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                <div 
                  className="lg:col-span-7 bg-white rounded-2xl p-4 border border-slate-200 overflow-hidden cursor-pointer group shadow-sm"
                  onClick={() => setActiveLightboxImg({
                    url: '/assets/case-studies/agu/logo-grid.png',
                    title: isAr ? 'الشبكة الهندسية وبناء الشعار' : 'Logo Construction Grid',
                    desc: isAr ? 'الحسابات الهندسية لدوائر وانحناءات شعار AGU' : 'Mathematical calculations for AGU curves and geometry',
                  })}
                >
                  <div className="relative aspect-4/3 flex items-center justify-center">
                    <img
                      src="/assets/case-studies/agu/logo-grid.png"
                      alt="AGU Logo Grid"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تكبير المخطط الهندسي' : 'Zoom Grid'}</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المنطق المعماري للشعار' : 'Logo Architectural Logic'}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {isAr 
                      ? 'هندسة الشعار: دمج الصلابة المعمارية مع حركية النمو الإقليمي' 
                      : 'Logo Geometry: Architectural Solidity & Regional Dynamic Expansion'}
                  </h3>

                  <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span>{isAr ? '1. كتلة الحروف الرئيسية (AGU Typography)' : '1. Letterform Block'}</span>
                      </h4>
                      <p className="text-slate-600">
                        {isAr 
                          ? 'تصميم مائل بزاوية هندسية دقيقة يمنح الشعار إحساساً بالحركة والسرعة والانطلاق نحو المستقبل مع وزن عريض يوحي بالثقة والصلابة.'
                          : 'Engineered with bold forward-leaning italics conveying velocity, structural weight, and enterprise confidence.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        <span>{isAr ? '2. الدوائر المتدفقة (Dynamic Radiating Droplets)' : '2. Radiating Droplets'}</span>
                      </h4>
                      <p className="text-slate-600">
                        {isAr 
                          ? 'مصفوفة دوائر متدرجة الحجم تتوسع قطرياً لتعبر عن الشراكات المتعددة، مشروعات البنية التحتية، والتدفق الاقتصادي بين مصر ودول الخليج.'
                          : 'Proportionally scaled circular elements arrayed dynamically outwards, symbolizing regional partnerships and cross-border expansion.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>{isAr ? '3. التوافق المزدوج (Bilingual Lockup)' : '3. Bilingual Lockup'}</span>
                      </h4>
                      <p className="text-slate-600">
                        {isAr 
                          ? 'توازن بصري مدروس بين الاسم الإنجليزي (Arab Gulf United Co. Ltd) والاسم العربي (الاتحاد العربي الخليجي المحدودة) لضمان سهولة القراءة.'
                          : 'Meticulously aligned typography balancing the English and Arabic corporate titles for clear legal and commercial representation.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Color Palette & Simulator */}
            {explorerTab === 'colors' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {brandColors.map((color) => (
                    <div 
                      key={color.hex}
                      className="bg-white rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <div className="space-y-3">
                        <div 
                          className="w-full h-28 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center"
                          style={{ backgroundColor: color.hex }}
                        >
                          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-md backdrop-blur-md ${
                            color.textDark ? 'bg-black/10 text-slate-900' : 'bg-black/30 text-white'
                          }`}>
                            {color.hex}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{color.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{color.role}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2 text-[10px] font-mono text-slate-600">
                        <div className="flex justify-between">
                          <span>RGB:</span>
                          <span className="text-slate-900 font-bold">{color.rgb}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CMYK:</span>
                          <span className="text-slate-900 font-bold">{color.cmyk}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyColor(color.hex)}
                          className="w-full mt-2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedColor === color.hex ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isAr ? 'نسخ كود اللون (HEX)' : 'Copy HEX Code'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contrast Simulator */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span>{isAr ? 'محاكي تطبيق الشعار على الخلفيات المختلفة (Live Contrast Tester):' : 'Logo Contrast Tester:'}</span>
                      </h4>
                      <p className="text-xs text-slate-600">
                        {isAr ? 'جرب مرونة ظهور شعار AGU على خلفيات بيضاء، داكنة، أو كحلية ملكية' : 'Test logo visibility against light, dark, and navy backgrounds'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewBg('light')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewBg === 'light' ? 'bg-slate-100 text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isAr ? 'خلفية بيضاء' : 'White'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewBg('navy')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewBg === 'navy' ? 'bg-[#0B3B80] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isAr ? 'كحلي ملكي' : 'Royal Navy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewBg('dark')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewBg === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isAr ? 'داكن أونيكس' : 'Dark'}
                      </button>
                    </div>
                  </div>

                  <div className={`p-8 sm:p-12 rounded-2xl border transition-colors flex items-center justify-center min-h-[220px] ${
                    previewBg === 'light' 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : previewBg === 'navy'
                      ? 'bg-[#0B3B80] border-blue-900 shadow-md'
                      : 'bg-slate-950 border-slate-800 shadow-md'
                  }`}>
                    <img
                      src="/assets/case-studies/agu/hero.jpg"
                      alt="AGU Logo"
                      className={`max-w-md w-full object-contain ${
                        previewBg !== 'light' ? 'filter brightness-110 drop-shadow-md' : 'drop-shadow-sm'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Gallery */}
            {explorerTab === 'gallery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {touchpoints.map((tp, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLightboxImg({ url: tp.url, title: tp.title, desc: tp.desc })}
                    className="group relative aspect-4/3 bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-all p-3 shadow-sm hover:shadow-md"
                  >
                    <img
                      src={tp.url}
                      alt={tp.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <span className="text-xs font-bold text-white drop-shadow-sm">{tp.title}</span>
                      <span className="text-[10px] text-blue-200">{tp.categoryLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Strategic Narrative & Deliverables Scope */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2.5 text-rose-600">
                  <span className="p-2 rounded-xl bg-rose-100 border border-rose-200">
                    <ShieldCheck className="w-5 h-5 text-rose-600" />
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{isAr ? 'التحدي المؤسسي (The Challenge)' : 'The Challenge'}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentCaseStudy.challenge}
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <div className="flex items-center gap-2.5 text-blue-700">
                  <span className="p-2 rounded-xl bg-blue-100 border border-blue-200">
                    <Sparkles className="w-5 h-5 text-blue-700" />
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{isAr ? 'الحل والمنهجية الهندسية (The Solution)' : 'The Solution'}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentCaseStudy.solution}
                </p>
              </div>

              {currentCaseStudy.quote && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 relative overflow-hidden space-y-3">
                  <Quote className="w-20 h-20 text-blue-600/10 absolute -left-4 -bottom-4 pointer-events-none" />
                  <blockquote className="text-sm sm:text-base text-slate-800 font-semibold italic leading-relaxed">
                    "{isAr ? currentCaseStudy.quote.text : currentCaseStudy.quote.textEn}"
                  </blockquote>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {isAr ? currentCaseStudy.quote.author : currentCaseStudy.quote.authorEn}
                      </div>
                      <div className="text-[11px] text-blue-700 font-bold">
                        {isAr ? currentCaseStudy.quote.role : currentCaseStudy.quote.roleEn}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {isAr ? 'شهادة معتمدة' : 'Verified Partner'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? 'نطاق مخرجات الهوية (Scope of Work):' : 'Delivered Scope:'}</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {(isAr ? currentCaseStudy.services : currentCaseStudy.servicesEn).map((service, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3.5 text-xs shadow-sm">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'بيانات المشروع والعميل:' : 'Project Details:'}</span>
                </h3>

                <div className="space-y-2.5 divide-y divide-slate-100 text-slate-700">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{isAr ? 'العميل:' : 'Client:'}</span>
                    <strong className="text-slate-900">{isAr ? currentCaseStudy.client : currentCaseStudy.clientEn}</strong>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{isAr ? 'القطاع:' : 'Industry:'}</span>
                    <span className="text-sky-700 font-semibold">{isAr ? currentCaseStudy.industry : currentCaseStudy.industryEn}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{isAr ? 'مدة التنفيذ:' : 'Duration:'}</span>
                    <span className="text-slate-800">{isAr ? currentCaseStudy.duration : currentCaseStudy.durationEn}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-slate-500">{isAr ? 'رابط العمل الرسمي:' : 'Live Showcase:'}</span>
                    <a
                      href="https://digitaleffect.net/agu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
                    >
                      <span>digitaleffect.net/agu</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-sky-700 text-white space-y-3 shadow-md">
                <h4 className="font-black text-base text-white">
                  {isAr ? 'هل تريد بناء هوية مؤسسية بنفس المعايير؟' : 'Ready to Elevate Your Corporate Brand?'}
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {isAr
                    ? 'نساعد كبرى الشركات والمصانع في صياغة هوية بصرية متكاملة تفرض هيبتها بالمعارض الدولية والمناقصات الكبرى.'
                    : 'We partner with leading enterprises to build authoritative visual identity systems commanding industry respect.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-blue-900 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  {isAr ? 'احجز استشارة الهوية المؤسسية الآن' : 'Book Corporate Branding Call'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================== */}
      {/* LIGHTBOX MODAL FOR ORIGINAL ULTRA-HD INSPECTION (CLEAN LIGHT)   */}
      {/* ============================================================== */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[94vh] bg-white rounded-3xl overflow-hidden border border-slate-200 p-4 sm:p-6 flex flex-col space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-black text-sm sm:text-base text-slate-900">{activeLightboxImg.title}</h4>
                {activeLightboxImg.desc && (
                  <p className="text-xs text-slate-500 mt-0.5">{activeLightboxImg.desc}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveLightboxImg(null)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-4 min-h-[350px] border border-slate-100">
              <img
                src={activeLightboxImg.url}
                alt={activeLightboxImg.title}
                className="max-h-[72vh] w-auto max-w-full object-contain drop-shadow-md"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
              <span>{isAr ? 'الاتحاد العربي الخليجي AGU | هوية مؤسسية' : 'Arab Gulf United AGU | Corporate Identity'}</span>
              <a
                href={activeLightboxImg.url}
                download
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                {isAr ? 'تحميل الصورة الأصلية' : 'Download Original Asset'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
