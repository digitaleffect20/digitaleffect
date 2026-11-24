const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts Western/Latin digits (0-9), numeric thousands commas, decimal dots, and %
 * into Eastern Arabic-Indic numerals and punctuation for Arabic UI consistency.
 */
export function toArabicDigits(input: string | number): string {
  const str = String(input);
  // Replace thousands separator comma between digits, decimal dot between digits, percent sign, and digits
  return str
    .replace(/(?<=[0-9٠-٩]),(?=[0-9٠-٩])/g, '٬')
    .replace(/(?<=[0-9٠-٩])\.(?=[0-9٠-٩])/g, '٫')
    .replace(/%/g, '٪')
    .replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/**
 * Normalizes mixed Latin commas inside Arabic numeral strings (e.g. "١٧,٧٠٠" -> "١٧٬٧٠٠")
 * and converts Latin digits/percentages when rendering Arabic copy.
 */
export function normalizeArabicCopy(text: string): string {
  if (!text) return text;
  return text
    .replace(/([٠-٩]),([٠-٩])/g, '$1٬$2')
    .replace(/([٠-٩])\.([٠-٩])/g, '$1٫$2');
}

/**
 * Formats a metric value string (e.g., "2.4M+", "654K+", "+340%", "5.2X", "52,000+", "#1")
 * consistently for Arabic or English mode so pages never mix Eastern Arabic and Latin numerals.
 */
export function formatLocalizedMetric(value: string | number | undefined | null, isAr: boolean): string {
  if (value === undefined || value === null) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  if (!isAr) {
    // Ensure Latin digits & standard punctuation in English mode
    return raw
      .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
      .replace(/٬/g, ',')
      .replace(/٫/g, '.')
      .replace(/٪/g, '%');
  }

  let formatted = raw;
  // Convert compact suffixes like 2.4M+, 654K+, 12.7K, 4.8X
  formatted = formatted
    .replace(/(\d+(?:[.,]\d+)?)\s*M(\+?)/gi, '$1 مليون$2')
    .replace(/(\d+(?:[.,]\d+)?)\s*K(\+?)/gi, '$1 ألف$2')
    .replace(/(\d+(?:[.,]\d+)?)\s*X(\+?)/gi, '$1×$2');

  return toArabicDigits(formatted);
}

/**
 * Formats an integer/number cleanly in the active language's numeral system.
 */
export function formatLocalizedNumber(value: number, isAr: boolean): string {
  if (isAr) {
    return toArabicDigits(value.toLocaleString('en-US'));
  }
  return value.toLocaleString('en-US');
}
