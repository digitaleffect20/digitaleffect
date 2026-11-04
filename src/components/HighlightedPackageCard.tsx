import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { ServicePackage } from '../types';
import { 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  ShieldCheck,
  Film,
  Layers,
  Calendar,
  Clock,
  Sparkle
} from 'lucide-react';

interface Props {
  pkg: ServicePackage;
}

export const HighlightedPackageCard: React.FC<Props> = ({ pkg }) => {
  const { language, t, setSelectedPackageForInquiry, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  // For packages that support quarterly pricing (e.g., Medical packages)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  const name = isAr ? pkg.name : pkg.nameEn;
  const badge = isAr ? pkg.badge : (pkg.badgeEn || pkg.badge);
  const tagline = isAr ? pkg.tagline : pkg.taglineEn;
  const idealFor = isAr ? pkg.idealFor : pkg.idealForEn;
  const offerNote = isAr ? pkg.offerNote : (pkg.offerNoteEn || pkg.offerNote);
  const features = isAr ? pkg.features : (pkg.featuresEn && pkg.featuresEn.length ? pkg.featuresEn : pkg.features);
  const currency = isAr ? pkg.currency : pkg.currencyEn;

  const isPopular = !!pkg.isPopular;
  const hasOffer = !!pkg.hasOffer;
  const hasQuarterly = !!pkg.quarterlyPrice;

  // Determine current active display price
  const displayPrice = hasQuarterly && billingCycle === 'quarterly' 
    ? pkg.quarterlyPrice! 
    : pkg.price;

  const displayPeriod = hasQuarterly && billingCycle === 'quarterly'
    ? (isAr ? '/ ٣ أشهر (ربع سنوي)' : '/ quarter')
    : (isAr ? pkg.period : pkg.periodEn);

  // Calculate quarterly savings if applicable
  const quarterlySavings = hasQuarterly && pkg.quarterlyPrice
    ? (pkg.price * 3) - pkg.quarterlyPrice
    : 0;

  const handleInquire = () => {
    // Pass configured package with current chosen cycle in name/details
    const modifiedPkg: ServicePackage = {
      ...pkg,
      price: displayPrice,
      period: displayPeriod,
      periodEn: displayPeriod,
      name: billingCycle === 'quarterly' && hasQuarterly ? `${name} (ربع سنوي - Quarterly)` : name,
    };
    setSelectedPackageForInquiry(modifiedPkg);
    setIsConsultationOpen(true);
  };

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 text-start ${
        isPopular
          ? 'bg-gradient-to-b from-sky-50/95 via-white to-white border-2 border-sky-500 shadow-2xl shadow-sky-500/15 ring-4 ring-sky-500/10 scale-[1.02] z-10'
          : 'bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300'
      }`}
    >
      {/* Popular floating badge on top */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md shadow-sky-600/30 flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
          <span>{t.common.mostPopular}</span>
        </div>
      )}

      {/* Badges strip */}
      <div className="flex items-center justify-between gap-2 mb-3 pt-1 flex-wrap">
        {badge ? (
          <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${isPopular ? 'text-sky-800 bg-sky-100/90' : 'text-slate-700 bg-slate-100'}`}>
            {badge}
          </span>
        ) : <div />}

        {hasOffer && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80 shadow-xs">
              <Tag className="w-3 h-3 text-rose-600" />
              <span>{offerNote || t.common.specialOffer}</span>
            </span>
            {pkg.offerExpiryDate && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>
                  {(() => {
                    const diffDays = Math.ceil((new Date(pkg.offerExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 0) return isAr ? 'ينتهي اليوم' : 'Ends today';
                    return isAr ? `متبقي ${diffDays} يوم` : `${diffDays}d left`;
                  })()}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Title & Tagline */}
      <div className="space-y-1.5 mb-4">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[34px]">
          {tagline}
        </p>
      </div>

      {/* Official Deliverables Metrics Matrix Strip (Direct from PDF sheet) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
        {pkg.postsCount !== undefined && (
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
            <div className="text-lg font-black text-sky-600 tabular-nums">
              {pkg.postsCount}
            </div>
            <div className="text-[10px] font-bold text-slate-600">
              {pkg.sector === 'medical' ? (isAr ? 'منشور / كاروسيل' : 'Posts/Carousels') : (isAr ? 'منشور شهرياً' : 'Posts / mo')}
            </div>
          </div>
        )}

        {pkg.reelsCount !== undefined && (
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
            <div className="text-lg font-black text-purple-600 tabular-nums">
              {pkg.reelsCount}
            </div>
            <div className="text-[10px] font-bold text-slate-600">
              {pkg.sector === 'b2c' ? (isAr ? 'ريلز AI' : 'AI Reels') : (isAr ? 'ريلز طبي' : 'Reels')}
            </div>
          </div>
        )}

        {pkg.storiesCount !== undefined && (
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
            <div className="text-lg font-black text-amber-600 tabular-nums">
              {pkg.storiesCount}
            </div>
            <div className="text-[10px] font-bold text-slate-600">
              {isAr ? 'ستوريز' : 'Stories'}
            </div>
          </div>
        )}

        {pkg.frequency && (
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
            <div className="text-xs font-black text-sky-600 flex items-center justify-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>{isAr ? 'أسبوعياً' : 'Weekly'}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-600 mt-0.5">
              {isAr ? pkg.frequency : pkg.frequencyEn}
            </div>
          </div>
        )}

        {pkg.hasMonthlyPlan && (
          <div className="bg-white p-2 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-2">
            <div className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{isAr ? 'خطة شهرية متضمنة' : 'Monthly Plan: Included'}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {isAr ? 'خطة استراتيجية معتمدة' : 'Full Strategy Blueprint'}
            </div>
          </div>
        )}
      </div>

      {/* Billing Switch for Packages that have Quarterly pricing (Medical) */}
      {hasQuarterly && (
        <div className="mb-4 p-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isAr ? 'شهرياً (Monthly)' : 'Monthly'}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('quarterly')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center relative ${
              billingCycle === 'quarterly'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <span>{isAr ? 'ربع سنوي (وفر أكثر)' : 'Quarterly (Save)'}</span>
          </button>
        </div>
      )}

      {/* Price Block */}
      <div className="py-3.5 border-y border-slate-100 mb-5 bg-slate-50/70 p-4 rounded-2xl">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
            {displayPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {currency} {displayPeriod}
          </span>

          {billingCycle === 'quarterly' && quarterlySavings > 0 && (
            <div className="ms-auto">
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <Sparkle className="w-3 h-3" />
                <span>{isAr ? `توفير ${quarterlySavings.toLocaleString('ar-EG')} ج.م` : `Save ${quarterlySavings.toLocaleString('en-US')} EGP`}</span>
              </span>
            </div>
          )}

          {billingCycle === 'monthly' && hasOffer && pkg.originalPrice && pkg.originalPrice > pkg.price && (
            <div className="flex items-center gap-1.5 ms-auto">
              <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                {pkg.originalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {currency}
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {t.common.save} {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {hasQuarterly && billingCycle === 'monthly' && (
          <div className="text-[11px] text-slate-500 mt-2">
            <span className="font-semibold text-sky-700">
              {isAr ? `أو ${pkg.quarterlyPrice?.toLocaleString('ar-EG')} ج.م ربع سنوياً` : `or ${pkg.quarterlyPrice?.toLocaleString('en-US')} EGP / quarter`}
            </span>{' '}
            ({isAr ? `وفر ${quarterlySavings.toLocaleString('ar-EG')} ج.م` : `save ${quarterlySavings.toLocaleString('en-US')} EGP`})
          </div>
        )}

        {idealFor && (
          <div className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60 leading-snug">
            <span className="font-bold text-slate-700">{isAr ? 'مثالية لـ: ' : 'Ideal for: '}</span>
            {idealFor}
          </div>
        )}
      </div>

      {/* Included Features List */}
      <div className="space-y-3 flex-1 mb-6">
        <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>{isAr ? 'مواصفات ومخرجات الباقة:' : 'Package Deliverables & Inclusions:'}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
              <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100">
        <button
          onClick={handleInquire}
          className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
            isPopular
              ? 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-sky-600/25 hover:shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white'
          }`}
        >
          <span>{t.common.bookThisPackage}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
