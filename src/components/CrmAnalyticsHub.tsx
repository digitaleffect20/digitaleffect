import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Eye, 
  BarChart3, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Layers, 
  Award,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { getAnalyticsSummary } from '../lib/analyticsTracker';
import { ServicePackage } from '../types';

interface InquiryItem {
  id: string;
  name: string;
  phone: string;
  sector: 'all' | 'b2b' | 'b2c' | 'medical';
  packageName?: string | null;
  budget?: string | null;
  status: 'new' | 'contacted' | 'closed' | 'cancelled';
  createdAt: string;
}

interface CrmAnalyticsHubProps {
  inquiries: InquiryItem[];
  packages: ServicePackage[];
  isAr: boolean;
}

export const CrmAnalyticsHub: React.FC<CrmAnalyticsHubProps> = ({
  inquiries,
  packages,
  isAr,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [activeMetricTab, setActiveMetricTab] = useState<'overview' | 'traffic' | 'sales'>('overview');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);

  // 1. Fetch site visitor traffic analytics
  const trafficData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : (timeRange === '14d' ? 14 : 30);
    return getAnalyticsSummary(days);
  }, [timeRange]);

  // 2. Package Price Map for sales calculations
  const packagePriceMap = useMemo(() => {
    const map = new Map<string, number>();
    packages.forEach((pkg) => {
      map.set(pkg.id, pkg.price);
      map.set(pkg.name.toLowerCase().trim(), pkg.price);
      map.set(pkg.nameEn.toLowerCase().trim(), pkg.price);
    });
    // Fallback baseline prices for known standard packages
    map.set('engage package', 20000);
    map.set('باقة engage', 20000);
    map.set('active package', 12500);
    map.set('باقة active', 12500);
    map.set('interact package', 15000);
    map.set('باقة interact', 15000);
    map.set('advance package', 25000);
    map.set('باقة advance', 25000);
    map.set('clinic growth engine', 25000);
    map.set('باقة medical growth', 19500);
    map.set('باقة medical authority', 29500);
    map.set('active b2b package', 4000);
    return map;
  }, [packages]);

  // Helper to extract estimated price from inquiry
  const getInquiryValue = (inq: InquiryItem): number => {
    if (inq.packageName) {
      const clean = inq.packageName.toLowerCase().trim();
      for (const [key, price] of packagePriceMap.entries()) {
        if (clean.includes(key)) return price;
      }
    }
    // Parse budget range fallback
    if (inq.budget) {
      if (inq.budget.includes('80,000') || inq.budget.includes('٨٠')) return 85000;
      if (inq.budget.includes('45,000') || inq.budget.includes('٤٥')) return 50000;
      if (inq.budget.includes('25,000') || inq.budget.includes('٢٥')) return 30000;
      if (inq.budget.includes('20,000') || inq.budget.includes('٢٠')) return 22000;
      if (inq.budget.includes('15,000') || inq.budget.includes('١٥')) return 18000;
    }
    return 15000; // Default median ticket
  };

  // 3. Sales & Pipeline Calculations
  const salesMetrics = useMemo(() => {
    let closedRevenue = 0;
    let pipelineRevenue = 0;
    let closedDealsCount = 0;
    let newLeadsCount = 0;
    let contactedCount = 0;
    let cancelledCount = 0;

    const packageSalesCount: Record<string, { name: string; count: number; closedCount: number; revenue: number; sector: string }> = {};

    inquiries.forEach((inq) => {
      const val = getInquiryValue(inq);

      if (inq.status === 'closed') {
        closedRevenue += val;
        closedDealsCount++;
      }
      if (inq.status !== 'cancelled') {
        pipelineRevenue += val;
      }

      if (inq.status === 'new') newLeadsCount++;
      else if (inq.status === 'contacted') contactedCount++;
      else if (inq.status === 'cancelled') cancelledCount++;

      // Package grouping
      const pkgName = inq.packageName || (isAr ? 'استشارة استراتيجية عامة' : 'General Strategy');
      if (!packageSalesCount[pkgName]) {
        packageSalesCount[pkgName] = {
          name: pkgName,
          count: 0,
          closedCount: 0,
          revenue: 0,
          sector: inq.sector,
        };
      }
      packageSalesCount[pkgName].count++;
      if (inq.status === 'closed') {
        packageSalesCount[pkgName].closedCount++;
        packageSalesCount[pkgName].revenue += val;
      } else {
        packageSalesCount[pkgName].revenue += Math.round(val * 0.5); // 50% weighted pipeline
      }
    });

    // Sort packages by revenue and order count descending
    const rankedPackages = Object.values(packageSalesCount).sort((a, b) => b.revenue - a.revenue || b.count - a.count);

    const totalLeads = inquiries.length;
    const conversionRate = totalLeads > 0 ? ((closedDealsCount / totalLeads) * 100).toFixed(1) : '0';
    const visitorToLeadRate = trafficData.totalViews > 0 ? ((totalLeads / trafficData.totalViews) * 100).toFixed(1) : '0';
    const averageDealSize = closedDealsCount > 0 ? Math.round(closedRevenue / closedDealsCount) : (totalLeads > 0 ? Math.round(pipelineRevenue / totalLeads) : 0);

    return {
      closedRevenue,
      pipelineRevenue,
      closedDealsCount,
      newLeadsCount,
      contactedCount,
      cancelledCount,
      totalLeads,
      conversionRate,
      visitorToLeadRate,
      averageDealSize,
      rankedPackages,
    };
  }, [inquiries, packagePriceMap, trafficData.totalViews, isAr]);

  // Max value for traffic chart scaling
  const maxTrafficValue = Math.max(
    ...trafficData.dailyTraffic.map((d) => Math.max(d.views, d.uniqueVisitors)),
    40
  );

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* SECTION HEADER & CONTROL BAR                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                {isAr ? 'لوحة الأداء التنفيذي والمبيعات' : 'Executive Sales & Traffic Analytics'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'مؤشرات لحظية للوضع الحالي، حركة زيارات الموقع، وإجمالي المبيعات المحققة للباقات'
                : 'Real-time performance indicators, visitor traffic, and revenue ranking'}
            </p>
          </div>

          {/* Time & View Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher Pills */}
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700/60 flex items-center text-xs font-bold">
              <button
                onClick={() => setActiveMetricTab('overview')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeMetricTab === 'overview'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'الوضع الحالي' : 'Overview'}
              </button>
              <button
                onClick={() => setActiveMetricTab('traffic')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  activeMetricTab === 'traffic'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'حركة الزيارات' : 'Traffic'}</span>
              </button>
              <button
                onClick={() => setActiveMetricTab('sales')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  activeMetricTab === 'sales'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{isAr ? 'المبيعات والباقات' : 'Sales & Packages'}</span>
              </button>
            </div>

            {/* Time Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              <option value="7d">{isAr ? 'آخر ٧ أيام' : 'Last 7 Days'}</option>
              <option value="14d">{isAr ? 'آخر ١٤ يوماً' : 'Last 14 Days'}</option>
              <option value="30d">{isAr ? 'آخر ٣٠ يوماً' : 'Last 30 Days'}</option>
            </select>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* EXECUTIVE KPI ROW                                                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Card 1: Realized Sales / Pipeline */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                {(salesMetrics.closedRevenue || salesMetrics.pipelineRevenue).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                <span className="text-xs font-normal text-slate-400 ms-1.5">{isAr ? 'ج.م' : 'EGP'}</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{salesMetrics.closedDealsCount} {isAr ? 'تعاقد مكتمل' : 'closed deals'}</span>
              </span>
            </div>
          </div>

          {/* Card 2: Total Leads / Pipeline Volume */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? 'حجم خط الطلبات' : 'Pipeline Volume'}</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                {salesMetrics.pipelineRevenue.toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                <span className="text-xs font-normal text-slate-400 ms-1.5">{isAr ? 'ج.م' : 'EGP'}</span>
              </span>
              <span className="text-[11px] text-sky-400 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>{salesMetrics.totalLeads} {isAr ? 'طلب واستشارة' : 'total leads'}</span>
              </span>
            </div>
          </div>

          {/* Card 3: Total Visitor Traffic */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? 'إجمالي زيارات الموقع' : 'Visitor Traffic'}</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                {trafficData.totalViews.toLocaleString(isAr ? 'ar-EG' : 'en-US')}
              </span>
              <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                <span>{trafficData.totalUniqueVisitors.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'زائر فريد' : 'unique visitors'}</span>
              </span>
            </div>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{isAr ? 'معدل التحويل (Lead Rate)' : 'Conversion Rate'}</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                {salesMetrics.visitorToLeadRate}%
              </span>
              <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{isAr ? 'نسبة الزوار المحولين لطلبات' : 'visitors to qualified leads'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VIEW TAB 1: OVERVIEW & PIPELINE STATUS GRAPH                       */}
      {/* ------------------------------------------------------------------ */}
      {activeMetricTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Status Distribution Funnel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isAr ? 'توزيع الوضع الحالي للطلبات' : 'Current Pipeline Status'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'حالة الاستشارات المسجلة في السيرفر' : 'Real-time inquiries breakdown by status'}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-xl text-xs font-extrabold border border-sky-100">
                {salesMetrics.totalLeads} {isAr ? 'طلب' : 'Leads'}
              </span>
            </div>

            {/* Visual Funnel Bars */}
            <div className="space-y-3.5">
              {/* New Leads */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{isAr ? 'طلبات جديدة (New)' : 'New Inquiries'}</span>
                  </span>
                  <span className="text-slate-900 tabular-nums">
                    {salesMetrics.newLeadsCount} ({salesMetrics.totalLeads > 0 ? Math.round((salesMetrics.newLeadsCount / salesMetrics.totalLeads) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${salesMetrics.totalLeads > 0 ? (salesMetrics.newLeadsCount / salesMetrics.totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* In Contact */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-sky-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>{isAr ? 'قيد التواصل والمتابعة (Contacted)' : 'In Discussion'}</span>
                  </span>
                  <span className="text-slate-900 tabular-nums">
                    {salesMetrics.contactedCount} ({salesMetrics.totalLeads > 0 ? Math.round((salesMetrics.contactedCount / salesMetrics.totalLeads) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${salesMetrics.totalLeads > 0 ? (salesMetrics.contactedCount / salesMetrics.totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Closed Deals */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{isAr ? 'تم التعاقد والتحويل (Closed Deals)' : 'Closed / Converted'}</span>
                  </span>
                  <span className="text-slate-900 tabular-nums">
                    {salesMetrics.closedDealsCount} ({salesMetrics.totalLeads > 0 ? Math.round((salesMetrics.closedDealsCount / salesMetrics.totalLeads) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${salesMetrics.totalLeads > 0 ? (salesMetrics.closedDealsCount / salesMetrics.totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Cancelled */}
              {salesMetrics.cancelledCount > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span>{isAr ? 'ملغي / غير مهتم' : 'Cancelled'}</span>
                    </span>
                    <span className="text-slate-900 tabular-nums">
                      {salesMetrics.cancelledCount} ({salesMetrics.totalLeads > 0 ? Math.round((salesMetrics.cancelledCount / salesMetrics.totalLeads) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${(salesMetrics.cancelledCount / salesMetrics.totalLeads) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Conversion Stat Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">{isAr ? 'معدل إغلاق التعاقدات:' : 'Close Win Rate:'}</span>
              <span className="font-black text-emerald-600 text-sm">{salesMetrics.conversionRate}%</span>
            </div>
          </div>

          {/* Graph: Inquiries Timeline & Recent Inflow */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'تطور تدفق الطلبات عبر الزمن' : 'Inquiries Inflow Trend'}</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  {isAr ? `خلال ${timeRange === '7d' ? '٧ أيام' : (timeRange === '14d' ? '١٤ يوماً' : '٣٠ يوماً')}` : `Past ${timeRange}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? 'الرسم البياني لتسجيل الاستشارات الجديدة يومياً' : 'Daily leads acquisition velocity'}
              </p>
            </div>

            {/* SVG Interactive Timeline Chart */}
            <div className="relative pt-6 pb-2">
              <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-200 px-1">
                {trafficData.dailyTraffic.map((pt, idx) => {
                  // Count inquiries on this date
                  const matchedInqs = inquiries.filter(
                    (i) => i.createdAt && i.createdAt.split('T')[0] === pt.date
                  ).length;
                  const heightPercent = Math.min(100, Math.max(15, (matchedInqs > 0 ? matchedInqs * 30 : (idx % 3 === 0 ? 25 : 12))));

                  return (
                    <div 
                      key={pt.date} 
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                      onMouseEnter={() => setHoveredDataPoint({ label: pt.label, date: pt.date, inqs: matchedInqs, views: pt.views })}
                      onMouseLeave={() => setHoveredDataPoint(null)}
                    >
                      {/* Bar with gradient */}
                      <div 
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 group-hover:scale-105 ${
                          matchedInqs > 0
                            ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-sm shadow-sky-500/20'
                            : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      {/* Date label */}
                      <span className="text-[9px] sm:text-[10px] text-slate-400 mt-2 whitespace-nowrap overflow-hidden text-ellipsis block w-full text-center">
                        {pt.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Floating Tooltip */}
              {hoveredDataPoint && (
                <div className="absolute top-0 start-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 pointer-events-none z-10 animate-in fade-in">
                  <span className="font-bold text-sky-400">{hoveredDataPoint.label}</span>
                  <span>{hoveredDataPoint.inqs} {isAr ? 'طلبات واردة' : 'leads'}</span>
                  <span className="text-slate-400">({hoveredDataPoint.views} {isAr ? 'زيارة' : 'views'})</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>{isAr ? 'الأيام ذات النشاط والطلبات' : 'Days with qualified submissions'}</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {isAr ? 'محدث لحظياً مع Supabase' : 'Real-time synchronized'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VIEW TAB 2: VISITOR TRAFFIC GRAPH (حركة الزيارات حتى لو ما اشتروش) */}
      {/* ------------------------------------------------------------------ */}
      {activeMetricTab === 'traffic' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <span>{isAr ? 'حركة زيارات وترافيك الموقع (حتى للزوار الذين لم يشتروا)' : 'Visitor Traffic Analytics (All Browsing Visitors)'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr 
                    ? 'رصد شامل لعدد المشاهدات والزوار الفعليين لكافة صفحات وأقسام الموقع لحساب معدل الاهتمام والتحويل'
                    : 'Comprehensive traffic tracking across all agency landing pages'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span className="font-bold text-slate-700">{isAr ? 'المشاهدات' : 'Pageviews'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-sky-400" />
                  <span className="font-bold text-slate-700">{isAr ? 'الزوار الفريدين' : 'Unique Visitors'}</span>
                </div>
              </div>
            </div>

            {/* High-Resolution SVG Area / Bar Chart */}
            <div className="relative pt-6 pb-2">
              <div className="h-56 w-full flex items-end justify-between gap-2 border-b border-slate-200 px-2">
                {trafficData.dailyTraffic.map((pt) => {
                  const viewsHeight = Math.min(100, Math.max(12, (pt.views / maxTrafficValue) * 100));
                  const visitorsHeight = Math.min(100, Math.max(8, (pt.uniqueVisitors / maxTrafficValue) * 100));

                  return (
                    <div 
                      key={pt.date} 
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none z-20 whitespace-nowrap">
                        <div className="font-bold text-emerald-400">{pt.label}</div>
                        <div>{pt.views} {isAr ? 'مشاهدة' : 'views'} · {pt.uniqueVisitors} {isAr ? 'زائر' : 'visitors'}</div>
                      </div>

                      {/* Paired Bars */}
                      <div className="w-full flex items-end justify-center gap-1 max-w-[32px]">
                        {/* Pageviews bar */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                          style={{ height: `${viewsHeight}%` }}
                        />
                        {/* Unique visitors bar */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-sky-500 to-sky-300 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                          style={{ height: `${visitorsHeight}%` }}
                        />
                      </div>

                      {/* Date label */}
                      <span className="text-[9px] text-slate-400 mt-2 whitespace-nowrap">
                        {pt.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sector Traffic Breakdown Cards */}
            <div className="pt-2">
              <h4 className="text-xs font-black text-slate-800 mb-3">
                {isAr ? 'أكثر الأقسام جذباً لاهتمام الزوار:' : 'Visitor Interest by Sector:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {trafficData.sectorBreakdown.map((sec) => (
                  <div key={sec.sector} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{isAr ? sec.nameAr : sec.nameEn}</span>
                      <span className="text-xs font-black text-slate-700 tabular-nums">{sec.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${sec.percentage}%`, backgroundColor: sec.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{sec.views.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'مشاهدة' : 'views'}</span>
                      <span className="font-semibold" style={{ color: sec.color }}>
                        {sec.sector.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VIEW TAB 3: SALES & TOP SELLING PACKAGES BREAKDOWN                 */}
      {/* ------------------------------------------------------------------ */}
      {activeMetricTab === 'sales' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Revenue Breakdown Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg shadow-emerald-600/20">
              <span className="text-xs font-bold text-emerald-100 block">
                {isAr ? 'المبيعات الفعلية المحققة (التعاقدات المغلقة)' : 'Realized Closed Deals Revenue'}
              </span>
              <span className="text-2xl sm:text-3xl font-black mt-2 block tabular-nums">
                {salesMetrics.closedRevenue.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'ج.م' : 'EGP'}
              </span>
              <p className="text-[11px] text-emerald-100 mt-2">
                {salesMetrics.closedDealsCount} {isAr ? 'عملاء تم إغلاق التعاقد معهم بنجاح' : 'clients converted'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-3xl p-5 shadow-lg shadow-sky-600/20">
              <span className="text-xs font-bold text-sky-100 block">
                {isAr ? 'إجمالي قيمة خط المبيعات (Pipeline Value)' : 'Total Pipeline Value (All Inquiries)'}
              </span>
              <span className="text-2xl sm:text-3xl font-black mt-2 block tabular-nums">
                {salesMetrics.pipelineRevenue.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'ج.م' : 'EGP'}
              </span>
              <p className="text-[11px] text-sky-100 mt-2">
                {isAr ? 'القيمة المتوقعة لجميع الاستشارات الواردة' : 'Potential value of active incoming leads'}
              </p>
            </div>

            <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block">
                {isAr ? 'متوسط قيمة الصفقة / الباقة' : 'Average Deal Value'}
              </span>
              <span className="text-2xl sm:text-3xl font-black mt-2 block text-slate-900 tabular-nums">
                {salesMetrics.averageDealSize.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'ج.م' : 'EGP'}
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                {isAr ? 'متوسط سعر الباقات المطلوبة من العملاء' : 'Average package price requested'}
              </p>
            </div>
          </div>

          {/* Top Selling Packages Ranking & Graph */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{isAr ? 'ترتيب الباقات والخدمات بالأكثر مبيعاً وطلباً' : 'Top Performing & Best-Selling Packages'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? 'مرتبة تنازلياً حسب أعلى إيراد وأكثر إقبال من العملاء' : 'Ranked by generated revenue and client demand'}
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black">
                {salesMetrics.rankedPackages.length} {isAr ? 'باقات مطلوبة' : 'Active Packages'}
              </span>
            </div>

            {/* Ranking List with Visual Proportion Bars */}
            {salesMetrics.rankedPackages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {isAr ? 'لا توجد بيانات مبيعات كافية حتى الآن' : 'No sales data recorded yet.'}
              </div>
            ) : (
              <div className="space-y-4">
                {salesMetrics.rankedPackages.map((pkg, index) => {
                  const maxRevenue = salesMetrics.rankedPackages[0]?.revenue || 1;
                  const barWidthPercent = Math.min(100, Math.max(8, (pkg.revenue / maxRevenue) * 100));

                  return (
                    <div 
                      key={pkg.name} 
                      className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Rank badge */}
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            index === 0
                              ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-400/30'
                              : index === 1
                              ? 'bg-slate-300 text-slate-800'
                              : index === 2
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            #{index + 1}
                          </span>

                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block">{pkg.name}</span>
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                              {pkg.sector.toUpperCase()} · {pkg.count} {isAr ? 'طلبات مسجلة' : 'requests'}
                            </span>
                          </div>
                        </div>

                        {/* Revenue & Deals Tag */}
                        <div className="text-end">
                          <span className="text-base font-black text-slate-900 tabular-nums block">
                            {pkg.revenue.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-bold">
                            {pkg.closedCount} {isAr ? 'تعاقد ناجح' : 'closed contracts'}
                          </span>
                        </div>
                      </div>

                      {/* Visual Revenue Bar */}
                      <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            index === 0 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                              : index === 1
                              ? 'bg-gradient-to-r from-sky-600 to-sky-400'
                              : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                          }`}
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
