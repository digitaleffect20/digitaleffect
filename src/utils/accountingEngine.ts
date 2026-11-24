import {
  AgencyExpense,
  ClientInvoiceRecord,
  ExpenseCategory,
  ExpenseGroup,
  FinancialSettings,
  Inquiry,
  MonthCloseStepKey,
  MonthlyCloseRecord,
  ServicePackage,
  SharedCostAllocationRule,
} from '../types';
import { getClientDeliverableTargets } from './workflowUtils';

export const ARABIC_MONTH_NAMES = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const ENGLISH_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  openingCashBalance: 0,
  openingCashDate: `${new Date().getFullYear()}-01-01`,
  sharedCostAllocationRule: 'deliverables_weight',
  taxRatePercent: 0,
  adFundsDefaultPolicy: 'client_passthrough',
};

export const MONTH_CLOSE_STEP_DEFINITIONS: Array<{
  key: MonthCloseStepKey;
  order: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}> = [
  {
    key: 'revenue_review',
    order: 1,
    titleAr: 'مراجعة الإيرادات وتوزيع الفواتير متعددة الأشهر',
    titleEn: 'Review Revenue & Multi-Month Proration',
    descAr: 'التأكد من إصدار فواتير العملاء النشطين وتوزيع الفواتير ربع السنوية على أشهر الخدمة المستحقة.',
    descEn: 'Verify active client invoices and ensure multi-month retainers are prorated across service months.',
  },
  {
    key: 'collections_reconcile',
    order: 2,
    titleAr: 'مطابقة التحصيلات مع البنك والمحافظ والإيصالات',
    titleEn: 'Reconcile Bank, Wallets & Receipts',
    descAr: 'مطابقة كل دفعة مسجلة مع كشف الحساب البنكي أو إنستاباي وعدم وجود مراجع تحويل مكررة.',
    descEn: 'Match every recorded payment against bank/InstaPay statements with zero duplicate references.',
  },
  {
    key: 'ad_funds_reconcile',
    order: 3,
    titleAr: 'تسوية ميزانيات إعلانات العملاء',
    titleEn: 'Reconcile Client Ad Funds',
    descAr: 'مراجعة المنصرف الفعلي على المنصات الإعلانية مقابل المبالغ المحصلة والرصيد المتبقي لكل عميل.',
    descEn: 'Verify actual ad platform spend against funded client ad budgets and remaining balances.',
  },
  {
    key: 'expenses_accruals',
    order: 4,
    titleAr: 'مراجعة المصروفات والرواتب والمستحقات',
    titleEn: 'Verify Expenses, Payroll & Accruals',
    descAr: 'التأكد من تسجيل الرواتب والمصروفات التشغيلية الثابتة والتكاليف المباشرة غير المسددة كمستحقات.',
    descEn: 'Confirm payroll, fixed operating costs, and unpaid accrued expenses are recorded for the month.',
  },
  {
    key: 'client_profitability',
    order: 5,
    titleAr: 'احتساب ومراجعة ربحية كل عميل',
    titleEn: 'Review Per-Client Profitability',
    descAr: 'فحص هامش المساهمة لكل عميل وتحديد الحسابات التي تتطلب إعادة تسعير أو ضبط نطاق عمل.',
    descEn: 'Inspect contribution margins per client and flag underpriced or scope-creeping accounts.',
  },
  {
    key: 'monthly_report',
    order: 6,
    titleAr: 'إصدار التقرير الشهري المتكامل (P&L + التدفق النقدي + أعمار الديون)',
    titleEn: 'Generate Monthly Financial Package',
    descAr: 'مراجعة قائمة الأرباح والخسائر، التدفق النقدي المنفصل، وأعمار ديون العملاء.',
    descEn: 'Review accrual P&L, separate cash flow statement, and receivables aging report.',
  },
  {
    key: 'approve_and_lock',
    order: 7,
    titleAr: 'اعتماد وإقفال الشهر المالي',
    titleEn: 'Approve & Lock Financial Month',
    descAr: 'قفل الشهر لمنع أي تعديل مباشر بأثر رجعي إلا عبر قيد تسوية موثق في سجل الرقابة.',
    descEn: 'Lock the month against direct retroactive edits except via documented audited adjustments.',
  },
];

export function createEmptyMonthCloseRecord(monthKey: string): MonthlyCloseRecord {
  return {
    monthKey,
    status: 'open',
    steps: {
      revenue_review: false,
      collections_reconcile: false,
      ad_funds_reconcile: false,
      expenses_accruals: false,
      client_profitability: false,
      monthly_report: false,
      approve_and_lock: false,
    },
  };
}

export function extractMonthKey(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const match = String(dateStr).trim().match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : null;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonthKey(monthKey: string, deltaMonths: number): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr) || new Date().getFullYear();
  const m = Number(mStr) || 1;
  const d = new Date(y, m - 1 + deltaMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getLastNMonthKeys(anchorMonthKey: string, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    out.push(shiftMonthKey(anchorMonthKey, -i));
  }
  return out;
}

export function formatMonthTitle(monthKey: string, isAr: boolean, shortYear = false): string {
  const [yStr, mStr] = monthKey.split('-');
  const mIdx = Math.max(0, Math.min(11, (parseInt(mStr, 10) || 1) - 1));
  const mName = isAr ? ARABIC_MONTH_NAMES[mIdx] : ENGLISH_MONTH_NAMES[mIdx];
  const yr = shortYear ? (yStr || '').slice(-2) : yStr || '';
  return `${mName} ${yr}`;
}

export function getExpenseGroup(expense: Pick<AgencyExpense, 'category' | 'isDirectCost'>): ExpenseGroup {
  if (expense.category === 'salaries') return 'payroll';
  if (expense.isDirectCost || expense.category === 'freelancers' || expense.category === 'project_cost') {
    return 'direct_cogs';
  }
  if (expense.category === 'rent' || expense.category === 'tools') return 'fixed_ops';
  return 'admin_finance';
}

