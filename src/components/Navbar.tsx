import React, { useState, useRef, useEffect } from 'react';
import { useAgencyData, getPagePath, getPortfolioPath } from '../context/AgencyDataContext';
import { PageRoute, PortfolioCategoryFilter } from '../types';
import {
  Menu,
  X,
  ArrowUpRight,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  ShoppingBag,
  Stethoscope,
  Megaphone,
  Sparkles,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    currentPage,
    setCurrentPage,
    portfolioFilter,
    navigateToPortfolio,
    t,
    setIsConsultationOpen
  } = useAgencyData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<'sectors' | 'portfolio' | null>(null);
  const [socialFlyoutOpen, setSocialFlyoutOpen] = useState(false);
  const [mobileSectorsOpen, setMobileSectorsOpen] = useState(true);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(true);
  const [mobileSocialOpen, setMobileSocialOpen] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  const isAr = language === 'ar';

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDesktopDropdown(null);
        setSocialFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkNavigation = (e: React.MouseEvent<HTMLAnchorElement>, page: PageRoute) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return; // Allow normal middle-click / Cmd+click new tab
    }
    e.preventDefault();
    setCurrentPage(page);
    setOpenDesktopDropdown(null);
    setSocialFlyoutOpen(false);
    setMobileMenuOpen(false);
  };

  const handlePortfolioLinkNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    filter: PortfolioCategoryFilter
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return; // Allow opening direct filtered URL in new tab
    }
    e.preventDefault();
    navigateToPortfolio(filter);
    setOpenDesktopDropdown(null);
    setSocialFlyoutOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const isSectorActive = currentPage === 'b2b' || currentPage === 'b2c' || currentPage === 'medical';
  const isPortfolioActive =
    currentPage === 'case-studies' ||
    currentPage.endsWith('-case-study');
  const isSocialSectionActive =
    currentPage === 'case-studies' &&
    (portfolioFilter === 'social' ||
      portfolioFilter === 'social-b2b' ||
      portfolioFilter === 'social-b2c' ||
      portfolioFilter === 'social-medical');
  const isAboutActive = currentPage === 'about';

  const sectorSubItems: Array<{
    page: PageRoute;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      page: 'b2b',
      label: t.nav.b2b,
      sublabel: isAr ? 'المصانع والشركات والمبيعات المؤسسية' : 'Industrial & Corporate Growth',
      icon: <Building2 className="w-4 h-4 text-blue-600 shrink-0" />,
    },
    {
      page: 'b2c',
      label: t.nav.b2c,
      sublabel: isAr ? 'العلامات الاستهلاكية والمتاجر والتجزئة' : 'Retail, E-Com & Performance Ads',
      icon: <ShoppingBag className="w-4 h-4 text-sky-600 shrink-0" />,
    },
    {
      page: 'medical',
      label: t.nav.medical,
      sublabel: isAr ? 'العيادات والمراكز الطبية وجوجل مابس' : 'Clinics, Surgery & Healthcare',
      icon: <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
  ];

  const socialSectorSubItems: Array<{
    filter: PortfolioCategoryFilter;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      filter: 'social-b2b',
      label: isAr ? 'قطاع B2B' : 'B2B',
      sublabel: isAr ? 'حملات الشركات والمصانع' : 'Corporate & Industrial Campaigns',
      icon: <Building2 className="w-4 h-4 text-blue-600 shrink-0" />,
    },
    {
      filter: 'social-b2c',
      label: isAr ? 'قطاع B2C' : 'B2C',
      sublabel: isAr ? 'حملات التجارة والمستهلكين' : 'Consumer & Retail Brands',
      icon: <ShoppingBag className="w-4 h-4 text-sky-600 shrink-0" />,
    },
    {
      filter: 'social-medical',
      label: isAr ? 'القطاع الطبي Medical' : 'Medical',
      sublabel: isAr ? 'حملات العيادات والمراكز الطبية' : 'Clinics & Healthcare Growth',
      icon: <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
  ];

  const portfolioSubItems: Array<{
    filter: PortfolioCategoryFilter;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      filter: 'identity',
      label: isAr ? 'هوية بصرية' : 'Visual Identity',
      sublabel: isAr ? 'الهوية المؤسسية والشعارات والمطبوعات' : 'Corporate Branding & Guidelines',
      icon: <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />,
    },
    {
      filter: 'web',
      label: isAr ? 'المواقع والمتاجر' : 'Websites & E-Commerce',
      sublabel: isAr ? 'تصميم وتطوير المواقع والمتاجر الإلكترونية' : 'Custom Websites & Shopify Stores',
      icon: <Globe className="w-4 h-4 text-cyan-600 shrink-0" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full">
      <div
        ref={navRef}
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3"
      >
        {/* Zone 1: Brand logo (Navigates to Home) */}
        <a
          href={getPagePath('home')}
          onClick={(e) => handleLinkNavigation(e, 'home')}
          className="flex items-center gap-2 shrink group cursor-pointer min-w-0"
          title={isAr ? 'العودة للصفحة الرئيسية' : 'Digital Effect Home'}
        >
          <img
            src="/assets/aistudio/Digital-effect-logo_d13b47e3.png"
            alt="Digital Effect Agency"
            className="h-8 sm:h-10 md:h-11 w-auto max-w-[130px] sm:max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Zone 2: Organized Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-8 text-xs sm:text-sm font-semibold text-slate-700">
          {/* 1. قطاعات الأعمال (Dropdown Sub-Menu with dedicated URLs) */}
          <div
            className="relative"
            onMouseEnter={() => {
              setOpenDesktopDropdown('sectors');
              setSocialFlyoutOpen(false);
            }}
            onMouseLeave={() => setOpenDesktopDropdown(null)}
          >
            <button
              type="button"
              onClick={() =>
                setOpenDesktopDropdown(openDesktopDropdown === 'sectors' ? null : 'sectors')
              }
              className={`py-2 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                isSectorActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-700 hover:text-sky-600'
              }`}
            >
              <span>{t.nav.sectors}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDesktopDropdown === 'sectors' ? 'rotate-180 text-sky-600' : ''
                }`}
              />
              {isSectorActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>

            {openDesktopDropdown === 'sectors' && (
              <div className="absolute top-full start-0 pt-2 w-72 z-50">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 space-y-1">
                  {sectorSubItems.map((item) => {
                    const active = currentPage === item.page;
                    return (
                      <a
                        key={item.page}
                        href={getPagePath(item.page)}
                        onClick={(e) => handleLinkNavigation(e, item.page)}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                          active
                            ? 'bg-sky-50 text-sky-700'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="mt-0.5 p-1.5 rounded-lg bg-slate-100">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-snug">{item.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.sublabel}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. سابقة الأعمال (Dropdown Sub-Menu + Nested Social Media Sub-Menu) */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDesktopDropdown('portfolio')}
            onMouseLeave={() => {
              setOpenDesktopDropdown(null);
              setSocialFlyoutOpen(false);
            }}
          >
            <a
              href={getPortfolioPath('all')}
              onClick={(e) => {
                if (openDesktopDropdown === 'portfolio') {
                  handlePortfolioLinkNavigation(e, 'all');
                } else {
                  e.preventDefault();
                  setOpenDesktopDropdown('portfolio');
                }
              }}
              className={`py-2 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                isPortfolioActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-700 hover:text-sky-600'
              }`}
            >
              <span>{t.nav.caseStudies}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDesktopDropdown === 'portfolio' ? 'rotate-180 text-sky-600' : ''
                }`}
              />
              {isPortfolioActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
              )}
            </a>

            {openDesktopDropdown === 'portfolio' && (
              <div className="absolute top-full start-0 pt-2 w-72 z-50">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 space-y-1">
                  {/* Nested Item: سوشيال ميديا + Submenu (B2B / B2C / Medical) */}
                  <div
                    className="relative"
                    onMouseEnter={() => setSocialFlyoutOpen(true)}
                    onMouseLeave={() => setSocialFlyoutOpen(false)}
                  >
                    <a
                      href={getPortfolioPath('social')}
                      onClick={(e) => handlePortfolioLinkNavigation(e, 'social')}
                      className={`w-full text-start px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSocialSectionActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="mt-0.5 p-1.5 rounded-lg bg-slate-100">
                          <Megaphone className="w-4 h-4 text-sky-600 shrink-0" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-snug">
                            {isAr ? 'سوشيال ميديا' : 'Social Media'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {isAr ? 'اختر القطاع: B2B · B2C · Medical' : 'B2B · B2C · Medical Campaigns'}
                          </div>
                        </div>
                      </div>
                      {isAr ? (
                        <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </a>

                    {/* Flyout Submenu for Social Media -> B2B, B2C, Medical */}
                    {socialFlyoutOpen && (
                      <div className="absolute top-0 start-full ps-1.5 w-64 z-50">
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 space-y-1">
                          {socialSectorSubItems.map((sub) => {
                            const active = currentPage === 'case-studies' && portfolioFilter === sub.filter;
                            return (
                              <a
                                key={sub.filter}
                                href={getPortfolioPath(sub.filter)}
                                onClick={(e) => handlePortfolioLinkNavigation(e, sub.filter)}
                                className={`w-full text-start px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-sky-50 text-sky-700'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="mt-0.5 p-1.5 rounded-lg bg-slate-100">{sub.icon}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold leading-snug">{sub.label}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                    {sub.sublabel}
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                          <div className="pt-1 mt-1 border-t border-slate-100">
                            <a
                              href={getPortfolioPath('social')}
                              onClick={(e) => handlePortfolioLinkNavigation(e, 'social')}
                              className={`w-full text-start px-3 py-2 rounded-xl text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                currentPage === 'case-studies' && portfolioFilter === 'social'
                                  ? 'bg-sky-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <span>{isAr ? 'كل حملات السوشيال ميديا' : 'All Social Campaigns'}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Other Portfolio Categories: هوية بصرية · المواقع والمتاجر */}
                  {portfolioSubItems.map((item) => {
                    const active = currentPage === 'case-studies' && portfolioFilter === item.filter;
                    return (
                      <a
                        key={item.filter}
                        href={getPortfolioPath(item.filter)}
                        onClick={(e) => handlePortfolioLinkNavigation(e, item.filter)}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                          active
                            ? 'bg-sky-50 text-sky-700'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="mt-0.5 p-1.5 rounded-lg bg-slate-100">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-snug">{item.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.sublabel}
                          </div>
                        </div>
                      </a>
                    );
                  })}

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <a
                      href={getPortfolioPath('all')}
                      onClick={(e) => handlePortfolioLinkNavigation(e, 'all')}
                      className={`w-full text-start px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === 'case-studies' && portfolioFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{isAr ? 'عرض كافة سابقة الأعمال' : 'View All Portfolio'}</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. من نحن */}
          <a
            href={getPagePath('about')}
            onClick={(e) => handleLinkNavigation(e, 'about')}
            className={`py-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
              isAboutActive
                ? 'text-sky-600 font-bold'
                : 'text-slate-700 hover:text-sky-600'
            }`}
          >
            {t.nav.about}
            {isAboutActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
            )}
          </a>
        </nav>

        {/* Zone 3: Language switch, Book Call (Desktop), and Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 rounded-lg sm:rounded-xl transition-colors border border-slate-200/90 whitespace-nowrap cursor-pointer shadow-2xs"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConsultationOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
          >
            <span>{t.nav.bookCall}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-200 shadow-2xs"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-2xl max-h-[82vh] overflow-y-auto">
          <div className="pb-1">
            <button
              type="button"
              onClick={() => {
                setIsConsultationOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <span>{t.nav.bookCall}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5 pt-2 border-t border-slate-100">
            {/* Mobile Section 1: قطاعات الأعمال */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileSectorsOpen(!mobileSectorsOpen)}
                className={`w-full text-start py-2.5 px-3.5 text-sm font-bold flex items-center justify-between cursor-pointer ${
                  isSectorActive ? 'text-sky-700' : 'text-slate-800'
                }`}
              >
                <span>{t.nav.sectors}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${mobileSectorsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileSectorsOpen && (
                <div className="px-2 pb-2 space-y-1">
                  {sectorSubItems.map((item) => {
                    const active = currentPage === item.page;
                    return (
                      <a
                        key={item.page}
                        href={getPagePath(item.page)}
                        onClick={(e) => handleLinkNavigation(e, item.page)}
                        className={`w-full text-start py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                          active
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Section 2: سابقة الأعمال */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobilePortfolioOpen(!mobilePortfolioOpen)}
                className={`w-full text-start py-2.5 px-3.5 text-sm font-bold flex items-center justify-between cursor-pointer ${
                  isPortfolioActive ? 'text-sky-700' : 'text-slate-800'
                }`}
              >
                <span>{t.nav.caseStudies}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${mobilePortfolioOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {mobilePortfolioOpen && (
                <div className="px-2 pb-2 space-y-1.5">
                  {/* Nested Mobile Accordion: سوشيال ميديا -> B2B, B2C, Medical */}
                  <div className="rounded-lg border border-slate-200/80 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileSocialOpen(!mobileSocialOpen)}
                      className={`w-full text-start py-2 px-3 text-xs font-bold flex items-center justify-between cursor-pointer ${
                        isSocialSectionActive ? 'bg-sky-50 text-sky-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Megaphone className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>{isAr ? 'سوشيال ميديا' : 'Social Media'}</span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${mobileSocialOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileSocialOpen && (
                      <div className="px-2 pb-2 pt-1 space-y-1 bg-slate-50/60 border-t border-slate-100">
                        {socialSectorSubItems.map((sub) => {
                          const active = currentPage === 'case-studies' && portfolioFilter === sub.filter;
                          return (
                            <a
                              key={sub.filter}
                              href={getPortfolioPath(sub.filter)}
                              onClick={(e) => handlePortfolioLinkNavigation(e, sub.filter)}
                              className={`w-full text-start py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center gap-2 cursor-pointer ${
                                active
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {sub.icon}
                              <span>{sub.label}</span>
                            </a>
                          );
                        })}
                        <a
                          href={getPortfolioPath('social')}
                          onClick={(e) => handlePortfolioLinkNavigation(e, 'social')}
                          className={`w-full text-start py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center justify-between cursor-pointer ${
                            currentPage === 'case-studies' && portfolioFilter === 'social'
                              ? 'bg-sky-600 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{isAr ? 'كل حملات السوشيال ميديا' : 'All Social Media'}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {portfolioSubItems.map((item) => {
                    const active = currentPage === 'case-studies' && portfolioFilter === item.filter;
                    return (
                      <a
                        key={item.filter}
                        href={getPortfolioPath(item.filter)}
                        onClick={(e) => handlePortfolioLinkNavigation(e, item.filter)}
                        className={`w-full text-start py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                          active
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    );
                  })}

                  <a
                    href={getPortfolioPath('all')}
                    onClick={(e) => handlePortfolioLinkNavigation(e, 'all')}
                    className={`w-full text-start py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentPage === 'case-studies' && portfolioFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{isAr ? 'كافة سابقة الأعمال' : 'All Portfolio'}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Section 3: من نحن */}
            <a
              href={getPagePath('about')}
              onClick={(e) => handleLinkNavigation(e, 'about')}
              className={`w-full text-start py-2.5 px-3.5 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center justify-between ${
                isAboutActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-800 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <span>{t.nav.about}</span>
              {isAboutActive && <span className="w-2 h-2 rounded-full bg-sky-600" />}
            </a>
          </nav>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-sky-600" />
              <span>{isAr ? 'Switch to English' : 'التحويل إلى العربية'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
