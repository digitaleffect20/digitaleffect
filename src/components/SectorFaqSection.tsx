import React, { useEffect, useMemo, useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { FAQ_DATA, FaqCategoryKey } from '../data/faqData';
import { toArabicDigits } from '../utils/arabicNumbers';
import {
  HelpCircle,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Sliders,
  Search,
  X,
} from 'lucide-react';

interface SectorFaqSectionProps {
  category: FaqCategoryKey;
  /** Render inside an existing max-w container without extra outer horizontal padding */
  embedded?: boolean;
}

const ACCENT_STYLES = {
  sky: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    badgeIcon: 'text-sky-600',
    numActive: 'bg-sky-600 text-white border-sky-600',
    numIdle: 'bg-sky-50 text-sky-700 border-sky-200/80',
    itemActive: 'border-sky-300 bg-sky-50/35 shadow-sm',
    itemIdle: 'border-slate-200/90 bg-white hover:border-sky-200',
    chevronActive: 'bg-sky-600 text-white',
    chevronIdle: 'bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600',
    answerBorder: 'border-sky-400',
    link: 'text-sky-700 hover:text-sky-800',
    ctaBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
    searchFocus: 'focus:border-sky-400 focus:ring-2 focus:ring-sky-500/15',
    mark: 'bg-sky-100 text-sky-900',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    badgeIcon: 'text-amber-600',
    numActive: 'bg-amber-500 text-white border-amber-500',
    numIdle: 'bg-amber-50 text-amber-800 border-amber-200/80',
    itemActive: 'border-amber-300 bg-amber-50/35 shadow-sm',
    itemIdle: 'border-slate-200/90 bg-white hover:border-amber-200',
    chevronActive: 'bg-amber-500 text-white',
    chevronIdle: 'bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-700',
    answerBorder: 'border-amber-400',
    link: 'text-amber-700 hover:text-amber-800',
    ctaBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    searchFocus: 'focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15',
    mark: 'bg-amber-100 text-amber-950',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    badgeIcon: 'text-emerald-600',
    numActive: 'bg-emerald-600 text-white border-emerald-600',
    numIdle: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    itemActive: 'border-emerald-300 bg-emerald-50/35 shadow-sm',
    itemIdle: 'border-slate-200/90 bg-white hover:border-emerald-200',
    chevronActive: 'bg-emerald-600 text-white',
    chevronIdle: 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700',
    answerBorder: 'border-emerald-400',
    link: 'text-emerald-700 hover:text-emerald-800',
    ctaBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    searchFocus: 'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15',
    mark: 'bg-emerald-100 text-emerald-950',
  },
};

function normalizeForSearch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // strip Arabic diacritics & tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildArabicFriendlyPattern(term: string): RegExp | null {
  const cleaned = term.trim();
  if (!cleaned) return null;
  const pattern = Array.from(cleaned)
    .map((ch) => {
      if (/[اأإآٱ]/.test(ch)) return '[اأإآٱ]';
      if (/[ةه]/.test(ch)) return '[ةه]';
      if (/[يى]/.test(ch)) return '[يى]';
      return escapeRegExp(ch);
    })
    .join('[\\u064B-\\u065F\\u0670\\u0640]*');
  try {
    return new RegExp(`(${pattern})`, 'gi');
  } catch {
    return null;
  }
}

