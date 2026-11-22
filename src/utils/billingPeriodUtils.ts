import { Inquiry } from '../types';

export const ARABIC_MONTH_NAMES = [
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
] as const;

export const ENGLISH_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Parses a YYYY-MM-DD (or YYYY-MM) string safely without timezone shifts.
 */
export function parseYearMonth(dateStr?: string): { year: number; monthIndex: number } {
  if (dateStr) {
    const match = String(dateStr).trim().match(/^(\d{4})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      if (Number.isFinite(year) && month >= 1 && month <= 12) {
        return { year, monthIndex: month - 1 };
      }
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function addMonths(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const total = year * 12 + monthIndex + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonthIndex = ((total % 12) + 12) % 12;
  return { year: nextYear, monthIndex: nextMonthIndex };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Formats the billing period text shown directly underneath the Issue Date on Invoices:
 * - Monthly:   "عن شهر ديسمبر 2026"
 * - Quarterly: "عن أشهر أكتوبر ونوفمبر وديسمبر 2026" (handles cross-year cleanly)
 * - Annual:    "عن عام 2026 (يناير – ديسمبر)" or "عن الفترة من ديسمبر 2026 إلى نوفمبر 2027"
 */
export function formatInvoicePeriodLabel(
  startDateStr?: string,
  billingCycle: Inquiry['billingCycle'] = 'monthly',
  isAr = true
): string {
  const { year, monthIndex } = parseYearMonth(startDateStr);
  const months = isAr ? ARABIC_MONTH_NAMES : ENGLISH_MONTH_NAMES;

  if (billingCycle === 'quarterly') {
    const m0 = addMonths(year, monthIndex, 0);
    const m1 = addMonths(year, monthIndex, 1);
    const m2 = addMonths(year, monthIndex, 2);

    if (isAr) {
      if (m0.year === m2.year) {
        return `عن أشهر ${months[m0.monthIndex]} و${months[m1.monthIndex]} و${months[m2.monthIndex]} ${m0.year}`;
      }
      if (m0.year === m1.year) {
        return `عن أشهر ${months[m0.monthIndex]} و${months[m1.monthIndex]} ${m0.year} و${months[m2.monthIndex]} ${m2.year}`;
      }
      return `عن أشهر ${months[m0.monthIndex]} ${m0.year} و${months[m1.monthIndex]} و${months[m2.monthIndex]} ${m2.year}`;
    }

    if (m0.year === m2.year) {
      return `For ${months[m0.monthIndex]}, ${months[m1.monthIndex]} & ${months[m2.monthIndex]} ${m0.year}`;
    }
    return `For ${months[m0.monthIndex]} ${m0.year}, ${months[m1.monthIndex]} & ${months[m2.monthIndex]} ${m2.year}`;
  }

  if (billingCycle === 'annual') {
    const end = addMonths(year, monthIndex, 11);
    if (isAr) {
      if (monthIndex === 0) {
        return `عن عام ${year} (يناير – ديسمبر)`;
      }
      return `عن الفترة من ${months[monthIndex]} ${year} إلى ${months[end.monthIndex]} ${end.year}`;
    }
    if (monthIndex === 0) {
      return `For Year ${year} (Jan – Dec)`;
    }
    return `For ${months[monthIndex]} ${year} – ${months[end.monthIndex]} ${end.year}`;
  }

  // Monthly (default)
  return isAr
    ? `عن شهر ${months[monthIndex]} ${year}`
    : `For ${months[monthIndex]} ${year}`;
}

/**
 * Formats the short operation cycle title displayed on client cards, drawer headers, and cycle archives:
 * - Monthly:   "دورة شهر ديسمبر 2026"
 * - Quarterly: "دورة أشهر أكتوبر ونوفمبر وديسمبر 2026"
 * - Annual:    "دورة عام 2026" / "دورة ديسمبر 2026 – نوفمبر 2027"
 */
export function formatOperationCycleBadge(
  startDateStr?: string,
  billingCycle: Inquiry['billingCycle'] = 'monthly',
  isAr = true
): string {
  const { year, monthIndex } = parseYearMonth(startDateStr);
  const months = isAr ? ARABIC_MONTH_NAMES : ENGLISH_MONTH_NAMES;

  if (billingCycle === 'quarterly') {
    const m0 = addMonths(year, monthIndex, 0);
    const m1 = addMonths(year, monthIndex, 1);
    const m2 = addMonths(year, monthIndex, 2);
    if (isAr) {
      if (m0.year === m2.year) {
        return `دورة أشهر ${months[m0.monthIndex]} و${months[m1.monthIndex]} و${months[m2.monthIndex]} ${m0.year}`;
      }
      if (m0.year === m1.year) {
        return `دورة أشهر ${months[m0.monthIndex]} و${months[m1.monthIndex]} ${m0.year} و${months[m2.monthIndex]} ${m2.year}`;
      }
      return `دورة أشهر ${months[m0.monthIndex]} ${m0.year} و${months[m1.monthIndex]} و${months[m2.monthIndex]} ${m2.year}`;
    }
    return `${months[m0.monthIndex].slice(0, 3)}–${months[m2.monthIndex].slice(0, 3)} ${m2.year} Cycle`;
  }

  if (billingCycle === 'annual') {
    const end = addMonths(year, monthIndex, 11);
    if (isAr) {
      return monthIndex === 0
        ? `دورة عام ${year}`
        : `دورة ${months[monthIndex]} ${year} – ${months[end.monthIndex]} ${end.year}`;
    }
    return monthIndex === 0
      ? `${year} Annual Cycle`
      : `${months[monthIndex].slice(0, 3)} ${year} – ${months[end.monthIndex].slice(0, 3)} ${end.year}`;
  }

  return isAr
    ? `دورة شهر ${months[monthIndex]} ${year}`
    : `${months[monthIndex]} ${year} Cycle`;
}

/**
 * Given a chosen year & monthIndex (0..11) and billingCycle, returns clean YYYY-MM-DD start & end dates.
 */
export function buildCycleDatesFromMonth(
  year: number,
  monthIndex: number,
  billingCycle: Inquiry['billingCycle'] = 'monthly'
): { startDate: string; endDate: string } {
  const spanMonths = billingCycle === 'annual' ? 12 : billingCycle === 'quarterly' ? 3 : 1;
  const startDate = `${year}-${pad2(monthIndex + 1)}-01`;
  const endMonth = addMonths(year, monthIndex, spanMonths - 1);
  const lastDay = new Date(endMonth.year, endMonth.monthIndex + 1, 0).getDate();
  const endDate = `${endMonth.year}-${pad2(endMonth.monthIndex + 1)}-${pad2(lastDay)}`;
  return { startDate, endDate };
}

/**
 * Computes the next operating cycle's year, month, start date, and end date cleanly.
 */
export function getNextOperationCycle(
  currentStartDate?: string,
  billingCycle: Inquiry['billingCycle'] = 'monthly'
): { year: number; monthIndex: number; startDate: string; endDate: string } {
  const { year, monthIndex } = parseYearMonth(currentStartDate);
  const step = billingCycle === 'annual' ? 12 : billingCycle === 'quarterly' ? 3 : 1;
  const next = addMonths(year, monthIndex, step);
  const { startDate, endDate } = buildCycleDatesFromMonth(next.year, next.monthIndex, billingCycle);
  return { ...next, startDate, endDate };
}