export function getExpenseCategoryMeta(category: ExpenseCategory) {
  const map: Record<
    ExpenseCategory,
    { labelAr: string; labelEn: string; group: ExpenseGroup; groupAr: string; groupEn: string }
  > = {
    salaries: {
      labelAr: 'رواتب وأجور الفريق',
      labelEn: 'Team Salaries & Payroll',
      group: 'payroll',
      groupAr: 'الرواتب والأجور',
      groupEn: 'Payroll & Wages',
    },
    freelancers: {
      labelAr: 'مستقلون وتنفيذ محتوى',
      labelEn: 'Freelancers & Production',
      group: 'direct_cogs',
      groupAr: 'تكاليف تنفيذ مباشرة (COGS)',
      groupEn: 'Direct Delivery Costs',
    },
    project_cost: {
      labelAr: 'تكاليف مشاريع مباشرة (تصوير/مونتاج)',
      labelEn: 'Direct Project Costs (Filming/Editing)',
      group: 'direct_cogs',
      groupAr: 'تكاليف تنفيذ مباشرة (COGS)',
      groupEn: 'Direct Delivery Costs',
    },
    rent: {
      labelAr: 'إيجار ومرافق وإنترنت',
      labelEn: 'Rent, Utilities & Internet',
      group: 'fixed_ops',
      groupAr: 'التشغيل الثابت',
      groupEn: 'Fixed Operating',
    },
    tools: {
      labelAr: 'أدوات واشتراكات واستضافة',
      labelEn: 'Software, Tools & Hosting',
      group: 'fixed_ops',
      groupAr: 'التشغيل الثابت',
      groupEn: 'Fixed Operating',
    },
    admin_finance: {
      labelAr: 'مصروفات إدارية وبنكية وتحويلات',
      labelEn: 'Admin, Bank & Transfer Fees',
      group: 'admin_finance',
      groupAr: 'الإدارة والمالية',
      groupEn: 'Admin & Finance',
    },
    ads: {
      labelAr: 'إعلانات وتسويق الوكالة (داخلي)',
      labelEn: 'Agency Own Marketing',
      group: 'admin_finance',
      groupAr: 'الإدارة والمالية',
      groupEn: 'Admin & Finance',
    },
    other: {
      labelAr: 'مصروفات عامة أخرى',
      labelEn: 'Other General Expenses',
      group: 'admin_finance',
      groupAr: 'الإدارة والمالية',
      groupEn: 'Admin & Finance',
    },
  };
  return map[category] || map.other;
}

export function getExpenseAccrualMonth(exp: AgencyExpense): string {
  return extractMonthKey(exp.accrualMonth) || extractMonthKey(exp.date) || getCurrentMonthKey();
}

export function getExpensePaymentMonth(exp: AgencyExpense): string | null {
  if (exp.paymentStatus === 'accrued_unpaid') return null;
  return extractMonthKey(exp.paymentDate) || extractMonthKey(exp.date);
}

/**
 * Compute all service months (YYYY-MM) covered by an invoice for accrual revenue recognition.
 */
export function getInvoiceServiceMonths(inv: ClientInvoiceRecord): string[] {
  const startMonth =
    extractMonthKey(inv.serviceStartDate) || extractMonthKey(inv.issueDate) || getCurrentMonthKey();

  if (inv.serviceStartDate && inv.serviceEndDate) {
    const endMonth = extractMonthKey(inv.serviceEndDate);
    if (endMonth && endMonth >= startMonth) {
      const months: string[] = [];
      let cursor = startMonth;
      let guard = 0;
      while (cursor <= endMonth && guard < 24) {
        months.push(cursor);
        cursor = shiftMonthKey(cursor, 1);
        guard++;
      }
      if (months.length > 0) return months;
    }
  }

  // Fallback to billing cycle duration
  const span =
    inv.billingCycle === 'annual' ? 12 : inv.billingCycle === 'quarterly' ? 3 : 1;
  const months: string[] = [];
  for (let i = 0; i < span; i++) {
    months.push(shiftMonthKey(startMonth, i));
  }
  return months;
}

/**
 * Recognizable agency service revenue for an invoice (excludes client passthrough ad funds by default).
 */
export function getInvoiceRecognizableAgencyRevenue(inv: ClientInvoiceRecord): number {
  const retainerNet = Math.max(0, (Number(inv.retainerAmount) || 0) - (Number(inv.discountAmount) || 0));
  if (inv.adFundsTreatment === 'agency_principal') {
    return retainerNet + Math.max(0, Number(inv.adCreditAmount) || 0);
  }
  return retainerNet;
}

export function getInvoicePaidAmount(inv: ClientInvoiceRecord): number {
  if (inv.paymentStatus === 'cancelled') return 0;
  const paymentsSum = Array.isArray(inv.payments)
    ? inv.payments.reduce((s, p) => s + Math.max(0, Number(p.amount) || 0), 0)
    : 0;
  if (paymentsSum > 0) {
    return Math.min(Number(inv.grandTotal) || paymentsSum, paymentsSum);
  }
  if (inv.paymentStatus === 'paid') {
    return Math.max(0, Number(inv.grandTotal) || 0);
  }
  return Math.min(Number(inv.grandTotal) || 0, Math.max(0, Number(inv.paidAmount) || 0));
}

export interface InvoiceMonthAllocation {
  invoice: ClientInvoiceRecord;
  monthKey: string;
  allocatedRevenue: number;
  allocatedTax: number;
  totalMonths: number;
  monthIndex: number; // 1-based
  isProrated: boolean;
  fullAgencyRevenue: number;
}

/**
 * Splits an invoice's net agency revenue cleanly across its covered service months.
 */
export function allocateInvoiceRevenueByMonth(inv: ClientInvoiceRecord): InvoiceMonthAllocation[] {
  if (inv.paymentStatus === 'cancelled' || inv.isDraft) return [];
  const months = getInvoiceServiceMonths(inv);
  const fullAgencyRevenue = getInvoiceRecognizableAgencyRevenue(inv);
  const fullTax = Math.max(0, Number(inv.taxAmount) || 0);
  const count = Math.max(1, months.length);

  const baseShare = Math.floor((fullAgencyRevenue / count) * 100) / 100;
  const remainder = Math.round((fullAgencyRevenue - baseShare * count) * 100) / 100;

  const baseTax = Math.floor((fullTax / count) * 100) / 100;
  const taxRem = Math.round((fullTax - baseTax * count) * 100) / 100;

  return months.map((mKey, idx) => ({
    invoice: inv,
    monthKey: mKey,
    allocatedRevenue: Math.round((baseShare + (idx === 0 ? remainder : 0)) * 100) / 100,
    allocatedTax: Math.round((baseTax + (idx === 0 ? taxRem : 0)) * 100) / 100,
    totalMonths: count,
    monthIndex: idx + 1,
    isProrated: count > 1,
    fullAgencyRevenue,
  }));
}

