import React, { useState, useEffect } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SeoHead } from '../components/SeoHead';
import {
  Share2,
  ExternalLink,
  CheckCircle2,
  Quote,
  Maximize2,
  X,
  Copy,
  Check,
  Globe,
  Sliders,
  ShoppingCart,
  Search,
  Smartphone,
  Monitor,
  ArrowLeftRight,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  PhoneCall,
  Sparkles,
  CheckCheck,
  ChevronRight
} from 'lucide-react';

interface StorefrontBoard {
  id: string;
  chapter: string;
  category: 'storefront' | 'banners' | 'brand';
  categoryLabel: string;
  title: string;
  desc: string;
  url: string;
  spanWide?: boolean;
  captionCode: string;
}

export const PenguinWebsiteCaseStudyPage: React.FC = () => {
  const { data, language, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  // Interactive States
  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; title: string; desc?: string } | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeBoardFilter, setActiveBoardFilter] = useState<'all' | 'storefront' | 'banners' | 'brand'>('all');

  // Interactive E-Commerce Storefront Simulation
  const [simLang, setSimLang] = useState<'en' | 'ar'>(isAr ? 'ar' : 'en');
  const [selectedCompressor, setSelectedCompressor] = useState<'Inverter' | 'LG Compressor'>('Inverter');
  const [selectedGlassDoor, setSelectedGlassDoor] = useState<'Yes' | 'No'>('Yes');
  const [simCartCount, setSimCartCount] = useState<number>(1);
  const [simAddedFlash, setSimAddedFlash] = useState<boolean>(false);

  // Interactive Logo Contrast Stage
  const [previewBg, setPreviewBg] = useState<'light' | 'snow' | 'obsidian'>('light');

  // Interactive Dispenser Matrix Focus
  const [highlightedDispenser, setHighlightedDispenser] = useState<'HR001' | 'PD001' | 'PD002'>('HR001');

  // Mobile/Desktop Preview Switcher inside Hero Stage
  const [heroDeviceFocus, setHeroDeviceFocus] = useState<'dual' | 'desktop' | 'mobile'>('dual');

  // Active chapter highlight synced subtly with anchor clicks
  const [activeChapter, setActiveChapter] = useState<string>('overview');

  const liveSiteUrl = 'https://penguin-appliances.com/en';

  const pageTitle = isAr
    ? 'دراسة حالة متجر بينجوين الإلكتروني Penguin Appliances | تصميم الويب والهوية الرقمية — ديجيتال إفكت'
    : 'Penguin Appliances — E-Commerce Website & Brand Identity Case Study | Digital Effect';

  const pageDescription = isAr
    ? 'عرض تحريري متكامل لتصميم وتطوير متجر بينجوين للأجهزة المنزلية (penguin-appliances.com/en): نظام الهوية البصرية الرقمية، واجهات التسوق ثنائية اللغة عربي/إنجليزي، محاكاة اختيار المواصفات، وجدول مقارنة المبردات.'
    : 'Editorial Web & Brand Identity case study for Penguin Appliances (penguin-appliances.com/en): bilingual EN/AR Shopify storefront, visual identity system, live spec-variant cards, and dispenser comparison matrix.';

  useEffect(() => {
    setSimLang(isAr ? 'ar' : 'en');
  }, [isAr]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLightboxImg) {
        setActiveLightboxImg(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeLightboxImg]);

  const scrollToSection = (id: string) => {
    setActiveChapter(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        // user cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {
        // clipboard unavailable
      }
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSimAddToCart = () => {
    setSimCartCount((prev) => prev + 1);
    setSimAddedFlash(true);
    setTimeout(() => setSimAddedFlash(false), 1600);
  };

  const chapters = [
    { id: 'overview', label: isAr ? '01 الموجز' : '01 Brief' },
    { id: 'brand-system', label: isAr ? '02 نظام الهوية' : '02 Brand System' },
    { id: 'ux-architecture', label: isAr ? '03 تجربة التسوق والـ UX' : '03 UX & Live Demo' },
    { id: 'mockup-boards', label: isAr ? '04 شاشات المتجر' : '04 UI Mockups' },
    { id: 'comparison-engine', label: isAr ? '05 محرك المقارنة' : '05 Compare Matrix' },
  ];

  const brandColors = [
    {
      name: isAr ? 'أبيض المعرض النقي' : 'Gallery Canvas White',
      hex: '#FFFFFF',
      token: '--color-white',
      usage: isAr ? 'سطح عرض الأجهزة — إبراز خامات الستانلس والأسود' : 'Product gallery surface & breathing space',
      darkText: true,
    },
    {
      name: isAr ? 'أسود التفاعل الكربوني' : 'Carbon Conversion Black',
      hex: '#111111',
      token: '--color-black',
      usage: isAr ? 'أزرار الشراء المباشر والتايبوجرافي الرئيسي' : 'Primary action buttons, navigation & headers',
      darkText: false,
    },
    {
      name: isAr ? 'أزرق البطريق الجليدي' : 'Arctic Ice Blue',
      hex: '#009FE3',
      token: '--color-arctic-primary',
      usage: isAr ? 'التوقيع اللوني للتبريد الإيطالي وهوية الشعار' : 'Signature cooling brand gradient & highlights',
      darkText: false,
    },
    {
      name: isAr ? 'أحمر شارات العروض' : 'Valencia Sale Accent',
      hex: '#D33636',
      token: '--color-valencia',
      usage: isAr ? 'شارات الخصومات الفورية (-18% / -16%)' : 'High-contrast promo discount tags (-18%)',
      darkText: false,
    },
  ];

  const storefrontBoards: StorefrontBoard[] = [
    {
      id: 'board-flagship',
      chapter: 'BOARD 01',
      category: 'storefront',
      categoryLabel: isAr ? 'واجهة المتجر الرئيسية' : 'Flagship Storefront Hero',
      title: isAr
        ? 'النظام المتكامل لصفحة المتجر الرئيسية وكتالوج الأجهزة الخمسة'
        : 'Flagship Homepage Hero & 5-Collection Merchandising Architecture',
      desc: isAr
        ? 'بناء هيكل الصفحة الرئيسية لتوجيه المتسوق بسلاسة من رسالة العلامة التجارية إلى خطوط الديب فريزر، الثلاجات، مبردات المياه، مراوح الستاند، والأجهزة المنزلية الصغيرة.'
        : 'Directing visitors seamlessly from value positioning into Chest Freezers, Refrigerators, Water Dispensers, Stand Fans, and Small Appliances with single-click collection access.',
      url: '/assets/case-studies/penguin-website/social-hero.jpg',
      spanWide: true,
      captionCode: 'DESKTOP 1440PX · SHOPIFY CUSTOM THEME',
    },
    {
      id: 'board-freezer',
      chapter: 'BOARD 02',
      category: 'banners',
      categoryLabel: isAr ? 'قسم الديب فريزر الأفقي' : 'Chest Freezers Merchandising',
      title: isAr
        ? 'مساحتك على قد احتياجاتك — عرض تقنيات الإنفرتر وكمبروسر LG'
        : 'Chest Freezers Collection — Inverter & LG Compressor Storytelling',
      desc: isAr
        ? 'تصميم بانر الهيرو الخاص بقسم الديب فريزر مع ربط مباشر بسعات 250 و317 و404 و505 لتر ومؤشرات التجميد السريع.'
        : 'Merchandising hero connecting architectural capacity cues cleanly to 250L–505L SKUs and sliding glass door options.',
      url: '/assets/case-studies/penguin-website/banner-hero-1.jpg',
      captionCode: 'COLLECTION HERO · 250L–505L',
    },
    {
      id: 'board-fridge',
      chapter: 'BOARD 03',
      category: 'banners',
      categoryLabel: isAr ? 'قسم الثلاجات الذكية' : 'Smart Refrigerators Showcase',
      title: isAr
        ? 'قوة في التبريد وصوت مش مسموع — FG330 و FG390'
        : 'Top-Mount Refrigerators — Silent Cooling & Modern Kitchen Integration',
      desc: isAr
        ? 'دمج المشاهد المعمارية للمطابخ مع أيقونات الأداء الصامت لرفع معدل التحويل على موديلات FG330 SMART و FG390 King.'
        : 'Lifestyle architectural integration alongside quiet-cooling specs driving conversion across FG330 SMART (303L) & FG390 King (340L).',
      url: '/assets/case-studies/penguin-website/banner-hero-2.jpg',
      captionCode: 'COLLECTION HERO · FG330 / FG390',
    },
    {
      id: 'board-dispenser',
      chapter: 'BOARD 04',
      category: 'storefront',
      categoryLabel: isAr ? 'مبردات المياه ونظام المقارنة' : 'Water Dispensers & Compare UX',
      title: isAr
        ? 'تجربة قسم مبردات المياه المرتبط بجدول المقارنة المباشر'
        : 'Water Dispensers Showcase & Built-In Comparison Flow',
      desc: isAr
        ? 'مسار بصري ينقل العميل من استعراض التصميم الخارجي إلى مقارنة استهلاك الطاقة والتبريد والسعر بين HR001 وPD001 وPD002.'
        : 'Visual merchandising linked directly into technical comparison tables across HR001, PD001, and PD002 dispensers.',
      url: '/assets/case-studies/penguin-website/banner-hero-3.jpg',
      captionCode: 'CONVERSION MODULE · 3 MODELS',
    },
    {
      id: 'board-minibar',
      chapter: 'BOARD 05',
      category: 'banners',
      categoryLabel: isAr ? 'سلسلة الميني بار FG200' : 'Mini Bar Compact Series',
      title: isAr
        ? 'ميني بار بنجوين FG200 — للمكتب والغرف والمساحات الذكية'
        : 'Mini Bar FG200 — Dual-Door Compact Living Editorial Module',
      desc: isAr
        ? 'واجهة مخصصة لإبراز البابين المنفصلين بسعة 150 لتر وتشغيل فائق الهدوء مع مؤشرات توفر المخزون اللحظية.'
        : 'Dedicated 150L dual-door positioning highlight communicating silent bedside and office operation with real-time Shopify stock sync.',
      url: '/assets/case-studies/penguin-website/banner-hero-4.jpg',
      captionCode: 'COMPACT SERIES · 150L SKU',
    },
    {
      id: 'board-brand-lockup',
      chapter: 'BOARD 06',
      category: 'brand',
      categoryLabel: isAr ? 'شعار الهيدر وهوية المتجر' : 'Header Lockup & Digital Signature',
      title: isAr
        ? 'شعار متجر بينجوين المعتمد وبنية الهيدر ثنائي اللغة'
        : 'Official Storefront Wordmark & Bilingual Header Construction',
      desc: isAr
        ? 'إعادة ضبط توازن الشعار في الهيدر العلوي للعمل بوضوح تام على خلفيات الأبيض والأسود الكربوني مع البحث الفوري وسلة الطلبات.'
        : 'Header crest calibration engineered for razor-sharp legibility across light, snow, and carbon navigation themes on desktop & mobile.',
      url: '/assets/case-studies/penguin-website/store-logo.png',
      captionCode: 'UI HEADER SYSTEM · RETINA PNG',
    },
  ];

  const dispenserSpecs = [
    {
      model: 'HR001',
      name: isAr ? 'مبرد مياه UV + ثلاجة سفلية' : 'UV Water Dispenser + Lower Fridge',
      price: 'LE 6,400',
      compareAt: 'LE 7,800',
      discount: '-18%',
      cooling: '85 – 95W',
      heating: '85 – 95°C (500W)',
      cabin: isAr ? 'كابينة ثلاجة مدمجة + تعقيم UV' : 'Built-In Mini Fridge + UV Hygiene',
      taps: isAr ? '٣ صنابير (بارد / دافئ / ساخن)' : '3 Taps (Hot / Cold / Ambient)',
    },
    {
      model: 'PD001',
      name: isAr ? 'مبرد مياه ديجيتال سيلفر' : 'Digital Display Silver Dispenser',
      price: 'LE 6,300',
      compareAt: 'LE 7,500',
      discount: '-16%',
      cooling: '80 – 90W',
      heating: '85 – 95°C',
      cabin: isAr ? 'كابينة تبريد سفلية متعددة الأغراض' : 'Lower Cooling Compartment',
      taps: isAr ? 'شاشة حرارة رقمية + أمان للأطفال' : 'Digital Indicator + Child Lock',
    },
    {
      model: 'PD002',
      name: isAr ? 'مبرد مياه عملي بارتفاع 109 سم' : 'Tall Storage Stand Dispenser (109cm)',
      price: 'LE 6,200',
      compareAt: 'LE 7,200',
      discount: '-14%',
      cooling: '80 – 90W',
      heating: '85 – 95°C',
      cabin: isAr ? 'مساحة تخزين سفلية محكمة' : 'Dust-Protected Storage Cabinet',
      taps: isAr ? 'خزان ستانلس ستيل غذائي 304' : 'Food-Grade 304 Stainless Tank',
    },
  ];

  const filteredBoards =
    activeBoardFilter === 'all'
      ? storefrontBoards
      : storefrontBoards.filter((item) => item.category === activeBoardFilter);

  const selectedPrice = selectedCompressor === 'LG Compressor' ? 'LE 15,250.00' : 'LE 14,450.00';

  void data;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-[#009FE3] selection:text-white pt-16 sm:pt-20"
    >
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        image="/assets/case-studies/penguin-website/social-hero.jpg"
        urlPath="https://penguin-appliances.com/en"
      />

      {/* Share Clipboard Toast */}
      {shareToast && (
        <div className="fixed bottom-6 start-6 z-50 px-4 py-3 bg-slate-950 text-white text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 border border-sky-400/40">
          <Check className="w-4 h-4 text-[#009FE3]" />
          <span>{isAr ? 'تم نسخ رابط دراسة الحالة بنجاح' : 'Case study link copied to clipboard'}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER NAVIGATION STRIP (STICKY SUB-NAV UNDER GLOBAL NAVBAR)          */}
      {/* ===================================================================== */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/assets/case-studies/penguin-website/store-logo.png"
              alt="Penguin Appliances"
              referrerPolicy="no-referrer"
              className="h-5 w-auto object-contain shrink-0"
            />
            <span className="hidden md:inline text-xs font-bold text-slate-400 shrink-0">/</span>
            <span className="hidden md:inline text-xs font-bold text-slate-800 truncate">
              {isAr ? 'دراسة حالة تصميم المتجر الإلكتروني والهوية الرقمية' : 'E-Commerce Website & Brand Case Study'}
            </span>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollToSection(ch.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeChapter === ch.id
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isAr ? 'مشاركة الرابط' : 'Share case study'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#009FE3] hover:bg-sky-600 text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <span>{isAr ? 'الموقع الحي' : 'Live Site'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BEHANCE EDITORIAL COVER BOARD — DARK OBSIDIAN STAGE + MULTI-DEVICE    */}
      {/* ===================================================================== */}
      <section className="relative bg-[#070B14] text-white overflow-hidden border-b border-slate-800">
        {/* Crisp architectural subtle grid + single Arctic glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-35 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(0,159,227,0.22),transparent_70%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24">
          {/* Unboxed Editorial Metadata Line (Zero-Pill Rule Applied) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/10 text-xs text-slate-400 font-medium">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[#009FE3] font-bold uppercase tracking-widest">
                {isAr ? 'دراسة حالة ويب وهوية رقمية' : 'WEBSITE DESIGN & BRAND IDENTITY'}
              </span>
              <span className="text-slate-600">·</span>
              <span>{isAr ? 'العميل: Penguin Appliances' : 'Client: Penguin Appliances'}</span>
              <span className="text-slate-600">·</span>
              <span>{isAr ? 'المنصة: Shopify ثنائي اللغة AR / EN' : 'Platform: Bilingual Shopify (EN / AR)'}</span>
              <span className="text-slate-600">·</span>
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 hover:text-[#009FE3] transition-colors inline-flex items-center gap-1"
                dir="ltr"
              >
                <span>penguin-appliances.com/en</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setHeroDeviceFocus('dual')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  heroDeviceFocus === 'dual' ? 'bg-[#009FE3] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isAr ? 'سطح المكتب + موبايل' : 'Dual Devices'}
              </button>
              <button
                type="button"
                onClick={() => setHeroDeviceFocus('desktop')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  heroDeviceFocus === 'desktop' ? 'bg-[#009FE3] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isAr ? 'شاشة الديسكتوب' : 'Desktop'}
              </button>
              <button
                type="button"
                onClick={() => setHeroDeviceFocus('mobile')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  heroDeviceFocus === 'mobile' ? 'bg-[#009FE3] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isAr ? 'واجهة الموبايل' : 'Mobile'}
              </button>
            </div>
          </div>

          {/* Typographic Headline Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-10 pb-12">
            <div className="lg:col-span-8 space-y-5">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-white">
                {isAr
                  ? 'بناء متجر بينجوين الإلكتروني — تجربة تسوق ذكية للأجهزة المنزلية'
                  : 'Smarter Appliances. High-Conversion E-Commerce Flagship.'}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                {isAr
                  ? 'من هوية المتجر عالية التباين إلى جداول مقارنة مبردات المياه ومحددات الكمبروسر التفاعلية: إعادة هندسة كاملة لرحلة الشراء الرقمية في السوق المصري باللغتين العربية والإنجليزية.'
                  : 'Transforming Penguin Appliances into a unified bilingual Shopify flagship—pairing crisp architectural hardware photography with card-level technical selectors and side-by-side comparison engines.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end gap-3 flex-wrap">
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-sky-50 text-xs sm:text-sm font-black inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Globe className="w-4 h-4 text-[#009FE3]" />
                <span>{isAr ? 'زيارة المتجر المباشر' : 'Visit Live Website'}</span>
              </a>
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{isAr ? 'اطلب تصميم موقع مماثل' : 'Request Similar Build'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* MULTI-DEVICE BEHANCE ARTBOARD (DESKTOP + OVERLAPPING MOBILE)      */}
          {/* ================================================================= */}
          <div className="relative mt-2">
            <div
              className={`grid gap-8 items-center ${
                heroDeviceFocus === 'mobile'
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : heroDeviceFocus === 'desktop'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 lg:grid-cols-12'
              }`}
            >
              {/* Desktop Storefront Viewport Mockup */}
              {heroDeviceFocus !== 'mobile' && (
                <div
                  onClick={() =>
                    setActiveLightboxImg({
                      url: '/assets/case-studies/penguin-website/social-hero.jpg',
                      title: isAr
                        ? 'واجهة متجر بينجوين الإلكتروني — عرض الأجهزة والبانر الرئيسي'
                        : 'Penguin Appliances Live Desktop Storefront — Hero & Collection System',
                      desc: isAr
                        ? 'تنظيم الكتالوج الكامل ليشمل الديب فريزر، الثلاجات، مبردات المياه، والمراوح مع بحث تنبؤي وسلة جانبية فورية.'
                        : 'Full bilingual Shopify flagship storefront with predictive search, top promo announcements, and instant Ajax cart drawer.',
                    })
                  }
                  className={`${
                    heroDeviceFocus === 'dual' ? 'lg:col-span-9' : 'col-span-1'
                  } group cursor-zoom-in rounded-2xl overflow-hidden border border-white/15 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.65)]`}
                >
                  {/* macOS / Browser Top Bar */}
                  <div
                    className="bg-slate-900 px-4 py-2.5 flex items-center justify-between gap-4 border-b border-slate-800"
                    dir="ltr"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
                    </div>
                    <div className="flex-1 max-w-md bg-slate-800 rounded-md px-3 py-1 text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>https://penguin-appliances.com/en</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      1440 × 900
                    </span>
                  </div>

                  {/* Authentic Store Announcement Strip + Header */}
                  <div
                    className="bg-[#111111] text-white text-[10px] font-medium py-1.5 px-4 flex items-center justify-between"
                    dir="ltr"
                  >
                    <span>Official Warranty & Technical Support · Hotline: 012 79714396</span>
                    <span className="hidden sm:inline text-sky-400">Free Shipping Promo Eligible</span>
                  </div>

                  <div
                    className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-800"
                    dir="ltr"
                  >
                    <img
                      src="/assets/case-studies/penguin-website/store-logo.png"
                      alt="Penguin Store Logo"
                      referrerPolicy="no-referrer"
                      className="h-7 w-auto object-contain"
                    />
                    <div className="hidden md:flex items-center gap-5 text-slate-600">
                      <span className="text-slate-950 font-black border-b-2 border-slate-950 pb-0.5">
                        Home
                      </span>
                      <span>Chest Freezers</span>
                      <span>Refrigerators</span>
                      <span>Water Dispensers</span>
                      <span>Stand Fans</span>
                      <span>Small Appliances</span>
                      <span className="text-[#D33636] font-black">Offers</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <Search className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold text-slate-500">العربية</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#111111] text-white text-[10px] font-bold">
                        <ShoppingCart className="w-3 h-3" /> Cart ({simCartCount})
                      </span>
                    </div>
                  </div>

                  {/* Hero Visual Canvas */}
                  <div className="relative bg-slate-100 aspect-[16/9] overflow-hidden">
                    <img
                      src="/assets/case-studies/penguin-website/social-hero.jpg"
                      alt="Penguin Appliances Flagship Product Lineup"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div
                      className="hidden sm:flex absolute bottom-4 inset-x-4 items-center justify-between bg-white/95 backdrop-blur-md rounded-xl px-5 py-3 border border-slate-200 shadow-lg"
                      dir="ltr"
                    >
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#009FE3]">
                          SMARTER APPLIANCES · BETTER EVERYDAY LIVING
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">
                          5 Collections · 25+ Certified Models · Interactive Variant Filtering
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white text-[11px] font-bold shrink-0 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        <span>{isAr ? 'تكبير العرض' : 'Inspect HD'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Responsive Mobile Viewport Frame (Behance Presentation Board Style) */}
              {heroDeviceFocus !== 'desktop' && (
                <div
                  className={`${
                    heroDeviceFocus === 'dual' ? 'lg:col-span-3' : 'col-span-1'
                  } flex justify-center`}
                >
                  <div
                    onClick={() =>
                      setActiveLightboxImg({
                        url: '/assets/case-studies/penguin-website/banner-hero-2.jpg',
                        title: isAr
                          ? 'تجربة التسوق عبر الموبايل (Responsive Mobile Checkout)'
                          : 'Mobile-First Responsive Storefront (390px Viewport)',
                        desc: isAr
                          ? 'تصميم متوافق بالكامل مع الشاشات المحمولة لمتسوقي مصر مع أزرار شراء واضحة ومحددات سريعة.'
                          : 'Thumb-friendly category navigation, crisp sale indicators (-18%), and bottom sticky checkout actions.',
                      })
                    }
                    className="w-full max-w-[290px] rounded-[2rem] border-[6px] border-slate-800 bg-white text-slate-900 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.6)] cursor-zoom-in group"
                    dir="ltr"
                  >
                    {/* Mobile Top Notch Bar */}
                    <div className="bg-slate-950 text-white px-4 py-2 flex items-center justify-between text-[10px] font-mono">
                      <span>9:41</span>
                      <span className="w-14 h-3 rounded-full bg-slate-800" />
                      <span>5G</span>
                    </div>

                    {/* Mobile Store Header */}
                    <div className="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
                      <img
                        src="/assets/case-studies/penguin-website/store-logo.png"
                        alt="Penguin Mobile"
                        referrerPolicy="no-referrer"
                        className="h-5 w-auto object-contain"
                      />
                      <div className="flex items-center gap-2 text-slate-700">
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black text-white bg-[#111111] px-2 py-0.5 rounded">
                          {simCartCount}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Promo Hero */}
                    <div className="relative h-36 bg-slate-100 overflow-hidden">
                      <img
                        src="/assets/case-studies/penguin-website/banner-hero-2.jpg"
                        alt="Refrigerators Mobile Hero"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex items-end p-3">
                        <div className="text-white">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-sky-300">
                            Top-Mount Cooling
                          </div>
                          <div className="text-xs font-black">FG330 SMART · 303L</div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Spec Mini Card */}
                    <div className="p-3.5 space-y-2.5 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">SKU: FG330-INV</span>
                        <span className="text-[10px] font-black text-[#D33636]">-16% OFF</span>
                      </div>
                      <div className="text-xs font-black text-slate-900 leading-snug">
                        Penguin FG330 Top-Mount Inverter Refrigerator
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-slate-950 tabular-nums">
                          LE 18,900
                        </span>
                        <span className="text-[10px] text-slate-400 line-through tabular-nums">
                          LE 22,500
                        </span>
                      </div>
                      <div className="pt-1 grid grid-cols-2 gap-1.5 text-[10px] font-bold text-center">
                        <span className="py-1.5 rounded bg-slate-100 text-slate-800">303 Liters</span>
                        <span className="py-1.5 rounded bg-[#111111] text-white">Add to Cart</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantified Scale & Deliverables Strip Below Hero Spread */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">5 Collections</div>
              <div className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'ديب فريزر · ثلاجات · مبردات · مراوح · أجهزة صغيرة'
                  : 'Freezers · Fridges · Dispensers · Fans · Small Appliances'}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#009FE3] tabular-nums">25+ SKUs</div>
              <div className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'ربط كامل بالمواصفات الفنية وخيارات الكمبروسر'
                  : 'Engineered variants with live SKU & stock state'}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">AR / EN</div>
              <div className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'تبديل فوري بين العربية RTL والإنجليزية LTR'
                  : 'Native RTL Arabic & LTR English Localization'}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">3-Model Compare</div>
              <div className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'محرك مقارنة مبردات المياه المدمج في المتجر'
                  : 'Built-in Dispenser Technical Matrix Engine'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 01: PROJECT BRIEF, CHALLENGE & STRATEGIC SOLUTION             */}
      {/* ===================================================================== */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#009FE3]">
              01 · {isAr ? 'موجز المشروع والتحدي' : 'Project Brief & Strategy'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
              {isAr
                ? 'تحويل الزخم التسويقي لبينجوين إلى مبيعات إلكترونية مباشرة'
                : 'Bridging Brand Demand Into Structured Direct E-Commerce'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {isAr
                ? 'دراسة رحلة مستهلك الأجهزة المنزلية في مصر وتحويل تعقيد المواصفات الهندسية إلى تجربة تسوق واضحة في ٣ نقرات.'
                : 'Simplifying technical appliance specifications into fast, high-trust digital purchase flows.'}
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isAr ? 'التحدي التجاري' : 'The Challenge'}
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {isAr ? 'تعدد السعات والمواصفات التقنية للعميل' : 'High-Consideration Hardware Buying Friction'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? 'عند شراء ديب فريزر أو مبرد مياه، يحتاج العميل لمعرفة نوع الكمبروسر (Inverter أم LG)، السعة باللتر، الباب الزجاجي الداخلي، وفترة الضمان—وهي تفاصيل غالباً ما تضيع في المتاجر التقليدية وتؤدي لتردد العميل.'
                  : 'Appliance shoppers evaluate compressor type (Inverter vs. LG), liter capacity, lower fridge compartments, and power wattage before buying. Generic store templates bury these specs inside long paragraphs.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-[#009FE3]">
                {isAr ? 'الحل التصميمي والبرمجي' : 'The Engineered Solution'}
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {isAr ? 'محددات تفاعلية وجدول مقارنة مدمج داخل المتجر' : 'Spec-Level Cards & Integrated Comparison Architecture'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? 'صممنا واجهة متجر Shopify ثنائية اللغة (عربي/إنجليزي) تعرض خيارات الكمبروسر والباب الزجاجي مباشرة على بطاقة المنتج، مع جدول مقارنة تفاعلي لمبردات المياه وسلة جانبية فورية مع شريط الشحن والخط الساخن 012 79714396.'
                  : 'We crafted a bilingual EN/AR Shopify storefront placing compressor & glass-door selectors directly on collection cards alongside an interactive HR001/PD001/PD002 dispenser matrix and instant Ajax cart drawer.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 02: BRAND SYSTEM, LOGO STAGE, COLOR TOKENS & TYPOGRAPHY       */}
      {/* ===================================================================== */}
      <section id="brand-system" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-slate-200 space-y-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#009FE3]">
              02 · {isAr ? 'نظام الهوية الرقمية وتصميم الواجهة' : 'Brand System & Visual Identity'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
              {isAr ? 'لوحة الهوية، تباين الشعار، ونظام الألوان المعماري' : 'Emblem Calibration, Color Tokens & Bilingual Typography'}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            TOKENS VERIFIED FROM PENGUIN-APPLIANCES.COM/EN
          </span>
        </div>

        {/* Brand Emblem + Surface Switcher Board */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
            <div>
              <h3 className="text-sm font-black text-slate-950">
                {isAr ? 'منصة عرض وتباين شعار المتجر الرسمي' : 'Storefront Header Lockup Contrast Stage'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? 'معاينة شعار Penguin الرسمي على أسطح المتجر الفاتحة والثلجية والكربونية الداكنة'
                  : 'Inspect the official header emblem across White (#FFFFFF), Snow (#F8F8F8), and Carbon (#0A0F1A)'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: 'light', label: '#FFFFFF Light' },
                { id: 'snow', label: '#F8F8F8 Snow' },
                { id: 'obsidian', label: '#0A0F1A Carbon' },
              ].map((skin) => (
                <button
                  key={skin.id}
                  type="button"
                  onClick={() => setPreviewBg(skin.id as 'light' | 'snow' | 'obsidian')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    previewBg === skin.id
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {skin.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`min-h-[240px] p-10 flex flex-col items-center justify-center transition-colors duration-500 ${
              previewBg === 'light'
                ? 'bg-white'
                : previewBg === 'snow'
                ? 'bg-[#F8F8F8]'
                : 'bg-[#0A0F1A]'
            }`}
          >
            <img
              src="/assets/case-studies/penguin-website/store-logo.png"
              alt="Penguin Appliances Store Logo"
              referrerPolicy="no-referrer"
              className={`max-h-24 w-auto object-contain transition-all duration-500 ${
                previewBg === 'obsidian' ? 'brightness-125 drop-shadow-[0_0_28px_rgba(0,159,227,0.45)]' : ''
              }`}
            />
            <span
              className={`mt-6 text-[11px] font-mono tracking-widest uppercase ${
                previewBg === 'obsidian' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              CLEAR SPACE ≥ 2X EMBLEM HEIGHT · MIN HEADER HEIGHT 28PX
            </span>
          </div>
        </div>

        {/* 4-Column Color Tokens Grid (Clean Architectural Color Plates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {brandColors.map((color) => (
            <div
              key={color.hex}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
            >
              <div
                className="h-36 p-4 flex items-end justify-between border-b border-slate-100"
                style={{ backgroundColor: color.hex }}
              >
                <span
                  className={`text-xs font-mono font-bold ${
                    color.darkText ? 'text-slate-500' : 'text-white/85'
                  }`}
                >
                  {color.token}
                </span>
                <button
                  type="button"
                  onClick={() => copyColor(color.hex)}
                  className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-[11px] font-mono font-bold border border-slate-200 shadow-sm hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                >
                  {copiedColor === color.hex ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{color.hex}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 space-y-1.5">
                <div className="text-sm font-black text-slate-950">{color.name}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{color.usage}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bilingual Typography Specimen Spread (Clean Editorial Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-7 space-y-5" dir="ltr">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>ENGLISH TYPEFACE · LTR HIERARCHY</span>
              <span>Inter / Plus Jakarta Sans</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 leading-tight">
              Smarter Appliances. Better Everyday Living.
            </div>
            <div className="flex flex-wrap items-baseline gap-6 pt-3 border-t border-slate-100 text-slate-700">
              <div>
                <div className="text-[11px] font-mono text-slate-400">DISPLAY BOLD</div>
                <div className="text-xl font-black">Aa Bb Cc 123</div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-slate-400">TABULAR PRICING</div>
                <div className="text-xl font-black tabular-nums text-[#111111]">LE 14,450.00</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-7 space-y-5" dir="rtl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>الخط العربي · تجربة القراءة RTL</span>
              <span>Cairo Geometric Sans</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
              قوة في التبريد، وتصميم يناسب كل بيت عصري.
            </div>
            <div className="flex flex-wrap items-baseline gap-6 pt-3 border-t border-slate-100 text-slate-700">
              <div>
                <div className="text-[11px] font-mono text-slate-400">وزن العناوين</div>
                <div className="text-xl font-black">أ ب ت ث ١٢٣</div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-slate-400">وضوح السعر والمواصفات</div>
                <div className="text-xl font-black tabular-nums text-[#009FE3]">سعة ٣١٧ لتر · إنفرتر</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 03: BENTO UX SYSTEMS & LIVE INTERACTIVE VARIANT SIMULATOR     */}
      {/* ===================================================================== */}
      <section id="ux-architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-slate-200 space-y-12">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-widest text-[#009FE3]">
            03 · {isAr ? 'معمارية تجربة المستخدم والتفاعل الحي' : 'Bento UX Systems & Live Demo'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
            {isAr ? 'محاكاة حية لبطاقة المنتج وتجربة التبديل الثنائي للغة' : 'Interactive Product Variant Card & Storefront Architecture'}
          </h2>
        </div>

        {/* Interactive Behance Live Component Board */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-[#009FE3]" />
              <span className="text-xs sm:text-sm font-bold">
                {isAr
                  ? 'جرّب بطاقة منتج ES350 التفاعلية مباشرة (الكمبروسر، الباب الزجاجي، واللغة)'
                  : 'Live Interactive Component: ES350 Variant Selector & Localization Toggle'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSimLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  simLang === 'en'
                    ? 'bg-[#009FE3] text-white border-[#009FE3]'
                    : 'bg-white/10 text-slate-300 border-white/15 hover:text-white'
                }`}
              >
                English (/en)
              </button>
              <button
                type="button"
                onClick={() => setSimLang('ar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  simLang === 'ar'
                    ? 'bg-[#009FE3] text-white border-[#009FE3]'
                    : 'bg-white/10 text-slate-300 border-white/15 hover:text-white'
                }`}
              >
                العربية (/)
              </button>
            </div>
          </div>

          <div
            dir={simLang === 'ar' ? 'rtl' : 'ltr'}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-center"
          >
            {/* Left Visual Preview */}
            <div className="lg:col-span-6 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 aspect-[16/10] relative group">
              <img
                src="/assets/case-studies/penguin-website/banner-hero-1.jpg"
                alt="Penguin ES350 Chest Freezer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 start-3 end-3 bg-white/95 backdrop-blur rounded-lg px-3.5 py-2 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>
                  {simLang === 'ar' ? 'المواصفات المختارة:' : 'Selected Spec:'}{' '}
                  <strong className="text-[#009FE3]">{selectedCompressor}</strong> ·{' '}
                  {selectedGlassDoor === 'Yes'
                    ? simLang === 'ar'
                      ? 'باب زجاجي جرار'
                      : 'Sliding Glass'
                    : simLang === 'ar'
                    ? 'بدون زجاج'
                    : 'Standard Lid'}
                </span>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums">317L</span>
              </div>
            </div>

            {/* Right Interactive Product Configurator */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">ART: 6225000782884</span>
                <span className="font-black text-[#D33636] uppercase tracking-wider">
                  {simLang === 'ar' ? 'وفر -9%' : 'SAVE 9%'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug">
                {simLang === 'ar'
                  ? 'بنجوين ES350 ديب فريزر أفقي ستانليس ستيل — 317 لتر'
                  : 'Penguin ES350 Stainless Steel Chest Freezer — 317L'}
              </h3>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-950 tabular-nums">{selectedPrice}</span>
                <span className="text-sm text-slate-400 line-through tabular-nums">LE 15,750.00</span>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    {simLang === 'ar' ? '1. نوع الكمبروسر:' : '1. Compressor Engineering:'}
                  </span>
                  <div className="flex gap-2">
                    {(['Inverter', 'LG Compressor'] as const).map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setSelectedCompressor(comp)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          selectedCompressor === comp
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    {simLang === 'ar' ? '2. باب زجاجي داخلي جرار:' : '2. Inner Sliding Glass Door:'}
                  </span>
                  <div className="flex gap-2">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedGlassDoor(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          selectedGlassDoor === opt
                            ? 'bg-[#009FE3] text-white border-[#009FE3]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {simLang === 'ar' ? (opt === 'Yes' ? 'نعم (+ حفظ البرودة)' : 'لا') : opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimAddToCart}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#111111] hover:bg-[#009FE3] text-white text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simAddedFlash ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>
                        {simLang === 'ar'
                          ? `تمت الإضافة للسلة (${simCartCount})`
                          : `Added to Cart Drawer (${simCartCount})`}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {simLang === 'ar' ? 'أضف إلى سلة التسوق الفورية' : 'Add to Ajax Cart Drawer'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Asymmetric 4-Card Bento UX Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-7 space-y-3">
            <div className="flex items-center gap-2.5 text-[#009FE3]">
              <ArrowLeftRight className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                {isAr ? 'توطين ثنائي اللغة' : 'Seamless RTL / LTR Switch'}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-950">
              {isAr
                ? 'التبديل الفوري بين العربية (/ ) والإنجليزية (/en) دون كسر التصميم'
                : 'Native Arabic RTL (/) & English LTR (/en) Storefront Mirroring'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'هيكلة قوالب Shopify Liquid لتعكس اتجاه الجداول، نوافذ السلة الجانبية، القوائم المنسدلة، وتنسيق الجنيه المصري LE بدقة متساوية في كلا الاتجاهين.'
                : 'Engineered Liquid templates that mirror navigation menus, collection filters, search drawers, and LE pricing cleanly across Arabic and English buyer journeys.'}
            </p>
          </div>

          <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-7 space-y-3">
            <div className="flex items-center gap-2.5 text-[#009FE3]">
              <Monitor className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                {isAr ? 'السلة والبحث الذكي' : 'Ajax Cart & Search'}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-950">
              {isAr ? 'درج السلة الجانبي وكود الخصم الفوري' : 'Predictive Search & Instant Drawer'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'بحث تنبؤي يظهر صور الأجهزة والأسعار أثناء الكتابة مع درج سلة يدعم أكواد الخصم والشحن السريع.'
                : 'Real-time product search thumbnails paired with zero-reload slide-out checkout drawers and promo codes.'}
            </p>
          </div>

          <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-7 space-y-3">
            <div className="flex items-center gap-2.5 text-[#009FE3]">
              <PhoneCall className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                {isAr ? 'الضمان والدعم' : 'Warranty & Hotline'}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-950">
              {isAr ? 'بوابة الضمان والخط الساخن 012 79714396' : 'Dedicated Support Portal (012 79714396)'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'تعزيز ثقة المشتري قبل إتمام الدفع عبر صفحة ضمان صريحة واتصال مباشر بفريق الصيانة وخدمة العملاء.'
                : 'Click-to-call customer care and structured Warranty & Support documentation eliminating pre-checkout hesitation.'}
            </p>
          </div>

          <div className="md:col-span-7 bg-slate-950 text-white rounded-2xl p-7 space-y-4">
            <div className="flex items-center gap-2.5 text-[#009FE3]">
              <Layers className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                {isAr ? 'مخرجات المشروع المنفذة' : 'Delivered Storefront Stack'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#009FE3] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'تصميم وبرمجة واجهة متجر Shopify مخصصة بالكامل'
                    : 'Bespoke Shopify Liquid Theme & Responsive UI'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#009FE3] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'تصميم بانرات الهيرو لكافة الأقسام الخمسة'
                    : 'Collection Hero Art Direction Across All 5 Lines'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#009FE3] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'برمجة فلاتر المواصفات داخل الكروت (Inverter / LG)'
                    : 'Card-Level Compressor & Door Swatch Selectors'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#009FE3] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'جدول مقارنة المبردات المدمج (HR001 / PD001 / PD002)'
                    : 'Built-In Water Dispenser Comparison Engine'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 04: BEHANCE STOREFRONT MOCKUP BOARDS GALLERY                  */}
      {/* ===================================================================== */}
      <section id="mockup-boards" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-slate-200 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#009FE3]">
              04 · {isAr ? 'لوحات عرض شاشات المتجر والأقسام' : 'UI Artboards & Storefront Gallery'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
              {isAr ? 'لوحات العرض البصري الكاملة لمتجر بينجوين' : 'High-Resolution Storefront Modules & Art Direction'}
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: isAr ? 'جميع اللوحات (6)' : 'All Boards (6)' },
              { id: 'storefront', label: isAr ? 'الواجهة والمقارنة' : 'Storefront & Compare' },
              { id: 'banners', label: isAr ? 'بانرات الأقسام' : 'Collection Heroes' },
              { id: 'brand', label: isAr ? 'الشعار والهيدر' : 'Header Lockup' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveBoardFilter(tab.id as 'all' | 'storefront' | 'banners' | 'brand')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeBoardFilter === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Behance Masonry / Bento Artboard Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredBoards.map((board) => (
            <article
              key={board.id}
              onClick={() =>
                setActiveLightboxImg({
                  url: board.url,
                  title: board.title,
                  desc: board.desc,
                })
              }
              className={`group bg-white rounded-2xl border border-slate-200 hover:border-[#009FE3] overflow-hidden cursor-zoom-in transition-colors flex flex-col ${
                board.spanWide ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Crisp Image Presentation Frame */}
              <div
                className={`relative bg-[#F3F6FA] overflow-hidden flex items-center justify-center ${
                  board.spanWide ? 'aspect-[21/10]' : 'aspect-[16/10]'
                }`}
              >
                <img
                  src={board.url}
                  alt={board.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className={`w-full h-full transition-transform duration-700 group-hover:scale-[1.025] ${
                    board.category === 'brand' ? 'object-contain p-12 bg-white' : 'object-cover'
                  }`}
                />

                {/* Top Clean Inspection Prompt on Hover */}
                <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-slate-950/90 text-white text-xs font-bold flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#009FE3]" />
                  <span>{isAr ? 'تكبير الدقة الكاملة' : 'Inspect HD'}</span>
                </div>
              </div>

              {/* Editorial Board Caption Footer (Zero Pills) */}
              <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-[#009FE3]">{board.chapter}</span>
                    <span>·</span>
                    <span>{board.categoryLabel}</span>
                    <span>·</span>
                    <span>{board.captionCode}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-[#009FE3] transition-colors">
                    {board.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {board.desc}
                  </p>
                </div>

                <span className="text-xs font-bold text-slate-900 group-hover:text-[#009FE3] inline-flex items-center gap-1 shrink-0">
                  <span>{isAr ? 'عرض مكبر' : 'Expand'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 05: INTERACTIVE WATER DISPENSER COMPARISON ENGINE             */}
      {/* ===================================================================== */}
      <section id="comparison-engine" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-slate-200 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#009FE3]">
              05 · {isAr ? 'ميزة التحويل الرئيسية — محرك مقارنة المبردات' : 'Flagship Feature — Dispenser Matrix'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
              {isAr
                ? 'أداة «أي مبرد مياه يناسبك؟» المدمجة داخل المتجر'
                : 'Interactive "Which Water Dispenser Is Made For You?" Engine'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {(['HR001', 'PD001', 'PD002'] as const).map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => setHighlightedDispenser(model)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  highlightedDispenser === model
                    ? 'bg-[#009FE3] text-white border-[#009FE3]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dispenserSpecs.map((item) => {
            const isSelected = highlightedDispenser === item.model;
            return (
              <div
                key={item.model}
                onClick={() => setHighlightedDispenser(item.model as 'HR001' | 'PD001' | 'PD002')}
                className={`rounded-2xl p-6 sm:p-7 border transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xl'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={isSelected ? 'text-[#009FE3] font-bold' : 'text-slate-400'}>
                      MODEL {item.model}
                    </span>
                    <span className="font-black text-[#D33636]">{item.discount}</span>
                  </div>
                  <h3 className="text-lg font-black">{item.name}</h3>
                  <div className="flex items-baseline gap-2.5 pt-1">
                    <span className="text-2xl font-black tabular-nums">{item.price}</span>
                    <span
                      className={`text-xs line-through tabular-nums ${
                        isSelected ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {item.compareAt}
                    </span>
                  </div>
                </div>

                <dl
                  className={`space-y-3 pt-5 border-t text-xs ${
                    isSelected ? 'border-white/10' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <dt className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                      {isAr ? 'قدرة التبريد:' : 'Cooling Power:'}
                    </dt>
                    <dd className="font-bold font-mono">{item.cooling}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                      {isAr ? 'درجة التسخين:' : 'Heating Temp:'}
                    </dt>
                    <dd className="font-bold font-mono">{item.heating}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                      {isAr ? 'المساحة السفلية:' : 'Lower Cabin:'}
                    </dt>
                    <dd className="font-bold text-end">{item.cabin}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                      {isAr ? 'الصنابير والأمان:' : 'Control & Tank:'}
                    </dt>
                    <dd className="font-bold text-end">{item.taps}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 06: CLIENT ENDORSEMENT & LIVE LAUNCH CTA FOOTER               */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-[#070B14] text-white rounded-3xl p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Quote className="w-8 h-8 text-[#009FE3]" />
            <blockquote className="text-xl sm:text-2xl font-bold leading-relaxed text-slate-100">
              {isAr
                ? '«لأول مرة أصبح لعملائنا متجر إلكتروني ثنائي اللغة يعرض كل أجهزة بينجوين ومواصفات الكمبروسر وجداول المقارنة والضمان بوضوح، مما حوّل الطلب الجماهيري إلى مبيعات أونلاين منظمة.»'
                : '“For the first time, our customers have a unified bilingual online store showcasing every Penguin appliance, compressor specification, and warranty guarantee—converting brand awareness directly into online orders.”'}
            </blockquote>
            <div className="text-xs text-slate-400 font-medium">
              <strong className="text-white">
                {isAr ? 'إدارة التجارة الإلكترونية — Penguin Appliances' : 'E-Commerce Directorate — Penguin Appliances'}
              </strong>{' '}
              · penguin-appliances.com/en · 012 79714396
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-black uppercase tracking-widest text-[#009FE3]">
                {isAr ? 'هل تخطط لإطلاق متجر إلكتروني احترافي؟' : 'Launch Your Brand Flagship'}
              </div>
              <h3 className="text-xl font-black text-white">
                {isAr
                  ? 'نصمم ونبرمج متاجر إلكترونية مصممة للتحويل البيعي'
                  : 'Need an E-Commerce Store Built Like This?'}
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="w-full py-3.5 px-5 rounded-xl bg-[#009FE3] hover:bg-sky-500 text-white text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'اطلب استشارة ومقترح مشروع مجاني' : 'Request Custom Website Proposal'}</span>
              </button>

              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#009FE3]" />
                <span>{isAr ? 'تصفح متجر بينجوين المباشر الآن' : 'Explore penguin-appliances.com/en'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* FULLSCREEN HD LIGHTBOX VIEWER                                         */}
      {/* ===================================================================== */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl max-h-[92vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
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
                className="p-2 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close HD preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-white min-h-[420px]">
              <img
                src={activeLightboxImg.url}
                alt={activeLightboxImg.title}
                referrerPolicy="no-referrer"
                className="max-h-[74vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs">
              <span className="text-slate-500 font-mono">
                Penguin Appliances E-Commerce · penguin-appliances.com/en
              </span>
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#009FE3] hover:text-sky-700 flex items-center gap-1"
              >
                <span>{isAr ? 'فتح الموقع المباشر' : 'Visit Live Store'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
