import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgencyDataState, CaseStudy, ServicePackage, PromoBanner, SectorType, Language, PageRoute } from '../types';
import { INITIAL_AGENCY_DATA } from '../data/initialData';
import { TRANSLATIONS } from '../translations';

interface AgencyContextType {
  data: AgencyDataState;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  t: typeof TRANSLATIONS.ar;

  activeSector: SectorType;
  setActiveSector: (sector: SectorType) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isConsultationOpen: boolean;
  setIsConsultationOpen: (open: boolean) => void;
  selectedPackageForInquiry: ServicePackage | null;
  setSelectedPackageForInquiry: (pkg: ServicePackage | null) => void;
  selectedCaseStudy: CaseStudy | null;
  setSelectedCaseStudy: (study: CaseStudy | null) => void;

  // CRUD actions for user customizability
  addCaseStudy: (study: Omit<CaseStudy, 'id'>) => void;
  updateCaseStudy: (study: CaseStudy) => void;
  deleteCaseStudy: (id: string) => void;

  addPackage: (pkg: Omit<ServicePackage, 'id'>) => void;
  updatePackage: (pkg: ServicePackage) => void;
  deletePackage: (id: string) => void;

  updateBanner: (banner: PromoBanner) => void;
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'digital_effect_agency_state_v7';
const LANG_STORAGE_KEY = 'digital_effect_language_v2';

const AgencyDataContext = createContext<AgencyContextType | undefined>(undefined);

// Helper to parse page from URL hash
function getPageFromHash(): PageRoute {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash === 'b2b') return 'b2b';
  if (hash === 'b2c') return 'b2c';
  if (hash === 'medical') return 'medical';
  if (hash === 'case-studies' || hash === 'portfolio') return 'case-studies';
  if (hash === 'about') return 'about';
  if (hash === 'ipt' || hash === 'ipt-case-study' || hash === 'case-study/cs-med-ipt' || hash === 'case-study/ipt') return 'ipt-case-study';
  if (hash === 'penguin' || hash === 'penguin-case-study' || hash === 'case-study/cs-b2c-penguin' || hash === 'case-study/penguin') return 'penguin-case-study';
  if (hash === 'bsizia' || hash === 'bsizia-case-study' || hash === 'case-study/cs-b2b-bsizia' || hash === 'case-study/bsizia') return 'bsizia-case-study';
  return 'home';
}

export const AgencyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {}
    return 'ar'; // Default Arabic as requested
  });

  const [currentPage, setCurrentPageState] = useState<PageRoute>(() => {
    return getPageFromHash();
  });

  const [data, setData] = useState<AgencyDataState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.caseStudies && parsed.packages) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_AGENCY_DATA;
  });

  const [activeSector, setActiveSector] = useState<SectorType>('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedPackageForInquiry, setSelectedPackageForInquiry] = useState<ServicePackage | null>(null);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  // Language setter with HTML document update
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Set page and update hash with smooth top scroll
  const setCurrentPage = (page: PageRoute) => {
    setCurrentPageState(page);
    window.location.hash = page === 'home' ? '' : `#${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser hash changes (e.g. forward/back buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromHash();
      setCurrentPageState(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync document dir on initial mount
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Sync data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [data]);

  // Case Studies CRUD
  const addCaseStudy = (studyData: Omit<CaseStudy, 'id'>) => {
    const newId = `cs-${Date.now()}`;
    const newStudy: CaseStudy = { ...studyData, id: newId };
    setData((prev) => ({
      ...prev,
      caseStudies: [newStudy, ...prev.caseStudies],
    }));
  };

  const updateCaseStudy = (study: CaseStudy) => {
    setData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.map((s) => (s.id === study.id ? study : s)),
    }));
  };

  const deleteCaseStudy = (id: string) => {
    setData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.filter((s) => s.id !== id),
    }));
  };

  // Packages CRUD
  const addPackage = (pkgData: Omit<ServicePackage, 'id'>) => {
    const newId = `pkg-${Date.now()}`;
    const newPkg: ServicePackage = { ...pkgData, id: newId };
    setData((prev) => ({
      ...prev,
      packages: [...prev.packages, newPkg],
    }));
  };

  const updatePackage = (pkg: ServicePackage) => {
    setData((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => (p.id === pkg.id ? pkg : p)),
    }));
  };

  const deletePackage = (id: string) => {
    setData((prev) => ({
      ...prev,
      packages: prev.packages.filter((p) => p.id !== id),
    }));
  };

  const updateBanner = (banner: PromoBanner) => {
    setData((prev) => ({
      ...prev,
      banner,
    }));
  };

  const resetToDefaults = () => {
    setData(INITIAL_AGENCY_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportDataJson = () => {
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.caseStudies && parsed.packages && parsed.agencyInfo) {
        setData(parsed);
        return true;
      }
    } catch (err) {
      console.error('Invalid JSON import', err);
    }
    return false;
  };

  const t = TRANSLATIONS[language];

  return (
    <AgencyDataContext.Provider
      value={{
        data,
        language,
        setLanguage,
        currentPage,
        setCurrentPage,
        t,
        activeSector,
        setActiveSector,
        isAdminOpen,
        setIsAdminOpen,
        isConsultationOpen,
        setIsConsultationOpen,
        selectedPackageForInquiry,
        setSelectedPackageForInquiry,
        selectedCaseStudy,
        setSelectedCaseStudy,
        addCaseStudy,
        updateCaseStudy,
        deleteCaseStudy,
        addPackage,
        updatePackage,
        deletePackage,
        updateBanner,
        resetToDefaults,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AgencyDataContext.Provider>
  );
};

export const useAgencyData = () => {
  const context = useContext(AgencyDataContext);
  if (!context) {
    throw new Error('useAgencyData must be used within an AgencyDataProvider');
  }
  return context;
};
