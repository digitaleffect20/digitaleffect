import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AgencyDataState, CaseStudy, ServicePackage, PromoBanner, SectorType, PortfolioCategoryFilter, Language, PageRoute, Inquiry, PromoCode, CustomPackagePricingRates, CustomPackageConfig, ClientInvoiceRecord, AccountLedgerEntry, ClientAccountNote, ActivityLogType, ClientMonthlyCycleRecord, AgencyExpense, AgencyTeamMember, InvoicePaymentEntry, PaymentChannel, AdWalletRequest, FinancialAuditEntry, MonthlyCloseRecord, MonthCloseStepKey, FinancialSettings } from '../types';
import { INITIAL_AGENCY_DATA } from '../data/initialData';
import { TRANSLATIONS } from '../translations';
import { DEFAULT_CUSTOM_PACKAGE_RATES } from '../utils/pricingCalculator';
import { parseInvoiceAmount, generateUniqueInvoiceNumber } from '../utils/invoicePdfGenerator';
import { getClientDeliverableTargets } from '../utils/workflowUtils';
import { formatInvoicePeriodLabel, formatOperationCycleBadge } from '../utils/billingPeriodUtils';
import { normalizeArabicCopy } from '../utils/arabicNumbers';
import {
  createEmptyMonthCloseRecord,
  DEFAULT_FINANCIAL_SETTINGS,
  extractMonthKey,
  findDuplicatePaymentReference,
  getExpenseAccrualMonth,
} from '../utils/accountingEngine';
import {
  supabase,
  isSupabaseConfigured,
  fetchPublicCatalogFromSupabase,
  savePublicCatalogToSupabase,
  fetchAdminCrmBundleFromSupabase,
  fetchAdminFinanceOpsFromSupabase,
  saveAdminFinanceOpsToSupabase,
  upsertCrmClientToSupabase,
  deleteCrmClientFromSupabase,
  upsertInvoiceToSupabase,
  deleteInvoiceFromSupabase,
  clearAllCrmRecordsInSupabase,
  migrateFullLocalDataToSupabase,
} from '../lib/supabase';

export const DEFAULT_AGENCY_TEAM_MEMBERS: AgencyTeamMember[] = [
  { id: 'tm-content', name: 'فريق المحتوى (Content)', roleTitle: 'Content Creator', active: true },
  { id: 'tm-design', name: 'فريق التصميم (Design)', roleTitle: 'Visual Designer', active: true },
  { id: 'tm-video', name: 'فريق المونتاج (Reels)', roleTitle: 'Video Editor', active: true },
  { id: 'tm-media', name: 'الميديا باير (Media Buyer)', roleTitle: 'Media Buyer', active: true },
  { id: 'tm-am', name: 'مدير الحسابات (AM)', roleTitle: 'Account Manager', active: true },
];

