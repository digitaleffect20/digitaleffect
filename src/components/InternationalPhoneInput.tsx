import React, { useState, useRef, useEffect } from 'react';
import { CountryCode } from 'libphonenumber-js';
import { ChevronDown, Search, Check, Phone } from 'lucide-react';
import { 
  COUNTRIES, 
  CountryInfo, 
  getCountryByCode, 
  validateAndFormatPhone, 
  detectCountryFromInput 
} from '../lib/phoneUtils';

interface InternationalPhoneInputProps {
  value: string;
  selectedCountry: CountryCode;
  onChange: (value: string) => void;
  onCountryChange: (country: CountryCode) => void;
  onValidationChange?: (isValid: boolean, e164: string | null) => void;
  isAr: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  selectedCountry,
  onChange,
  onCountryChange,
  onValidationChange,
  isAr,
  disabled = false,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentCountry = getCountryByCode(selectedCountry);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle phone input changes with auto country switching if +countryCode is typed
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw);

    // If input starts with a foreign dial code, auto-switch selected country
    const detected = detectCountryFromInput(raw);
    if (detected && detected !== selectedCountry) {
      onCountryChange(detected);
    }
  };

  // Re-run validation whenever value or selected country changes
  useEffect(() => {
    if (onValidationChange) {
      if (!value.trim()) {
        onValidationChange(false, null);
      } else {
        const result = validateAndFormatPhone(value, selectedCountry);
        onValidationChange(result.isValid, result.e164);
      }
    }
  }, [value, selectedCountry, onValidationChange]);

  // Filtered countries for the dropdown
  const filteredCountries = COUNTRIES.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nameAr.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  const handleSelectCountry = (country: CountryInfo) => {
    onCountryChange(country.code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Group */}
      <div 
        className={`flex items-center rounded-xl border transition-all ${
          isOpen ? 'ring-2 ring-sky-500/30 border-sky-500 bg-white' : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-3 border-e border-slate-200 hover:bg-slate-100/80 active:bg-slate-200/60 rounded-s-xl transition-colors shrink-0 cursor-pointer text-xs font-bold text-slate-800"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={isAr ? currentCountry.nameAr : currentCountry.nameEn}
        >
          <span className="text-base leading-none select-none">{currentCountry.flag}</span>
          <span className="font-mono text-slate-700 font-semibold tabular-nums dir-ltr">
            {currentCountry.dialCode}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center">
          <input
            type="tel"
            required
            disabled={disabled}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder || (selectedCountry === 'EG' ? '010 0000 0000' : '050 000 0000')}
            className="w-full text-xs p-3 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono tabular-nums"
            dir="ltr"
          />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-1.5 w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 start-0 text-start"
          role="listbox"
        >
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث عن الدولة أو المفتاح (+966)...' : 'Search country or code (+966)...'}
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* List of Countries */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {isAr ? 'لا توجد دولة مطابقة' : 'No country found'}
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer text-start ${
                      isSelected 
                        ? 'bg-sky-50 text-sky-950 font-bold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 overflow-hidden me-2">
                      <span className="text-base select-none">{c.flag}</span>
                      <span className="truncate">{isAr ? c.nameAr : c.nameEn}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-slate-500 text-[11px] tabular-nums dir-ltr">
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
