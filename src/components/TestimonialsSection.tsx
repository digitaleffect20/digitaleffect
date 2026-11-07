import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { SectorType, Testimonial } from '../types';
import { 
  Quote, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  Layers, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-ipt',
    client: 'مركز IPT للعلاج الطبيعي والتأهيل الحركي',
    clientEn: 'IPT Physiotherapy & Movement Rehab Center',
    author: 'د. أسامة الشافعي',
    authorEn: 'Dr. Osama El-Shafei',
    role: 'المدير التنفيذي واستشاري العلاج الطبيعي',
    roleEn: 'Executive Director & Consultant Physiotherapist',
    text: 'النتائج مع ديجيتال إفكت تخطت كل توقعاتنا؛ تحولنا من مجرد صفحة هادئة إلى مركز طبي إقليمي يثق به الآلاف، وأصبح جدول المواعيد والعيادات ممتلئاً بفضل الحملات الاحترافية والتصاميم الطبية التوعوية الموثوقة.',
    textEn: 'The results with Digital Effect exceeded all benchmarks. We transformed from a quiet page into a trusted regional physiotherapy center with fully booked appointment schedules thanks to high-converting clinical reels.',
    sector: 'medical',
    rating: 5,
    metricResult: '+43,576% نمو التفاعل الإجمالي',
    metricResultEn: '+43,576% Total Engagement Growth',
    logoUrl: '/assets/ipt/ipt_logo.png',
    projectUrl: 'ipt-case-study',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'test-penguin',
    client: 'شركة بينجوين للأجهزة المنزلية والتبريد',
    clientEn: 'Penguin Home Appliances & Refrigeration',
    author: 'أ. سامح الغندور',
    authorEn: 'Sameh El-Ghandour',
    role: 'مدير عام التسويق والتطوير التجاري',
    roleEn: 'VP of Marketing & Commercial Development',
    text: 'التحول الذي أحدثته ديجيتال إفكت في هوية وصفحات بينجوين كان مبهراً؛ نقلوا تصاميمنا ومقاطع الفيديو إلى مستوى عالمي يضاهي أكبر العلامات الإيطالية، وتضاعفت مبيعات التجزئة والتقسيط في المعارض بشكل غير مسبوق.',
    textEn: 'The brand transformation Digital Effect achieved for Penguin was remarkable. They elevated our creatives and motion reels to European standards, doubling retail showroom volume and installment sales.',
    sector: 'b2c',
    rating: 5,
    metricResult: '+310% نمو مبيعات التجزئة',
    metricResultEn: '+310% Retail Sales Surge',
    logoUrl: '/assets/penguin/penguin_logo.png',
    projectUrl: 'penguin-case-study',
    avatarBg: 'bg-sky-600',
  },
  {
    id: 'test-bsizia',
    client: 'جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)',
    clientEn: 'Beni Suef Industrial Zones Investors Association (BSIZIA)',
    author: 'م. محسن الجبالي',
    authorEn: 'Eng. Mohsen El-Gebali',
    role: 'أمين عام الجمعية ورئيس لجنة الترويج الصناعي',
    roleEn: 'Secretary General & Head of Industrial Promotion',
    text: 'ديجيتال إفكت نقلت الجمعية من الحضور الورقي الروتيني إلى منظومة صناعية رقمية متكاملة لربط المصانع، تمثيل المستثمرين، وترويج الفرص الاستثمارية أمام كبرى المجموعات الاقتصادية الإقليمية.',
    textEn: 'Digital Effect elevated our association from routine bureaucratic presence into an authoritative industrial digital ecosystem, connecting plant owners and attracting regional industrial conglomerates.',
    sector: 'b2b',
    rating: 5,
    metricResult: 'تمثيل ٦ مناطق صناعية وجذب استثمارات',
    metricResultEn: '6 Industrial Zones Unified & Promoted',
    logoUrl: '/assets/bsizia/bsizia_img_1.png',
    projectUrl: 'bsizia-case-study',
    avatarBg: 'bg-blue-700',
  },
  {
    id: 'test-binaryracks',
    client: 'شركة باينري راكس للاستضافة السحابية',
    clientEn: 'Binaryracks Cloud Infrastructure & Web Hosting',
    author: 'فريق العمليات وتجربة العملاء',
    authorEn: 'Operations & Customer Experience Team',
    role: 'إدارة البنية السحابية والمبيعات',
    roleEn: 'Cloud Infrastructure & Commercial Team',
    text: 'استطاعت ديجيتال إفكت صياغة عروض استضافة وسيرفرات سحابية جذبت آلاف أصحاب المتاجر والمواقع الرقمية الناشئة في مصر والعالم العربي، مع انخفاض بنسبة 42% في تكلفة الاستحواذ على المشترك (CAC).',
    textEn: 'Digital Effect architected high-converting cloud hosting funnels that acquired thousands of online stores and SaaS founders across MENA, slashing our customer acquisition cost by 42%.',
    sector: 'b2b',
    rating: 5,
    metricResult: '+280% اشتراكات سحابية شهرية',
    metricResultEn: '+280% Monthly Cloud Subscriptions',
    logoUrl: '/assets/binaryracks/binaryracks_img_1.png',
    projectUrl: 'binaryracks-case-study',
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 'test-gimoka',
    client: 'شركة قهوة جيموكا الإيطالية — مصر',
    clientEn: 'Gimoka Italian Coffee Egypt',
    author: 'أ. كارين فريد',
    authorEn: 'Karen Farid',
    role: 'مديرة العلامة التجارية للقهوة الإيطالية',
    roleEn: 'Brand Manager — Italian Coffee Division',
    text: 'حملات الفيديو ريلز الإبداعية والمحتوى الإيطالي الراقي صنعا مجتمعاً حقيقياً لعشاق الإسبريسو في مصر، وتضاعفت مبيعات كبسولات وماكينات القهوة على المتجر الإلكتروني ولدى سلاسل السوبرماركت.',
    textEn: 'Aesthetic lifestyle reels and authentic Italian coffee storytelling built a dedicated coffee community, doubling online capsule sales and supermarket retail velocity.',
    sector: 'b2c',
    rating: 5,
    metricResult: '4.8X عائد إعلاني مستدام (ROAS)',
    metricResultEn: '4.8X Sustained Ad Spend ROAS',
    logoUrl: '/assets/gimoka/gimoka_img_1.png',
    projectUrl: 'gimoka-case-study',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'test-siltal',
    client: 'شركة سيلتال للأجهزة المنزلية الإيطالية',
    clientEn: 'Siltal Italian Home Appliances',
    author: 'الإدارة التجارية والمبيعات',
    authorEn: 'Commercial Sales Directorate',
    role: 'سيلتال للأجهزة المنزلية والتبريد',
    roleEn: 'Siltal Consumer Cooling & Washers',
    text: 'أبرزت ديجيتال إفكت عراقة الهندسة الإيطالية لسيلتال أمام المنافسين الآسيويين بأسلوب عصري شجع آلاف الأسر والمقبلين على الزواج على اختيار ثلاجاتنا وغسالاتنا بثقة تامة.',
    textEn: 'Digital Effect highlighted Siltal certified Italian heritage against low-cost competition, restoring consumer confidence and driving family refrigeration retail orders.',
    sector: 'b2c',
    rating: 5,
    metricResult: '2.4M+ مشاهدات حملات وتوسيع الموزعين',
    metricResultEn: '2.4M+ Household Impressions',
    logoUrl: '/assets/siltal-social/siltal-social_img_1.png',
    projectUrl: 'siltal-case-study',
    avatarBg: 'bg-rose-600',
  },
  {
    id: 'test-passap',
    client: 'شركة باساب للأجهزة المنزلية والسخانات',
    clientEn: 'Passap Home Appliances & Water Heaters',
    author: 'إدارة التسويق وتطوير المنتجات',
    authorEn: 'Marketing & Product Strategy',
    role: 'سخانات وأجهزة باساب المنزلية',
    roleEn: 'Passap Water Heaters & Household Tech',
    text: 'حملات «دش ساخن في عز البرد» وتفعيل الخط الساخن 16898 حققت أرقاماً استثنائية لمبيعات سخانات الغاز والكهرباء في أشهر ذروة الشتاء، مع دعم كامل لشبكة مراكز الصيانة والموزعين.',
    textEn: 'Winter campaign positioning and hotline 16898 direct triage generated record gas and electric water heater orders across all governorates during peak seasonal cold.',
    sector: 'b2c',
    rating: 5,
    metricResult: '+360% نمو مبيعات سخانات الشتاء',
    metricResultEn: '+360% Peak Winter Heater Growth',
    logoUrl: '/assets/passap-2/passap-2_img_2.png',
    projectUrl: 'passap-case-study',
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'test-alwaad',
    client: 'شركة الوعد للسياحة والسفر',
    clientEn: 'AlWaad Travel & Tourism',
    author: 'إدارة التشغيل السياحي وحجوزات العمرة',
    authorEn: 'Tour Operations & Umrah Department',
    role: 'برامج العمرة والسياحة الخارجية',
    roleEn: 'Religious Tours & Leisure Operations',
    text: 'ديجيتال إفكت جعلت رحلات العمرة والبرامج الترفيهية للأسر كاملة العدد قبل مواعيد الإقلاع بأسابيع؛ مسار التحويل السريع إلى محادثات الواتساب كان الحل الأكثر كفاءة وسرعة على الإطلاق.',
    textEn: 'Digital Effect ensured our Umrah flights and leisure holiday departures were 100% booked weeks ahead of flight dates thanks to friction-free click-to-WhatsApp funnels.',
    sector: 'b2c',
    rating: 5,
    metricResult: '100% ملء مقاعد الأفواج السياحية',
    metricResultEn: '100% Fully Booked Departures',
    logoUrl: '/assets/alwaad-travel/alwaad-travel_img_1.png',
    projectUrl: 'alwaad-case-study',
    avatarBg: 'bg-teal-600',
  },
  {
    id: 'test-memar-lashin',
    client: 'شركة معمار لاشين للتطوير العقاري',
    clientEn: 'Memar Lashin Real Estate Development',
    author: 'القطاع التجاري والمبيعات',
    authorEn: 'Commercial & Sales Directorate',
    role: 'معمار لاشين للتطوير العقاري',
    roleEn: 'Memar Lashin Real Estate Development',
    text: 'الحملات التي نفذتها ديجيتال إفكت جعلت مشروعاتنا السكنية كاملة الحجز في وقت قياسي وبأعلى كفاءة تسويقية شهدناها، مع تدفق مشترين جادين يبحثون عن الجودة الحقيقية.',
    textEn: 'Digital Effect campaigns fully booked out our residential units in record time with unmatched cost per acquisition and pre-qualified buyers who appreciate true luxury.',
    sector: 'b2c',
    rating: 5,
    metricResult: '140M+ جنيه مبيعات سكنية محققة',
    metricResultEn: '140M+ EGP Confirmed Residential Sales',
    logoUrl: '/assets/memar-lashin/memar-lashin_img_1.png',
    projectUrl: 'lashin-case-study',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'test-concrete',
    client: 'كونكريت للأزياء والملابس الرجالية',
    clientEn: 'Concrete Fashion & Menswear',
    author: 'إدارة العلامة التجارية والتسويق',
    authorEn: 'Brand & Marketing Directorate',
    role: 'كونكريت للأزياء والملابس الجاهزة',
    roleEn: 'Concrete Apparel & Fashion',
    text: 'ديجيتال إفكت جمعت بين الذوق الرفيع المطلوب في عالم الموضة والنتائج الرقمية القوية في المبيعات وزيارات الفروع، وهو ما نحتاجه تماماً لمواصلة تصدر سوق الأزياء الرجالية الفاخرة.',
    textEn: 'Digital Effect brilliantly merged premium fashion aesthetics with hardcore commercial performance and showroom footfall, maintaining our category leadership.',
    sector: 'b2c',
    rating: 5,
    metricResult: '5.4X عائد إعلاني و +240% مبيعات',
    metricResultEn: '5.4X Sustained ROAS & +240% Sales',
    logoUrl: '/assets/concrete/concrete_img_1.png',
    projectUrl: 'concrete-case-study',
    avatarBg: 'bg-stone-800',
  },
  {
    id: 'test-hamburg',
    client: 'شركة هامبورج للأجهزة المنزلية والإلكترونية',
    clientEn: 'Hamburg Home Appliances',
    author: 'إدارة المبيعات والتسويق',
    authorEn: 'Sales & Marketing Directorate',
    role: 'هامبورج للأجهزة المنزلية والبلت-إن',
    roleEn: 'Hamburg Built-in Kitchen Appliances',
    text: 'تصاميم ديجيتال إفكت جعلت أجهزة هامبورج تظهر بأعلى معايير الأناقة والعملية؛ استطعنا من خلال هذه الحملات إبراز جودة منتجاتنا البلت-إن وتضاعفت طلبات الموزعين وتجار الأجهزة في وقت قياسي.',
    textEn: 'Digital Effect visuals portrayed Hamburg appliances with ultimate modern elegance and practicality. Through these campaigns, our built-in range achieved unprecedented demand, doubling retail dealer orders nationwide.',
    sector: 'b2c',
    rating: 5,
    metricResult: '+260% نمو مبيعات البلت-إن و 4.9X ROAS',
    metricResultEn: '+260% Built-in Sales Growth & 4.9X ROAS',
    logoUrl: '/assets/hamburg-social/hamburg-social_img_1.png',
    projectUrl: 'hamburg-case-study',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'test-acton',
    client: 'شركة أكتون للأجهزة المنزلية والتبريد',
    clientEn: 'Acton Home Appliances & Refrigeration',
    author: 'إدارة المبيعات والتسويق',
    authorEn: 'Sales & Marketing Directorate',
    role: 'أكتون للأجهزة المنزلية والتبريد',
    roleEn: 'Acton Home Appliances & Refrigeration',
    text: 'حملات أكتون مع ديجيتال إفكت ساعدتنا في الوصول لآلاف المنازل وزيادة مبيعات أجهزة التبريد بصورة غير مسبوقة، وسرّعت دورة بيع المخزون في مواسم الذروة بفضل حلول التقسيط المبتكرة والتصاميم المتقنة.',
    textEn: 'Acton campaigns with Digital Effect scaled our household footprint and generated unprecedented cooling appliance orders, accelerating inventory turns through tailored installment campaigns and immaculate creative execution.',
    sector: 'b2c',
    rating: 5,
    metricResult: '+290% نمو مبيعات التجزئة و 14,200+ طلب تقسيط',
    metricResultEn: '+290% Retail Sales Growth & 14,200+ Financing Orders',
    logoUrl: '/assets/acton-2/acton-2_img_1.png',
    projectUrl: 'acton-case-study',
    avatarBg: 'bg-sky-600',
  },
  {
    id: 'test-yoken',
    client: 'شركة يوكين للأجهزة المنزلية والكهربائية',
    clientEn: 'Yoken Home Appliances',
    author: 'إدارة التسويق والتطوير',
    authorEn: 'Marketing & Development Directorate',
    role: 'يوكين للأجهزة المنزلية',
    roleEn: 'Yoken Home Appliances',
    text: 'فريق ديجيتال إفكت أحدث نقلة نوعية في تفاعل الجمهور مع منتجاتنا؛ تصاميمهم الاحترافية وإدارتهم للمسابقات وحملات التوعية جعلت علامة يوكين حاضرة بقوة أمام ملايين الأسر وتضاعف الطلب لدى الموزعين.',
    textEn: 'Digital Effect modernized how households engage with our appliances; their creative direction, giveaway activations, and warranty messaging elevated Yoken across retail shelves nationwide.',
    sector: 'b2c',
    rating: 5,
    metricResult: '+275% نمو مبيعات أجهزة المطبخ والغسيل',
    metricResultEn: '+275% Kitchen & Laundry Sales Growth',
    logoUrl: '/assets/yoken-2/yoken-2_img_1.png',
    projectUrl: 'yoken-case-study',
    avatarBg: 'bg-sky-600',
  },
];