export const SectorFaqSection: React.FC<SectorFaqSectionProps> = ({
  category,
  embedded = false,
}) => {
  const { language, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';
  const config = FAQ_DATA[category];
  const styles = ACCENT_STYLES[config.accent];

  // Open the first question by default for immediate readability; allow opening multiple or toggling all
  const [openIds, setOpenIds] = useState<string[]>([config.items[0]?.id].filter(Boolean));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setOpenIds([config.items[0]?.id].filter(Boolean));
    setSearchQuery('');
  }, [category, config.items]);

  // Inject clean FAQPage JSON-LD schema for search engines while this page is mounted
  useEffect(() => {
    const scriptId = `faq-schema-${category}`;
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.items.map((item) => ({
        '@type': 'Question',
        name: isAr ? item.qAr : item.qEn,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isAr ? item.aAr : item.aEn,
        },
      })),
    });
    document.head.appendChild(script);

    return () => {
      const node = document.getElementById(scriptId);
      if (node) node.remove();
    };
  }, [category, config.items, isAr]);

  const normalizedQuery = useMemo(() => normalizeForSearch(searchQuery), [searchQuery]);
  const isSearching = normalizedQuery.length > 0;

  const filteredItems = useMemo(() => {
    const indexed = config.items.map((item, originalIndex) => ({ item, originalIndex }));
    if (!normalizedQuery) return indexed;

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return indexed.filter(({ item }) => {
      const haystack = normalizeForSearch(
        `${item.qAr} ${item.aAr} ${item.qEn} ${item.aEn}`
      );
      return tokens.every((token) => haystack.includes(token));
    });
  }, [config.items, normalizedQuery]);

  // Auto-expand matching answers when typing a search query, while allowing manual toggle
  useEffect(() => {
    if (isSearching) {
      setOpenIds(filteredItems.map(({ item }) => item.id));
    } else {
      setOpenIds([config.items[0]?.id].filter(Boolean));
    }
  }, [isSearching, filteredItems, config.items]);

  const highlightRegex = useMemo(
    () => (isSearching ? buildArabicFriendlyPattern(searchQuery) : null),
    [isSearching, searchQuery]
  );

  const renderHighlightedText = (text: string) => {
    if (!highlightRegex) return text;
    const parts = text.split(highlightRegex);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className={`rounded px-0.5 font-semibold ${styles.mark}`}>
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  };

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const visibleIds = filteredItems.map(({ item }) => item.id);
  const allExpanded =
    visibleIds.length > 0 && visibleIds.every((id) => openIds.includes(id));

  const toggleAll = () => {
    if (allExpanded) {
      setOpenIds([]);
    } else {
      setOpenIds(visibleIds);
    }
  };

  const formatIndex = (idx: number) => {
    const padded = String(idx + 1).padStart(2, '0');
    return isAr ? toArabicDigits(padded) : padded;
  };

  const totalCountFormatted = isAr
    ? toArabicDigits(String(config.items.length))
    : String(config.items.length);
  const filteredCountFormatted = isAr
    ? toArabicDigits(String(filteredItems.length))
    : String(filteredItems.length);

  const countLabel = isSearching
    ? isAr
      ? `نتائج البحث: ${filteredCountFormatted} من ${totalCountFormatted}`
      : `Showing ${filteredCountFormatted} of ${totalCountFormatted}`
    : isAr
    ? `${totalCountFormatted} أسئلة`
    : `${totalCountFormatted} FAQs`;

  const innerContent = (
    <div
      id={config.anchorId}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6 text-start"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${styles.badge}`}
            >
              <HelpCircle className={`w-3.5 h-3.5 ${styles.badgeIcon}`} />
              <span>{isAr ? config.badgeAr : config.badgeEn}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {countLabel}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {isAr ? config.titleAr : config.titleEn}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isAr ? config.subtitleAr : config.subtitleEn}
          </p>
        </div>

        {filteredItems.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="self-start md:self-end text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {allExpanded
              ? isAr
                ? 'إغلاق جميع الإجابات'
                : 'Collapse All'
              : isAr
              ? 'عرض جميع الإجابات'
              : 'Expand All'}
          </button>
        )}
      </div>

      {/* Live Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 pointer-events-none absolute top-1/2 -translate-y-1/2 start-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={isAr ? 'ابحث في الأسئلة الشائعة' : 'Search frequently asked questions'}
          placeholder={
            isAr
              ? 'ابحث في الأسئلة والإجابات (مثال: الأسعار، الإعلانات، LinkedIn، مدة التعاقد...)'
              : 'Search questions & answers (e.g. pricing, ads, LinkedIn, contract...)'
          }
          className={`w-full ps-11 pe-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${styles.searchFocus}`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label={isAr ? 'مسح البحث' : 'Clear search'}
            className="absolute top-1/2 -translate-y-1/2 end-3 w-6 h-6 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Accordion Items or Empty State */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map(({ item, originalIndex }) => {
            const isOpen = openIds.includes(item.id);
            const question = isAr ? item.qAr : item.qEn;
            const answer = isAr ? item.aAr : item.aEn;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen ? styles.itemActive : styles.itemIdle
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-start cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center shrink-0 tabular-nums transition-colors ${
                        isOpen ? styles.numActive : styles.numIdle
                      }`}
                    >
                      {formatIndex(originalIndex)}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {renderHighlightedText(question)}
                    </span>
                  </div>

                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen ? styles.chevronActive : styles.chevronIdle
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${item.id}`}
                    className="px-4 sm:px-5 pb-5 pt-0.5"
                  >
                    <div
                      className={`ps-4 ms-4 border-s-2 ${styles.answerBorder} space-y-3`}
                    >
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {renderHighlightedText(answer)}
                      </p>

                      {item.ctaTargetPage && (
                        <button
                          type="button"
                          onClick={() => setCurrentPage(item.ctaTargetPage!)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${styles.link} transition-colors cursor-pointer`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{isAr ? item.ctaLabelAr : item.ctaLabelEn}</span>
                          {isAr ? (
                            <ArrowLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              {isAr
                ? `لم نجد سؤالاً يطابق «${searchQuery}» في هذا القسم`
                : `No matching questions found for "${searchQuery}" in this section`}
            </p>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'جرّب كلمات أبسط أو تواصل مباشرة مع فريقنا وسنجيبك فوراً.'
                : 'Try broader keywords or reach out to our team directly.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'مسح البحث وعرض كل الأسئلة' : 'Clear Search & Show All'}
            </button>
            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${styles.ctaBtn}`}
            >
              {isAr ? 'اسأل فريقنا مباشرة' : 'Ask Our Team Directly'}
            </button>
          </div>
        </div>
      )}

      {/* Helpful Footer Strip */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-600 flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 shrink-0 ${styles.badgeIcon}`} />
          <span>
            {category === 'pricing'
              ? isAr
                ? 'لديك استفسار إضافي حول الباقات أو تفاصيل التعاقد؟'
                : 'Have another question about pricing or contract terms?'
              : isAr
              ? 'تبحث عن تفاصيل الأسعار والباقات ومدة التعاقد؟'
              : 'Looking for pricing, package tiers, or contract details?'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {category !== 'pricing' && (
            <button
              type="button"
              onClick={() => {
                setCurrentPage('custom-package');
                setTimeout(() => {
                  const el = document.getElementById('pricing-faq');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span>
                {isAr ? 'الأسئلة الشائعة حول الأسعار والباقات' : 'Pricing & Packages FAQs'}
              </span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsConsultationOpen(true)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${styles.ctaBtn}`}
          >
            <span>{isAr ? 'تحدث مع فريقنا مباشرة' : 'Ask Our Team Directly'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return innerContent;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {innerContent}
    </section>
  );
};
