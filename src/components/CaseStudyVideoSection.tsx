import React, { useState } from 'react';
import { CaseStudyVideo } from '../types';
import { parseVideoUrl } from '../utils/caseStudyMedia';
import { Play, Film, ExternalLink, Sparkles, Volume2 } from 'lucide-react';

interface CaseStudyVideoSectionProps {
  videos: CaseStudyVideo[];
  isAr?: boolean;
  clientName?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  accentColor?: string;
}

export const CaseStudyVideoSection: React.FC<CaseStudyVideoSectionProps> = ({
  videos,
  isAr = true,
  clientName,
  title,
  subtitle,
  badgeText,
  accentColor = 'sky'
}) => {
  const [activeVideoId, setActiveVideoId] = useState<string>(videos[0]?.id || '');

  if (!videos || videos.length === 0) return null;

  const currentVideo = videos.find((v) => v.id === activeVideoId) || videos[0];
  const parsed = parseVideoUrl(currentVideo.url);

  const displayBadge = badgeText || (isAr ? 'المحتوى المرئي والفيديو التوثيقي' : 'Campaign Video & Motion Assets');
  const displayTitle = title || (isAr ? `فيديوهات الحملة وتوثيق النتائج ${clientName ? `— ${clientName}` : ''}` : `Campaign Showcase & Video Reel ${clientName ? `— ${clientName}` : ''}`);
  const displaySubtitle = subtitle || (isAr 
    ? 'شاهد مقاطع الفيديو الترويجية والإعلانية التوثيقية المنفذة بدقة إنتاجية عالية.'
    : 'Watch high-impact video reels and documentary proof produced for this partner.');

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
            <Film className="w-3.5 h-3.5 text-sky-400" />
            <span>{displayBadge}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {displayTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {displaySubtitle}
          </p>
        </div>

        {/* Video selector if more than 1 video */}
        {videos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {videos.map((vid, idx) => (
              <button
                key={vid.id}
                type="button"
                onClick={() => setActiveVideoId(vid.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  vid.id === currentVideo.id
                    ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isAr ? (vid.title || `فيديو ${idx + 1}`) : (vid.titleEn || vid.title || `Video ${idx + 1}`)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Video Player Container */}
      <div className="bg-slate-950/90 rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
            <iframe
              src={parsed.embedUrl}
              title={isAr ? currentVideo.title : currentVideo.titleEn || currentVideo.title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={parsed.embedUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
              preload="metadata"
            >
              {isAr ? 'المتصفح لا يدعم تشغيل هذا الفيديو مباشرة.' : 'Your browser does not support the video tag.'}
            </video>
          )}
        </div>

        {/* Video Description Bar */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {parsed.type === 'youtube' ? 'YouTube HD' : parsed.type === 'vimeo' ? 'Vimeo' : 'Direct Video'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {isAr ? currentVideo.title : (currentVideo.titleEn || currentVideo.title)}
              </h4>
            </div>
            {(currentVideo.desc || currentVideo.descEn) && (
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                {isAr ? currentVideo.desc : (currentVideo.descEn || currentVideo.desc)}
              </p>
            )}
          </div>

          {currentVideo.url.startsWith('http') && (
            <a
              href={currentVideo.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700 shrink-0 self-start sm:self-auto"
            >
              <span>{isAr ? 'فتح الرابط الأصلي' : 'Open Source Link'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
