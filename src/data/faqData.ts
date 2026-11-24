export type FaqCategoryKey = 'b2b' | 'b2c' | 'medical' | 'pricing';

export interface FaqItem {
  id: string;
  qAr: string;
  aAr: string;
  qEn: string;
  aEn: string;
  ctaTargetPage?: 'custom-package';
  ctaLabelAr?: string;
  ctaLabelEn?: string;
}

export interface FaqCategoryConfig {
  id: FaqCategoryKey;
  anchorId: string;
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  accent: 'sky' | 'amber' | 'emerald';
  items: FaqItem[];
}

export const FAQ_DATA: Record<FaqCategoryKey, FaqCategoryConfig> = {
  b2b: {
    id: 'b2b',
    anchorId: 'b2b-faq',
    badgeAr: 'الأسئلة الشائعة • قطاع الشركات والمصانع',
    badgeEn: 'FAQ • B2B & Industrial Sector',
    titleAr: 'الأسئلة الشائعة حول التسويق لقطاع الشركات والمصانع',
    titleEn: 'Frequently Asked Questions — B2B & Industrial Marketing',
    subtitleAr:
      'إجابات واضحة حول آلية استهداف صناع القرار، التسويق المبني على الحسابات (ABM)، حملات LinkedIn، وتوليد فرص الأعمال.',
    subtitleEn:
      'Clear answers about reaching decision-makers, Account-Based Marketing (ABM), LinkedIn campaigns, and enterprise lead generation.',
    accent: 'sky',
    items: [
      {
        id: 'b2b-1',
        qAr: 'كيف تساعد Digital Effect الشركات والمصانع في الوصول إلى عملاء جدد؟',
        aAr: 'نعمل على تطوير حضورك الرقمي وإعداد محتوى وحملات تسويقية تستهدف الشركات والقطاعات ذات الصلة بمنتجاتك أو خدماتك. الهدف هو زيادة فرص الوصول إلى العملاء المحتملين المناسبين ودعم جهود فريق المبيعات لديك.',
        qEn: 'How does Digital Effect help companies and factories reach new clients?',
        aEn: 'We strengthen your digital presence and build targeted content and marketing campaigns focused on companies and industries relevant to your products or services, expanding reach to qualified prospects and supporting your sales team.',
      },
      {
        id: 'b2b-2',
        qAr: 'ما المقصود بالتسويق المبني على الحسابات (ABM)؟',
        aAr: 'التسويق المبني على الحسابات هو استراتيجية تركز على شركات أو شرائح محددة من العملاء المحتملين بدلاً من توجيه الرسائل الإعلانية إلى جمهور واسع وغير متخصص. نعمل على تحديد الشرائح المستهدفة وتصميم الرسائل والحملات المناسبة لها باستخدام القنوات التسويقية المتاحة.',
        qEn: 'What is Account-Based Marketing (ABM)?',
        aEn: 'Account-Based Marketing is a focused strategy targeting specific companies or decision-maker segments rather than broadcasting ads to a broad, unspecialized audience. We define the target segments and craft tailored messaging and campaigns across the right channels.',
      },
      {
        id: 'b2b-3',
        qAr: 'هل تساعدون المصانع والشركات في الوصول إلى أسواق تصديرية جديدة؟',
        aAr: 'نقدم حلول تسويق رقمي تساعد الشركات والمصانع على عرض منتجاتها بصورة احترافية واستهداف أسواق وعملاء أعمال محتملين خارج نطاقها الحالي. يركز دورنا على الجانب التسويقي وتوليد الفرص، ولا يعني ذلك ضمان إتمام تعاقدات أو صفقات تصديرية.',
        qEn: 'Do you help factories and companies reach new export markets?',
        aEn: 'We provide digital marketing solutions that help companies and manufacturers present their products professionally and reach prospective B2B buyers beyond their current markets. Our role focuses on marketing and opportunity generation and does not guarantee closed export contracts or deals.',
      },
      {
        id: 'b2b-4',
        qAr: 'هل تديرون صفحات الشركات والحملات الإعلانية على LinkedIn؟',
        aAr: 'نقدم خدمات التسويق المؤسسي التي يمكن أن تتضمن إدارة الحضور على LinkedIn وإعداد المحتوى والحملات الموجهة إلى جمهور الأعمال. ويتم تحديد الخدمات والمنصات المشمولة وفقاً للباقة أو نطاق العمل المتفق عليه.',
        qEn: 'Do you manage corporate LinkedIn pages and ad campaigns?',
        aEn: 'We offer corporate B2B marketing services that can include LinkedIn page management, specialized content creation, and ad campaigns aimed at business audiences. Included platforms and deliverables are defined according to the agreed package or scope of work.',
      },
      {
        id: 'b2b-5',
        qAr: 'هل تضمنون عدداً معيناً من العملاء المحتملين أو التعاقدات؟',
        aAr: 'لا نضمن عدداً محدداً من العملاء المحتملين أو التعاقدات؛ لأن النتائج تتأثر بالميزانية والمنافسة ومدى ملاءمة العرض وسرعة متابعة الفرص. نركز على استهداف الجمهور المناسب وقياس الأداء وتحسين الحملات بناءً على النتائج الفعلية.',
        qEn: 'Do you guarantee a specific number of leads or signed contracts?',
        aEn: 'We do not guarantee a fixed number of leads or contracts, as outcomes depend on budget, competition, offer-market fit, and lead follow-up speed. We focus on reaching the right audience, measuring performance, and optimizing campaigns based on actual data.',
      },
    ],
  },
  b2c: {
    id: 'b2c',
    anchorId: 'b2c-faq',
    badgeAr: 'الأسئلة الشائعة • قطاع التجارة والعلامات التجارية',
    badgeEn: 'FAQ • B2C & Consumer Brands',
    titleAr: 'الأسئلة الشائعة حول التسويق للمتاجر والعلامات التجارية',
    titleEn: 'Frequently Asked Questions — B2C & E-Commerce Marketing',
    subtitleAr:
      'تفاصيل واضحة حول إدارة الإعلانات الممولة، فيديوهات وريلز AI، مواد التصوير، وإدارة الرسائل وتخصيص الباقات.',
    subtitleEn:
      'Clear answers on paid media management, AI reels, product visuals, community moderation, and custom scope selection.',
    accent: 'amber',
    items: [
      {
        id: 'b2c-1',
        qAr: 'هل تقدمون إدارة الإعلانات الممولة أم صناعة المحتوى فقط؟',
        aAr: 'نقدم خدمات صناعة المحتوى وإدارة الحملات الإعلانية، بما يشمل التصميمات والمنشورات والفيديوهات التسويقية بحسب الباقة المختارة. ونعمل على ربط المحتوى بالأهداف الإعلانية لتحقيق تجربة تسويقية متناسقة.',
        qEn: 'Do you offer paid ads management or content creation only?',
        aEn: 'We provide both content creation and paid ad campaign management—including designs, posts, and marketing videos depending on your chosen package—aligning creative assets directly with your campaign goals.',
      },
      {
        id: 'b2c-2',
        qAr: 'ما المقصود بفيديوهات وريلز AI؟',
        aAr: 'هي فيديوهات تسويقية يتم استخدام أدوات الذكاء الاصطناعي في إنتاجها أو تطوير عناصرها البصرية. ويتم تحديد طبيعة الفيديو المطلوب وطريقة إنتاجه ومخرجاته ضمن نطاق العمل المتفق عليه قبل التنفيذ.',
        qEn: 'What are AI videos and reels?',
        aEn: 'They are marketing videos produced or visually enhanced using AI creative tools. The video format, production approach, and expected deliverables are defined clearly within the agreed scope of work prior to execution.',
      },
      {
        id: 'b2c-3',
        qAr: 'هل تشمل الباقات الرد على رسائل وتعليقات العملاء؟',
        aAr: 'إدارة الرسائل والتعليقات خدمة إضافية وليست جزءاً من الباقات الأساسية. يمكن طلب إضافتها إلى الخدمات المتفق عليها، مع تحديد نطاق الإدارة وآلية العمل بصورة مستقلة.',
        qEn: 'Do packages include replying to customer messages and comments?',
        aEn: 'Inbox and comment moderation is an add-on service and is not included in the core packages. It can be requested as an additional service with a separately defined management scope and workflow.',
      },
      {
        id: 'b2c-4',
        qAr: 'هل أحتاج إلى توفير صور وفيديوهات المنتجات بنفسي؟',
        aAr: 'يعتمد ذلك على نوع المحتوى المطلوب والمواد المتوفرة لديك. نحدد معك المواد اللازمة للتنفيذ، وما إذا كان المشروع يحتاج إلى إنتاج عناصر بصرية جديدة أو تطوير المواد الحالية، وذلك وفقاً لنطاق الخدمة المتفق عليه.',
        qEn: 'Do I need to provide product photos and videos myself?',
        aEn: 'That depends on the required content type and the assets you already have. We review what is needed with you and determine whether to enhance existing materials or produce new visual assets according to the agreed scope.',
      },
      {
        id: 'b2c-5',
        qAr: 'هل يمكنني اختيار خدمات معينة بدلاً من الاشتراك في باقة كاملة؟',
        aAr: 'نعم، يمكنك الاستفادة من خيار «صمم باقتك» لتحديد الخدمات التي يحتاجها مشروعك، وطلب عرض يناسب طبيعة نشاطك وأهدافك بدلاً من الاعتماد على باقة ثابتة لا تتوافق مع احتياجاتك.',
        qEn: 'Can I select specific services instead of subscribing to a full package?',
        aEn: 'Yes, you can use our "Custom Package" option to select only the services your brand needs and request a tailored proposal aligned with your business goals instead of committing to a rigid tier.',
        ctaTargetPage: 'custom-package',
        ctaLabelAr: 'انتقل إلى صفحة «صمم باقتك»',
        ctaLabelEn: 'Go to Custom Package Builder',
      },
    ],
  },
  medical: {
    id: 'medical',
    anchorId: 'medical-faq',
    badgeAr: 'الأسئلة الشائعة • القطاع الطبي',
    badgeEn: 'FAQ • Medical & Healthcare Sector',
    titleAr: 'الأسئلة الشائعة حول التسويق الطبي للعيادات والمراكز',
    titleEn: 'Frequently Asked Questions — Medical & Clinic Marketing',
    subtitleAr:
      'إجابات شفافة حول الدقة المهنية للمحتوى الطبي، بناء العلامة الشخصية للأطباء، خرائط جوجل، والاستهداف الجغرافي.',
    subtitleEn:
      'Transparent answers on medical content accuracy, physician personal branding, Google Maps visibility, and geo-targeted campaigns.',
    accent: 'emerald',
    items: [
      {
        id: 'med-1',
        qAr: 'هل تراعي Digital Effect الدقة المهنية عند إعداد المحتوى الطبي؟',
        aAr: 'نركز على تقديم محتوى طبي تثقيفي واضح ومسؤول، بعيداً عن المبالغة والادعاءات العلاجية غير المدعومة. وتظل مراجعة المعلومات الطبية المتخصصة واعتمادها من مسؤولية الطبيب أو الجهة الطبية المختصة قبل النشر.',
        qEn: 'Does Digital Effect maintain professional accuracy when creating medical content?',
        aEn: 'We focus on producing clear, responsible educational medical content free from exaggeration or unsupported therapeutic claims. Reviewing and approving specialized clinical information prior to publishing remains the responsibility of the physician or medical entity.',
      },
      {
        id: 'med-2',
        qAr: 'هل تقدمون خدمات بناء العلامة الشخصية للأطباء؟',
        aAr: 'نعمل على تطوير الحضور الرقمي الشخصي للأطباء من خلال المحتوى المتخصص والهوية البصرية والرسائل التسويقية المناسبة، بهدف إبراز خبرات الطبيب وتخصصه وتعزيز حضوره المهني بصورة تحافظ على المصداقية.',
        qEn: 'Do you offer personal branding services for doctors?',
        aEn: 'Yes, we build doctors’ personal digital presence through specialized educational content, cohesive visual identity, and authentic messaging designed to highlight clinical expertise while preserving professional credibility.',
      },
      {
        id: 'med-3',
        qAr: 'هل تقدمون خدمات تحسين ظهور العيادات على خرائط جوجل؟',
        aAr: 'يمكن أن تتضمن خدمات التسويق المحلي، عند الاتفاق عليها، تحسين الملف التجاري للعيادة على Google Business Profile وتنظيم معلوماته ودعم فرص ظهوره في نتائج البحث المحلية. لا يمكن ضمان تصدر النتائج أو الحصول على ترتيب محدد.',
        qEn: 'Do you optimize clinics for visibility on Google Maps?',
        aEn: 'When included in the agreed scope, local marketing services can cover optimizing your Google Business Profile, organizing clinic information, and supporting local search visibility. Exact rankings or #1 placement cannot be guaranteed.',
      },
      {
        id: 'med-4',
        qAr: 'هل يمكن استهداف مرضى في منطقة جغرافية محددة؟',
        aAr: 'يمكن تصميم حملات إعلانية تستهدف مناطق جغرافية محددة بحسب إمكانيات المنصة الإعلانية وطبيعة الخدمة الطبية، للمساعدة في الوصول إلى الجمهور في النطاق المناسب للعيادة أو المركز، مع مراعاة سياسات الإعلانات المتعلقة بالخدمات الصحية.',
        qEn: 'Can ad campaigns target patients in a specific geographic area?',
        aEn: 'Yes, campaigns can be structured to target specific geographic zones within each ad platform’s capabilities and healthcare advertising policies, helping reach audiences located near your clinic or medical center.',
      },
      {
        id: 'med-5',
        qAr: 'متى يمكن أن تبدأ نتائج الحملات الإعلانية للعيادات في الظهور؟',
        aAr: 'تبدأ متابعة مؤشرات الأداء بعد إطلاق الحملة، لكن موعد ظهور استفسارات أو حجوزات فعلية يختلف حسب التخصص والمنطقة الجغرافية والمنافسة والميزانية وطريقة متابعة الاستفسارات. لا نلتزم بمدة ثابتة أو عدد حجوزات مضمون، ونعمل على التحسين وفق البيانات المتاحة.',
        qEn: 'When do clinic advertising campaigns start showing results?',
        aEn: 'Performance tracking starts as soon as campaigns launch, while the timing of actual inquiries or bookings varies by medical specialty, location, competition, budget, and reception follow-up. We do not guarantee a fixed timeline or booking count, and continuously optimize using live campaign data.',
      },
    ],
  },
  pricing: {
    id: 'pricing',
    anchorId: 'pricing-faq',
    badgeAr: 'الأسئلة الشائعة • الأسعار والباقات',
    badgeEn: 'FAQ • Pricing & Packages',
    titleAr: 'الأسئلة الشائعة حول الأسعار والباقات والتعاقد',
    titleEn: 'Frequently Asked Questions — Pricing, Packages & Contracts',
    subtitleAr:
      'كل ما تحتاج معرفته حول أسعار الباقات، ميزانية الإعلانات الممولة، مدة التعاقد، ملكية الحسابات، وتقارير الأداء.',
    subtitleEn:
      'Everything you need to know about package pricing, ad spend separation, minimum contract duration, account ownership, and performance reporting.',
    accent: 'sky',
    items: [
      {
        id: 'pricing-1',
        qAr: 'كم تبدأ أسعار خدمات Digital Effect؟',
        aAr: 'تبدأ باقات قطاع الشركات من ٤٬٠٠٠ جنيه مصري شهرياً، وتبدأ باقات قطاعي التجارة والقطاع الطبي من ١٢٬٥٠٠ جنيه مصري شهرياً. ويمكنك طلب عرض يناسب احتياجاتك من خلال «صمم باقتك».',
        qEn: 'What are the starting prices for Digital Effect services?',
        aEn: 'B2B corporate packages start from 4,000 EGP/month, while B2C and Medical sector packages start from 12,500 EGP/month. You can also request a tailored quote using the "Custom Package" builder.',
      },
      {
        id: 'pricing-2',
        qAr: 'هل أسعار الباقات تشمل ميزانية الإعلانات الممولة؟',
        aAr: 'لا. ميزانية الإعلانات الممولة منفصلة عن قيمة الباقة وأتعاب الخدمات المتفق عليها. ويتم تحديد الميزانية المقترحة بحسب أهداف الحملة وطبيعة النشاط، وتخضع لموافقتك.',
        qEn: 'Do package prices include paid advertising budgets?',
        aEn: 'No. Paid media budgets are separate from package fees and management retainers. Recommended ad spend is determined based on your campaign goals and industry, and is always subject to your approval.',
      },
      {
        id: 'pricing-3',
        qAr: 'ما أقل مدة للتعاقد مع Digital Effect؟',
        aAr: 'الحد الأدنى للتعاقد هو شهر واحد. ويتم تحديد تفاصيل التجديد والإيقاف وأي التزامات مرتبطة بهما وفقاً لشروط التعاقد المتفق عليها.',
        qEn: 'What is the minimum contract duration with Digital Effect?',
        aEn: 'The minimum engagement period is one month. Renewal, pause, or cancellation details and any associated terms are defined in the agreed contract.',
      },
      {
        id: 'pricing-4',
        qAr: 'هل الحسابات الإعلانية وصفحات التواصل الاجتماعي تظل ملكاً لي؟',
        aAr: 'نحرص على إدارة حسابات العملاء من خلال الصلاحيات المناسبة، مع الحفاظ على ملكية العميل لحساباته وصفحاته الأصلية. ويتم تحديد صلاحيات الإدارة وآلية تسليم الوصول إلى الحسابات ضمن ترتيبات بدء العمل.',
        qEn: 'Do my ad accounts and social media pages remain under my ownership?',
        aEn: 'Yes. We manage client accounts through proper partner permissions while preserving full client ownership of original pages and ad accounts. Access levels and handover procedures are set clearly during onboarding.',
      },
      {
        id: 'pricing-5',
        qAr: 'هل يمكنني اختيار خدمات معينة بدلاً من الاشتراك في باقة كاملة؟',
        aAr: 'نعم، تتيح لك صفحة «صمم باقتك» تحديد الخدمات التي يحتاجها نشاطك لطلب عرض مخصص وفق نطاق العمل المطلوب.',
        qEn: 'Can I choose specific services instead of subscribing to a full package?',
        aEn: 'Yes, the "Custom Package" page allows you to pick the exact deliverables your business needs and request a customized quote tailored to your scope of work.',
      },
      {
        id: 'pricing-6',
        qAr: 'ماذا تتضمن تقارير الأداء؟',
        aAr: 'نركز على مؤشرات الأداء المرتبطة بأهداف نشاطك، مثل الوصول والتفاعل والاستفسارات والعملاء المحتملين وتكلفة الحصول على النتائج. وتختلف المؤشرات المستخدمة بحسب نوع الحملة والبيانات المتاحة، ويُحدد نظام التقارير ضمن نطاق العمل المتفق عليه.',
        qEn: 'What is included in performance reports?',
        aEn: 'We focus on KPIs aligned with your business goals—such as reach, engagement, inquiries, leads, and cost per result. Specific metrics vary by campaign type and available data, with the reporting cadence defined in the agreed scope.',
      },
      {
        id: 'pricing-7',
        qAr: 'هل تضمن Digital Effect عدداً معيناً من العملاء أو المبيعات؟',
        aAr: 'لا نقدم ضماناً بعدد محدد من العملاء أو المبيعات؛ لأن النتائج تتأثر بالميزانية والمنافسة والعرض المقدم وسرعة متابعة العملاء المحتملين. نركز على بناء استراتيجية مناسبة وقياس الأداء وتحسين الحملات اعتماداً على البيانات الفعلية.',
        qEn: 'Does Digital Effect guarantee a specific number of clients or sales?',
        aEn: 'We do not guarantee a fixed number of clients or sales, because outcomes depend on budget, competition, your commercial offer, and lead follow-up speed. We focus on solid strategy, transparent tracking, and data-driven optimization.',
      },
    ],
  },
};
