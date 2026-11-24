import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Receipt,
  Repeat,
  Building2,
  Megaphone,
  Wrench,
  Briefcase,
  Users,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  ShieldCheck,
  FileText,
  Landmark,
  Layers,
  Clock,
  Eye,
  Ban,
  Edit3,
  Paperclip,
  Info,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { useAgencyData } from '../context/AgencyDataContext';
import {
  AgencyExpense,
  ExpenseCategory,
  SharedCostAllocationRule,
} from '../types';
import {
  compute12MonthComparison,
  computeClientAdFundsReconciliation,
  computeClientProfitability,
  computeMonthlyCashFlow,
  computeMonthlyPnL,
  computeReceivablesAging,
  createEmptyMonthCloseRecord,
  DEFAULT_FINANCIAL_SETTINGS,
  DrillDownItem,
  formatMonthTitle,
  getCurrentMonthKey,
  getExpenseAccrualMonth,
  getExpenseCategoryMeta,
  getExpenseGroup,
  MONTH_CLOSE_STEP_DEFINITIONS,
  shiftMonthKey,
} from '../utils/accountingEngine';
import { generateMonthlyFinancialReportPdf } from '../utils/financialReportPdf';

interface ExpensesProfitHubProps {
  isAr?: boolean;
  actorName?: string;
}

type FinanceSubTab =
  | 'dashboard'
  | 'pnl'
  | 'cashflow'
  | 'expenses'
  | 'ad_funds'
  | 'profitability'
  | 'close_audit';

const CATEGORY_STYLES: Record<
  ExpenseCategory,
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  salaries: { badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Users },
  freelancers: { badge: 'bg-sky-50 text-sky-800 border-sky-200', icon: Briefcase },
  project_cost: { badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: Layers },
  rent: { badge: 'bg-amber-50 text-amber-800 border-amber-200', icon: Building2 },
  tools: { badge: 'bg-violet-50 text-violet-800 border-violet-200', icon: Wrench },
  admin_finance: { badge: 'bg-slate-100 text-slate-800 border-slate-300', icon: Landmark },
  ads: { badge: 'bg-pink-50 text-pink-800 border-pink-200', icon: Megaphone },
  other: { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: MoreHorizontal },
};

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'salaries',
  'freelancers',
  'project_cost',
  'rent',
  'tools',
  'admin_finance',
  'ads',
  'other',
];

function fmtCurrency(value: number, isAr: boolean): string {
  const num = Number(value) || 0;
  return `${Math.round(num).toLocaleString('en-US')} ${isAr ? 'ج.م' : 'EGP'}`;
}

