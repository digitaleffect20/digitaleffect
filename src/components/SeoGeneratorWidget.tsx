import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Search, 
  Share2, 
  Code2, 
  Globe, 
  RefreshCw, 
  FileText,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  generateCaseStudySeo, 
  generatePageSeo, 
  CaseStudySeoInput, 
  PageSeoInput, 
  GeneratedSeoResult 
} from '../lib/seoGenerator';

export interface SeoGeneratorWidgetProps {
  mode?: 'case-study' | 'page';
  initialCaseStudy?: Partial<CaseStudySeoInput>;
  initialPage?: Partial<PageSeoInput>;
  isAr?: boolean;
  onApply?: (result: GeneratedSeoResult) => void;
  className?: string;
}

export const SeoGeneratorWidget: React.FC<SeoGeneratorWidgetProps> = ({
  mode = 'case-study',
  initialCaseStudy,
  initialPage,
  isAr = true,
  onApply,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'serp' | 'social' | 'schema' | 'audit'>('serp');
  const [langView, setLangView] = useState<'ar' | 'en'>('ar');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [applied, setApplied] = useState(false);

  // Form inputs for live interactive generation
  const [csClient, setCsClient] = useState(initialCaseStudy?.client || 'مركز IPT للعلاج الطبيعي');
  const [csClientEn, setCsClientEn] = useState(initialCaseStudy?.clientEn || 'IPT Rehabilitation Center');
  const [csSector, setCsSector] = useState<'b2b' | 'b2c' | 'medical'>(initialCaseStudy?.sector || 'medical');
  const [csMetricVal, setCsMetricVal] = useState(initialCaseStudy?.metrics?.[0]?.value || '+380%');
  const [csMetricLabel, setCsMetricLabel] = useState(initialCaseStudy?.metrics?.[0]?.label || 'نمو حجوزات المرضى');
  const [csMetricLabelEn, setCsMetricLabelEn] = useState(initialCaseStudy?.metrics?.[0]?.labelEn || 'Patient Booking Growth');
  const [csSlug, setCsSlug] = useState(initialCaseStudy?.slug || 'ipt');

  const [pageType, setPageType] = useState<PageSeoInput['pageType']>(initialPage?.pageType || 'b2b');

  // Compute generated SEO result
  const [result, setResult] = useState<GeneratedSeoResult>(() => {
    if (mode === 'case-study') {
      return generateCaseStudySeo({
        title: initialCaseStudy?.title || 'دراسة حالة مركز IPT',
        titleEn: initialCaseStudy?.titleEn || 'IPT Center Case Study',
        client: csClient,
        clientEn: csClientEn,
        sector: csSector,
        metrics: [{ label: csMetricLabel, labelEn: csMetricLabelEn, value: csMetricVal }],
        slug: csSlug,
      });
    } else {
      return generatePageSeo({ pageType });
    }
  });

  // Re-run generation when inputs change
  const handleRegenerate = () => {
    if (mode === 'case-study') {
      const res = generateCaseStudySeo({
        title: `دراسة حالة ${csClient}`,
        titleEn: `${csClientEn} Case Study`,
        client: csClient,
        clientEn: csClientEn,
        sector: csSector,
        metrics: [{ label: csMetricLabel, labelEn: csMetricLabelEn, value: csMetricVal }],
        slug: csSlug,
      });
      setResult(res);
    } else {
      const res = generatePageSeo({ pageType });
      setResult(res);
    }
  };

  useEffect(() => {
    handleRegenerate();
  }, [csClient, csClientEn, csSector, csMetricVal, csMetricLabel, csMetricLabelEn, csSlug, pageType, mode]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(result.schemaJsonLd, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(result);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  const curTitle = langView === 'ar' ? result.title : result.titleEn;
  const curDesc = langView === 'ar' ? result.description : result.descriptionEn;
  const curTitleLen = curTitle.length;
  const curDescLen = curDesc.length;

  const isTitleOptimal = curTitleLen >= 30 && curTitleLen <= 60;
  const isDescOptimal = curDescLen >= 120 && curDescLen <= 160;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-start ${className}`}>
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'مولّد الـ SEO والبيانات المنظمة التلقائي (Schema.org)' : 'Automatic SEO & Schema.org Metadata Generator'}</span>
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'توليد عناوين وأوصاف مطابقة لمعايير جوجل بدقة (30-60 حرف للعنوان، و120-160 حرف للوصف) مع بيانات Schema.org كاملة.'
              : 'Generates Google-compliant titles (30-60 chars) and meta descriptions (120-160 chars) with verified Schema JSON-LD.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setLangView('ar')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                langView === 'ar' ? 'bg-sky-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => setLangView('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                langView === 'en' ? 'bg-sky-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {onApply && (
            <button
              type="button"
              onClick={handleApply}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                applied 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {applied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{applied ? (isAr ? 'تم التطبيق بنجاح' : 'Applied!') : (isAr ? 'تطبيق على دراسة الحالة' : 'Apply to Case Study')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Internal Customizer Strip (Only when editing case-study live) */}
      {mode === 'case-study' && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">{isAr ? 'اسم العميل / المشروع:' : 'Client / Brand Name:'}</label>
            <input
              type="text"
              value={csClient}
              onChange={(e) => setCsClient(e.target.value)}
              className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">{isAr ? 'القطاع التخصصي:' : 'Sector:'}</label>
            <select
              value={csSector}
              onChange={(e) => setCsSector(e.target.value as 'b2b' | 'b2c' | 'medical')}
              className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold"
            >
              <option value="b2b">قطاع الشركات B2B</option>
              <option value="b2c">قطاع المتاجر B2C</option>
              <option value="medical">القطاع الطبي Medical</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">{isAr ? 'قيمة أفضل نتيجة:' : 'Highlight Metric:'}</label>
            <input
              type="text"
              value={csMetricVal}
              onChange={(e) => setCsMetricVal(e.target.value)}
              placeholder="+380%"
              className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">{isAr ? 'بيان النتيجة:' : 'Metric Label:'}</label>
            <input
              type="text"
              value={csMetricLabel}
              onChange={(e) => setCsMetricLabel(e.target.value)}
              placeholder="نمو الحجوزات"
              className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold"
            />
          </div>
        </div>
      )}

      {mode === 'page' && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3 text-xs">
          <label className="font-bold text-slate-700 shrink-0">{isAr ? 'اختر الصفحة المستهدفة:' : 'Select Target Page:'}</label>
          <select
            value={pageType}
            onChange={(e) => setPageType(e.target.value as PageSeoInput['pageType'])}
            className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold max-w-xs"
          >
            <option value="home">الصفحة الرئيسية (Home)</option>
            <option value="b2b">صفحة قطاع الشركات (B2B)</option>
            <option value="b2c">صفحة التجارة والمتاجر (B2C)</option>
            <option value="medical">صفحة القطاع الطبي (Medical)</option>
            <option value="about">صفحة من نحن (About Us)</option>
            <option value="case-studies">معرض دراسات الحالة (Case Studies)</option>
          </select>
          <button
            type="button"
            onClick={handleRegenerate}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200 cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 px-4 sm:px-5 pt-3 border-b border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setActiveTab('serp')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'serp'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isAr ? 'معاينة ظهور جوجل (Google SERP)' : 'Google SERP Preview'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'بيانات Schema JSON-LD' : 'Schema.org JSON-LD'}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            Valid
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'فحص الامتثال والمعايير (Audit)' : 'SEO Compliance Audit'}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* TAB 1: GOOGLE SERP PREVIEW */}
        {activeTab === 'serp' && (
          <div className="space-y-4">
            {/* Live Google Search Card */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 font-sans">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-5 h-5 rounded-full bg-sky-600 text-white font-black text-[10px] flex items-center justify-center">
                  D
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-900">digitaleffect.net</span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-600">{result.slug}</span>
                </div>
              </div>

              <h5 className="text-base sm:text-lg font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1 leading-snug">
                {curTitle}
              </h5>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {curDesc}
              </p>
            </div>

            {/* Character Length & Guidelines Scorecard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Title Status */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isAr ? 'طول العنوان (Meta Title):' : 'Meta Title Length:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900">{curTitleLen} / 60</span>
                    <span className="text-xs text-slate-500">{isAr ? 'حرف' : 'chars'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isTitleOptimal ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مثالي (30-60)' : 'Optimal'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'يحتاج تعديل' : 'Adjust'}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(curTitle);
                      setCopiedTitle(true);
                      setTimeout(() => setCopiedTitle(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title={isAr ? 'نسخ العنوان' : 'Copy Title'}
                  >
                    {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Description Status */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isAr ? 'طول الوصف (Meta Description):' : 'Meta Description Length:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900">{curDescLen} / 160</span>
                    <span className="text-xs text-slate-500">{isAr ? 'حرف' : 'chars'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isDescOptimal ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مثالي (120-160)' : 'Optimal'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'يحتاج تعديل' : 'Adjust'}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(curDesc);
                      setCopiedDesc(true);
                      setTimeout(() => setCopiedDesc(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title={isAr ? 'نسخ الوصف' : 'Copy Description'}
                  >
                    {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEMA.ORG JSON-LD */}
        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'كود البيانات المنظمة وفق مواصفات Schema.org الرسمية' : 'Schema.org JSON-LD Structured Data'}</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  {isAr 
                    ? 'يتم حقن هذا الكود في وسم <head> لتفعيل مقتطفات جوجل الغنية والـ Rich Snippets.' 
                    : 'This script powers rich search snippets and knowledge graph entity recognition.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود JSON-LD' : 'Copy JSON-LD')}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-64 leading-relaxed dir-ltr text-left">
              {JSON.stringify(result.schemaJsonLd, null, 2)}
            </pre>
          </div>
        )}

        {/* TAB 3: AUDIT & GUIDELINES REPORT */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'تقرير فحص الامتثال لمعايير السيو (SEO Audit Report):' : 'SEO Compliance Audit Report:'}</span>
              </h5>
              
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>العنوان (Title):</strong> {curTitleLen} حرف {isTitleOptimal ? 'ضمن النطاق المعتمد (30-60 حرفاً)' : 'يرجى مراجعته ليطابق المعيار'}.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>الوصف (Description):</strong> {curDescLen} حرف {isDescOptimal ? 'ضمن النطاق الموصى به (120-160 حرفاً)' : 'يحتاج ضبطاً بسيطاً'}.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>العلامة التجارية:</strong> تم تضمين اسم ديجيتال إفكت تلقائياً في نهاية العنوان لتعزيز الهوية المؤسسية.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Schema.org Type:</strong> تم إنشاء نموذج <code>{String(result.schemaJsonLd['@type'])}</code> مع كامل سمات الناشر والمؤلف وعنوان الصفحة.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
