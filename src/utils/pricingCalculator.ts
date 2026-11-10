import { SectorType, ServicePackage } from '../types';

export interface CustomPackageInput {
  sector: 'b2b' | 'b2c' | 'medical';
  postsCount: number;
  reelsCount: number;
  storiesCount: number;
  period?: 'monthly' | 'quarterly';
  includeMonthlyPlan?: boolean;
}

export interface CustomPackageCalculation {
  sector: 'b2b' | 'b2c' | 'medical';
  postsCount: number;
  reelsCount: number;
  storiesCount: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  originalPrice: number;
  quarterlySavings: number;
  period: 'monthly' | 'quarterly';
  breakdown: {
    baseManagement: number;
    postsCost: number;
    reelsCost: number;
    storiesCost: number;
    planCost: number;
    subtotal: number;
    bundleDiscount: number;
    finalMonthly: number;
  };
  recommendedName: string;
  recommendedNameEn: string;
  recommendedBadge: string;
  recommendedBadgeEn: string;
  tagline: string;
  taglineEn: string;
  features: string[];
  featuresEn: string[];
}

/**
 * Unit pricing parameters calibrated from Digital Effect official packages sheet:
 * B2C: Active (8P, 1R) = 12.5K | Interact (12P, 2R) = 15K | Engage (16P, 4R, 2S) = 20K | Advance (20P, 6R, 2S) = 25K
 * B2B: Active (4P, Plan) = 4K (1 post/week)
 * Medical: Presence (6P, 4R) = 12.5K/mo (33.75K/qtr) | Growth (8P, 8R) = 19.5K/mo (49.75K/qtr) | Authority (12P, 12R) = 29.5K/mo (70.8K/qtr)
 */
export const PRICING_RATES = {
  b2c: {
    baseManagement: 4000,
    costPerPost: 650,
    costPerReel: 1300,
    costPerStory: 200,
    minPrice: 10000,
  },
  b2b: {
    baseManagement: 600,
    costPerPost: 850,
    costPerReel: 1800,
    costPerStory: 150,
    minPrice: 4000,
  },
  medical: {
    baseManagement: 2500,
    costPerPost: 850,
    costPerReel: 1450,
    costPerStory: 200,
    minPrice: 12500,
  },
};

export const DEFAULT_CUSTOM_PACKAGE_RATES = PRICING_RATES;
export type CustomPackagePricingRates = typeof PRICING_RATES;

