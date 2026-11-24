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
import { PenguinWebsiteCaseStudyPage } from './pages/PenguinWebsiteCaseStudyPage';
import { BsiziaCaseStudyPage } from './pages/BsiziaCaseStudyPage';
import { BinaryracksCaseStudyPage } from './pages/BinaryracksCaseStudyPage';
import { GimokaCaseStudyPage } from './pages/GimokaCaseStudyPage';
import { LashinCaseStudyPage } from './pages/LashinCaseStudyPage';
import { ConcreteCaseStudyPage } from './pages/ConcreteCaseStudyPage';
import { HamburgCaseStudyPage } from './pages/HamburgCaseStudyPage';
import { ActonCaseStudyPage } from './pages/ActonCaseStudyPage';
import { YokenCaseStudyPage } from './pages/YokenCaseStudyPage';
import { SiltalCaseStudyPage } from './pages/SiltalCaseStudyPage';
import { PassapCaseStudyPage } from './pages/PassapCaseStudyPage';
import { AlwaadCaseStudyPage } from './pages/AlwaadCaseStudyPage';
import { AguCaseStudyPage } from './pages/AguCaseStudyPage';
import { PremiumCaseStudyPage } from './pages/PremiumCaseStudyPage';
import { BusinessPartnerCaseStudyPage } from './pages/BusinessPartnerCaseStudyPage';
import { OverviewCaseStudyPage } from './pages/OverviewCaseStudyPage';
import { OroCaseStudyPage } from './pages/OroCaseStudyPage';
import { AfroEnergyCaseStudyPage } from './pages/AfroEnergyCaseStudyPage';
import { SadkoCaseStudyPage } from './pages/SadkoCaseStudyPage';
import { UfarCaseStudyPage } from './pages/UfarCaseStudyPage';
import { SiltalIdentityCaseStudyPage } from './pages/SiltalIdentityCaseStudyPage';
import { BiltonCaseStudyPage } from './pages/BiltonCaseStudyPage';
import { CustomPackagePage } from './pages/CustomPackagePage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { Building2, ShoppingBag, Stethoscope, Home, MessageSquare, Briefcase, Sliders } from 'lucide-react';
import { PageRoute } from './types';
import { recordPageView } from './lib/analyticsTracker';

