import React from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { Phone, Mail, MapPin, MessageSquare, Settings, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, language, t, setCurrentPage, setIsAdminOpen, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';
  const info = data.agencyInfo;
  const f = t.footer;

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Agency Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Digital-effect-logo_d13b47e3.png"
                alt="Digital Effect"
                className="h-10 w-auto object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {f.desc}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${info.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t.common.whatsAppChat}</span>
              </a>

              <button
                onClick={() => setIsConsultationOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <span>{t.nav.bookCall}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Col 3: Dedicated Standalone Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
              {f.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => setCurrentPage('b2b')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.b2b}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('b2c')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.b2c}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('medical')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.medical}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('case-studies')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.caseStudies}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.about}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Solutions & Retainers */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
              {f.packagesLinks}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => setCurrentPage('b2b')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'باقات خط التعاقدات (B2B ABM)' : 'B2B Pipeline Retainers'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('b2c')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'باقات تسريع مبيعات المتاجر' : 'E-Com Hyper-Growth Plans'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('medical')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'باقات نمو المراكز والعيادات' : 'Healthcare Clinic Growth Plans'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'حاسبة العائد الاستثماري' : 'ROI & Growth Calculator'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
              {f.contactTitle}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <a href={`mailto:${info.email}`} className="hover:text-white transition-colors font-mono">
                  {info.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-mono tabular-nums">{info.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>{isAr ? info.address : info.addressEn}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="text-xs text-slate-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{t.nav.adminCms}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {f.copyright}
          </div>
          <div className="flex items-center gap-4">
            <span>B2B · B2C · Medical</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'دخول الإدارة' : 'Admin Login'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
