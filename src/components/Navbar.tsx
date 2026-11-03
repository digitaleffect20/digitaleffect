import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { PageRoute } from '../types';
import { Menu, X, ArrowUpRight, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    currentPage, 
    setCurrentPage, 
    t, 
    setIsConsultationOpen
  } = useAgencyData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAr = language === 'ar';

  const navLinks: Array<{ page: PageRoute; label: string }> = [
    { page: 'home', label: t.nav.home },
    { page: 'b2b', label: t.nav.b2b },
    { page: 'b2c', label: t.nav.b2c },
    { page: 'medical', label: t.nav.medical },
    { page: 'case-studies', label: t.nav.caseStudies },
    { page: 'about', label: t.nav.about },
  ];

  const handleNavClick = (page: PageRoute) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Zone 1: Brand logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 shrink group cursor-pointer min-w-0"
          title="Digital Effect Agency"
        >
          <img
            src="/assets/aistudio/Digital-effect-logo_d13b47e3.png"
            alt="Digital Effect Agency"
            className="h-8 sm:h-10 md:h-11 w-auto max-w-[130px] sm:max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Zone 2: Navigation links for desktop */}
        <nav className="hidden xl:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700">
          {navLinks.map((link) => {
            const isActive = 
              currentPage === link.page || 
              (currentPage === 'ipt-case-study' && (link.page === 'medical' || link.page === 'case-studies')) ||
              (currentPage === 'penguin-case-study' && (link.page === 'b2c' || link.page === 'case-studies')) ||
              (currentPage === 'bsizia-case-study' && (link.page === 'b2b' || link.page === 'case-studies'));
            return (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                  isActive
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language switch, Book Call (Desktop only), and Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 rounded-lg sm:rounded-xl transition-colors border border-slate-200/90 whitespace-nowrap cursor-pointer shadow-2xs"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Primary Action Button - Hidden on mobile, visible on desktop / tablet (md+) */}
          <button
            onClick={() => setIsConsultationOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
          >
            <span>{t.nav.bookCall}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Mobile menu hamburger toggle - Guaranteed visible and accessible */}
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
        <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {/* Primary Action Button (حجز مكالمة استشارية) placed prominently inside mobile menu */}
          <div className="pb-1">
            <button
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

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1 border-t border-slate-100">
            {navLinks.map((link) => {
              const isActive = 
                currentPage === link.page || 
                (currentPage === 'ipt-case-study' && (link.page === 'medical' || link.page === 'case-studies')) ||
                (currentPage === 'penguin-case-study' && (link.page === 'b2c' || link.page === 'case-studies')) ||
                (currentPage === 'bsizia-case-study' && (link.page === 'b2b' || link.page === 'case-studies'));
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full text-start py-2.5 px-3 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                </button>
              );
            })}
          </nav>

          {/* Secondary Actions in Menu */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
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