export interface DrillDownItem {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  categoryLabel?: string;
  amount: number;
  statusLabel?: string;
  type: 'revenue' | 'expense' | 'cash_in' | 'cash_out' | 'ad_fund' | 'receivable' | 'payable';
}

export interface MonthlyPnLResult {
  monthKey: string;
  earnedServiceRevenue: number;
  directDeliveryCosts: number;
  grossProfit: number;
  grossMarginPct: number;
  accruedPayroll: number;
  fixedOpsExpenses: number;
  adminFinanceExpenses: number;
  operatingExpenses: number;
  totalAccruedExpenses: number;
  netProfitBeforeTax: number;
  netMarginPct: number;
  recordedTaxes: number;
  deferredRevenueAsOfMonthEnd: number;
  accruedUncollectedRevenue: number;
  accruedPayablesUnpaid: number;
  revenueItems: InvoiceMonthAllocation[];
  directCostItems: AgencyExpense[];
  payrollItems: AgencyExpense[];
  fixedOpsItems: AgencyExpense[];
  adminFinanceItems: AgencyExpense[];
  unpaidPayableItems: AgencyExpense[];
  completenessWarningsAr: string[];
  completenessWarningsEn: string[];
  prevMonth?: {
    monthKey: string;
    earnedServiceRevenue: number;
    totalAccruedExpenses: number;
    grossProfit: number;
    netProfitBeforeTax: number;
    revenueDeltaPct: number | null;
    expensesDeltaPct: number | null;
    netProfitDelta: number;
  };
}

