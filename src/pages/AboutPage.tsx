import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { Award, ShieldCheck, Users, TrendingUp, CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { StatsRibbon } from '../components/StatsRibbon';
import { OurTeamSection } from '../components/OurTeamSection';
import { SeoHead } from '../components/SeoHead';

export const AboutPage: React.FC = () => {
  const { language, t, setCurrentPage, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';
  const content = isAr ? t.aboutPage : t.aboutPage;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Dynamic OpenGraph, Twitter Cards & Structured Data */}
      <SeoHead
        title={isAr ? 'من نحن — خبرة ٢٠ عاماً في التسويق والحلول الرقمية | ديجيتال إفكت' : 'About Us — 20+ Years of Digital Marketing Excellence | Digital Effect'}
        description={isAr ? 'تعرف على قصة ديجيتال إفكت وفريق العمل والقيادات المتخصصة التي تقود قطاعات B2B، B2C، والقطاع الطبي بخبرة تراكمية تفوق ٢٠ عاماً.' : 'Discover the Digital Effect story, our specialized sector leadership, and how we engineer long-term growth across B2B, B2C, and Healthcare.'}
        image="/assets/team/team_ceo.jpg"
        imageAlt={isAr ? 'فريق قيادات ديجيتال إفكت' : 'Digital Effect Leadership Team'}
        urlPath="#about"
        type="website"
      />

      {/* Header */}
      <section className="bg-slate-900 text-white pt-14 pb-20 border-b border-slate-800 text-start">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-white/10 px-3 py-1 rounded-full">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>{content.subtitle}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {content.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {content.lead}
          </p>
        </div>
      </section>

      {/* Stats Ribbon */}
      <StatsRibbon />

      {/* Heritage & Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              {content.storyTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {isAr
                ? 'رحلة تمتد لأكثر من ١٢ عاماً في قلب التحول الرقمي العربي'
                : 'Over A Decade at the Epicenter of Regional Digital Transformation'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {content.storyDesc}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'تأسست ديجيتال إفكت عام ٢٠١٤ على أيدي نخبة من رواد التسويق ذوي الخبرة التراكمية التي تفوق الـ ٢٠ عاماً. لم نتبع أبداً أسلوب "الوكالة العامة" التي تفعل كل شيء لكل أحد؛ بل أسسنا وحدات عمل متخصصة ومستقلة تماماً لكل قطاع.'
                : 'Founded in 2014 by digital pioneers with over 20 years of collective leadership mastery, we rejected the generic full-service agency cliché in favor of specialized, autonomous sector units.'}
            </p>
          </div>

          <div className="lg:col-span-6 bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isAr ? 'الأقسام الثلاثة المتخصصة:' : 'Our 3 Standalone Operating Units:'}
            </h3>

            <div className="space-y-3">
              <div 
                onClick={() => setCurrentPage('b2b')}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-sky-600">
                    {t.sectors.b2bTitle}
                  </span>
                  {isAr ? <ArrowLeft className="w-4 h-4 text-sky-600" /> : <ArrowRight className="w-4 h-4 text-sky-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.sectors.b2bSub}</p>
              </div>

              <div 
                onClick={() => setCurrentPage('b2c')}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-amber-600">
                    {t.sectors.b2cTitle}
                  </span>
                  {isAr ? <ArrowLeft className="w-4 h-4 text-amber-600" /> : <ArrowRight className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.sectors.b2cSub}</p>
              </div>

              <div 
                onClick={() => setCurrentPage('medical')}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-600">
                    {t.sectors.medTitle}
                  </span>
                  {isAr ? <ArrowLeft className="w-4 h-4 text-emerald-600" /> : <ArrowRight className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.sectors.medSub}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-10 space-y-2">
          <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            {content.valuesTitle}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAr ? 'المعايير التي تميز شراكتنا عن غيرنا' : 'Principles That Define Our Long-Term Partnerships'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-start">
          {content.values.map((v, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                0{idx + 1}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {v.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Team Leadership Section */}
      <OurTeamSection />

      {/* Final Action CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'دعنا نبني قصة النجاح القادمة معاً' : 'Let Us Engineer Your Next Growth Chapter'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            {isAr ? 'احجز استشارة مجانية مع الفريق المتخصص في قطاعك لنراجع أهدافك ونقدم لك رؤية عملية.' : 'Book a strategy session with your sector team to evaluate your goals and unlock real growth.'}
          </p>
          <button
            onClick={() => setIsConsultationOpen(true)}
            className="px-8 py-4 text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors cursor-pointer shadow-lg"
          >
            {t.nav.bookCall}
          </button>
        </div>
      </section>
    </div>
  );
};
