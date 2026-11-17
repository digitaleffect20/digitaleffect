import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AgencyDataState, CaseStudy, ServicePackage, PromoBanner, SectorType, PortfolioCategoryFilter, Language, PageRoute, Inquiry, PromoCode, CustomPackagePricingRates, CustomPackageConfig, ClientInvoiceRecord, AccountLedgerEntry } from '../types';
import { INITIAL_AGENCY_DATA } from '../data/initialData';
import { TRANSLATIONS } from '../translations';
import { DEFAULT_CUSTOM_PACKAGE_RATES } from '../utils/pricingCalculator';
import {
  supabase,
  isSupabaseConfigured,
  fetchPublicCatalogFromSupabase,
  savePublicCatalogToSupabase,
  fetchAdminCrmBundleFromSupabase,
  upsertCrmClientToSupabase,
  deleteCrmClientFromSupabase,
  upsertInvoiceToSupabase,
  deleteInvoiceFromSupabase,
  migrateFullLocalDataToSupabase,
} from '../lib/supabase';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface AgencyContextType {
  data: AgencyDataState;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  portfolioFilter: PortfolioCategoryFilter;
  setPortfolioFilter: (filter: PortfolioCategoryFilter) => void;
  navigateToPortfolio: (filter: PortfolioCategoryFilter) => void;
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
  customPackageConfig: CustomPackageConfig | null;
  setCustomPackageConfig: (cfg: CustomPackageConfig | null) => void;

  // CRUD actions for user customizability
  addCaseStudy: (study: Omit<CaseStudy, 'id'>) => void;
  updateCaseStudy: (study: CaseStudy) => void;
  deleteCaseStudy: (id: string) => void;

  addPackage: (pkg: Omit<ServicePackage, 'id'>) => void;
  updatePackage: (pkg: ServicePackage) => void;
  deletePackage: (id: string) => void;
  updateCustomRates: (rates: CustomPackagePricingRates) => void;

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
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Inquiry['status'] }) => Inquiry;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => void;
  updateInquiry: (id: string, updates: Partial<Inquiry>) => void;
  deleteInquiry: (id: string) => void;
  clearAllInquiries: () => void;

  // Invoices Archive & Account Statements
  addInvoice: (invoice: Omit<ClientInvoiceRecord, 'id' | 'createdAt'>) => ClientInvoiceRecord;
  updateInvoice: (id: string, updates: Partial<ClientInvoiceRecord>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceAsPaid: (id: string, paymentMethod?: string) => void;
  getClientLedger: (clientId: string, fromDate?: string, toDate?: string) => {
    entries: AccountLedgerEntry[];
    openingBalance: number;
    totalInvoiced: number;
    totalPaid: number;
    totalAdFunded: number;
    totalAdSpent: number;
    closingBalance: number;
    currentAdCreditBalance: number;
  };

  updateBanner: (banner: PromoBanner) => void;
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;

  // Cloud Persistence Status & Actions (Supabase Phase 2)
  cloudSyncStatus: CloudSyncStatus;
  supabaseMigrationNeeded: boolean;
  lastCloudSyncAt: string | null;
  syncNowToSupabase: () => Promise<{
    success: boolean;
    clientsSynced: number;
    invoicesSynced: number;
    catalogSynced: boolean;
    migrationNeeded?: boolean;
    error?: string;
  }>;
  refreshFromSupabase: () => Promise<void>;
}

const STORAGE_KEY = 'digital_effect_agency_state_v14';
const LANG_STORAGE_KEY = 'digital_effect_language_v2';

const AgencyDataContext = createContext<AgencyContextType | undefined>(undefined);

