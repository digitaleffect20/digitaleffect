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
  company?: string;
  sector: SectorType;
  packageName?: string;
  budget?: string;
  notes?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed' | 'cancelled';
}

export interface AgencyDataState {
  caseStudies: CaseStudy[];
  packages: ServicePackage[];
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
