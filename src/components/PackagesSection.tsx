import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType } from '../types';
import { HighlightedPackageCard } from './HighlightedPackageCard';
import { 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  Tag, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

export const PackagesSection: React.FC = () => {
  const { data, activeSector, language, t, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';
  
  // Local sector tab for packages (defaults to activeSector if not 'all', otherwise 'b2c')
  const [packageSectorTab, setPackageSectorTab] = useState<Exclude<SectorType, 'all'>>(
    activeSector !== 'all' ? activeSector : 'b2c'
  );

  React.useEffect(() => {
    if (activeSector !== 'all') {
      setPackageSectorTab(activeSector);
    }
  }, [activeSector]);

  const currentPackages = data.packages.filter((pkg) => pkg.sector === packageSectorTab);

  const sectorTabs: Array<{ id: Exclude<SectorType, 'all'>; label: string; icon: React.ReactNode; subtitle: string }> = [
    {
      id: 'b2c',
      label: isAr ? 'باقات قطاع المستهلكين (B2C)' : 'B2C Packages',
      subtitle: isAr ? 'Active · Interact · Engage · Advance' : 'Active · Interact · Engage · Advance',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: 'b2b',
      label: isAr ? 'باقة قطاع الشركات (B2B)' : 'B2B Package',
      subtitle: isAr ? 'باقة Active المعتمدة' : 'Official Active Plan',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'medical',
      label: isAr ? 'باقات القطاع الطبي (Medical)' : 'Medical Packages',
      subtitle: isAr ? 'Presence · Growth · Authority' : 'Presence · Growth · Authority',
      icon: <Stethoscope className="w-4 h-4" />,
    },
  ];

  const gridColsClass = packageSectorTab === 'b2c'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    : (packageSectorTab === 'medical' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto');

  return (
    <section id="packages" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'الباقات والأسعار الرسمية المعتمدة' : 'Official Digital Effect Pricing'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'باقات خدمات ديجيتال إفكت' : 'Our Official Service Packages'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isAr 
              ? 'مواصفات دقيقة ومخرجات محددة بالمنشورات والريلز مع خيارات دفع شهرية وربع سنوية.'
              : 'Exact deliverable breakdowns by posts, AI reels, and stories with monthly and quarterly options.'}
          </p>
        </div>

        {/* Sector Tabs Bar */}
        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 max-w-2xl w-full">
            {sectorTabs.map((tab) => {
              const isActive = packageSectorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPackageSectorTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-200/60 font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  <span className={`text-[11px] mt-0.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`}>
                    {tab.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing & Packages Grid */}
        <div className={`grid ${gridColsClass} gap-6 sm:gap-8 items-stretch`}>
          {currentPackages.map((pkg) => (
            <HighlightedPackageCard key={pkg.id} pkg={pkg} />
          ))}

          {/* If B2B has 1 package, render an Enterprise Custom quote card side-by-side */}
          {packageSectorTab === 'b2b' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-start border border-slate-700 shadow-xl">
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-lg border border-sky-400/30 w-fit">
                  {isAr ? 'الشركات والمصانع الكبرى' : 'Enterprise & Custom Scope'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isAr ? 'باقة مخصصة للشركات الكبرى' : 'Custom Enterprise Retainer'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'للشركات والمصانع التي تحتاج إلى استراتيجيات تسويق مبني على الحسابات (ABM)، إنتاج أوراق عمل تقنية، أو تغطيات فيديو ميدانية بمعدل مكثف.'
                    : 'For industrial manufacturers and enterprises requiring intensive ABM, technical whitepapers, or corporate video shoots.'}
                </p>
                <div className="py-3 border-y border-white/10 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-white">{isAr ? 'تتضمن بحسب الطلب:' : 'Available upon request:'}</div>
                  <div>• {isAr ? 'حملات LinkedIn متقدمة لاستهداف صناع القرار' : 'Executive LinkedIn outreach campaigns'}</div>
                  <div>• {isAr ? 'ربط وأتمتة الـ CRM وتأهيل الـ Leads' : 'CRM integration & lead pre-qualification'}</div>
                  <div>• {isAr ? 'تسويق التصدير للأسواق الإقليمية والدولية' : 'Regional export marketing strategies'}</div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer text-center"
                >
                  {isAr ? 'طلب عرض سعر مخصص للشركات' : 'Request Custom Enterprise Quote'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Package Callout */}
        <div className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-200 text-start flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-sky-600 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {isAr ? 'هل تحتاج إلى باقة مخصصة تجمع بين خدمات إضافية؟' : 'Need a custom scope tailored to your operational volume?'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? 'يمكننا تخصيص عدد المنشورات والريلز وإضافة تصوير ميداني أو إعلانات ممولة بحسب حجم مشروعك.'
                  : 'We can customize exact quantities of posts, reels, video shoots, and paid ad management for your scale.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConsultationOpen(true)}
            className="px-5 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-300 shadow-sm whitespace-nowrap cursor-pointer shrink-0"
          >
            {t.common.requestQuote}
          </button>
        </div>
      </div>
    </section>
  );
};