export function calculateCustomPackageCost(input: CustomPackageInput): CustomPackageCalculation {
  const { sector, postsCount, reelsCount, storiesCount, period = 'monthly', includeMonthlyPlan = true } = input;
  const rates = PRICING_RATES[sector] || PRICING_RATES.b2c;

  const postsCost = Math.max(0, postsCount) * rates.costPerPost;
  const reelsCost = Math.max(0, reelsCount) * rates.costPerReel;
  const storiesCost = Math.max(0, storiesCount) * rates.costPerStory;
  const baseManagement = rates.baseManagement;
  const planCost = includeMonthlyPlan ? (sector === 'b2b' ? 0 : 500) : 0;

  const subtotal = baseManagement + postsCost + reelsCost + storiesCost + planCost;

  // Bundle volume efficiency discount for higher volumes
  const totalAssets = postsCount + (reelsCount * 2) + Math.floor(storiesCount / 2);
  let bundleDiscount = 0;
  if (totalAssets >= 24) {
    bundleDiscount = Math.round(subtotal * 0.12);
  } else if (totalAssets >= 16) {
    bundleDiscount = Math.round(subtotal * 0.08);
  } else if (totalAssets >= 10) {
    bundleDiscount = Math.round(subtotal * 0.04);
  }

  // Round to nearest 500 EGP for clean pricing
  let calculatedMonthly = subtotal - bundleDiscount;
  calculatedMonthly = Math.max(rates.minPrice, Math.round(calculatedMonthly / 500) * 500);

  // Original price for display / strikethrough value
  const originalPrice = Math.round((calculatedMonthly * 1.2) / 500) * 500;

  // Quarterly calculation with 10% to 20% retainer discount
  let quarterlyDiscountPercent = 0.10;
  if (sector === 'medical') {
    quarterlyDiscountPercent = calculatedMonthly >= 25000 ? 0.20 : calculatedMonthly >= 18000 ? 0.15 : 0.10;
  } else if (sector === 'b2c' || sector === 'b2b') {
    quarterlyDiscountPercent = calculatedMonthly >= 20000 ? 0.15 : 0.10;
  }

  const rawQuarterly = calculatedMonthly * 3;
  const quarterlyPrice = Math.round((rawQuarterly * (1 - quarterlyDiscountPercent)) / 250) * 250;
  const quarterlySavings = rawQuarterly - quarterlyPrice;

  // Recommended Names and Copy
  const sectorLabelAr = sector === 'b2b' ? 'الشركات والمصانع' : sector === 'medical' ? 'القطاع الطبي' : 'التجزئة والمتاجر';
  const sectorLabelEn = sector === 'b2b' ? 'B2B Enterprise' : sector === 'medical' ? 'Medical' : 'B2C E-Com';

  const recommendedName = `باقة مخصصة — ${sectorLabelAr} (${postsCount} منشور • ${reelsCount} ريلز)`;
  const recommendedNameEn = `Custom ${sectorLabelEn} Retainer (${postsCount}P • ${reelsCount}R)`;

  const recommendedBadge = 'باقة مخصصة حسب الطلب';
  const recommendedBadgeEn = 'Tailored Custom Retainer';

  const tagline = `باقة مخصصة تلائم أهدافك وميزانيتك بدقة: ${postsCount} منشور، ${reelsCount} مقطع ريلز، و ${storiesCount} ستوري شهرياً.`;
  const taglineEn = `Customized retainer tailored to your exact scope: ${postsCount} Posts, ${reelsCount} AI Reels, and ${storiesCount} Stories monthly.`;

  const features: string[] = [
    `${postsCount} منشور / تصاميم احترافية شهرياً (${postsCount} Posts)`,
    reelsCount > 0 ? `${reelsCount} مقاطع ريلز وفيديو مصممة للانتشار (${reelsCount} Reels)` : 'إمكانية إضافة مقاطع فيديو وريلز عند الحاجة',
    storiesCount > 0 ? `${storiesCount} ستوري تفاعلية دورية (${storiesCount} Stories)` : 'ستوريز حسب الطلب والمواسم',
    includeMonthlyPlan ? 'خطة محتوى استراتيجية شهرية معتمدة شاملة' : 'جدولة وتوزيع المحتوى على المنصات',
    sector === 'medical' ? 'محتوى طبي معتمد ومسار توجيه المرضى للحجز الفوري' : 'صياغة نصوص إعلانية موجهة لزيادة التفاعل والمبيعات',
    'تقرير شهري تحليلي مفصل للأداء ومؤشرات النمو',
  ];

  const featuresEn: string[] = [
    `${postsCount} Professional Branded Posts per month`,
    reelsCount > 0 ? `${reelsCount} High-Impact AI Video Reels` : 'Optional video production add-ons',
    storiesCount > 0 ? `${storiesCount} Interactive Stories` : 'Stories scheduled on demand',
    includeMonthlyPlan ? 'Comprehensive monthly content strategy & calendar' : 'Publishing schedule across channels',
    sector === 'medical' ? 'Ethical medical copywriting & appointment booking funnels' : 'Persuasive high-converting copywriting tailored to your audience',
    'Detailed monthly analytics & ROI performance review',
  ];

  return {
    sector,
    postsCount,
    reelsCount,
    storiesCount,
    monthlyPrice: calculatedMonthly,
    quarterlyPrice,
    originalPrice,
    quarterlySavings,
    period,
    breakdown: {
      baseManagement,
      postsCost,
      reelsCost,
      storiesCost,
      planCost,
      subtotal,
      bundleDiscount,
      finalMonthly: calculatedMonthly,
    },
    recommendedName,
    recommendedNameEn,
    recommendedBadge,
    recommendedBadgeEn,
    tagline,
    taglineEn,
    features,
    featuresEn,
  };
}

/**
 * Converts a calculated custom package into a real ServicePackage object ready to save in AgencyDataContext
 */
export function buildServicePackageFromCustomCalculation(calc: CustomPackageCalculation): Omit<ServicePackage, 'id'> {
  return {
    name: calc.recommendedName,
    nameEn: calc.recommendedNameEn,
    sector: calc.sector,
    badge: calc.recommendedBadge,
    badgeEn: calc.recommendedBadgeEn,
    price: calc.monthlyPrice,
    originalPrice: calc.originalPrice,
    quarterlyPrice: calc.quarterlyPrice,
    currency: 'ج.م',
    currencyEn: 'EGP',
    period: '/ شهرياً',
    periodEn: '/ month',
    isPopular: false,
    hasOffer: calc.quarterlySavings > 0,
    offerNote: `وفر ${calc.quarterlySavings.toLocaleString('ar-EG')} ج.م عند الاشتراك الربع سنوي`,
    offerNoteEn: `Save ${calc.quarterlySavings.toLocaleString('en-US')} EGP Quarterly`,
    tagline: calc.tagline,
    taglineEn: calc.taglineEn,
    idealFor: 'الأنشطة والعلامات التي تحتاج خطة عمل مفصلة ومصممة خصيصاً لمعدل نموها.',
    idealForEn: 'Businesses requiring a custom-scoped retainer aligned with their exact growth target.',
    features: calc.features,
    featuresEn: calc.featuresEn,
    postsCount: calc.postsCount,
    reelsCount: calc.reelsCount,
    storiesCount: calc.storiesCount,
    hasMonthlyPlan: true,
  };
}