export const DEFAULT_OPS_ACCESS_CODE = 'DE-OPS-2026';

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
  logInquiryActivity: (
    id: string,
    entry: {
      text: string;
      type?: ActivityLogType;
      author?: string;
      meta?: ClientAccountNote['meta'];
    },
    fallbackLead?: Partial<Inquiry> & { id: string; name: string; phone: string; sector: SectorType }
  ) => Inquiry | null;
  deleteInquiry: (id: string) => void;
  clearAllInquiries: () => void;
  clearAllCrmData: () => Promise<{ success: boolean; rlsBlocked?: boolean; remainingCount?: number; error?: string }>;

  // Invoices Archive & Account Statements
  addInvoice: (invoice: Omit<ClientInvoiceRecord, 'id' | 'createdAt'>, actorName?: string) => ClientInvoiceRecord;
  updateInvoice: (id: string, updates: Partial<ClientInvoiceRecord>, actorName?: string) => void;
  deleteInvoice: (id: string, actorName?: string) => void;
  voidInvoiceWithReversal: (id: string, reason: string, actorName?: string) => boolean;
  markInvoiceAsPaid: (id: string, paymentMethod?: string, actorName?: string) => void;
  recordInvoicePayment: (
    invoiceId: string,
    payment: {
      amount: number;
      date: string;
      method: PaymentChannel;
      methodLabel: string;
      reference?: string;
      notes?: string;
    },
    actorName?: string
  ) => InvoicePaymentEntry | null;
  deleteInvoicePayment: (
    invoiceId: string,
    paymentId: string,
    reason?: string,
    actorName?: string
  ) => boolean;
  // Agency Expenses & Financial Governance
  addExpense: (expense: Omit<AgencyExpense, 'id' | 'createdAt'>, actorName?: string) => AgencyExpense;
  updateExpense: (id: string, updates: Partial<AgencyExpense>, actorName?: string) => void;
  deleteExpense: (id: string, actorName?: string) => void;
  voidExpense: (id: string, reason: string, actorName?: string) => boolean;
  postRecurringExpensesForMonth: (targetMonthKey: string, actorName?: string) => number;
  isMonthClosed: (monthKey?: string | null) => boolean;
  toggleMonthCloseStep: (monthKey: string, stepKey: MonthCloseStepKey, actorName?: string) => void;
  closeFinancialMonth: (monthKey: string, actorName: string, notes?: string) => void;
  reopenFinancialMonth: (monthKey: string, reason: string, actorName: string) => void;
  updateFinancialSettings: (updates: Partial<FinancialSettings>, actorName?: string) => void;
  // Team Members & Portal Role Settings
  addTeamMember: (member: Omit<AgencyTeamMember, 'id'>) => AgencyTeamMember;
  updateTeamMember: (id: string, updates: Partial<AgencyTeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  updatePortalSettings: (settings: { opsAccessCode?: string; opsAccountEmails?: string[] }) => void;
  closeClientBillingCycle: (
    clientId: string,
    options: {
      newStartDate: string;
      newRenewalDate: string;
      newPendingAdCredit?: number;
      issueInvoiceNow?: boolean;
      invoiceTargetCycle?: 'closed' | 'new';
      invoiceContractPeriod?: string;
      cycleNotes?: string;
      actorName?: string;
    }
  ) => { updatedClient: Inquiry | null; createdInvoice: ClientInvoiceRecord | null };
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
  submitAdWalletRequest: (
    clientId: string,
    payload: {
      type: 'topup' | 'spend';
      amount: number;
      platform?: string;
      notes?: string;
      requestedBy: string;
      autoApprove?: boolean;
    }
  ) => {
    ok: boolean;
    request?: AdWalletRequest;
    linkedInvoiceNumber?: string;
    errorAr?: string;
    errorEn?: string;
  };
  reviewAdWalletRequest: (
    clientId: string,
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewerName: string,
    rejectionReason?: string
  ) => {
    ok: boolean;
    request?: AdWalletRequest;
    linkedInvoiceNumber?: string;
    errorAr?: string;
    errorEn?: string;
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
  hydrateTeamWorkspace: (
    sessionToken: string,
    member: AgencyTeamMember
  ) => Promise<{ ok: boolean; error?: string }>;
  clearTeamSession: () => void;
}

const STORAGE_KEY = 'digital_effect_agency_state_v15';
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

/**
 * Normalizes hydrated public catalog state (from localStorage, data-store.json, or Supabase)
 * so legacy cached records immediately adopt updated email casing, Arabic thousands separators,
 * refined Arabic phrasing, unified case study durations, and authentic IPT metrics.
 */
function normalizePublicCatalogState(state: AgencyDataState): AgencyDataState {
  const canonicalIpt = INITIAL_AGENCY_DATA.caseStudies.find((c) => c.id === 'cs-med-ipt');
  const fixArabicText = (text?: string) =>
    text
      ? normalizeArabicCopy(text)
          .replace(/منشور أسبوعياً/g, 'منشور أسبوعي')
          .replace(/B2C و B2B/g, 'B2C وB2B')
      : text;

  const agencyInfo = state.agencyInfo
    ? {
        ...state.agencyInfo,
        email:
          state.agencyInfo.email?.toLowerCase() === 'sales@digitaleffect.net'
            ? 'sales@digitaleffect.net'
            : state.agencyInfo.email,
      }
    : state.agencyInfo;

  const banner = state.banner
    ? {
        ...state.banner,
        text: fixArabicText(state.banner.text) || state.banner.text,
      }
    : state.banner;

  const caseStudies = Array.isArray(state.caseStudies)
    ? state.caseStudies.map((cs) => {
        if (cs.id === 'cs-med-ipt' && canonicalIpt) {
          const hasLegacyPercent = (cs.metrics || []).some(
            (m) =>
              String(m.value || '').includes('43,576') ||
              String(m.hint || '').includes('120,522') ||
              String(m.hintEn || '').includes('120,522')
          );
          if (hasLegacyPercent) {
            return {
              ...cs,
              metrics: canonicalIpt.metrics,
            };
          }
        }
        if (cs.id === 'cs-b2b-siltal-identity') {
          return {
            ...cs,
            duration:
              cs.duration === '3 أشهر (الهوية، تغليف 7 خطوط، والكتالوج)'
                ? '٣ أشهر (الهوية، تغليف ٧ خطوط، والكتالوج)'
                : cs.duration,
            subtitle: cs.subtitle?.replace('لـ 7 خطوط', 'لـ ٧ خطوط'),
            industry: cs.industry?.replace('(6 أكتوبر)', '(٦ أكتوبر)'),
            solution: cs.solution?.replace('على 7 موديلات', 'على ٧ موديلات'),
            metrics: Array.isArray(cs.metrics)
              ? cs.metrics.map((m) => ({
                  ...m,
                  hint: m.hint?.replace('شعار + 7 عبوات', 'شعار + ٧ عبوات'),
                }))
              : cs.metrics,
          };
        }
        return cs;
      })
    : state.caseStudies;

  const packages = Array.isArray(state.packages)
    ? state.packages.map((pkg) => ({
        ...pkg,
        offerNote: fixArabicText(pkg.offerNote),
        tagline: fixArabicText(pkg.tagline) || pkg.tagline,
        frequency: fixArabicText(pkg.frequency),
        features: Array.isArray(pkg.features)
          ? pkg.features.map((f) => fixArabicText(f) || f)
          : pkg.features,
      }))
    : state.packages;

  const promoCodes = Array.isArray(state.promoCodes)
    ? state.promoCodes.map((p) => ({
        ...p,
        title: fixArabicText(p.title) || p.title,
      }))
    : state.promoCodes;

  return {
    ...state,
    agencyInfo,
    banner,
    caseStudies,
    packages,
    promoCodes,
  };
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
      // Clear legacy state keys to avoid stale case studies and old test CRM records
      localStorage.removeItem('digital_effect_agency_state_v9');
      localStorage.removeItem('digital_effect_agency_state_v10');
      localStorage.removeItem('digital_effect_agency_state_v11');
      localStorage.removeItem('digital_effect_agency_state_v12');
      localStorage.removeItem('digital_effect_agency_state_v13');

      // One-time clean migration from v14 -> v15: preserve catalog settings while clearing stale cached test CRM records
      const v14Raw = localStorage.getItem('digital_effect_agency_state_v14');
      if (v14Raw && !localStorage.getItem(STORAGE_KEY)) {
        try {
          const parsedV14 = JSON.parse(v14Raw);
          if (parsedV14 && parsedV14.caseStudies && parsedV14.packages) {
            const migratedClean = normalizePublicCatalogState({
              ...INITIAL_AGENCY_DATA,
              ...parsedV14,
              caseStudies: ensureCanonicalStudies(
                parsedV14.caseStudies.filter(
                  (c: any) => c.id !== 'cs-med-1' && c.id !== 'cs-med-2' && c.id !== 'cs-b2b-1' && c.id !== 'cs-b2b-2' && c.id !== 'cs-b2c-1' && c.id !== 'cs-b2c-2'
                )
              ),
              promoCodes: parsedV14.promoCodes && parsedV14.promoCodes.length > 0 ? parsedV14.promoCodes : (INITIAL_AGENCY_DATA.promoCodes || []),
              customRates: parsedV14.customRates || DEFAULT_CUSTOM_PACKAGE_RATES,
              inquiries: [],
              invoices: [],
            });
            localStorage.removeItem('digital_effect_agency_state_v14');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedClean));
            return migratedClean;
          }
        } catch {}
      }
      localStorage.removeItem('digital_effect_agency_state_v14');

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
          if (!Array.isArray(parsed.inquiries)) {
            parsed.inquiries = [];
          }
          if (!Array.isArray(parsed.invoices)) {
            parsed.invoices = [];
          }
          if (!parsed.customRates) {
            parsed.customRates = DEFAULT_CUSTOM_PACKAGE_RATES;
          }
          return normalizePublicCatalogState(parsed);
        }
      }
    } catch {}
    return normalizePublicCatalogState({
      ...INITIAL_AGENCY_DATA,
      caseStudies: ensureCanonicalStudies(INITIAL_AGENCY_DATA.caseStudies),
      customRates: DEFAULT_CUSTOM_PACKAGE_RATES as unknown as CustomPackagePricingRates,
    });
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
  const isClearingCrmRef = useRef(false);
  const pendingSyncTimerRef = useRef<number | null>(null);
  // Team Bearer token held strictly in memory (never written to localStorage/sessionStorage)
  const teamSessionTokenRef = useRef<string | null>(null);

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
    if (isClearingCrmRef.current) return;
    if (!isSupabaseConfigured || !supabase) {
      setCloudSyncStatus('offline');
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session || isClearingCrmRef.current) return;

      setCloudSyncStatus('syncing');
      const [catRes, crmRes, finOpsRes] = await Promise.all([
        fetchPublicCatalogFromSupabase(),
        fetchAdminCrmBundleFromSupabase(),
        fetchAdminFinanceOpsFromSupabase(),
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

        // Hydrate private admin finance & ops settings if present in Supabase
        if (finOpsRes.snapshot) {
          if (Array.isArray(finOpsRes.snapshot.expenses)) {
            next.expenses = finOpsRes.snapshot.expenses;
          }
          if (Array.isArray(finOpsRes.snapshot.teamMembers) && finOpsRes.snapshot.teamMembers.length > 0) {
            next.teamMembers = finOpsRes.snapshot.teamMembers;
          }
          if (finOpsRes.snapshot.opsAccessCode) {
            next.opsAccessCode = finOpsRes.snapshot.opsAccessCode;
          }
          if (Array.isArray(finOpsRes.snapshot.opsAccountEmails)) {
            next.opsAccountEmails = finOpsRes.snapshot.opsAccountEmails;
          }
          if (Array.isArray(finOpsRes.snapshot.financialAuditLog)) {
            next.financialAuditLog = finOpsRes.snapshot.financialAuditLog;
          }
          if (finOpsRes.snapshot.closedMonths && typeof finOpsRes.snapshot.closedMonths === 'object') {
            next.closedMonths = finOpsRes.snapshot.closedMonths;
          }
          if (finOpsRes.snapshot.financialSettings) {
            next.financialSettings = {
              ...DEFAULT_FINANCIAL_SETTINGS,
              ...finOpsRes.snapshot.financialSettings,
            };
          }
        }

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

        // Hydrate CRM clients from Supabase (and drop old sample seed entries)
        const legacySampleClientIds = new Set(['inq-client-101', 'inq-client-102', 'inq-client-103']);
        const legacySampleInvoiceIds = new Set(['inv-rec-101-nov', 'inv-rec-101-oct', 'inv-rec-102-nov', 'inv-rec-103-oct']);

        const cloudClientsFiltered = crmRes.clients.filter((c) => !legacySampleClientIds.has(c.id));
        if (cloudClientsFiltered.length > 0) {
          const cloudIds = new Set(cloudClientsFiltered.map((c) => c.id));
          const localOnlyNonSample = (prev.inquiries || []).filter(
            (c) => !cloudIds.has(c.id) && !sampleClientIds.has(c.id) && !legacySampleClientIds.has(c.id)
          );
          next.inquiries = [...cloudClientsFiltered, ...localOnlyNonSample];
        } else if (!crmRes.error) {
          next.inquiries = (prev.inquiries || []).filter(
            (c) => !sampleClientIds.has(c.id) && !legacySampleClientIds.has(c.id)
          );
        }

        // Hydrate invoices from Supabase (and drop old sample seed entries)
        const cloudInvoicesFiltered = crmRes.invoices.filter((i) => !legacySampleInvoiceIds.has(i.id));
        if (cloudInvoicesFiltered.length > 0) {
          const cloudInvIds = new Set(cloudInvoicesFiltered.map((i) => i.id));
          const localOnlyInvoices = (prev.invoices || []).filter(
            (i) => !cloudInvIds.has(i.id) && !sampleInvoiceIds.has(i.id) && !legacySampleInvoiceIds.has(i.id)
          );
          next.invoices = [...cloudInvoicesFiltered, ...localOnlyInvoices];
        } else if (!crmRes.error) {
          next.invoices = (prev.invoices || []).filter(
            (i) => !sampleInvoiceIds.has(i.id) && !legacySampleInvoiceIds.has(i.id)
          );
        }

        return normalizePublicCatalogState(next);
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

  const postTeamWorkspaceAction = (payload: Record<string, any>) => {
    const token = teamSessionTokenRef.current;
    if (!token) return;
    fetch('/api/team/workspace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          setLastCloudSyncAt(new Date().toISOString());
          setCloudSyncStatus('synced');
        }
      })
      .catch(() => {});
  };

  const hydrateTeamWorkspace = async (
    sessionToken: string,
    member: AgencyTeamMember
  ): Promise<{ ok: boolean; error?: string }> => {
    teamSessionTokenRef.current = sessionToken;
    try {
      setCloudSyncStatus('syncing');
      const res = await fetch('/api/team/workspace', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (!res.ok) {
        setCloudSyncStatus('error');
        return { ok: false, error: `HTTP ${res.status}` };
      }
      const payload = (await res.json()) as {
        ok?: boolean;
        member?: AgencyTeamMember;
        teamMembers?: AgencyTeamMember[];
        clients?: Inquiry[];
        invoices?: ClientInvoiceRecord[];
        expenses?: AgencyExpense[];
        financialAuditLog?: FinancialAuditEntry[];
        closedMonths?: Record<string, MonthlyCloseRecord>;
        financialSettings?: FinancialSettings;
      };
      if (!payload?.ok) {
        setCloudSyncStatus('error');
        return { ok: false };
      }

      setData((prev) => {
        const next: AgencyDataState = { ...prev };
        if (Array.isArray(payload.teamMembers) && payload.teamMembers.length > 0) {
          next.teamMembers = payload.teamMembers;
        } else if (member?.id) {
          const exists = (prev.teamMembers || []).some((m) => m.id === member.id);
          next.teamMembers = exists
            ? (prev.teamMembers || []).map((m) => (m.id === member.id ? { ...m, ...member } : m))
            : [...(prev.teamMembers || []), member];
        }
        if (Array.isArray(payload.clients)) {
          next.inquiries = payload.clients;
        }
        if (Array.isArray(payload.invoices)) {
          next.invoices = payload.invoices;
        }
        if (Array.isArray(payload.expenses)) {
          next.expenses = payload.expenses;
        }
        if (Array.isArray(payload.financialAuditLog)) {
          next.financialAuditLog = payload.financialAuditLog;
        }
        if (payload.closedMonths && typeof payload.closedMonths === 'object') {
          next.closedMonths = payload.closedMonths;
        }
        if (payload.financialSettings) {
          next.financialSettings = {
            ...DEFAULT_FINANCIAL_SETTINGS,
            ...payload.financialSettings,
          };
        }
        return normalizePublicCatalogState(next);
      });

      setLastCloudSyncAt(new Date().toISOString());
      setCloudSyncStatus('synced');
      return { ok: true };
    } catch (err: any) {
      setCloudSyncStatus('error');
      return { ok: false, error: err?.message || 'Workspace hydration failed' };
    }
  };

  const clearTeamSession = () => {
    teamSessionTokenRef.current = null;
  };

  // Fetch persisted data from server AND Supabase on mount
  useEffect(() => {
    fetch('/api/agency-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (isClearingCrmRef.current) return;
        if (serverData && serverData.caseStudies && Array.isArray(serverData.caseStudies)) {
          const verifiedStudies = ensureCanonicalStudies(serverData.caseStudies);
          const sanitizedData = {
            ...serverData,
            caseStudies: verifiedStudies,
          };
          setData((prev) => {
            if (isClearingCrmRef.current) return prev;
            const sampleIds = new Set((INITIAL_AGENCY_DATA.inquiries || []).map((c) => c.id));
            const prevInq = prev.inquiries || [];
            const prevIds = new Set(prevInq.map((c) => c.id));
            const serverExtras = Array.isArray(serverData.inquiries)
              ? serverData.inquiries.filter((c: any) => c?.id && !prevIds.has(c.id) && !sampleIds.has(c.id))
              : [];
            return normalizePublicCatalogState({
              ...sanitizedData,
              inquiries: [...serverExtras, ...prevInq],
            });
          });
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
              setData((prev) =>
                normalizePublicCatalogState({
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
                })
              );
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

    if (pendingSyncTimerRef.current !== null) {
      window.clearTimeout(pendingSyncTimerRef.current);
      pendingSyncTimerRef.current = null;
    }

    // Server-side persistence so all visitors and published sites see changes
    pendingSyncTimerRef.current = window.setTimeout(() => {
      pendingSyncTimerRef.current = null;
      if (isClearingCrmRef.current) return;
      // Team member sessions persist strictly through /api/team/workspace with RBAC checks
      if (!teamSessionTokenRef.current) {
        fetch('/api/agency-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch((err) => {
          console.warn('Server sync notice:', err);
        });
      }

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

    return () => {
      if (pendingSyncTimerRef.current !== null) {
        window.clearTimeout(pendingSyncTimerRef.current);
        pendingSyncTimerRef.current = null;
      }
    };
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

  const getLeadStatusLabel = (status?: Inquiry['status']): string => {
    switch (status) {
      case 'new':
        return 'جديد (لم يتم الرد)';
      case 'contacted':
        return 'قيد التواصل';
      case 'closed':
        return 'تم التعاقد';
      case 'cancelled':
        return 'ملغي';
      default:
        return status || 'جديد';
    }
  };

  const getContractStatusLabel = (status?: Inquiry['contractStatus']): string => {
    switch (status) {
      case 'active':
        return 'نشط ومفعل';
      case 'renewal_due':
        return 'قيد التجديد';
      case 'paused':
        return 'موقوف مؤقتاً';
      case 'completed':
        return 'مكتمل / منتهي';
      default:
        return status || 'نشط';
    }
  };

  const getPaymentStatusLabel = (status?: Inquiry['paymentStatus']): string => {
    switch (status) {
      case 'paid':
        return 'مدفوع بالكامل';
      case 'partially_paid':
        return 'دفعة مقدمة 50%';
      case 'pending':
        return 'قيد التحصيل';
      case 'overdue':
        return 'متأخر عن السداد';
      default:
        return status || 'قيد التحصيل';
    }
  };

  const makeActivityNote = (
    text: string,
    type: ActivityLogType,
    author = 'إدارة النظام',
    meta?: ClientAccountNote['meta']
  ): ClientAccountNote => ({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    createdAt: new Date().toISOString(),
    author,
    type,
    ...(meta ? { meta } : {}),
  });

  const buildMergedInquiry = (existing: Inquiry, updates: Partial<Inquiry>): Inquiry => {
    const merged: Inquiry = { ...existing, ...updates };
    const autoEntries: ClientAccountNote[] = [];

    // 1. Track Lead / Deal Status transitions automatically
    if (updates.status && updates.status !== existing.status) {
      const fromLabel = getLeadStatusLabel(existing.status);
      const toLabel = getLeadStatusLabel(updates.status);
      autoEntries.push(
        makeActivityNote(
          updates.status === 'closed'
            ? `تم تغيير حالة الطلب من «${fromLabel}» إلى «${toLabel}» وتحويل الحساب لقسم العملاء والتعاقدات.`
            : `تم تغيير حالة الطلب من «${fromLabel}» إلى «${toLabel}».`,
          'status_change',
          'إدارة الـ CRM',
          { fromStatus: fromLabel, toStatus: toLabel, fieldChanged: 'status' }
        )
      );
    }

    // 2. Track Contract status transitions
    if (
      updates.contractStatus &&
      existing.contractStatus &&
      updates.contractStatus !== existing.contractStatus
    ) {
      const fromLabel = getContractStatusLabel(existing.contractStatus);
      const toLabel = getContractStatusLabel(updates.contractStatus);
      autoEntries.push(
        makeActivityNote(
          `تحديث حالة التعاقد من «${fromLabel}» إلى «${toLabel}».`,
          'status_change',
          'مدير الحساب',
          { fromStatus: fromLabel, toStatus: toLabel, fieldChanged: 'contractStatus' }
        )
      );
    }

    // 3. Track Payment status transitions (avoid duplicating if caller already attached a payment note in this update)
    const callerAttachedPaymentNote =
      Array.isArray(updates.clientNotes) &&
      updates.clientNotes.length > (existing.clientNotes?.length || 0) &&
      updates.clientNotes[0]?.type === 'payment';

    if (
      !callerAttachedPaymentNote &&
      updates.paymentStatus &&
      existing.paymentStatus &&
      updates.paymentStatus !== existing.paymentStatus
    ) {
      const fromLabel = getPaymentStatusLabel(existing.paymentStatus);
      const toLabel = getPaymentStatusLabel(updates.paymentStatus);
      autoEntries.push(
        makeActivityNote(
          `تحديث حالة السداد المالي من «${fromLabel}» إلى «${toLabel}».`,
          'payment',
          'الإدارة المالية',
          { fromStatus: fromLabel, toStatus: toLabel, fieldChanged: 'paymentStatus' }
        )
      );
    }

    // 4. Track Package / Budget edits
    if (
      (updates.packageName !== undefined && updates.packageName !== existing.packageName) ||
      (updates.budget !== undefined && updates.budget !== existing.budget)
    ) {
      const parts: string[] = [];
      if (updates.packageName !== undefined && updates.packageName !== existing.packageName) {
        parts.push(`الباقة: «${updates.packageName}»`);
      }
      if (updates.budget !== undefined && updates.budget !== existing.budget) {
        parts.push(`التكلفة: «${updates.budget}»`);
      }
      autoEntries.push(
        makeActivityNote(
          `تم تعديل بيانات التعاقد والباقة (${parts.join(' • ')}).`,
          'update',
          'مدير الحساب',
          { fieldChanged: 'package' }
        )
      );
    }

    // 5. Track Deliverable counter progress
    const postsDelta =
      updates.postsDelivered !== undefined ? updates.postsDelivered - (existing.postsDelivered ?? 0) : 0;
    const reelsDelta =
      updates.reelsDelivered !== undefined ? updates.reelsDelivered - (existing.reelsDelivered ?? 0) : 0;
    const storiesDelta =
      updates.storiesDelivered !== undefined ? updates.storiesDelivered - (existing.storiesDelivered ?? 0) : 0;

    if (postsDelta !== 0 || reelsDelta !== 0 || storiesDelta !== 0) {
      const items: string[] = [];
      if (postsDelta !== 0) items.push(`البوستات: ${merged.postsDelivered ?? 0}`);
      if (reelsDelta !== 0) items.push(`الريلز: ${merged.reelsDelivered ?? 0}`);
      if (storiesDelta !== 0) items.push(`الستوريز: ${merged.storiesDelivered ?? 0}`);
      autoEntries.push(
        makeActivityNote(
          `تحديث رصيد المخرجات المسلمة (${items.join(' • ')}).`,
          'deliverable',
          'فريق المحتوى'
        )
      );
    }

    if (updates.status === 'closed' || (merged.status === 'closed' && !merged.contractStartDate)) {
      const today = new Date().toISOString().split('T')[0];
      const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      merged.contractStartDate = merged.contractStartDate || today;
      merged.renewalDate = merged.renewalDate || renewal;
      merged.contractStatus = merged.contractStatus || 'active';
      merged.paymentStatus = merged.paymentStatus || 'pending';
      merged.billingCycle = merged.billingCycle || 'monthly';
      merged.postsDelivered = merged.postsDelivered ?? 0;
      merged.reelsDelivered = merged.reelsDelivered ?? 0;
      merged.storiesDelivered = merged.storiesDelivered ?? 0;
      merged.currentWorkflowDay = merged.currentWorkflowDay || 1;
      merged.todayTaskTitle = merged.todayTaskTitle ?? '';
      if (!merged.workflowStages || merged.workflowStages.length === 0) {
        merged.workflowStages = [
          { id: 'content_creator', title: 'Content Creator', status: 'pending' },
          { id: 'visual_design', title: 'Visual Design', status: 'pending' },
          { id: 'final_design', title: 'Final Design', status: 'pending' },
          { id: 'client_approve', title: 'Client Approve', status: 'pending' },
          { id: 'publish', title: 'Publish', status: 'pending' },
        ];
      }
    }

    if (autoEntries.length > 0) {
      const baseNotes = Array.isArray(updates.clientNotes)
        ? updates.clientNotes
        : (existing.clientNotes || []);
      merged.clientNotes = [...autoEntries, ...baseNotes];
    }

    return merged;
  };

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Inquiry['status'] }): Inquiry => {
    const isClosed = inquiryData.status === 'closed';
    const today = new Date().toISOString().split('T')[0];
    const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const initialActivity: ClientAccountNote = makeActivityNote(
      isClosed
        ? `تم تسجيل العميل وتأكيد التعاقد على باقة (${inquiryData.packageName || 'باقة مخصصة'}) وبدء خطة العمل.`
        : `تم تسجيل طلب جديد للعميل (${inquiryData.name})${inquiryData.packageName ? ` بخصوص باقة: ${inquiryData.packageName}` : ''}.`,
      'status_change',
      'إدارة الـ CRM',
      { toStatus: getLeadStatusLabel(inquiryData.status || 'new'), fieldChanged: 'created' }
    );

    const existingProvidedNotes = Array.isArray(inquiryData.clientNotes) ? inquiryData.clientNotes : [];

    const newInquiry: Inquiry = {
      ...inquiryData,
      id: inquiryData.id || `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: inquiryData.status || 'new',
      clientNotes: existingProvidedNotes.length > 0 ? existingProvidedNotes : [initialActivity],
      ...(isClosed ? {
        contractStartDate: inquiryData.contractStartDate || today,
        renewalDate: inquiryData.renewalDate || renewal,
        contractStatus: inquiryData.contractStatus || 'active',
        paymentStatus: inquiryData.paymentStatus || 'pending',
        billingCycle: inquiryData.billingCycle || 'monthly',
        postsDelivered: inquiryData.postsDelivered ?? 0,
        reelsDelivered: inquiryData.reelsDelivered ?? 0,
        storiesDelivered: inquiryData.storiesDelivered ?? 0,
        currentWorkflowDay: inquiryData.currentWorkflowDay || 1,
        todayTaskTitle: inquiryData.todayTaskTitle ?? '',
        workflowStages: inquiryData.workflowStages || [
          { id: 'content_creator', title: 'Content Creator', status: 'pending' },
          { id: 'visual_design', title: 'Visual Design', status: 'pending' },
          { id: 'final_design', title: 'Final Design', status: 'pending' },
          { id: 'client_approve', title: 'Client Approve', status: 'pending' },
          { id: 'publish', title: 'Publish', status: 'pending' },
        ],
      } : {})
    };
    setData((prev) => ({
      ...prev,
      inquiries: [newInquiry, ...(prev.inquiries || [])],
    }));

    if (teamSessionTokenRef.current) {
      postTeamWorkspaceAction({ action: 'upsert_client', client: newInquiry });
    } else if (isSupabaseConfigured && supabase) {
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

    if (mergedForSync && teamSessionTokenRef.current) {
      postTeamWorkspaceAction({ action: 'upsert_client', client: mergedForSync });
    } else if (mergedForSync && isSupabaseConfigured && supabase) {
      upsertCrmClientToSupabase(mergedForSync).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }
  };

  const updateInquiryStatus = (id: string, status: Inquiry['status']) => {
    updateInquiry(id, { status });
  };

  const logInquiryActivity = (
    id: string,
    entry: {
      text: string;
      type?: ActivityLogType;
      author?: string;
      meta?: ClientAccountNote['meta'];
    },
    fallbackLead?: Partial<Inquiry> & { id: string; name: string; phone: string; sector: SectorType }
  ): Inquiry | null => {
    const newEntry = makeActivityNote(
      entry.text,
      entry.type || 'note',
      entry.author || (language === 'ar' ? 'مدير الحساب' : 'Account Manager'),
      entry.meta
    );

    const existing = (dataRef.current.inquiries || []).find((item) => item.id === id);
    if (existing) {
      const updatedNotes = [newEntry, ...(existing.clientNotes || [])];
      const merged = { ...existing, clientNotes: updatedNotes };
      setData((prev) => ({
        ...prev,
        inquiries: (prev.inquiries || []).map((item) =>
          item.id === id ? { ...item, clientNotes: [newEntry, ...(item.clientNotes || [])] } : item
        ),
      }));
      if (teamSessionTokenRef.current) {
        postTeamWorkspaceAction({ action: 'upsert_client', client: merged });
      } else if (isSupabaseConfigured && supabase) {
        upsertCrmClientToSupabase(merged).then((res) => {
          if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
          else if (res.success) setLastCloudSyncAt(new Date().toISOString());
        });
      }
      return merged;
    }

    if (fallbackLead) {
      const created: Inquiry = {
        status: fallbackLead.status || 'new',
        createdAt: fallbackLead.createdAt || new Date().toISOString(),
        ...fallbackLead,
        id: fallbackLead.id || id,
        clientNotes: [newEntry, ...(fallbackLead.clientNotes || [])],
      };
      setData((prev) => ({
        ...prev,
        inquiries: [created, ...(prev.inquiries || [])],
      }));
      if (teamSessionTokenRef.current) {
        postTeamWorkspaceAction({ action: 'upsert_client', client: created });
      } else if (isSupabaseConfigured && supabase) {
        upsertCrmClientToSupabase(created).then((res) => {
          if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
          else if (res.success) setLastCloudSyncAt(new Date().toISOString());
        });
      }
      return created;
    }

    return null;
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

  const clearAllCrmData = async (): Promise<{
    success: boolean;
    rlsBlocked?: boolean;
    remainingCount?: number;
    error?: string;
  }> => {
    isClearingCrmRef.current = true;
    if (pendingSyncTimerRef.current !== null) {
      window.clearTimeout(pendingSyncTimerRef.current);
      pendingSyncTimerRef.current = null;
    }

    const emptyCrmState: AgencyDataState = {
      ...dataRef.current,
      inquiries: [],
      invoices: [],
    };
    dataRef.current = emptyCrmState;
    setData(emptyCrmState);
    safeSaveToLocalStorage(emptyCrmState);

    try {
      await fetch('/api/agency-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emptyCrmState),
      });
    } catch {
      // Server sync best effort
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const res = await clearAllCrmRecordsInSupabase();
        if (!res.success) {
          return res;
        }
        setLastCloudSyncAt(new Date().toISOString());
        setCloudSyncStatus('synced');
      }
      return { success: true, remainingCount: 0 };
    } finally {
      window.setTimeout(() => {
        isClearingCrmRef.current = false;
      }, 1500);
    }
  };

  // Sync helper for private admin finance & ops settings
  const syncAdminFinanceOpsSnapshot = (nextState: AgencyDataState) => {
    if (teamSessionTokenRef.current) {
      postTeamWorkspaceAction({
        action: 'save_finance_ops',
        financeOps: {
          expenses: nextState.expenses || [],
          financialAuditLog: nextState.financialAuditLog || [],
          closedMonths: nextState.closedMonths || {},
          financialSettings: nextState.financialSettings || DEFAULT_FINANCIAL_SETTINGS,
        },
      });
      return;
    }
    if (isSupabaseConfigured && supabase) {
      saveAdminFinanceOpsToSupabase({
        expenses: nextState.expenses || [],
        teamMembers: nextState.teamMembers || DEFAULT_AGENCY_TEAM_MEMBERS,
        opsAccessCode: nextState.opsAccessCode || DEFAULT_OPS_ACCESS_CODE,
        opsAccountEmails: nextState.opsAccountEmails || [],
        financialAuditLog: nextState.financialAuditLog || [],
        closedMonths: nextState.closedMonths || {},
        financialSettings: nextState.financialSettings || DEFAULT_FINANCIAL_SETTINGS,
      }).then((res) => {
        if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }
  };

  const appendFinancialAudit = (
    entry: Omit<FinancialAuditEntry, 'id' | 'timestamp'>
  ) => {
    const newAudit: FinancialAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setData((prev) => {
      const next: AgencyDataState = {
        ...prev,
        financialAuditLog: [newAudit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  const isMonthClosed = (monthKey?: string | null): boolean => {
    if (!monthKey) return false;
    const normalized = extractMonthKey(monthKey) || monthKey;
    return dataRef.current.closedMonths?.[normalized]?.status === 'closed';
  };

  // Invoices Archive Actions
  const addInvoice = (
    invoiceData: Omit<ClientInvoiceRecord, 'id' | 'createdAt'>,
    actorName = 'الإدارة المالية'
  ): ClientInvoiceRecord => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const invoiceNumber = invoiceData.invoiceNumber || `DE-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String((dataRef.current.invoices?.length || 0) + 101).slice(-3)}`;
    const newInvoice: ClientInvoiceRecord = {
      ...invoiceData,
      adFundsTreatment: invoiceData.adFundsTreatment || dataRef.current.financialSettings?.adFundsDefaultPolicy || 'client_passthrough',
      paymentStatus: invoiceData.paymentStatus || 'pending',
      id,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      invoices: [newInvoice, ...(prev.invoices || [])],
    }));

    appendFinancialAudit({
      actorName: resolvedActor,
      entityType: 'invoice',
      entityId: newInvoice.id,
      entityLabel: `${newInvoice.invoiceNumber} — ${newInvoice.clientCompany || newInvoice.clientName}`,
      action: 'create',
      afterSummary: `أتعاب: ${newInvoice.retainerAmount.toLocaleString()} ج.م | رصيد إعلاني: ${(newInvoice.adCreditAmount || 0).toLocaleString()} ج.م${newInvoice.taxAmount ? ` | ضرائب: ${newInvoice.taxAmount.toLocaleString()} ج.م` : ''} | الإجمالي: ${newInvoice.grandTotal.toLocaleString()} ج.م${newInvoice.isDraft ? ' (مسودة)' : ''}`,
    });

    if (teamSessionTokenRef.current) {
      postTeamWorkspaceAction({ action: 'upsert_invoice', invoice: newInvoice });
    } else if (isSupabaseConfigured && supabase) {
      upsertInvoiceToSupabase(newInvoice).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }

    // If client exists and invoice is not a draft, append tracking note to client profile
    if (newInvoice.clientId && !newInvoice.isDraft) {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === newInvoice.clientId);
      if (client) {
        const noteText = `تم إصدار فاتورة جديدة برقم ${newInvoice.invoiceNumber} بقيمة إجمالية ${newInvoice.grandTotal.toLocaleString()} ج.م (${newInvoice.packageName})${newInvoice.adCreditAmount ? ` تتضمن رصيد إعلاني ${newInvoice.adCreditAmount.toLocaleString()} ج.م` : ''}.`;
        const updatedNotes: ClientAccountNote[] = [
          makeActivityNote(noteText, 'invoice', resolvedActor, {
            invoiceNumber: newInvoice.invoiceNumber,
          }),
          ...(client.clientNotes || []),
        ];
        updateInquiry(client.id, {
          clientNotes: updatedNotes,
          paymentStatus: newInvoice.paymentStatus === 'paid' ? 'paid' : 'pending',
          pendingInvoiceAdCredit: newInvoice.adCreditAmount ? newInvoice.adCreditAmount : client.pendingInvoiceAdCredit,
        });
      }
    }

    return newInvoice;
  };

  const updateInvoice = (
    id: string,
    updates: Partial<ClientInvoiceRecord>,
    actorName = 'الإدارة المالية'
  ) => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const existingInv = (dataRef.current.invoices || []).find((inv) => inv.id === id);
    const updatedInv = existingInv ? { ...existingInv, ...updates } : null;

    setData((prev) => ({
      ...prev,
      invoices: (prev.invoices || []).map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    }));

    if (existingInv && updatedInv) {
      const changedKeys = Object.keys(updates).filter(
        (k) => (existingInv as any)[k] !== (updatedInv as any)[k]
      );
      if (changedKeys.length > 0 && updates.paymentStatus !== 'cancelled') {
        appendFinancialAudit({
          actorName: resolvedActor,
          entityType: 'invoice',
          entityId: existingInv.id,
          entityLabel: `${existingInv.invoiceNumber} — ${existingInv.clientCompany || existingInv.clientName}`,
          action: 'update',
          beforeSummary: `الحالة: ${existingInv.paymentStatus} | المدفوع: ${(existingInv.paidAmount || 0).toLocaleString()} ج.م`,
          afterSummary: `الحالة: ${updatedInv.paymentStatus} | المدفوع: ${(updatedInv.paidAmount || 0).toLocaleString()} ج.م`,
        });
      }
    }

    if (
      updatedInv &&
      updates.paymentStatus &&
      updates.paymentStatus !== existingInv?.paymentStatus &&
      updates.paymentStatus !== 'paid' &&
      updates.paymentStatus !== 'cancelled' &&
      updatedInv.clientId
    ) {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === updatedInv.clientId);
      if (client) {
        updateInquiry(client.id, {
          paymentStatus: updates.paymentStatus,
        });
      }
    }

    if (updatedInv && teamSessionTokenRef.current) {
      postTeamWorkspaceAction({ action: 'upsert_invoice', invoice: updatedInv });
    } else if (updatedInv && isSupabaseConfigured && supabase) {
      upsertInvoiceToSupabase(updatedInv).then((res) => {
        if (res.migrationNeeded) setSupabaseMigrationNeeded(true);
        else if (res.success) setLastCloudSyncAt(new Date().toISOString());
      });
    }
  };

  const deleteInvoice = (id: string, actorName = 'الإدارة المالية') => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const existingInv = (dataRef.current.invoices || []).find((inv) => inv.id === id);
    setData((prev) => ({
      ...prev,
      invoices: (prev.invoices || []).filter((inv) => inv.id !== id),
    }));
    if (existingInv) {
      appendFinancialAudit({
        actorName: resolvedActor,
        entityType: 'invoice',
        entityId: existingInv.id,
        entityLabel: `${existingInv.invoiceNumber} — ${existingInv.clientCompany || existingInv.clientName}`,
        action: 'delete_draft',
        beforeSummary: `حذف مسودة فاتورة بقيمة ${existingInv.grandTotal.toLocaleString()} ج.م`,
      });
    }
    if (teamSessionTokenRef.current) {
      postTeamWorkspaceAction({ action: 'delete_invoice', invoiceId: id });
    } else if (isSupabaseConfigured && supabase) {
      deleteInvoiceFromSupabase(id).catch(() => {});
    }
  };

  // Accounting Control: Void/Cancel issued invoice with reversal trail (never erases historical audit)
  const voidInvoiceWithReversal = (
    id: string,
    reason: string,
    actorName = 'الإدارة المالية'
  ): boolean => {
    const existingInv = (dataRef.current.invoices || []).find((inv) => inv.id === id);
    if (!existingInv) return false;
    const cleanReason = reason.trim();
    if (!cleanReason) return false;

    const nowIso = new Date().toISOString();
    updateInvoice(id, {
      paymentStatus: 'cancelled',
      cancellationReason: cleanReason,
      cancelledAt: nowIso,
      cancelledBy: actorName,
      notes: [existingInv.notes, `[مستند إلغاء عكسي — ${nowIso.split('T')[0]} — ${actorName}]: ${cleanReason}`]
        .filter(Boolean)
        .join('\n'),
    });

    appendFinancialAudit({
      actorName,
      entityType: 'invoice',
      entityId: existingInv.id,
      entityLabel: `${existingInv.invoiceNumber} — ${existingInv.clientCompany || existingInv.clientName}`,
      action: 'void',
      beforeSummary: `فاتورة فعالة (${existingInv.paymentStatus}) بقيمة ${existingInv.grandTotal.toLocaleString()} ج.م`,
      afterSummary: `ملغاة بمستند عكسي موثق (0 ج.م إيراد محتسب)`,
      reason: cleanReason,
    });

    if (existingInv.clientId) {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === existingInv.clientId);
      if (client) {
        updateInquiry(client.id, {
          clientNotes: [
            makeActivityNote(
              `تم إلغاء الفاتورة ${existingInv.invoiceNumber} بمستند عكسي موثق (${actorName}) — السبب: ${cleanReason}`,
              'invoice',
              actorName,
              { invoiceNumber: existingInv.invoiceNumber }
            ),
            ...(client.clientNotes || []),
          ],
        });
      }
    }

    return true;
  };

  const markInvoiceAsPaid = (
    id: string,
    paymentMethod = 'إنستاباي / محفظة إلكترونية',
    actorName = 'الإدارة المالية'
  ) => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const today = new Date().toISOString().split('T')[0];
    const invoice = (dataRef.current.invoices || []).find((inv) => inv.id === id);
    if (!invoice) return;

    const existingPayments = invoice.payments || [];
    const paidSoFar =
      invoice.paidAmount !== undefined
        ? invoice.paidAmount
        : existingPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const remainingToSettle = Math.max(0, (Number(invoice.grandTotal) || 0) - paidSoFar);

    let nextPayments = existingPayments;
    if (remainingToSettle > 0) {
      const now = new Date();
      const rcpNum = `DE-RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        Math.floor(100 + Math.random() * 899)
      )}`;
      nextPayments = [
        ...existingPayments,
        {
          id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          receiptNumber: rcpNum,
          amount: remainingToSettle,
          date: today,
          method: 'bank_transfer',
          methodLabel: paymentMethod,
          notes: paidSoFar > 0 ? 'سداد المتبقي بالكامل' : 'سداد كامل الفاتورة',
          createdAt: now.toISOString(),
        },
      ];
    }

    updateInvoice(
      id,
      {
        paymentStatus: 'paid',
        paidAt: today,
        paymentMethod,
        paidAmount: invoice.grandTotal,
        payments: nextPayments,
      },
      resolvedActor
    );

    // If invoice had an ad credit amount and wasn't already paid, credit it to client's adCreditBalance
    if (invoice.clientId && invoice.paymentStatus !== 'paid') {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === invoice.clientId);
      if (client) {
        const adAmt = invoice.adCreditAmount || 0;
        const newBalance = (client.adCreditBalance || 0) + adAmt;
        const newFundedTotal = (client.adCreditFundedTotal || 0) + adAmt;
        const pendingRemainder = Math.max(0, (client.pendingInvoiceAdCredit || 0) - adAmt);

        const updatedNotes = [
          makeActivityNote(
            `تم تحصيل الفاتورة ${invoice.invoiceNumber} بقيمة ${invoice.grandTotal.toLocaleString()} ج.م${adAmt > 0 ? ` وتم إيداع ${adAmt.toLocaleString()} ج.م في محفظة الإعلانات الممولة (الرصيد المتاح: ${newBalance.toLocaleString()} ج.م).` : '.'}`,
            'payment',
            resolvedActor,
            { invoiceNumber: invoice.invoiceNumber }
          ),
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

  // Record a partial or final settlement payment against an invoice & generate official Receipt #
  const recordInvoicePayment = (
    invoiceId: string,
    paymentInput: {
      amount: number;
      date: string;
      method: PaymentChannel;
      methodLabel: string;
      reference?: string;
      notes?: string;
    },
    actorName = 'الإدارة المالية'
  ): InvoicePaymentEntry | null => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const invoice = (dataRef.current.invoices || []).find((inv) => inv.id === invoiceId);
    const cleanAmount = Math.max(0, Number(paymentInput.amount) || 0);
    if (!invoice || cleanAmount <= 0) return null;

    const duplicateRef = findDuplicatePaymentReference(
      dataRef.current.invoices || [],
      paymentInput.reference
    );
    if (duplicateRef) {
      return null;
    }

    const now = new Date();
    const existingPayments = invoice.payments || [];
    const totalPaymentsCount = (dataRef.current.invoices || []).reduce(
      (sum, inv) => sum + (inv.payments?.length || 0),
      0
    );
    const receiptNumber = `DE-RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      totalPaymentsCount + 101
    ).padStart(3, '0')}`;

    const newEntry: InvoicePaymentEntry = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      receiptNumber,
      amount: cleanAmount,
      date: paymentInput.date || now.toISOString().split('T')[0],
      method: paymentInput.method,
      methodLabel: paymentInput.methodLabel,
      reference: paymentInput.reference?.trim() || undefined,
      notes: paymentInput.notes?.trim() || undefined,
      createdAt: now.toISOString(),
    };

    const nextPayments = [...existingPayments, newEntry];
    const nextPaidAmount = nextPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const isNowFullyPaid = nextPaidAmount >= invoice.grandTotal;
    const wasAlreadyPaid = invoice.paymentStatus === 'paid';
    const nextStatus: ClientInvoiceRecord['paymentStatus'] = isNowFullyPaid
      ? 'paid'
      : nextPaidAmount > 0
      ? 'partially_paid'
      : 'pending';

    updateInvoice(
      invoice.id,
      {
        payments: nextPayments,
        paidAmount: Math.min(invoice.grandTotal, nextPaidAmount),
        paymentStatus: nextStatus,
        paymentMethod: newEntry.methodLabel,
        paidAt: isNowFullyPaid ? newEntry.date : invoice.paidAt,
      },
      resolvedActor
    );

    appendFinancialAudit({
      actorName: resolvedActor,
      entityType: 'payment',
      entityId: newEntry.id,
      entityLabel: `${receiptNumber} (${invoice.invoiceNumber})`,
      action: 'payment_recorded',
      afterSummary: `دفعة ${cleanAmount.toLocaleString()} ج.م عبر ${newEntry.methodLabel}${newEntry.reference ? ` — مرجع: ${newEntry.reference}` : ''}`,
    });

    if (invoice.clientId) {
      const client = (dataRef.current.inquiries || []).find((c) => c.id === invoice.clientId);
      if (client) {
        const remainingAfter = Math.max(0, invoice.grandTotal - nextPaidAmount);
        const adAmt = isNowFullyPaid && !wasAlreadyPaid ? (invoice.adCreditAmount || 0) : 0;
        const newBalance = (client.adCreditBalance || 0) + adAmt;
        const newFundedTotal = (client.adCreditFundedTotal || 0) + adAmt;
        const pendingRemainder =
          adAmt > 0
            ? Math.max(0, (client.pendingInvoiceAdCredit || 0) - adAmt)
            : client.pendingInvoiceAdCredit;

        const noteText = isNowFullyPaid
          ? `تم استلام دفعة بمبلغ ${cleanAmount.toLocaleString()} ج.م (${newEntry.methodLabel}) بإيصال رقم ${receiptNumber} — تم سداد الفاتورة ${invoice.invoiceNumber} بالكامل${adAmt > 0 ? ` وإيداع ${adAmt.toLocaleString()} ج.م بالمحفظة الإعلانية` : ''}.`
          : `تم استلام دفعة جزئية بمبلغ ${cleanAmount.toLocaleString()} ج.م (${newEntry.methodLabel}) بإيصال رقم ${receiptNumber} على الفاتورة ${invoice.invoiceNumber} — المتبقي: ${remainingAfter.toLocaleString()} ج.م.`;

        updateInquiry(client.id, {
          paymentStatus: isNowFullyPaid ? 'paid' : 'partially_paid',
          ...(adAmt > 0
            ? {
                adCreditBalance: newBalance,
                adCreditFundedTotal: newFundedTotal,
                pendingInvoiceAdCredit: pendingRemainder,
              }
            : {}),
          clientNotes: [
            makeActivityNote(noteText, 'payment', resolvedActor, {
              invoiceNumber: invoice.invoiceNumber,
            }),
            ...(client.clientNotes || []),
          ],
        });
      }
    }

    return newEntry;
  };

  const deleteInvoicePayment = (
    invoiceId: string,
    paymentId: string,
    reason?: string,
    actorName = 'الإدارة المالية'
  ): boolean => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const invoice = (dataRef.current.invoices || []).find((inv) => inv.id === invoiceId);
    if (!invoice) return false;
    const removedEntry = (invoice.payments || []).find((p) => p.id === paymentId);
    if (!removedEntry) return false;

    // Governance: Prevent reversing a payment belonging to a locked financial month
    if (isMonthClosed(removedEntry.date || invoice.issueDate) || isMonthClosed(invoice.issueDate)) {
      return false;
    }

    const nextPayments = (invoice.payments || []).filter((p) => p.id !== paymentId);
    const nextPaidAmount = nextPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const nextStatus: ClientInvoiceRecord['paymentStatus'] =
      nextPaidAmount >= invoice.grandTotal
        ? 'paid'
        : nextPaidAmount > 0
        ? 'partially_paid'
        : 'pending';

    updateInvoice(
      invoice.id,
      {
        payments: nextPayments,
        paidAmount: nextPaidAmount,
        paymentStatus: nextStatus,
        paidAt: nextStatus === 'paid' ? invoice.paidAt : undefined,
      },
      resolvedActor
    );

    appendFinancialAudit({
      actorName: resolvedActor,
      entityType: 'payment',
      entityId: removedEntry.id,
      entityLabel: `${removedEntry.receiptNumber} (${invoice.invoiceNumber})`,
      action: 'payment_removed',
      beforeSummary: `دفعة ${removedEntry.amount.toLocaleString()} ج.م بتاريخ ${removedEntry.date}`,
      afterSummary: `تم عكس الدفعة — المدفوع المتبقي: ${nextPaidAmount.toLocaleString()} ج.م`,
      reason: reason?.trim() || undefined,
    });
    return true;
  };

  // Agency Expenses CRUD & Governance
  const addExpense = (
    expenseData: Omit<AgencyExpense, 'id' | 'createdAt'>,
    actorName = 'الإدارة المالية'
  ): AgencyExpense => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const accrualMonth =
      expenseData.accrualMonth ||
      extractMonthKey(expenseData.date) ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const paymentStatus = expenseData.paymentStatus || 'paid';
    const paymentDate =
      paymentStatus === 'paid' ? expenseData.paymentDate || expenseData.date : undefined;

    const newExpense: AgencyExpense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amount: Math.max(0, Number(expenseData.amount) || 0),
      accrualMonth,
      paymentStatus,
      paymentDate,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => {
      const audit: FinancialAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorName: resolvedActor,
        entityType: 'expense',
        entityId: newExpense.id,
        entityLabel: newExpense.title,
        action: 'create',
        afterSummary: `${newExpense.amount.toLocaleString()} ج.م | شهر الاستحقاق: ${accrualMonth} | الحالة: ${paymentStatus === 'paid' ? 'مدفوع' : 'مستحق غير مدفوع'}`,
      };
      const next: AgencyDataState = {
        ...prev,
        expenses: [newExpense, ...(prev.expenses || [])],
        financialAuditLog: [audit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
    return newExpense;
  };

  const updateExpense = (
    id: string,
    updates: Partial<AgencyExpense>,
    actorName = 'الإدارة المالية'
  ) => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const prevExp = (dataRef.current.expenses || []).find((e) => e.id === id);
    setData((prev) => {
      const nextExpenses = (prev.expenses || []).map((e) => (e.id === id ? { ...e, ...updates } : e));
      const updatedExp = nextExpenses.find((e) => e.id === id);
      const auditEntries = prev.financialAuditLog || [];
      const nextAudit: FinancialAuditEntry[] =
        prevExp && updatedExp
          ? [
              {
                id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                timestamp: new Date().toISOString(),
                actorName: resolvedActor,
                entityType: 'expense' as const,
                entityId: id,
                entityLabel: updatedExp.title,
                action: 'update' as const,
                beforeSummary: `${prevExp.amount.toLocaleString()} ج.م (${prevExp.paymentStatus || 'paid'})`,
                afterSummary: `${updatedExp.amount.toLocaleString()} ج.م (${updatedExp.paymentStatus || 'paid'})`,
              },
              ...auditEntries,
            ].slice(0, 500)
          : auditEntries;
      const next: AgencyDataState = {
        ...prev,
        expenses: nextExpenses,
        financialAuditLog: nextAudit,
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  const voidExpense = (id: string, reason: string, actorName = 'الإدارة المالية'): boolean => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const prevExp = (dataRef.current.expenses || []).find((e) => e.id === id);
    if (!prevExp || !reason.trim()) return false;
    const nowIso = new Date().toISOString();
    setData((prev) => {
      const nextExpenses = (prev.expenses || []).map((e) =>
        e.id === id
          ? {
              ...e,
              voided: true,
              voidReason: reason.trim(),
              voidedAt: nowIso,
              voidedBy: resolvedActor,
            }
          : e
      );
      const audit: FinancialAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowIso,
        actorName: resolvedActor,
        entityType: 'expense',
        entityId: id,
        entityLabel: prevExp.title,
        action: 'void',
        beforeSummary: `مصروف فعّال بقيمة ${prevExp.amount.toLocaleString()} ج.م`,
        afterSummary: `ملغى بقيد موثق (لا يُحتسب في P&L أو التدفق النقدي)`,
        reason: reason.trim(),
      };
      const next: AgencyDataState = {
        ...prev,
        expenses: nextExpenses,
        financialAuditLog: [audit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
    return true;
  };

  const deleteExpense = (id: string, actorName = 'الإدارة المالية') => {
    const resolvedActor = actorName?.trim() || 'الإدارة المالية';
    const prevExp = (dataRef.current.expenses || []).find((e) => e.id === id);
    setData((prev) => {
      const next: AgencyDataState = {
        ...prev,
        expenses: (prev.expenses || []).filter((e) => e.id !== id),
        financialAuditLog: prevExp
          ? [
              {
                id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                timestamp: new Date().toISOString(),
                actorName: resolvedActor,
                entityType: 'expense' as const,
                entityId: id,
                entityLabel: prevExp.title,
                action: 'delete_draft' as const,
                beforeSummary: `حذف مصروف ${prevExp.amount.toLocaleString()} ج.م`,
              },
              ...(prev.financialAuditLog || []),
            ].slice(0, 500)
          : prev.financialAuditLog,
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  // Post recurring salaries & fixed expenses into a target month without duplicating existing items
  const postRecurringExpensesForMonth = (
    targetMonthKey: string,
    actorName = 'الإدارة المالية'
  ): number => {
    if (isMonthClosed(targetMonthKey)) return 0;
    const allExpenses = (dataRef.current.expenses || []).filter((e) => !e.voided);
    const existingKeysInTarget = new Set(
      allExpenses
        .filter((e) => getExpenseAccrualMonth(e) === targetMonthKey)
        .map((e) => `${e.category}::${e.title.trim().toLowerCase()}`)
    );

    // Deduplicate recurring templates by (category + normalized title), keeping latest amount
    const templateMap = new Map<string, AgencyExpense>();
    allExpenses
      .filter((e) => e.recurring)
      .forEach((e) => {
        const key = `${e.category}::${e.title.trim().toLowerCase()}`;
        if (!templateMap.has(key)) {
          templateMap.set(key, e);
        }
      });

    const toCreate: AgencyExpense[] = [];
    const nowIso = new Date().toISOString();
    const defaultDate = `${targetMonthKey}-01`;

    templateMap.forEach((tpl, key) => {
      if (existingKeysInTarget.has(key)) return;
      toCreate.push({
        ...tpl,
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: defaultDate,
        accrualMonth: targetMonthKey,
        paymentStatus: 'accrued_unpaid',
        paymentDate: undefined,
        voided: undefined,
        voidReason: undefined,
        voidedAt: undefined,
        voidedBy: undefined,
        createdAt: nowIso,
      });
    });

    if (toCreate.length === 0) return 0;

    setData((prev) => {
      const audit: FinancialAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowIso,
        actorName,
        entityType: 'expense',
        entityId: `recurring-${targetMonthKey}`,
        entityLabel: `ترحيل البنود الثابتة — ${targetMonthKey}`,
        action: 'create',
        afterSummary: `تم ترحيل ${toCreate.length} بند ثابت/رواتب بقيمة إجمالية ${toCreate
          .reduce((s, e) => s + e.amount, 0)
          .toLocaleString()} ج.م كمستحقات لشهر ${targetMonthKey}`,
      };
      const next: AgencyDataState = {
        ...prev,
        expenses: [...toCreate, ...(prev.expenses || [])],
        financialAuditLog: [audit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });

    return toCreate.length;
  };

  // Month-End Close Checklist & Locking Controls
  const toggleMonthCloseStep = (
    monthKey: string,
    stepKey: MonthCloseStepKey,
    actorName = 'الإدارة المالية'
  ) => {
    setData((prev) => {
      const existing = prev.closedMonths?.[monthKey] || createEmptyMonthCloseRecord(monthKey);
      if (existing.status === 'closed') return prev;
      const updatedRecord: MonthlyCloseRecord = {
        ...existing,
        steps: {
          ...existing.steps,
          [stepKey]: !existing.steps[stepKey],
        },
      };
      const next: AgencyDataState = {
        ...prev,
        closedMonths: {
          ...(prev.closedMonths || {}),
          [monthKey]: updatedRecord,
        },
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
    void actorName;
  };

  const closeFinancialMonth = (monthKey: string, actorName: string, notes?: string) => {
    const nowIso = new Date().toISOString();
    setData((prev) => {
      const existing = prev.closedMonths?.[monthKey] || createEmptyMonthCloseRecord(monthKey);
      const closedRecord: MonthlyCloseRecord = {
        ...existing,
        monthKey,
        status: 'closed',
        steps: {
          ...existing.steps,
          approve_and_lock: true,
        },
        closedAt: nowIso,
        closedBy: actorName,
        notes: notes?.trim() || existing.notes,
      };
      const audit: FinancialAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowIso,
        actorName,
        entityType: 'month_close',
        entityId: monthKey,
        entityLabel: `إقفال شهر ${monthKey}`,
        action: 'month_closed',
        afterSummary: 'تم اعتماد وإقفال الشهر المالي ومنع التعديل المباشر بأثر رجعي.',
        reason: notes?.trim() || undefined,
      };
      const next: AgencyDataState = {
        ...prev,
        closedMonths: {
          ...(prev.closedMonths || {}),
          [monthKey]: closedRecord,
        },
        financialAuditLog: [audit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  const reopenFinancialMonth = (monthKey: string, reason: string, actorName: string) => {
    const cleanReason = reason.trim();
    if (!cleanReason) return;
    const nowIso = new Date().toISOString();
    setData((prev) => {
      const existing = prev.closedMonths?.[monthKey] || createEmptyMonthCloseRecord(monthKey);
      const reopenedRecord: MonthlyCloseRecord = {
        ...existing,
        monthKey,
        status: 'open',
        steps: {
          ...existing.steps,
          approve_and_lock: false,
        },
        reopenedAt: nowIso,
        reopenedBy: actorName,
        reopenReason: cleanReason,
      };
      const audit: FinancialAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowIso,
        actorName,
        entityType: 'month_close',
        entityId: monthKey,
        entityLabel: `إعادة فتح شهر ${monthKey}`,
        action: 'month_reopened',
        beforeSummary: 'شهر مقفول',
        afterSummary: 'تمت إعادة فتح الشهر لتسجيل قيد تسوية موثق',
        reason: cleanReason,
      };
      const next: AgencyDataState = {
        ...prev,
        closedMonths: {
          ...(prev.closedMonths || {}),
          [monthKey]: reopenedRecord,
        },
        financialAuditLog: [audit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  const updateFinancialSettings = (
    updates: Partial<FinancialSettings>,
    actorName = 'الإدارة المالية'
  ) => {
    const nowIso = new Date().toISOString();
    setData((prev) => {
      const prevSettings = prev.financialSettings || DEFAULT_FINANCIAL_SETTINGS;
      const nextSettings: FinancialSettings = {
        ...prevSettings,
        ...updates,
      };
      const audit: FinancialAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowIso,
        actorName,
        entityType: 'settings',
        entityId: 'financial_settings',
        entityLabel: 'إعدادات السياسة المالية والرصيد الافتتاحي',
        action: 'settings_updated',
        beforeSummary: `رصيد افتتاحي: ${prevSettings.openingCashBalance.toLocaleString()} ج.م | قاعدة التوزيع: ${prevSettings.sharedCostAllocationRule}`,
        afterSummary: `رصيد افتتاحي: ${nextSettings.openingCashBalance.toLocaleString()} ج.م | قاعدة التوزيع: ${nextSettings.sharedCostAllocationRule}`,
      };
      const next: AgencyDataState = {
        ...prev,
        financialSettings: nextSettings,
        financialAuditLog: [audit, ...(prev.financialAuditLog || [])].slice(0, 500),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  // Team Members CRUD
  const addTeamMember = (memberData: Omit<AgencyTeamMember, 'id'>): AgencyTeamMember => {
    const newMember: AgencyTeamMember = {
      ...memberData,
      id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setData((prev) => {
      const base =
        Array.isArray(prev.teamMembers) && prev.teamMembers.length > 0
          ? prev.teamMembers
          : DEFAULT_AGENCY_TEAM_MEMBERS;
      const next: AgencyDataState = {
        ...prev,
        teamMembers: [...base, newMember],
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
    return newMember;
  };

  const updateTeamMember = (id: string, updates: Partial<AgencyTeamMember>) => {
    setData((prev) => {
      const base =
        Array.isArray(prev.teamMembers) && prev.teamMembers.length > 0
          ? prev.teamMembers
          : DEFAULT_AGENCY_TEAM_MEMBERS;
      const next: AgencyDataState = {
        ...prev,
        teamMembers: base.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  const deleteTeamMember = (id: string) => {
    setData((prev) => {
      const base =
        Array.isArray(prev.teamMembers) && prev.teamMembers.length > 0
          ? prev.teamMembers
          : DEFAULT_AGENCY_TEAM_MEMBERS;
      const next: AgencyDataState = {
        ...prev,
        teamMembers: base.filter((m) => m.id !== id),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  // Portal Role Settings (Operations Access Code & Emails)
  const updatePortalSettings = (settings: { opsAccessCode?: string; opsAccountEmails?: string[] }) => {
    setData((prev) => {
      const next: AgencyDataState = {
        ...prev,
        ...(settings.opsAccessCode !== undefined ? { opsAccessCode: settings.opsAccessCode.trim() || DEFAULT_OPS_ACCESS_CODE } : {}),
        ...(settings.opsAccountEmails !== undefined ? { opsAccountEmails: settings.opsAccountEmails } : {}),
      };
      syncAdminFinanceOpsSnapshot(next);
      return next;
    });
  };

  const closeClientBillingCycle = (
    clientId: string,
    options: {
      newStartDate: string;
      newRenewalDate: string;
      newPendingAdCredit?: number;
      issueInvoiceNow?: boolean;
      invoiceTargetCycle?: 'closed' | 'new';
      invoiceContractPeriod?: string;
      cycleNotes?: string;
      actorName?: string;
    }
  ): { updatedClient: Inquiry | null; createdInvoice: ClientInvoiceRecord | null } => {
    const client = (dataRef.current.inquiries || []).find((c) => c.id === clientId);
    if (!client) {
      return { updatedClient: null, createdInvoice: null };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const closedStartDate = client.contractStartDate || client.createdAt?.split('T')[0] || todayStr;
    const closedEndDate = client.renewalDate || todayStr;
    const cycleLabel = formatOperationCycleBadge(closedStartDate, client.billingCycle || 'monthly', true);
    const nextCycleLabel = formatOperationCycleBadge(options.newStartDate, client.billingCycle || 'monthly', true);

    const targets = getClientDeliverableTargets(client, dataRef.current.packages || []);
    const postsDelivered = client.postsDelivered ?? 0;
    const reelsDelivered = client.reelsDelivered ?? 0;
    const storiesDelivered = client.storiesDelivered ?? 0;
    const totalDelivered = postsDelivered + reelsDelivered + storiesDelivered;
    const deliverablesCompletionRate =
      targets.totalTarget > 0
        ? Math.min(100, Math.round((totalDelivered / targets.totalTarget) * 100))
        : 0;

    const stages = client.workflowStages || [];
    const workflowTotalStages = stages.length > 0 ? stages.length : 5;
    const workflowCompletedStages = stages.filter((s) => s.status === 'completed').length;

    const parsedRetainer = parseInvoiceAmount(client.budget);
    const retainerAmount =
      client.retainerAmount && client.retainerAmount > 0
        ? client.retainerAmount
        : parsedRetainer;

    const latestClientInvoice = (dataRef.current.invoices || []).find(
      (inv) => inv.clientId === client.id && inv.paymentStatus !== 'cancelled'
    );

    const cycleRecord: ClientMonthlyCycleRecord = {
      id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cycleLabel,
      startDate: closedStartDate,
      endDate: closedEndDate,
      closedAt: new Date().toISOString(),
      packageName: client.packageName || 'باقة مخصصة',
      retainerAmount,
      postsDelivered,
      postsTarget: targets.postsTarget,
      reelsDelivered,
      reelsTarget: targets.reelsTarget,
      storiesDelivered,
      storiesTarget: targets.storiesTarget,
      deliverablesCompletionRate,
      workflowCompletedStages,
      workflowTotalStages,
      paymentStatus: client.paymentStatus || 'pending',
      adCreditBalanceCarriedOver: client.adCreditBalance || 0,
      invoiceNumber: latestClientInvoice?.invoiceNumber,
      notes: options.cycleNotes?.trim() || undefined,
    };

    const resetStages = [
      { id: 'content_creator', title: 'Content Creator', status: 'pending' as const },
      { id: 'visual_design', title: 'Visual Design', status: 'pending' as const },
      { id: 'final_design', title: 'Final Design', status: 'pending' as const },
      { id: 'client_approve', title: 'Client Approve', status: 'pending' as const },
      { id: 'publish', title: 'Publish', status: 'pending' as const },
    ];

    const summaryNoteText = `إغلاق «${cycleLabel}» (إنجاز المخرجات: ${totalDelivered}/${targets.totalTarget} بنسبة ${deliverablesCompletionRate}% • مراحل العمل: ${workflowCompletedStages}/${workflowTotalStages} • رصيد إعلاني مرحّل: ${(client.adCreditBalance || 0).toLocaleString()} ج.م) وبدء «${nextCycleLabel}» من ${options.newStartDate} حتى ${options.newRenewalDate}.${options.cycleNotes?.trim() ? ` ملاحظة: ${options.cycleNotes.trim()}` : ''}`;

    const closingNote = makeActivityNote(summaryNoteText, 'workflow', 'إدارة التشغيل والمالية', {
      fieldChanged: 'billingCycleClose',
      cycleRecord,
    });

    const existingHistory = client.cycleHistory || [];
    const nextHistory = [cycleRecord, ...existingHistory];
    const nextPendingAdCredit = Math.max(0, Number(options.newPendingAdCredit) || 0);

    const resetReelStages = Array.from({ length: Math.max(0, Math.min(30, Math.floor(targets.reelsTarget || 0))) }, (_, idx) => ({
      id: `reel_${idx + 1}`,
      title: `Reel ${idx + 1}`,
      status: 'pending' as const,
      track: 'reel' as const,
    }));

    const updatedClientUpdates: Partial<Inquiry> = {
      contractStartDate: options.newStartDate,
      renewalDate: options.newRenewalDate,
      contractStatus: 'active',
      paymentStatus: 'pending',
      postsDelivered: 0,
      reelsDelivered: 0,
      storiesDelivered: 0,
      workflowStages: resetStages,
      reelStages: resetReelStages,
      currentWorkflowDay: 1,
      todayTaskTitle: '',
      pendingInvoiceAdCredit: nextPendingAdCredit,
      cycleHistory: nextHistory,
      clientNotes: [closingNote, ...(client.clientNotes || [])],
    };

    updateInquiry(client.id, updatedClientUpdates);

    let createdInvoice: ClientInvoiceRecord | null = null;
    if (options.issueInvoiceNow) {
      const invNumber = generateUniqueInvoiceNumber(client.id, dataRef.current.invoices || []);
      const grandTotal = retainerAmount + nextPendingAdCredit;
      const targetCycle = options.invoiceTargetCycle || 'closed';
      const resolvedServiceStart = targetCycle === 'closed' ? closedStartDate : options.newStartDate;
      const resolvedServiceEnd = targetCycle === 'closed' ? closedEndDate : options.newRenewalDate;
      const resolvedInvoicePeriod =
        (options.invoiceContractPeriod || '').trim() ||
        formatInvoicePeriodLabel(
          resolvedServiceStart,
          client.billingCycle || 'monthly',
          true
        );
      createdInvoice = addInvoice(
        {
          invoiceNumber: invNumber,
          clientId: client.id,
          clientName: client.name,
          clientCompany: client.company,
          clientPhone: client.phone,
          sector: client.sector,
          issueDate: todayStr,
          dueDate: options.newRenewalDate,
          serviceStartDate: resolvedServiceStart,
          serviceEndDate: resolvedServiceEnd,
          packageName: client.packageName || 'باقة تسويق رقمي',
          retainerAmount,
          adCreditAmount: nextPendingAdCredit,
          grandTotal,
          billingCycle: client.billingCycle || 'monthly',
          contractPeriod: resolvedInvoicePeriod,
          paymentStatus: 'pending',
          notes: options.cycleNotes?.trim() || undefined,
          deliverables: {
            posts: targets.postsTarget,
            reels: targets.reelsTarget,
            stories: targets.storiesTarget,
          },
        },
        options.actorName
      );
    }

    const updatedClient: Inquiry = {
      ...client,
      ...updatedClientUpdates,
    };

    return { updatedClient, createdInvoice };
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

      if (Array.isArray(inv.payments) && inv.payments.length > 0) {
        inv.payments.forEach((pay) => {
          rawEntries.push({
            id: `ledger-pay-${pay.id}`,
            date: pay.date || inv.issueDate,
            type: 'payment',
            title: `دفعة مسددة (${pay.methodLabel}) — إيصال ${pay.receiptNumber}`,
            reference: pay.receiptNumber,
            debit: 0,
            credit: Number(pay.amount) || 0,
            balance: 0,
            notes: pay.notes || pay.reference || `سداد على الفاتورة ${inv.invoiceNumber}`,
          });
        });
      } else if (inv.paymentStatus === 'paid' && (inv.paidAt || inv.issueDate)) {
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

  // =========================================================================
  // AD WALLET APPROVAL WORKFLOW (Media Buyer <-> Accountant / Admin)
  // =========================================================================
  const submitAdWalletRequest: AgencyContextType['submitAdWalletRequest'] = (
    clientId,
    payload
  ) => {
    const client = (dataRef.current.inquiries || []).find((c) => c.id === clientId);
    if (!client) {
      return { ok: false, errorAr: 'العميل غير موجود.', errorEn: 'Client not found.' };
    }
    const cleanAmount = Math.round(Number(payload.amount) || 0);
    if (cleanAmount <= 0) {
      return {
        ok: false,
        errorAr: 'يرجى إدخال مبلغ صحيح أكبر من صفر.',
        errorEn: 'Please enter a valid amount greater than zero.',
      };
    }

    const existingReqs = client.adWalletRequests || [];
    const currentBalance = client.adCreditBalance || 0;

    if (payload.type === 'spend') {
      const pendingSpendTotal = existingReqs
        .filter((r) => r.type === 'spend' && r.status === 'pending')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
      const usableBalance = Math.max(0, currentBalance - pendingSpendTotal);
      if (cleanAmount > usableBalance) {
        return {
          ok: false,
          errorAr: `المبلغ المطلوب (${cleanAmount.toLocaleString()} ج.م) يتجاوز الرصيد المتاح بعد خصم الطلبات المعلقة (${usableBalance.toLocaleString()} ج.م).`,
          errorEn: `Requested spend (${cleanAmount.toLocaleString()} EGP) exceeds available balance (${usableBalance.toLocaleString()} EGP).`,
        };
      }
    }

    const nowIso = new Date().toISOString();
    const actor = payload.requestedBy?.trim() || 'الميديا باير';
    const platformLabel = payload.platform?.trim() || 'Meta Ads (Facebook & Instagram)';
    const cleanNotes = payload.notes?.trim() || undefined;
    const isAuto = Boolean(payload.autoApprove);

    let linkedInvoiceNumber: string | undefined;

    if (isAuto && payload.type === 'topup') {
      // Find latest open unpaid invoice for this client and add the approved ad credit to it
      const openInv = (dataRef.current.invoices || []).find(
        (inv) =>
          inv.clientId === clientId &&
          (inv.paymentStatus === 'pending' || inv.paymentStatus === 'partially_paid')
      );
      if (openInv) {
        linkedInvoiceNumber = openInv.invoiceNumber;
        updateInvoice(openInv.id, {
          adCreditAmount: (openInv.adCreditAmount || 0) + cleanAmount,
          grandTotal: (openInv.grandTotal || 0) + cleanAmount,
        });
      }
    }

    const newReq: AdWalletRequest = {
      id: `adreq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: payload.type,
      amount: cleanAmount,
      platform: payload.type === 'spend' ? platformLabel : undefined,
      notes: cleanNotes,
      status: isAuto ? 'approved' : 'pending',
      requestedBy: actor,
      requestedAt: nowIso,
      ...(isAuto ? { reviewedBy: actor, reviewedAt: nowIso } : {}),
      ...(linkedInvoiceNumber ? { linkedInvoiceNumber } : {}),
    };

    const nextRequests = [newReq, ...existingReqs];

    if (isAuto) {
      if (payload.type === 'topup') {
        const nextPendingAd = (client.pendingInvoiceAdCredit || 0) + cleanAmount;
        const noteText = linkedInvoiceNumber
          ? `💳 تم اعتماد إضافة رصيد إعلاني بمبلغ ${cleanAmount.toLocaleString()} ج.م بواسطة ${actor} وإدراجه تلقائياً في الفاتورة رقم ${linkedInvoiceNumber}.${cleanNotes ? ` (${cleanNotes})` : ''}`
          : `💳 تم اعتماد إضافة رصيد إعلاني بمبلغ ${cleanAmount.toLocaleString()} ج.م بواسطة ${actor} وإدراجه كبند رصيد إعلاني في الفاتورة.${cleanNotes ? ` (${cleanNotes})` : ''}`;
        updateInquiry(clientId, {
          pendingInvoiceAdCredit: nextPendingAd,
          adWalletRequests: nextRequests,
          clientNotes: [
            makeActivityNote(noteText, 'payment', actor, {
              ...(linkedInvoiceNumber ? { invoiceNumber: linkedInvoiceNumber } : {}),
            }),
            ...(client.clientNotes || []),
          ],
        });
        appendFinancialAudit({
          actorName: actor,
          entityType: 'ad_wallet',
          entityId: newReq.id,
          entityLabel: `شحن محفظة إعلانات — ${client.company || client.name}`,
          action: 'create',
          afterSummary: `اعتماد مباشر لإضافة ${cleanAmount.toLocaleString()} ج.م${linkedInvoiceNumber ? ` (فاتورة ${linkedInvoiceNumber})` : ''}`,
          reason: cleanNotes,
        });
      } else {
        const newBalance = Math.max(0, currentBalance - cleanAmount);
        const newSpentTotal = (client.adCreditSpentTotal || 0) + cleanAmount;
        const noteText = `✅ [صرف إعلاني - ${platformLabel}] تم اعتماد وخصم ${cleanAmount.toLocaleString()} ج.م من الرصيد الإعلاني بواسطة ${actor}.${cleanNotes ? ` (${cleanNotes})` : ''} الرصيد المتبقي: ${newBalance.toLocaleString()} ج.م.`;
        updateInquiry(clientId, {
          adCreditBalance: newBalance,
          adCreditSpentTotal: newSpentTotal,
          adWalletRequests: nextRequests,
          clientNotes: [
            makeActivityNote(noteText, 'update', actor),
            ...(client.clientNotes || []),
          ],
        });
        appendFinancialAudit({
          actorName: actor,
          entityType: 'ad_wallet',
          entityId: newReq.id,
          entityLabel: `صرف إعلاني (${platformLabel}) — ${client.company || client.name}`,
          action: 'update',
          beforeSummary: `الرصيد قبل الصرف: ${currentBalance.toLocaleString()} ج.م`,
          afterSummary: `خصم ${cleanAmount.toLocaleString()} ج.م — الرصيد المتبقي: ${newBalance.toLocaleString()} ج.م`,
          reason: cleanNotes,
        });
      }
    } else {
      const noteText =
        payload.type === 'topup'
          ? `⏳ قدّم ${actor} طلب إضافة رصيد إعلاني بمبلغ ${cleanAmount.toLocaleString()} ج.م — بانتظار موافقة المحاسب لإدراجه بالفاتورة.${cleanNotes ? ` (${cleanNotes})` : ''}`
          : `⏳ سجّل ${actor} مصروف إعلاني بمبلغ ${cleanAmount.toLocaleString()} ج.م على (${platformLabel}) — بانتظار موافقة المحاسب للخصم من الرصيد الإعلاني.${cleanNotes ? ` (${cleanNotes})` : ''}`;

      updateInquiry(clientId, {
        adWalletRequests: nextRequests,
        clientNotes: [
          makeActivityNote(noteText, 'update', actor),
          ...(client.clientNotes || []),
        ],
      });
    }

    return { ok: true, request: newReq, linkedInvoiceNumber };
  };

  const reviewAdWalletRequest: AgencyContextType['reviewAdWalletRequest'] = (
    clientId,
    requestId,
    decision,
    reviewerName,
    rejectionReason
  ) => {
    const client = (dataRef.current.inquiries || []).find((c) => c.id === clientId);
    if (!client) {
      return { ok: false, errorAr: 'العميل غير موجود.', errorEn: 'Client not found.' };
    }

    const existingReqs = client.adWalletRequests || [];
    const targetReq = existingReqs.find((r) => r.id === requestId);
    if (!targetReq) {
      return { ok: false, errorAr: 'الطلب غير موجود.', errorEn: 'Request not found.' };
    }
    if (targetReq.status !== 'pending') {
      return {
        ok: false,
        errorAr: 'تمت مراجعة هذا الطلب بالفعل.',
        errorEn: 'This request has already been reviewed.',
      };
    }

    const nowIso = new Date().toISOString();
    const reviewer = reviewerName?.trim() || 'المحاسب';
    const cleanReason = rejectionReason?.trim() || undefined;

    if (decision === 'rejected') {
      const updatedReq: AdWalletRequest = {
        ...targetReq,
        status: 'rejected',
        reviewedBy: reviewer,
        reviewedAt: nowIso,
        rejectionReason: cleanReason,
      };
      const nextRequests = existingReqs.map((r) => (r.id === requestId ? updatedReq : r));
      const rejectNoteText =
        targetReq.type === 'topup'
          ? `❌ رفض المحاسب (${reviewer}) طلب إضافة الرصيد الإعلاني بمبلغ ${targetReq.amount.toLocaleString()} ج.م المقدم من ${targetReq.requestedBy}.${cleanReason ? ` السبب: ${cleanReason}` : ''}`
          : `❌ رفض المحاسب (${reviewer}) مصروف الإعلانات بمبلغ ${targetReq.amount.toLocaleString()} ج.م (${targetReq.platform || 'حملات ممولة'}) المقدم من ${targetReq.requestedBy}.${cleanReason ? ` السبب: ${cleanReason}` : ''}`;

      updateInquiry(clientId, {
        adWalletRequests: nextRequests,
        clientNotes: [
          makeActivityNote(rejectNoteText, 'update', reviewer),
          ...(client.clientNotes || []),
        ],
      });
      appendFinancialAudit({
        actorName: reviewer,
        entityType: 'ad_wallet',
        entityId: targetReq.id,
        entityLabel: `${targetReq.type === 'topup' ? 'رفض شحن إعلانات' : 'رفض صرف إعلاني'} — ${client.company || client.name}`,
        action: 'void',
        beforeSummary: `طلب معلق بقيمة ${targetReq.amount.toLocaleString()} ج.م (مقدم من ${targetReq.requestedBy})`,
        afterSummary: `مرفوض بدون أثر مالي على المحفظة`,
        reason: cleanReason,
      });
      return { ok: true, request: updatedReq };
    }

    // Approved
    if (targetReq.type === 'topup') {
      let linkedInvoiceNumber: string | undefined;
      const openInv = (dataRef.current.invoices || []).find(
        (inv) =>
          inv.clientId === clientId &&
          (inv.paymentStatus === 'pending' || inv.paymentStatus === 'partially_paid')
      );
      if (openInv) {
        linkedInvoiceNumber = openInv.invoiceNumber;
        updateInvoice(
          openInv.id,
          {
            adCreditAmount: (openInv.adCreditAmount || 0) + targetReq.amount,
            grandTotal: (openInv.grandTotal || 0) + targetReq.amount,
          },
          reviewer
        );
      }

      const updatedReq: AdWalletRequest = {
        ...targetReq,
        status: 'approved',
        reviewedBy: reviewer,
        reviewedAt: nowIso,
        ...(linkedInvoiceNumber ? { linkedInvoiceNumber } : {}),
      };
      const nextRequests = existingReqs.map((r) => (r.id === requestId ? updatedReq : r));
      const nextPendingAd = (client.pendingInvoiceAdCredit || 0) + targetReq.amount;

      const approveTopUpNote = linkedInvoiceNumber
        ? `✅ وافق المحاسب (${reviewer}) على طلب إضافة رصيد إعلاني بمبلغ ${targetReq.amount.toLocaleString()} ج.م (من ${targetReq.requestedBy}) وتم إدراجه تلقائياً في الفاتورة رقم ${linkedInvoiceNumber}.`
        : `✅ وافق المحاسب (${reviewer}) على طلب إضافة رصيد إعلاني بمبلغ ${targetReq.amount.toLocaleString()} ج.م (من ${targetReq.requestedBy}) وتم إدراجه كبند رصيد إعلاني في الفاتورة.`;

      updateInquiry(clientId, {
        pendingInvoiceAdCredit: nextPendingAd,
        adWalletRequests: nextRequests,
        clientNotes: [
          makeActivityNote(approveTopUpNote, 'payment', reviewer, {
            ...(linkedInvoiceNumber ? { invoiceNumber: linkedInvoiceNumber } : {}),
          }),
          ...(client.clientNotes || []),
        ],
      });

      appendFinancialAudit({
        actorName: reviewer,
        entityType: 'ad_wallet',
        entityId: targetReq.id,
        entityLabel: `اعتماد شحن إعلانات — ${client.company || client.name}`,
        action: 'update',
        beforeSummary: `طلب معلق من ${targetReq.requestedBy} بقيمة ${targetReq.amount.toLocaleString()} ج.م`,
        afterSummary: `معتمد ومدرج بالفوترة${linkedInvoiceNumber ? ` (فاتورة ${linkedInvoiceNumber})` : ''}`,
      });

      return { ok: true, request: updatedReq, linkedInvoiceNumber };
    }

    // Approved Spend -> deduct from available adCreditBalance
    const currentBalance = client.adCreditBalance || 0;
    if (targetReq.amount > currentBalance) {
      return {
        ok: false,
        errorAr: `الرصيد الإعلاني المتاح حالياً (${currentBalance.toLocaleString()} ج.م) غير كافٍ لخصم ${targetReq.amount.toLocaleString()} ج.م! يرجى تحصيل الفاتورة وإيداع الرصيد أولاً.`,
        errorEn: `Available balance (${currentBalance.toLocaleString()} EGP) is lower than spend amount (${targetReq.amount.toLocaleString()} EGP).`,
      };
    }

    const newBalance = currentBalance - targetReq.amount;
    const newSpentTotal = (client.adCreditSpentTotal || 0) + targetReq.amount;
    const updatedReq: AdWalletRequest = {
      ...targetReq,
      status: 'approved',
      reviewedBy: reviewer,
      reviewedAt: nowIso,
    };
    const nextRequests = existingReqs.map((r) => (r.id === requestId ? updatedReq : r));
    const platformLabel = targetReq.platform || 'حملات ممولة';

    const approveSpendNote = `✅ [صرف إعلاني - ${platformLabel}] وافق المحاسب (${reviewer}) على خصم ${targetReq.amount.toLocaleString()} ج.م من الرصيد الإعلاني (مقدم من ${targetReq.requestedBy}${targetReq.notes ? ` — ${targetReq.notes}` : ''}). الرصيد المتبقي: ${newBalance.toLocaleString()} ج.م.`;

    updateInquiry(clientId, {
      adCreditBalance: newBalance,
      adCreditSpentTotal: newSpentTotal,
      adWalletRequests: nextRequests,
      clientNotes: [
        makeActivityNote(approveSpendNote, 'update', reviewer),
        ...(client.clientNotes || []),
      ],
    });

    appendFinancialAudit({
      actorName: reviewer,
      entityType: 'ad_wallet',
      entityId: targetReq.id,
      entityLabel: `اعتماد صرف إعلاني (${platformLabel}) — ${client.company || client.name}`,
      action: 'update',
      beforeSummary: `رصيد المحفظة قبل الخصم: ${currentBalance.toLocaleString()} ج.م`,
      afterSummary: `خصم ${targetReq.amount.toLocaleString()} ج.م (مقدم من ${targetReq.requestedBy}) — المتبقي: ${newBalance.toLocaleString()} ج.م`,
    });

    return { ok: true, request: updatedReq };
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
        logInquiryActivity,
        deleteInquiry,
        clearAllInquiries,
        clearAllCrmData,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        voidInvoiceWithReversal,
        markInvoiceAsPaid,
        recordInvoicePayment,
        deleteInvoicePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        voidExpense,
        postRecurringExpensesForMonth,
        isMonthClosed,
        toggleMonthCloseStep,
        closeFinancialMonth,
        reopenFinancialMonth,
        updateFinancialSettings,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        updatePortalSettings,
        closeClientBillingCycle,
        getClientLedger,
        submitAdWalletRequest,
        reviewAdWalletRequest,
        updateBanner,
        resetToDefaults,
        exportDataJson,
        importDataJson,
        cloudSyncStatus,
        supabaseMigrationNeeded,
        lastCloudSyncAt,
        syncNowToSupabase,
        refreshFromSupabase,
        hydrateTeamWorkspace,
        clearTeamSession,
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
