import React from 'react';
import { ShieldCheck, Award, Target, Users, Zap, CheckCircle2 } from 'lucide-react';

export const AboutAgencySection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Right Column: Visual Credentials & Experience Stamp */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 relative z-10 text-right">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  <span>تاريخ عريق وثقة متوارثة</span>
                </div>

                <div className="space-y-2">
                  <div className="text-4xl sm:text-5xl font-black text-sky-400 tabular-nums">
                    +١٢ عاماً
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    من التميز وصناعة الأثر الرقمي المستدام
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    منذ انطلاقتنا، شهدنا تحولات كبرى في خوارزميات المنصات وسلوك المستهلكين وصناع القرار؛ وتجاوز فريقنا بخبرة تفوق ٢٠ عاماً كل مرحلة بنجاح واستقرار.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>فريق عمل متخصص لكل قطاع على حدة</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>شفافية كاملة في الحسابات الإعلانية دون عمولات خفية</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تقارير تحليلات لحظية تترجم الإنفاق إلى عائد حقيقي</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: The 3 Specialized Pillars (B2B, B2C, Medical) */}
          <div className="lg:col-span-7 space-y-8 text-right">
            <div className="space-y-3">
              <div className="text-xs font-bold text-sky-600 tracking-wider">
                منهجية العمل المتخصصة
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                لماذا لا نؤمن بالحلول التسويقية الجاهزة أو الموحدة؟
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                الخطأ الأكبر الذي تقع فيه الوكالات العامة هو معاملة مصنع معدات ثقيلة (B2B) بنفس طريقة متجر عطور (B2C) أو عيادة جراحة أسنان (Medical). في «ديجيتال إفكت» قسّمنا وكالتنا إلى وحدات متخصصة تفهم كيمياء كل قطاع:
              </p>
            </div>

            <div className="space-y-4">
              {/* Pillar 1: B2B */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 font-bold shrink-0">
                    B2B
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      وحدة الشركات والمؤسسات الصناعية والتقنية
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      نركز على استهداف صناع القرار، تقليص فترات إغلاق الصفقات، كتابة المحتوى الفني، وأتمتة مسارات التأهيل (Lead Qualification) التي تساند فريق مبيعاتك مباشرة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 2: B2C */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold shrink-0">
                    B2C
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      وحدة التجارة الإلكترونية والمنتجات الاستهلاكية
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      سرعة في إنتاج مقاطع المحتوى الفيروسي UGC، استراتيجيات متطورة للمزايدة الإعلانية، واستهداف دقيق يحقق أعلى عائد على الإنفاق الإعلاني (ROAS) ويخفض معدل ارتداد سلة الشراء.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Medical */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold shrink-0">
                    Medical
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      وحدة التسويق الطبي والرعاية الصحية
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      فريق مدرب على أخلاقيات التسويق الطبي؛ نبني حضور الطبيب الاستشاري كمرجعية موثوقة، ونضمن تصدر المركز لخرائط جوجل ومحركات البحث، مع ربط مباشر بحجوزات الاستقبال.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
