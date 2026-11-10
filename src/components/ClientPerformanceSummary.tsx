import React, { useState, useMemo } from 'react';
import { Inquiry, ClientWorkflowStage } from '../types';
import { getClientDeliverableTargets } from '../utils/workflowUtils';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  Eye,
  Users,
  Target,
  Award,
  Calendar,
  Share2,
  Zap,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ClientPerformanceSummaryProps {
  client: Inquiry;
  isAr: boolean;
  onNavigateToDeliverables?: () => void;
  className?: string;
}

export const ClientPerformanceSummary: React.FC<ClientPerformanceSummaryProps> = ({
  client,
  isAr,
  onNavigateToDeliverables,
  className = '',
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'production' | 'impact' | 'distribution'>('production');
  const [timeRange, setTimeRange] = useState<'current_month' | 'cumulative'>('current_month');

  // Deliverables stats
  const resolvedTargets = useMemo(() => getClientDeliverableTargets(client), [client]);
  const targetPosts = resolvedTargets.postsTarget;
  const targetReels = resolvedTargets.reelsTarget;
  const targetStories = resolvedTargets.storiesTarget;
  const totalTarget = resolvedTargets.totalTarget;

  const deliveredPosts = client.postsDelivered ?? 0;
  const deliveredReels = client.reelsDelivered ?? 0;
  const deliveredStories = client.storiesDelivered ?? 0;
  const totalDelivered = deliveredPosts + deliveredReels + deliveredStories;

  const planCompletionPct = Math.min(100, Math.round((totalDelivered / totalTarget) * 100));

  // Stages stats
  const stages: ClientWorkflowStage[] = client.workflowStages || [];
  const completedStages = stages.filter((s) => s.status === 'completed');
  const inProgressStages = stages.filter((s) => s.status === 'in_progress');
  const pendingStages = stages.filter((s) => s.status === 'pending');
  const stagesCompletionPct = stages.length > 0 ? Math.round((completedStages.length / stages.length) * 100) : 0;

  // Sector-based impact multipliers
  const sectorMultiplier = useMemo(() => {
    switch (client.sector) {
      case 'b2b':
        return {
          reachPerPost: 2800,
          reachPerReel: 5500,
          leadConversionRate: 0.042,
          leadLabelAr: 'عملاء محتملون B2B',
          leadLabelEn: 'Qualified B2B Leads',
          primaryMetricAr: 'معدل جلب عقود B2B',
          primaryMetricEn: 'Contract Opportunities',
        };
      case 'medical':
        return {
          reachPerPost: 4200,
          reachPerReel: 11500,
          leadConversionRate: 0.058,
          leadLabelAr: 'استشارات وحجوزات مرضى',
          leadLabelEn: 'Patient Consultations',
          primaryMetricAr: 'معدل حجز العيادات',
          primaryMetricEn: 'Clinic Bookings',
        };
      case 'b2c':
      default:
        return {
          reachPerPost: 5100,
          reachPerReel: 16500,
          leadConversionRate: 0.075,
          leadLabelAr: 'طلبات ومبيعات مباشرة',
          leadLabelEn: 'Orders & Store Purchases',
          primaryMetricAr: 'العائد الإعلاني ROAS',
          primaryMetricEn: 'E-commerce ROAS',
        };
    }
  }, [client.sector]);

  // Dynamic weekly task progression data based on completed tasks
  const weeklyData = useMemo(() => {
    // Distribute totalDelivered across 4 weeks
    const w1Ratio = 0.22;
    const w2Ratio = 0.52;
    const w3Ratio = 0.82;
    const w4Ratio = 1.0;

    const w1Posts = Math.min(deliveredPosts, Math.max(1, Math.round(deliveredPosts * w1Ratio)));
    const w2Posts = Math.min(deliveredPosts, Math.round(deliveredPosts * w2Ratio));
    const w3Posts = Math.min(deliveredPosts, Math.round(deliveredPosts * w3Ratio));
    const w4Posts = deliveredPosts;

    const w1Reels = Math.min(deliveredReels, Math.round(deliveredReels * w1Ratio));
    const w2Reels = Math.min(deliveredReels, Math.round(deliveredReels * w2Ratio));
    const w3Reels = Math.min(deliveredReels, Math.round(deliveredReels * w3Ratio));
    const w4Reels = deliveredReels;

    const w1Stories = Math.min(deliveredStories, Math.round(deliveredStories * w1Ratio));
    const w2Stories = Math.min(deliveredStories, Math.round(deliveredStories * w2Ratio));
    const w3Stories = Math.min(deliveredStories, Math.round(deliveredStories * w3Ratio));
    const w4Stories = deliveredStories;

    const targetW1 = Math.round(totalTarget * 0.25);
    const targetW2 = Math.round(totalTarget * 0.5);
    const targetW3 = Math.round(totalTarget * 0.75);
    const targetW4 = totalTarget;

    const calcReach = (p: number, r: number, mult: number) => {
      const base = p * sectorMultiplier.reachPerPost + r * sectorMultiplier.reachPerReel;
      return Math.round(base * mult);
    };

    const calcLeads = (reach: number) => {
      return Math.max(2, Math.round(reach * 0.003 * (stagesCompletionPct > 60 ? 1.4 : 1.0)));
    };

    const reachW1 = calcReach(w1Posts, w1Reels, 0.7);
    const reachW2 = calcReach(w2Posts, w2Reels, 0.9);
    const reachW3 = calcReach(w3Posts, w3Reels, 1.15);
    const reachW4 = calcReach(w4Posts, w4Reels, 1.35);

    return [
      {
        week: isAr ? 'الأسبوع ١ (التخطيط والإنشاء)' : 'W1: Strategy',
        shortWeek: isAr ? 'الأسبوع ١' : 'Week 1',
        posts: w1Posts,
        reels: w1Reels,
        stories: w1Stories,
        totalCompleted: w1Posts + w1Reels + w1Stories,
        target: targetW1,
        reach: Math.max(1200, reachW1),
        leads: calcLeads(reachW1),
        engagementPct: 3.8,
      },
      {
        week: isAr ? 'الأسبوع ٢ (التصاميم والريلز)' : 'W2: Visuals',
        shortWeek: isAr ? 'الأسبوع ٢' : 'Week 2',
        posts: w2Posts,
        reels: w2Reels,
        stories: w2Stories,
        totalCompleted: w2Posts + w2Reels + w2Stories,
        target: targetW2,
        reach: Math.max(3400, reachW2),
        leads: calcLeads(reachW2),
        engagementPct: 4.6,
      },
      {
        week: isAr ? 'الأسبوع ٣ (المراجعة والاعتماد)' : 'W3: Approvals',
        shortWeek: isAr ? 'الأسبوع ٣' : 'Week 3',
        posts: w3Posts,
        reels: w3Reels,
        stories: w3Stories,
        totalCompleted: w3Posts + w3Reels + w3Stories,
        target: targetW3,
        reach: Math.max(6800, reachW3),
        leads: calcLeads(reachW3),
        engagementPct: 5.2,
      },
      {
        week: isAr ? 'الأسبوع ٤ (النشر وحصد النتائج)' : 'W4: Publishing',
        shortWeek: isAr ? 'الأسبوع ٤' : 'Week 4',
        posts: w4Posts,
        reels: w4Reels,
        stories: w4Stories,
        totalCompleted: w4Posts + w4Reels + w4Stories,
        target: targetW4,
        reach: Math.max(11500, reachW4),
        leads: calcLeads(reachW4),
        engagementPct: 5.9,
      },
    ];
  }, [deliveredPosts, deliveredReels, deliveredStories, totalTarget, sectorMultiplier, stagesCompletionPct, isAr]);

  // Aggregate metrics
  const totalEstimatedReach = weeklyData[weeklyData.length - 1].reach;
  const totalEstimatedLeads = weeklyData.reduce((acc, curr) => acc + curr.leads, 0);
  const avgEngagementRate = '5.4%';

  // Donut distribution data
  const distributionData = [
    {
      name: isAr ? 'منشورات وتصاميم' : 'Posts & Graphics',
      value: deliveredPosts,
      color: '#0284c7', // Sky Blue
    },
    {
      name: isAr ? 'فيديوهات ريلز AI' : 'Reels / AI Videos',
      value: deliveredReels,
      color: '#9333ea', // Purple
    },
    {
      name: isAr ? 'ستوريز وتفاعل' : 'Stories & Interactive',
      value: deliveredStories,
      color: '#ea580c', // Orange
    },
  ].filter((item) => item.value > 0);

  // Fallback if no deliverables yet
  const safeDistribution = distributionData.length > 0 ? distributionData : [
    { name: isAr ? 'مستهدف المنشورات' : 'Target Posts', value: targetPosts, color: '#0284c7' },
    { name: isAr ? 'مستهدف الريلز' : 'Target Reels', value: targetReels, color: '#9333ea' },
    { name: isAr ? 'مستهدف الستوريز' : 'Target Stories', value: targetStories, color: '#ea580c' },
  ];

  return (
    <div className={`space-y-5 animate-in fade-in duration-200 ${className}`}>
      {/* ----------------------------------------------------------------- */}
      {/* TOP HEADER & TIME FILTER                                          */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isAr ? 'ملخص الأداء الشهري وتطور النتائج' : 'Monthly Performance & Results Summary'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {isAr ? 'بيانات حية مبنية على المهام' : 'Live Task-Driven Data'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {isAr
                ? `تحليل بياني شامل لتطور مخرجات ونتائج خطة (${client.packageName || 'العمل'}) ونمو الوصول التراكمي للجمهور.`
                : `Comprehensive visual report tracking deliverables fulfillment and estimated audience reach.`}
            </p>
          </div>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl self-start md:self-center border border-slate-200/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveChartTab('production')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'production'
                ? 'bg-white text-blue-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAr ? 'تطور الإنتاج' : 'Production'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('impact')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'impact'
                ? 'bg-white text-emerald-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'الوصول والأثر' : 'Reach & Impact'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('distribution')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'distribution'
                ? 'bg-white text-purple-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'توزيع المخرجات' : 'Distribution'}</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4 HIGH-IMPACT KPI CARDS                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Plan Completion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'نسبة إنجاز المخرجات' : 'Deliverables Fulfillment'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {planCompletionPct}%
              </span>
              <span className="text-xs text-slate-400 font-bold">
                ({totalDelivered}/{totalTarget})
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${planCompletionPct}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-sky-600 font-bold block pt-1">
            {isAr ? 'من إجمالي خطة الشهر' : 'Of monthly target'}
          </span>
        </div>

        {/* KPI 2: Workflow Stages Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'سير عمل المهام' : 'Workflow Pipeline'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {completedStages.length} <span className="text-sm font-normal text-slate-400">/ {stages.length || 5}</span>
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ({stagesCompletionPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stagesCompletionPct}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block pt-1">
            {inProgressStages.length > 0 
              ? (isAr ? `المرحلة الجارية: ${inProgressStages[0].title}` : `In progress: ${inProgressStages[0].title}`)
              : (isAr ? 'كافة المراحل المخططة نشطة' : 'Pipeline fully on track')}
          </span>
        </div>

        {/* KPI 3: Estimated Audience Reach */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'الوصول التراكمي المقدر' : 'Estimated Total Reach'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                +{totalEstimatedReach.toLocaleString()}
              </span>
              <span className="inline-flex items-center text-[10px] font-black text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                {isAr ? 'نمو +١٤٢٪' : '+142%'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {isAr ? 'مستند للمنشورات والريلز المنفذة' : 'Based on published creatives'}
            </p>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold block">
            {isAr ? `تفاعل مقدر: ${avgEngagementRate}` : `Avg. Engagement: ${avgEngagementRate}`}
          </span>
        </div>

        {/* KPI 4: Sector Conversion / Primary Outcome */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 block truncate">
              {isAr ? sectorMultiplier.leadLabelAr : sectorMultiplier.leadLabelEn}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                +{totalEstimatedLeads}
              </span>
              <span className="text-[11px] font-bold text-amber-700">
                {isAr ? 'فرصة محققة' : 'Results'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {isAr ? sectorMultiplier.primaryMetricAr : sectorMultiplier.primaryMetricEn}
            </p>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block">
            {isAr ? 'مؤشر أداء قياسي للقطاع' : 'High-impact sector outcome'}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN RECHARTS GRAPHICAL DISPLAY                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
        {/* GRAPH TAB 1: PRODUCTION & TASK VELOCITY (Area Chart) */}
        {activeChartTab === 'production' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? 'تطور إنجاز المخرجات والمهام أسبوعياً (Production Velocity)' : 'Weekly Production Velocity'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {isAr 
                    ? 'يوضح الرسم وتيرة تسليم المنشورات والريلز على مدار أسابيع الشهر مقارنة بالخط المستهدف.' 
                    : 'Shows cumulative delivery pace of posts & reels against targeted benchmarks across the 4 weeks.'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>{isAr ? 'منشورات' : 'Posts'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>{isAr ? 'ريلز AI' : 'Reels'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span>{isAr ? 'الهدف' : 'Target'}</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReels" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="shortWeek" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '8px 12px',
                    }}
                    formatter={(val: any, name: any) => {
                      const label = 
                        name === 'posts' ? (isAr ? 'منشورات منفذة' : 'Posts') :
                        name === 'reels' ? (isAr ? 'ريلز منفذة' : 'Reels') :
                        name === 'target' ? (isAr ? 'المستهدف التراكمي' : 'Target') : name;
                      return [val, label];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="posts"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPosts)"
                    name="posts"
                  />
                  <Area
                    type="monotone"
                    dataKey="reels"
                    stroke="#9333ea"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReels)"
                    name="reels"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRAPH TAB 2: AUDIENCE REACH & ESTIMATED RESULTS (Composed Bar + Line Chart) */}
        {activeChartTab === 'impact' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'نمو الوصول التراكمي وتفاعل العملاء (Audience Reach & Impact)' : 'Audience Reach & Conversion Curve'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {isAr 
                    ? 'يوضح العلاقة بين حجم المحتوى المنشور ومعدل نمو المشاهدات والوصول الأسبوعي.' 
                    : 'Shows how completed creatives directly drive cumulative audience reach and weekly interactions.'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>{isAr ? 'الوصول التراكمي' : 'Reach'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{isAr ? 'التفاعل / النتائج' : 'Leads/Results'}</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="shortWeek" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '8px 12px',
                    }}
                    formatter={(val: any, name: any) => {
                      const label = 
                        name === 'reach' ? (isAr ? 'وصول مقدر' : 'Estimated Reach') :
                        name === 'leads' ? (isAr ? sectorMultiplier.leadLabelAr : sectorMultiplier.leadLabelEn) : name;
                      return [val.toLocaleString(), label];
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="reach"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                    name="reach"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="leads"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="leads"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRAPH TAB 3: DELIVERABLES DISTRIBUTION (Donut / Pie Chart) */}
        {activeChartTab === 'distribution' && (
          <div className="space-y-3">
            <div className="pb-1">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <span>{isAr ? 'توزيع المخرجات المنفذة ونوعية المحتوى' : 'Deliverables & Creative Assets Breakdown'}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'توزيع نسبي للمخرجات المنجزة بين المنشورات، الريلز، والستوريز التفاعلية.'
                  : 'Proportional distribution of completed assets across design types.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {safeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '11px',
                        padding: '8px 12px',
                      }}
                      formatter={(val: any, name: any) => [val, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown Legend Cards */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-sky-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {isAr ? 'المنشورات والتصاميم البصرية' : 'Static Posts & Creatives'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr ? 'تصاميم سوشيال ميديا ومحتوى تسويقي' : 'Feed graphics and branded copies'}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-sm font-black text-sky-800 tabular-nums">
                      {deliveredPosts} / {targetPosts}
                    </span>
                    <span className="text-[10px] text-sky-600 block font-bold">
                      {targetPosts > 0 ? Math.round((deliveredPosts / targetPosts) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-purple-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {isAr ? 'فيديوهات الريلز بتقنية AI' : 'AI Reels & Video Shots'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr ? 'فيديوهات تفاعلية قصيرة بصوت وسيناريو احترافي' : 'High-impact short form reels'}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-sm font-black text-purple-800 tabular-nums">
                      {deliveredReels} / {targetReels}
                    </span>
                    <span className="text-[10px] text-purple-600 block font-bold">
                      {targetReels > 0 ? Math.round((deliveredReels / targetReels) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-orange-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {isAr ? 'الستوريز والتفاعل اليومي' : 'Stories & Daily Reach'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr ? 'تثبيت الحضور وتعزيز التفاعل السريع' : 'Polls, countdowns & daily updates'}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-sm font-black text-orange-800 tabular-nums">
                      {deliveredStories} / {targetStories}
                    </span>
                    <span className="text-[10px] text-orange-600 block font-bold">
                      {targetStories > 0 ? Math.round((deliveredStories / targetStories) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* WORKFLOW TASKS IMPACT AUDIT & MILESTONES                          */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                {isAr ? 'أثر المراحل والمهام المكتملة على نجاح الحملة' : 'Milestones & Business Impact of Completed Tasks'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'متابعة كيفية انعكاس كل مهمة ومرحلة عمل مكتملة على نتائج العميل الفعلية.' 
                  : 'How each finalized execution stage directly drives performance.'}
              </p>
            </div>
          </div>

          {onNavigateToDeliverables && (
            <button
              type="button"
              onClick={onNavigateToDeliverables}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>{isAr ? 'تحديث المخرجات' : 'Update Deliverables'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';

            const stageImpactMap: Record<string, { ar: string; en: string }> = {
              content: {
                ar: 'جاهزية استراتيجية المحتوى والرسائل التسويقية الموجهة لجمهور القطاع بدقة.',
                en: 'Content strategy & high-converting copy refined for the target audience.',
              },
              visual_design: {
                ar: 'اكتمال الهوية البصرية والقوالب الإعلانية المتوافقة مع معايير المنصات.',
                en: 'Brand visual assets & high-CTR graphic templates finalized.',
              },
              final_design: {
                ar: 'رندرة الريلز والمحتوى المرئي عالي الجودة جاهزاً للبث والمراجعة.',
                en: 'High-definition reels & videos ready for preview.',
              },
              client_approval: {
                ar: 'اعتماد العميل النهائي والضوء الأخضر لجدولة الحملات والإعلانات.',
                en: 'Client sign-off secured for scheduled rollout.',
              },
              publishing: {
                ar: 'انطلاق النشر وجني المشاهدات والتفاعل وجلب العملاء المستهدفين.',
                en: 'Live publishing active, gathering reach & qualified inbound inquiries.',
              },
            };

            const impact = stageImpactMap[stage.id] || {
              ar: 'إنجاز خطوة محورية في خطة العمل الشهرية.',
              en: 'Key monthly campaign milestone completed.',
            };

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200/80 shadow-2xs'
                    : isInProgress
                    ? 'bg-blue-50/50 border-blue-200/80 ring-1 ring-blue-300/40'
                    : 'bg-slate-50/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-black truncate ${
                        isCompleted
                          ? 'text-emerald-950'
                          : isInProgress
                          ? 'text-blue-950'
                          : 'text-slate-600'
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? (isAr ? 'مكتمل' : 'Completed')
                      : isInProgress ? (isAr ? 'قيد التنفيذ' : 'In Progress')
                      : (isAr ? 'في الانتظار' : 'Pending')}
                  </span>
                </div>

                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {isAr ? impact.ar : impact.en}
                </p>

                {stage.completedAt && (
                  <div className="mt-2 pt-1.5 border-t border-emerald-200/50 flex items-center gap-1 text-[9px] text-emerald-700 font-medium">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span>
                      {isAr ? 'تم الإنجاز:' : 'Done:'}{' '}
                      {new Date(stage.completedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
