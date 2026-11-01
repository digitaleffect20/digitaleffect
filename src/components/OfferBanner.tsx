import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { Tag, ArrowLeft, ArrowRight } from 'lucide-react';

export const OfferBanner: React.FC = () => {
  const { data, language, setIsConsultationOpen } = useAgencyData();
  const banner = data.banner;

  if (!banner.enabled) return null;

  const isAr = language === 'ar';
  const tag = isAr ? banner.tag : (banner.tagEn || banner.tag);
  const text = isAr ? banner.text : (banner.textEn || banner.text);
  const linkText = isAr ? banner.linkText : (banner.linkTextEn || banner.linkText);

  return (
    <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-sky-950 text-white text-xs sm:text-sm py-2.5 px-4 shadow-sm border-b border-sky-800/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <span className="bg-sky-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
            <Tag className="w-3 h-3" />
            {tag}
          </span>
          <p className="text-slate-100 font-medium leading-snug">
            {text}
          </p>
        </div>
        {linkText && (
          <button
            onClick={() => setIsConsultationOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap group ml-auto sm:ml-0"
          >
            <span>{linkText}</span>
            {isAr ? (
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
