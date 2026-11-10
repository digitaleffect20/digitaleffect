import React, { useState, useMemo } from 'react';
import { SectorType, ServicePackage } from '../types';
import { 
  calculateCustomPackageCost, 
  buildServicePackageFromCustomCalculation,
  CustomPackageCalculation 
} from '../utils/pricingCalculator';
import { 
  Sliders, 
  Sparkles, 
  Layers, 
  Film, 
  Image as ImageIcon, 
  MessageSquare, 
  Check, 
  Plus, 
  Copy, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface CustomPackageCalculatorProps {
  mode: 'admin' | 'client';
  isAr: boolean;
  initialSector?: 'b2b' | 'b2c' | 'medical';
  initialPosts?: number;
  initialReels?: number;
  initialStories?: number;
  basePackageName?: string;
  onSaveAsPackage?: (pkg: Omit<ServicePackage, 'id'>) => void;
  onSelectForInquiry?: (calc: CustomPackageCalculation) => void;
  showNotice?: (msg: string) => void;
}

export const CustomPackageCalculator: React.FC<CustomPackageCalculatorProps> = ({
  mode,
  isAr,
  initialSector = 'b2c',
  initialPosts,
  initialReels,
  initialStories,
  basePackageName,
  onSaveAsPackage,
  onSelectForInquiry,
  showNotice
}) => {
  const [sector, setSector] = useState<'b2b' | 'b2c' | 'medical'>(initialSector);
  const [postsCount, setPostsCount] = useState<number>(
    initialPosts !== undefined ? initialPosts : (sector === 'b2b' ? 4 : sector === 'medical' ? 8 : 12)
  );
  const [reelsCount, setReelsCount] = useState<number>(
    initialReels !== undefined ? initialReels : (sector === 'b2b' ? 0 : sector === 'medical' ? 4 : 2)
  );
  const [storiesCount, setStoriesCount] = useState<number>(
    initialStories !== undefined ? initialStories : (sector === 'b2b' ? 0 : 2)
  );
  const [period, setPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Auto-tune defaults when changing sector
  const handleSectorChange = (newSector: 'b2b' | 'b2c' | 'medical') => {
    setSector(newSector);
    if (newSector === 'b2b') {
      setPostsCount(4);
      setReelsCount(0);
      setStoriesCount(0);
    } else if (newSector === 'medical') {
      setPostsCount(8);
      setReelsCount(4);
      setStoriesCount(0);
    } else {
      setPostsCount(12);
      setReelsCount(2);
      setStoriesCount(2);
    }
  };

  // Live calculation
  const calculation = useMemo(() => {
    return calculateCustomPackageCost({
      sector,
      postsCount,
      reelsCount,
      storiesCount,
      period,
      includeMonthlyPlan: true,
    });
  }, [sector, postsCount, reelsCount, storiesCount, period]);

  // Copy WhatsApp Quote (for Admin)
  const handleCopyWhatsAppQuote = () => {
    const textAr = `*عرض باقة مخصصة — ديجيتال إفكت للحلول الرقمية* 🚀
القطاع: ${sector === 'b2b' ? 'الشركات والمصانع (B2B)' : sector === 'medical' ? 'القطاع الطبي والرعاية الصحية' : 'المتاجر والتجزئة (B2C)'}

📋 *المخرجات الشهرية المعتمدة:*
• عدد المنشورات / التصاميم: ${calculation.postsCount} منشور شهرياً
• عدد مقاطع الريلز (AI Reels): ${calculation.reelsCount} ريلز شهرياً
• عدد الستوريز التفاعلية: ${calculation.storiesCount} ستوري شهرياً
• خطة محتوى شهرية استراتيجية معتمدة
• إشراف ومتابعة أسبوعية + تقرير تحليلي شهري مفصل

💰 *قيمة الاشتراك:*
• الاشتراك الشهري: ${calculation.monthlyPrice.toLocaleString('ar-EG')} ج.م / شهرياً
${calculation.quarterlySavings > 0 ? `• الاشتراك الربع سنوي: ${calculation.quarterlyPrice.toLocaleString('ar-EG')} ج.م / ٣ أشهر (توفير ${calculation.quarterlySavings.toLocaleString('ar-EG')} ج.م)` : ''}

للحجز وتأكيد بدء الخطة معنا فوراً، يسعدنا تواصلكم عبر الواتساب: 01505000349`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textAr);
      setCopiedQuote(true);
      if (showNotice) showNotice(isAr ? 'تم نسخ عرض السعر بصيغة الواتساب بنجاح!' : 'Quote copied to clipboard!');
      setTimeout(() => setCopiedQuote(false), 3000);
    }
  };

  // Save as real package (for Admin)
  const handleSaveAsOfficialPackage = () => {
    if (!onSaveAsPackage) return;
    const newPkg = buildServicePackageFromCustomCalculation(calculation);
    onSaveAsPackage(newPkg);
    if (showNotice) {
      showNotice(isAr ? `🎉 تم حفظ الباقة المخصصة وإضافتها كباقة رسمية في قائمة الباقات بنجاح!` : 'Custom package added to official packages!');
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-6 text-start">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{isAr ? 'حاسبة وتخصيص الباقات المخصصة' : 'Custom Package Builder'}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {isAr ? 'تسعير رسمي وفق المواصفات' : 'Calibrated Rate Engine'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {isAr ? 'صمم باقتك وحساب التكلفة التقديرية بالذكاء والشفافية' : 'Build Custom Scope & Live Cost Calculator'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            {isAr 
              ? 'اختر القطاع، عدد البوستات، مقاطع الريلز، والستوريز ليتم احتساب القيمة والاستفادة من عروض الخصم الربع سنوي تلقائياً.' 
              : 'Select your sector and content mix to instantly calculate customized monthly and quarterly retainer pricing.'}
          </p>
        </div>

        {/* Sector Quick Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-center">
          {(['b2c', 'b2b', 'medical'] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => handleSectorChange(sec)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sector === sec
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec === 'b2c' ? (isAr ? 'قطاع B2C' : 'B2C') : sec === 'b2b' ? (isAr ? 'قطاع B2B' : 'B2B') : (isAr ? 'طبي Medical' : 'Medical')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls vs Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scope Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Posts Slider / Stepper */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'عدد المنشورات / التصاميم شهرياً (Posts):' : 'Monthly Posts & Carousels:'}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-sky-700 font-mono px-2.5 py-0.5 rounded-lg bg-white border border-sky-200">
                  {postsCount} {isAr ? 'منشور' : 'Posts'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={sector === 'b2b' ? 2 : 4}
              max={sector === 'b2b' ? 16 : 30}
              step={1}
              value={postsCount}
              onChange={(e) => setPostsCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>{sector === 'b2b' ? '2 (أدنى)' : '4 (بداية)'}</span>
              <span>{sector === 'b2b' ? '8 (مكثف)' : '16 (قياسي)'}</span>
              <span>{sector === 'b2b' ? '16 (توسع)' : '30 (هيمنة)'}</span>
            </div>
          </div>

          {/* 2. Reels Slider / Stepper */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-purple-600" />
                <span>{isAr ? 'عدد مقاطع الريلز والفيديو (AI Reels):' : 'AI Reels & Video Content:'}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-purple-700 font-mono px-2.5 py-0.5 rounded-lg bg-white border border-purple-200">
                  {reelsCount} {isAr ? 'ريلز' : 'Reels'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={sector === 'b2b' ? 8 : 16}
              step={1}
              value={reelsCount}
              onChange={(e) => setReelsCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>0 (بدون فيديو)</span>
              <span>4 (معدل نمو)</span>
              <span>{sector === 'b2b' ? '8 (وثائقيات)' : '16 (كثافة قصوى)'}</span>
            </div>
          </div>

          {/* 3. Stories Stepper (for B2C / Medical) */}
          {sector !== 'b2b' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'عدد الستوريز التفاعلية (Stories):' : 'Interactive Stories:'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-amber-700 font-mono px-2.5 py-0.5 rounded-lg bg-white border border-amber-200">
                    {storiesCount} {isAr ? 'ستوري' : 'Stories'}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={20}
                step={2}
                value={storiesCount}
                onChange={(e) => setStoriesCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span>0</span>
                <span>4 (أسبوعي)</span>
                <span>20 (تفاعل يومي)</span>
              </div>
            </div>
          )}

          {/* 4. Retainer Duration Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-xs font-black text-slate-800 block">
                {isAr ? 'فترة الاشتراك والتعاقد:' : 'Contract Duration:'}
              </span>
              <span className="text-[11px] text-indigo-700 font-semibold">
                {isAr ? 'التعاقد الربع سنوي يوفر حتى ٢٠٪ من إجمالي التكلفة' : 'Quarterly retainer includes up to 20% savings'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200/60 shadow-xs">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  period === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'شهرياً' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('quarterly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  period === 'quarterly' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Percent className="w-3 h-3 text-amber-300" />
                <span>{isAr ? 'ربع سنوي (٣ أشهر)' : 'Quarterly'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Price & Deliverables Summary (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-5">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {calculation.recommendedBadge}
            </span>
            <h4 className="text-base font-black text-white pt-1">
              {isAr ? calculation.recommendedName : calculation.recommendedNameEn}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr ? calculation.tagline : calculation.taglineEn}
            </p>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                {period === 'quarterly' 
                  ? (isAr ? 'قيمة الاشتراك الربع سنوي:' : 'Quarterly Retainer:') 
                  : (isAr ? 'قيمة الاشتراك الشهري:' : 'Monthly Retainer:')}
              </span>
              <div className="text-end">
                <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                  {period === 'quarterly'
                    ? calculation.quarterlyPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')
                    : calculation.monthlyPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')
                  } <span className="text-sm font-bold text-white">ج.م</span>
                </div>
                {period === 'monthly' && calculation.originalPrice > calculation.monthlyPrice && (
                  <div className="text-xs text-slate-400 line-through tabular-nums">
                    {calculation.originalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} ج.م
                  </div>
                )}
              </div>
            </div>

            {/* Quarterly Savings Badge */}
            {period === 'quarterly' && calculation.quarterlySavings > 0 && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'خصم التعاقد الربع سنوي:' : 'Quarterly Retainer Savings:'}</span>
                </span>
                <span className="tabular-nums font-mono text-emerald-300">
                  +{calculation.quarterlySavings.toLocaleString(isAr ? 'ar-EG' : 'en-US')} ج.م توفير
                </span>
              </div>
            )}
          </div>

          {/* Scope Deliverables Summary */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              {isAr ? 'المواصفات المعتمدة في هذه الباقة:' : 'Deliverables Matrix:'}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{postsCount} {isAr ? 'منشورات وتصاميم إعلانية احترافية' : 'High-impact posts'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{reelsCount} {isAr ? 'مقاطع ريلز وفيديو مصممة للانتشار' : 'AI Reels and video assets'}</span>
              </li>
              {storiesCount > 0 && (
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{storiesCount} {isAr ? 'ستوري تفاعلية دورية' : 'Interactive stories'}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? 'خطة استراتيجية شهرية معتمدة + تقرير أداء' : 'Monthly strategy plan & audit report'}</span>
              </li>
            </ul>
          </div>

          {/* Admin / Client Actions */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            {mode === 'admin' ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveAsOfficialPackage}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? '🚀 اعتماد كباقة رسمية في الموقع (+ إضافة للقائمة)' : 'Save as Official Website Package'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyWhatsAppQuote}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors"
                >
                  {copiedQuote ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{isAr ? 'تم نسخ العرض بنجاح!' : 'Quote Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>{isAr ? '📋 نسخ عرض السعر لإرساله للعميل على الواتساب' : 'Copy Quote for WhatsApp'}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onSelectForInquiry && onSelectForInquiry(calculation)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAr ? '✨ طلب وتأكيد هذه الباقة المخصصة الآن ↗' : 'Request This Custom Package Now'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
