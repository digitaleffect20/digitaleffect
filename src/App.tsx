import React from 'react';
import { AgencyDataProvider, useAgencyData } from './context/AgencyDataContext';
import { OfferBanner } from './components/OfferBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CaseStudyModal } from './components/CaseStudyModal';
import { ConsultationModal } from './components/ConsultationModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { HomePage } from './pages/HomePage';
import { B2BPage } from './pages/B2BPage';
import { B2CPage } from './pages/B2CPage';
import { MedicalPage } from './pages/MedicalPage';
import { CaseStudiesPage } from './pages/CaseStudiesPage';
import { AboutPage } from './pages/AboutPage';
import { IptCaseStudyPage } from './pages/IptCaseStudyPage';
import { PenguinCaseStudyPage } from './pages/PenguinCaseStudyPage';
import { BsiziaCaseStudyPage } from './pages/BsiziaCaseStudyPage';
import { Building2, ShoppingBag, Stethoscope, Home, MessageSquare, Briefcase } from 'lucide-react';
import { PageRoute } from './types';

const AppContent: React.FC = () => {
  const { currentPage, setCurrentPage, language, data } = useAgencyData();
  const isAr = language === 'ar';

  // Render the requested standalone page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'b2b':
        return <B2BPage />;
      case 'b2c':
        return <B2CPage />;
      case 'medical':
        return <MedicalPage />;
      case 'case-studies':
        return <CaseStudiesPage />;
      case 'about':
        return <AboutPage />;
      case 'ipt-case-study':
        return <IptCaseStudyPage />;
      case 'penguin-case-study':
        return <PenguinCaseStudyPage />;
      case 'bsizia-case-study':
        return <BsiziaCaseStudyPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  const quickSwitchPages: Array<{ page: PageRoute; label: string; icon: React.ReactNode }> = [
    { page: 'home', label: isAr ? 'الرئيسية' : 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { page: 'b2b', label: 'B2B', icon: <Building2 className="w-3.5 h-3.5" /> },
    { page: 'b2c', label: 'B2C', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { page: 'medical', label: 'Medical', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { page: 'case-studies', label: isAr ? 'الأعمال' : 'Cases', icon: <Briefcase className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      {/* Top Global Promotional Offer Banner */}
      <OfferBanner />

      {/* Main Top Navigation conforming strictly to Top Bar Contract */}
      <Navbar />

      {/* Active Dedicated Page View */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <CaseStudyModal />
      <ConsultationModal />
      <AdminPanelModal />

      {/* Floating Bottom Quick Page Switcher & WhatsApp Trigger */}
      <div className="fixed bottom-5 start-5 z-40 flex items-center gap-2">
        <a
          href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(isAr ? 'مرحباً ديجيتال إفكت، أود استفساراً حول خدماتكم' : 'Hello Digital Effect, I would like to inquire about your services')}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Direct"
          className="p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
        </a>

        {/* Floating Quick Page Switcher Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-xl text-xs font-bold">
          <span className="text-[11px] text-slate-400 px-2">{isAr ? 'الانتقال السريع:' : 'Quick Jump:'}</span>
          {quickSwitchPages.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AgencyDataProvider>
      <AppContent />
    </AgencyDataProvider>
  );
}
