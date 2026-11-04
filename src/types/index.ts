export type SectorType = 'all' | 'b2b' | 'b2c' | 'medical';
export type Language = 'ar' | 'en';
export type PageRoute = 'home' | 'b2b' | 'b2c' | 'medical' | 'case-studies' | 'about' | 'ipt-case-study' | 'penguin-case-study' | 'bsizia-case-study' | 'admin';

export interface ProjectMetric {
  label: string;
  labelEn: string;
  value: string;
  hint?: string;
  hintEn?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  titleEn: string;
  sector: 'b2b' | 'b2c' | 'medical';
  client: string;
  clientEn: string;
  industry: string;
  industryEn: string;
  duration: string;
  durationEn: string;
  challenge: string;
  challengeEn: string;
  solution: string;
  solutionEn: string;
  metrics: ProjectMetric[];
  services: string[];
  servicesEn: string[];
  tags: string[];
  tagsEn: string[];
  quote?: {
    text: string;
    textEn: string;
    author: string;
    authorEn: string;
    role: string;
    roleEn: string;
  };
  featured?: boolean;
  image?: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  gallery?: string[];
  clientUrl?: string;
  subtitle?: string;
  subtitleEn?: string;
  statsImage?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  nameEn: string;
  sector: 'b2b' | 'b2c' | 'medical';
  badge?: string;
  badgeEn?: string;
  price: number;
  originalPrice?: number;
  quarterlyPrice?: number;
  currency: string;
  currencyEn: string;
  period: string;
  periodEn: string;
  isPopular?: boolean;
  hasOffer?: boolean;
  offerNote?: string;
  offerNoteEn?: string;
  offerExpiryDate?: string; // ISO date / YYYY-MM-DD for limited-time offers
  discountPercentage?: number; // e.g. 15, 20
  tagline: string;
  taglineEn: string;
  idealFor: string;
  idealForEn: string;
  features: string[];
  featuresEn: string[];
  // Exact deliverable counts from official agency pricing sheet
  postsCount?: number;
  reelsCount?: number;
  storiesCount?: number;
  frequency?: string;
  frequencyEn?: string;
  hasMonthlyPlan?: boolean;
}

export interface PromoCode {
  id: string;
  code: string; // e.g. 'EFFECT20' (uppercase)
  title: string;
  titleEn: string;
  discountType: 'percentage' | 'fixed'; // percentage or fixed EGP
  discountValue: number; // e.g. 20 (for 20%) or 3000 (for 3000 EGP)
  minSpend?: number; // minimum package price required, e.g. 15000
  expiresAt?: string; // YYYY-MM-DD
  isActive: boolean;
  usageCount: number;
  maxUsage?: number; // optional limit
  applicableSector?: SectorType; // 'all' | 'b2b' | 'b2c' | 'medical'
  createdAt: string;
}

export interface PromoBanner {
  enabled: boolean;
  text: string;
  textEn: string;
  tag: string;
  tagEn: string;
  linkText?: string;
  linkTextEn?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  phoneE164?: string;
  phoneCountry?: string;
  visitorCountry?: string;
  company?: string;
  sector: SectorType;
  packageId?: string;
  packageName?: string;
  budget?: string;
  notes?: string;
  promoCode?: string;
  discountAmount?: number;
  finalPrice?: number;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed' | 'cancelled';
}

export interface AgencyDataState {
  caseStudies: CaseStudy[];
  packages: ServicePackage[];
  promoCodes?: PromoCode[];
  banner: PromoBanner;
  agencyInfo: {
    name: string;
    nameEn: string;
    foundedYears: number;
    experienceYears: number;
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    addressEn: string;
  };
  inquiries?: Inquiry[];
}

