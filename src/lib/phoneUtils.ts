import { parsePhoneNumberFromString, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

export interface CountryInfo {
  code: CountryCode;
  dialCode: string;
  nameAr: string;
  nameEn: string;
  flag: string;
}

// Canonical countries list with MENA prioritized followed by common international countries
export const COUNTRIES: CountryInfo[] = [
  // Core MENA / Regional
  { code: 'EG', dialCode: '+20', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', dialCode: '+966', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', dialCode: '+971', nameAr: 'الإمارات', nameEn: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'KW', dialCode: '+965', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', dialCode: '+974', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', dialCode: '+973', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', dialCode: '+968', nameAr: 'عُمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: 'JO', dialCode: '+962', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'IQ', dialCode: '+964', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: 'LY', dialCode: '+218', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
  { code: 'LB', dialCode: '+961', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: 'SY', dialCode: '+963', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },
  { code: 'SD', dialCode: '+249', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩' },
  { code: 'YE', dialCode: '+967', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪' },
  { code: 'DZ', dialCode: '+213', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: 'MA', dialCode: '+212', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'TN', dialCode: '+216', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: 'PS', dialCode: '+970', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },

  // Key International
  { code: 'US', dialCode: '+1', nameAr: 'الولايات المتحدة', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'CA', dialCode: '+1', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'GB', dialCode: '+44', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', dialCode: '+49', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷' },
  { code: 'IT', dialCode: '+39', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'TR', dialCode: '+90', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷' },
  { code: 'ES', dialCode: '+34', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'NL', dialCode: '+31', nameAr: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', dialCode: '+46', nameAr: 'السويد', nameEn: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', dialCode: '+41', nameAr: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭' },
  { code: 'RU', dialCode: '+7', nameAr: 'روسيا', nameEn: 'Russia', flag: '🇷🇺' },
  { code: 'CN', dialCode: '+86', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳' },
  { code: 'IN', dialCode: '+91', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳' },
  { code: 'PK', dialCode: '+92', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰' },
  { code: 'AU', dialCode: '+61', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺' },
  { code: 'MY', dialCode: '+60', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', dialCode: '+65', nameAr: 'سنغافورة', nameEn: 'Singapore', flag: '🇸🇬' },
  { code: 'ZA', dialCode: '+27', nameAr: 'جنوب إفريقيا', nameEn: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', dialCode: '+234', nameAr: 'نيجيريا', nameEn: 'Nigeria', flag: '🇳🇬' },
  { code: 'BR', dialCode: '+55', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷' },
];

export const DEFAULT_COUNTRY_CODE: CountryCode = 'EG';

export function getCountryByCode(code: string): CountryInfo {
  const normalized = (code || '').toUpperCase();
  return COUNTRIES.find((c) => c.code === normalized) || COUNTRIES[0];
}

/**
 * Normalizes Eastern Arabic/Indic numerals to standard ASCII digits.
 */
export function normalizeDigits(input: string): string {
  if (!input) return '';
  return input.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * Validates and converts phone number into standardized E.164 string
 * using Google's libphonenumber standard rules for the target country.
 */
export function validateAndFormatPhone(
  rawInput: string,
  countryCode: CountryCode
): {
  isValid: boolean;
  e164: string | null;
  formattedInternational: string | null;
  detectedCountry?: CountryCode;
  errorMessageAr?: string;
  errorMessageEn?: string;
} {
  const cleanInput = normalizeDigits(rawInput.trim());

  if (!cleanInput) {
    return {
      isValid: false,
      e164: null,
      formattedInternational: null,
      errorMessageAr: 'يرجى إدخال رقم الهاتف.',
      errorMessageEn: 'Please enter a phone number.',
    };
  }

  // Check if input begins with a '+' or international prefix '00'
  let parsed = parsePhoneNumberFromString(cleanInput, countryCode);

  // If user pasted or typed with leading 00, convert 00 to +
  if (!parsed && cleanInput.startsWith('00')) {
    parsed = parsePhoneNumberFromString(`+${cleanInput.slice(2)}`, countryCode);
  }

  if (parsed && parsed.isValid()) {
    return {
      isValid: true,
      e164: parsed.number, // E.164 formatted (+201xxxxxxxxx)
      formattedInternational: parsed.formatInternational(),
      detectedCountry: parsed.country,
    };
  }

  // Invalid phone number
  const country = getCountryByCode(countryCode);
  return {
    isValid: false,
    e164: null,
    formattedInternational: null,
    errorMessageAr: `رقم الهاتف غير صحيح وفق معايير دولة ${country.nameAr} (${country.dialCode}).`,
    errorMessageEn: `Invalid phone number for ${country.nameEn} (${country.dialCode}).`,
  };
}

/**
 * Detect country code if input starts with a '+' or full international dial code.
 */
export function detectCountryFromInput(rawInput: string): CountryCode | null {
  const clean = normalizeDigits(rawInput.trim());
  if (clean.startsWith('+') || clean.startsWith('00')) {
    const candidate = clean.startsWith('00') ? `+${clean.slice(2)}` : clean;
    const parsed = parsePhoneNumberFromString(candidate);
    if (parsed?.country) {
      return parsed.country;
    }
  }
  return null;
}

/**
 * Privacy-preserving Cloudflare GeoIP detection.
 * Contacts /api/geo on Cloudflare edge.
 * Returns 2-letter ISO country code or 'Unknown' on failure.
 * Caches in sessionStorage to avoid repeated network calls.
 */
export async function fetchVisitorCountry(): Promise<string> {
  const cached = typeof window !== 'undefined' ? sessionStorage.getItem('de_visitor_country') : null;
  if (cached && cached.length === 2) {
    return cached.toUpperCase();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s maximum timeout

    const res = await fetch('/api/geo', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.isDetected && data?.country && typeof data.country === 'string' && data.country.length === 2) {
        const country = data.country.toUpperCase();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('de_visitor_country', country);
        }
        return country;
      }
    }
  } catch (err) {
    // Graceful degradation: network error or timeout never blocks user experience
  }

  return 'Unknown';
}
