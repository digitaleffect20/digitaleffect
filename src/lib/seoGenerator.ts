/**
 * SEO & Schema.org Generator Helper for Digital Effect Admin Dashboard
 * Adheres strictly to the Applet SEO Skill guidelines:
 * - Specific, branded page titles (30-60 characters)
 * - Accurate, actionable meta descriptions (120-160 characters)
 * - Standard OpenGraph & Twitter Cards
 * - Valid Schema.org JSON-LD Structured Data
 */

export interface CaseStudySeoInput {
  title: string;
  titleEn?: string;
  client: string;
  clientEn?: string;
  sector: 'b2b' | 'b2c' | 'medical';
  industry?: string;
  industryEn?: string;
  metrics?: { label: string; value: string; labelEn?: string }[];
  challenge?: string;
  solution?: string;
  services?: string[];
  imageUrl?: string;
  slug?: string;
}

export interface PageSeoInput {
  pageType: 'home' | 'b2b' | 'b2c' | 'medical' | 'about' | 'case-studies' | 'pricing' | 'custom';
  customTitle?: string;
  customTitleEn?: string;
  customDescription?: string;
  customDescriptionEn?: string;
  primaryKeyword?: string;
  primaryKeywordEn?: string;
  keyFeatures?: string[];
  imageUrl?: string;
  slug?: string;
}

export interface SeoAuditReport {
  titleLength: number;
  titleEnLength: number;
  titleValid: boolean;
  titleEnValid: boolean;
  descriptionLength: number;
  descriptionEnLength: number;
  descriptionValid: boolean;
  descriptionEnValid: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface GeneratedSeoResult {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  slug: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  keywords: string[];
  keywordsEn: string[];
  schemaJsonLd: Record<string, unknown>;
  audit: SeoAuditReport;
}

const BASE_URL = 'https://digitaleffect.net';
const BRAND_AR = 'ديجيتال إفكت';
const BRAND_EN = 'Digital Effect';

const SECTOR_NAMES_AR: Record<'b2b' | 'b2c' | 'medical', string> = {
  b2b: 'قطاع الشركات والمصانع B2B',
  b2c: 'قطاع التجارة والمتاجر B2C',
  medical: 'القطاع الطبي والرعاية الصحية',
};

const SECTOR_NAMES_EN: Record<'b2b' | 'b2c' | 'medical', string> = {
  b2b: 'B2B Enterprise & Manufacturing',
  b2c: 'B2C E-Commerce & Retail',
  medical: 'Medical & Healthcare Clinics',
};

/**
 * Trims text intelligently to target range without chopping mid-word
 */
function fitToRange(text: string, minLen: number, maxLen: number, suffix: string = ''): string {
  let cleaned = text.trim();
  if (cleaned.length <= maxLen && cleaned.length >= minLen) {
    return cleaned;
  }
  if (cleaned.length > maxLen) {
    const cutLimit = maxLen - suffix.length;
    let truncated = cleaned.slice(0, cutLimit);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > minLen) {
      truncated = truncated.slice(0, lastSpace);
    }
    return `${truncated.trim()}${suffix}`;
  }
  return cleaned;
}

/**
 * Generates SEO metadata and Schema.org for a Case Study
 */