// Helper to ensure canonical case studies like AGU, Premium, and Business Partners are never omitted
function ensureCanonicalStudies(studies: CaseStudy[]): CaseStudy[] {
  const list = Array.isArray(studies) ? [...studies] : [];
  if (!list.some((c) => c.id === 'cs-b2b-agu')) {
    const aguStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-agu');
    if (aguStudy) {
      list.splice(1, 0, aguStudy);
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-premium')) {
    const premiumStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-premium');
    if (premiumStudy) {
      const aguIdx = list.findIndex((c) => c.id === 'cs-b2b-agu');
      if (aguIdx !== -1) {
        list.splice(aguIdx + 1, 0, premiumStudy);
      } else {
        list.splice(1, 0, premiumStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-business-partner')) {
    const bpStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-business-partner');
    if (bpStudy) {
      const premIdx = list.findIndex((c) => c.id === 'cs-b2b-premium');
      if (premIdx !== -1) {
        list.splice(premIdx + 1, 0, bpStudy);
      } else {
        list.splice(1, 0, bpStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-overview')) {
    const overviewStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-overview');
    if (overviewStudy) {
      const bpIdx = list.findIndex((c) => c.id === 'cs-b2b-business-partner');
      if (bpIdx !== -1) {
        list.splice(bpIdx + 1, 0, overviewStudy);
      } else {
        list.splice(1, 0, overviewStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-oro')) {
    const oroStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-oro');
    if (oroStudy) {
      const ovIdx = list.findIndex((c) => c.id === 'cs-b2b-overview');
      if (ovIdx !== -1) {
        list.splice(ovIdx + 1, 0, oroStudy);
      } else {
        list.splice(1, 0, oroStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-afro-energy')) {
    const afroStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-afro-energy');
    if (afroStudy) {
      const oroIdx = list.findIndex((c) => c.id === 'cs-b2b-oro');
      if (oroIdx !== -1) {
        list.splice(oroIdx + 1, 0, afroStudy);
      } else {
        list.splice(1, 0, afroStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-sadko')) {
    const sadkoStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-sadko');
    if (sadkoStudy) {
      const afroIdx = list.findIndex((c) => c.id === 'cs-b2b-afro-energy');
      if (afroIdx !== -1) {
        list.splice(afroIdx + 1, 0, sadkoStudy);
      } else {
        list.splice(1, 0, sadkoStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-ufar')) {
    const ufarStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-ufar');
    if (ufarStudy) {
      const sadkoIdx = list.findIndex((c) => c.id === 'cs-b2b-sadko');
      if (sadkoIdx !== -1) {
        list.splice(sadkoIdx + 1, 0, ufarStudy);
      } else {
        list.splice(1, 0, ufarStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-siltal-identity')) {
    const siltalIdentityStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-siltal-identity');
    if (siltalIdentityStudy) {
      const ufarIdx = list.findIndex((c) => c.id === 'cs-b2b-ufar');
      if (ufarIdx !== -1) {
        list.splice(ufarIdx + 1, 0, siltalIdentityStudy);
      } else {
        list.splice(1, 0, siltalIdentityStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2b-bilton')) {
    const biltonStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2b-bilton');
    if (biltonStudy) {
      const siltalIdx = list.findIndex((c) => c.id === 'cs-b2b-siltal-identity');
      if (siltalIdx !== -1) {
        list.splice(siltalIdx + 1, 0, biltonStudy);
      } else {
        list.splice(1, 0, biltonStudy);
      }
    }
  }
  if (!list.some((c) => c.id === 'cs-b2c-penguin-web')) {
    const penguinWebStudy = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-b2c-penguin-web');
    if (penguinWebStudy) {
      const penguinIdx = list.findIndex((c) => c.id === 'cs-b2c-penguin');
      if (penguinIdx !== -1) {
        list.splice(penguinIdx + 1, 0, penguinWebStudy);
      } else {
        list.push(penguinWebStudy);
      }
    }
  }
  return list;
}

export const PAGE_TO_PATH: Record<PageRoute, string> = {
  home: '/',
  b2b: '/b2b',
  b2c: '/b2c',
  medical: '/medical',
  'case-studies': '/portfolio',
  about: '/about',
  'custom-package': '/custom-package',
  'ipt-case-study': '/ipt',
  'penguin-case-study': '/penguin',
  'penguin-web-case-study': '/penguin-website',
  'bsizia-case-study': '/bsizia',
  'binaryracks-case-study': '/binaryracks',
  'gimoka-case-study': '/gimoka',
  'lashin-case-study': '/lashin',
  'concrete-case-study': '/concrete',
  'hamburg-case-study': '/hamburg',
  'acton-case-study': '/acton',
  'yoken-case-study': '/yoken',
  'siltal-case-study': '/siltal',
  'passap-case-study': '/passap',
  'alwaad-case-study': '/alwaad',
  'agu-case-study': '/agu',
  'premium-case-study': '/premium',
  'business-partner-case-study': '/business-partner',
  'overview-case-study': '/overview',
  'oro-case-study': '/oro',
  'afro-energy-case-study': '/afro-energy',
  'sadko-case-study': '/sadko',
  'ufar-case-study': '/ufar',
  'siltal-identity-case-study': '/siltal-identity',
  'bilton-case-study': '/bilton',
  admin: '/admin',
};

export const PORTFOLIO_FILTER_TO_PATH: Record<PortfolioCategoryFilter, string> = {
  all: '/portfolio',
  social: '/portfolio/social-media',
  'social-b2b': '/portfolio/social-media/b2b',
  'social-b2c': '/portfolio/social-media/b2c',
  'social-medical': '/portfolio/social-media/medical',
  identity: '/portfolio/visual-identity',
  web: '/portfolio/websites',
  b2b: '/portfolio/b2b',
  b2c: '/portfolio/b2c',
  medical: '/portfolio/medical',
};

export function getPagePath(page: PageRoute): string {
  return PAGE_TO_PATH[page] || '/';
}

export function getPortfolioPath(filter: PortfolioCategoryFilter): string {
  return PORTFOLIO_FILTER_TO_PATH[filter] || '/portfolio';
}

// Helper to parse page and portfolio filter from URL pathname or legacy hash
function getRouteFromLocation(): { page: PageRoute; portfolioFilter?: PortfolioCategoryFilter } {
  const fullPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const path = fullPath.split('/')[0];
  const hash = window.location.hash.replace(/^#\/?|\/+$/g, '').toLowerCase();
  const token = fullPath || hash;

  // Nested Portfolio & Social Media Sub-sector URLs
  if (token === 'portfolio/social-media/b2b' || token === 'social-media/b2b' || token === 'social-b2b' || hash === 'social-b2b') {
    return { page: 'case-studies', portfolioFilter: 'social-b2b' };
  }
  if (token === 'portfolio/social-media/b2c' || token === 'social-media/b2c' || token === 'social-b2c' || hash === 'social-b2c') {
    return { page: 'case-studies', portfolioFilter: 'social-b2c' };
  }
  if (token === 'portfolio/social-media/medical' || token === 'social-media/medical' || token === 'social-medical' || hash === 'social-medical') {
    return { page: 'case-studies', portfolioFilter: 'social-medical' };
  }
  if (token === 'portfolio/social-media' || token === 'social-media' || token === 'social' || hash === 'social-media') {
    return { page: 'case-studies', portfolioFilter: 'social' };
  }
  if (token === 'portfolio/visual-identity' || token === 'visual-identity' || token === 'identity' || hash === 'visual-identity') {
    return { page: 'case-studies', portfolioFilter: 'identity' };
  }
  if (token === 'portfolio/websites' || token === 'websites' || token === 'web' || hash === 'websites') {
    return { page: 'case-studies', portfolioFilter: 'web' };
  }
  if (token === 'portfolio/b2b' || hash === 'portfolio/b2b') {
    return { page: 'case-studies', portfolioFilter: 'b2b' };
  }
  if (token === 'portfolio/b2c' || hash === 'portfolio/b2c') {
    return { page: 'case-studies', portfolioFilter: 'b2c' };
  }
  if (token === 'portfolio/medical' || hash === 'portfolio/medical') {
    return { page: 'case-studies', portfolioFilter: 'medical' };
  }
  if (token === 'portfolio' || token === 'case-studies' || hash === 'case-studies' || hash === 'portfolio') {
    return { page: 'case-studies', portfolioFilter: 'all' };
  }

  // Primary Pages & Dedicated Sector URLs
  if (path === 'admin' || hash === 'admin') return { page: 'admin' };
  if (path === 'b2b' || hash === 'b2b') return { page: 'b2b' };
  if (path === 'b2c' || hash === 'b2c') return { page: 'b2c' };
  if (path === 'medical' || hash === 'medical') return { page: 'medical' };
  if (path === 'about' || hash === 'about') return { page: 'about' };
  if (path === 'custom-package' || hash === 'custom-package' || hash === 'custom-calculator' || hash === 'calculator') return { page: 'custom-package' };

  // Individual Case Studies (Clean Path + Legacy Hash)
  if (path === 'ipt' || path === 'ipt-case-study' || hash === 'ipt' || hash === 'ipt-case-study' || hash === 'case-study/cs-med-ipt' || hash === 'case-study/ipt') return { page: 'ipt-case-study' };
  if (path === 'penguin' || path === 'penguin-case-study' || hash === 'penguin' || hash === 'penguin-case-study' || hash === 'case-study/cs-b2c-penguin' || hash === 'case-study/penguin') return { page: 'penguin-case-study' };
  if (path === 'penguin-website' || path === 'penguin-web' || hash === 'penguin-web' || hash === 'penguin-website' || hash === 'penguin-web-case-study' || hash === 'penguin-ecommerce-case-study' || hash === 'case-study/cs-b2c-penguin-web' || hash === 'case-study/penguin-website') return { page: 'penguin-web-case-study' };
  if (path === 'bsizia' || path === 'bsizia-case-study' || hash === 'bsizia' || hash === 'bsizia-case-study' || hash === 'case-study/cs-b2b-bsizia' || hash === 'case-study/bsizia') return { page: 'bsizia-case-study' };
  if (path === 'binaryracks' || path === 'binaryracks-case-study' || hash === 'binaryracks' || hash === 'binaryracks-case-study' || hash === 'case-study/cs-b2c-binaryracks' || hash === 'case-study/binaryracks') return { page: 'binaryracks-case-study' };
  if (path === 'gimoka' || path === 'gimoka-case-study' || hash === 'gimoka' || hash === 'gimoka-case-study' || hash === 'case-study/cs-b2c-gimoka' || hash === 'case-study/gimoka') return { page: 'gimoka-case-study' };
  if (path === 'lashin' || path === 'memar-lashin' || hash === 'lashin' || hash === 'memar-lashin' || hash === 'lashin-case-study' || hash === 'memar-lashin-case-study' || hash === 'case-study/cs-b2c-memar-lashin' || hash === 'case-study/lashin') return { page: 'lashin-case-study' };
  if (path === 'concrete' || hash === 'concrete' || hash === 'concrete-case-study' || hash === 'case-study/cs-b2c-concrete' || hash === 'case-study/concrete') return { page: 'concrete-case-study' };
  if (path === 'hamburg' || hash === 'hamburg' || hash === 'hamburg-case-study' || hash === 'case-study/cs-b2c-hamburg' || hash === 'case-study/hamburg') return { page: 'hamburg-case-study' };
  if (path === 'acton' || hash === 'acton' || hash === 'acton-case-study' || hash === 'case-study/cs-b2c-acton' || hash === 'case-study/acton') return { page: 'acton-case-study' };
  if (path === 'yoken' || hash === 'yoken' || hash === 'yoken-case-study' || hash === 'case-study/cs-b2c-yoken' || hash === 'case-study/yoken') return { page: 'yoken-case-study' };
  if (path === 'siltal' || hash === 'siltal' || hash === 'siltal-case-study' || hash === 'case-study/cs-b2c-siltal' || hash === 'case-study/siltal') return { page: 'siltal-case-study' };
  if (path === 'passap' || hash === 'passap' || hash === 'passap-case-study' || hash === 'case-study/cs-b2c-passap' || hash === 'case-study/passap') return { page: 'passap-case-study' };
  if (path === 'alwaad' || path === 'alwaad-travel' || hash === 'alwaad' || hash === 'alwaad-travel' || hash === 'alwaad-case-study' || hash === 'case-study/cs-b2c-alwaad-travel' || hash === 'case-study/alwaad') return { page: 'alwaad-case-study' };
  if (path === 'agu' || hash === 'agu' || hash === 'agu-case-study' || hash === 'case-study/cs-b2b-agu' || hash === 'case-study/agu') return { page: 'agu-case-study' };
  if (path === 'premium' || hash === 'premium' || hash === 'premium-case-study' || hash === 'case-study/cs-b2b-premium' || hash === 'case-study/premium') return { page: 'premium-case-study' };
  if (path === 'business-partner' || path === 'business-partners' || hash === 'business-partner' || hash === 'business-partners' || hash === 'business-partner-case-study' || hash === 'case-study/cs-b2b-business-partner' || hash === 'case-study/business-partner') return { page: 'business-partner-case-study' };
  if (path === 'overview' || hash === 'overview' || hash === 'overview-case-study' || hash === 'case-study/cs-b2b-overview' || hash === 'case-study/overview') return { page: 'overview-case-study' };
  if (path === 'oro' || path === 'oro-2' || hash === 'oro' || hash === 'oro-2' || hash === 'oro-case-study' || hash === 'case-study/cs-b2b-oro' || hash === 'case-study/oro') return { page: 'oro-case-study' };
  if (path === 'afro-energy' || path === 'afro' || hash === 'afro-energy' || hash === 'afro' || hash === 'afro-energy-case-study' || hash === 'case-study/cs-b2b-afro-energy' || hash === 'case-study/afro-energy') return { page: 'afro-energy-case-study' };
  if (path === 'sadko' || path === 'sadko-2' || path === 'sadko-plast' || hash === 'sadko' || hash === 'sadko-2' || hash === 'sadko-plast' || hash === 'sadko-case-study' || hash === 'case-study/cs-b2b-sadko' || hash === 'case-study/sadko') return { page: 'sadko-case-study' };
  if (path === 'ufar' || path === 'ufar-2' || hash === 'ufar' || hash === 'ufar-2' || hash === 'ufar-case-study' || hash === 'case-study/cs-b2b-ufar' || hash === 'case-study/ufar') return { page: 'ufar-case-study' };
  if (path === 'siltal-identity' || hash === 'siltal-identity' || hash === 'siltal-identity-case-study' || hash === 'case-study/cs-b2b-siltal-identity' || hash === 'case-study/siltal-identity') return { page: 'siltal-identity-case-study' };
  if (path === 'bilton' || hash === 'bilton' || hash === 'bilton-case-study' || hash === 'case-study/cs-b2b-bilton' || hash === 'case-study/bilton') return { page: 'bilton-case-study' };

  return { page: 'home' };
}

export const AgencyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = getRouteFromLocation();

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {}
    return 'ar'; // Default Arabic as requested
  });

  const [currentPage, setCurrentPageState] = useState<PageRoute>(() => initialRoute.page);

  const [data, setData] = useState<AgencyDataState>(() => {
    try {
      // Clear legacy state keys to avoid stale case studies
      localStorage.removeItem('digital_effect_agency_state_v9');
      localStorage.removeItem('digital_effect_agency_state_v10');
      localStorage.removeItem('digital_effect_agency_state_v11');
      localStorage.removeItem('digital_effect_agency_state_v12');
      localStorage.removeItem('digital_effect_agency_state_v13');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.caseStudies && parsed.packages) {
          // Ensure removed dummy case studies are pruned
          parsed.caseStudies = parsed.caseStudies.filter(
            (c: any) => c.id !== 'cs-med-1' && c.id !== 'cs-med-2' && c.id !== 'cs-b2b-1' && c.id !== 'cs-b2b-2' && c.id !== 'cs-b2c-1' && c.id !== 'cs-b2c-2'
          );
          parsed.caseStudies = ensureCanonicalStudies(parsed.caseStudies);
          if (!parsed.promoCodes || parsed.promoCodes.length === 0) {
            parsed.promoCodes = INITIAL_AGENCY_DATA.promoCodes || [];
          }
          if (!parsed.inquiries || parsed.inquiries.length === 0) {
            parsed.inquiries = INITIAL_AGENCY_DATA.inquiries || [];
          }
          if (!parsed.invoices || parsed.invoices.length === 0) {
            parsed.invoices = INITIAL_AGENCY_DATA.invoices || [];
          }
          if (!parsed.customRates) {
            parsed.customRates = DEFAULT_CUSTOM_PACKAGE_RATES;
          }
          return parsed;
        }
      }
    } catch {}
    return {
      ...INITIAL_AGENCY_DATA,
      caseStudies: ensureCanonicalStudies(INITIAL_AGENCY_DATA.caseStudies),
      customRates: DEFAULT_CUSTOM_PACKAGE_RATES,
    };
  });

  const [activeSector, setActiveSector] = useState<SectorType>('all');
  const [portfolioFilter, setPortfolioFilterState] = useState<PortfolioCategoryFilter>(
    () => initialRoute.portfolioFilter || 'all'
  );
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedPackageForInquiry, setSelectedPackageForInquiry] = useState<ServicePackage | null>(null);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [customPackageConfig, setCustomPackageConfig] = useState<CustomPackageConfig | null>(null);

  // Supabase Phase 2 Cloud Sync State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>(
    isSupabaseConfigured ? 'idle' : 'offline'
  );
  const [supabaseMigrationNeeded, setSupabaseMigrationNeeded] = useState(false);
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState<string | null>(null);
  const dataRef = useRef<AgencyDataState>(data);
  dataRef.current = data;
  const catalogDirtyRef = useRef(false);

  // Language setter with HTML document update
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Update portfolio filter & sync URL path cleanly if currently viewing portfolio
  const setPortfolioFilter = (filter: PortfolioCategoryFilter) => {
    setPortfolioFilterState(filter);
    if (currentPage === 'case-studies') {
      const targetPath = getPortfolioPath(filter);
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState({ page: 'case-studies', portfolioFilter: filter }, '', targetPath);
      }
    }
  };

  // Navigate directly to a specific portfolio/sector sub-URL cleanly
  const navigateToPortfolio = (filter: PortfolioCategoryFilter) => {
    setPortfolioFilterState(filter);
    setCurrentPageState('case-studies');
    const targetPath = getPortfolioPath(filter);
    if (window.location.pathname !== targetPath || window.location.hash) {
      window.history.pushState({ page: 'case-studies', portfolioFilter: filter }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Set page and update browser URL cleanly via History API with smooth top scroll
  const setCurrentPage = (page: PageRoute) => {
    setCurrentPageState(page);
    const targetPath = page === 'case-studies' ? getPortfolioPath(portfolioFilter) : getPagePath(page);
    if (window.location.pathname !== targetPath || window.location.hash) {
      window.history.pushState({ page, portfolioFilter }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser popstate (Back/Forward) and hashchange events
  useEffect(() => {
    const handleLocationSync = () => {
      const next = getRouteFromLocation();
      setCurrentPageState(next.page);
      if (next.portfolioFilter) {
        setPortfolioFilterState(next.portfolioFilter);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handleLocationSync);
    window.addEventListener('hashchange', handleLocationSync);
    return () => {
      window.removeEventListener('popstate', handleLocationSync);
      window.removeEventListener('hashchange', handleLocationSync);
    };
  }, []);

  // Sync document dir on initial mount
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const stripHeavyMediaForCache = (val: any): any => {
    if (typeof val === 'string') {
      if (val.startsWith('data:') && val.length > 4096) {
        return '';
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(stripHeavyMediaForCache).filter((item) => item !== '');
    }
    if (val && typeof val === 'object') {
      const copy: Record<string, any> = {};
      for (const k of Object.keys(val)) {
        copy[k] = stripHeavyMediaForCache(val[k]);
      }
      return copy;
    }
    return val;
  };

  const safeSaveToLocalStorage = (stateToSave: AgencyDataState) => {
    try {
      // Remove any older versioned state keys to keep quota clean
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('digital_effect_agency_state_') && k !== STORAGE_KEY) {
          localStorage.removeItem(k);
        }
      }
      const serialized = JSON.stringify(stateToSave);
      if (serialized.length <= 1_800_000) {
        localStorage.setItem(STORAGE_KEY, serialized);
        return;
      }
      // Large inline base64 assets belong on the server (/assets/uploads); cache lightweight metadata only
      const compactState = stripHeavyMediaForCache(stateToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compactState));
    } catch {
      try {
        const compactState = stripHeavyMediaForCache(stateToSave);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compactState));
      } catch {
        // Ignore remaining storage quota limits silently; server persistence remains active
      }
    }
  };

  // Helper: Refresh CRM bundle (clients & invoices) when admin session is authenticated
  const refreshFromSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setCloudSyncStatus('offline');
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return;

      setCloudSyncStatus('syncing');
      const [catRes, crmRes] = await Promise.all([
        fetchPublicCatalogFromSupabase(),
        fetchAdminCrmBundleFromSupabase(),
      ]);

      if (catRes.migrationNeeded || crmRes.migrationNeeded) {
        setSupabaseMigrationNeeded(true);
        setCloudSyncStatus('error');
        return;
      }

      setSupabaseMigrationNeeded(false);

      const sampleClientIds = new Set((INITIAL_AGENCY_DATA.inquiries || []).map((c) => c.id));
      const sampleInvoiceIds = new Set((INITIAL_AGENCY_DATA.invoices || []).map((i) => i.id));

      setData((prev) => {
        const next: AgencyDataState = { ...prev };

        // Hydrate public catalog if present in Supabase
        if (catRes.catalog) {
          if (Array.isArray(catRes.catalog.caseStudies) && catRes.catalog.caseStudies.length > 0) {
            next.caseStudies = ensureCanonicalStudies(catRes.catalog.caseStudies);
          }
          if (Array.isArray(catRes.catalog.packages) && catRes.catalog.packages.length > 0) {
            next.packages = catRes.catalog.packages;
          }
          if (Array.isArray(catRes.catalog.promoCodes)) {
            next.promoCodes = catRes.catalog.promoCodes;
          }
          if (catRes.catalog.customRates) {
            next.customRates = catRes.catalog.customRates;
          }
          if (catRes.catalog.banner) {
            next.banner = catRes.catalog.banner;
          }
          if (catRes.catalog.agencyInfo) {
            next.agencyInfo = catRes.catalog.agencyInfo;
          }
        }

        // Hydrate CRM clients if cloud already has records
        if (crmRes.clients.length > 0) {
          const cloudIds = new Set(crmRes.clients.map((c) => c.id));
          const localOnlyNonSample = (prev.inquiries || []).filter(
            (c) => !cloudIds.has(c.id) && !sampleClientIds.has(c.id)
          );
          next.inquiries = [...crmRes.clients, ...localOnlyNonSample];
        }

        // Hydrate invoices if cloud already has records
        if (crmRes.invoices.length > 0) {
          const cloudInvIds = new Set(crmRes.invoices.map((i) => i.id));
          const localOnlyInvoices = (prev.invoices || []).filter(
            (i) => !cloudInvIds.has(i.id) && !sampleInvoiceIds.has(i.id)
          );
          next.invoices = [...crmRes.invoices, ...localOnlyInvoices];
        }

        return next;
      });

      setLastCloudSyncAt(new Date().toISOString());
      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Supabase refresh notice:', err);
      setCloudSyncStatus('error');
    }
  };

  const syncNowToSupabase = async () => {
    setCloudSyncStatus('syncing');
    const res = await migrateFullLocalDataToSupabase(dataRef.current);
    if (res.migrationNeeded) {
      setSupabaseMigrationNeeded(true);
      setCloudSyncStatus('error');
    } else if (res.success) {
      setSupabaseMigrationNeeded(false);
      setLastCloudSyncAt(new Date().toISOString());
      setCloudSyncStatus('synced');
      catalogDirtyRef.current = false;
    } else {
      setCloudSyncStatus('error');
    }
    return res;
  };

  // Fetch persisted data from server AND Supabase on mount
  useEffect(() => {
    fetch('/api/agency-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && serverData.caseStudies && Array.isArray(serverData.caseStudies)) {
          const verifiedStudies = ensureCanonicalStudies(serverData.caseStudies);
          const sanitizedData = {
            ...serverData,
            caseStudies: verifiedStudies,
          };
          setData((prev) => {
            const sampleIds = new Set((INITIAL_AGENCY_DATA.inquiries || []).map((c) => c.id));
            const prevInq = prev.inquiries || [];
            const prevIds = new Set(prevInq.map((c) => c.id));
            const serverExtras = Array.isArray(serverData.inquiries)
              ? serverData.inquiries.filter((c: any) => c?.id && !prevIds.has(c.id) && !sampleIds.has(c.id))
              : [];
            return {
              ...sanitizedData,
              inquiries: [...serverExtras, ...prevInq],
            };
          });
          safeSaveToLocalStorage(sanitizedData);
        }
      })
      .catch(() => {})
      .finally(() => {
        // Hydrate public catalog from Supabase for all visitors
        if (isSupabaseConfigured && supabase) {
          fetchPublicCatalogFromSupabase().then((catRes) => {
            if (catRes.migrationNeeded) {
              setSupabaseMigrationNeeded(true);
            } else if (catRes.catalog) {
              setData((prev) => ({
                ...prev,
                caseStudies: Array.isArray(catRes.catalog?.caseStudies) && catRes.catalog.caseStudies.length > 0
                  ? ensureCanonicalStudies(catRes.catalog.caseStudies)
                  : prev.caseStudies,
                packages: Array.isArray(catRes.catalog?.packages) && catRes.catalog.packages.length > 0
                  ? catRes.catalog.packages
                  : prev.packages,
                promoCodes: Array.isArray(catRes.catalog?.promoCodes)
                  ? catRes.catalog.promoCodes
                  : prev.promoCodes,
                customRates: catRes.catalog?.customRates || prev.customRates,
                banner: catRes.catalog?.banner || prev.banner,
                agencyInfo: catRes.catalog?.agencyInfo || prev.agencyInfo,
              }));
            }
          });
        }
      });

    if (isSupabaseConfigured && supabase) {
      refreshFromSupabase();
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          refreshFromSupabase();
        }
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Sync data to localStorage, server, & Supabase (when catalog was edited by admin)
  useEffect(() => {
    safeSaveToLocalStorage(data);

    // Server-side persistence so all visitors and published sites see changes
    const timer = setTimeout(() => {
      fetch('/api/agency-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch((err) => {
        console.warn('Server sync notice:', err);
      });

      if (catalogDirtyRef.current && isSupabaseConfigured && supabase) {
        catalogDirtyRef.current = false;
        savePublicCatalogToSupabase(data).then((res) => {
          if (res.migrationNeeded) {
            setSupabaseMigrationNeeded(true);
          } else if (res.success) {
            setLastCloudSyncAt(new Date().toISOString());
            setCloudSyncStatus('synced');
          }
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [data]);

  // Case Studies CRUD
  const addCaseStudy = (studyData: Omit<CaseStudy, 'id'>) => {
    catalogDirtyRef.current = true;
    const newId = `cs-${Date.now()}`;
    const newStudy: CaseStudy = { ...studyData, id: newId };
    setData((prev) => ({
      ...prev,
      caseStudies: [newStudy, ...prev.caseStudies],
    }));
  };

  const updateCaseStudy = (study: CaseStudy) => {
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.map((s) => (s.id === study.id ? study : s)),
    }));
  };

  const deleteCaseStudy = (id: string) => {
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.filter((s) => s.id !== id),
    }));
  };

  // Packages CRUD
  const addPackage = (pkgData: Omit<ServicePackage, 'id'>) => {
    catalogDirtyRef.current = true;
    const newId = `pkg-${Date.now()}`;
    const newPkg: ServicePackage = { ...pkgData, id: newId };
    setData((prev) => ({
      ...prev,
      packages: [...prev.packages, newPkg],
    }));
  };

  const updatePackage = (pkg: ServicePackage) => {
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => (p.id === pkg.id ? pkg : p)),
    }));
  };

  const deletePackage = (id: string) => {
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      packages: prev.packages.filter((p) => p.id !== id),
    }));
  };

  const updateCustomRates = (rates: CustomPackagePricingRates) => {
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      customRates: rates,
    }));
  };

  // Promo Codes CRUD
  const addPromoCode = (promoData: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>) => {
    catalogDirtyRef.current = true;
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
    catalogDirtyRef.current = true;
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
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).filter((p) => p.id !== id),
    }));
  };

  const togglePromoCodeStatus = (id: string) => {
    catalogDirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    }));
  };

  const recordPromoUsage = (codeStr: string) => {
    catalogDirtyRef.current = true;
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
    catalogDirtyRef.current = true;
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
        catalogDirtyRef.current = true;
        setData(parsed);
        return true;
      }
    } catch (err) {
      console.error('Invalid JSON import', err);
    }
    return false;
  };

  const buildMergedInquiry = (existing: Inquiry, updates: Partial<Inquiry>): Inquiry => {
    const merged: Inquiry = { ...existing, ...updates };
    if (updates.status === 'closed' || (merged.status === 'closed' && !merged.contractStartDate)) {
      const today = new Date().toISOString().split('T')[0];
      const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      merged.contractStartDate = merged.contractStartDate || today;
      merged.renewalDate = merged.renewalDate || renewal;
      merged.contractStatus = merged.contractStatus || 'active';
      merged.paymentStatus = merged.paymentStatus || 'paid';
      merged.billingCycle = merged.billingCycle || 'monthly';
      merged.postsDelivered = merged.postsDelivered ?? 0;
      merged.reelsDelivered = merged.reelsDelivered ?? 0;
      merged.storiesDelivered = merged.storiesDelivered ?? 0;
      merged.currentWorkflowDay = merged.currentWorkflowDay || 12;
      merged.todayTaskTitle = merged.todayTaskTitle || 'تصميم النسخة النهائية للمحتوى';
      if (!merged.workflowStages || merged.workflowStages.length === 0) {
        merged.workflowStages = [
          { id: 'content_creator', title: 'Content Creator', status: 'completed' },
          { id: 'visual_design', title: 'Visual Design', status: 'completed' },
          { id: 'final_design', title: 'Final Design', status: 'in_progress' },
          { id: 'client_approve', title: 'Client Approve', status: 'pending' },
          { id: 'publish', title: 'Publish', status: 'pending' },
        ];
      }
      if (!merged.clientNotes || merged.clientNotes.length === 0) {
        merged.clientNotes = [
          {
            id: `note-${Date.now()}`,
            text: 'تم تحويل العميل إلى مرحلة التعاقد وتفعيل حساب المتابعة.',
            createdAt: new Date().toISOString(),
            type: 'update',
          }
        ];
      }
    }
    return merged;
  };

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Inquiry['status'] }): Inquiry => {
    const isClosed = inquiryData.status === 'closed';
    const today = new Date().toISOString().split('T')[0];
    const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInquiry: Inquiry = {
      ...inquiryData,
      id: inquiryData.id || `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: inquiryData.status || 'new',
      ...(isClosed ? {
        contractStartDate: inquiryData.contractStartDate || today,
        renewalDate: inquiryData.renewalDate || renewal,
        contractStatus: inquiryData.contractStatus || 'active',
        paymentStatus: inquiryData.paymentStatus || 'paid',
        billingCycle: inquiryData.billingCycle || 'monthly',
        postsDelivered: inquiryData.postsDelivered ?? 0,
        reelsDelivered: inquiryData.reelsDelivered ?? 0,
        storiesDelivered: inquiryData.storiesDelivered ?? 0,
        currentWorkflowDay: inquiryData.currentWorkflowDay || 12,
        todayTaskTitle: inquiryData.todayTaskTitle || 'تصميم النسخة النهائية للمحتوى',
        workflowStages: inquiryData.workflowStages || [
          { id: 'content_creator', title: 'Content Creator', status: 'completed' },
          { id: 'visual_design', title: 'Visual Design', status: 'completed' },
          { id: 'final_design', title: 'Final Design', status: 'in_progress' },
          { id: 'client_approve', title: 'Client Approve', status: 'pending' },
          { id: 'publish', title: 'Publish', status: 'pending' },
        ],
        clientNotes: inquiryData.clientNotes || [
          {
            id: `note-${Date.now()}`,
            text: 'تم تسجيل العميل وتأكيد التعاقد وبدء خطة العمل.',
            createdAt: new Date().toISOString(),
            type: 'update',
          }
        ]
      } : {})
    };
    setData((prev) => ({
      ...prev,
      inquiries: [newInquiry, ...(prev.inquiries || [])],
    }));

    if (isSupabaseConfigured && supabase) {
      upsertCrmClientToSupabase(newInquiry).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }

    return newInquiry;
  };

  const updateInquiry = (id: string, updates: Partial<Inquiry>) => {
    const existingItem = (dataRef.current.inquiries || []).find((item) => item.id === id);
    const mergedForSync = existingItem ? buildMergedInquiry(existingItem, updates) : null;

    setData((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).map((item) =>
        item.id === id ? buildMergedInquiry(item, updates) : item
      ),
    }));

    if (mergedForSync && isSupabaseConfigured && supabase) {
      upsertCrmClientToSupabase(mergedForSync).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }
  };

  const updateInquiryStatus = (id: string, status: Inquiry['status']) => {
    updateInquiry(id, { status });
  };

  const deleteInquiry = (id: string) => {
    setData((prev) => ({
      ...prev,
      inquiries: (prev.inquiries || []).filter((item) => item.id !== id),
    }));
    if (isSupabaseConfigured && supabase) {
      deleteCrmClientFromSupabase(id).catch(() => {});
    }
  };

  const clearAllInquiries = () => {
    setData((prev) => ({
      ...prev,
      inquiries: [],
    }));
  };

  // Invoices Archive Actions
  const addInvoice = (invoiceData: Omit<ClientInvoiceRecord, 'id' | 'createdAt'>): ClientInvoiceRecord => {
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const invoiceNumber = invoiceData.invoiceNumber || `DE-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String((dataRef.current.invoices?.length || 0) + 101).slice(-3)}`;
    const newInvoice: ClientInvoiceRecord = {
      ...invoiceData,
      id,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      invoices: [newInvoice, ...(prev.invoices || [])],
    }));

    if (isSupabaseConfigured && supabase) {
      upsertInvoiceToSupabase(newInvoice).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }

    // If client exists, append tracking note to client profile
    if (newInvoice.clientId) {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === newInvoice.clientId);
      if (client) {
        const noteText = `تم إصدار فاتورة جديدة برقم ${newInvoice.invoiceNumber} بقيمة إجمالية ${newInvoice.grandTotal.toLocaleString()} ج.م (${newInvoice.packageName})${newInvoice.adCreditAmount ? ` تتضمن رصيد إعلاني ${newInvoice.adCreditAmount.toLocaleString()} ج.م` : ''}.`;
        const updatedNotes = [
          {
            id: `note-${Date.now()}`,
            text: noteText,
            createdAt: new Date().toISOString(),
            type: 'payment' as const,
          },
          ...(client.clientNotes || []),
        ];
        updateInquiry(client.id, {
          clientNotes: updatedNotes,
          pendingInvoiceAdCredit: newInvoice.adCreditAmount ? newInvoice.adCreditAmount : client.pendingInvoiceAdCredit,
        });
      }
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<ClientInvoiceRecord>) => {
    const existingInv = (dataRef.current.invoices || []).find((inv) => inv.id === id);
    const updatedInv = existingInv ? { ...existingInv, ...updates } : null;

    setData((prev) => ({
      ...prev,
      invoices: (prev.invoices || []).map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    }));

    if (updatedInv && isSupabaseConfigured && supabase) {
      upsertInvoiceToSupabase(updatedInv).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }
  };

  const deleteInvoice = (id: string) => {
    setData((prev) => ({
      ...prev,
      invoices: (prev.invoices || []).filter((inv) => inv.id !== id),
    }));
    if (isSupabaseConfigured && supabase) {
      deleteInvoiceFromSupabase(id).catch(() => {});
    }
  };

  const markInvoiceAsPaid = (id: string, paymentMethod = 'إنستاباي / محفظة إلكترونية') => {
    const today = new Date().toISOString().split('T')[0];
    const invoice = (dataRef.current.invoices || []).find((inv) => inv.id === id);
    if (!invoice) return;

    updateInvoice(id, {
      paymentStatus: 'paid',
      paidAt: today,
      paymentMethod,
    });

    // If invoice had an ad credit amount, credit it directly to client's adCreditBalance
    if (invoice.clientId) {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === invoice.clientId);
      if (client) {
        const adAmt = invoice.adCreditAmount || 0;
        const newBalance = (client.adCreditBalance || 0) + adAmt;
        const newFundedTotal = (client.adCreditFundedTotal || 0) + adAmt;
        const pendingRemainder = Math.max(0, (client.pendingInvoiceAdCredit || 0) - adAmt);

        const updatedNotes = [
          {
            id: `note-${Date.now()}`,
            text: `تم تحصيل الفاتورة ${invoice.invoiceNumber} بقيمة ${invoice.grandTotal.toLocaleString()} ج.م${adAmt > 0 ? ` وتم إيداع ${adAmt.toLocaleString()} ج.م في محفظة الإعلانات الممولة (الرصيد المتاح: ${newBalance.toLocaleString()} ج.م).` : '.'}`,
            createdAt: new Date().toISOString(),
            type: 'payment' as const,
          },
          ...(client.clientNotes || []),
        ];

        updateInquiry(client.id, {
          paymentStatus: 'paid',
          adCreditBalance: newBalance,
          adCreditFundedTotal: newFundedTotal,
          pendingInvoiceAdCredit: pendingRemainder,
          clientNotes: updatedNotes,
        });
      }
    }
  };

  const getClientLedger = (clientId: string, fromDate?: string, toDate?: string) => {
    const client = (data.inquiries || []).find((c) => c.id === clientId);
    const clientInvoices = (data.invoices || []).filter((inv) => inv.clientId === clientId);

    const rawEntries: AccountLedgerEntry[] = [];

    // Map each invoice to a debit entry (and credit entry if paid)
    clientInvoices.forEach((inv) => {
      rawEntries.push({
        id: `ledger-inv-${inv.id}`,
        date: inv.issueDate,
        type: 'invoice',
        title: `فاتورة رسمية: ${inv.packageName}`,
        reference: inv.invoiceNumber,
        debit: inv.grandTotal,
        credit: 0,
        balance: 0,
        notes: inv.adCreditAmount ? `أتعاب إدارة: ${inv.retainerAmount.toLocaleString()} ج.م + رصيد إعلاني: ${inv.adCreditAmount.toLocaleString()} ج.م` : undefined,
      });

      if (inv.paymentStatus === 'paid' && (inv.paidAt || inv.issueDate)) {
        rawEntries.push({
          id: `ledger-pay-${inv.id}`,
          date: inv.paidAt || inv.issueDate,
          type: 'payment',
          title: `سداد الفاتورة (${inv.paymentMethod || 'محصل'})`,
          reference: inv.invoiceNumber,
          debit: 0,
          credit: inv.grandTotal,
          balance: 0,
          notes: inv.notes || 'سداد معتمد بالكامل',
        });
      }
    });

    // Check client notes for ad spend deductions
    if (client?.clientNotes) {
      client.clientNotes.forEach((note) => {
        if (note.text.includes('صرف إعلاني') || note.text.includes('خصم')) {
          const match = note.text.match(/خصم\s*([\d,]+)\s*ج\.م/);
          const platformMatch = note.text.match(/\[صرف إعلاني\s*-\s*([^\]]+)\]/);
          if (match) {
            const amount = parseInt(match[1].replace(/,/g, ''), 10) || 0;
            if (amount > 0) {
              const dateStr = note.createdAt ? note.createdAt.split('T')[0] : (client.contractStartDate || '2026-11-01');
              rawEntries.push({
                id: `ledger-spend-${note.id}`,
                date: dateStr,
                type: 'ad_spend',
                title: `صرف إعلاني ممول (${platformMatch ? platformMatch[1] : 'حملات ممولة'})`,
                reference: note.id.slice(-6),
                debit: 0,
                credit: 0,
                balance: 0,
                platform: platformMatch ? platformMatch[1] : undefined,
                notes: note.text,
              });
            }
          }
        }
      });
    }

    // Sort ascending by date
    rawEntries.sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = 0;
    let openingBalance = 0;
    const finalFilteredEntries: AccountLedgerEntry[] = [];

    rawEntries.forEach((entry) => {
      const isBeforePeriod = fromDate && entry.date < fromDate;
      const isAfterPeriod = toDate && entry.date > toDate;

      const effect = (entry.debit || 0) - (entry.credit || 0);

      if (isBeforePeriod) {
        openingBalance += effect;
        runningBalance += effect;
      } else if (!isAfterPeriod) {
        runningBalance += effect;
        finalFilteredEntries.push({
          ...entry,
          balance: runningBalance,
        });
      }
    });

    let totalInvoiced = 0;
    let totalPaid = 0;
    finalFilteredEntries.forEach((e) => {
      totalInvoiced += e.debit || 0;
      totalPaid += e.credit || 0;
    });

    const closingBalance = openingBalance + totalInvoiced - totalPaid;

    return {
      entries: finalFilteredEntries,
      openingBalance,
      totalInvoiced,
      totalPaid,
      totalAdFunded: client?.adCreditFundedTotal || (clientInvoices.reduce((acc, inv) => acc + (inv.paymentStatus === 'paid' ? (inv.adCreditAmount || 0) : 0), 0)),
      totalAdSpent: client?.adCreditSpentTotal || 0,
      closingBalance,
      currentAdCreditBalance: client?.adCreditBalance || 0,
    };
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
        portfolioFilter,
        setPortfolioFilter,
        navigateToPortfolio,
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
        customPackageConfig,
        setCustomPackageConfig,
        addCaseStudy,
        updateCaseStudy,
        deleteCaseStudy,
        addPackage,
        updatePackage,
        deletePackage,
        updateCustomRates,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        togglePromoCodeStatus,
        recordPromoUsage,
        validatePromoCode,
        addInquiry,
        updateInquiryStatus,
        updateInquiry,
        deleteInquiry,
        clearAllInquiries,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceAsPaid,
        getClientLedger,
        updateBanner,
        resetToDefaults,
        exportDataJson,
        importDataJson,
        cloudSyncStatus,
        supabaseMigrationNeeded,
        lastCloudSyncAt,
        syncNowToSupabase,
        refreshFromSupabase,
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
