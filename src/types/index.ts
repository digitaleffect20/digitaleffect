export type SectorType = 'all' | 'b2b' | 'b2c' | 'medical';
export type PortfolioCategoryFilter = SectorType | 'social' | 'social-b2b' | 'social-b2c' | 'social-medical' | 'identity' | 'web';
export type Language = 'ar' | 'en';
export type PageRoute = 'home' | 'b2b' | 'b2c' | 'medical' | 'case-studies' | 'about' | 'custom-package' | 'ipt-case-study' | 'penguin-case-study' | 'penguin-web-case-study' | 'bsizia-case-study' | 'binaryracks-case-study' | 'gimoka-case-study' | 'lashin-case-study' | 'concrete-case-study' | 'hamburg-case-study' | 'acton-case-study' | 'yoken-case-study' | 'siltal-case-study' | 'passap-case-study' | 'alwaad-case-study' | 'agu-case-study' | 'premium-case-study' | 'business-partner-case-study' | 'overview-case-study' | 'oro-case-study' | 'afro-energy-case-study' | 'sadko-case-study' | 'ufar-case-study' | 'siltal-identity-case-study' | 'bilton-case-study' | 'admin';

export interface CustomPackageConfig {
  sector?: 'b2b' | 'b2c' | 'medical';
  posts?: number;
  reels?: number;
  stories?: number;
  basePkgName?: string;
}

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
  metaTitle?: string;
  metaTitleEn?: string;
  metaDescription?: string;
  metaDescriptionEn?: string;
  slug?: string;
  schemaJsonLd?: Record<string, unknown>;
  videoUrl?: string;
  videos?: CaseStudyVideo[];
  customCreatives?: CaseStudyCreative[];
}

export interface CaseStudyVideo {
  id: string;
  url: string;
  title: string;
  titleEn?: string;
  desc?: string;
  descEn?: string;
  type?: 'embed' | 'direct' | 'upload';
}

export interface CaseStudyCreative {
  id: string;
  url: string;
  title: string;
  titleEn?: string;
  tag?: string;
  tagEn?: string;
  desc?: string;
  descEn?: string;
  type?: 'image' | 'video';
}

