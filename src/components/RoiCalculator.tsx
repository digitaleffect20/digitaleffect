import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType } from '../types';
import { Calculator, Sparkles, ArrowLeft, ArrowRight, Building2, ShoppingBag, Stethoscope } from 'lucide-react';

export const RoiCalculator: React.FC = () => {
  const { language, t, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';
  const [calcSector, setCalcSector] = useState<'b2b' | 'b2c' | 'medical'>('b2b');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(30000);

  // Projections calculations
  const getProjections = () => {
    switch (calcSector) {
      case 'b2b': {
        const estimatedQualifiedLeads = Math.round(monthlyBudget / 480);
        const estimatedClosedDeals = Math.max(1, Math.round(estimatedQualifiedLeads * 0.12));
        const estimatedPipelineValue = (estimatedClosedDeals * 180000).toLocaleString(isAr ? 'ar-EG' : 'en-US');
        return {
          metric1: isAr ? `${estimatedQualifiedLeads} جهة مؤهلة` : `${estimatedQualifiedLeads} Qualified Deals`,
          label1: isAr ? 'استفسارات وطلبات عروض أسعار متوقعة' : 'Projected Inbound Executive RFPs',
          metric2: isAr ? `${estimatedClosedDeals} عقود سنوية` : `${estimatedClosedDeals} Closed Contracts`,
          label2: isAr ? 'عقود وتوريدات متوقعة خلال ربع سنوي' : 'Estimated Quarterly Closed Contracts',
          metric3: isAr ? `${estimatedPipelineValue} ج.م` : `${estimatedPipelineValue} EGP`,
          label3: isAr ? 'قيمة خط التعاقدات التقديري' : 'Estimated Total Pipeline Value',
          advice: isAr
            ? 'في قطاع الـ B2B، صفقة واحدة كبرى تعوض استثمارك التسويقي بالكامل لعدة سنوات.'
            : 'In B2B enterprise, a single closed contract recoups your entire annual marketing retainer.',
          recommendedPackage: monthlyBudget < 25000
            ? (isAr ? 'باقة انطلاق الشركات' : 'B2B Launchpad')
            : (isAr ? 'باقة خط التعاقدات والـ ABM' : 'B2B Pipeline Growth & ABM'),
        };
      }
      case 'b2c': {
        const estimatedRoas = monthlyBudget > 40000 ? '4.8X - 5.5X' : '3.8X - 4.5X';
        const estimatedOrders = Math.round((monthlyBudget * 3.8) / 650);
        const estimatedRevenue = (monthlyBudget * 4.2).toLocaleString(isAr ? 'ar-EG' : 'en-US');
        return {
          metric1: isAr ? `${estimatedOrders.toLocaleString('ar-EG')} طلب` : `${estimatedOrders.toLocaleString('en-US')} Orders`,
          label1: isAr ? 'طلبات بيع متوقعة شهرياً' : 'Projected Monthly Completed Orders',
          metric2: estimatedRoas,
          label2: isAr ? 'متوسط العائد الإعلاني المستهدف (ROAS)' : 'Target Sustained Blended ROAS',
          metric3: isAr ? `${estimatedRevenue} ج.م` : `${estimatedRevenue} EGP`,
          label3: isAr ? 'عائد المبيعات الإجمالية التقديري' : 'Estimated Gross Store Revenue',
          advice: isAr
            ? 'مع إعلانات الـ UGC التفاعلية وتحسين صفحة الدفع يتضاعف معدل تكرار الشراء.'
            : 'Combining viral UGC creatives with checkout CRO multiplies customer lifetime value.',
          recommendedPackage: monthlyBudget < 25000
            ? (isAr ? 'باقة انطلاق المتجر' : 'E-Com Starter')
            : (isAr ? 'باقة تسريع المبيعات والانتشار' : 'E-Com Hyper-Growth Scaler'),
        };
      }
      case 'medical': {
        const estimatedBookings = Math.round(monthlyBudget / 160);
        const surgeryConsultations = Math.round(estimatedBookings * 0.25);
        return {
          metric1: isAr ? `${estimatedBookings.toLocaleString('ar-EG')} حجز` : `${estimatedBookings.toLocaleString('en-US')} Bookings`,
          label1: isAr ? 'مرضى ومواعيد كشوفات مؤكدة شهرياً' : 'Confirmed In-Clinic Appointments / Month',
          metric2: isAr ? `${surgeryConsultations} استشارة جراحية` : `${surgeryConsultations} High-Value Surgeries`,
          label2: isAr ? 'حالات علاجية متقدمة (زراعة/جراحة/ليزر)' : 'Specialized Procedures (Implants/Laser/Surgery)',
          metric3: isAr ? '#1 خرائط جوجل' : '#1 Google Maps',
          label3: isAr ? 'الوصول للمرتبة الأولى جغرافياً في منطقتك' : 'Local Geographic Map Pack Dominance',
          advice: isAr
            ? 'السمعة الطبية وخرائط جوجل تجعل المريض يختار عيادتك دون تردد في الأسعار.'
            : 'Medical prestige and local map presence make patients choose your clinic without price hesitation.',
          recommendedPackage: monthlyBudget < 25000
            ? (isAr ? 'باقة نمو العيادة التخصصية' : 'Clinic Patient Engine')
            : (isAr ? 'باقة المركز الطبي ومجمعات الجراحة' : 'Medical Center Growth'),
        };
      }
    }
  };

  const projections = getProjections();

  return (
    <section id="calculator" className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-start">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            {/* Controller Left/Right */}
            <div className="lg:w-1/2 space-y-6 w-full">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                <Calculator className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.home.calculatorTitle}</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {isAr ? 'احسب أثر ميزانيتك التسويقية بدقة' : 'Model Your Projected Growth ROI'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  {t.home.calculatorDesc}
                </p>
              </div>

              {/* Sector selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? '١. حدد قطاع نشاطك التجاري:' : '1. Select Your Target Business Sector:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCalcSector('b2b')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      calcSector === 'b2b'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>B2B</span>
                  </button>

                  <button
                    onClick={() => setCalcSector('b2c')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      calcSector === 'b2c'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>B2C</span>
                  </button>

                  <button
                    onClick={() => setCalcSector('medical')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      calcSector === 'medical'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Medical</span>
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">
                    {isAr ? '٢. الميزانية التسويقية والإعلانية الشهرية المقترحة:' : '2. Estimated Monthly Marketing Media Spend:'}
                  </span>
                  <span className="text-sky-600 text-sm font-black tabular-nums bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">
                    {monthlyBudget.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <input
                  type="range"
                  min="15000"
                  max="150000"
                  step="5000"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-semibold tabular-nums">
                  <span>١٥,٠٠٠ {isAr ? 'ج.م' : 'EGP'}</span>
                  <span>٧٥,٠٠٠ {isAr ? 'ج.م' : 'EGP'}</span>
                  <span>١٥٠,٠٠٠+ {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>

              {/* Advice */}
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-slate-700 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>{projections.advice}</span>
              </div>
            </div>

            {/* Projected Output Card */}
            <div className="lg:w-1/2 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                  {isAr ? 'النتائج المعيارية المتوقعة (١٢ عاماً خبرة)' : 'Empirical Projections (12-Year Benchmarks)'}
                </div>
                <h4 className="text-lg font-bold text-white">
                  {isAr ? 'العائد الاستثماري المتوقع لمشروعك' : 'Estimated Growth Output'}
                </h4>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{projections.label1}</span>
                  <span className="text-xl font-black text-sky-300 tabular-nums">{projections.metric1}</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{projections.label2}</span>
                  <span className="text-xl font-black text-sky-300 tabular-nums">{projections.metric2}</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{projections.label3}</span>
                  <span className="text-xl font-black text-emerald-300 tabular-nums">{projections.metric3}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{isAr ? 'الباقة المقترحة:' : 'Recommended Plan:'}</span>
                  <span className="font-bold text-sky-300 bg-sky-900/60 px-2.5 py-1 rounded-md border border-sky-400/20">
                    {projections.recommendedPackage}
                  </span>
                </div>

                <button
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isAr ? 'مناقشة هذا النموذج الاستثماري مع مستشارنا' : 'Discuss This Growth Model With Us'}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
