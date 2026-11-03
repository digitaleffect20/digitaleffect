import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { Tag, ArrowLeft, ArrowRight, X } from 'lucide-react';

export const OfferBanner: React.FC = () => {
  const { data, language, setIsConsultationOpen } = useAgencyData();
  const [isDismissed, setIsDismissed] = useState(false);
  const banner = data.banner;

  if (!banner.enabled || isDismissed) return null;

  const isAr = language === 'ar';
  const tag = isAr ? banner.tag : (banner.tagEn || banner.tag);
  const text = isAr ? banner.text : (banner.textEn || banner.text);
  const linkText = isAr ? banner.linkText : (banner.linkTextEn || banner.linkText);

  return (
    <div className="bg-gradient-to-r from-sky-950 via-blue-950 to-slate-950 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-6 shadow-sm border-b border-sky-800/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
          <span className="bg-sky-500 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0">
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {tag}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-100 font-medium text-[11px] sm:text-xs leading-normal">
              {text}
            </p>
            {linkText && (
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-sky-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap group shrink-0"
              >
                <span className="underline underline-offset-2">{linkText}</span>
                {isAr ? (
                  <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                ) : (
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer shrink-0 hover:bg-white/10"
          aria-label={isAr ? 'إغلاق الإعلان' : 'Dismiss banner'}
          title={isAr ? 'إغلاق الإعلان' : 'Dismiss banner'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