export const TestimonialsSection: React.FC = () => {
  const { language, setCurrentPage, setSelectedCaseStudy, data } = useAgencyData();
  const isAr = language === 'ar';

  const [activeSector, setActiveSector] = useState<SectorType>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter testimonials by selected sector
  const filteredTestimonials = useMemo(() => {
    if (activeSector === 'all') return TESTIMONIALS_DATA;
    return TESTIMONIALS_DATA.filter((item) => item.sector === activeSector);
  }, [activeSector]);

  // Determine items per page based on responsive breakpoints
  // We compute total slides dynamically
  const totalSlides = filteredTestimonials.length;

  // Reset index when sector changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeSector]);

  // Autoplay handler
  useEffect(() => {
    if (isAutoplay && totalSlides > 1) {
      autoplayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 5500);
    }
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isAutoplay, totalSlides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isAr) {
      if (isLeftSwipe) handlePrev();
      if (isRightSwipe) handleNext();
    } else {
      if (isLeftSwipe) handleNext();
      if (isRightSwipe) handlePrev();
    }
  };

  const getSectorBadge = (sector: 'b2b' | 'b2c' | 'medical') => {
    switch (sector) {
      case 'b2b':
        return {
          label: isAr ? 'قطاع الشركات والمصانع (B2B)' : 'B2B Enterprise',
          badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
          icon: <Building2 className="w-3.5 h-3.5 text-sky-600" />,
        };
      case 'b2c':
        return {
          label: isAr ? 'قطاع التجزئة والتجارة (B2C)' : 'B2C Retail',
          badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
          icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'medical':
        return {
          label: isAr ? 'القطاع الطبي والرعاية الصحية' : 'Medical & Healthcare',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />,
        };
    }
  };

  const handleCardClick = (testimonial: Testimonial) => {
    if (testimonial.projectUrl) {
      if (testimonial.projectUrl === 'ipt-case-study') {
        setCurrentPage('ipt-case-study');
      } else if (testimonial.projectUrl === 'penguin-case-study') {
        setCurrentPage('penguin-case-study');
      } else if (testimonial.projectUrl === 'bsizia-case-study') {
        setCurrentPage('bsizia-case-study');
      } else if (testimonial.projectUrl === 'binaryracks-case-study') {
        setCurrentPage('binaryracks-case-study');
      } else if (testimonial.projectUrl === 'gimoka-case-study') {
        setCurrentPage('gimoka-case-study');
      } else if (testimonial.projectUrl === 'lashin-case-study') {
        setCurrentPage('lashin-case-study');
      } else if (testimonial.projectUrl === 'concrete-case-study') {
        setCurrentPage('concrete-case-study');
      } else if (testimonial.projectUrl === 'hamburg-case-study') {
        setCurrentPage('hamburg-case-study');
      } else if (testimonial.projectUrl === 'acton-case-study') {
        setCurrentPage('acton-case-study');
      } else if (testimonial.projectUrl === 'yoken-case-study') {
        setCurrentPage('yoken-case-study');
      } else if (testimonial.projectUrl === 'siltal-case-study') {
        setCurrentPage('siltal-case-study');
      } else if (testimonial.projectUrl === 'passap-case-study') {
        setCurrentPage('passap-case-study');
      } else if (testimonial.projectUrl === 'alwaad-case-study') {
        setCurrentPage('alwaad-case-study');
      }
    } else {
      // Find matching case study by client or sector
      const match = data.caseStudies.find(c => c.client.includes(testimonial.client.split(' ')[0]));
      if (match) {
        setSelectedCaseStudy(match);
      } else {
        setCurrentPage('case-studies');
      }
    }
  };

  const currentItem = filteredTestimonials[currentIndex] || filteredTestimonials[0];

  return (
    <section 
      id="testimonials"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200/80 overflow-hidden relative"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      {/* Decorative Subtle Background Glows */}
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Controls Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-start">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? 'شهادات وآراء شركاء النجاح' : 'Client Testimonials & Partner Reviews'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {isAr ? 'ماذا يقول قادة الأعمال عن شراكتهم مع «ديجيتال إفكت»؟' : 'What Business Leaders Say About Partnering with Digital Effect'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {isAr 
                ? 'قصص ثقة ونجاح متبادلة مع مدراء تنفيذيين، أطباء استشاريين، ومدراء تسويق وثقوا في خبرتنا على مدار أكثر من ٢٠ عاماً.'
                : 'Direct feedback from enterprise directors, clinical consultants, and marketing heads who trust our 20+ years of digital scaling expertise.'}
            </p>
          </div>

          {/* Right Action Controls: Filter Buttons + Slider Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Sector Filtering Pills */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveSector('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSector === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'الكل' : 'All'}</span>
                <span className="text-[10px] opacity-75">({TESTIMONIALS_DATA.length})</span>
              </button>

              <button
                onClick={() => setActiveSector('b2b')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSector === 'b2b'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>B2B</span>
              </button>

              <button
                onClick={() => setActiveSector('b2c')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSector === 'b2c'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>B2C</span>
              </button>

              <button
                onClick={() => setActiveSector('medical')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSector === 'medical'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Medical</span>
              </button>
            </div>

            {/* Slider Navigation Arrows & Autoplay Toggle */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={isAutoplay ? (isAr ? 'إيقاف التشغيل التلقائي' : 'Pause autoplay') : (isAr ? 'تشغيل تلقائي' : 'Resume autoplay')}
                aria-label="Toggle Autoplay"
              >
                {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={isAr ? handleNext : handlePrev}
                className="p-2 text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <span className="text-xs font-bold text-slate-600 px-2 tabular-nums">
                {currentIndex + 1} / {totalSlides}
              </span>

              <button
                onClick={isAr ? handlePrev : handleNext}
                className="p-2 text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE TESTIMONIALS SLIDER VIEWPORT */}
        {/* ======================================================== */}
        <div 
          className="relative select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Container with smooth transition */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Show 3 cards side-by-side on desktop, rotating window */}
            {[0, 1, 2].map((offset) => {
              const itemIndex = (currentIndex + offset) % totalSlides;
              const item = filteredTestimonials[itemIndex];
              if (!item) return null;

              const sectorMeta = getSectorBadge(item.sector);
              const isLeadCard = offset === 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between text-start cursor-pointer group hover:-translate-y-1 relative overflow-hidden ${
                    isLeadCard 
                      ? 'border-sky-300 shadow-xl ring-1 ring-sky-400/20' 
                      : 'border-slate-200/90 shadow-sm hover:shadow-lg'
                  }`}
                >
                  {/* Subtle Top Gradient Accent */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 ${
                    item.sector === 'medical' ? 'bg-emerald-500' :
                    item.sector === 'b2b' ? 'bg-sky-500' : 'bg-amber-500'
                  }`} />

                  {/* Card Header: Sector Badge + Stars */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${sectorMeta.badge}`}>
                        {sectorMeta.icon}
                        <span>{sectorMeta.label}</span>
                      </span>

                      {/* 5-Star Rating Indicator */}
                      <div className="flex items-center gap-0.5 text-amber-400" aria-label="5 stars rating">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    {/* Quotation Mark & Feedback Text */}
                    <div className="space-y-3">
                      <Quote className="w-8 h-8 text-slate-200 group-hover:text-sky-300 transition-colors" />
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed line-clamp-4 font-normal group-hover:text-slate-900 transition-colors">
                        "{isAr ? item.text : item.textEn}"
                      </p>
                    </div>

                    {/* Measurable Impact Highlight Badge */}
                    {item.metricResult && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isAr ? item.metricResult : item.metricResultEn}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Client Info & Avatar / Logo */}
                  <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Logo or Branded Avatar */}
                      <div className="h-11 min-w-11 max-w-24 px-1.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={isAr ? item.client : item.clientEn}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-xl ${item.avatarBg || 'bg-slate-700'} text-white font-black text-xs flex items-center justify-center`}>
                            {item.client.substring(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Author Name and Corporate Title */}
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5">
                          <span>{isAr ? item.author : item.authorEn}</span>
                          <span title={isAr ? 'عميل موثق' : 'Verified Client'} className="inline-flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {isAr ? item.role : item.roleEn}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                          {isAr ? item.client : item.clientEn}
                        </div>
                      </div>
                    </div>

                    {/* View Case Study Cue */}
                    <div className="shrink-0 p-2 text-slate-400 group-hover:text-sky-600 group-hover:bg-sky-50 rounded-xl transition-all">
                      {isAr ? (
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Pagination Dots & Progress */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {filteredTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 h-2.5 bg-sky-600 shadow-xs'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Social Proof Trust Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              {isAr ? 'معدل رضا العملاء ٩٨.٦٪ مع أكثر من ٢٥٠ مشروع ناجح' : '98.6% Client Satisfaction Rate Across 250+ Executed Projects'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('case-studies')}
              className="text-sky-600 hover:text-sky-700 font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? 'استعراض كافة دراسات الحالة الموثقة' : 'Explore All Audited Case Studies'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