function computeSingleMonthPnLCore(
  monthKey: string,
  invoices: ClientInvoiceRecord[],
  expenses: AgencyExpense[]
) {
  const activeInvoices = invoices.filter(
    (inv) => inv.paymentStatus !== 'cancelled' && !inv.isDraft
  );
  const activeExpenses = expenses.filter((exp) => !exp.voided);

  const revenueItems: InvoiceMonthAllocation[] = [];
  let earnedServiceRevenue = 0;
  let recordedTaxes = 0;
  let deferredRevenueAsOfMonthEnd = 0;
  let accruedUncollectedRevenue = 0;

  activeInvoices.forEach((inv) => {
    const allocations = allocateInvoiceRevenueByMonth(inv);
    allocations.forEach((alloc) => {
      if (alloc.monthKey === monthKey) {
        revenueItems.push(alloc);
        earnedServiceRevenue += alloc.allocatedRevenue;
        recordedTaxes += alloc.allocatedTax;
      }
    });

    // Compute agency-portion collected on or before end of `monthKey`
    const fullAgencyRev = getInvoiceRecognizableAgencyRevenue(inv);
    const grandTotal = Math.max(1, Number(inv.grandTotal) || fullAgencyRev || 1);
    const agencyRatio = Math.min(1, fullAgencyRev / grandTotal);

    let paidUpToMonthEnd = 0;
    if (Array.isArray(inv.payments) && inv.payments.length > 0) {
      inv.payments.forEach((p) => {
        const pm = extractMonthKey(p.date || inv.issueDate);
        if (pm && pm <= monthKey) {
          paidUpToMonthEnd += Math.max(0, Number(p.amount) || 0);
        }
      });
    } else if (inv.paymentStatus === 'paid') {
      const pm = extractMonthKey(inv.paidAt || inv.issueDate);
      if (pm && pm <= monthKey) {
        paidUpToMonthEnd = Number(inv.grandTotal) || 0;
      }
    } else if ((inv.paidAmount || 0) > 0) {
      const pm = extractMonthKey(inv.issueDate);
      if (pm && pm <= monthKey) {
        paidUpToMonthEnd = Number(inv.paidAmount) || 0;
      }
    }

    const agencyCollectedUpToMonth = Math.min(fullAgencyRev, paidUpToMonthEnd * agencyRatio);
    const earnedUpToMonth = allocations
      .filter((a) => a.monthKey <= monthKey)
      .reduce((s, a) => s + a.allocatedRevenue, 0);

    if (agencyCollectedUpToMonth > earnedUpToMonth) {
      deferredRevenueAsOfMonthEnd += agencyCollectedUpToMonth - earnedUpToMonth;
    } else if (earnedUpToMonth > agencyCollectedUpToMonth) {
      accruedUncollectedRevenue += earnedUpToMonth - agencyCollectedUpToMonth;
    }
  });

  const directCostItems: AgencyExpense[] = [];
  const payrollItems: AgencyExpense[] = [];
  const fixedOpsItems: AgencyExpense[] = [];
  const adminFinanceItems: AgencyExpense[] = [];
  const unpaidPayableItems: AgencyExpense[] = [];

  activeExpenses.forEach((exp) => {
    const accMonth = getExpenseAccrualMonth(exp);
    const amt = Math.max(0, Number(exp.amount) || 0);

    if (exp.paymentStatus === 'accrued_unpaid' && accMonth <= monthKey) {
      unpaidPayableItems.push(exp);
    }

    if (accMonth !== monthKey) return;

    const grp = getExpenseGroup(exp);
    if (grp === 'direct_cogs') directCostItems.push(exp);
    else if (grp === 'payroll') payrollItems.push(exp);
    else if (grp === 'fixed_ops') fixedOpsItems.push(exp);
    else adminFinanceItems.push(exp);
    void amt;
  });

  const sumAmt = (arr: AgencyExpense[]) =>
    arr.reduce((s, e) => s + Math.max(0, Number(e.amount) || 0), 0);

  const directDeliveryCosts = sumAmt(directCostItems);
  const accruedPayroll = sumAmt(payrollItems);
  const fixedOpsExpenses = sumAmt(fixedOpsItems);
  const adminFinanceExpenses = sumAmt(adminFinanceItems);
  const operatingExpenses = fixedOpsExpenses + adminFinanceExpenses;
  const totalAccruedExpenses = directDeliveryCosts + accruedPayroll + operatingExpenses;

  const grossProfit = earnedServiceRevenue - directDeliveryCosts;
  const grossMarginPct =
    earnedServiceRevenue > 0 ? Math.round((grossProfit / earnedServiceRevenue) * 1000) / 10 : 0;

  const netProfitBeforeTax = grossProfit - accruedPayroll - operatingExpenses;
  const netMarginPct =
    earnedServiceRevenue > 0
      ? Math.round((netProfitBeforeTax / earnedServiceRevenue) * 1000) / 10
      : 0;

  const accruedPayablesUnpaid = sumAmt(unpaidPayableItems);

  const completenessWarningsAr: string[] = [];
  const completenessWarningsEn: string[] = [];

  if (accruedPayroll > 0 && fixedOpsExpenses === 0 && adminFinanceExpenses === 0) {
    completenessWarningsAr.push(
      'تنبيه اكتمال البيانات: تم تسجيل الرواتب لهذا الشهر دون تسجيل مصروفات تشغيلية أو إدارية (إيجار، إنترنت، اشتراكات، عمولات بنكية) — يجب حصرها ولا تُفترض صفراً.'
    );
    completenessWarningsEn.push(
      'Data Completeness Warning: Payroll is recorded for this month, but zero fixed operating or admin expenses are logged. Verify all overhead costs before finalizing.'
    );
  }
  if (earnedServiceRevenue > 0 && accruedPayroll === 0 && totalAccruedExpenses === 0) {
    completenessWarningsAr.push(
      'تنبيه: توجد إيرادات مكتسبة لهذا الشهر ولكن لم تُسجَّل أي رواتب أو مصروفات مستحقة بعد — لا تعتمد رقم الربح قبل استكمال المصروفات.'
    );
    completenessWarningsEn.push(
      'Warning: Earned revenue exists for this month with zero accrued expenses or payroll logged yet.'
    );
  }
  const hasMultiMonthWithoutDates = revenueItems.some(
    (item) =>
      item.invoice.billingCycle &&
      item.invoice.billingCycle !== 'monthly' &&
      (!item.invoice.serviceStartDate || !item.invoice.serviceEndDate)
  );
  if (hasMultiMonthWithoutDates) {
    completenessWarningsAr.push(
      'ملاحظة توزيع إيراد: توجد فاتورة متعددة الأشهر تم توزيعها تلقائياً حسب دورة التعاقد لعدم تحديد تاريخ بداية ونهاية الخدمة صراحةً.'
    );
    completenessWarningsEn.push(
      'Proration note: A multi-month invoice was auto-prorated by billing cycle because explicit service start/end dates were not set.'
    );
  }

  return {
    monthKey,
    earnedServiceRevenue: Math.round(earnedServiceRevenue * 100) / 100,
    directDeliveryCosts: Math.round(directDeliveryCosts * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMarginPct,
    accruedPayroll: Math.round(accruedPayroll * 100) / 100,
    fixedOpsExpenses: Math.round(fixedOpsExpenses * 100) / 100,
    adminFinanceExpenses: Math.round(adminFinanceExpenses * 100) / 100,
    operatingExpenses: Math.round(operatingExpenses * 100) / 100,
    totalAccruedExpenses: Math.round(totalAccruedExpenses * 100) / 100,
    netProfitBeforeTax: Math.round(netProfitBeforeTax * 100) / 100,
    netMarginPct,
    recordedTaxes: Math.round(recordedTaxes * 100) / 100,
    deferredRevenueAsOfMonthEnd: Math.round(deferredRevenueAsOfMonthEnd * 100) / 100,
    accruedUncollectedRevenue: Math.round(accruedUncollectedRevenue * 100) / 100,
    accruedPayablesUnpaid: Math.round(accruedPayablesUnpaid * 100) / 100,
    revenueItems,
    directCostItems,
    payrollItems,
    fixedOpsItems,
    adminFinanceItems,
    unpaidPayableItems,
    completenessWarningsAr,
    completenessWarningsEn,
  };
}

export function computeMonthlyPnL(
  monthKey: string,
  invoices: ClientInvoiceRecord[],
  expenses: AgencyExpense[]
): MonthlyPnLResult {
  const current = computeSingleMonthPnLCore(monthKey, invoices, expenses);
  const prevKey = shiftMonthKey(monthKey, -1);
  const prev = computeSingleMonthPnLCore(prevKey, invoices, expenses);

  const calcDeltaPct = (currVal: number, prevVal: number): number | null => {
    if (prevVal === 0) return currVal === 0 ? 0 : null;
    return Math.round(((currVal - prevVal) / Math.abs(prevVal)) * 1000) / 10;
  };

  return {
    ...current,
    prevMonth: {
      monthKey: prevKey,
      earnedServiceRevenue: prev.earnedServiceRevenue,
      totalAccruedExpenses: prev.totalAccruedExpenses,
      grossProfit: prev.grossProfit,
      netProfitBeforeTax: prev.netProfitBeforeTax,
      revenueDeltaPct: calcDeltaPct(current.earnedServiceRevenue, prev.earnedServiceRevenue),
      expensesDeltaPct: calcDeltaPct(current.totalAccruedExpenses, prev.totalAccruedExpenses),
      netProfitDelta: Math.round((current.netProfitBeforeTax - prev.netProfitBeforeTax) * 100) / 100,
    },
  };
}

export interface MonthlyCashFlowResult {
  monthKey: string;
  agencyCashInflows: number;
  clientAdFundsCashInflows: number;
  taxCashInflows: number;
  totalCashInflows: number;
  paidExpensesOutflow: number;
  approvedAdSpendOutflow: number;
  totalCashOutflows: number;
  agencyNetCashFlow: number; // الفرق النقدي للوكالة — NOT Net Profit!
  totalNetCashFlow: number;
  openingCashBalance: number;
  estimatedAgencyAvailableLiquidity: number;
  heldClientAdFundsLiability: number;
  totalBankAndWalletsEstimate: number;
  cashInItems: DrillDownItem[];
  cashOutItems: DrillDownItem[];
}

export function computeMonthlyCashFlow(
  monthKey: string,
  invoices: ClientInvoiceRecord[],
  expenses: AgencyExpense[],
  clients: Inquiry[],
  settings?: FinancialSettings
): MonthlyCashFlowResult {
  const cfg = settings || DEFAULT_FINANCIAL_SETTINGS;
  const activeInvoices = invoices.filter(
    (inv) => inv.paymentStatus !== 'cancelled' && !inv.isDraft
  );
  const activeExpenses = expenses.filter((exp) => !exp.voided);

  let agencyCashInflows = 0;
  let clientAdFundsCashInflows = 0;
  let taxCashInflows = 0;
  let paidExpensesOutflow = 0;
  let approvedAdSpendOutflow = 0;

  let cumulativeAgencyCashIn = 0;
  let cumulativeAgencyPaidOut = 0;

  const cashInItems: DrillDownItem[] = [];
  const cashOutItems: DrillDownItem[] = [];

  const openingMonth = extractMonthKey(cfg.openingCashDate) || '2000-01';

  activeInvoices.forEach((inv) => {
    const adAmt =
      inv.adFundsTreatment === 'agency_principal' ? 0 : Math.max(0, Number(inv.adCreditAmount) || 0);
    const taxAmt = Math.max(0, Number(inv.taxAmount) || 0);
    const grandTotal = Math.max(1, Number(inv.grandTotal) || 0);
    const adRatio = Math.min(1, adAmt / grandTotal);
    const taxRatio = Math.min(Math.max(0, 1 - adRatio), taxAmt / grandTotal);
    const agencyRatio = Math.max(0, 1 - adRatio - taxRatio);

    const recordCashReceipt = (amount: number, dateStr: string, refLabel: string) => {
      const mKey = extractMonthKey(dateStr);
      if (!mKey || amount <= 0) return;
      const agShare = Math.round(amount * agencyRatio * 100) / 100;
      const adShare = Math.round(amount * adRatio * 100) / 100;
      const taxShare = Math.round(amount * taxRatio * 100) / 100;

      if (mKey >= openingMonth && mKey <= monthKey) {
        cumulativeAgencyCashIn += agShare;
      }

      if (mKey === monthKey) {
        agencyCashInflows += agShare;
        clientAdFundsCashInflows += adShare;
        taxCashInflows += taxShare;
        const breakdownParts: string[] = [];
        if (adShare > 0 || taxShare > 0) {
          breakdownParts.push(`أتعاب: ${agShare.toLocaleString()}`);
          if (adShare > 0) breakdownParts.push(`إعلانات: ${adShare.toLocaleString()}`);
          if (taxShare > 0) breakdownParts.push(`ضرائب: ${taxShare.toLocaleString()}`);
        }
        cashInItems.push({
          id: `${inv.id}-${refLabel}-${dateStr}`,
          date: dateStr,
          title: `${inv.clientCompany || inv.clientName} — ${inv.invoiceNumber}`,
          subtitle:
            breakdownParts.length > 0
              ? `${refLabel} (${breakdownParts.join(' + ')})`
              : refLabel,
          categoryLabel:
            adShare > 0
              ? 'تحصيل مختلط (أتعاب + إعلانات)'
              : taxShare > 0
              ? 'تحصيل أتعاب + ضرائب منفصلة'
              : 'تحصيل أتعاب وكالة',
          amount,
          type: 'cash_in',
        });
      }
    };

    if (Array.isArray(inv.payments) && inv.payments.length > 0) {
      inv.payments.forEach((p) => {
        recordCashReceipt(
          Math.max(0, Number(p.amount) || 0),
          p.date || inv.issueDate,
          p.receiptNumber || p.methodLabel || 'دفعة'
        );
      });
    } else if (inv.paymentStatus === 'paid') {
      recordCashReceipt(
        Math.max(0, Number(inv.grandTotal) || 0),
        inv.paidAt || inv.issueDate,
        inv.paymentMethod || 'تحصيل كامل'
      );
    } else if ((inv.paidAmount || 0) > 0) {
      recordCashReceipt(
        Math.max(0, Number(inv.paidAmount) || 0),
        inv.paidAt || inv.issueDate,
        'دفعة جزئية'
      );
    }
  });

  activeExpenses.forEach((exp) => {
    const payMonth = getExpensePaymentMonth(exp);
    if (!payMonth) return; // accrued_unpaid does NOT reduce cash yet!
    const amt = Math.max(0, Number(exp.amount) || 0);

    if (payMonth >= openingMonth && payMonth <= monthKey) {
      cumulativeAgencyPaidOut += amt;
    }

    if (payMonth === monthKey) {
      paidExpensesOutflow += amt;
      const meta = getExpenseCategoryMeta(exp.category);
      cashOutItems.push({
        id: exp.id,
        date: exp.paymentDate || exp.date,
        title: exp.title,
        subtitle: exp.vendorName || exp.paymentMethod || meta.labelAr,
        categoryLabel: meta.labelAr,
        amount: amt,
        type: 'cash_out',
      });
    }
  });

  // Track approved client ad spend outflows separately (passthrough cash out)
  clients.forEach((client) => {
    (client.adWalletRequests || []).forEach((req) => {
      if (req.type !== 'spend' || req.status !== 'approved') return;
      const spendMonth = extractMonthKey(req.reviewedAt || req.requestedAt);
      if (spendMonth === monthKey) {
        const amt = Math.max(0, Number(req.amount) || 0);
        approvedAdSpendOutflow += amt;
        cashOutItems.push({
          id: req.id,
          date: (req.reviewedAt || req.requestedAt || '').split('T')[0],
          title: `صرف إعلاني — ${client.company || client.name}`,
          subtitle: req.platform || 'منصة إعلانية',
          categoryLabel: 'أموال إعلانات العملاء (خارج مصروفات الوكالة)',
          amount: amt,
          type: 'ad_fund',
        });
      }
    });
  });

  const totalCashInflows =
    Math.round((agencyCashInflows + clientAdFundsCashInflows + taxCashInflows) * 100) / 100;
  const totalCashOutflows = Math.round((paidExpensesOutflow + approvedAdSpendOutflow) * 100) / 100;
  const agencyNetCashFlow = Math.round((agencyCashInflows - paidExpensesOutflow) * 100) / 100;
  const totalNetCashFlow = Math.round((totalCashInflows - totalCashOutflows) * 100) / 100;

  const heldClientAdFundsLiability = clients.reduce(
    (s, c) => s + Math.max(0, Number(c.adCreditBalance) || 0),
    0
  );
  const openingCashBalance = Number(cfg.openingCashBalance) || 0;
  const estimatedAgencyAvailableLiquidity =
    Math.round((openingCashBalance + cumulativeAgencyCashIn - cumulativeAgencyPaidOut) * 100) / 100;

  return {
    monthKey,
    agencyCashInflows: Math.round(agencyCashInflows * 100) / 100,
    clientAdFundsCashInflows: Math.round(clientAdFundsCashInflows * 100) / 100,
    taxCashInflows: Math.round(taxCashInflows * 100) / 100,
    totalCashInflows,
    paidExpensesOutflow: Math.round(paidExpensesOutflow * 100) / 100,
    approvedAdSpendOutflow: Math.round(approvedAdSpendOutflow * 100) / 100,
    totalCashOutflows,
    agencyNetCashFlow,
    totalNetCashFlow,
    openingCashBalance,
    estimatedAgencyAvailableLiquidity,
    heldClientAdFundsLiability: Math.round(heldClientAdFundsLiability * 100) / 100,
    totalBankAndWalletsEstimate:
      Math.round((estimatedAgencyAvailableLiquidity + heldClientAdFundsLiability) * 100) / 100,
    cashInItems,
    cashOutItems,
  };
}

export interface ReceivableAgingItem {
  invoice: ClientInvoiceRecord;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  daysOutstanding: number;
  bucket: '0_30' | '31_60' | '61_90' | '90_plus';
  referenceDate: string;
}

export interface ReceivablesAgingSummary {
  totalReceivables: number;
  bucket0_30: number;
  bucket31_60: number;
  bucket61_90: number;
  bucket90Plus: number;
  overdueCount: number;
  items: ReceivableAgingItem[];
}

export function computeReceivablesAging(
  invoices: ClientInvoiceRecord[],
  asOfDateStr?: string
): ReceivablesAgingSummary {
  const refTime = new Date(asOfDateStr || new Date().toISOString().split('T')[0]).getTime();
  const items: ReceivableAgingItem[] = [];

  let bucket0_30 = 0;
  let bucket31_60 = 0;
  let bucket61_90 = 0;
  let bucket90Plus = 0;
  let overdueCount = 0;

  invoices.forEach((inv) => {
    if (inv.paymentStatus === 'cancelled' || inv.isDraft) return;
    const totalAmount = Math.max(0, Number(inv.grandTotal) || 0);
    const paidAmount = getInvoicePaidAmount(inv);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    if (remainingAmount <= 0) return;

    const referenceDate = inv.dueDate || inv.issueDate;
    const invTime = new Date(referenceDate).getTime();
    const diffDays = Number.isFinite(invTime)
      ? Math.max(0, Math.floor((refTime - invTime) / (1000 * 60 * 60 * 24)))
      : 0;

    let bucket: ReceivableAgingItem['bucket'] = '0_30';
    if (diffDays > 90) {
      bucket = '90_plus';
      bucket90Plus += remainingAmount;
    } else if (diffDays > 60) {
      bucket = '61_90';
      bucket61_90 += remainingAmount;
    } else if (diffDays > 30) {
      bucket = '31_60';
      bucket31_60 += remainingAmount;
    } else {
      bucket = '0_30';
      bucket0_30 += remainingAmount;
    }

    if (
      inv.paymentStatus === 'overdue' ||
      (inv.dueDate && inv.dueDate < (asOfDateStr || new Date().toISOString().split('T')[0]))
    ) {
      overdueCount += 1;
    }

    items.push({
      invoice: inv,
      totalAmount,
      paidAmount,
      remainingAmount,
      daysOutstanding: diffDays,
      bucket,
      referenceDate,
    });
  });

  items.sort((a, b) => b.daysOutstanding - a.daysOutstanding || b.remainingAmount - a.remainingAmount);

  return {
    totalReceivables: Math.round((bucket0_30 + bucket31_60 + bucket61_90 + bucket90Plus) * 100) / 100,
    bucket0_30: Math.round(bucket0_30 * 100) / 100,
    bucket31_60: Math.round(bucket31_60 * 100) / 100,
    bucket61_90: Math.round(bucket61_90 * 100) / 100,
    bucket90Plus: Math.round(bucket90Plus * 100) / 100,
    overdueCount,
    items,
  };
}

export interface ClientProfitabilityRow {
  clientId: string;
  clientName: string;
  packageName: string;
  earnedAgencyFees: number;
  directDeliveryCosts: number;
  allocatedTeamSalaryShare: number;
  contributionMargin: number;
  contributionMarginPct: number;
  deliverablesWeight: number;
  allocationSharePct: number;
}

export function computeClientProfitability(
  monthKey: string,
  clients: Inquiry[],
  invoices: ClientInvoiceRecord[],
  expenses: AgencyExpense[],
  packages: ServicePackage[],
  allocationRule: SharedCostAllocationRule = 'deliverables_weight'
): {
  rows: ClientProfitabilityRow[];
  totalEarnedFees: number;
  totalDirectCosts: number;
  totalPayrollAllocated: number;
  totalContributionMargin: number;
} {
  const pnl = computeSingleMonthPnLCore(monthKey, invoices, expenses);
  const activeExpenses = expenses.filter(
    (e) => !e.voided && getExpenseAccrualMonth(e) === monthKey
  );

  // Build map of clients that have earned fees in this month OR are active closed clients OR have linked direct expenses
  const clientMap = new Map<
    string,
    {
      clientId: string;
      clientName: string;
      packageName: string;
      earnedAgencyFees: number;
      directDeliveryCosts: number;
      deliverablesWeight: number;
    }
  >();

  clients
    .filter((c) => c.status === 'closed' && c.contractStatus !== 'paused' && c.contractStatus !== 'completed')
    .forEach((c) => {
      const targets = getClientDeliverableTargets(c, packages);
      // Weight: reels carry 2.5x effort, posts 1x, stories 0.35x
      const weight = Math.max(
        1,
        (targets.postsTarget || 0) * 1 +
          (targets.reelsTarget || 0) * 2.5 +
          (targets.storiesTarget || 0) * 0.35
      );
      clientMap.set(c.id, {
        clientId: c.id,
        clientName: c.company || c.name,
        packageName: c.packageName || 'باقة إدارة',
        earnedAgencyFees: 0,
        directDeliveryCosts: 0,
        deliverablesWeight: weight,
      });
    });

  pnl.revenueItems.forEach((item) => {
    const cid = item.invoice.clientId || `inv-client-${item.invoice.clientName}`;
    const existing = clientMap.get(cid);
    if (existing) {
      existing.earnedAgencyFees += item.allocatedRevenue;
    } else {
      const del = item.invoice.deliverables;
      const weight = Math.max(
        1,
        (del?.posts || 8) * 1 + (del?.reels || 2) * 2.5 + (del?.stories || 0) * 0.35
      );
      clientMap.set(cid, {
        clientId: cid,
        clientName: item.invoice.clientCompany || item.invoice.clientName,
        packageName: item.invoice.packageName,
        earnedAgencyFees: item.allocatedRevenue,
        directDeliveryCosts: 0,
        deliverablesWeight: weight,
      });
    }
  });

  activeExpenses.forEach((exp) => {
    if (!exp.linkedClientId) return;
    const existing = clientMap.get(exp.linkedClientId);
    const amt = Math.max(0, Number(exp.amount) || 0);
    if (existing) {
      existing.directDeliveryCosts += amt;
    } else {
      clientMap.set(exp.linkedClientId, {
        clientId: exp.linkedClientId,
        clientName: exp.linkedClientName || 'عميل مرتبط',
        packageName: '—',
        earnedAgencyFees: 0,
        directDeliveryCosts: amt,
        deliverablesWeight: 1,
      });
    }
  });

  const entries = Array.from(clientMap.values()).filter(
    (row) => row.earnedAgencyFees > 0 || row.directDeliveryCosts > 0 || row.deliverablesWeight > 0
  );

  // Shared payroll pool to allocate strictly for client-level costing (never double-counted in P&L!)
  // Exclude payroll entries already explicitly linked to a specific client to prevent double-counting.
  const sharedPayrollPool = activeExpenses
    .filter((e) => getExpenseGroup(e) === 'payroll' && !e.linkedClientId)
    .reduce((s, e) => s + Math.max(0, Number(e.amount) || 0), 0);

  const totalDeliverablesWeight = entries.reduce((s, e) => s + e.deliverablesWeight, 0);
  const totalEarnedFees = entries.reduce((s, e) => s + e.earnedAgencyFees, 0);

  const rows: ClientProfitabilityRow[] = entries.map((entry) => {
    let ratio = 0;
    if (entries.length > 0) {
      if (allocationRule === 'equal') {
        ratio = 1 / entries.length;
      } else if (allocationRule === 'revenue_weight') {
        ratio = totalEarnedFees > 0 ? entry.earnedAgencyFees / totalEarnedFees : 1 / entries.length;
      } else {
        ratio =
          totalDeliverablesWeight > 0
            ? entry.deliverablesWeight / totalDeliverablesWeight
            : 1 / entries.length;
      }
    }

    const allocatedTeamSalaryShare = Math.round(sharedPayrollPool * ratio * 100) / 100;
    const contributionMargin =
      Math.round((entry.earnedAgencyFees - entry.directDeliveryCosts - allocatedTeamSalaryShare) * 100) /
      100;
    const contributionMarginPct =
      entry.earnedAgencyFees > 0
        ? Math.round((contributionMargin / entry.earnedAgencyFees) * 1000) / 10
        : entry.directDeliveryCosts + allocatedTeamSalaryShare > 0
        ? -100
        : 0;

    return {
      clientId: entry.clientId,
      clientName: entry.clientName,
      packageName: entry.packageName,
      earnedAgencyFees: Math.round(entry.earnedAgencyFees * 100) / 100,
      directDeliveryCosts: Math.round(entry.directDeliveryCosts * 100) / 100,
      allocatedTeamSalaryShare,
      contributionMargin,
      contributionMarginPct,
      deliverablesWeight: Math.round(entry.deliverablesWeight * 10) / 10,
      allocationSharePct: Math.round(ratio * 1000) / 10,
    };
  });

  rows.sort((a, b) => b.contributionMargin - a.contributionMargin);

  return {
    rows,
    totalEarnedFees: Math.round(totalEarnedFees * 100) / 100,
    totalDirectCosts: Math.round(rows.reduce((s, r) => s + r.directDeliveryCosts, 0) * 100) / 100,
    totalPayrollAllocated: Math.round(rows.reduce((s, r) => s + r.allocatedTeamSalaryShare, 0) * 100) / 100,
    totalContributionMargin: Math.round(rows.reduce((s, r) => s + r.contributionMargin, 0) * 100) / 100,
  };
}

export interface ClientAdFundsRow {
  clientId: string;
  clientName: string;
  agreedInvoicedBudget: number;
  collectedAdFunds: number;
  actualPlatformSpend: number;
  pendingTopupAmount: number;
  pendingSpendAmount: number;
  remainingBalance: number;
  lastActivityDate?: string;
  policy: 'client_passthrough' | 'agency_principal';
}

export function computeClientAdFundsReconciliation(
  clients: Inquiry[],
  invoices: ClientInvoiceRecord[]
): {
  rows: ClientAdFundsRow[];
  totalAgreedBudget: number;
  totalCollectedAdFunds: number;
  totalActualSpend: number;
  totalRemainingLiability: number;
} {
  const rows: ClientAdFundsRow[] = [];

  clients.forEach((client) => {
    const clientInvoices = invoices.filter(
      (inv) =>
        inv.clientId === client.id &&
        inv.paymentStatus !== 'cancelled' &&
        !inv.isDraft &&
        (inv.adCreditAmount || 0) > 0
    );
    const reqs = client.adWalletRequests || [];

    const hasAdActivity =
      (client.adCreditBalance || 0) > 0 ||
      (client.adCreditFundedTotal || 0) > 0 ||
      (client.adCreditSpentTotal || 0) > 0 ||
      (client.pendingInvoiceAdCredit || 0) > 0 ||
      clientInvoices.length > 0 ||
      reqs.length > 0;

    if (!hasAdActivity) return;

    const invoicedAdTotal = clientInvoices.reduce(
      (s, inv) => s + Math.max(0, Number(inv.adCreditAmount) || 0),
      0
    );
    const agreedInvoicedBudget = Math.max(
      invoicedAdTotal + Math.max(0, Number(client.pendingInvoiceAdCredit) || 0),
      Number(client.adCreditFundedTotal) || 0
    );

    const collectedAdFunds = Math.max(
      Number(client.adCreditFundedTotal) || 0,
      clientInvoices
        .filter((inv) => inv.paymentStatus === 'paid')
        .reduce((s, inv) => s + Math.max(0, Number(inv.adCreditAmount) || 0), 0)
    );

    const approvedSpendFromReqs = reqs
      .filter((r) => r.type === 'spend' && r.status === 'approved')
      .reduce((s, r) => s + Math.max(0, Number(r.amount) || 0), 0);
    const actualPlatformSpend = Math.max(Number(client.adCreditSpentTotal) || 0, approvedSpendFromReqs);

    const pendingTopupAmount = reqs
      .filter((r) => r.type === 'topup' && r.status === 'pending')
      .reduce((s, r) => s + Math.max(0, Number(r.amount) || 0), 0);
    const pendingSpendAmount = reqs
      .filter((r) => r.type === 'spend' && r.status === 'pending')
      .reduce((s, r) => s + Math.max(0, Number(r.amount) || 0), 0);

    const remainingBalance = Math.max(0, Number(client.adCreditBalance) || 0);

    const latestReq = reqs[0];
    const policy = clientInvoices.some((i) => i.adFundsTreatment === 'agency_principal')
      ? 'agency_principal'
      : 'client_passthrough';

    rows.push({
      clientId: client.id,
      clientName: client.company || client.name,
      agreedInvoicedBudget: Math.round(agreedInvoicedBudget * 100) / 100,
      collectedAdFunds: Math.round(collectedAdFunds * 100) / 100,
      actualPlatformSpend: Math.round(actualPlatformSpend * 100) / 100,
      pendingTopupAmount: Math.round(pendingTopupAmount * 100) / 100,
      pendingSpendAmount: Math.round(pendingSpendAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      lastActivityDate: latestReq?.reviewedAt || latestReq?.requestedAt || clientInvoices[0]?.issueDate,
      policy,
    });
  });

  rows.sort((a, b) => b.remainingBalance - a.remainingBalance || b.collectedAdFunds - a.collectedAdFunds);

  return {
    rows,
    totalAgreedBudget: Math.round(rows.reduce((s, r) => s + r.agreedInvoicedBudget, 0) * 100) / 100,
    totalCollectedAdFunds: Math.round(rows.reduce((s, r) => s + r.collectedAdFunds, 0) * 100) / 100,
    totalActualSpend: Math.round(rows.reduce((s, r) => s + r.actualPlatformSpend, 0) * 100) / 100,
    totalRemainingLiability: Math.round(rows.reduce((s, r) => s + r.remainingBalance, 0) * 100) / 100,
  };
}

export interface MonthlyTrendPoint {
  monthKey: string;
  monthLabel: string;
  earnedRevenue: number;
  totalAccruedExpenses: number;
  accrualNetProfit: number;
  agencyCashInflows: number;
  paidExpensesOutflow: number;
  agencyNetCashFlow: number;
}

export function compute12MonthComparison(
  anchorMonthKey: string,
  invoices: ClientInvoiceRecord[],
  expenses: AgencyExpense[],
  clients: Inquiry[],
  settings: FinancialSettings | undefined,
  isAr: boolean,
  monthsCount = 12
): MonthlyTrendPoint[] {
  const keys = getLastNMonthKeys(anchorMonthKey, monthsCount);
  return keys.map((mKey) => {
    const pnl = computeSingleMonthPnLCore(mKey, invoices, expenses);
    const cf = computeMonthlyCashFlow(mKey, invoices, expenses, clients, settings);
    return {
      monthKey: mKey,
      monthLabel: formatMonthTitle(mKey, isAr, true),
      earnedRevenue: pnl.earnedServiceRevenue,
      totalAccruedExpenses: pnl.totalAccruedExpenses,
      accrualNetProfit: pnl.netProfitBeforeTax,
      agencyCashInflows: cf.agencyCashInflows,
      paidExpensesOutflow: cf.paidExpensesOutflow,
      agencyNetCashFlow: cf.agencyNetCashFlow,
    };
  });
}

/**
 * Duplicate bank/wallet transfer reference detector (Accounting Control - Page 10).
 */
export function findDuplicatePaymentReference(
  invoices: ClientInvoiceRecord[],
  reference?: string,
  excludePaymentId?: string
): { invoiceNumber: string; receiptNumber: string; clientName: string; date: string } | null {
  const clean = (reference || '').trim().toLowerCase();
  if (!clean || clean.length < 3) return null;

  for (const inv of invoices) {
    if (inv.paymentStatus === 'cancelled') continue;
    for (const p of inv.payments || []) {
      if (excludePaymentId && p.id === excludePaymentId) continue;
      if ((p.reference || '').trim().toLowerCase() === clean) {
        return {
          invoiceNumber: inv.invoiceNumber,
          receiptNumber: p.receiptNumber,
          clientName: inv.clientCompany || inv.clientName,
          date: p.date,
        };
      }
    }
  }
  return null;
}

/**
 * Detects discrepancies between an invoice's deliverables / retainer and the client's contracted package.
 */
export function detectInvoicePackageMismatch(
  invoice: ClientInvoiceRecord,
  client?: Inquiry,
  packages?: ServicePackage[]
): string | null {
  if (!client || invoice.paymentStatus === 'cancelled') return null;

  const expectedTargets = getClientDeliverableTargets(client, packages || []);
  const invPosts = invoice.deliverables?.posts;
  const invReels = invoice.deliverables?.reels;

  const issues: string[] = [];
  if (
    typeof invPosts === 'number' &&
    expectedTargets.postsTarget > 0 &&
    invPosts !== expectedTargets.postsTarget
  ) {
    issues.push(`البوستات بالفاتورة (${invPosts}) ≠ الباقة (${expectedTargets.postsTarget})`);
  }
  if (
    typeof invReels === 'number' &&
    expectedTargets.reelsTarget > 0 &&
    invReels !== expectedTargets.reelsTarget
  ) {
    issues.push(`الريلز بالفاتورة (${invReels}) ≠ الباقة (${expectedTargets.reelsTarget})`);
  }
  if (
    client.retainerAmount &&
    client.retainerAmount > 0 &&
    invoice.billingCycle === (client.billingCycle || 'monthly') &&
    Math.abs(invoice.retainerAmount - client.retainerAmount) > 1
  ) {
    issues.push(
      `أتعاب الفاتورة (${invoice.retainerAmount.toLocaleString()}) ≠ تعاقد العميل (${client.retainerAmount.toLocaleString()})`
    );
  }

  return issues.length > 0 ? issues.join(' · ') : null;
}
