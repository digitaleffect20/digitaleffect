import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgencyDataState, CaseStudy, ServicePackage, PromoBanner, SectorType, Language, PageRoute, Inquiry, PromoCode } from '../types';
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

  // Promo Codes System
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>) => void;
  updatePromoCode: (promo: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  togglePromoCodeStatus: (id: string) => void;
  recordPromoUsage: (codeStr: string) => void;
  validatePromoCode: (
    codeStr: string,
    price: number,
    sector?: SectorType
  ) => {
    isValid: boolean;
    discountAmount: number;
    finalPrice: number;
    message: string;
    promo?: PromoCode;
  };

  // Leads & Inquiries Management
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => void;
  deleteInquiry: (id: string) => void;
  clearAllInquiries: () => void;

  updateBanner: (banner: PromoBanner) => void;
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'digital_effect_agency_state_v12';
const LANG_STORAGE_KEY = 'digital_effect_language_v2';

const AgencyDataContext = createContext<AgencyContextType | undefined>(undefined);

// Helper to parse page from URL pathname or hash
function getPageFromHash(): PageRoute {
  const path = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase();
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

  if (path === 'admin' || hash === 'admin') return 'admin';
  if (hash === 'b2b' || path === 'b2b') return 'b2b';
  if (hash === 'b2c' || path === 'b2c') return 'b2c';
  if (hash === 'medical' || path === 'medical') return 'medical';
  if (hash === 'case-studies' || hash === 'portfolio' || path === 'case-studies') return 'case-studies';
  if (hash === 'about' || path === 'about') return 'about';
  if (hash === 'ipt' || hash === 'ipt-case-study' || hash === 'case-study/cs-med-ipt' || hash === 'case-study/ipt') return 'ipt-case-study';
  if (hash === 'penguin' || hash === 'penguin-case-study' || hash === 'case-study/cs-b2c-penguin' || hash === 'case-study/penguin') return 'penguin-case-study';
  if (hash === 'bsizia' || hash === 'bsizia-case-study' || hash === 'case-study/cs-b2b-bsizia' || hash === 'case-study/bsizia') return 'bsizia-case-study';
  if (hash === 'binaryracks' || hash === 'binaryracks-case-study' || hash === 'case-study/cs-b2c-binaryracks' || hash === 'case-study/binaryracks') return 'binaryracks-case-study';
  if (hash === 'gimoka' || hash === 'gimoka-case-study' || hash === 'case-study/cs-b2c-gimoka' || hash === 'case-study/gimoka') return 'gimoka-case-study';
  if (hash === 'lashin' || hash === 'memar-lashin' || hash === 'lashin-case-study' || hash === 'memar-lashin-case-study' || hash === 'case-study/cs-b2c-memar-lashin' || hash === 'case-study/lashin') return 'lashin-case-study';
  if (hash === 'concrete' || hash === 'concrete-case-study' || hash === 'case-study/cs-b2c-concrete' || hash === 'case-study/concrete') return 'concrete-case-study';
  if (hash === 'hamburg' || hash === 'hamburg-case-study' || hash === 'case-study/cs-b2c-hamburg' || hash === 'case-study/hamburg') return 'hamburg-case-study';
  if (hash === 'acton' || hash === 'acton-case-study' || hash === 'case-study/cs-b2c-acton' || hash === 'case-study/acton') return 'acton-case-study';
  if (hash === 'yoken' || hash === 'yoken-case-study' || hash === 'case-study/cs-b2c-yoken' || hash === 'case-study/yoken') return 'yoken-case-study';
  if (hash === 'siltal' || hash === 'siltal-case-study' || hash === 'case-study/cs-b2c-siltal' || hash === 'case-study/siltal') return 'siltal-case-study';
  if (hash === 'passap' || hash === 'passap-case-study' || hash === 'case-study/cs-b2c-passap' || hash === 'case-study/passap') return 'passap-case-study';
  if (hash === 'alwaad' || hash === 'alwaad-travel' || hash === 'alwaad-case-study' || hash === 'case-study/cs-b2c-alwaad-travel' || hash === 'case-study/alwaad') return 'alwaad-case-study';
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
      // Clear legacy state keys to avoid stale case studies
      localStorage.removeItem('digital_effect_agency_state_v9');
      localStorage.removeItem('digital_effect_agency_state_v10');
      localStorage.removeItem('digital_effect_agency_state_v11');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.caseStudies && parsed.packages) {
          // Ensure removed dummy case studies are pruned
          parsed.caseStudies = parsed.caseStudies.filter(
            (c: any) => c.id !== 'cs-med-1' && c.id !== 'cs-med-2' && c.id !== 'cs-b2b-1' && c.id !== 'cs-b2b-2' && c.id !== 'cs-b2c-1' && c.id !== 'cs-b2c-2'
          );
          if (!parsed.promoCodes || parsed.promoCodes.length === 0) {
            parsed.promoCodes = INITIAL_AGENCY_DATA.promoCodes || [];
          }
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

  // Fetch persisted data from server on mount
  useEffect(() => {
    fetch('/api/agency-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && serverData.caseStudies && Array.isArray(serverData.caseStudies)) {
          setData((prev) => {
            // If local storage has newer custom creatives, retain them, otherwise use server
            return {
              ...serverData,
              inquiries: prev.inquiries || serverData.inquiries || []
            };
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Sync data to localStorage & server
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    // Server-side persistence so all visitors and published sites see changes
    const timer = setTimeout(() => {
      fetch('/api/agency-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch((err) => {
        console.warn('Server sync notice:', err);
      });
    }, 600);

    return () => clearTimeout(timer);
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

  // Promo Codes CRUD
  const addPromoCode = (promoData: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>) => {
    const cleanCode = promoData.code.trim().toUpperCase();
    const newPromo: PromoCode = {
      ...promoData,
      code: cleanCode,
      id: `promo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    setData((prev) => ({
      ...prev,
      promoCodes: [newPromo, ...(prev.promoCodes || [])],
    }));
  };

  const updatePromoCode = (promo: PromoCode) => {
    const cleanPromo: PromoCode = {
      ...promo,
      code: promo.code.trim().toUpperCase(),
    };
    setData((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).map((p) => (p.id === promo.id ? cleanPromo : p)),
    }));
  };

  const deletePromoCode = (id: string) => {
    setData((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).filter((p) => p.id !== id),
    }));
  };

  const togglePromoCodeStatus = (id: string) => {
    setData((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    }));
  };

  const recordPromoUsage = (codeStr: string) => {
    const clean = codeStr.trim().toUpperCase();
    setData((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).map((p) =>
        p.code.toUpperCase() === clean ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p
      ),
    }));
  };

  const validatePromoCode = (
    codeStr: string,
    price: number,
    sector?: SectorType
  ): {
    isValid: boolean;
    discountAmount: number;
    finalPrice: number;
    message: string;
    promo?: PromoCode;
  } => {
    const clean = codeStr.trim().toUpperCase();
    if (!clean) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: price,
        message: language === 'ar' ? 'يرجى إدخال كود الخصم.' : 'Please enter a promo code.',
      };
    }

    const promoList = data.promoCodes || [];
    const found = promoList.find((p) => p.code.toUpperCase() === clean);

    if (!found) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: price,
        message: language === 'ar' ? 'كود الخصم غير صحيح أو غير موجود.' : 'Invalid promo code.',
      };
    }

    if (!found.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: price,
        message: language === 'ar' ? 'عفواً، تم إيقاف هذا الكود حالياً.' : 'This promo code is currently disabled.',
      };
    }

    if (found.expiresAt) {
      const today = new Date().toISOString().slice(0, 10);
      if (today > found.expiresAt) {
        return {
          isValid: false,
          discountAmount: 0,
          finalPrice: price,
          message: language === 'ar' ? 'عفواً، لقد انتهت صلاحية هذا الكود.' : 'This promo code has expired.',
        };
      }
    }

    if (found.maxUsage && found.usageCount >= found.maxUsage) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: price,
        message: language === 'ar' ? 'عفواً، تم استنفاد الحد الأقصى لاستخدام هذا الكود.' : 'Promo code maximum usage reached.',
      };
    }

    if (found.applicableSector && found.applicableSector !== 'all' && sector && sector !== 'all' && found.applicableSector !== sector) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: price,
        message: language === 'ar' ? `هذا الكود مخصص لقطاع (${found.applicableSector.toUpperCase()}) فقط.` : `Only valid for ${found.applicableSector.toUpperCase()} sector.`,
      };
    }

    if (found.minSpend && price < found.minSpend) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: price,
        message: language === 'ar'
          ? `الحد الأدنى لقيمة الباقة للاستفادة من هذا الكود هو ${found.minSpend.toLocaleString('ar-EG')} ج.م.`
          : `Minimum package price for this promo code is ${found.minSpend.toLocaleString('en-US')} EGP.`,
      };
    }

    let discountAmount = 0;
    if (found.discountType === 'percentage') {
      discountAmount = Math.round((price * found.discountValue) / 100);
    } else {
      discountAmount = Math.min(price, found.discountValue);
    }

    const finalPrice = Math.max(0, price - discountAmount);

    return {
      isValid: true,
      discountAmount,
      finalPrice,
      message: language === 'ar'
        ? `تم تطبيق الخصم بنجاح! وفرت ${discountAmount.toLocaleString('ar-EG')} ج.م.`
        : `Promo code applied! You saved ${discountAmount.toLocaleString('en-US')} EGP.`,
      promo: found,
    };
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

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setData((prev) => ({
      ...prev,
      inquiries: [newInquiry, ...(prev.inquiries || [])],
    }));
  };

  const updateInquiryStatus = (id: string, status: Inquiry['status']) => {
    setData((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).map((item) => (item.id === id ? { ...item, status } : item)),
    }));
  };

  const deleteInquiry = (id: string) => {
    setData((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).filter((item) => item.id !== id),
    }));
  };

  const clearAllInquiries = () => {
    setData((prev) => ({
      ...prev,
      inquiries: [],
    }));
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
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        togglePromoCodeStatus,
        recordPromoUsage,
        validatePromoCode,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        clearAllInquiries,
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
