import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { Award, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export const StatsRibbon: React.FC = () => {
  const { language } = useAgencyData();
  const isAr = language === 'ar';

  const stats = [
    {
      icon: <Award className="w-5 h-5 text-sky-600" />,
      value: isAr ? '+١٢ عاماً' : '12+ Years',
      label: isAr ? 'عمر الوكالة في السوق' : 'Agency Operating Track Record',
      sub: isAr ? 'تأسست عام ٢٠١٤ وسجل حافل بالنجاحات' : 'Founded in 2014 with regional enterprise clients',
    },
    {
      icon: <Users className="w-5 h-5 text-sky-600" />,
      value: isAr ? '+٢٠ عاماً' : '20+ Years',
      label: isAr ? 'خبرة قيادات الفريق الرقمي' : 'Team Leadership Expertise',
      sub: isAr ? 'استراتيجيات مجربة في أعتى الأزمات والتقلبات' : 'Tested battle-ready digital strategies',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
      value: isAr ? '٨٥M+ ج.م' : '85M+ EGP',
      label: isAr ? 'مبيعات وصفقات تم تحقيقها للعملاء' : 'Client Revenue & Pipeline Generated',
      sub: isAr ? 'في قطاعات B2B و B2C والمراكز الطبية' : 'Across B2B, B2C, and Healthcare practices',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-sky-600" />,
      value: '٩٤%',
      label: isAr ? 'معدل تجديد التعاقدات السنوية' : 'Annual Client Retention Rate',
      sub: isAr ? 'شراكات طويلة الأمد مبنية على النتائج' : 'Enduring relationships rooted in measurable ROI',
    },
  ];

  return (
    <section className="bg-white border-y border-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col text-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 shrink-0">
                  {stat.icon}
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  {stat.value}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {stat.label}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
