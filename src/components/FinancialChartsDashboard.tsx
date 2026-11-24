import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  Wallet,
  Calendar,
  Layers,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { AgencyExpense, ClientInvoiceRecord, Inquiry, ServicePackage } from '../types';
import { getClientDeliverableTargets } from '../utils/workflowUtils';
import { computeMonthlyCashFlow, computeMonthlyPnL } from '../utils/accountingEngine';

export type AnalyticsInquiry = Omit<
  Inquiry,
  'phoneE164' | 'phoneCountry' | 'visitorCountry' | 'company' | 'packageId' | 'packageName' | 'budget' | 'notes'
> & {
  phoneE164?: string | null;
  phoneCountry?: string | null;
  visitorCountry?: string | null;
  company?: string | null;
  packageId?: string | null;
  packageName?: string | null;
  budget?: string | null;
  notes?: string | null;
};

interface FinancialChartsDashboardProps {
  inquiries: AnalyticsInquiry[];
  invoices?: ClientInvoiceRecord[];
  expenses?: AgencyExpense[];
  packages: ServicePackage[];
  isAr: boolean;
}

const ARABIC_MONTHS = [
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

const ENGLISH_MONTHS = [
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

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(monthKey: string, isAr: boolean): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = Math.max(0, Math.min(11, parseInt(monthStr, 10) - 1));
  const label = isAr ? ARABIC_MONTHS[monthIdx] : ENGLISH_MONTHS[monthIdx];
  return `${label} ${yearStr.slice(-2)}`;
}

function extractMonthKey(dateStr?: string): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  isAr: boolean;
  unit?: 'currency' | 'percent';
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  isAr,
  unit = 'currency',
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="bg-slate-900/95 backdrop-blur-sm text-white rounded-2xl border border-slate-700/90 shadow-xl px-3.5 py-2.5 text-xs space-y-1.5 min-w-[170px]"
    >
      <div className="font-black text-slate-200 border-b border-slate-700/70 pb-1">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || '#38bdf8' }}
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-black text-white tabular-nums">
              {Number(entry.value || 0).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
              {unit === 'percent' ? '%' : isAr ? ' ج.م' : ' EGP'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FinancialChartsDashboard: React.FC<FinancialChartsDashboardProps> = ({
  inquiries,
  invoices = [],
  expenses = [],
  packages,
  isAr,
}) => {
  const [monthsWindow, setMonthsWindow] = useState<3 | 6 | 12>(6);

  const monthBuckets = useMemo(() => {
    const now = new Date();
    const list: string[] = [];
    for (let i = monthsWindow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push(formatMonthKey(d));
    }
    return list;
  }, [monthsWindow]);

  const contractedClients = useMemo(
    () => inquiries.filter((inq) => inq.status === 'closed'),
    [inquiries]
  );

  // 1. Monthly Accrual Earned Agency Revenue (Separated from Client Passthrough Ad Funds)
  const monthlyRevenueData = useMemo(() => {
    const activeInvoices = invoices.filter((inv) => inv.paymentStatus !== 'cancelled' && !inv.isDraft);

    return monthBuckets.map((key) => {
      const pnl = computeMonthlyPnL(key, activeInvoices, expenses);
      const adFundsInMonth = activeInvoices
        .filter((inv) => extractMonthKey(inv.issueDate) === key && inv.adFundsTreatment !== 'agency_principal')
        .reduce((s, inv) => s + Math.max(0, Number(inv.adCreditAmount) || 0), 0);
      return {
        monthKey: key,
        monthLabel: getMonthLabel(key, isAr),
        retainer: pnl.earnedServiceRevenue,
        adCredit: adFundsInMonth,
        total: pnl.earnedServiceRevenue,
        invoiceCount: pnl.revenueItems.length,
      };
    });
  }, [monthBuckets, invoices, expenses, isAr]);

  const revenueSummary = useMemo(() => {
    const totalWindowRetainer = monthlyRevenueData.reduce((sum, m) => sum + m.retainer, 0);
    const totalWindowAdFunds = monthlyRevenueData.reduce((sum, m) => sum + m.adCredit, 0);
    const currentMonth = monthlyRevenueData[monthlyRevenueData.length - 1];
    return {
      totalWindowRevenue: totalWindowRetainer,
      totalWindowRetainer,
      totalWindowAdFunds,
      currentMonthTotal: currentMonth?.retainer || 0,
      currentMonthRetainer: currentMonth?.retainer || 0,
    };
  }, [monthlyRevenueData]);

  // 2. Project Completion Rates per Contracted Client (Deliverables % & Workflow %)
  const projectCompletionData = useMemo(() => {
    return contractedClients.map((client) => {
      const targets = getClientDeliverableTargets(client as Inquiry, packages);
      const totalTarget = Math.max(0, targets.totalTarget);
      const deliveredCount =
        (client.postsDelivered || 0) +
        (client.reelsDelivered || 0) +
        (client.storiesDelivered || 0);
      const deliverablesRate =
        totalTarget > 0 ? Math.min(100, Math.round((deliveredCount / totalTarget) * 100)) : 0;

      const stages = client.workflowStages || [];
      const totalStages = stages.length > 0 ? stages.length : 5;
      const completedStages = stages.filter((s) => s.status === 'completed').length;
      const inProgressStages = stages.filter((s) => s.status === 'in_progress').length;
      // Completed stages count 100%, in-progress counts 50% toward workflow completion
      const workflowRate = Math.min(
        100,
        Math.round(((completedStages + inProgressStages * 0.5) / totalStages) * 100)
      );

      const displayName = (client.company || client.name || '').trim();
      const shortName = displayName.length > 16 ? `${displayName.slice(0, 15)}…` : displayName;

      return {
        id: client.id,
        name: shortName,
        fullName: displayName,
        deliverablesRate,
        workflowRate,
        deliveredCount,
        totalTarget,
        completedStages,
        totalStages,
      };
    });
  }, [contractedClients, packages]);

  const completionSummary = useMemo(() => {
    if (projectCompletionData.length === 0) {
      return { avgDeliverables: 0, avgWorkflow: 0, totalClients: 0 };
    }
    const sumDel = projectCompletionData.reduce((s, c) => s + c.deliverablesRate, 0);
    const sumWf = projectCompletionData.reduce((s, c) => s + c.workflowRate, 0);
    return {
      avgDeliverables: Math.round(sumDel / projectCompletionData.length),
      avgWorkflow: Math.round(sumWf / projectCompletionData.length),
      totalClients: projectCompletionData.length,
    };
  }, [projectCompletionData]);

  // 3. Separate Cash Flow (الفرق النقدي) vs Accrual Net Profit (صافي الربح المحاسبي)
  const cashFlowData = useMemo(() => {
    const castClients = inquiries as unknown as Inquiry[];
    return monthBuckets.map((key) => {
      const pnl = computeMonthlyPnL(key, invoices, expenses);
      const cf = computeMonthlyCashFlow(key, invoices, expenses, castClients);
      return {
        monthKey: key,
        monthLabel: getMonthLabel(key, isAr),
        collected: cf.agencyCashInflows,
        expenses: pnl.totalAccruedExpenses,
        netCashFlow: cf.agencyNetCashFlow,
        accrualNetProfit: pnl.netProfitBeforeTax,
      };
    });
  }, [monthBuckets, invoices, expenses, inquiries, isAr]);

  const cashFlowSummary = useMemo(() => {
    const totalCollected = cashFlowData.reduce((s, m) => s + m.collected, 0);
    const totalExpenses = cashFlowData.reduce((s, m) => s + m.expenses, 0);
    const totalNetCashFlow = cashFlowData.reduce((s, m) => s + m.netCashFlow, 0);
    const totalAccrualNetProfit = cashFlowData.reduce((s, m) => s + m.accrualNetProfit, 0);
    return {
      totalCollected,
      totalExpenses,
      totalNetCashFlow,
      totalAccrualNetProfit,
    };
  }, [cashFlowData]);

  const hasAnyRevenue = monthlyRevenueData.some((d) => d.retainer > 0 || d.adCredit > 0);
  const hasAnyCashFlow = cashFlowData.some(
    (d) => d.collected > 0 || d.expenses > 0 || d.accrualNetProfit !== 0
  );

  return (
    <div className="space-y-6">
      {/* Header & Month Horizon Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {isAr
                ? 'لوحة المؤشرات المالية وإنجاز المشاريع (Recharts)'
                : 'Financial & Project Performance Charts'}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'تحليل حي للإيرادات الشهرية، نسب إنجاز مخرجات ومراحل المشاريع، واتجاهات التدفق النقدي والتحصيل.'
              : 'Live breakdown of monthly revenue, client project completion rates, and cash flow trends.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
          <Calendar className="w-3.5 h-3.5 text-slate-500 mx-1.5" />
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonthsWindow(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monthsWindow === m
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isAr ? `${m} أشهر` : `${m}M`}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Chart 1 (Monthly Revenue) + Chart 2 (Project Completion Rates) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: MONTHLY REVENUE */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'إيرادات الوكالة المكتسبة (مفصولة عن أموال الإعلانات)' : 'Earned Agency Revenue (Ad Funds Separated)'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAr
                  ? 'أتعاب الإدارة الموزعة على أشهر الخدمة (الاستحقاق) مقابل ميزانيات إعلانات العملاء كعمود منفصل'
                  : 'Prorated agency fees vs isolated client ad budgets'}
              </p>
            </div>

            <div className="text-end bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-blue-700 block">
                {isAr ? 'إجمالي إيراد الوكالة المكتسب' : `Earned Agency Fees (${monthsWindow}M)`}
              </span>
              <span className="text-sm font-black text-blue-950 tabular-nums">
                {revenueSummary.totalWindowRevenue.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] text-slate-500 font-bold block">
                {isAr ? 'إيراد الوكالة المكتسب (الشهر الحالي)' : 'Current Month Earned Fees'}
              </span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {revenueSummary.currentMonthRetainer.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/70">
              <span className="text-[10px] text-purple-700 font-bold block">
                {isAr ? 'أموال إعلانات العملاء (خارج إيراد الوكالة)' : 'Client Ad Budgets (Passthrough)'}
              </span>
              <span className="text-sm font-black text-purple-900 tabular-nums">
                {revenueSummary.totalWindowAdFunds.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          <div className="h-72 w-full min-w-0 pt-2" dir="ltr">
            {!hasAnyRevenue ? (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center p-6 space-y-2">
                <DollarSign className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-500">
                  {isAr
                    ? 'لا توجد فواتير صادرة خلال هذه الفترة لعرض الرسم البياني.'
                    : 'No invoiced revenue recorded in this window yet.'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyRevenueData}
                  margin={{ top: 10, right: 12, left: 4, bottom: 4 }}
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
                      v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                    }
                  />
                  <Tooltip content={<CustomChartTooltip isAr={isAr} unit="currency" />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }}
                  />
                  <Bar
                    dataKey="retainer"
                    name={isAr ? 'إيراد الوكالة المكتسب (أتعاب)' : 'Earned Agency Fees'}
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="adCredit"
                    name={isAr ? 'ميزانيات إعلانات عملاء (منفصلة)' : 'Client Ad Funds (Isolated)'}
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: PROJECT COMPLETION RATES */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'نسب إنجاز المشاريع والتسليمات' : 'Project Completion Rates'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAr
                  ? 'مقارنة نسبة تسليم المخرجات (بوستات/ريلز/ستوريز) مع تقدم مراحل التنفيذ لكل عميل'
                  : 'Deliverables progress vs workflow stage completion across contracted clients'}
              </p>
            </div>

            <div className="text-end bg-emerald-50/80 border border-emerald-100 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-700 block">
                {isAr ? 'متوسط الإنجاز' : 'Avg Completion'}
              </span>
              <span className="text-sm font-black text-emerald-950 tabular-nums">
                {completionSummary.avgDeliverables}% / {completionSummary.avgWorkflow}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
              <span className="text-[10px] text-emerald-700 font-bold block">
                {isAr ? 'متوسط تسليم المخرجات' : 'Avg Deliverables Rate'}
              </span>
              <span className="text-sm font-black text-emerald-900 tabular-nums">
                {completionSummary.avgDeliverables}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
              <span className="text-[10px] text-indigo-700 font-bold block">
                {isAr ? 'متوسط تقدم مراحل العمل' : 'Avg Workflow Progress'}
              </span>
              <span className="text-sm font-black text-indigo-900 tabular-nums">
                {completionSummary.avgWorkflow}%
              </span>
            </div>
          </div>

          <div className="h-72 w-full min-w-0 pt-2" dir="ltr">
            {projectCompletionData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center p-6 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-500">
                  {isAr
                    ? 'لا يوجد عملاء متعاقدون حالياً لعرض نسب إنجاز المشاريع.'
                    : 'No active contracted projects yet to track completion rates.'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectCompletionData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip content={<CustomChartTooltip isAr={isAr} unit="percent" />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }}
                  />
                  <Bar
                    dataKey="deliverablesRate"
                    name={isAr ? 'نسبة تسليم المخرجات' : 'Deliverables %'}
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="workflowRate"
                    name={isAr ? 'نسبة مراحل التنفيذ' : 'Workflow Stages %'}
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Chart 3 (Separate Accrual Net Profit vs Cash Flow — Never Conflated) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'مقارنة صافي الربح المحاسبي (الاستحقاق) مقابل الفرق النقدي (التدفق)' : 'Accrual Net Profit vs Operating Cash Flow'}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? 'فصل واضح بين صافي الربح المحاسبي (إيرادات مكتسبة − مصروفات مستحقة) والفرق النقدي (تحصيلات أتعاب − مدفوعات فعلية)'
                : 'Strict distinction between Accrual Net Profit and Cash Basis Net Cash Flow'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <span className="text-[10px] font-bold text-emerald-700 block">
                {isAr ? 'تحصيل أتعاب نقدي' : 'Agency Cash In'}
              </span>
              <span className="text-sm font-black text-emerald-900 tabular-nums">
                {cashFlowSummary.totalCollected.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200/80">
              <span className="text-[10px] font-bold text-rose-700 block">
                {isAr ? 'المصروفات المستحقة' : 'Accrued Expenses'}
              </span>
              <span className="text-sm font-black text-rose-900 tabular-nums">
                {cashFlowSummary.totalExpenses.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-800 block">
                {isAr ? 'الفرق النقدي (سيولة)' : 'Net Cash Flow'}
              </span>
              <span className="text-sm font-black text-amber-950 tabular-nums">
                {cashFlowSummary.totalNetCashFlow.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
              <span className="text-[10px] font-bold text-slate-300 block">
                {isAr ? 'صافي الربح (P&L)' : 'Accrual Net Profit'}
              </span>
              <span
                className={`text-sm font-black tabular-nums ${
                  cashFlowSummary.totalAccrualNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {cashFlowSummary.totalAccrualNetProfit.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full min-w-0" dir="ltr">
          {!hasAnyCashFlow ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center p-6 space-y-2">
              <AlertTriangle className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-500">
                {isAr
                  ? 'أصدر فواتير العملاء وسجّل المصروفات والرواتب لعرض منحنى صافي الربح والتدفق النقدي.'
                  : 'Issue invoices and log expenses to visualize profit vs cash flow.'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cashFlowData}
                margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="cfCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                <Tooltip content={<CustomChartTooltip isAr={isAr} unit="currency" />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name={isAr ? 'تحصيل أتعاب نقدي' : 'Agency Cash In'}
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cfCollected)"
                />
                <Bar
                  dataKey="expenses"
                  name={isAr ? 'المصروفات المستحقة' : 'Accrued Expenses'}
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Line
                  type="monotone"
                  dataKey="accrualNetProfit"
                  name={isAr ? 'صافي الربح المحاسبي (P&L)' : 'Accrual Net Profit'}
                  stroke="#0f172a"
                  strokeWidth={2.6}
                  dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="netCashFlow"
                  name={isAr ? 'الفرق النقدي (Cash Flow)' : 'Net Cash Flow'}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3.5, fill: '#f59e0b' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
