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
  PackageCheck
} from 'lucide-react';

export const SiltalIdentityCaseStudyPage: React.FC = () => {
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
  const [activeTouchpointFilter, setActiveTouchpointFilter] = useState<'all' | 'logo' | 'packaging' | 'catalog'>('all');

  // Interactive Color Simulator
  const [previewBg, setPreviewBg] = useState<'light' | 'crimson' | 'slate'>('light');

  const pageTitle = isAr
    ? 'دراسة حالة سيلتال SILTAL | الهوية البصرية وتصميم العبوات والكتالوج — ديجيتال إفكت'
    : 'SILTAL Corporate Identity, Packaging & Catalog Case Study | Digital Effect';

  const pageDescription = isAr
    ? 'تصميم الهوية المؤسسية وتطوير منظومة تغليف الأجهزة المنزلية والكتالوج الموحد لشركة سيلتال (SILTAL) بالمنطقة الصناعية بالسادس من أكتوبر: الشعار ثنائي اللغة، عبوات الفريزر والأجهزة الصغيرة، والكتالوج الفني.'
    : 'Comprehensive corporate identity, modular packaging architecture, and bilingual catalog system for SILTAL Home Appliances (6th of October Industrial Zone, Egypt).';

  // Touchpoints with local high-resolution assets (all 9 curated slides from digitaleffect.net/siltal-identity/)
  const touchpoints = [
    {
      id: 'tp-hero',
      category: 'logo',
      categoryLabel: isAr ? 'الشعار والتركيب ثنائي اللغة' : 'Bilingual Brand Mark',
      title: isAr ? 'الشعار المعتمد ثنائي اللغة (SILTAL / سيلتال)' : 'Official SILTAL / سيلتال Slanted Monogram',
      desc: isAr
        ? 'تايبوجرافي مائل متناغم باللغتين الإنجليزية والعربية باللون القرمزي الأيقوني لسيلتال، يوازن بين السرعة التقنية الأوروبية والرسوخ الصناعي المصري.'
        : 'Synchronized italicized bilingual wordmark uniting Latin geometric precision with custom Arabic Kufi calligraphy in signature Siltal Crimson Red.',
      url: '/assets/case-studies/siltal-identity/hero-logo.png',
      aspect: 'wide',
      badge: isAr ? 'الشعار المعتمد' : 'Official Logo',
    },
    {
      id: 'tp-cf350',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف خطوط التبريد' : 'Refrigeration Packaging',
      title: isAr ? 'عبوة الفريزر الرأسي (Model: CF-350 Chest Freezer)' : 'Vertical Chest Freezer Packaging (CF-350)',
      desc: isAr
        ? 'نظام تغليف رأسي يوظف الزوايا المثلثية الحمراء والزرقاء الداكنة مع قائمة أيقونات تقنية واضحة (صديق للبيئة، توفير الطاقة، موزع إضاءة، الخط الساخن 15526).'
        : 'Vertical carton engineering pairing sharp crimson and deep petrol slate diagonals with 7 high-contrast bilingual feature badges and Hotline 15526 callout.',
      url: '/assets/case-studies/siltal-identity/slide-02.jpg',
      aspect: 'tall',
      badge: isAr ? 'فريزر رأسي CF-350' : 'Model CF-350',
    },
    {
      id: 'tp-cf270',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف خطوط التبريد' : 'Refrigeration Packaging',
      title: isAr ? 'عبوة الفريزر الأفقي (Model: CF-270 Chest Freezer)' : 'Horizontal Chest Freezer Packaging (CF-270)',
      desc: isAr
        ? 'تصميم كرتونة الفريزر الأفقي بمزيج القرمزي والأزرق البترولي الداكن، يبرز جودة الضاغط الإيطالي والمواصفات القياسية الثنائية للعرض في المعارض والمنافذ.'
        : 'High-impact horizontal freezer box uniting bold petrol top flaps with clean kitchen lifestyle photography and Italian Technology seal integration.',
      url: '/assets/case-studies/siltal-identity/slide-03.jpg',
      aspect: 'tall',
      badge: isAr ? 'فريزر أفقي CF-270' : 'Model CF-270',
    },
    {
      id: 'tp-hvc2400',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف الأجهزة المنزلية الصغيرة' : 'Small Appliances Packaging',
      title: isAr ? 'عبوة المكنسة الكهربائية ٢٤٠٠ وات (Model: HVC-1000)' : 'Vacuum Cleaner Packaging — 2400W (HVC-1000)',
      desc: isAr
        ? 'تصميم تغليف ديناميكي للمكنسة الكهربائية 2400 وات يعرض شريط المزايا الهندسية السباعية بالأعلى وخيارات الألوان المتاحة على الواجهة الجانبية.'
        : 'Modular packaging grid for the 2400W HVC-1000 cylinder vacuum displaying 7 performance icons at top-right and color SKU swatches along the side panel.',
      url: '/assets/case-studies/siltal-identity/slide-04.jpg',
      aspect: 'wide',
      badge: isAr ? 'مكنسة 2400 وات' : '2400W Vacuum',
    },
    {
      id: 'tp-hsm1000',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف أجهزة المطبخ' : 'Kitchen Appliances Packaging',
      title: isAr ? 'عبوة مضرب العجان ١٠٠٠ وات (Model: HSM-1000)' : 'Stand Mixer Packaging — 1000W (HSM-1000)',
      desc: isAr
        ? 'عبوة عجان 1000 وات بتوازن مثالي بين التصوير الواقعي للمنتج واللمسات الحمراء القرمزية وشعار المكونات الماليزية (سوبر شيف) والخط الساخن 15526.'
        : 'Coordinated kitchen carton layout highlighting the 1000W stand mixer alongside Super Chef component seals, attachment charts, and color selectors.',
      url: '/assets/case-studies/siltal-identity/slide-05.jpg',
      aspect: 'wide',
      badge: isAr ? 'عجان 1000 وات' : 'Model HSM-1000',
    },
    {
      id: 'tp-hov48',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف أجهزة الطهي' : 'Cooking Appliances Packaging',
      title: isAr ? 'عبوة الفرن الكهربائي ٥٠ لتر (Model: HOV-48)' : 'Electric Oven Packaging — 50L 1600W (HOV-48)',
      desc: isAr
        ? 'تغليف موحد للفرن الكهربائي سعة 50 لتر بقدرة 1600 وات يبرز برامج الشواء والمكونات التركية بوضوح طباعي فائق وسهولة تمييز على الأرفف.'
        : 'Unified electric oven packaging presenting 50L / 1600W performance metrics, Turkish components emblem, and clear side specification schematics.',
      url: '/assets/case-studies/siltal-identity/slide-06.jpg',
      aspect: 'wide',
      badge: isAr ? 'فرن 50 لتر HOV-48' : 'Model HOV-48',
    },
    {
      id: 'tp-hsm1300',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف أجهزة المطبخ' : 'Kitchen Appliances Packaging',
      title: isAr ? 'عبوة مضرب العجان الاحترافي ١٣٠٠ وات (Model: HSM-1300)' : 'Pro Stand Mixer Packaging — 1300W (HSM-1300)',
      desc: isAr
        ? 'تطبيق الخط الشبكي الموحد لسيلتال على فئة العجان المعدني الثقيل 1300 وات لتأكيد التناغم التام عبر جميع خطوط الإنتاج والتصنيع.'
        : 'Consistent geometric Siltal packaging hierarchy extended cleanly to the heavy-duty 1300W silver stand mixer line.',
      url: '/assets/case-studies/siltal-identity/slide-07.jpg',
      aspect: 'wide',
      badge: isAr ? 'عجان 1300 وات' : 'Model HSM-1300',
    },
    {
      id: 'tp-hvc2000',
      category: 'packaging',
      categoryLabel: isAr ? 'تغليف الأجهزة المنزلية الصغيرة' : 'Small Appliances Packaging',
      title: isAr ? 'عبوة المكنسة الكهربائية ٢٠٠٠ وات (Model: HVC-1000)' : 'Vacuum Cleaner Packaging — 2000W (HVC-1000)',
      desc: isAr
        ? 'اتساق الهوية البصرية لشركة سيلتال عبر فئات الطاقة المتعددة للمكانس، مع حفاظ كامل على وضوح القدرة (2000 وات) والخط الساخن الموحد.'
        : 'Modular shelf architecture maintaining visual continuity across dual wattage vacuum SKUs with clear 2000W power hierarchy.',
      url: '/assets/case-studies/siltal-identity/slide-08.jpg',
      aspect: 'wide',
      badge: isAr ? 'مكنسة 2000 وات' : '2000W Vacuum',
    },
    {
      id: 'tp-catalog',
      category: 'catalog',
      categoryLabel: isAr ? 'الكتالوج المؤسسي وجداول المواصفات' : 'Corporate & Specs Catalog',
      title: isAr ? 'الكتالوج الموحد للأجهزة والمواصفات الفنية (Product Catalog)' : 'Bilingual Product Line & Technical Specs Catalog',
      desc: isAr
        ? 'تصميم الكتالوج الرسمي لشركة سيلتال بغلاف داكن فاخر وواجهة خلفية تتضمن بيانات مصنع السادس من أكتوبر (www.siltal.com / 15526) وصفحات مواصفات داخلية مفصلة.'
        : 'Flagship dark matte and crimson corporate catalog containing detailed multi-finish appliance spreads, technical metric tables, and 6th of October factory contacts.',
      url: '/assets/case-studies/siltal-identity/slide-09.jpg',
      aspect: 'wide',
      badge: isAr ? 'الكتالوج الرسمي' : 'Corporate Catalog',
    },
  ];

  // Brand Color Palette with one-click copy
  const brandColors = [
    { name: isAr ? 'قرمزي سيلتال الأيقوني (Siltal Crimson)' : 'Siltal Crimson Red', hex: '#E61E25', cmyk: 'C:4 M:98 Y:95 K:0', pantone: 'PMS 185 C', role: isAr ? 'اللون الرئيسي للشعار والمثلثات الهندسية وعناوين القدرة' : 'Primary wordmark hue, geometric shard frames & wattage callouts' },
    { name: isAr ? 'أزرق بترولي صناعي (Deep Petrol Slate)' : 'Deep Petrol Slate', hex: '#102D3A', cmyk: 'C:92 M:64 Y:48 K:52', pantone: 'PMS 3035 C', role: isAr ? 'أغطية العبوات العلوية وشرائط المواصفات الجانبية المتباينة' : 'Contrast packaging panels, lid headers & technical feature bars' },
    { name: isAr ? 'فحمي المعادن الداكن (Appliance Charcoal)' : 'Appliance Charcoal', hex: '#2B2E33', cmyk: 'C:71 M:63 Y:58 K:64', pantone: 'PMS 432 C', role: isAr ? 'خلفيات أغلفة الكتالوج الفاخرة وعناوين المواصفات' : 'Dark matte catalog covers & typographic spec headings' },
    { name: isAr ? 'رمادي معدني فاتح (Clean Appliance Gray)' : 'Metallic Light Gray', hex: '#F1F3F5', cmyk: 'C:5 M:3 Y:3 K:0', pantone: 'PMS Cool Gray 1 C', role: isAr ? 'أرضيات عرض الأجهزة النظيفة وصفحات المواصفات الثنائية' : 'Clean studio backgrounds & high-legibility spec tables' },
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
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-600 selection:text-white relative">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/siltal-identity/hero-logo.png"
        urlPath="https://digitaleffect.net/siltal-identity/"
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-[#102D3A] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-red-500/50 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-[#E61E25]" />
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,30,37,0.035)_0%,transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

                  {/* Main Visual Frame */}
                  <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-24 sm:pb-28">
                    {/* Top slide identifier badge */}
                    <div className={`mb-3 transition-all duration-700 delay-100 flex items-center gap-2 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-50 text-red-700 border border-red-200 shadow-xs">
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
                        className={`max-h-[68vh] sm:max-h-[74vh] max-w-[94vw] sm:max-w-[86vw] w-auto h-auto object-contain drop-shadow-[0_20px_45px_rgba(16,45,58,0.12)] transition-all duration-700 ease-out transform ${
                          isActive
                            ? 'scale-100 opacity-100 translate-y-0 filter brightness-100'
                            : 'scale-95 opacity-30 translate-y-6 filter brightness-95'
                        } group-hover:scale-[1.015]`}
                      />

                      {/* Hover Magnify Prompt */}
                      <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 rounded-2xl bg-white/95 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xl pointer-events-none">
                        <Maximize2 className="w-4 h-4 text-red-600" />
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
            <div className="text-[11px] font-mono font-black text-red-700 bg-white px-2.5 py-1 rounded-xl border border-red-200 shadow-md">
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
                        ? 'w-3 h-8 bg-gradient-to-b from-[#E61E25] via-[#C8161D] to-[#102D3A] rounded-full shadow-md shadow-red-600/30'
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
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {activeSlide.badge}
                    </span>
                    <span className="text-xs text-[#102D3A] font-bold">
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
                          ? 'bg-[#E61E25] text-white shadow-sm'
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
                      <LayoutGrid className="w-3.5 h-3.5 text-[#E61E25]" />
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
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#E61E25] hover:bg-red-700 text-white shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طلب هوية وتغليف' : 'Get Identity'}</span>
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
                <Info className="w-4 h-4 text-[#E61E25]" />
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
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-[#E61E25] to-[#102D3A] text-white shadow-md">
                <PackageCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isAr ? 'دليل الهوية ومنظومة العبوات — SILTAL سيلتال' : 'Technical Specifications & Packaging System — SILTAL'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isAr ? 'تشريح الشعار ثنائي اللغة، هندسة عبوات خطوط التبريد والمطبخ، والكتالوج الموحد' : 'Bilingual wordmark geometry, appliance packaging grid, and corporate catalog'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('cinematic')}
                className="px-4 py-2 rounded-2xl text-xs font-black bg-[#E61E25] hover:bg-red-700 text-white shadow-md shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer"
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
                  ? 'bg-[#E61E25] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{isAr ? 'معرض العبوات والكتالوج (9)' : 'Packaging & Catalog Gallery (9)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('anatomy')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'anatomy'
                  ? 'bg-[#E61E25] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isAr ? 'تشريح الشعار والشبكة الهندسية' : 'Logo & Packaging Grid'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('colors')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'colors'
                  ? 'bg-[#E61E25] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isAr ? 'الألوان الصناعية المعتمدة' : 'Brand Color Palette'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExplorerTab('profile')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                explorerTab === 'profile'
                  ? 'bg-[#E61E25] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'عن مصنع سيلتال (6 أكتوبر)' : 'About SILTAL Factory'}</span>
            </button>
          </div>

          {/* TAB 1: TOUCHPOINTS GRID */}
          {explorerTab === 'touchpoints' && (
            <div className="space-y-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">{isAr ? 'التصنيف:' : 'Filter:'}</span>
                {[
                  { id: 'all', label: isAr ? 'كافة النماذج (9)' : 'All Items (9)' },
                  { id: 'logo', label: isAr ? 'الشعار ثنائي اللغة' : 'Brand Mark' },
                  { id: 'packaging', label: isAr ? 'عبوات المنتجات (7)' : 'Product Packaging (7)' },
                  { id: 'catalog', label: isAr ? 'الكتالوج الفني' : 'Product Catalog' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTouchpointFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTouchpointFilter === tab.id
                        ? 'bg-[#E61E25] text-white shadow-sm'
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
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-red-500 p-4 shadow-sm hover:shadow-xl transition-all cursor-zoom-in flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-4">
                      <img
                        src={tp.url}
                        alt={tp.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-red-700 border border-red-200 shadow-sm">
                        {tp.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                        {tp.categoryLabel}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-red-600 transition-colors mt-0.5">
                        {tp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {tp.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-red-600 font-bold">
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
                    <span className="text-xs font-black text-red-600 uppercase">Synchronized Bilingual Wordmark</span>
                    <h3 className="text-xl font-black text-slate-900">{isAr ? 'تشريح شعار سيلتال ومنظومة الشرائح الهندسية' : 'Bilingual Calligraphy & Modular Carton Shards'}</h3>
                  </div>
                  <span className="p-3 rounded-2xl bg-red-50 text-red-600">
                    <Layers className="w-6 h-6" />
                  </span>
                </div>

                <div className="relative aspect-video rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-6">
                  <img
                    src="/assets/case-studies/siltal-identity/hero-logo.png"
                    alt="SILTAL Bilingual Logo Anatomy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#E61E25]" />
                      <span>{isAr ? 'التناغم الإيطالي العربي (Slanted Lockup)' : 'Slanted Parallel Italic Axis'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? 'تصميم حروف سيلتال باللغتين على زاوية ميل متطابقة تعبر عن الديناميكية والتقنية الهندسية مع قراءة فورية من بعيد على الكراتين والمعارض.'
                        : 'Matched slanted baselines uniting SILTAL and Arabic lettering for unmistakable shelf visibility across supermarkets and showrooms.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#102D3A]" />
                      <span>{isAr ? 'نظام تغليف مرن (Modular Grid System)' : 'Multi-SKU Packaging Architecture'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr
                        ? 'شبكة عبوات قياسية تستخدم الشرائح القطرية والأيقونات الدائرية لربط الفريزر والفرن والمكانس والعجان بهوية مصنع واحد قوي.'
                        : 'Unified diagonal frame and circular spec badge grid tying Chest Freezers, Ovens, Mixers, and Vacuums into one cohesive flagship family.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#102D3A] text-white rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-[#E61E25]">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase">{isAr ? 'توحيد خطوط الإنتاج تحت هوية بصرية موحدة' : 'Unified Industrial Appliance Family'}</h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {isAr
                      ? 'بدلاً من تصميم عبوة منفصلة لكل جهاز، ابتكر فريق ديجيتال إفكت نظام تغليف معمارياً مرناً لـ SILTAL يبرز الموديل والقدرة الكهربائية والمزايا الفنية بسرعة فائقة أمام المتسوق والموزع.'
                      : 'Rather than isolated one-off boxes, Digital Effect engineered a modular packaging language showcasing wattage, capacity, and component origin across Siltal retail aisles.'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">{isAr ? 'مكونات حزمة الهوية والتغليف' : 'Brand & Packaging Rollout'}</h4>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{isAr ? 'تطوير الشعار المعتمد ثنائي اللغة (SILTAL / سيلتال)' : 'Synchronized Bilingual Logo System'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{isAr ? 'عبوات الديب فريزر الأفقي والرأسي (CF-350 / CF-270)' : 'Vertical & Horizontal Freezer Packaging (CF-350 / CF-270)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{isAr ? 'عبوات أجهزة المطبخ والعناية المنزلية (HVC / HSM / HOV)' : 'Kitchen & Vacuum Appliance Cartons (HVC / HSM / HOV)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{isAr ? 'كتالوج المنتجات الموحد وجداول المواصفات القياسية' : 'Official Multi-Finish Product & Specs Catalog'}</span>
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
                      {isAr ? 'محاكي التباين اللوني على أسطح التغليف والكتالوج' : 'Packaging & Print Contrast Simulator'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'اختبر وضوح شعار SILTAL سيلتال على الورق الأبيض والقرمزي والأزرق البترولي الداكن' : 'Verify SILTAL bilingual wordmark visibility across carton stock, crimson, and deep petrol slate'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'light' ? 'bg-white border-red-600 text-slate-900 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isAr ? 'أبيض ناصع' : 'Pure White'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('crimson')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'crimson' ? 'bg-[#E61E25] border-white text-white shadow-sm' : 'bg-[#E61E25]/85 border-red-400 text-white'
                      }`}
                    >
                      {isAr ? 'قرمزي سيلتال' : 'Siltal Crimson'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('slate')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        previewBg === 'slate' ? 'bg-[#102D3A] border-[#E61E25] text-white shadow-sm' : 'bg-[#102D3A]/85 border-slate-600 text-slate-200'
                      }`}
                    >
                      {isAr ? 'أزرق بترولي' : 'Petrol Slate'}
                    </button>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl flex items-center justify-center transition-colors duration-500 min-h-[220px] ${
                  previewBg === 'light'
                    ? 'bg-white border border-slate-200'
                    : previewBg === 'crimson'
                    ? 'bg-[#E61E25]'
                    : 'bg-[#102D3A]'
                }`}>
                  <img
                    src="/assets/case-studies/siltal-identity/hero-logo.png"
                    alt="SILTAL Wordmark Preview"
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
                  <span className="text-xs font-black text-red-600 uppercase">Home Appliances & Industrial Manufacturing</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {isAr ? 'شركة سيلتال للأجهزة المنزلية (SILTAL)' : 'SILTAL Home Appliances Egypt'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {isAr ? 'المنطقة الصناعية، مدينة السادس من أكتوبر، مصر • الخط الساخن: 15526' : 'Industrial Zone, 6 of October City, Egypt • Hotline: 15526'}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isAr
                    ? 'تُعد شركة سيلتال إحدى العلامات الرائدة في تصنيع وتجميع الأجهزة المنزلية الكهربائية في مصر بالتكنولوجيا الإيطالية والأوروبية، انطلاقاً من مصانعها بالمنطقة الصناعية بمدينة السادس من أكتوبر لتغطي خطوط الديب فريزر والأفران والمكانس ومحضرات الطعام.'
                    : 'Operating from the 6th of October Industrial Zone in Egypt, SILTAL manufactures and distributes European-engineered refrigeration units, ovens, stand mixers, and vacuum cleaners nationwide supported by Hotline 15526.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المصنع الرئيسي' : 'Industrial Plant'}</span>
                    <div className="text-lg font-black text-slate-900">{isAr ? '6 أكتوبر' : '6 of October'}</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'المنطقة الصناعية' : 'Industrial Zone, Egypt'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'الخط الساخن الموحد' : 'Customer Hotline'}</span>
                    <div className="text-lg font-black text-[#E61E25]">15526</div>
                    <span className="text-[11px] text-slate-500">www.siltal.com</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'نطاق الهوية' : 'Identity Scope'}</span>
                    <div className="text-lg font-black text-slate-900">Packaging + ID</div>
                    <span className="text-[11px] text-slate-500">{isAr ? 'الهوية والعبوات والكتالوج' : 'Brand, Boxes & Catalog'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-red-900">{isAr ? 'بيانات الاتصال الرسمية والصفحة المرجعية' : 'Official Factory Contacts & Reference'}</h5>
                    <p className="text-[11px] text-red-800 font-medium">Tel: 0236912248 - 0236912249 • Hotline: 15526 • www.siltal.com</p>
                  </div>
                  <a
                    href="https://digitaleffect.net/siltal-identity/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#E61E25] hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{isAr ? 'الرابط المرجعي' : 'View Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#102D3A] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#E61E25] uppercase">{isAr ? 'شهادة العميل' : 'Client Testimonial'}</span>
                  <Quote className="w-8 h-8 text-[#E61E25]/40" />
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {isAr
                      ? '"وحدت ديجيتال إفكت واجهة جميع عبوات أجهزتنا المنزلية والكتالوج الفني تحت نظام بصري قوي يبرز المواصفات القياسية وموثوقية سيلتال على كل رف عرض في مصر."'
                      : '"Digital Effect unified every SILTAL product box and our corporate technical catalog under one commanding visual architecture that stands out cleanly across retail shelves."'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700 space-y-1">
                  <h6 className="text-xs font-black text-white">{isAr ? 'الإدارة الصناعية والتسويق — سيلتال' : 'Industrial & Marketing Management — SILTAL'}</h6>
                  <p className="text-[11px] text-slate-300">SILTAL Home Appliances — 6th of October, Egypt</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#E61E25] hover:bg-red-700 text-white text-xs font-black transition-all shadow-lg shadow-red-950/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'طلب هوية وتغليف لمصنعك' : 'Request Identity & Packaging'}</span>
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
              <span className="text-slate-500 font-mono">SILTAL Home Appliances — 6th of October, Egypt • Identity & Packaging</span>
              <a
                href={activeLightboxImg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
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
