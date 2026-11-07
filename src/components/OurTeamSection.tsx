import React, { useState } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { 
  Users, 
  Linkedin, 
  Mail, 
  MessageSquare, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  Palette, 
  TrendingUp, 
  Video,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  category: 'executive' | 'b2b' | 'medical' | 'b2c' | 'creative';
  badge: string;
  badgeEn: string;
  badgeColor: string;
  experience: string;
  experienceEn: string;
  bio: string;
  bioEn: string;
  skills: string[];
  skillsEn: string[];
  image: string;
  linkedin: string;
  email: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-ceo',
    name: 'م. طارق العوضي',
    nameEn: 'Eng. Tarek El-Awady',
    role: 'الرئيس التنفيذي والمؤسس الشريك',
    roleEn: 'Chief Executive Officer & Co-Founder',
    category: 'executive',
    badge: 'القيادة التنفيذية والاستراتيجية',
    badgeEn: 'Executive Strategy',
    badgeColor: 'bg-slate-900 text-white border-slate-700',
    experience: '٢٠+ عاماً خبرة',
    experienceEn: '20+ Yrs Experience',
    bio: 'خبير استراتيجيات النمو والتحول الرقمي؛ قاد نمو وتطوير أكثر من ٢٥٠ مؤسسة صناعية، طبية، وتجارية كبرى في مصر والشرق الأوسط على مدار عقدين.',
    bioEn: 'Pioneered digital scaling funnels across the Middle East, orchestrating high-yield strategies for 250+ enterprise and healthcare brands.',
    skills: ['استراتيجيات النمو الرقمي', 'التوسع الإقليمي', 'حوكمة التحول الرقمي'],
    skillsEn: ['Growth Strategy', 'Regional Scale', 'Digital Transformation'],
    image: '/assets/team/team_ceo.jpg',
    linkedin: 'https://linkedin.com',
    email: 'ceo@digitaleffect.net',
  },
  {
    id: 'member-b2b',
    name: 'م. أحمد شكري',
    nameEn: 'Eng. Ahmed Shokry',
    role: 'رئيس وحدة التسويق الصناعي والشركات B2B',
    roleEn: 'Director of B2B & Industrial Marketing',
    category: 'b2b',
    badge: 'قطاع B2B Enterprise & ABM',
    badgeEn: 'B2B Enterprise & ABM',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    experience: '١٤+ عاماً خبرة',
    experienceEn: '14+ Yrs Experience',
    bio: 'متخصص في منهجيات التسويق المبني على الحسابات (ABM) لفتح قنوات التصدير وتوليد خطوط تعاقدات مستدامة للمصانع وشركات المعدات الثقيلة.',
    bioEn: 'Account-Based Marketing (ABM) specialist driving multi-million contract pipelines for heavy machinery manufacturers and industrial groups.',
    skills: ['Account-Based Marketing', 'إعلانات LinkedIn الموجهة', 'تأهيل صفقات التصدير'],
    skillsEn: ['ABM Frameworks', 'Executive LinkedIn Ads', 'Industrial Export Pipelines'],
    image: '/assets/team/team_b2b_director.jpg',
    linkedin: 'https://linkedin.com',
    email: 'b2b@digitaleffect.net',
  },
  {
    id: 'member-med',
    name: 'د. ياسمين الخطيب',
    nameEn: 'Dr. Yasmine El-Khatib',
    role: 'مديرة وحدة التسويق الطبي والرعاية الصحية',
    roleEn: 'Head of Healthcare & Medical Division',
    category: 'medical',
    badge: 'القطاع الطبي Medical',
    badgeEn: 'Medical & Healthcare',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    experience: '١٢+ عاماً خبرة',
    experienceEn: '12+ Yrs Experience',
    bio: 'تجمع بين الخلفية الطبية والخبرة التسويقية الأخلاقية؛ قادت منظومة تحويل المشاهدات إلى حجوزات عيادة لمراكز العلاج الطبيعي والمستشفيات المتخصصة.',
    bioEn: 'Unites healthcare clinical knowledge with patient conversion funnels, scaling leading physiotherapy and specialty medical centers.',
    skills: ['التسويق الطبي الأخلاقي', 'مسارات حجز المرضى', 'سيو الخرائط الطبية'],
    skillsEn: ['Ethical Healthcare Ads', 'Patient Booking Funnels', 'Clinical Local SEO'],
    image: '/assets/team/team_medical_director.jpg',
    linkedin: 'https://linkedin.com',
    email: 'medical@digitaleffect.net',
  },
  {
    id: 'member-creative',
    name: 'كريم منصور',
    nameEn: 'Karim Mansour',
    role: 'المدير الإبداعي والهوية البصرية',
    roleEn: 'Creative Director & Brand Architect',
    category: 'creative',
    badge: 'الإبداع والهوية البصرية',
    badgeEn: 'Creative & Branding',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    experience: '١٣+ عاماً خبرة',
    experienceEn: '13+ Yrs Experience',
    bio: 'مهندس الهويات البصرية والحملات الإعلانية المبتكرة؛ طور مفاهيم العلامات التجارية لبينجوين وسيلتال وكونكريت وفق أعلى المعايير الجمالية العالمية.',
    bioEn: 'Mastermind of high-impact brand identities and art direction for brands including Penguin, Siltal, and Concrete.',
    skills: ['الهوية البصرية المتكاملة', 'إخراج الحملات الموسمية', 'تصميم واجهات الويب'],
    skillsEn: ['Brand Architecture', 'Seasonal Campaign Art', 'High-Converting UI/UX'],
    image: '/assets/team/team_creative_director.jpg',
    linkedin: 'https://linkedin.com',
    email: 'creative@digitaleffect.net',
  },
  {
    id: 'member-b2c',
    name: 'سارة السيد',
    nameEn: 'Sarah El-Sayed',
    role: 'رئيسة قسم الحملات الممولة ونمو المتاجر',
    roleEn: 'Head of Performance Media & E-Commerce',
    category: 'b2c',
    badge: 'قطاع التجارة والتجزئة B2C',
    badgeEn: 'B2C & Retail Growth',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    experience: '١٠+ أعوام خبرة',
    experienceEn: '10+ Yrs Experience',
    bio: 'أدارت ميزانيات إعلانية بملايين الجنيهات بعائد إعلاني متوسط 4.8X ROAS، متخصصة في مسارات التجارة الإلكترونية وخفض تكلفة اكتساب العميل CAC.',
    bioEn: 'Managed large-scale ad spend with a consistent 4.8X ROAS on Meta and TikTok, optimizing checkout conversion for consumer brands.',
    skills: ['Meta Advantage+', 'إعلانات TikTok و Google', 'تحسين معدل التحويل CRO'],
    skillsEn: ['Meta Advantage+ Scaling', 'TikTok & Google Ads', 'E-Com CRO Optimization'],
    image: '/assets/team/team_performance_head.jpg',
    linkedin: 'https://linkedin.com',
    email: 'performance@digitaleffect.net',
  },
  {
    id: 'member-motion',
    name: 'عمر حسن',
    nameEn: 'Omar Hassan',
    role: 'مدير إنتاج الفيديو والموشن جرافيك',
    roleEn: 'Head of Motion Graphics & Video Production',
    category: 'creative',
    badge: 'إنتاج الفيديو والموشن',
    badgeEn: 'Motion & Video Production',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    experience: '٩+ أعوام خبرة',
    experienceEn: '9+ Yrs Experience',
    bio: 'مخرج ومنتج مقاطع الفيديو الإعلانية والريلز ثلاثية الأبعاد؛ أنتج أكثر من ٥٠٠ فيديو تجاري حقق ملايين المشاهدات للأجهزة المنزلية والخدمات التخصصية.',
    bioEn: 'Director of high-converting commercial reels and 3D product motion graphics, generating millions of views across consumer campaigns.',
    skills: ['فيديوهات الريلز الإعلانية', 'موشن جرافيك 3D', 'إخراج الإعلانات التجارية'],
    skillsEn: ['Viral Video Reels', '3D Motion Design', 'Commercial Directing'],
    image: '/assets/team/team_motion_director.jpg',
    linkedin: 'https://linkedin.com',
    email: 'motion@digitaleffect.net',
  },
];

