import React from 'react';
import { Tag } from 'lucide-react';

interface ClientPackageDeliverablesCardProps {
  packageName?: string;
  postsCount: number;
  reelsCount: number;
  storiesCount: number;
  isAr?: boolean;
  className?: string;
}

export const ClientPackageDeliverablesCard: React.FC<ClientPackageDeliverablesCardProps> = ({
  packageName,
  postsCount,
  reelsCount,
  storiesCount,
  isAr = true,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Package Name Tag (Without Cost) */}
      {packageName && (
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 text-xs font-bold">
            <Tag className="w-3.5 h-3.5 text-sky-600" />
            <span className="line-clamp-1">{packageName}</span>
          </div>
        </div>
      )}

      {/* 3 Vertical Deliverable Cards Exactly Matching User Image */}
      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xs">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {/* Card 1: Posts (منشور شهرياً) - Blue #0284c7 */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs py-3 sm:py-4 px-2 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] transition-transform hover:scale-[1.02]">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#0284c7] tabular-nums tracking-tight">
              {postsCount}
            </span>
            <span className="text-slate-600 text-xs sm:text-sm font-bold mt-1.5 leading-tight">
              {isAr ? 'منشور شهرياً' : 'Monthly Posts'}
            </span>
          </div>

          {/* Card 2: Reels (ريلز AI) - Purple #9333ea */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs py-3 sm:py-4 px-2 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] transition-transform hover:scale-[1.02]">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#9333ea] tabular-nums tracking-tight">
              {reelsCount}
            </span>
            <span className="text-slate-600 text-xs sm:text-sm font-bold mt-1.5 leading-tight">
              {isAr ? 'ريلز AI' : 'AI Reels'}
            </span>
          </div>

          {/* Card 3: Stories (ستوريز) - Orange #ea580c */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs py-3 sm:py-4 px-2 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] transition-transform hover:scale-[1.02]">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#ea580c] tabular-nums tracking-tight">
              {storiesCount}
            </span>
            <span className="text-slate-600 text-xs sm:text-sm font-bold mt-1.5 leading-tight">
              {isAr ? 'ستوريز' : 'Stories'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