export interface Testimonial {
  id: string;
  client: string;
  clientEn: string;
  author: string;
  authorEn: string;
  role: string;
  roleEn: string;
  text: string;
  textEn: string;
  sector: 'b2b' | 'b2c' | 'medical';
  rating: number; // usually 5
  metricResult?: string;
  metricResultEn?: string;
  logoUrl?: string;
  projectUrl?: string;
  avatarBg?: string;
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

export type ActivityLogType =
  | 'status_change'
  | 'note'
  | 'call'
  | 'whatsapp'
  | 'meeting'
  | 'payment'
  | 'deliverable'
  | 'invoice'
  | 'workflow'
  | 'update';

export interface ClientMonthlyCycleRecord {
  id: string;
  cycleLabel: string;
  startDate: string;
  endDate: string;
  closedAt: string;
  packageName: string;
  retainerAmount: number;
  postsDelivered: number;
  postsTarget: number;
  reelsDelivered: number;
  reelsTarget: number;
  storiesDelivered: number;
  storiesTarget: number;
  deliverablesCompletionRate: number;
  workflowCompletedStages: number;
  workflowTotalStages: number;
  paymentStatus: 'paid' | 'pending' | 'partially_paid' | 'overdue';
  adCreditBalanceCarriedOver: number;
  carriedOverReelsCount?: number;
  invoiceNumber?: string;
  notes?: string;
}

export interface ClientAccountNote {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
  type?: ActivityLogType;
  meta?: {
    fromStatus?: string;
    toStatus?: string;
    channel?: string;
    invoiceNumber?: string;
    stageTitle?: string;
    fieldChanged?: string;
    cycleRecord?: ClientMonthlyCycleRecord;
  };
}

export interface ClientWorkflowStage {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  assignee?: string;
  notes?: string;
  completedAt?: string;
  track?: 'main' | 'reel' | 'carryover_reel';
  originCycleLabel?: string;
  carriedOverAt?: string;
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
  // Client Retainer & Account Tracking (Active when status === 'closed')
  contractStartDate?: string;
  renewalDate?: string;
  contractStatus?: 'active' | 'renewal_due' | 'paused' | 'completed';
  paymentStatus?: 'paid' | 'pending' | 'partially_paid' | 'overdue';
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  retainerAmount?: number;
  postsTarget?: number;
  postsDelivered?: number;
  reelsTarget?: number;
  reelsDelivered?: number;
  storiesTarget?: number;
  storiesDelivered?: number;
  accountManager?: string;
  clientNotes?: ClientAccountNote[];
  workflowStages?: ClientWorkflowStage[];
  reelStages?: ClientWorkflowStage[];
  carriedOverReels?: ClientWorkflowStage[];
  currentWorkflowDay?: number;
  todayTaskTitle?: string;
  // Ad Credit & Campaign Wallet (الرصيد الإعلاني وميزانية الحملات)
  adCreditBalance?: number;
  pendingInvoiceAdCredit?: number;
  adCreditFundedTotal?: number;
  adCreditSpentTotal?: number;
  adWalletRequests?: AdWalletRequest[];
  // Client Invoices History
  clientInvoices?: ClientInvoiceRecord[];
  // Archived Monthly / Retainer Cycles History
  cycleHistory?: ClientMonthlyCycleRecord[];
}

export interface AdWalletRequest {
  id: string;
  type: 'topup' | 'spend';
  amount: number;
  platform?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  linkedInvoiceNumber?: string;
}

export type PortalRole = 'admin' | 'operations';

export type PortalTabKey =
  | 'inquiries'
  | 'clients'
  | 'tasks'
  | 'invoices'
  | 'expenses'
  | 'activity'
  | 'analytics'
  | 'packages'
  | 'projects'
  | 'banner'
  | 'backup';

export type TeamRolePreset =
  | 'content_creator'
  | 'account_manager'
  | 'media_buyer'
  | 'video_editor'
  | 'accountant'
  | 'custom';

export type WorkflowStageKey =
  | 'content_creator'
  | 'visual_design'
  | 'final_design'
  | 'client_approve'
  | 'publish';

export interface TeamMemberPermissions {
  allowedTabs: PortalTabKey[];
  canViewFinancials: boolean;
  canEditClients: boolean;
  canDeleteRecords: boolean;
  canManageTeam: boolean;
  onlyAssignedTasks: boolean;
  allowedWorkflowStages?: WorkflowStageKey[];
  canUpdateReelsTrack?: boolean;
  canAssignTasks?: boolean;
  canManageAdWallet?: boolean;
  canApproveAdWallet?: boolean;
  canStartNewCycle?: boolean;
}

export interface AgencyTeamMember {
  id: string;
  name: string;
  roleTitle: string;
  rolePreset?: TeamRolePreset;
  username?: string;
  passwordHash?: string;
  permissions?: TeamMemberPermissions;
  active: boolean;
  createdAt?: string;
}

export type ExpenseCategory =
  | 'salaries'
  | 'freelancers'
  | 'project_cost'
  | 'tools'
  | 'rent'
  | 'admin_finance'
  | 'ads'
  | 'other';

export type ExpenseGroup = 'payroll' | 'direct_cogs' | 'fixed_ops' | 'admin_finance';

export interface AgencyExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD (legacy / primary date)
  accrualMonth?: string; // YYYY-MM (شهر الاستحقاق في قائمة الأرباح والخسائر)
  paymentDate?: string; // YYYY-MM-DD (تاريخ الدفع الفعلي للتدفق النقدي)
  paymentStatus?: 'paid' | 'accrued_unpaid'; // مدفوع أم مستحق لم يُدفع بعد
  vendorName?: string; // المورد / المستفيد
  linkedClientId?: string; // العميل المرتبط (اختياري للتكلفة المباشرة)
  linkedClientName?: string;
  attachmentName?: string; // اسم المستند / الإيصال
  attachmentUrl?: string; // رابط أو مرجع المستند
  isDirectCost?: boolean; // تكلفة تنفيذ مباشرة (COGS) تُخصم قبل مجمل الربح
  paymentMethod?: string;
  recurring?: boolean;
  notes?: string;
  voided?: boolean; // إلغاء موثق بدون مسح الأثر التاريخي
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
  createdAt: string;
}

export type PaymentChannel = 'instapay' | 'ewallet' | 'bank_transfer' | 'cash';

