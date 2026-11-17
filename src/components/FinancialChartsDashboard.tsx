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
import { ClientInvoiceRecord, Inquiry, ServicePackage } from '../types';
import { parseInvoiceAmount } from '../utils/invoicePdfGenerator';
import { getClientDeliverableTargets } from '../utils/workflowUtils';

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

  // 1. Monthly Revenue Series (Retainer + Ad Credit + Total Billed)
  const monthlyRevenueData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeInvoices = invoices.filter((inv) => inv.paymentStatus !== 'cancelled');

    const map = new Map<
      string,
      { retainer: number; adCredit: number; total: number; invoiceCount: number }
    >();
    monthBuckets.forEach((key) => {
      map.set(key, { retainer: 0, adCredit: 0, total: 0, invoiceCount: 0 });
    });

    const invoicedClientMonths = new Set<string>();

    activeInvoices.forEach((inv) => {
      const mKey = extractMonthKey(inv.issueDate);
      if (!mKey) return;
      if (inv.clientId) {
        invoicedClientMonths.add(`${inv.clientId}__${mKey}`);
      }
      const bucket = map.get(mKey);
      if (bucket) {
        const ret = Number(inv.retainerAmount) || 0;
        const ad = Number(inv.adCreditAmount) || 0;
        const tot = Number(inv.grandTotal) || ret + ad;
        bucket.retainer += ret;
        bucket.adCredit += ad;
        bucket.total += tot;
        bucket.invoiceCount += 1;
      }
    });

    // Include contracted clients without an invoice in their active start month
    contractedClients.forEach((client) => {
      const mKey = extractMonthKey(client.contractStartDate || client.createdAt || todayStr);
      if (!mKey) return;
      if (invoicedClientMonths.has(`${client.id}__${mKey}`)) return;
      const bucket = map.get(mKey);
      if (!bucket) return;

      const parsedRet = client.retainerAmount || parseInvoiceAmount(client.budget);
      const pendingAd = Number(client.pendingInvoiceAdCredit) || 0;
      if (parsedRet > 0 || pendingAd > 0) {
        bucket.retainer += parsedRet;
        bucket.adCredit += pendingAd;
        bucket.total += parsedRet + pendingAd;
      }
    });

    return monthBuckets.map((key) => {
      const vals = map.get(key) || { retainer: 0, adCredit: 0, total: 0, invoiceCount: 0 };
      return {
        monthKey: key,
        monthLabel: getMonthLabel(key, isAr),
        retainer: vals.retainer,
        adCredit: vals.adCredit,
        total: vals.total,
        invoiceCount: vals.invoiceCount,
      };
    });
  }, [monthBuckets, invoices, contractedClients, isAr]);

  const revenueSummary = useMemo(() => {
    const totalWindowRevenue = monthlyRevenueData.reduce((sum, m) => sum + m.total, 0);
    const totalWindowRetainer = monthlyRevenueData.reduce((sum, m) => sum + m.retainer, 0);
    const currentMonth = monthlyRevenueData[monthlyRevenueData.length - 1];
    return {
      totalWindowRevenue,
      totalWindowRetainer,
      currentMonthTotal: currentMonth?.total || 0,
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

  // 3. Cash Flow Trends (Collected vs Pending vs Overdue over months)
  const cashFlowData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeInvoices = invoices.filter((inv) => inv.paymentStatus !== 'cancelled');

    const map = new Map<
      string,
      { collected: number; pending: number; overdue: number }
    >();
    monthBuckets.forEach((key) => {
      map.set(key, { collected: 0, pending: 0, overdue: 0 });
    });

    activeInvoices.forEach((inv) => {
      const isPaid = inv.paymentStatus === 'paid';
      const dateSource = isPaid ? inv.paidAt || inv.issueDate : inv.issueDate;
      const mKey = extractMonthKey(dateSource);
      if (!mKey) return;
      const bucket = map.get(mKey);
      if (!bucket) return;

      const amount = Number(inv.grandTotal) || 0;
      if (isPaid) {
        bucket.collected += amount;
      } else {
        const isPastDue =
          inv.paymentStatus === 'overdue' || Boolean(inv.dueDate && inv.dueDate < todayStr);
        if (isPastDue) {
          bucket.overdue += amount;
        } else {
          bucket.pending += amount;
        }
      }
    });

    return monthBuckets.map((key) => {
      const vals = map.get(key) || { collected: 0, pending: 0, overdue: 0 };
      return {
        monthKey: key,
        monthLabel: getMonthLabel(key, isAr),
        collected: vals.collected,
        pending: vals.pending,
        overdue: vals.overdue,
      };
    });
  }, [monthBuckets, invoices, isAr]);

  const cashFlowSummary = useMemo(() => {
    const totalCollected = cashFlowData.reduce((s, m) => s + m.collected, 0);
    const totalPending = cashFlowData.reduce((s, m) => s + m.pending, 0);
    const totalOverdue = cashFlowData.reduce((s, m) => s + m.overdue, 0);
    const totalAll = totalCollected + totalPending + totalOverdue;
    const collectionRate = totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0;
    return {
      totalCollected,
      totalPending,
      totalOverdue,
      outstanding: totalPending + totalOverdue,
      collectionRate,
    };
  }, [cashFlowData]);

  const hasAnyRevenue = monthlyRevenueData.some((d) => d.total > 0);
  const hasAnyCashFlow = cashFlowData.some(
    (d) => d.collected > 0 || d.pending > 0 || d.overdue > 0
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
                <span>{isAr ? 'الإيرادات الشهرية المفوترة' : 'Monthly Revenue'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAr
                  ? 'توزيع أتعاب الباقات والرصيد الإعلاني وإجمالي الفوترة شهرياً'
                  : 'Monthly management retainers, ad spend billed, and total revenue'}
              </p>
            </div>

            <div className="text-end bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-blue-700 block">
                {isAr ? 'إجمالي الفترة المحددة' : `Total (${monthsWindow}M)`}
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
                {isAr ? 'أتعاب الباقات (الشهر الحالي)' : 'Current Month Retainers'}
              </span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {revenueSummary.currentMonthRetainer.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] text-slate-500 font-bold block">
                {isAr ? 'إجمالي أتعاب الفترة' : 'Window Retainer Fees'}
              </span>
              <span className="text-sm font-black text-blue-700 tabular-nums">
                {revenueSummary.totalWindowRetainer.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
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
                    ? 'لا توجد فواتير أو تعاقدات مسجلة خلال هذه الفترة لعرض الرسم البياني.'
                    : 'No invoiced or contracted revenue recorded in this window yet.'}
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
                    name={isAr ? 'أتعاب الإدارة' : 'Retainer Fees'}
                    stackId="rev"
                    fill="#2563eb"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="adCredit"
                    name={isAr ? 'رصيد إعلاني' : 'Ad Credit'}
                    stackId="rev"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name={isAr ? 'إجمالي الإيراد' : 'Total Billed'}
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
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

      {/* Bottom Row: Chart 3 (Cash Flow Trends - Full Width) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'اتجاهات التدفق النقدي والتحصيل المالي' : 'Cash Flow Trends'}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? 'تتبع التحصيل الفعلي مقابل المستحقات قيد التحصيل والمتأخرات عبر الأشهر'
                : 'Realized cash collections vs pending and overdue receivables over time'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <span className="text-[10px] font-bold text-emerald-700 block">
                {isAr ? 'إجمالي المحصل' : 'Collected'}
              </span>
              <span className="text-sm font-black text-emerald-900 tabular-nums">
                {cashFlowSummary.totalCollected.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-700 block">
                {isAr ? 'مستحقات قيد التحصيل' : 'Pending / Overdue'}
              </span>
              <span className="text-sm font-black text-amber-900 tabular-nums">
                {cashFlowSummary.outstanding.toLocaleString(isAr ? 'ar-EG' : 'en-US')}{' '}
                {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-slate-800">
              <span className="text-[10px] font-bold text-slate-300 block">
                {isAr ? 'نسبة التحصيل' : 'Collection Rate'}
              </span>
              <span className="text-sm font-black text-emerald-400 tabular-nums">
                {cashFlowSummary.collectionRate}%
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
                  ? 'أصدر أو حصّل فواتير العملاء لعرض منحنى التدفق النقدي والتحصيل الشهري.'
                  : 'Issue or collect client invoices to visualize monthly cash flow trends.'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cashFlowData}
                margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="cfCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cfPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cfOverdue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
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
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                />
                <Tooltip content={<CustomChartTooltip isAr={isAr} unit="currency" />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name={isAr ? 'التحصيل الفعلي' : 'Collected Inflow'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cfCollected)"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  name={isAr ? 'قيد التحصيل' : 'Pending Receivables'}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cfPending)"
                />
                <Area
                  type="monotone"
                  dataKey="overdue"
                  name={isAr ? 'متأخر عن السداد' : 'Overdue'}
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cfOverdue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