export function generateCaseStudySeo(input: CaseStudySeoInput): GeneratedSeoResult {
  const clientAr = input.client.trim();
  const clientEn = (input.clientEn || input.client).trim();
  const sectorAr = SECTOR_NAMES_AR[input.sector];
  const sectorEn = SECTOR_NAMES_EN[input.sector];

  // Best primary metric
  const primaryMetric = input.metrics && input.metrics[0];
  const metricVal = primaryMetric?.value || '';
  const metricLabel = primaryMetric?.label || 'نمو قياسي';
  const metricLabelEn = primaryMetric?.labelEn || 'Record Growth';

  // 1. Generate SEO Title (Target: 30 - 60 chars)
  // Arabic Pattern: "دراسة حالة [العميل]: نمو [النتيجة] | ديجيتال إفكت"
  let rawTitleAr = metricVal
    ? `دراسة حالة ${clientAr}: ${metricLabel} ${metricVal} | ${BRAND_AR}`
    : `دراسة حالة ${clientAr} في ${sectorAr} | ${BRAND_AR}`;

  // If too short, expand; if too long, compress
  if (rawTitleAr.length < 32) {
    rawTitleAr = `دراسة حالة نجاح ${clientAr} في ${sectorAr} | ${BRAND_AR}`;
  }
  const titleAr = fitToRange(rawTitleAr, 30, 60);

  // English Pattern: "[Client] Case Study: [Metric] [Label] | Digital Effect"
  let rawTitleEn = metricVal
    ? `${clientEn} Case Study: ${metricVal} ${metricLabelEn} | ${BRAND_EN}`
    : `${clientEn} Case Study in ${sectorEn} | ${BRAND_EN}`;

  if (rawTitleEn.length < 32) {
    rawTitleEn = `${clientEn} Growth Case Study: Digital Transformation | ${BRAND_EN}`;
  }
  const titleEn = fitToRange(rawTitleEn, 30, 60);

  // 2. Generate Meta Description (Target: 120 - 160 chars)
  // Arabic Pattern: "اكتشف قصة نجاح [العميل] وكيف حقق [النتيجة] عبر استراتيجيات [القطاع] المتخصصة من ديجيتال إفكت. تصفح دراسة الحالة وخطوات التنفيذ الكاملة."
  const resultPhraseAr = metricVal ? `تحقيق ${metricLabel} بنسبة ${metricVal}` : `تحقيق قفزة نوعية في المبيعات والعملاء`;
  let rawDescAr = `اكتشف قصة نجاح ${clientAr} وكيف أثمر التعاون عن ${resultPhraseAr} عبر حلول ${sectorAr} من ديجيتال إفكت. تصفح دراسة الحالة وخطوات العمل الآن.`;

  // Refine to 120-160 chars
  let descAr = rawDescAr.trim();
  if (descAr.length > 160) {
    descAr = fitToRange(rawDescAr, 120, 160, '...');
  } else if (descAr.length < 120) {
    descAr = `تعرف على تفاصيل دراسة حالة ${clientAr} وكيف تمكن من ${resultPhraseAr} عبر استراتيجيات ${sectorAr} من وكالة ديجيتال إفكت. اقرأ النتائج الملموسة والحلول المنفذة اليوم.`;
    descAr = fitToRange(descAr, 120, 160);
  }

  // English Description
  const resultPhraseEn = metricVal ? `delivering ${metricVal} ${metricLabelEn}` : `scaling sales and customer acquisition`;
  let rawDescEn = `Explore the ${clientEn} case study and discover how Digital Effect engineered growth, ${resultPhraseEn} in the ${sectorEn} market. Read full case study.`;
  let descEn = rawDescEn.trim();
  if (descEn.length > 160) {
    descEn = fitToRange(rawDescEn, 120, 160, '...');
  } else if (descEn.length < 120) {
    descEn = `Discover how ${clientEn} achieved exceptional outcomes, ${resultPhraseEn} through Digital Effect's specialized ${sectorEn} solutions. Read the complete story now.`;
    descEn = fitToRange(descEn, 120, 160);
  }

  // 3. Slug and Canonical URL
  const slug = input.slug || input.client.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'case-study';
  const canonicalUrl = `${BASE_URL}/#${slug}-case-study`;
  const imageUrl = input.imageUrl 
    ? (input.imageUrl.startsWith('http') ? input.imageUrl : `${BASE_URL}${input.imageUrl.startsWith('/') ? '' : '/'}${input.imageUrl}`)
    : `${BASE_URL}/assets/portfolio_crops/card_ipt.png`;

  // 4. Keywords
  const keywords = [
    `دراسة حالة ${clientAr}`,
    clientAr,
    sectorAr,
    'قصص نجاح تسويقية',
    'ديجيتال إفكت',
    ...(input.services || []),
  ];

  const keywordsEn = [
    `${clientEn} Case Study`,
    clientEn,
    sectorEn,
    'Marketing Success Story',
    'Digital Effect',
    'Performance Marketing ROI',
  ];

  // 5. Schema.org JSON-LD (Article & CreativeWork)
  const schemaJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: titleAr,
    alternativeHeadline: titleEn,
    description: descAr,
    image: [imageUrl],
    datePublished: '2024-01-15T08:00:00+02:00',
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Digital Effect | ديجيتال إفكت للحلول الرقمية',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Digital Effect',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/logo.png`,
      },
    },
    about: {
      '@type': 'Organization',
      name: clientEn || clientAr,
    },
    keywords: keywords.join(', '),
  };

  // 6. Audit & Compliance Check
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const titleValid = titleAr.length >= 30 && titleAr.length <= 60;
  const titleEnValid = titleEn.length >= 30 && titleEn.length <= 60;
  const descriptionValid = descAr.length >= 120 && descAr.length <= 160;
  const descriptionEnValid = descEn.length >= 120 && descEn.length <= 160;

  if (!titleValid) {
    warnings.push(`طول العنوان العربي (${titleAr.length} حرف) خارج النطاق المثالي (30-60 حرف).`);
  }
  if (!descriptionValid) {
    warnings.push(`طول الوصف العربي (${descAr.length} حرف) خارج النطاق الموصى به (120-160 حرف).`);
  }
  if (primaryMetric) {
    suggestions.push(`تم دمج مؤشر الأداء (${metricVal}) بنجاح لزيادة معدل النقر (CTR).`);
  }
  suggestions.push('تم تكوين بيانات Schema.org بنوع Article مع ربطها بالعلامة التجارية وموقع العمل.');

  return {
    title: titleAr,
    titleEn,
    description: descAr,
    descriptionEn: descEn,
    slug,
    canonicalUrl,
    ogType: 'article',
    keywords,
    keywordsEn,
    schemaJsonLd,
    audit: {
      titleLength: titleAr.length,
      titleEnLength: titleEn.length,
      titleValid,
      titleEnValid,
      descriptionLength: descAr.length,
      descriptionEnLength: descEn.length,
      descriptionValid,
      descriptionEnValid,
      warnings,
      suggestions,
    },
  };
}

/**
 * Generates SEO metadata and Schema.org for a standard website page
 */
export function generatePageSeo(input: PageSeoInput): GeneratedSeoResult {
  let titleAr = '';
  let titleEn = '';
  let descAr = '';
  let descEn = '';
  let slug = input.slug || input.pageType;
  let schemaType = 'WebPage';

  switch (input.pageType) {
    case 'home':
      titleAr = `ديجيتال إفكت — وكالة التسويق والحلول الرقمية المتكاملة`;
      titleEn = `Digital Effect — Integrated Digital Marketing & Growth Agency`;
      descAr = `وكالة تسويق رقمي رائدة متخصصة في قطاعات B2B، المتاجر الإلكترونية B2C، والمراكز الطبية. نبتكر استراتيجيات نمو تصنع فارقاً حقيقياً في مبيعاتك. احجز استشارتك.`;
      descEn = `Digital Effect is an elite growth agency specializing in industrial B2B, retail B2C, and healthcare marketing. Request your strategic consultation session today.`;
      schemaType = 'Organization';
      break;

    case 'b2b':
      titleAr = `تسويق الشركات والمصانع B2B وحلول التصدير | ديجيتال إفكت`;
      titleEn = `Industrial B2B Marketing & Export Lead Generation | Digital Effect`;
      descAr = `منظومة تسويق متكاملة للمصانع والشركات الكبرى B2B، توليد صفقات تجارية عالية القيمة وفتح أسواق التصدير عبر استراتيجيات ABM وإعلانات لينكد إن. ابدأ الآن.`;
      descEn = `B2B growth framework for manufacturers and enterprise suppliers. Generate multi-million contract pipelines and export leads through targeted ABM campaigns.`;
      schemaType = 'Service';
      break;

    case 'b2c':
      titleAr = `تسويق المتاجر الإلكترونية والتجارة B2C | ديجيتال إفكت`;
      titleEn = `E-Commerce Scaling & B2C Performance Marketing | Digital Effect`;
      descAr = `ضاعف مبيعات متجرك الإلكتروني بأعلى عائد إعلاني ROAS مع حلول التسويق الممولة، إنتاج محتوى الريلز التفاعلي، وتحسين معدل التحويل CRO. احجز خطة نموك اليوم.`;
      descEn = `Scale your e-commerce revenue with peak ROAS, viral reel video production, and high-converting performance media across Meta, TikTok, and Google Ads.`;
      schemaType = 'Service';
      break;

    case 'medical':
      titleAr = `التسويق الطبي للعيادات والمراكز التخصصية | ديجيتال إفكت`;
      titleEn = `Healthcare & Medical Clinic Marketing Solutions | Digital Effect`;
      descAr = `استراتيجيات تسويق طبي أخلاقية وموثوقة لمراكز العلاج الطبيعي والعيادات التخصصية. نحوّل المشاهدات إلى حجوزات كشوفات مؤكدة بأعلى معايير المصداقية.`;
      descEn = `Ethical healthcare marketing funnels for specialized medical centers and clinics. Transform clinical authority into verified patient consultations and bookings.`;
      schemaType = 'Service';
      break;

    case 'about':
      titleAr = `من نحن — خبرة ٢٠ عاماً في التسويق الرقمي | ديجيتال إفكت`;
      titleEn = `About Us — 20+ Years of Digital Marketing Mastery | Digital Effect`;
      descAr = `تعرف على ديجيتال إفكت وفريق القيادات المتخصصة في قطاعات B2B، التجارة، والطب. نمتلك خبرة تراكمية تفوق ٢٠ عاماً في هندسة النمو الرقمي المستدام.`;
      descEn = `Meet Digital Effect and our dedicated sector directors across B2B, B2C, and Healthcare, bringing over two decades of strategic growth leadership.`;
      schemaType = 'AboutPage';
      break;

    case 'case-studies':
      titleAr = `معرض أعمال ودراسات حالة النجاح المعتمدة | ديجيتال إفكت`;
      titleEn = `Verified Case Studies & Portfolio Results | Digital Effect`;
      descAr = `تصفح نتائج حقيقية وأرقام موثقة لمشاريعنا في قطاعات الشركات، المتاجر الاستهلاكية، والمراكز الطبية. اكتشف كيف نصنع قفزات نمو ملموسة لشركائنا.`;
      descEn = `Browse verified case study metrics, revenue milestones, and clinical booking growth across our premier client portfolio at Digital Effect.`;
      schemaType = 'CollectionPage';
      break;

    default:
      titleAr = input.customTitle 
        ? `${input.customTitle} | ${BRAND_AR}`
        : `خدمات واستشارات التسويق الرقمي | ${BRAND_AR}`;
      titleEn = input.customTitleEn 
        ? `${input.customTitleEn} | ${BRAND_EN}`
        : `Digital Marketing Services & Consulting | ${BRAND_EN}`;
      descAr = input.customDescription || `استكشف أحدث حلول التسويق الرقمي والاستراتيجيات الموجهة للنمو مع خبراء وكالة ديجيتال إفكت. تواصل معنا اليوم لتحقيق أهدافك.`;
      descEn = input.customDescriptionEn || `Discover growth-oriented digital marketing strategies and full-funnel execution with Digital Effect. Contact our team today.`;
      break;
  }

  // Adjust lengths to guidelines
  titleAr = fitToRange(titleAr, 30, 60);
  titleEn = fitToRange(titleEn, 30, 60);
  descAr = fitToRange(descAr, 120, 160);
  descEn = fitToRange(descEn, 120, 160);

  const canonicalUrl = `${BASE_URL}/#${slug}`;
  const imageUrl = input.imageUrl || `${BASE_URL}/assets/aistudio/b2b_35422994.png`;

  const keywords = ['ديجيتال إفكت', 'وكالة تسويق رقمي', 'تسويق الشركات B2B', 'تسويق المتاجر', 'تسويق طبي'];
  const keywordsEn = ['Digital Effect', 'Digital Marketing Agency', 'B2B Marketing', 'E-Commerce Growth', 'Healthcare Marketing'];

  const schemaJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: titleAr,
    alternateName: titleEn,
    description: descAr,
    url: canonicalUrl,
    inLanguage: ['ar', 'en'],
    publisher: {
      '@type': 'Organization',
      name: 'Digital Effect',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/logo.png`,
      },
    },
  };

  const titleValid = titleAr.length >= 30 && titleAr.length <= 60;
  const titleEnValid = titleEn.length >= 30 && titleEn.length <= 60;
  const descriptionValid = descAr.length >= 120 && descAr.length <= 160;
  const descriptionEnValid = descEn.length >= 120 && descEn.length <= 160;

  return {
    title: titleAr,
    titleEn,
    description: descAr,
    descriptionEn: descEn,
    slug,
    canonicalUrl,
    ogType: 'website',
    keywords,
    keywordsEn,
    schemaJsonLd,
    audit: {
      titleLength: titleAr.length,
      titleEnLength: titleEn.length,
      titleValid,
      titleEnValid,
      descriptionLength: descAr.length,
      descriptionEnLength: descEn.length,
      descriptionValid,
      descriptionEnValid,
      warnings: [],
      suggestions: ['تم فحص العنوان والوصف واعتماد Schema.org القياسية.'],
    },
  };
}