export interface InvoicePaymentEntry {
  id: string;
  receiptNumber: string; // e.g. 'DE-RCP-202611-001'
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentChannel;
  methodLabel: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface ClientInvoiceRecord {
  id: string; // e.g. 'INV-2026-101-01'
  invoiceNumber: string; // e.g. 'DE-INV-202611-101'
  clientId: string;
  clientName: string;
  clientCompany?: string;
  clientPhone?: string;
  sector?: SectorType;
  issueDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  serviceStartDate?: string; // YYYY-MM-DD (بداية فترة الخدمة لتوزيع الإيراد المستحق)
  serviceEndDate?: string; // YYYY-MM-DD (نهاية فترة الخدمة)
  packageName: string;
  retainerAmount: number;
  adCreditAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal: number;
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  contractPeriod?: string;
  adFundsTreatment?: 'client_passthrough' | 'agency_principal';
  isDraft?: boolean;
  paymentStatus: 'paid' | 'pending' | 'partially_paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  paymentMethod?: string; // e.g. 'تحويل بنكي', 'فودافون كاش', 'إنستاباي'
  paidAmount?: number;
  payments?: InvoicePaymentEntry[];
  deliverables?: {
    posts?: number;
    reels?: number;
    stories?: number;
    notes?: string;
  };
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
}

export interface FinancialAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  entityType: 'invoice' | 'payment' | 'expense' | 'ad_wallet' | 'month_close' | 'settings';
  entityId: string;
  entityLabel?: string;
  action:
    | 'create'
    | 'update'
    | 'void'
    | 'delete_draft'
    | 'payment_recorded'
    | 'payment_removed'
    | 'month_closed'
    | 'month_reopened'
    | 'settings_updated';
  beforeSummary?: string;
  afterSummary?: string;
  reason?: string;
}

export type MonthCloseStepKey =
  | 'revenue_review'
  | 'collections_reconcile'
  | 'ad_funds_reconcile'
  | 'expenses_accruals'
  | 'client_profitability'
  | 'monthly_report'
  | 'approve_and_lock';

export interface MonthlyCloseRecord {
  monthKey: string; // YYYY-MM
  status: 'open' | 'closed';
  steps: Record<MonthCloseStepKey, boolean>;
  closedAt?: string;
  closedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
  notes?: string;
}

export type SharedCostAllocationRule = 'equal' | 'deliverables_weight' | 'revenue_weight';

export interface FinancialSettings {
  openingCashBalance: number;
  openingCashDate: string; // YYYY-MM-DD
  sharedCostAllocationRule: SharedCostAllocationRule;
  taxRatePercent?: number;
  adFundsDefaultPolicy?: 'client_passthrough' | 'agency_principal';
}

export interface AccountLedgerEntry {
  id: string;
  date: string; // YYYY-MM-DD or ISO
  type: 'invoice' | 'payment' | 'ad_deposit' | 'ad_spend' | 'adjustment';
  title: string;
  titleEn?: string;
  reference?: string; // e.g. invoice # or payment ref
  debit?: number; // مدين (مستحق على العميل / مصروف)
  credit?: number; // دائن (مدفوع من العميل)
  balance: number; // الرصيد التراكمي بعد الحركة
  platform?: string; // e.g. Meta Ads, TikTok
  notes?: string;
}

export interface SectorUnitRates {
  baseFee: number;
  postPrice: number;
  reelPrice: number;
  storyPrice: number;
  filmingSessionPrice?: number;
}

export interface CustomPackagePricingRates {
  b2c: SectorUnitRates;
  b2b: SectorUnitRates;
  medical: SectorUnitRates;
  discounts: {
    quarterlyDiscountPercent: number; // e.g. 15
    semiAnnualDiscountPercent: number; // e.g. 20
    annualDiscountPercent: number; // e.g. 25
  };
}

export interface AgencyDataState {
  caseStudies: CaseStudy[];
  packages: ServicePackage[];
  promoCodes?: PromoCode[];
  customRates?: CustomPackagePricingRates;
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
  invoices?: ClientInvoiceRecord[];
  expenses?: AgencyExpense[];
  teamMembers?: AgencyTeamMember[];
  opsAccessCode?: string;
  opsAccountEmails?: string[];
  financialAuditLog?: FinancialAuditEntry[];
  closedMonths?: Record<string, MonthlyCloseRecord>;
  financialSettings?: FinancialSettings;
}