export const ExpensesProfitHub: React.FC<ExpensesProfitHubProps> = ({
  isAr = true,
  actorName = 'الإدارة المالية',
}) => {
  const {
    data,
    addExpense,
    updateExpense,
    voidExpense,
    postRecurringExpensesForMonth,
    toggleMonthCloseStep,
    closeFinancialMonth,
    reopenFinancialMonth,
    updateFinancialSettings,
  } = useAgencyData();

  const expenses = data.expenses || [];
  const invoices = data.invoices || [];
  const clients = data.inquiries || [];
  const packages = data.packages || [];
  const auditLog = data.financialAuditLog || [];
  const closedMonths = data.closedMonths || {};
  const financialSettings = data.financialSettings || DEFAULT_FINANCIAL_SETTINGS;

  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Drill-down traceability modal state
  const [drillDown, setDrillDown] = useState<{
    title: string;
    subtitle: string;
    total: number;
    items: DrillDownItem[];
  } | null>(null);

  // Expenses sub-tab filters & modals
  const [expSearch, setExpSearch] = useState('');
  const [expCategoryFilter, setExpCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  const [expStatusFilter, setExpStatusFilter] = useState<'active' | 'unpaid' | 'voided'>('active');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<AgencyExpense | null>(null);

  // Expense form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('salaries');
  const [formAmount, setFormAmount] = useState('');
  const [formAccrualMonth, setFormAccrualMonth] = useState(selectedMonth);
  const [formPaymentStatus, setFormPaymentStatus] = useState<'paid' | 'accrued_unpaid'>('paid');
  const [formPaymentDate, setFormPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('تحويل بنكي / إنستاباي');
  const [formVendor, setFormVendor] = useState('');
  const [formLinkedClientId, setFormLinkedClientId] = useState('');
  const [formIsDirectCost, setFormIsDirectCost] = useState(false);
  const [formRecurring, setFormRecurring] = useState(false);
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Documented Void Modal for Expense
  const [voidTargetExpense, setVoidTargetExpense] = useState<AgencyExpense | null>(null);
  const [voidReasonInput, setVoidReasonInput] = useState('');

  // Reopen closed month modal
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReasonInput, setReopenReasonInput] = useState('');
  const [closeNotesInput, setCloseNotesInput] = useState('');

  // Opening cash settings modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState(String(financialSettings.openingCashBalance || 0));
  const [openingDateInput, setOpeningDateInput] = useState(financialSettings.openingCashDate || `${new Date().getFullYear()}-01-01`);
  const [allocRuleInput, setAllocRuleInput] = useState<SharedCostAllocationRule>(
    financialSettings.sharedCostAllocationRule || 'deliverables_weight'
  );

  // Audit log filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState<
    'all' | 'invoice' | 'payment' | 'expense' | 'ad_wallet' | 'month_close' | 'settings'
  >('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Core Engine Computations
  const pnl = useMemo(
    () => computeMonthlyPnL(selectedMonth, invoices, expenses),
    [selectedMonth, invoices, expenses]
  );

  const cashFlow = useMemo(
    () => computeMonthlyCashFlow(selectedMonth, invoices, expenses, clients, financialSettings),
    [selectedMonth, invoices, expenses, clients, financialSettings]
  );

  const receivablesAging = useMemo(
    () => computeReceivablesAging(invoices),
    [invoices]
  );

  const clientProfitability = useMemo(
    () =>
      computeClientProfitability(
        selectedMonth,
        clients,
        invoices,
        expenses,
        packages,
        financialSettings.sharedCostAllocationRule
      ),
    [selectedMonth, clients, invoices, expenses, packages, financialSettings.sharedCostAllocationRule]
  );

  const adFundsReconciliation = useMemo(
    () => computeClientAdFundsReconciliation(clients, invoices),
    [clients, invoices]
  );

  const trend12Months = useMemo(
    () =>
      compute12MonthComparison(
        selectedMonth,
        invoices,
        expenses,
        clients,
        financialSettings,
        isAr,
        12
      ),
    [selectedMonth, invoices, expenses, clients, financialSettings, isAr]
  );

  const currentCloseRecord =
    closedMonths[selectedMonth] || createEmptyMonthCloseRecord(selectedMonth);
  const isCurrentMonthClosed = currentCloseRecord.status === 'closed';
  const completedCloseStepsCount = MONTH_CLOSE_STEP_DEFINITIONS.filter(
    (s) => currentCloseRecord.steps[s.key]
  ).length;

  const activeClients = useMemo(
    () => clients.filter((c) => c.status === 'closed'),
    [clients]
  );

  const filteredMonthExpenses = useMemo(() => {
    const q = expSearch.trim().toLowerCase();
    return expenses
      .filter((exp) => {
        if (expStatusFilter === 'voided') {
          if (!exp.voided) return false;
        } else {
          if (exp.voided) return false;
          if (expStatusFilter === 'unpaid' && exp.paymentStatus !== 'accrued_unpaid') return false;
        }
        if (getExpenseAccrualMonth(exp) !== selectedMonth) return false;
        if (expCategoryFilter !== 'all' && exp.category !== expCategoryFilter) return false;
        if (q) {
          const hay = [
            exp.title,
            exp.vendorName || '',
            exp.linkedClientName || '',
            exp.notes || '',
            exp.paymentMethod || '',
            exp.attachmentName || '',
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [expenses, expSearch, expCategoryFilter, expStatusFilter, selectedMonth]);

  const filteredAuditLog = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    return auditLog.filter((entry) => {
      if (auditEntityFilter !== 'all' && entry.entityType !== auditEntityFilter) return false;
      if (q) {
        const hay = [
          entry.actorName,
          entry.entityLabel || '',
          entry.beforeSummary || '',
          entry.afterSummary || '',
          entry.reason || '',
          entry.action,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [auditLog, auditSearch, auditEntityFilter]);

  // Drill-down openers
  const openEarnedRevenueDrillDown = (targetMonth = selectedMonth) => {
    const targetPnl =
      targetMonth === selectedMonth ? pnl : computeMonthlyPnL(targetMonth, invoices, expenses);
    setDrillDown({
      title: isAr
        ? `تفاصيل إيرادات الخدمات المكتسبة — ${formatMonthTitle(targetMonth, true)}`
        : `Earned Service Revenue — ${formatMonthTitle(targetMonth, false)}`,
      subtitle: isAr
        ? 'أتعاب الوكالة الموزعة على أشهر الخدمة (مفصولة تماماً عن أموال إعلانات العملاء)'
        : 'Accrual agency fees prorated across service months (client ad funds excluded)',
      total: targetPnl.earnedServiceRevenue,
      items: targetPnl.revenueItems.map((alloc) => ({
        id: `${alloc.invoice.id}-${alloc.monthKey}`,
        date: alloc.invoice.issueDate,
        title: `${alloc.invoice.clientCompany || alloc.invoice.clientName} — ${alloc.invoice.invoiceNumber}`,
        subtitle: alloc.isProrated
          ? `توزيع شهري (${alloc.monthIndex}/${alloc.totalMonths}) من إجمالي أتعاب ${alloc.fullAgencyRevenue.toLocaleString()} ج.م`
          : alloc.invoice.packageName,
        categoryLabel: alloc.isProrated ? 'فاتورة موزعة' : 'فاتورة شهرية',
        amount: alloc.allocatedRevenue,
        statusLabel: alloc.invoice.paymentStatus === 'paid' ? 'محصلة' : 'ذمة عميل',
        type: 'revenue',
      })),
    });
  };

  const openAccruedExpensesDrillDown = (targetMonth = selectedMonth) => {
    const targetPnl =
      targetMonth === selectedMonth ? pnl : computeMonthlyPnL(targetMonth, invoices, expenses);
    const allMonthExp = [
      ...targetPnl.directCostItems,
      ...targetPnl.payrollItems,
      ...targetPnl.fixedOpsItems,
      ...targetPnl.adminFinanceItems,
    ];
    setDrillDown({
      title: isAr
        ? `تفاصيل مصروفات ورواتب الشهر المستحقة — ${formatMonthTitle(targetMonth, true)}`
        : `Accrued Monthly Expenses — ${formatMonthTitle(targetMonth, false)}`,
      subtitle: isAr
        ? 'تشمل جميع التكاليف المستحقة عن هذا الشهر سواء تم سدادها نقداً أو لا تزال مستحقة'
        : 'All expenses accrued for this month (paid and accrued-unpaid)',
      total: targetPnl.totalAccruedExpenses,
      items: allMonthExp.map((exp) => {
        const meta = getExpenseCategoryMeta(exp.category);
        return {
          id: exp.id,
          date: exp.paymentDate || exp.date,
          title: exp.title,
          subtitle: [
            exp.vendorName ? `المستفيد: ${exp.vendorName}` : '',
            exp.linkedClientName ? `العميل: ${exp.linkedClientName}` : '',
          ]
            .filter(Boolean)
            .join(' · '),
          categoryLabel: isAr ? meta.labelAr : meta.labelEn,
          amount: exp.amount,
          statusLabel: exp.paymentStatus === 'accrued_unpaid' ? 'مستحق غير مدفوع' : 'مدفوع',
          type: 'expense',
        };
      }),
    });
  };

  const openReceivablesDrillDown = () => {
    setDrillDown({
      title: isAr ? 'تفاصيل مستحقات العملاء (الذمم المدينة)' : 'Client Accounts Receivable',
      subtitle: isAr
        ? 'جميع الفواتير الصادرة غير المحصلة أو المحصلة جزئياً مرتبة حسب أقدمية الاستحقاق'
        : 'All issued unpaid or partially paid invoices ordered by aging',
      total: receivablesAging.totalReceivables,
      items: receivablesAging.items.map((item) => ({
        id: item.invoice.id,
        date: item.referenceDate,
        title: `${item.invoice.clientCompany || item.invoice.clientName} — ${item.invoice.invoiceNumber}`,
        subtitle: `متأخر/قائم منذ ${item.daysOutstanding} يوم · المدفوع: ${item.paidAmount.toLocaleString()} من ${item.totalAmount.toLocaleString()} ج.م`,
        categoryLabel:
          item.bucket === '90_plus'
            ? '+90 يوم'
            : item.bucket === '61_90'
            ? '61–90 يوم'
            : item.bucket === '31_60'
            ? '31–60 يوم'
            : '0–30 يوم',
        amount: item.remainingAmount,
        type: 'receivable',
      })),
    });
  };

  const openUnpaidPayablesDrillDown = () => {
    setDrillDown({
      title: isAr ? 'مستحقات الموردين والموظفين (غير المسددة نقداً)' : 'Accrued Payables (Unpaid)',
      subtitle: isAr
        ? 'مصروفات ورواتب احتُسبت في قائمة الأرباح والخسائر ولم تُصرف نقداً بعد'
        : 'Expenses accrued in P&L awaiting cash disbursement',
      total: pnl.accruedPayablesUnpaid,
      items: pnl.unpaidPayableItems.map((exp) => ({
        id: exp.id,
        date: exp.accrualMonth || exp.date,
        title: exp.title,
        subtitle: exp.vendorName || getExpenseCategoryMeta(exp.category).labelAr,
        categoryLabel: getExpenseCategoryMeta(exp.category).groupAr,
        amount: exp.amount,
        statusLabel: 'مستحق للسداد',
        type: 'payable',
      })),
    });
  };

  const openLiquidityDrillDown = () => {
    setDrillDown({
      title: isAr
        ? `حركة النقدية الفعلية — ${formatMonthTitle(selectedMonth, true)}`
        : `Cash Movement — ${formatMonthTitle(selectedMonth, false)}`,
      subtitle: isAr
        ? 'التحصيلات والمدفوعات الفعلية خلال الشهر (التدفق النقدي ≠ صافي الربح المحاسبي)'
        : 'Actual cash inflows and outflows during the month (Cash Flow ≠ Accrual Profit)',
      total: cashFlow.agencyNetCashFlow,
      items: [...cashFlow.cashInItems, ...cashFlow.cashOutItems],
    });
  };

  // Expense Modal handlers
  const openAddExpenseModal = () => {
    if (isCurrentMonthClosed) {
      showToast(
        isAr
          ? `شهر ${formatMonthTitle(selectedMonth, true)} مقفول محاسبياً — أعد فتحه من تبويب الإقفال الشهري أولاً لتسجيل قيد تسوية.`
          : 'This financial month is locked. Reopen it from Month-End Close to post an adjustment.'
      );
      return;
    }
    setEditingExpense(null);
    setFormTitle('');
    setFormCategory('salaries');
    setFormAmount('');
    setFormAccrualMonth(selectedMonth);
    setFormPaymentStatus('paid');
    setFormPaymentDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('تحويل بنكي / إنستاباي');
    setFormVendor('');
    setFormLinkedClientId('');
    setFormIsDirectCost(false);
    setFormRecurring(false);
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setFormNotes('');
    setFormError(null);
    setIsExpenseModalOpen(true);
  };

  const openEditExpenseModal = (exp: AgencyExpense) => {
    if (isCurrentMonthClosed) {
      showToast(
        isAr
          ? `لا يمكن تعديل مصروف داخل شهر مقفول (${selectedMonth}).`
          : 'Cannot edit expenses inside a closed month.'
      );
      return;
    }
    setEditingExpense(exp);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormAmount(String(exp.amount));
    setFormAccrualMonth(getExpenseAccrualMonth(exp));
    setFormPaymentStatus(exp.paymentStatus || 'paid');
    setFormPaymentDate(exp.paymentDate || exp.date || new Date().toISOString().split('T')[0]);
    setFormPaymentMethod(exp.paymentMethod || 'تحويل بنكي / إنستاباي');
    setFormVendor(exp.vendorName || '');
    setFormLinkedClientId(exp.linkedClientId || '');
    setFormIsDirectCost(Boolean(exp.isDirectCost || exp.category === 'freelancers' || exp.category === 'project_cost'));
    setFormRecurring(Boolean(exp.recurring));
    setFormAttachmentName(exp.attachmentName || '');
    setFormAttachmentUrl(exp.attachmentUrl || '');
    setFormNotes(exp.notes || '');
    setFormError(null);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formAmount);
    if (!formTitle.trim()) {
      setFormError(isAr ? 'يرجى كتابة وصف البند أو المصروف.' : 'Please enter an expense description.');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setFormError(isAr ? 'يرجى إدخال قيمة صحيحة أكبر من صفر.' : 'Please enter a valid positive amount.');
      return;
    }
    if (closedMonths[formAccrualMonth]?.status === 'closed') {
      setFormError(
        isAr
          ? `شهر الاستحقاق (${formAccrualMonth}) مقفول محاسبياً ولا يقبل إدخالاً مباشراً.`
          : `Accrual month ${formAccrualMonth} is locked.`
      );
      return;
    }

    const linkedClient = activeClients.find((c) => c.id === formLinkedClientId);
    const effectiveDirectCost =
      formIsDirectCost || formCategory === 'freelancers' || formCategory === 'project_cost';
    const payload: Omit<AgencyExpense, 'id' | 'createdAt'> = {
      title: formTitle.trim(),
      category: formCategory,
      amount: amt,
      date: formPaymentStatus === 'paid' ? formPaymentDate : `${formAccrualMonth}-01`,
      accrualMonth: formAccrualMonth,
      paymentStatus: formPaymentStatus,
      paymentDate: formPaymentStatus === 'paid' ? formPaymentDate : undefined,
      paymentMethod: formPaymentMethod,
      vendorName: formVendor.trim() || undefined,
      linkedClientId: linkedClient?.id || undefined,
      linkedClientName: linkedClient ? linkedClient.company || linkedClient.name : undefined,
      isDirectCost: effectiveDirectCost,
      recurring: formRecurring,
      attachmentName: formAttachmentName.trim() || undefined,
      attachmentUrl: formAttachmentUrl.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload, actorName);
      showToast(isAr ? 'تم تحديث المصروف وتوثيق التعديل في سجل الرقابة.' : 'Expense updated and logged.');
    } else {
      addExpense(payload, actorName);
      showToast(
        isAr
          ? `تم تسجيل المصروف لشهر ${formatMonthTitle(formAccrualMonth, true)} وتحديث قائمة P&L.`
          : 'Expense recorded and reflected in monthly P&L.'
      );
    }
    setIsExpenseModalOpen(false);
  };

  const handleMarkExpensePaid = (exp: AgencyExpense) => {
    if (isCurrentMonthClosed) {
      showToast(isAr ? 'الشهر مقفول محاسبياً.' : 'Month is closed.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    updateExpense(
      exp.id,
      {
        paymentStatus: 'paid',
        paymentDate: today,
        date: today,
      },
      actorName
    );
    showToast(
      isAr
        ? `تم تأكيد السداد النقدي لبند "${exp.title}" بتاريخ ${today}.`
        : `Marked "${exp.title}" as paid on ${today}.`
    );
  };

  const handleConfirmVoidExpense = () => {
    if (!voidTargetExpense) return;
    if (!voidReasonInput.trim()) return;
    const ok = voidExpense(voidTargetExpense.id, voidReasonInput.trim(), actorName);
    if (ok) {
      showToast(
        isAr
          ? `تم إلغاء البند "${voidTargetExpense.title}" بقيد موثق مع الحفاظ على الأثر التاريخي.`
          : 'Expense voided with documented audit trail.'
      );
      setVoidTargetExpense(null);
      setVoidReasonInput('');
    }
  };

  const handlePostRecurring = () => {
    if (isCurrentMonthClosed) {
      showToast(isAr ? 'لا يمكن الترحيل إلى شهر مقفول.' : 'Cannot post into a closed month.');
      return;
    }
    const count = postRecurringExpensesForMonth(selectedMonth, actorName);
    if (count > 0) {
      showToast(
        isAr
          ? `تم ترحيل ${count} بند رواتب/تشغيل ثابت إلى ${formatMonthTitle(selectedMonth, true)} كمستحقات جاهزة للمراجعة والسداد.`
          : `Posted ${count} recurring items as accrued payables for ${selectedMonth}.`
      );
    } else {
      showToast(
        isAr
          ? 'جميع البنود الدورية المسجلة مرحّلة بالفعل لهذا الشهر (أو لا توجد بنود محددة كدورية بعد).'
          : 'All recurring items are already posted for this month.'
      );
    }
  };

  const handleExportMonthlyCsv = () => {
    const rows: string[][] = [
      ['البند / Statement Line', 'القيمة (ج.م)', 'ملاحظات'],
      [`قائمة الأرباح والخسائر — ${formatMonthTitle(selectedMonth, true)}`, '', 'أساس الاستحقاق (Accrual)'],
      ['إيرادات الخدمات المكتسبة (Earned Service Revenue)', String(pnl.earnedServiceRevenue), 'مفصولة عن أموال إعلانات العملاء'],
      ['تكاليف تنفيذ الخدمات المباشرة (COGS)', String(-pnl.directDeliveryCosts), 'مستقلون وتصوير ومشاريع مباشرة'],
      ['مجمل الربح (Gross Profit)', String(pnl.grossProfit), `هامش ${pnl.grossMarginPct}%`],
      ['الرواتب والأجور المستحقة (Payroll)', String(-pnl.accruedPayroll), 'مدفوعة ومستحقة'],
      ['التشغيل الثابت (Fixed Ops)', String(-pnl.fixedOpsExpenses), 'إيجار وأدوات وإنترنت'],
      ['الإدارة والمالية (Admin & Finance)', String(-pnl.adminFinanceExpenses), 'عمولات بنكية ومصروفات عامة'],
      ['صافي الربح قبل الضريبة (Net Profit Before Tax)', String(pnl.netProfitBeforeTax), `هامش ${pnl.netMarginPct}%`],
      ['', '', ''],
      ['التدفق النقدي المنفصل (Cash Flow — ليس صافي ربح)', '', 'أساس نقدي (Cash Basis)'],
      ['تحصيلات أتعاب الوكالة النقدية', String(cashFlow.agencyCashInflows), ''],
      ['تحصيلات ميزانيات إعلانات العملاء', String(cashFlow.clientAdFundsCashInflows), 'أمانات إعلانية منفصلة'],
      ...(cashFlow.taxCashInflows > 0
        ? [['تحصيلات الضرائب المضافة (منفصلة)', String(cashFlow.taxCashInflows), 'ليست ضمن أتعاب الوكالة الصافية']]
        : []),
      ['المدفوعات النقدية للمصروفات والرواتب', String(-cashFlow.paidExpensesOutflow), ''],
      ['الفرق النقدي التشغيلي للوكالة (Net Cash Flow)', String(cashFlow.agencyNetCashFlow), 'الفرق النقدي ≠ صافي الربح'],
      ['السيولة المتاحة المقدّرة للوكالة', String(cashFlow.estimatedAgencyAvailableLiquidity), ''],
      ['أرصدة إعلانات العملاء المحتجزة (التزام)', String(cashFlow.heldClientAdFundsLiability), ''],
    ];
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-effect-financial-report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMonthlyPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const res = await generateMonthlyFinancialReportPdf({
        monthKey: selectedMonth,
        pnl,
        cashFlow,
        receivablesAging,
        adFundsReconciliation,
        clientProfitability,
        closeRecord: currentCloseRecord,
        actorName,
        isAr,
      });
      if (res.success) {
        showToast(
          isAr
            ? `تم تحميل التقرير المالي الشهري PDF لشهر ${formatMonthTitle(selectedMonth, true)} بنجاح.`
            : `Monthly financial report PDF exported for ${selectedMonth}.`
        );
      }
    } catch (err) {
      console.error('Monthly financial report PDF error:', err);
      showToast(isAr ? 'تعذر إنشاء ملف التقرير PDF حالياً.' : 'Failed to export report PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancialSettings(
      {
        openingCashBalance: Number(openingCashInput) || 0,
        openingCashDate: openingDateInput || `${new Date().getFullYear()}-01-01`,
        sharedCostAllocationRule: allocRuleInput,
      },
      actorName
    );
    setIsSettingsModalOpen(false);
    showToast(isAr ? 'تم حفظ الإعدادات المالية وتوثيقها في سجل الرقابة.' : 'Financial settings saved.');
  };

  const subTabs: Array<{
    key: FinanceSubTab;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'dashboard', labelAr: 'لوحة التحكم المالية', labelEn: 'Executive Dashboard', icon: TrendingUp },
    { key: 'pnl', labelAr: 'الأرباح والخسائر (P&L)', labelEn: 'Monthly P&L', icon: FileText },
    { key: 'cashflow', labelAr: 'التدفق النقدي وأعمار الديون', labelEn: 'Cash Flow & Aging', icon: Landmark },
    { key: 'expenses', labelAr: 'المصروفات والرواتب', labelEn: 'Expenses & Payroll', icon: Receipt },
    { key: 'ad_funds', labelAr: 'ميزانيات الإعلانات', labelEn: 'Client Ad Funds', icon: Megaphone },
    { key: 'profitability', labelAr: 'ربحية كل عميل', labelEn: 'Client Profitability', icon: Users },
    { key: 'close_audit', labelAr: 'الإقفال والرقابة', labelEn: 'Close & Audit', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Banner */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button type="button" onClick={() => setToastMsg(null)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Executive Header + Month Switcher + Governance Status */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-black">
                {isAr ? 'نظام المحاسبة بالاستحقاق الشهري' : 'Accrual Monthly Accounting'}
              </span>
              {isCurrentMonthClosed ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-black inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>{isAr ? `شهر مقفول ومعتمد` : 'Month Closed & Locked'}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-black inline-flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>
                    {isAr
                      ? `شهر مفتوح (${completedCloseStepsCount}/7 إقفال)`
                      : `Open (${completedCloseStepsCount}/7 Close Steps)`}
                  </span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {isAr
                ? `الإدارة المالية والأرباح والخسائر — ${formatMonthTitle(selectedMonth, true)}`
                : `Financial Management & P&L — ${formatMonthTitle(selectedMonth, false)}`}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              {isAr
                ? 'فصل كامل بين صافي الربح المحاسبي (الاستحقاق) والتدفق النقدي، وعزل تام لأموال إعلانات العملاء، مع إقفال شهري وسجل رقابة لكل حركة.'
                : 'Strict separation between accrual Net Profit and Cash Flow, isolated client ad funds, month-end close locking, and full audit trail.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Navigator */}
            <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setSelectedMonth((m) => shiftMonthKey(m, -1))}
                className="p-1.5 rounded-lg hover:bg-white/15 text-slate-200 cursor-pointer"
                title={isAr ? 'الشهر السابق' : 'Previous month'}
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                className="bg-transparent text-white text-xs font-black px-2 py-1 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={() => setSelectedMonth((m) => shiftMonthKey(m, 1))}
                className="p-1.5 rounded-lg hover:bg-white/15 text-slate-200 cursor-pointer"
                title={isAr ? 'الشهر التالي' : 'Next month'}
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpeningCashInput(String(financialSettings.openingCashBalance || 0));
                setOpeningDateInput(financialSettings.openingCashDate || `${new Date().getFullYear()}-01-01`);
                setAllocRuleInput(financialSettings.sharedCostAllocationRule || 'deliverables_weight');
                setIsSettingsModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isAr ? 'الرصيد الافتتاحي والسياسات' : 'Settings'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMonthlyPdf}
              disabled={isExportingPdf}
              className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/35 text-xs font-black text-sky-100 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{isAr ? 'التقرير الشهري PDF' : 'Report PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMonthlyCsv}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold text-emerald-100 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={openAddExpenseModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'تسجيل مصروف / راتب' : 'Add Expense'}</span>
            </button>
          </div>
        </div>

        {/* 7 Sub-Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/10">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSubTab(tab.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Completeness Alerts (Shown whenever P&L has gaps) */}
      {(isAr ? pnl.completenessWarningsAr : pnl.completenessWarningsEn).length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
          {(isAr ? pnl.completenessWarningsAr : pnl.completenessWarningsEn).map((w, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: EXECUTIVE DASHBOARD (لوحة التحكم المالية)                     */}
      {/* ===================================================================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-5">
          {/* 4 Primary KPIs (Clickable for Drill-Down!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => openEarnedRevenueDrillDown(selectedMonth)}
              className="text-start bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {isAr ? '1. إيرادات الشهر المكتسبة (استحقاق)' : '1. Earned Service Revenue'}
                </span>
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <div className="text-xl font-black text-blue-950 font-mono mt-1.5">
                {fmtCurrency(pnl.earnedServiceRevenue, isAr)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {isAr ? `${pnl.revenueItems.length} فاتورة/حصة شهرية` : `${pnl.revenueItems.length} allocations`}
                </span>
                {pnl.prevMonth?.revenueDeltaPct !== null && pnl.prevMonth?.revenueDeltaPct !== undefined && (
                  <span
                    className={`font-black inline-flex items-center ${
                      pnl.prevMonth.revenueDeltaPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {pnl.prevMonth.revenueDeltaPct >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(pnl.prevMonth.revenueDeltaPct)}%
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => openAccruedExpensesDrillDown(selectedMonth)}
              className="text-start bg-white rounded-2xl p-4 border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {isAr ? '2. مصروفات الشهر المستحقة' : '2. Accrued Monthly Expenses'}
                </span>
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-800 font-mono mt-1.5">
                {fmtCurrency(pnl.totalAccruedExpenses, isAr)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {isAr
                    ? `رواتب: ${pnl.accruedPayroll.toLocaleString()} · مباشر: ${pnl.directDeliveryCosts.toLocaleString()}`
                    : `Payroll: ${pnl.accruedPayroll.toLocaleString()}`}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('pnl')}
              className={`text-start rounded-2xl p-4 border hover:shadow-md transition-all cursor-pointer ${
                pnl.netProfitBeforeTax >= 0
                  ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400'
                  : 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">
                  {isAr ? '3. صافي الربح قبل الضريبة (P&L)' : '3. Net Profit Before Tax'}
                </span>
                {pnl.netProfitBeforeTax >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div
                className={`text-xl font-black font-mono mt-1.5 ${
                  pnl.netProfitBeforeTax >= 0 ? 'text-emerald-900' : 'text-rose-900'
                }`}
              >
                {fmtCurrency(pnl.netProfitBeforeTax, isAr)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">
                  {isAr ? `هامش الربح: ${pnl.netMarginPct}%` : `Net Margin: ${pnl.netMarginPct}%`}
                </span>
                <span className="text-slate-500">{isAr ? 'أساس الاستحقاق' : 'Accrual Basis'}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={openLiquidityDrillDown}
              className="text-start bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">
                  {isAr ? '4. السيولة المتاحة للوكالة (منفصلة)' : '4. Agency Available Liquidity'}
                </span>
                <Wallet className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-black text-sky-300 font-mono mt-1.5">
                {fmtCurrency(cashFlow.estimatedAgencyAvailableLiquidity, isAr)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                <span>
                  {isAr
                    ? `الفرق النقدي للشهر: ${cashFlow.agencyNetCashFlow >= 0 ? '+' : ''}${Math.round(cashFlow.agencyNetCashFlow).toLocaleString()}`
                    : `Month Cash Flow: ${Math.round(cashFlow.agencyNetCashFlow).toLocaleString()}`}
                </span>
              </div>
            </button>
          </div>

          {/* 4 Supporting KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <button
              type="button"
              onClick={openReceivablesDrillDown}
              className="text-start bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-amber-400 transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-500 block">
                {isAr ? 'مستحقات العملاء (ذمم مدينة)' : 'Client Receivables (AR)'}
              </span>
              <div className="text-base font-black text-amber-800 font-mono mt-1">
                {fmtCurrency(receivablesAging.totalReceivables, isAr)}
              </div>
              <span className="text-[10px] text-slate-500">
                {isAr
                  ? `${receivablesAging.items.length} فاتورة مفتوحة · ${receivablesAging.overdueCount} متأخرة`
                  : `${receivablesAging.items.length} open invoices`}
              </span>
            </button>

            <button
              type="button"
              onClick={openUnpaidPayablesDrillDown}
              className="text-start bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-rose-400 transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-500 block">
                {isAr ? 'مستحقات الموردين والموظفين' : 'Accrued Payables (Unpaid)'}
              </span>
              <div className="text-base font-black text-rose-700 font-mono mt-1">
                {fmtCurrency(pnl.accruedPayablesUnpaid, isAr)}
              </div>
              <span className="text-[10px] text-slate-500">
                {isAr
                  ? `${pnl.unpaidPayableItems.length} بند مستحق لم يُدفع نقداً`
                  : `${pnl.unpaidPayableItems.length} unpaid accrued items`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('ad_funds')}
              className="text-start bg-purple-50/70 rounded-2xl p-3.5 border border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-purple-800 block">
                {isAr ? 'أرصدة ميزانيات إعلانات العملاء (أمانة)' : 'Held Client Ad Funds'}
              </span>
              <div className="text-base font-black text-purple-950 font-mono mt-1">
                {fmtCurrency(cashFlow.heldClientAdFundsLiability, isAr)}
              </div>
              <span className="text-[10px] text-purple-700 font-semibold">
                {isAr ? 'مفصولة عن إيرادات وسيولة الوكالة' : 'Isolated from Agency P&L & Cash'}
              </span>
            </button>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block">
                {isAr ? 'إيرادات مؤجلة (دفعات مقدمة لأشهر قادمة)' : 'Deferred Revenue (Advance)'}
              </span>
              <div className="text-base font-black text-indigo-800 font-mono mt-1">
                {fmtCurrency(pnl.deferredRevenueAsOfMonthEnd, isAr)}
              </div>
              <span className="text-[10px] text-slate-500">
                {isAr ? 'مبالغ محصلة عن خدمات لأشهر لاحقة' : 'Collected for future service months'}
              </span>
            </div>
          </div>

          {/* Explicit Accounting Separation Banner (Rule 1 & 2 from PDF Page 12) */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-blue-950">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-black">
                  {isAr
                    ? 'قاعدة الفصل المحاسبي: الفرق النقدي ≠ صافي الربح، وأموال إعلانات العملاء ≠ إيرادات الوكالة'
                    : 'Accounting Separation Rule: Cash Flow ≠ Net Profit, Client Ad Funds ≠ Agency Revenue'}
                </p>
                <p className="text-[11px] text-blue-800">
                  {isAr
                    ? `في ${formatMonthTitle(selectedMonth, true)}: صافي الربح المحاسبي = ${fmtCurrency(pnl.netProfitBeforeTax, true)} | بينما الفرق النقدي التشغيلي للوكالة = ${fmtCurrency(cashFlow.agencyNetCashFlow, true)}. انقر على أي بطاقة أو شهر في الرسم البياني أدناه للتدقيق حتى مستوى الفاتورة أو المصروف.`
                    : `In ${formatMonthTitle(selectedMonth, false)}: Accrual Net Profit = ${fmtCurrency(pnl.netProfitBeforeTax, false)} vs Operating Cash Flow = ${fmtCurrency(cashFlow.agencyNetCashFlow, false)}. Click any KPI or chart month to drill down.`}
                </p>
              </div>
            </div>
          </div>

          {/* 12-Month Comparative Chart (Accrual Revenue vs Accrued Expenses vs Accrual Profit vs Cash Flow) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {isAr
                    ? 'مقارنة 12 شهراً: الإيراد المكتسب مقابل المصروفات المستحقة وصافي الربح والفرق النقدي'
                    : '12-Month Comparison: Earned Revenue vs Accrued Expenses, Net Profit & Cash Flow'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'انقر على أي شهر في الرسم أو الشريط أسفله لعرض تفاصيل الفواتير والمصروفات المكوّنة له.'
                    : 'Click any month below to inspect the exact underlying invoices and expenses.'}
                </p>
              </div>
            </div>

            <div className="h-80 w-full min-w-0" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trend12Months}
                  margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
                  onClick={(state: any) => {
                    const clickedKey = state?.activePayload?.[0]?.payload?.monthKey;
                    if (clickedKey) {
                      setSelectedMonth(clickedKey);
                      openEarnedRevenueDrillDown(clickedKey);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                    }
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      fmtCurrency(Number(val) || 0, isAr),
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }} />
                  <Bar
                    dataKey="earnedRevenue"
                    name={isAr ? 'الإيراد المكتسب (استحقاق)' : 'Earned Revenue'}
                    fill="#2563eb"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="totalAccruedExpenses"
                    name={isAr ? 'المصروفات المستحقة' : 'Accrued Expenses'}
                    fill="#f43f5e"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={26}
                  />
                  <Line
                    type="monotone"
                    dataKey="accrualNetProfit"
                    name={isAr ? 'صافي الربح (P&L)' : 'Accrual Net Profit'}
                    stroke="#10b981"
                    strokeWidth={2.8}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="agencyNetCashFlow"
                    name={isAr ? 'الفرق النقدي (Cash Flow)' : 'Net Cash Flow'}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 3, fill: '#f59e0b' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Clickable Month Pills for Drill-Down */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
              {trend12Months.map((pt) => (
                <button
                  key={pt.monthKey}
                  type="button"
                  onClick={() => setSelectedMonth(pt.monthKey)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border whitespace-nowrap transition-all cursor-pointer ${
                    pt.monthKey === selectedMonth
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pt.monthLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MONTHLY P&L STATEMENT (قائمة الأرباح والخسائر الشهرية)         */}
      {/* ===================================================================== */}
      {activeSubTab === 'pnl' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isAr
                    ? `قائمة الأرباح والخسائر الشهرية (P&L) — ${formatMonthTitle(selectedMonth, true)}`
                    : `Monthly Profit & Loss Statement — ${formatMonthTitle(selectedMonth, false)}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr
                    ? `مقارنة مع الشهر السابق (${formatMonthTitle(pnl.prevMonth?.monthKey || shiftMonthKey(selectedMonth, -1), true)}) — أساس الاستحقاق الكامل بدون أموال إعلانات العملاء.`
                    : 'Accrual basis monthly P&L with Month-over-Month comparison.'}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={handleExportMonthlyPdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>{isAr ? 'تصدير التقرير الشهري PDF' : 'Export Report PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportMonthlyCsv}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-black border-b border-slate-200">
                    <th className="text-start py-3.5 px-5">{isAr ? 'البند المحاسبي' : 'Line Item'}</th>
                    <th className="text-end py-3.5 px-5">
                      {formatMonthTitle(selectedMonth, isAr)}
                    </th>
                    <th className="text-end py-3.5 px-5">
                      {formatMonthTitle(pnl.prevMonth?.monthKey || shiftMonthKey(selectedMonth, -1), isAr)}
                    </th>
                    <th className="text-end py-3.5 px-5">{isAr ? 'ملاحظات / تفصيل' : 'Notes / Drill-down'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* 1. Earned Service Revenue */}
                  <tr className="hover:bg-blue-50/40">
                    <td className="py-3.5 px-5 font-black text-slate-900">
                      {isAr ? 'إيرادات الخدمات المكتسبة (Earned Service Revenue)' : 'Earned Service Revenue'}
                    </td>
                    <td className="py-3.5 px-5 text-end font-black font-mono text-blue-900">
                      {fmtCurrency(pnl.earnedServiceRevenue, isAr)}
                    </td>
                    <td className="py-3.5 px-5 text-end font-mono text-slate-500">
                      {fmtCurrency(pnl.prevMonth?.earnedServiceRevenue || 0, isAr)}
                    </td>
                    <td className="py-3.5 px-5 text-end">
                      <button
                        type="button"
                        onClick={() => openEarnedRevenueDrillDown(selectedMonth)}
                        className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isAr ? `عرض ${pnl.revenueItems.length} فاتورة/حصة` : `Inspect ${pnl.revenueItems.length}`}</span>
                      </button>
                    </td>
                  </tr>

                  {/* 2. Direct Delivery Costs (COGS) */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-5 font-bold text-slate-700">
                      {isAr ? '(-) تكاليف تنفيذ الخدمات المباشرة (فريلانسرز / تصوير / إنتاج)' : '(-) Direct Service Delivery Costs (COGS)'}
                    </td>
                    <td className="py-3 px-5 text-end font-bold font-mono text-rose-700">
                      ({fmtCurrency(pnl.directDeliveryCosts, isAr)})
                    </td>
                    <td className="py-3 px-5 text-end font-mono text-slate-400">—</td>
                    <td className="py-3 px-5 text-end text-slate-500">
                      {pnl.directCostItems.length} {isAr ? 'بند مباشر' : 'items'}
                    </td>
                  </tr>

                  {/* 3. Gross Profit */}
                  <tr className="bg-slate-50/90 font-black">
                    <td className="py-3.5 px-5 text-slate-900">
                      {isAr ? '(=) مجمل الربح (Gross Profit)' : '(=) Gross Profit'}
                    </td>
                    <td className="py-3.5 px-5 text-end font-mono text-slate-950">
                      {fmtCurrency(pnl.grossProfit, isAr)}
                    </td>
                    <td className="py-3.5 px-5 text-end font-mono text-slate-500">
                      {fmtCurrency(pnl.prevMonth?.grossProfit || 0, isAr)}
                    </td>
                    <td className="py-3.5 px-5 text-end text-indigo-700 font-black">
                      {isAr ? `هامش مجمل الربح: ${pnl.grossMarginPct}%` : `Gross Margin: ${pnl.grossMarginPct}%`}
                    </td>
                  </tr>

                  {/* 4. Accrued Payroll */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-5 font-bold text-slate-700">
                      {isAr ? '(-) الرواتب والأجور المستحقة للفريق' : '(-) Accrued Payroll & Salaries'}
                    </td>
                    <td className="py-3 px-5 text-end font-bold font-mono text-rose-700">
                      ({fmtCurrency(pnl.accruedPayroll, isAr)})
                    </td>
                    <td className="py-3 px-5 text-end font-mono text-slate-400">—</td>
                    <td className="py-3 px-5 text-end text-slate-500">
                      {pnl.payrollItems.length} {isAr ? 'بند رواتب' : 'payroll items'}
                    </td>
                  </tr>

                  {/* 5. Fixed Operating Expenses */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-5 font-bold text-slate-700">
                      {isAr ? '(-) مصروفات التشغيل الثابتة (إيجار، إنترنت، أدوات واشتراكات)' : '(-) Fixed Operating Expenses'}
                    </td>
                    <td className="py-3 px-5 text-end font-bold font-mono text-rose-700">
                      ({fmtCurrency(pnl.fixedOpsExpenses, isAr)})
                    </td>
                    <td className="py-3 px-5 text-end font-mono text-slate-400">—</td>
                    <td className="py-3 px-5 text-end text-slate-500">
                      {pnl.fixedOpsItems.length} {isAr ? 'بند ثابت' : 'items'}
                    </td>
                  </tr>

                  {/* 6. Admin & Finance Expenses */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-5 font-bold text-slate-700">
                      {isAr ? '(-) المصروفات الإدارية والمالية وتسويق الوكالة' : '(-) Admin, Finance & Agency Marketing'}
                    </td>
                    <td className="py-3 px-5 text-end font-bold font-mono text-rose-700">
                      ({fmtCurrency(pnl.adminFinanceExpenses, isAr)})
                    </td>
                    <td className="py-3 px-5 text-end font-mono text-slate-400">—</td>
                    <td className="py-3 px-5 text-end text-slate-500">
                      {pnl.adminFinanceItems.length} {isAr ? 'بند إداري' : 'items'}
                    </td>
                  </tr>

                  {/* 7. Net Profit Before Tax */}
                  <tr
                    className={`font-black text-sm ${
                      pnl.netProfitBeforeTax >= 0
                        ? 'bg-emerald-50 text-emerald-950'
                        : 'bg-rose-50 text-rose-950'
                    }`}
                  >
                    <td className="py-4 px-5">
                      {isAr ? '(=) صافي الربح قبل الضريبة (Net Profit Before Tax)' : '(=) Net Profit Before Tax'}
                    </td>
                    <td className="py-4 px-5 text-end font-mono">
                      {fmtCurrency(pnl.netProfitBeforeTax, isAr)}
                    </td>
                    <td className="py-4 px-5 text-end font-mono opacity-75">
                      {fmtCurrency(pnl.prevMonth?.netProfitBeforeTax || 0, isAr)}
                    </td>
                    <td className="py-4 px-5 text-end text-xs">
                      {isAr ? `هامش صافي الربح: ${pnl.netMarginPct}%` : `Net Margin: ${pnl.netMarginPct}%`}
                    </td>
                  </tr>

                  {/* 8. Taxes (Shown Separately) */}
                  {pnl.recordedTaxes > 0 && (
                    <tr className="bg-slate-50/50">
                      <td className="py-3 px-5 font-bold text-slate-600">
                        {isAr ? 'الضرائب المسجلة بالفواتير (بند مستقل)' : 'Recorded Invoice Taxes (Separate Line)'}
                      </td>
                      <td className="py-3 px-5 text-end font-mono font-bold text-slate-700">
                        {fmtCurrency(pnl.recordedTaxes, isAr)}
                      </td>
                      <td className="py-3 px-5 text-end text-slate-400">—</td>
                      <td className="py-3 px-5 text-end text-slate-500">
                        {isAr ? 'تُعرض منفصلة عن أتعاب الوكالة' : 'Shown separately'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Proration Detail Table (Multi-Month Recognition Transparency) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-black text-slate-900">
                {isAr
                  ? `تفصيل الإيرادات المكتسبة والموزعة على ${formatMonthTitle(selectedMonth, true)}`
                  : `Revenue Recognition Breakdown for ${formatMonthTitle(selectedMonth, false)}`}
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                {isAr
                  ? 'الفواتير ربع السنوية والسنوية تُقسم بالتساوي على أشهر الخدمة'
                  : 'Quarterly & annual invoices are prorated across covered service months'}
              </span>
            </div>

            {pnl.revenueItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                {isAr
                  ? 'لا توجد فواتير صادرة تغطي هذا الشهر حتى الآن.'
                  : 'No issued invoices cover this service month yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="text-start py-2 px-3">{isAr ? 'الفاتورة' : 'Invoice'}</th>
                      <th className="text-start py-2 px-3">{isAr ? 'العميل' : 'Client'}</th>
                      <th className="text-start py-2 px-3">{isAr ? 'طبيعة التوزيع' : 'Proration'}</th>
                      <th className="text-end py-2 px-3">{isAr ? 'إجمالي أتعاب الفاتورة' : 'Full Retainer'}</th>
                      <th className="text-end py-2 px-3">{isAr ? 'نصيب هذا الشهر' : 'Month Share'}</th>
                      <th className="text-end py-2 px-3">{isAr ? 'ميزانية إعلانات (مستبعدة)' : 'Ad Funds (Excluded)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pnl.revenueItems.map((alloc) => (
                      <tr key={`${alloc.invoice.id}-${alloc.monthKey}`} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                          {alloc.invoice.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {alloc.invoice.clientCompany || alloc.invoice.clientName}
                        </td>
                        <td className="py-2.5 px-3">
                          {alloc.isProrated ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-[10px]">
                              {isAr
                                ? `شهر ${alloc.monthIndex} من ${alloc.totalMonths}`
                                : `Month ${alloc.monthIndex}/${alloc.totalMonths}`}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {isAr ? 'شهري كامل' : 'Single Month'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-600">
                          {fmtCurrency(alloc.fullAgencyRevenue, isAr)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-black text-blue-900">
                          {fmtCurrency(alloc.allocatedRevenue, isAr)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-purple-700">
                          {(alloc.invoice.adCreditAmount || 0) > 0
                            ? fmtCurrency(alloc.invoice.adCreditAmount || 0, isAr)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CASH FLOW & ACCOUNTS RECEIVABLE AGING                          */}
      {/* ===================================================================== */}
      {activeSubTab === 'cashflow' && (
        <div className="space-y-5">
          {/* Cash Flow Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-700 block">
                {isAr ? 'تحصيلات أتعاب الوكالة النقدية (داخل)' : 'Agency Retainer Cash In'}
              </span>
              <div className="text-lg font-black text-emerald-900 font-mono mt-1">
                {fmtCurrency(cashFlow.agencyCashInflows, isAr)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {isAr
                  ? `+ تحصيلات إعلانات عملاء: ${cashFlow.clientAdFundsCashInflows.toLocaleString()} ج.م`
                  : `+ Ad funds cash in: ${cashFlow.clientAdFundsCashInflows.toLocaleString()}`}
                {cashFlow.taxCashInflows > 0
                  ? isAr
                    ? ` | + ضرائب منفصلة: ${cashFlow.taxCashInflows.toLocaleString()} ج.م`
                    : ` | + Taxes: ${cashFlow.taxCashInflows.toLocaleString()}`
                  : ''}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-rose-200">
              <span className="text-[11px] font-bold text-rose-700 block">
                {isAr ? 'المصروفات والرواتب المسددة نقداً (خارج)' : 'Paid Expenses Cash Out'}
              </span>
              <div className="text-lg font-black text-rose-900 font-mono mt-1">
                {fmtCurrency(cashFlow.paidExpensesOutflow, isAr)}
              </div>
              <span className="text-[10px] text-slate-500">
                {isAr
                  ? `+ صرف إعلانات عملاء معتمد: ${cashFlow.approvedAdSpendOutflow.toLocaleString()} ج.م`
                  : `+ Approved client ad spend: ${cashFlow.approvedAdSpendOutflow.toLocaleString()}`}
              </span>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300">
              <span className="text-[11px] font-black text-amber-900 block">
                {isAr ? 'الفرق النقدي للشهر (التدفق النقدي ≠ صافي الربح)' : 'Net Cash Flow (≠ Net Profit)'}
              </span>
              <div
                className={`text-lg font-black font-mono mt-1 ${
                  cashFlow.agencyNetCashFlow >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {cashFlow.agencyNetCashFlow >= 0 ? '+' : ''}
                {fmtCurrency(cashFlow.agencyNetCashFlow, isAr)}
              </div>
              <span className="text-[10px] text-amber-800 font-semibold">
                {isAr ? 'مؤشر سيولة نقدية فقط' : 'Liquidity metric only'}
              </span>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 block">
                {isAr ? 'إجمالي النقدية بالبنك والمحافظ (تقديري)' : 'Est. Total Bank & Wallets'}
              </span>
              <div className="text-lg font-black text-white font-mono mt-1">
                {fmtCurrency(cashFlow.totalBankAndWalletsEstimate, isAr)}
              </div>
              <span className="text-[10px] text-sky-300 block mt-0.5">
                {isAr
                  ? `سيولة الوكالة: ${Math.round(cashFlow.estimatedAgencyAvailableLiquidity).toLocaleString()} | أمانات إعلانات: ${Math.round(cashFlow.heldClientAdFundsLiability).toLocaleString()}`
                  : `Agency: ${Math.round(cashFlow.estimatedAgencyAvailableLiquidity).toLocaleString()} | Client Ads: ${Math.round(cashFlow.heldClientAdFundsLiability).toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Accounts Receivable Aging Report (تقرير أعمار ديون العملاء) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'تقرير أعمار ديون العملاء (Accounts Receivable Aging)' : 'Accounts Receivable Aging'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'تصنيف مستحقات العملاء المفتوحة حسب فترة التأخير لمتابعة التحصيل أولاً بأول.'
                    : 'Open client balances grouped by overdue aging buckets.'}
                </p>
              </div>
              <div className="text-end bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-bold text-amber-700 block">
                  {isAr ? 'إجمالي الذمم القائمة' : 'Total Receivables'}
                </span>
                <span className="text-sm font-black text-amber-950 font-mono">
                  {fmtCurrency(receivablesAging.totalReceivables, isAr)}
                </span>
              </div>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  {isAr ? 'حالي (0 – 30 يوم)' : 'Current (0–30d)'}
                </span>
                <span className="text-base font-black text-emerald-950 font-mono">
                  {fmtCurrency(receivablesAging.bucket0_30, isAr)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 block">
                  {isAr ? 'متأخر (31 – 60 يوم)' : '31–60 Days'}
                </span>
                <span className="text-base font-black text-amber-950 font-mono">
                  {fmtCurrency(receivablesAging.bucket31_60, isAr)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
                <span className="text-[11px] font-bold text-orange-800 block">
                  {isAr ? 'متأخر جداً (61 – 90 يوم)' : '61–90 Days'}
                </span>
                <span className="text-base font-black text-orange-950 font-mono">
                  {fmtCurrency(receivablesAging.bucket61_90, isAr)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                <span className="text-[11px] font-bold text-rose-800 block">
                  {isAr ? 'حرج (+90 يوم)' : '90+ Days Critical'}
                </span>
                <span className="text-base font-black text-rose-950 font-mono">
                  {fmtCurrency(receivablesAging.bucket90Plus, isAr)}
                </span>
              </div>
            </div>

            {receivablesAging.items.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs font-bold text-emerald-800">
                {isAr
                  ? 'ممتاز! لا توجد مستحقات مفتوحة أو متأخرة على العملاء حالياً.'
                  : 'Zero open client receivables.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="text-start py-2.5 px-3">{isAr ? 'العميل' : 'Client'}</th>
                      <th className="text-start py-2.5 px-3">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                      <th className="text-start py-2.5 px-3">{isAr ? 'تاريخ الاستحقاق/الإصدار' : 'Ref Date'}</th>
                      <th className="text-center py-2.5 px-3">{isAr ? 'العمر (يوم)' : 'Age (Days)'}</th>
                      <th className="text-end py-2.5 px-3">{isAr ? 'الإجمالي' : 'Total'}</th>
                      <th className="text-end py-2.5 px-3">{isAr ? 'المدفوع' : 'Paid'}</th>
                      <th className="text-end py-2.5 px-3">{isAr ? 'المتبقي المستحق' : 'Balance Due'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receivablesAging.items.map((item) => (
                      <tr key={item.invoice.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {item.invoice.clientCompany || item.invoice.clientName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-bold">
                          {item.invoice.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{item.referenceDate}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                              item.bucket === '90_plus'
                                ? 'bg-rose-100 text-rose-800'
                                : item.bucket === '61_90'
                                ? 'bg-orange-100 text-orange-800'
                                : item.bucket === '31_60'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.daysOutstanding} {isAr ? 'يوم' : 'd'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-600">
                          {fmtCurrency(item.totalAmount, isAr)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-emerald-700">
                          {fmtCurrency(item.paidAmount, isAr)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-black text-rose-700">
                          {fmtCurrency(item.remainingAmount, isAr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: EXPENSES & PAYROLL (المصروفات والرواتب والمستحقات)             */}
      {/* ===================================================================== */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={expSearch}
                  onChange={(e) => setExpSearch(e.target.value)}
                  placeholder={isAr ? 'بحث بالوصف، المورد، العميل، أو المستند...' : 'Search expense, vendor, client...'}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  }`}
                />
              </div>

              <select
                value={expCategoryFilter}
                onChange={(e) => setExpCategoryFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">{isAr ? 'كل التصنيفات' : 'All Categories'}</option>
                {ALL_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {isAr ? getExpenseCategoryMeta(cat).labelAr : getExpenseCategoryMeta(cat).labelEn}
                  </option>
                ))}
              </select>

              <select
                value={expStatusFilter}
                onChange={(e) => setExpStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="active">{isAr ? 'البنود الفعّالة للشهر' : 'Active Items'}</option>
                <option value="unpaid">{isAr ? 'المستحقات غير المسددة فقط' : 'Accrued Unpaid Only'}</option>
                <option value="voided">{isAr ? 'البنود الملغاة (أرشيف الرقابة)' : 'Voided Audit Archive'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePostRecurring}
                disabled={isCurrentMonthClosed}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{isAr ? 'ترحيل الرواتب والمصروفات الثابتة للشهر' : 'Post Recurring Payroll & Fixed'}</span>
              </button>

              <button
                type="button"
                onClick={openAddExpenseModal}
                disabled={isCurrentMonthClosed}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة مصروف / راتب' : 'Add Expense'}</span>
              </button>
            </div>
          </div>

          {/* 4 Expense Group Totals Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border border-indigo-200">
              <span className="text-[11px] font-bold text-indigo-700 block">{isAr ? 'الرواتب والأجور' : 'Payroll'}</span>
              <span className="text-base font-black text-indigo-950 font-mono">{fmtCurrency(pnl.accruedPayroll, isAr)}</span>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-cyan-200">
              <span className="text-[11px] font-bold text-cyan-700 block">{isAr ? 'تكاليف مشاريع مباشرة (COGS)' : 'Direct Costs (COGS)'}</span>
              <span className="text-base font-black text-cyan-950 font-mono">{fmtCurrency(pnl.directDeliveryCosts, isAr)}</span>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-amber-200">
              <span className="text-[11px] font-bold text-amber-700 block">{isAr ? 'التشغيل الثابت' : 'Fixed Ops'}</span>
              <span className="text-base font-black text-amber-950 font-mono">{fmtCurrency(pnl.fixedOpsExpenses, isAr)}</span>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block">{isAr ? 'الإدارة والمالية' : 'Admin & Finance'}</span>
              <span className="text-base font-black text-slate-900 font-mono">{fmtCurrency(pnl.adminFinanceExpenses, isAr)}</span>
            </div>
          </div>

          {/* Expenses Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredMonthExpenses.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  {isAr
                    ? `لا توجد بنود مصروفات مطابقة لشهر ${formatMonthTitle(selectedMonth, true)}.`
                    : `No matching expenses for ${selectedMonth}.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMonthExpenses.map((exp) => {
                  const meta = getExpenseCategoryMeta(exp.category);
                  const style = CATEGORY_STYLES[exp.category] || CATEGORY_STYLES.other;
                  const Icon = style.icon;
                  const isUnpaid = exp.paymentStatus === 'accrued_unpaid';
                  const grp = getExpenseGroup(exp);

                  return (
                    <div
                      key={exp.id}
                      className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                        exp.voided ? 'bg-slate-50/90 opacity-75' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.badge}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-black ${exp.voided ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {exp.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${style.badge}`}>
                              {isAr ? meta.labelAr : meta.labelEn}
                            </span>
                            {grp === 'direct_cogs' && (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-black">
                                {isAr ? 'تكلفة مباشرة (COGS)' : 'Direct COGS'}
                              </span>
                            )}
                            {exp.recurring && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold inline-flex items-center gap-1">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>{isAr ? 'دوري شهرياً' : 'Recurring'}</span>
                              </span>
                            )}
                            {exp.voided ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">
                                {isAr ? `ملغى بقيد موثق: ${exp.voidReason || ''}` : 'Voided'}
                              </span>
                            ) : isUnpaid ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black">
                                {isAr ? '⏳ مستحق غير مدفوع نقداً' : '⏳ Accrued Unpaid'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                {isAr ? `✅ مدفوع (${exp.paymentDate || exp.date})` : `Paid (${exp.paymentDate || exp.date})`}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                            <span>
                              {isAr ? 'شهر الاستحقاق:' : 'Accrual:'} <strong className="font-mono">{getExpenseAccrualMonth(exp)}</strong>
                            </span>
                            {exp.vendorName && (
                              <>
                                <span>•</span>
                                <span>{isAr ? 'المورد/المستفيد:' : 'Vendor:'} <strong>{exp.vendorName}</strong></span>
                              </>
                            )}
                            {exp.linkedClientName && (
                              <>
                                <span>•</span>
                                <span className="text-blue-700 font-bold">
                                  {isAr ? 'العميل المرتبط:' : 'Client:'} {exp.linkedClientName}
                                </span>
                              </>
                            )}
                            {exp.paymentMethod && (
                              <>
                                <span>•</span>
                                <span>{exp.paymentMethod}</span>
                              </>
                            )}
                            {exp.attachmentName && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                                  <Paperclip className="w-3 h-3" />
                                  {exp.attachmentUrl ? (
                                    <a href={exp.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline">
                                      {exp.attachmentName}
                                    </a>
                                  ) : (
                                    exp.attachmentName
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          {exp.notes && <p className="text-[11px] text-slate-500">{exp.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <span className="text-sm font-black font-mono text-slate-900">
                          {fmtCurrency(exp.amount, isAr)}
                        </span>

                        {!exp.voided && !isCurrentMonthClosed && (
                          <>
                            {isUnpaid && (
                              <button
                                type="button"
                                onClick={() => handleMarkExpensePaid(exp)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                              >
                                {isAr ? 'تأكيد السداد' : 'Mark Paid'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditExpenseModal(exp)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title={isAr ? 'تعديل البند' : 'Edit'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVoidTargetExpense(exp);
                                setVoidReasonInput('');
                              }}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                              title={isAr ? 'إلغاء موثق بدون مسح الأثر التاريخي' : 'Void with audit trail'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: CLIENT AD FUNDS RECONCILIATION (تسوية ميزانيات إعلانات العملاء) */}
      {/* ===================================================================== */}
      {activeSubTab === 'ad_funds' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-2.5 text-xs text-purple-950">
            <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-black">
                {isAr
                  ? 'سياسة عزل أموال الإعلانات (وكيل بالعمولة — Passthrough Trust Funds)'
                  : 'Ad Funds Isolation Policy (Agent / Passthrough)'}
              </p>
              <p className="text-[11px] text-purple-800 mt-0.5">
                {isAr
                  ? 'تُدار ميزانيات الإعلانات الممولة كحساب مستقل لكل عميل ولا تدخل ضمن إيرادات أو مصروفات قائمة الأرباح والخسائر للوكالة، منعاً لتضخيم الإيرادات أو تضليل هامش الربح.'
                  : 'Client ad budgets are tracked in an independent trust ledger and excluded from Agency P&L revenue and expenses.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block">{isAr ? 'إجمالي الميزانيات المتفق عليها / المفوترة' : 'Agreed / Invoiced Ad Budgets'}</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{fmtCurrency(adFundsReconciliation.totalAgreedBudget, isAr)}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-700 block">{isAr ? 'إجمالي المحصّل والمودَع بالمحافظ' : 'Total Funded / Collected'}</span>
              <span className="text-lg font-black text-emerald-900 font-mono mt-1 block">{fmtCurrency(adFundsReconciliation.totalCollectedAdFunds, isAr)}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-rose-200">
              <span className="text-[11px] font-bold text-rose-700 block">{isAr ? 'المنصرف الفعلي المعتمد على المنصات' : 'Approved Platform Spend'}</span>
              <span className="text-lg font-black text-rose-900 font-mono mt-1 block">{fmtCurrency(adFundsReconciliation.totalActualSpend, isAr)}</span>
            </div>
            <div className="bg-purple-900 text-white rounded-2xl p-4 border border-purple-800">
              <span className="text-[11px] font-bold text-purple-200 block">{isAr ? 'صافي أرصدة العملاء المتبقية (أمانة)' : 'Remaining Client Balances'}</span>
              <span className="text-lg font-black text-white font-mono mt-1 block">{fmtCurrency(adFundsReconciliation.totalRemainingLiability, isAr)}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {adFundsReconciliation.rows.length === 0 ? (
              <div className="p-10 text-center text-xs font-bold text-slate-400">
                {isAr ? 'لا توجد حركات لميزانيات إعلانات العملاء حتى الآن.' : 'No client ad fund records yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                      <th className="text-start py-3.5 px-4">{isAr ? 'العميل' : 'Client'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'الميزانية المفوترة/المتفق عليها' : 'Agreed Budget'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'المحصّل الفعلي' : 'Collected'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'المنصرف على المنصات' : 'Actual Spend'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'طلبات قيد المراجعة' : 'Pending Review'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'الرصيد المتبقي للعميل' : 'Remaining Balance'}</th>
                      <th className="text-center py-3.5 px-4">{isAr ? 'المعالجة المحاسبية' : 'Policy'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adFundsReconciliation.rows.map((row) => (
                      <tr key={row.clientId} className="hover:bg-purple-50/30">
                        <td className="py-3 px-4 font-black text-slate-900">{row.clientName}</td>
                        <td className="py-3 px-4 text-end font-mono text-slate-700">{fmtCurrency(row.agreedInvoicedBudget, isAr)}</td>
                        <td className="py-3 px-4 text-end font-mono font-bold text-emerald-700">{fmtCurrency(row.collectedAdFunds, isAr)}</td>
                        <td className="py-3 px-4 text-end font-mono font-bold text-rose-700">{fmtCurrency(row.actualPlatformSpend, isAr)}</td>
                        <td className="py-3 px-4 text-end font-mono text-amber-700">
                          {row.pendingTopupAmount + row.pendingSpendAmount > 0
                            ? fmtCurrency(row.pendingTopupAmount + row.pendingSpendAmount, isAr)
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-black text-purple-900">
                          {fmtCurrency(row.remainingBalance, isAr)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                            {row.policy === 'agency_principal'
                              ? isAr ? 'أصيل (Principal)' : 'Principal'
                              : isAr ? 'أمانة عميل (Agent)' : 'Client Passthrough'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: CLIENT PROFITABILITY (ربحية كل عميل وهامش المساهمة)             */}
      {/* ===================================================================== */}
      {activeSubTab === 'profitability' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {isAr
                  ? `تحليل ربحية وهامش مساهمة كل عميل — ${formatMonthTitle(selectedMonth, true)}`
                  : `Per-Client Profitability & Contribution Margin — ${formatMonthTitle(selectedMonth, false)}`}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'ملاحظة محاسبية: هامش مساهمة العميل ليس صافي ربح نهائي، فما زالت هناك مصروفات تشغيلية وإدارية عامة لم تُوزّع على العملاء. توزيع الرواتب هنا تحليلي فقط ولا يُكرر المصروف في P&L.'
                  : 'Note: Client contribution margin is before unallocated operating overhead. Shared salary allocation is analytical only and never double-counted in P&L.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-600">{isAr ? 'قاعدة توزيع وقت الفريق:' : 'Allocation Rule:'}</span>
              <select
                value={financialSettings.sharedCostAllocationRule}
                onChange={(e) =>
                  updateFinancialSettings(
                    { sharedCostAllocationRule: e.target.value as SharedCostAllocationRule },
                    actorName
                  )
                }
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="deliverables_weight">{isAr ? 'حسب وزن المخرجات (بوست/ريلز/ستوري)' : 'By Deliverables Weight'}</option>
                <option value="equal">{isAr ? 'بالتساوي على العملاء النشطين' : 'Equal Split'}</option>
                <option value="revenue_weight">{isAr ? 'حسب نسبة إيراد العميل' : 'By Revenue Share'}</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {clientProfitability.rows.length === 0 ? (
              <div className="p-10 text-center text-xs font-bold text-slate-400">
                {isAr ? 'لا توجد بيانات عملاء أو إيرادات مسجلة لهذا الشهر.' : 'No client profitability data for this month.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                      <th className="text-start py-3.5 px-4">{isAr ? 'العميل' : 'Client'}</th>
                      <th className="text-start py-3.5 px-4">{isAr ? 'الباقة' : 'Package'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'أتعاب الوكالة المكتسبة' : 'Earned Fees'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'التكاليف المباشرة (مربوطة)' : 'Direct Costs'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'حصة وقت الفريق (تقديري)' : 'Allocated Payroll'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'هامش المساهمة' : 'Contribution Margin'}</th>
                      <th className="text-end py-3.5 px-4">{isAr ? 'نسبة المساهمة' : 'Margin %'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientProfitability.rows.map((row) => {
                      const isPositive = row.contributionMargin >= 0;
                      return (
                        <tr key={row.clientId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-black text-slate-900">{row.clientName}</td>
                          <td className="py-3 px-4 text-slate-600">{row.packageName}</td>
                          <td className="py-3 px-4 text-end font-mono font-bold text-blue-800">
                            {fmtCurrency(row.earnedAgencyFees, isAr)}
                          </td>
                          <td className="py-3 px-4 text-end font-mono text-rose-700">
                            {fmtCurrency(row.directDeliveryCosts, isAr)}
                          </td>
                          <td className="py-3 px-4 text-end font-mono text-indigo-700">
                            {fmtCurrency(row.allocatedTeamSalaryShare, isAr)}{' '}
                            <span className="text-[10px] text-slate-400">({row.allocationSharePct}%)</span>
                          </td>
                          <td
                            className={`py-3 px-4 text-end font-mono font-black ${
                              isPositive ? 'text-emerald-800' : 'text-rose-700'
                            }`}
                          >
                            {fmtCurrency(row.contributionMargin, isAr)}
                          </td>
                          <td className="py-3 px-4 text-end">
                            <span
                              className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                                row.contributionMarginPct >= 35
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.contributionMarginPct >= 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.contributionMarginPct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-black">
                      <td colSpan={2} className="py-3.5 px-4">{isAr ? 'الإجمالي' : 'Total'}</td>
                      <td className="py-3.5 px-4 text-end font-mono">{fmtCurrency(clientProfitability.totalEarnedFees, isAr)}</td>
                      <td className="py-3.5 px-4 text-end font-mono">{fmtCurrency(clientProfitability.totalDirectCosts, isAr)}</td>
                      <td className="py-3.5 px-4 text-end font-mono">{fmtCurrency(clientProfitability.totalPayrollAllocated, isAr)}</td>
                      <td className="py-3.5 px-4 text-end font-mono text-emerald-300">{fmtCurrency(clientProfitability.totalContributionMargin, isAr)}</td>
                      <td className="py-3.5 px-4 text-end font-mono">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: MONTH-END CLOSE CHECKLIST & AUDIT TRAIL (الإقفال والرقابة)     */}
      {/* ===================================================================== */}
      {activeSubTab === 'close_audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 7-Step Month-End Close Checklist */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  {isCurrentMonthClosed ? (
                    <Lock className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {isAr
                      ? `قائمة الإقفال الشهري — ${formatMonthTitle(selectedMonth, true)}`
                      : `Month-End Close — ${formatMonthTitle(selectedMonth, false)}`}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr
                    ? 'إتمام الخطوات السبع يضمن دقة التقرير المالي ومنع التعديل المباشر بأثر رجعي.'
                    : 'Complete all 7 control steps to lock this month against retroactive edits.'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-black font-mono">
                {completedCloseStepsCount}/7
              </span>
            </div>

            <div className="space-y-2">
              {MONTH_CLOSE_STEP_DEFINITIONS.map((step) => {
                const checked = Boolean(currentCloseRecord.steps[step.key]);
                const disabled = isCurrentMonthClosed || step.key === 'approve_and_lock';
                return (
                  <button
                    key={step.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleMonthCloseStep(selectedMonth, step.key, actorName)}
                    className={`w-full text-start p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                      checked
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    } ${disabled ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${
                        checked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 text-slate-500'
                      }`}
                    >
                      {checked ? '✓' : step.order}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">
                        {isAr ? step.titleAr : step.titleEn}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {isAr ? step.descAr : step.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {isCurrentMonthClosed ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isAr
                      ? `الشهر مقفول ومعتمد بواسطة ${currentCloseRecord.closedBy || actorName}`
                      : `Locked by ${currentCloseRecord.closedBy || actorName}`}
                  </span>
                </div>
                {currentCloseRecord.closedAt && (
                  <p className="text-[11px] text-emerald-800">
                    {isAr ? 'تاريخ الإقفال:' : 'Closed at:'}{' '}
                    <span className="font-mono">{currentCloseRecord.closedAt.split('T')[0]}</span>
                  </p>
                )}
                {currentCloseRecord.notes && (
                  <p className="text-[11px] text-emerald-900">{currentCloseRecord.notes}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setReopenReasonInput('');
                    setIsReopenModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black cursor-pointer"
                >
                  {isAr ? 'إعادة فتح الشهر بقيد تسوية موثق' : 'Reopen Month with Documented Reason'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={closeNotesInput}
                  onChange={(e) => setCloseNotesInput(e.target.value)}
                  placeholder={isAr ? 'ملاحظات اعتماد الإقفال (اختياري)...' : 'Close approval notes (optional)...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    closeFinancialMonth(selectedMonth, actorName, closeNotesInput);
                    setCloseNotesInput('');
                    showToast(
                      isAr
                        ? `تم اعتماد وإقفال شهر ${formatMonthTitle(selectedMonth, true)} بنجاح.`
                        : `Month ${selectedMonth} closed and locked.`
                    );
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isAr ? `اعتماد وإقفال شهر ${formatMonthTitle(selectedMonth, true)}` : `Approve & Lock ${selectedMonth}`}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Financial Audit Trail Log */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? `سجل الرقابة والتدقيق المالي (${auditLog.length})` : `Financial Audit Log (${auditLog.length})`}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? 'توثيق آلي غير قابل للمسح لكل فاتورة، دفعة، مصروف، إلغاء عكسي، أو إقفال شهري (القيمة قبل وبعد + السبب).'
                    : 'Automatic immutable log of invoices, payments, expenses, reversals, and month closes.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder={isAr ? 'بحث في سجل الرقابة...' : 'Search audit log...'}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs ${isAr ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
                />
              </div>
              <select
                value={auditEntityFilter}
                onChange={(e) => setAuditEntityFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">{isAr ? 'كل العمليات' : 'All Entities'}</option>
                <option value="invoice">{isAr ? 'الفواتير' : 'Invoices'}</option>
                <option value="payment">{isAr ? 'الدفعات والإيصالات' : 'Payments'}</option>
                <option value="expense">{isAr ? 'المصروفات والرواتب' : 'Expenses'}</option>
                <option value="ad_wallet">{isAr ? 'محفظة الإعلانات' : 'Ad Wallet'}</option>
                <option value="month_close">{isAr ? 'الإقفال الشهري' : 'Month Close'}</option>
                <option value="settings">{isAr ? 'الإعدادات' : 'Settings'}</option>
              </select>
            </div>

            <div className="max-h-[540px] overflow-y-auto space-y-2 pr-1">
              {filteredAuditLog.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  {isAr ? 'لا توجد سجلات رقابة مطابقة بعد — أي حركة مالية جديدة ستُوثق هنا تلقائياً.' : 'No audit entries yet.'}
                </div>
              ) : (
                filteredAuditLog.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            entry.action === 'void' || entry.action === 'payment_removed'
                              ? 'bg-rose-100 text-rose-800'
                              : entry.action === 'month_closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.action === 'month_reopened'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {entry.action}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {entry.entityLabel || entry.entityId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {entry.timestamp.replace('T', ' ').slice(0, 16)} · {entry.actorName}
                      </span>
                    </div>
                    {entry.beforeSummary && (
                      <div className="text-[11px] text-slate-500">
                        <strong className="text-slate-600">{isAr ? 'قبل:' : 'Before:'}</strong> {entry.beforeSummary}
                      </div>
                    )}
                    {entry.afterSummary && (
                      <div className="text-[11px] text-slate-800 font-medium">
                        <strong className="text-slate-900">{isAr ? 'بعد:' : 'After:'}</strong> {entry.afterSummary}
                      </div>
                    )}
                    {entry.reason && (
                      <div className="text-[11px] text-rose-700 font-bold">
                        {isAr ? 'السبب الموثق:' : 'Reason:'} {entry.reason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD / EDIT EXPENSE (Full Page 5 Mandatory Fields)            */}
      {/* ===================================================================== */}
      {isExpenseModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsExpenseModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <span>
                  {editingExpense
                    ? isAr ? 'تعديل بند مصروف / راتب' : 'Edit Expense'
                    : isAr ? 'تسجيل مصروف أو راتب جديد (وفق أساس الاستحقاق)' : 'Record Expense / Payroll'}
                </span>
              </h3>
              <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'وصف البند / المصروف *' : 'Description *'}</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: رواتب فريق الإنتاج، إيجار المكتب، تصوير عميل X...' : 'e.g. Monthly Payroll, Office Rent...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'التصنيف المحاسبي *' : 'Category *'}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value as ExpenseCategory;
                      setFormCategory(nextCat);
                      if (nextCat === 'freelancers' || nextCat === 'project_cost') {
                        setFormIsDirectCost(true);
                      } else if (nextCat === 'salaries' || nextCat === 'rent' || nextCat === 'tools') {
                        setFormIsDirectCost(false);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {ALL_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {isAr ? `${getExpenseCategoryMeta(cat).labelAr} (${getExpenseCategoryMeta(cat).groupAr})` : getExpenseCategoryMeta(cat).labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'المبلغ (ج.م) *' : 'Amount (EGP) *'}</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black font-mono text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-indigo-800">{isAr ? 'شهر الاستحقاق في P&L *' : 'P&L Accrual Month *'}</label>
                  <input
                    type="month"
                    value={formAccrualMonth}
                    onChange={(e) => setFormAccrualMonth(e.target.value)}
                    className="w-full bg-indigo-50/70 border border-indigo-200 rounded-xl px-3 py-2 text-xs font-black text-indigo-950"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'حالة السداد النقدي *' : 'Payment Status *'}</label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as 'paid' | 'accrued_unpaid')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="paid">{isAr ? '✅ تم الدفع الفعلي (يؤثر على التدفق النقدي)' : 'Paid (Cash Outflow)'}</option>
                    <option value="accrued_unpaid">{isAr ? '⏳ مستحق لم يُدفع بعد (يُحتسب في P&L + مستحقات)' : 'Accrued Unpaid (Payable)'}</option>
                  </select>
                </div>

                {formPaymentStatus === 'paid' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'تاريخ الدفع الفعلي' : 'Actual Payment Date'}</label>
                    <input
                      type="date"
                      value={formPaymentDate}
                      onChange={(e) => setFormPaymentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'وسيلة الدفع' : 'Payment Method'}</label>
                  <input
                    type="text"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    placeholder={isAr ? 'تحويل بنكي / إنستاباي / كاش...' : 'Bank / InstaPay / Cash'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'المورد / المستفيد' : 'Vendor / Beneficiary'}</label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    placeholder={isAr ? 'اسم الموظف، المورد، أو الشركة...' : 'Vendor or staff name...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'ربط بعميل (اختياري — للتكلفة المباشرة)' : 'Linked Client (Optional — Direct Cost)'}</label>
                  <select
                    value={formLinkedClientId}
                    onChange={(e) => setFormLinkedClientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="">{isAr ? 'مصروف عام للوكالة (غير مرتبط بعميل محدد)' : 'General Agency Overhead'}</option>
                    {activeClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'اسم/رقم المستند المرفق (إيصال/فاتورة)' : 'Attachment / Receipt Ref'}</label>
                  <input
                    type="text"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    placeholder={isAr ? 'مثال: إيصال إنستاباي #44912' : 'e.g. Receipt #44912'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isAr ? 'رابط المستند (Google Drive / URL اختياري)' : 'Document URL (Optional)'}</label>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDirectCost}
                    onChange={(e) => setFormIsDirectCost(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>{isAr ? 'تكلفة تنفيذ مباشرة (COGS — تُخصم قبل مجمل الربح)' : 'Direct Delivery Cost (COGS)'}</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-bold text-indigo-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRecurring}
                    onChange={(e) => setFormRecurring(e.target.checked)}
                    className="rounded border-indigo-300"
                  />
                  <span>{isAr ? 'بند دوري شهرياً (يدعم الترحيل التلقائي للأشهر القادمة)' : 'Recurring Monthly'}</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isAr ? 'ملاحظات إضافية' : 'Notes'}</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {editingExpense ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'حفظ وتحديث P&L' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: DOCUMENTED EXPENSE VOID (No Silent Hard Delete)              */}
      {/* ===================================================================== */}
      {voidTargetExpense && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVoidTargetExpense(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {isAr ? 'إلغاء المصروف بقيد موثق' : 'Void Expense with Audit Trail'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {isAr
                    ? `سيتم إلغاء "${voidTargetExpense.title}" (${fmtCurrency(voidTargetExpense.amount, true)}) واستبعاده من الحسابات مع الاحتفاظ بسجله في أرشيف الرقابة.`
                    : `Void "${voidTargetExpense.title}" while preserving full audit history.`}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isAr ? 'سبب الإلغاء (إلزامي) *' : 'Void Reason (Required) *'}</label>
              <input
                type="text"
                value={voidReasonInput}
                onChange={(e) => setVoidReasonInput(e.target.value)}
                placeholder={isAr ? 'مثال: تكرار قيد، إلغاء أمر الشراء، خطأ في القيمة...' : 'e.g. Duplicate entry, cancelled order...'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVoidTargetExpense(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {isAr ? 'تراجع' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={!voidReasonInput.trim()}
                onClick={handleConfirmVoidExpense}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black disabled:opacity-50 cursor-pointer"
              >
                {isAr ? 'اعتماد الإلغاء الموثق' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: REOPEN CLOSED MONTH WITH DOCUMENTED REASON                   */}
      {/* ===================================================================== */}
      {isReopenModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsReopenModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-600" />
              <span>{isAr ? `إعادة فتح شهر ${formatMonthTitle(selectedMonth, true)}` : `Reopen ${selectedMonth}`}</span>
            </h4>
            <p className="text-xs text-slate-600">
              {isAr
                ? 'سيتم تسجيل عملية إعادة الفتح في سجل الرقابة المالي مع اسم المستخدم والسبب الموثق.'
                : 'Reopening a closed month is permanently recorded in the audit log.'}
            </p>
            <input
              type="text"
              value={reopenReasonInput}
              onChange={(e) => setReopenReasonInput(e.target.value)}
              placeholder={isAr ? 'سبب إعادة الفتح (إلزامي)...' : 'Mandatory reason...'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={!reopenReasonInput.trim()}
                onClick={() => {
                  reopenFinancialMonth(selectedMonth, reopenReasonInput.trim(), actorName);
                  setIsReopenModalOpen(false);
                  showToast(isAr ? 'تمت إعادة فتح الشهر وتوثيق السبب في سجل الرقابة.' : 'Month reopened and logged.');
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black disabled:opacity-50 cursor-pointer"
              >
                {isAr ? 'تأكيد إعادة الفتح' : 'Confirm Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: FINANCIAL SETTINGS (Opening Cash + Shared Allocation Rule)   */}
      {/* ===================================================================== */}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900">
                {isAr ? 'إعدادات الرصيد الافتتاحي والسياسات المالية' : 'Financial Policy & Opening Balance'}
              </h4>
              <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'الرصيد النقدي الافتتاحي للوكالة (بدون أمانات إعلانات العملاء) — ج.م' : 'Agency Opening Cash Balance (EGP)'}
                </label>
                <input
                  type="number"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black font-mono text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'تاريخ بداية احتساب الرصيد النقدي' : 'Opening Balance Date'}
                </label>
                <input
                  type="date"
                  value={openingDateInput}
                  onChange={(e) => setOpeningDateInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'قاعدة توزيع تكلفة الفريق الثابتة على العملاء' : 'Shared Team Cost Allocation Rule'}
                </label>
                <select
                  value={allocRuleInput}
                  onChange={(e) => setAllocRuleInput(e.target.value as SharedCostAllocationRule)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="deliverables_weight">{isAr ? 'حسب وزن المخرجات (بوست ×1 / ريلز ×2.5 / ستوري ×0.35)' : 'Deliverables Weight'}</option>
                  <option value="equal">{isAr ? 'بالتساوي على جميع العملاء النشطين' : 'Equal Split'}</option>
                  <option value="revenue_weight">{isAr ? 'تناسبياً مع أتعاب كل عميل' : 'Revenue Share'}</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer"
                >
                  {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: DRILL-DOWN TRACEABILITY MODAL (التدقيق حتى مستوى الفاتورة)   */}
      {/* ===================================================================== */}
      {drillDown && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDrillDown(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-black">{drillDown.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">{drillDown.subtitle}</p>
              </div>
              <button type="button" onClick={() => setDrillDown(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">
                {isAr ? `إجمالي الحركات المكوّنة للرقم (${drillDown.items.length}):` : `Source Records (${drillDown.items.length}):`}
              </span>
              <span className="text-base font-black font-mono text-slate-950">
                {fmtCurrency(drillDown.total, isAr)}
              </span>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {drillDown.items.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {isAr ? 'لا توجد حركات مسجلة ضمن هذا البند.' : 'No underlying records.'}
                </div>
              ) : (
                drillDown.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-mono">{item.date}</span>
                        {item.categoryLabel && (
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                            {item.categoryLabel}
                          </span>
                        )}
                        {item.statusLabel && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                            {item.statusLabel}
                          </span>
                        )}
                        {item.subtitle && <span>{item.subtitle}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-slate-900 shrink-0">
                      {fmtCurrency(item.amount, isAr)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