export const OurTeamSection: React.FC = () => {
  const { language, setIsConsultationOpen } = useAgencyData();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'all' | 'executive' | 'b2b' | 'medical' | 'b2c' | 'creative'>('all');

  const filteredMembers = activeTab === 'all' 
    ? TEAM_MEMBERS 
    : TEAM_MEMBERS.filter(m => m.category === activeTab);

  const categories = [
    { id: 'all' as const, label: isAr ? 'كافة القيادات' : 'All Leadership', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'executive' as const, label: isAr ? 'الإدارة والاستراتيجية' : 'Executive Leadership', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'b2b' as const, label: 'B2B Enterprise', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'medical' as const, label: 'Medical Healthcare', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'b2c' as const, label: 'B2C E-Commerce', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'creative' as const, label: isAr ? 'الإبداع والإنتاج' : 'Creative & Motion', icon: <Palette className="w-3.5 h-3.5" /> },
  ];

  return (
    <section id="our-team" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading & Category Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-start">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? 'فريق العمل والقيادات المتخصصة' : 'Our Specialized Leadership Team'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {isAr ? 'عقول خبيرة تقود كل قطاع بحرفية وتفرغ كامل' : 'Domain Experts Leading Each Business Sector with Complete Dedication'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {isAr
                ? 'لا نعتمد على كوادر عامة تشتت تركيزها بين كافة المجالات؛ بل يقود كل قسم استشاريون وخبراء متمرسون حققوا نتائج ملموسة ومثبتة في ذات التخصص.'
                : 'We reject generic generalists. Each division is spearheaded by veteran sector directors with proven industry track records in their respective fields.'}
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/90 overflow-x-auto max-w-full shrink-0 shadow-2xs">
            {categories.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TEAM GRID WITH SOPHISTICATED HOVER ANIMATIONS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map((member) => {
            const memberName = isAr ? member.name : member.nameEn;
            const memberRole = isAr ? member.role : member.roleEn;
            const memberBadge = isAr ? member.badge : member.badgeEn;
            const memberExp = isAr ? member.experience : member.experienceEn;
            const memberBio = isAr ? member.bio : member.bioEn;
            const memberSkills = isAr ? member.skills : member.skillsEn;

            return (
              <div
                key={member.id}
                className="group relative bg-white rounded-[28px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-sky-300 transition-all duration-500 overflow-hidden flex flex-col justify-between text-start hover:-translate-y-2"
              >
                {/* Image Container with Dynamic Zoom & Hover Overlay */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900 select-none">
                  <img
                    src={member.image}
                    alt={memberName}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108 group-hover:brightness-95"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent transition-opacity duration-300" />

                  {/* Floating Top Badges */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-md backdrop-blur-md ${member.badgeColor}`}>
                      {memberBadge}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-950/80 text-white backdrop-blur-md border border-white/20">
                      {memberExp}
                    </span>
                  </div>

                  {/* Slide-Up Interactive Drawer on Hover */}
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6 text-white z-20">
                    <div className="space-y-3 pt-6">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'نبذة عن الخبرة القيادية' : 'Leadership Background'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        "{memberBio}"
                      </p>
                    </div>

                    {/* Key Competencies Strip */}
                    <div className="space-y-4 pb-2">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {isAr ? 'أبرز المهارات المتخصصة:' : 'Core Competencies:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {memberSkills.map((skill, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-sky-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact & Social Links in Hover Drawer */}
                      <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/10 hover:bg-sky-500 hover:text-white transition-colors text-slate-200"
                            title="LinkedIn Profile"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 rounded-xl bg-white/10 hover:bg-sky-500 hover:text-white transition-colors text-slate-200"
                            title="Email Direct"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsConsultationOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          <span>{isAr ? 'طلب جلسة عمل' : 'Consult Leader'}</span>
                          {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Static Name Bar on Image when not hovering */}
                  <div className="absolute bottom-4 inset-x-5 text-white transition-opacity duration-300 group-hover:opacity-0 z-10">
                    <h3 className="text-xl font-black drop-shadow-md text-white">
                      {memberName}
                    </h3>
                    <p className="text-xs font-semibold text-sky-300 drop-shadow-sm mt-0.5">
                      {memberRole}
                    </p>
                  </div>
                </div>

                {/* Bottom Body Card Details (Visible below image) */}
                <div className="p-5 sm:p-6 space-y-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                        {memberName}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-500">
                        {memberExp}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {memberRole}
                    </p>
                  </div>

                  {/* Skills Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {memberSkills.slice(0, 2).map((s, idx) => (
                      <span 
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                    {memberSkills.length > 2 && (
                      <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-50 text-slate-500">
                        +{memberSkills.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                    <span className="group-hover:underline">
                      {isAr ? 'عرض النبذة والخبرات التخصصية' : 'View Profile & Track Record'}
                    </span>
                    {isAr ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner on Team Culture & Methodology */}
        <div className="p-6 sm:p-8 bg-slate-50 rounded-3xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-6 text-start">
          <div className="space-y-1 max-w-2xl">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'هل تود عقد جلسة استراتيجية مع قائد قطاعك مباشرة؟' : 'Would You Like a Strategy Session with Your Sector Director?'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              {isAr
                ? 'فريقنا متاح لدراسة وضع نشاطك الحالي، تحليل المنافسين، وصياغة خطة عمل مدعومة بالأرقام الواقعية.'
                : 'Our sector heads are available to audit your existing digital footprint and design a concrete growth roadmap.'}
            </p>
          </div>

          <button
            onClick={() => setIsConsultationOpen(true)}
            className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            {isAr ? 'حجز جلسة استشارية مع قائد القطاع' : 'Schedule Executive Session'}
          </button>
        </div>
      </div>
    </section>
  );
};