const AppContent: React.FC = () => {
  const { currentPage, setCurrentPage, language, data } = useAgencyData();
  const isAr = language === 'ar';

  // Automatically track visitor traffic and update title for top-level pages
  React.useEffect(() => {
    if (currentPage !== 'admin') {
      recordPageView(currentPage);
    }

    if (currentPage === 'home') {
      document.title = isAr ? 'Digital Effect | ديجيتال إفكت للحلول الرقمية والتسويق المتكامل' : 'Digital Effect | Full-Service Digital Marketing Agency';
    } else if (currentPage === 'b2b') {
      document.title = isAr ? 'حلول التسويق الرقمي للشركات والمصانع B2B | ديجيتال إفكت' : 'B2B Enterprise & Industrial Marketing Solutions | Digital Effect';
    } else if (currentPage === 'b2c') {
      document.title = isAr ? 'حلول التسويق الرقمي لقطاع التجارة والتجزئة B2C | ديجيتال إفكت' : 'B2C E-Commerce & Retail Marketing Solutions | Digital Effect';
    } else if (currentPage === 'medical') {
      document.title = isAr ? 'حلول التسويق الطبي للمراكز والعيادات Medical | ديجيتال إفكت' : 'Specialized Medical & Healthcare Marketing | Digital Effect';
    } else if (currentPage === 'case-studies') {
      document.title = isAr ? 'سابقة الأعمال ودراسات الحالة وقصص النجاح | ديجيتال إفكت' : 'Case Studies & Success Stories Portfolio | Digital Effect';
    } else if (currentPage === 'about') {
      document.title = isAr ? 'من نحن — تأسست عام ٢٠١٤ بخبرة قيادات تفوق ٢٠ عاماً | ديجيتال إفكت' : 'About Us — Founded in 2014 with 20+ Years of Leadership Expertise | Digital Effect';
    } else if (currentPage === 'custom-package') {
      document.title = isAr ? 'صمم باقتك المخصصة واحسب تكلفتها فوراً | ديجيتال إفكت' : 'Custom Package Calculator & Scope Builder | Digital Effect';
    } else if (currentPage === 'agu-case-study') {
      document.title = isAr ? 'الاتحاد العربي الخليجي AGU — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'Arab Gulf United AGU — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'premium-case-study') {
      document.title = isAr ? 'بريميوم Premium — تصميم الهوية والكتالوج الصناعي | ديجيتال إفكت' : 'Premium Machinery — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'business-partner-case-study') {
      document.title = isAr ? 'بيزنس بارتنرز Business Partners — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'Business Partners — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'overview-case-study') {
      document.title = isAr ? 'أوفرفيو لأعمال الديكور OVERVIEW — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'OVERVIEW For Decoration Work — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'oro-case-study') {
      document.title = isAr ? 'أورو للصناعات المغذية ORO — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'ORO Feeding Industries — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'afro-energy-case-study') {
      document.title = isAr ? 'أفرو إنرجي Afro Energy Ltd — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'Afro Energy Ltd. — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'sadko-case-study') {
      document.title = isAr ? 'صادكو بلاست SADKO PLAST — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'SADKO PLAST (Since 1992) — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'ufar-case-study') {
      document.title = isAr ? 'يوفار UFAR — تصميم الهوية المؤسسية | ديجيتال إفكت' : 'UFAR (United For A Reason) — Corporate Identity Case Study | Digital Effect';
    } else if (currentPage === 'siltal-identity-case-study') {
      document.title = isAr ? 'سيلتال SILTAL — الهوية المؤسسية وتغليف المنتجات والكتالوج | ديجيتال إفكت' : 'SILTAL Home Appliances — Corporate Identity & Packaging Case Study | Digital Effect';
    } else if (currentPage === 'bilton-case-study') {
      document.title = isAr ? 'بيلتون BILTON — تصميم الهوية المؤسسية والكتالوج العرضي | ديجيتال إفكت' : 'BILTON Electronics — Corporate Identity & Catalog Case Study | Digital Effect';
    } else if (currentPage === 'penguin-web-case-study') {
      document.title = isAr ? 'متجر بينجوين الإلكتروني Penguin Appliances Website — دراسة حالة | ديجيتال إفكت' : 'Penguin Appliances E-Commerce Website Case Study | Digital Effect';
    }
  }, [currentPage, isAr]);

  if (currentPage === 'admin') {
    return <AdminPortalPage />;
  }

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
      case 'custom-package':
        return <CustomPackagePage />;
      case 'ipt-case-study':
        return <IptCaseStudyPage />;
      case 'penguin-case-study':
        return <PenguinCaseStudyPage />;
      case 'penguin-web-case-study':
        return <PenguinWebsiteCaseStudyPage />;
      case 'bsizia-case-study':
        return <BsiziaCaseStudyPage />;
      case 'binaryracks-case-study':
        return <BinaryracksCaseStudyPage />;
      case 'gimoka-case-study':
        return <GimokaCaseStudyPage />;
      case 'lashin-case-study':
        return <LashinCaseStudyPage />;
      case 'concrete-case-study':
        return <ConcreteCaseStudyPage />;
      case 'hamburg-case-study':
        return <HamburgCaseStudyPage />;
      case 'acton-case-study':
        return <ActonCaseStudyPage />;
      case 'yoken-case-study':
        return <YokenCaseStudyPage />;
      case 'siltal-case-study':
        return <SiltalCaseStudyPage />;
      case 'passap-case-study':
        return <PassapCaseStudyPage />;
      case 'alwaad-case-study':
        return <AlwaadCaseStudyPage />;
      case 'agu-case-study':
        return <AguCaseStudyPage />;
      case 'premium-case-study':
        return <PremiumCaseStudyPage />;
      case 'business-partner-case-study':
        return <BusinessPartnerCaseStudyPage />;
      case 'overview-case-study':
        return <OverviewCaseStudyPage />;
      case 'oro-case-study':
        return <OroCaseStudyPage />;
      case 'afro-energy-case-study':
        return <AfroEnergyCaseStudyPage />;
      case 'sadko-case-study':
        return <SadkoCaseStudyPage />;
      case 'ufar-case-study':
        return <UfarCaseStudyPage />;
      case 'siltal-identity-case-study':
        return <SiltalIdentityCaseStudyPage />;
      case 'bilton-case-study':
        return <BiltonCaseStudyPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  const quickSwitchPages: Array<{ page: PageRoute; label: string; icon: React.ReactNode }> = [
    { page: 'home', label: isAr ? 'الرئيسية' : 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { page: 'custom-package', label: isAr ? 'صمم باقتك' : 'Custom', icon: <Sliders className="w-3.5 h-3.5 text-emerald-500" /> },
    { page: 'b2b', label: 'B2B', icon: <Building2 className="w-3.5 h-3.5" /> },
    { page: 'b2c', label: 'B2C', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { page: 'medical', label: 'Medical', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { page: 'case-studies', label: isAr ? 'الأعمال' : 'Cases', icon: <Briefcase className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
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
          href={`https://wa.me/${data.agencyInfo.whatsapp}?text=${encodeURIComponent(isAr ? 'مرحباً ديجيتال إفكت، أود الاستفسار عن خدماتكم' : 'Hello Digital Effect, I would like to inquire about your services')}`}
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
