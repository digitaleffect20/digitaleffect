import { CaseStudy, CaseStudyCreative, CaseStudyVideo } from '../types';

export interface ParsedVideoInfo {
  type: 'youtube' | 'vimeo' | 'direct';
  embedUrl: string;
  originalUrl: string;
}

/**
 * Parses video URLs supporting:
 * - YouTube (standard watch, youtu.be, shorts, embeds)
 * - Vimeo (video ID links)
 * - Direct files (mp4, webm, or base64 data URLs)
 */
export function parseVideoUrl(url: string): ParsedVideoInfo {
  if (!url) {
    return { type: 'direct', embedUrl: '', originalUrl: '' };
  }

  const trimmed = url.trim();

  // YouTube match:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`,
      originalUrl: trimmed
    };
  }

  // Vimeo match:
  // https://vimeo.com/123456789
  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`,
      originalUrl: trimmed
    };
  }

  return {
    type: 'direct',
    embedUrl: trimmed,
    originalUrl: trimmed
  };
}

/**
 * Compresses an uploaded image file on the client using an HTML canvas,
 * scaling it proportionally to fit within maxWidth/maxHeight and exporting as JPEG.
 * This guarantees sharp, crisp visuals while keeping the data URL lightweight (~80-250KB)
 * so it effortlessly persists in localStorage.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into canvas'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a video file as a Base64 Data URL.
 */
export async function readVideoFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If file is very large (> 20MB), warn about browser storage limits
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error('حجم ملف الفيديو يتجاوز ٢٥ ميجابايت. يُفضل استخدام رابط يوتيوب أو فيميو أو رابط سحابي مباشر لضمان أعلى سرعة.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read video file'));
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_CREATIVES_BY_CASE_STUDY: Record<string, CaseStudyCreative[]> = {
  'cs-b2c-passap': [
    {
      id: 'passap-c-1',
      url: '/assets/portfolio_crops/card_passap.png',
      title: 'الهوية الترويجية الموحدة لأجهزة وسخانات باساب المنزلية',
      titleEn: 'Unified Brand Campaign for Passap Heaters & Appliances',
      tag: 'الهوية الشاملة',
      tagEn: 'Brand Identity',
      desc: 'تصميم بصري إعلاني يجمع بين سخانات الغاز، الديب فريزر، وثلاجات باساب العائلية لترسيخ الثقة في المنظومة المنزلية المتكاملة.',
      descEn: 'Comprehensive brand visual showcasing Passap gas water heaters, deep freezers, and refrigerators to reinforce trusted household integration.'
    },
    {
      id: 'passap-c-2',
      url: '/assets/passap-2/passap_heater_tech.jpg',
      title: 'سخانات الغاز الذكية بشاشات التحكم الرقمية وأنظمة الأمان الثلاثية',
      titleEn: 'Smart Digital Gas Heaters with Triple Thermal Safety System',
      tag: 'تكنولوجيا سخانات الغاز',
      tagEn: 'Gas Heater Tech',
      desc: 'تسليط الضوء الدقيق على صمامات الأمان النحاسية وشاشات LED الرقمية لضبط درجة الحرارة والتشغيل الفوري مع ضغط المياه المنخفض.',
      descEn: 'Highlighting solid brass safety valves, responsive LED temperature regulation, and low water-pressure instant ignition engineering.'
    },
    {
      id: 'passap-c-3',
      url: '/assets/passap-2/passap-2_img_3.png',
      title: 'تشكيلة أجهزة باساب (سخانات، مبردات، ثلاجات، ديب فريزر، بوتاجازات)',
      titleEn: 'Passap Product Lineup: Heaters, Dispensers, Fridges, Freezers & Ovens',
      tag: 'خط المنتجات الكامل',
      tagEn: 'Full Lineup',
      desc: 'استعراض بانورامي متكامل لخطوط إنتاج باساب المعدة لتحمل أقسى ظروف الاستخدام اليومي للأسر مع شهادات الجودة المصرية والأوروبية.',
      descEn: 'Panoramic showcase of Passap household production lines engineered for heavy everyday family durability with certified quality standards.'
    },
    {
      id: 'passap-c-4',
      url: '/assets/passap-2/passap_service_care.jpg',
      title: 'الصيانة المعتمدة وخدمات ما بعد البيع المباشرة عبر الخط الساخن 16898',
      titleEn: 'Nationwide Certified Service & Hotline 16898 Triage',
      tag: 'الخط الساخن والضمان',
      tagEn: 'Hotline 16898 & Warranty',
      desc: 'حملات ترسيخ طمأنينة المستهلك عبر سرعة تلبية اتصالات الخط الساخن، الفنيين المعتمدين، وقطع الغيار الأصلية في جميع المحافظات.',
      descEn: 'Consumer peace-of-mind campaigns highlighting rapid hotline triage, certified technicians, and authentic factory spare parts nationwide.'
    },
    {
      id: 'passap-c-5',
      url: '/assets/passap-2/passap_hero_bg.jpg',
      title: 'حملة «دش ساخن في عز البرد» وتجربة الدفء والراحة العائلية',
      titleEn: 'Winter Comfort Campaign: "Hot Showers in the Deepest Cold"',
      tag: 'الحملة الشتوية الكبرى',
      tagEn: 'Winter Campaign',
      desc: 'توليد الرغبة اللحظية والاستجابة العاطفية في ذروة موجات الصقيع الشتوية عبر تصوير الدفء الفوري والمياه الساخنة دون انقطاع.',
      descEn: 'Generating immediate emotional resonance during harsh winter freezes, highlighting nonstop instant warmth and soothing family comfort.'
    },
    {
      id: 'passap-c-6',
      url: '/assets/passap-2/passap-2_img_1.jpg',
      title: 'الحملات التفاعلية ومواسم الأعياد وتنشيط قنوات التواصل الاجتماعي',
      titleEn: 'Festive Holiday Activations & Interactive Social Engagement',
      tag: 'التفاعل الاجتماعي',
      tagEn: 'Social Engagement',
      desc: 'بناء علاقة مستمرة وحية مع الجمهور من خلال منشورات التهنئة الموسمية، المسابقات، والرد الفوري على استفسارات الأسعار والموزعين.',
      descEn: 'Sustaining dynamic customer bonding through seasonal greeting campaigns, prize contests, and real-time dealer referral messaging.'
    }
  ],
  'cs-b2c-siltal': [
    {
      id: 'siltal-c-1',
      url: '/assets/siltal-social/siltal-social_img_4.png',
      title: 'ثلاجات سيلتال الإيطالية بتكنولوجيا التبريد الذكي وحفظ الأطعمة',
      titleEn: 'Siltal Italian Smart Multi-Airflow Refrigerators Launch',
      tag: 'الثلاجات الإيطالية',
      tagEn: 'Italian Refrigeration',
      desc: 'تصميم بصري إعلاني يركز على عراقة الهندسة الإيطالية، السعة التخزينية الرحبة، وتكنولوجيا العزل الموفرة للكهرباء لتدوم عقوداً داخل المنازل.',
      descEn: 'Sleek campaign visual emphasizing Italian engineering heritage, generous storage capacity, and energy-saving insulation built to last.'
    },
    {
      id: 'siltal-c-2',
      url: '/assets/siltal-social/siltal-social_img_5.jpg',
      title: 'غسالات سيلتال الأوتوماتيكية فائقة العناية بالأنسجة وبرامج التوفير',
      titleEn: 'Siltal High-Capacity Automatic Washers & Garment Care',
      tag: 'الغسالات المنزلية',
      tagEn: 'Washing Machines',
      desc: 'تسليط الضوء على هدوء المحركات الأوروبية وبرامج الغسيل السريع الموفرة للمياه والكهرباء مع حماية الأقمشة الحساسة.',
      descEn: 'Highlighting ultra-quiet European motors, quick eco-wash cycles, and advanced fabric protection engineered for family homes.'
    },
    {
      id: 'siltal-c-3',
      url: '/assets/siltal-social/siltal-social_img_6.jpg',
      title: 'ديب فريزر سيلتال بخاصية التجميد الفائق وعزل البرودة طويل الأمد',
      titleEn: 'Heavy-Duty Deep Freezers with Extended Thermal Insulation',
      tag: 'الديب فريزر والتجميد',
      tagEn: 'Deep Freezers',
      desc: 'إبراز سرعة التجميد الاستوائي وكفاءة الجدران العازلة السميكة التي تحتفظ بالبرودة ساعات طويلة في أوقات الطوارئ.',
      descEn: 'Showcasing tropical-grade deep freezing power and thick thermal insulation maintaining sub-zero chill during electrical outages.'
    },
    {
      id: 'siltal-c-4',
      url: '/assets/siltal-social/siltal-social_img_7.webp',
      title: 'شهادات الجودة الأوروبية والضمان المعتمد مع خدمة ما بعد البيع',
      titleEn: 'Certified European Standards & Nationwide Service Coverage',
      tag: 'الضمان والاعتمادية',
      tagEn: 'Warranty & Support',
      desc: 'ترسيخ راحة بال العائلات والمقبلين على الزواج عبر شهادات الضمان المعتمد وسرعة توفير قطع الغيار الأصلية في كافة المحافظات.',
      descEn: 'Building customer trust through certified warranty documentation, prompt service center dispatch, and authentic Italian spare parts.'
    },
    {
      id: 'siltal-c-5',
      url: '/assets/portfolio_crops/card_siltal.png',
      title: 'الهوية الإعلانية الموحدة لحملات سيلتال الرقمية وربط معارض الموزعين',
      titleEn: 'Unified Retail Brand Campaign & Dealer Showroom Lead Funnel',
      tag: 'الهوية الترويجية المتكاملة',
      tagEn: 'Integrated Retail Engine',
      desc: 'منظومة إعلانية متكاملة تربط حملات التوعية الرقمية بتوجيه المستهلكين إلى أقرب موزع معتمد وسرعة إتمام الشراء.',
      descEn: 'End-to-end performance engine linking digital awareness campaigns with nearest dealer showroom navigation and direct sales closure.'
    },
    {
      id: 'siltal-c-6',
      url: '/assets/siltal-social/siltal-social_img_3.png',
      title: 'الحملات الترويجية الموسمية وباقات تجهيز المنازل والعرائس',
      titleEn: 'Seasonal Promotional Campaigns & Bridal Suite Bundles',
      tag: 'عروض تجهيز العرائس',
      tagEn: 'Bridal Bundles',
      desc: 'عروض موسمية تجمع بين الثلاجة والغسالة والديب فريزر بأسعار تنافسية سهّلت اتخاذ قرار الشراء للعرائس وأولياء الأمور.',
      descEn: 'Targeted seasonal campaigns bundling essential appliances with strong purchase incentives for wedding planners and families.'
    }
  ],
  'cs-b2c-alwaad-travel': [
    {
      id: 'alwaad-c-1',
      url: '/assets/portfolio_crops/card_alwaad.png',
      title: 'الهوية الترويجية الموحدة لرحلات الوعد للسياحة والسفر الدولية',
      titleEn: 'Unified Brand Campaign for AlWaad International Travel & Tours',
      tag: 'الهوية الترويجية',
      tagEn: 'Brand Campaign',
      desc: 'تصميم بصري إعلاني يبرز تنوع الوجهات العالمية، رحلات الطيران المباشرة، وحقائب السفر المجهزة لتشجيع العائلات على التخطيط المبكر.',
      descEn: 'Sleek campaign visual emphasizing diverse global destinations, nonstop scheduled flights, and seamless family vacation planning.'
    },
    {
      id: 'alwaad-c-2',
      url: '/assets/alwaad-travel/alwaad_hero_bg.jpg',
      title: 'حملات رحلات العمرة وزيارة الحرمين الشريفين بأرقى فنادق المركزية',
      titleEn: 'Spiritual Umrah Journeys & Premium Central Haram Hotel Packages',
      tag: 'رحلات العمرة المباركة',
      tagEn: 'Spiritual Umrah',
      desc: 'ترسيخ الطمأنينة والسكينة عبر إبراز قرب الفنادق من الحرم المكي الشريف، خدمات النقل الفاخرة، والإشراف الديني المتكامل طوال الرحلة.',
      descEn: 'Highlighting five-star hotel proximity to the Holy Kaaba, private VIP transit, and attentive spiritual guidance throughout the pilgrimage.'
    },
    {
      id: 'alwaad-c-3',
      url: '/assets/alwaad-travel/alwaad-travel_img_4.png',
      title: 'باقات العطلات الترفيهية والسياحة العائلية المتكاملة',
      titleEn: 'All-Inclusive Family Holiday & Leisure Leisure Itineraries',
      tag: 'البرامج العائلية',
      tagEn: 'Family Holidays',
      desc: 'استعراض برامج شاملة تشمل تذاكر الطيران، الإقامة الفندقية، الجولات السياحية، ومرشدين معتمدين لراحة بال الأسر طوال الإجازة.',
      descEn: 'Showcasing comprehensive packages bundling airfare, premium resort stays, guided sightseeing, and dedicated concierge support.'
    },
    {
      id: 'alwaad-c-4',
      url: '/assets/alwaad-travel/alwaad-travel_img_5.jpg',
      title: 'رحلات الاستجمام والشواطئ والسياحة الداخلية الفاخرة',
      titleEn: 'Coastal Resort Escapes & Domestic Tourism Activations',
      tag: 'السياحة الشاطئية',
      tagEn: 'Coastal Escapes',
      desc: 'حملات موسمية لتنشيط رحلات شرم الشيخ، الغردقة، والساحل الشمالي مع تسهيلات دفع مرنة وأسعار تنافسية خاصة بالمجموعات.',
      descEn: 'Seasonal campaigns driving holiday bookings for Red Sea and Mediterranean resorts with flexible group payment arrangements.'
    },
    {
      id: 'alwaad-c-5',
      url: '/assets/alwaad-travel/alwaad-travel_img_6.jpg',
      title: 'عروض الطيران وحجوزات الفنادق الشاملة بقوائم أسعار شفافة',
      titleEn: 'Airfare & Hotel Reservation Engine with Full Price Transparency',
      tag: 'حجوزات الطيران',
      tagEn: 'Flight Bookings',
      desc: 'بناء ثقة المسافرين عبر توضيح تواريخ الإقلاع الدقيقة، سياسات الإلغاء المرنة، وتصنيف درجات السفر دون أي رسوم خفية.',
      descEn: 'Building traveler confidence through explicit departure schedules, flexible cancellation options, and transparent fare classes without hidden fees.'
    },
    {
      id: 'alwaad-c-6',
      url: '/assets/alwaad-travel/alwaad-travel_img_3.jpg',
      title: 'خدمات التأشيرات السريعة والمساعدة القنصلية للمسافرين ورجال الأعمال',
      titleEn: 'Expedited Visa Clearance & Consular Assistance for Travelers',
      tag: 'التأشيرات والوثائق',
      tagEn: 'Visa Assistance',
      desc: 'تسليط الضوء على خبرة فريق الوعد في تسهيل استخراج التأشيرات السياحية والتجارية بسرعة واحترافية عالية توفر وقت العملاء.',
      descEn: 'Showcasing streamlined visa processing, documentation support, and embassy tracking designed to save clients valuable time.'
    }
  ],
  'cs-b2c-hamburg': [
    {
      id: 'hamburg-c-1',
      url: '/assets/hamburg-social/hamburg-social_img_3.jpg',
      title: 'مسطحات الغاز الزجاجية الفاخرة ونظام الأمان الإيطالي الشامل',
      titleEn: 'Tempered Glass Gas Hobs with Full Italian Flame Safety',
      tag: 'المسطحات البلت-إن الزجاجية',
      tagEn: 'Built-in Glass Hobs',
      desc: 'تصميم بصري إعلاني يركز على عيون الغاز السريعة، نظام الإشعال الذاتي، وصمامات الأمان الشامل مع سطح زجاجي حراري فائق النقاء.',
      descEn: 'Sleek campaign visual emphasizing cast-iron pan supports, rapid triple-ring burner, and automatic thermal flame failure safety.'
    },
    {
      id: 'hamburg-c-2',
      url: '/assets/hamburg-social/hamburg-social_img_4.png',
      title: 'الشفاطات الهرمية والزجاجية بقوة شفط فائقة وهدوء فندقي',
      titleEn: 'High-Suction Chimney & Curved Glass Kitchen Hoods',
      tag: 'شفاطات المطابخ العصرية',
      tagEn: 'Kitchen Hoods',
      desc: 'إبراز نقاء هواء المطبخ عبر محركات التوربو متعددة السرعات وفلاتر الألمنيوم سهلة التنظيف مع إضاءات LED موجهة لمنطقة الطهي.',
      descEn: 'Highlighting multi-speed turbo extraction, washable carbon-aluminum baffles, and targeted cooktop LED illumination.'
    },
    {
      id: 'hamburg-c-3',
      url: '/assets/hamburg-social/hamburg-social_img_6.jpg',
      title: 'أفران البلت-إن الكهربائية والغاز بسعة رحبة وتوزيع حراري ذكي',
      titleEn: 'Built-in Convection Ovens with Smart Digital Touch Control',
      tag: 'أفران الطهي البلت-إن',
      tagEn: 'Built-in Ovens',
      desc: 'تصاميم تسلط الضوء على الشواية الدوارة والمروحة الحرارية ونظام التبريد الخارجي للكبائن لحماية دواليب المطبخ الخشبية.',
      descEn: 'Showcasing 3D convection air circulation, rotisserie grilling, and dynamic cooling casing that safeguards modular kitchen cabinets.'
    },
    {
      id: 'hamburg-c-4',
      url: '/assets/hamburg-social/hamburg-social_img_5.webp',
      title: 'باقات أطقم البلت-إن الكاملة للمقبلين على الزواج وتجهيز المنازل',
      titleEn: 'Complete Kitchen Built-in Suite Bundles for Modern Homes',
      tag: 'باقات التجهيز الشامل',
      tagEn: 'Full Kitchen Bundles',
      desc: 'حملات عروض تخفيضية تجمع (المسطح + الشفاط + الفرن) بخصم حقيقي وتسهيلات شحن وتركيب فورية أدت لقفزة نوعية في قيمة الفاتورة.',
      descEn: 'High-converting bundle promotions combining hob, hood, and oven with complimentary delivery and professional installation support.'
    },
    {
      id: 'hamburg-c-5',
      url: '/assets/hamburg-social/hamburg-social_img_7.webp',
      title: 'حملات التخفيضات الموسمية والضمان المعتمد مع خدمة ما بعد البيع',
      titleEn: 'Seasonal Sales Drives & Certified Long-term Warranty Protection',
      tag: 'المواسم وخدمات الضمان',
      tagEn: 'Warranty & Season Drives',
      desc: 'ترسيخ الثقة لدى المستهلكين من خلال شهادات الضمان الطويل وتوافر مراكز الصيانة وقطع الغيار الأصلية بكافة المحافظات.',
      descEn: 'Building customer peace-of-mind with 5-year certified manufacturer warranty and nationwide authorized service network.'
    },
    {
      id: 'hamburg-c-6',
      url: '/assets/portfolio_crops/card_hamburg.png',
      title: 'الهوية البصرية والحملة الإعلانية الرقمية المتكاملة لشركة هامبورج',
      titleEn: 'Integrated Digital Campaign Identity & Direct Retail Lead Engine',
      tag: 'الهوية والحملات الرقمية',
      tagEn: 'Digital Campaign Identity',
      desc: 'توحيد هوية الترويج في صالات العرض ومنصات السوشيال ميديا، مع ربط إعلانات الرسائل بفريق مبيعات للرد على المقاسات والأسعار.',
      descEn: 'Synchronizing digital visual aesthetics with showroom displays and routing inbound sizing inquiries into closed retail sales.'
    }
  ],
  'cs-b2c-acton': [
    {
      id: 'acton-c-1',
      url: '/assets/acton-2/acton-2_img_4.png',
      title: 'ثلاجات أكتون الحديثة بنظام النوفروست وتوفير الطاقة الذكي',
      titleEn: 'Acton Smart Inverter No-Frost Refrigerators Launch',
      tag: 'الثلاجات الذكية',
      tagEn: 'Smart Refrigerators',
      desc: 'تصميم إعلاني فائق الجاذبية يبرز السعة اللترية الكبيرة، الإضاءة الداخلية LED، وتكنولوجيا تدفق الهواء المتعدد للحفاظ على نضارة الأطعمة.',
      descEn: 'Sleek campaign visual emphasizing generous storage capacity, multi-airflow cooling, and energy-efficient digital inverter compressors.'
    },
    {
      id: 'acton-c-2',
      url: '/assets/acton-2/acton-2_img_5.jpg',
      title: 'ديب فريزر أكتون الأفقي والرأسي بسعة تجميد قصوى وعزل حراري',
      titleEn: 'Heavy-Duty Chest & Upright Deep Freezers Campaign',
      tag: 'الديب فريزر والتجميد',
      tagEn: 'Deep Freezers',
      desc: 'إبراز قدرة التجميد الفوري السريع وعزل الجدران السميك الذي يحتفظ بالبرودة حتى ٤٨ ساعة أثناء انقطاع التيار الكهربائي.',
      descEn: 'Highlighting rapid deep-freeze technology and super-insulated walls retaining sub-zero temperatures for up to 48 hours during outages.'
    },
    {
      id: 'acton-c-3',
      url: '/assets/acton-2/acton-2_img_6.jpg',
      title: 'حملات التقسيط المباشر 0% مقدم بالتعاون مع كبرى المنصات الاستهلاكية',
      titleEn: 'Zero-Down Consumer Financing & 0% Interest Installment Drives',
      tag: 'عروض التقسيط البنكي',
      tagEn: '0% Installment Offers',
      desc: 'حملات ترويجية مخصصة تزيل حاجز التردد المالي لدى الأسر عبر شراكات التقسيط الاستهلاكي الميسر على فترات سداد مريحة بدون فوائد.',
      descEn: 'Targeted financing campaigns eliminating price friction through zero-down payment and zero-interest consumer credit partnerships.'
    },
    {
      id: 'acton-c-4',
      url: '/assets/acton-2/acton-2_img_7.jpg',
      title: 'مبردات المياه العصرية بتصميم نحيف وتبريد نقي فائق السرعة',
      titleEn: 'Sleek Compact Water Dispensers with Multi-Stage Filtration',
      tag: 'مبردات المياه',
      tagEn: 'Water Dispensers',
      desc: 'تصاميم تسلط الضوء على خيارات المياه الباردة والساخنة الفورية وقفل أمان الأطفال وخزان الفولاذ المقاوم للصدأ الصحي.',
      descEn: 'Creative visuals showcasing instant hot/cold water taps, stainless steel food-grade reservoirs, and child safety lock features.'
    },
    {
      id: 'acton-c-5',
      url: '/assets/acton-2/acton-2_img_8.jpg',
      title: 'حملات الضمان المعتمد وتغطية مراكز الصيانة في كافة المحافظات',
      titleEn: 'Certified Nationwide Warranty & Dedicated Spare Parts Network',
      tag: 'الضمان وخدمات ما بعد البيع',
      tagEn: 'Warranty & After-Sales',
      desc: 'ترسيخ راحة بال المستهلك عبر إبراز شهادة الضمان طويلة الأجل والخط الساخن وتوافر الفنيين المعتمدين في كل محافظات الجمهورية.',
      descEn: 'Strengthening consumer trust through long-term certified warranty badges, hotline fast-track, and authorized technician dispatch.'
    },
    {
      id: 'acton-c-6',
      url: '/assets/portfolio_crops/card_acton.png',
      title: 'الهوية الترويجية المتكاملة لحملات التبريد وتنشيط المبيعات',
      titleEn: 'Integrated Cooling Campaign Identity & Dealer Demand Generation',
      tag: 'الهوية الترويجية المتكاملة',
      tagEn: 'Integrated Retail Engine',
      desc: 'منظومة إعلانية تربط تفاعل السوشيال ميديا بتوليد طلبات الشراء وتوجيه المتسوقين إلى أقرب موزع معتمد في منطقتهم.',
      descEn: 'End-to-end performance engine connecting social engagements to verified purchasing intent and nearest showroom navigation.'
    }
  ],
  'cs-b2c-yoken': [
    {
      id: 'yoken-c-1',
      url: '/assets/yoken-2/yoken-2_img_3.png',
      title: 'غسالات يوكين الأوتوماتيكية بمحرك إنفرتر ذكي وبرامج العناية الفائقة',
      titleEn: 'Yoken Smart Inverter Washing Machines & Fabric Care Launch',
      tag: 'الغسالات الأوتوماتيكية',
      tagEn: 'Automatic Washers',
      desc: 'تصميم إعلاني فائق الأناقة يبرز محرك الإنفرتر الموفر للكهرباء، دورات الغسيل السريع، والتشغيل فائق الهدوء المخصص للأسر العصرية.',
      descEn: 'High-converting campaign visual highlighting silent direct-drive inverter motors, steam allergy-care cycles, and energy ratings.'
    },
    {
      id: 'yoken-c-2',
      url: '/assets/yoken-2/yoken-2_img_4.jpg',
      title: 'أجهزة المطابخ والمسطحات والشفاطات بجودة تصنيع متينة ومظهر عصري',
      titleEn: 'Contemporary Kitchen Appliances & Heavy-Duty Cooktops',
      tag: 'أجهزة المطبخ',
      tagEn: 'Kitchen Appliances',
      desc: 'إبراز المتانة العالية لمسطحات الطهي والشفاطات وسهولة التنظيف مع تناسق الألوان والمقاسات داخل مختلف تصاميم المطابخ.',
      descEn: 'Highlighting cooktop ergonomics, high-flow chimney extraction, and durable stainless finishes tailored to everyday cooking.'
    },
    {
      id: 'yoken-c-3',
      url: '/assets/yoken-2/yoken-2_img_5.jpg',
      title: 'حملات المسابقات التفاعلية وتوزيع الهدايا والجوائز القيمة للأسر',
      titleEn: 'Viral Interactive Contests, Giveaways & Family Social Activation',
      tag: 'المسابقات والتفاعل',
      tagEn: 'Social Activations',
      desc: 'ابتكار فعاليات تفاعلية شجعت آلاف العائلات على المشاركة ومشاركة تجاربهم مع أجهزة يوكين، مما حقق انتشاراً عضوياً غير مسبوق.',
      descEn: 'Gamified social campaigns encouraging tens of thousands of families to participate, generating massive viral brand recall.'
    },
    {
      id: 'yoken-c-4',
      url: '/assets/yoken-2/yoken-2_img_6.jpg',
      title: 'عروض التخفيضات الموسمية وباقات تجهيز العرائس بأسعار تنافسية',
      titleEn: 'Bridal Home Starter Bundles & High-Velocity Seasonal Promotions',
      tag: 'عروض تجهيز العرائس',
      tagEn: 'Bridal Offers',
      desc: 'حملات ترويجية تجمع أجهزة الغسيل والطهي في باقات متكاملة توفر حلولاً اقتصادية للمقبلين على الزواج مع هدايا فورية.',
      descEn: 'Bundle promotions pairing washing machines with kitchen essentials, offering compelling pricing for new households.'
    },
    {
      id: 'yoken-c-5',
      url: '/assets/yoken-2/yoken-2_img_7.jpg',
      title: 'شبكة الصيانة المعتمدة وقطع الغيار الأصلية والدعم الفني السريع',
      titleEn: 'Certified Maintenance Network, Genuine Parts & Direct Hotline',
      tag: 'الضمان والصيانة',
      tagEn: 'Service & Support',
      desc: 'ترسيخ راحة بال العائلات عبر إبراز شهادات الضمان المعتمدة ومراكز الخدمة المنتشرة في المحافظات مع سرعة استجابة فريق الصيانة.',
      descEn: 'Reinforcing consumer trust via certified service centers, prompt technician dispatch, and guaranteed genuine factory components.'
    },
    {
      id: 'yoken-c-6',
      url: '/assets/portfolio_crops/card_yoken.png',
      title: 'الهوية الترويجية الموحدة لشركة يوكين وتنشيط معارض الموزعين',
      titleEn: 'Unified Retail Brand Identity & Showroom Footfall Driving Engine',
      tag: 'الهوية الترويجية المتكاملة',
      tagEn: 'Integrated Retail Engine',
      desc: 'منظومة إعلانية تربط التفاعل الرقمي على السوشيال ميديا بتدفق الزوار إلى معارض الأجهزة وتجار التجزئة في مختلف المحافظات.',
      descEn: 'Coordinated digital performance advertising driving high-intent retail buyers straight to partner dealer showrooms.'
    }
  ],
  'cs-b2b-bsizia': [
    {
      id: 'bsizia-c-1',
      url: '/assets/bsizia/bsizia_img_8.jpg',
      title: 'كيان متكامل لنمو يدوم — استراتيجية قوة التكتل الصناعي',
      titleEn: 'Integrated Entity for Lasting Growth — Alliance Strategy',
      tag: 'قوة التكتل',
      tagEn: 'Industrial Alliance',
      desc: 'تجسيد محاور الجمعية الأربعة: قوة التكتل، رؤية واضحة، التمثيل، وسرعة الحل لربط المصانع والمستثمرين.',
      descEn: 'Articulating the 4 pillars: collective leverage, crystal vision, authoritative representation, and agile problem solving.'
    },
    {
      id: 'bsizia-c-2',
      url: '/assets/bsizia/bsizia_img_9.jpg',
      title: 'كل نجاح صناعي خلفه قرار استثماري صح',
      titleEn: 'Behind Every Industrial Success is a Smart Investment',
      tag: 'قرار استثماري',
      tagEn: 'Strategic Investment',
      desc: 'إبراز خطوط الإنتاج والنمو التصاعدي للمصانع في بني سويف كبيئة استثمارية خصبة ومربحة.',
      descEn: 'Visualizing manufacturing pipelines and upward growth curves, driving enterprise expansion decisions.'
    },
    {
      id: 'bsizia-c-3',
      url: '/assets/bsizia/bsizia_img_10.jpg',
      title: 'ثقة المستثمر تبدأ من وضوح الرؤية — دور الجمعية',
      titleEn: 'Investor Confidence Begins with Vision Clarity',
      tag: 'وضوح الرؤية',
      tagEn: 'Investor Clarity',
      desc: 'استعراض رؤية الجمعية في دعم الصناعة والاستثمار وتهيئة المناخ الإداري لرجال الأعمال.',
      descEn: 'Presenting the association roadmap to empower industry, mitigate operational risks, and streamline permits.'
    },
    {
      id: 'bsizia-c-4',
      url: '/assets/bsizia/bsizia_img_12.jpg',
      title: 'الصناعة مستقبلنا والتعاون طريق النجاح',
      titleEn: 'Industry is Our Future & Collaboration is the Path',
      tag: 'التعاون الصناعي',
      tagEn: 'Factory Floor',
      desc: 'مشهد ميداني يجمع الإدارة الهندسية وأطقم التشغيل على أرض المصنع لمراجعة المخططات.',
      descEn: 'On-the-ground executive leadership and factory technicians reviewing engineering master blueprints.'
    },
    {
      id: 'bsizia-c-5',
      url: '/assets/bsizia/bsizia_img_13.jpg',
      title: 'خريطة مناطق بني سويف الصناعية — استثمر في موقع يخدمك',
      titleEn: 'Beni Suef Industrial Zones Map — Prime Logistical Hub',
      tag: 'خريطة الاستثمار',
      tagEn: 'Zoning Map',
      desc: 'خريطة تفصيلية تغطي مراكز الواسطى، ناصر، بني سويف، إهناسيا، ببا، سمسطا، الفشن، ومنطقة جبل وادي غراب.',
      descEn: 'Detailed territorial zoning map showcasing supply chain proximity, export corridors, and industrial parcel readiness.'
    },
    {
      id: 'bsizia-c-6',
      url: '/assets/bsizia/bsizia_img_14.jpg',
      title: 'العضوية قوة — استثمار أقوى، وأمان أكبر للمصانع',
      titleEn: 'Membership is Strength — Stronger Investment & Security',
      tag: 'قوة العضوية',
      tagEn: 'Advocacy & Security',
      desc: 'تسليط الضوء على مزايا العضوية المؤسسية في مجالس القرار وحماية حقوق المصانع والتمثيل الحكومي الموحد.',
      descEn: 'Highlighting board-level advocacy, investor safeguards, and collaborative policy representation.'
    },
    {
      id: 'bsizia-c-7',
      url: '/assets/bsizia/bsizia_img_15.jpg',
      title: 'داعم حقيقي للمصانع — معك لحل التحديات التشغيلية',
      titleEn: 'A Real Backbone for Factories — Overcoming Challenges',
      tag: 'دعم المصانع',
      tagEn: 'Operational Support',
      desc: 'تروس الإنتاج والحلول العملية المباشرة لمواجهة تحديات الطاقة، التراخيص، وسلاسل التوريد للمصانع القائمة.',
      descEn: 'Practical hands-on support addressing utilities, regulatory licensing, and industrial supply bottlenecks.'
    },
    {
      id: 'bsizia-c-8',
      url: '/assets/bsizia/bsizia_img_16.jpg',
      title: 'جمعية تقود النمو الصناعي — شريك المستثمر في بني سويف',
      titleEn: 'Driving Industrial Growth — Your Investment Partner',
      tag: 'شريك المستثمر',
      tagEn: 'Strategic Partner',
      desc: 'التصويب الدقيق نحو أهداف التنمية وتمكين المصانع الوطنية من مضاعفة الإنتاجية والتصدير.',
      descEn: 'Precision targeting towards industrial excellence, empowering domestic and international manufacturers.'
    }
  ],
  'cs-b2c-gimoka': [
    {
      id: 'gimoka-c-1',
      url: '/assets/gimoka/gimoka_creative_1.jpg',
      title: 'سلسلة كبسولات الإسبريسو الإيطالي الفاخر (Oro, Intenso, Ristretto)',
      titleEn: 'Gimoka Italian Espresso Capsule Range (Oro, Intenso, Ristretto)',
      tag: 'هوية المنتج والكبسولات',
      tagEn: 'Product & Packaging',
      desc: 'حملة بصرية متكاملة تبرز طبقات الكريما الذهبية والتحميص الإيطالي العريق لكبسولات جيموكا المتوافقة مع مختلف الماكينات.',
      descEn: 'Commercial campaign visual highlighting golden crema richness and authentic Italian roasting across the premium capsule collection.'
    },
    {
      id: 'gimoka-c-2',
      url: '/assets/gimoka/gimoka_creative_2.jpg',
      title: 'ماكينة تحضير الإسبريسو المنزلي وطقوس الصباح الإيطالية',
      titleEn: 'Home Espresso Machine & Italian Morning Ritual Campaign',
      tag: 'لايف ستايل وماكينات القهوة',
      tagEn: 'Lifestyle & Home Brewers',
      desc: 'سلسلة إعلانية تسلط الضوء على سهولة تحضير كوب قهوة بمستوى الباريستا في المنزل بلمسة زر مع ماكينات جيموكا المدمجة.',
      descEn: 'High-aesthetic lifestyle campaign showcasing barista-grade home brewing and daily morning ritual indulgence.'
    },
    {
      id: 'gimoka-c-3',
      url: '/assets/gimoka/gimoka_img_3.jpg',
      title: 'التغليف الإيطالي الأصيل وباقات حبوب القهوة الفاخرة',
      titleEn: 'Authentic Italian Packaging & Whole Bean Coffee Blends',
      tag: 'حبوب القهوة الفاخرة',
      tagEn: 'Whole Bean Selection',
      desc: 'إبراز جودة حبوب القهوة المنتقاة بعناية والتغليف الصارم المحافظ على عبق ونضارة التحميص الإيطالي الأصيل.',
      descEn: 'Showcasing master-selected coffee beans and sealed aroma-lock packaging preserving authentic Italian freshness.'
    },
    {
      id: 'gimoka-c-4',
      url: '/assets/gimoka/gimoka_img_4.png',
      title: 'بانر الحملات الترويجية ومجموعات التوفير للمنازل والمكاتب',
      titleEn: 'Promotional Bundle & Corporate Office Coffee Packages',
      tag: 'عروض وباقات التوفير',
      tagEn: 'Promo Bundles',
      desc: 'تصميم إعلاني عريض لعروض ماكينات القهوة مع باقات كبسولات مجانية موجهة لأصحاب المكاتب ومحبي القهوة اليومية.',
      descEn: 'Wide campaign banner for machine + capsule promotional bundles targeting corporate offices and coffee aficionados.'
    },
    {
      id: 'gimoka-c-5',
      url: '/assets/gimoka/gimoka_img_5.png',
      title: 'بوستر الإطلاق الرسمي لنكهات الإسبريسو المتخصصة',
      titleEn: 'Official Launch Poster for Gourmet Specialty Blends',
      tag: 'حملات الإطلاق والتوزيع',
      tagEn: 'Retail Launch',
      desc: 'بوستر رأسي تفصيلي للحملات الترويجية وسلاسل الهايبرماركت لتعريف المستهلك بمستويات الكثافة ودرجات التحميص.',
      descEn: 'Detailed vertical campaign poster deployed across hypermarket chains detailing intensity grades and roasting profiles.'
    },
    {
      id: 'gimoka-c-6',
      url: '/assets/portfolio_crops/card_gimoka.png',
      title: 'الهوية البصرية الشاملة لعلامة جيموكا في مصر والشرق الأوسط',
      titleEn: 'Unified Brand Identity for Gimoka in Egypt & Regional Retail',
      tag: 'الهوية التسويقية',
      tagEn: 'Brand Identity',
      desc: 'الصورة التأسيسية للهوية الإعلانية التي ميزت جيموكا على منصات التواصل الاجتماعي ومواقع الشراء الإلكتروني.',
      descEn: 'The flagship advertising visual that established Gimoka as an aspirational yet accessible Italian coffee brand.'
    }
  ],
  'cs-b2c-concrete': [
    {
      id: 'concrete-c-1',
      url: '/assets/concrete/concrete_img_4.jpg',
      title: 'إطلاق تشكيلة البدل الرجالية الإيطالية والمناسبات الرسمية',
      titleEn: 'Bespoke Italian Suiting & Black-Tie Formal Collection Launch',
      tag: 'البدل والمناسبات الفاخرة',
      tagEn: 'Formal Suiting',
      desc: 'تصميم إعلاني فائق الأناقة يبرز دقة الخياطة وتفاصيل الأقمشة الصوفية الإيطالية الفاخرة المخصصة لرجال الأعمال والمناسبات.',
      descEn: 'High-fashion campaign visual showcasing master tailoring, Italian wool weaves, and bespoke silhouettes for executives.'
    },
    {
      id: 'concrete-c-2',
      url: '/assets/concrete/concrete_img_5.jpg',
      title: 'حملات المواسم والتخفيضات مع الحفاظ على هيبة وفخامة العلامة',
      titleEn: 'Seasonal Campaign & Luxury Promotional Footfall Drive',
      tag: 'عروض ومجموعات المواسم',
      tagEn: 'Seasonal Campaigns',
      desc: 'حملات تسويقية ذكية تنشط المبيعات وتدفق الزوار إلى فروع المتاجر دون المساس بالمكانة النخبوية لعلامة كونكريت.',
      descEn: 'Strategic promotional creatives driving store footfall and e-commerce cart velocity while safeguarding heritage luxury prestige.'
    },
    {
      id: 'concrete-c-3',
      url: '/assets/concrete/concrete_img_6.jpg',
      title: 'أناقة الإطلالات اليومية والملابس الكاجوال الذكية (Smart Casual)',
      titleEn: 'Smart Casual Styling & Modern Executive Everyday Elegance',
      tag: 'الكاجوال الذكي واللايف ستايل',
      tagEn: 'Smart Casual',
      desc: 'إبراز تناسق القطع اليومية من القمصان والبليزرات والأحذية لتشجيع عمليات الشراء المتعددة للقطع المتكاملة.',
      descEn: 'Curated mix-and-match styling visuals highlighting premium shirts, blazers, and chinos for seamless basket upselling.'
    },
    {
      id: 'concrete-c-4',
      url: '/assets/concrete/concrete_img_7.jpg',
      title: 'المجموعات الشتوية والبالطو الصوف والمعاطف الفاخرة',
      titleEn: 'Winter Outerwear, Cashmere & Fine Wool Overcoat Collection',
      tag: 'المجموعات الشتوية الفاخرة',
      tagEn: 'Winter Outerwear',
      desc: 'تسليط الضوء على دفء وجودة الصوف الإيطالي والتفاصيل الحرفية للمعاطف الكلاسيكية في موسم ذروة الشتاء.',
      descEn: 'Highlighting Italian wool insulation and timeless tailoring across flagship luxury winter coats during seasonal cold.'
    },
    {
      id: 'concrete-c-5',
      url: '/assets/concrete/concrete_img_8.jpg',
      title: 'حملات الأعياد والمواسم وباقات الهدايا الفاخرة',
      titleEn: 'Holiday Gifting Bundles & Premium Retail Experience',
      tag: 'باقات وهدايا الأعياد',
      tagEn: 'Holiday Gifting',
      desc: 'حملات موجهة لهدايا الأعياد والمناسبات تجمع بين الإكسسوارات الفاخرة ورابطات العنق والقمصان في علب إهداء راقية.',
      descEn: 'Targeted luxury gift guide campaigns pairing accessories, silk ties, and premium dress shirts in bespoke gift packaging.'
    },
    {
      id: 'concrete-c-6',
      url: '/assets/concrete/concrete_img_3.png',
      title: 'الهوية البصرية التحريرية والكتالوجات الرقمية التفاعلية',
      titleEn: 'Editorial Fashion Lookbook & Interactive Digital Catalog',
      tag: 'الكتالوجات الرقمية',
      tagEn: 'Digital Lookbook',
      desc: 'كتالوجات تفاعلية تمكن العميل من تصفح الإطلالة كاملة وطلب المقاس مباشرة عبر المتجر الإلكتروني أو حجز موعد قياس بالفروع.',
      descEn: 'Interactive digital lookbooks enabling clients to explore complete styles and order directly or book in-store fitting.'
    }
  ],
  'cs-b2c-memar-lashin': [
    {
      id: 'lashin-c-1',
      url: '/assets/memar-lashin/memar-lashin_img_4.jpg',
      title: 'طرح الوحدات السكنية الفاخرة وأنظمة السداد الميسرة',
      titleEn: 'Luxury Residential Units Launch & Flexible Installment Plans',
      tag: 'أنظمة السداد والتعاقد',
      tagEn: 'Installment Schemes',
      desc: 'تصميم إعلاني عالي الجاذبية يركز على قيمة التملك الحر بمقدم حجز مرن وفترات سداد ميسرة دون أعباء فوائد مركبة.',
      descEn: 'High-converting campaign visual highlighting low down payment barriers and extended installment flexibility.'
    },
    {
      id: 'lashin-c-2',
      url: '/assets/memar-lashin/memar-lashin_img_5.jpg',
      title: 'استثمار عقاري آمن وقيمة متصاعدة في قلب التجمع والشروق',
      titleEn: 'Secure Real Estate Investment & Capital Growth in Prime Locations',
      tag: 'الموقع والعائد الاستثماري',
      tagEn: 'Location & ROI',
      desc: 'إبراز الموقع الاستراتيجي للمشروعات وقربها من المحاور الحيوية مع التركيز على العائد الاستثماري السنوي المتصاعد.',
      descEn: 'Highlighting strategic arterial road connectivity and year-on-year property appreciation in New Cairo & Shorouk.'
    },
    {
      id: 'lashin-c-3',
      url: '/assets/memar-lashin/memar-lashin_img_6.jpg',
      title: 'تصميم معماري معاصر وتشطيبات فندقية راقية',
      titleEn: 'Contemporary Architectural Design & Hotel-Grade Finishes',
      tag: 'الجودة المعمارية والتشطيب',
      tagEn: 'Architecture & Finishes',
      desc: 'عرض الواجهات الحديثة والمساحات الذكية وتوزيع الإضاءة الطبيعية لرفع القيمة المدركة لدى المشتري النهائي.',
      descEn: 'Showcasing contemporary facades, smart spatial planning, and natural lighting to maximize buyer perceived value.'
    },
    {
      id: 'lashin-c-4',
      url: '/assets/memar-lashin/memar-lashin_img_7.jpg',
      title: 'حملات التملك السكني للمصريين العاملين بالخارج',
      titleEn: 'Expatriate Home Acquisition & Direct Booking Funnels',
      tag: 'استهداف المغتربين',
      tagEn: 'Expatriate Living',
      desc: 'رسائل تسويقية موجهة للأسر والمغتربين بالخليج وأوروبا تسهل إجراءات المعاينة الافتراضية والتعاقد السريع.',
      descEn: 'Tailored ad campaigns for Gulf and European expatriates offering virtual walkthroughs and streamlined contracts.'
    },
    {
      id: 'lashin-c-5',
      url: '/assets/memar-lashin/memar-lashin_img_8.jpg',
      title: 'عروض الحجز المبكر والباقات الحصرية للمشروعات الجديدة',
      titleEn: 'Early-Bird Booking Privileges & Exclusive Phase Launches',
      tag: 'إطلاق المراحل الجديدة',
      tagEn: 'Phase Launch Offers',
      desc: 'حملات إطلاق سريعة تولد زخماً شرائياً في الأسبوع الأول لفتح باب الحجز للمراحل الجديدة من المشروعات السكنية.',
      descEn: 'Rapid phase-launch campaigns generating high urgency and immediate reservation velocity in week one.'
    },
    {
      id: 'lashin-c-6',
      url: '/assets/memar-lashin/memar-lashin_img_3.png',
      title: 'الهوية البصرية الشاملة ومواد التسويق الميداني',
      titleEn: 'Comprehensive Visual Branding & Sales Collateral',
      tag: 'الهوية الإعلانية',
      tagEn: 'Brand Identity',
      desc: 'تطوير الخط البصري للمطبوعات والكتالوجات الرقمية والإعلانات الممولة لترسيخ هيبة معمار لاشين في سوق العقارات.',
      descEn: 'Developing premium visual consistency across digital sales decks, brochures, and performance creatives.'
    }
  ],
  'cs-b2c-binaryracks': [
    {
      id: 'binaryracks-c-1',
      url: '/assets/binaryracks/binaryracks_img_4.png',
      title: 'بنية سيرفرات سحابية فائقة الأداء للمتاجر والمواقع الرقمية',
      titleEn: 'High-Performance Cloud Server Infrastructure for E-Commerce',
      tag: 'هوية سحابية وأداء فائق',
      tagEn: 'Cloud Architecture',
      desc: 'تصميم إعلاني رقمي يبرز قوة البنية السحابية لباينري راكس وسرعة الاستجابة المذهلة في مواسم الضغط وحملات التخفيضات.',
      descEn: 'Digital performance campaign creative highlighting ultra-low latency and infrastructure resilience during peak traffic.'
    },
    {
      id: 'binaryracks-c-2',
      url: '/assets/binaryracks/binaryracks_img_5.jpg',
      title: 'استقرار بنسبة 99.98% وحماية بيانات مؤسسية غير قابلة للاختراق',
      titleEn: '99.98% Guaranteed Uptime & Enterprise Data Protection',
      tag: 'موثوقية وأمان البيانات',
      tagEn: 'Security & SLA Uptime',
      desc: 'تسليط الضوء على معايير الأمان وجدران الحماية المتقدمة (DDoS Protection) والنسخ الاحتياطي التلقائي لمواقع العملاء.',
      descEn: 'Highlighting multi-layer DDoS protection, disaster recovery, and automated enterprise backups ensuring zero data loss.'
    },
    {
      id: 'binaryracks-c-3',
      url: '/assets/binaryracks/binaryracks_img_6.jpg',
      title: 'مضاعفة سرعة تحميل المتاجر الإلكترونية وتحسين تصنيف SEO',
      titleEn: 'Accelerating E-Commerce Speed & Optimizing Core Web Vitals',
      tag: 'تسريع المتاجر و الـ SEO',
      tagEn: 'E-Commerce Speed',
      desc: 'حملة موجهة لأصحاب المتاجر تبرز العلاقة المباشرة بين سرعة السيرفر ومعدل إتمام الشراء وخفض سلات الشراء المتروكة.',
      descEn: 'Targeted merchant campaign demonstrating the direct link between server response times and checkout conversion rates.'
    },
    {
      id: 'binaryracks-c-4',
      url: '/assets/binaryracks/binaryracks_img_7.jpg',
      title: 'دعم فني متخصص على مدار الساعة 24/7 بلغة عربية مباشرة',
      titleEn: '24/7 Dedicated Local Technical Support in Arabic & English',
      tag: 'خدمة العملاء والدعم المباشر',
      tagEn: '24/7 Live Support',
      desc: 'رسائل تسويقية تكسر الحاجز النفسي مقارنة بالمزودين الأجانب؛ دعم فني مباشر وسريع يحل مشاكل المطورين في دقائق.',
      descEn: 'Overcoming buyer friction against global hosting providers with responsive localized engineering support available 24/7.'
    },
    {
      id: 'binaryracks-c-5',
      url: '/assets/binaryracks/binaryracks_img_8.jpg',
      title: 'باقات استضافة سحابية وسيرفرات VPS مرنة تلائم كل حجم',
      titleEn: 'Scalable Cloud VPS & Shared Hosting Retainers for Every Size',
      tag: 'باقات وحلول مرنة',
      tagEn: 'Scalable Hosting Plans',
      desc: 'استعراض الباقات والترقية الفورية بنقرة زر بدون توقف الخدمة مع أسعار تنافسية بالعملة المحلية وعروض تجريبية مجانية.',
      descEn: 'Instant zero-downtime scaling with transparent local currency pricing and frictionless trial onboarding funnels.'
    }
  ],
  'cs-med-ipt': [
    {
      id: 'ipt-c-1',
      url: '/assets/ipt/ipt_creative_1.jpg',
      title: 'حملة التوعية بآلام العمود الفقري والعلاج الطبيعي التخصصي',
      titleEn: 'Spine Rehabilitation & Specialized Physical Therapy Awareness',
      tag: 'التوعية الطبية',
      tagEn: 'Medical Education',
      desc: 'منشورات طبية تشرح أسباب الانزلاق الغضروفي وتمارين التأهيل الحديثة بإشراف الأخصائيين المعتمدين.',
      descEn: 'Educational clinical infographics illustrating disc herniation recovery and guided rehabilitation protocols.'
    },
    {
      id: 'ipt-c-2',
      url: '/assets/ipt/ipt_creative_2.jpg',
      title: 'تصاميم توثيق نتائج المرضى والتحسن الحركي بعد جلسات العلاج',
      titleEn: 'Clinical Outcomes & Mobility Improvement Patient Showcases',
      tag: 'نتائج العلاج',
      tagEn: 'Clinical Results',
      desc: 'استعراض قصص نجاح حقيقية لمرضى استعادوا قدرتهم على الحركة الطبيعية بدون جراحة بفضل برامج المركز.',
      descEn: 'Real patient mobility testimonials and non-surgical recovery journeys building deep community trust.'
    },
    {
      id: 'ipt-c-3',
      url: '/assets/ipt/ipt_creative_3.jpg',
      title: 'إعلانات استهداف الحالات الطبية وحجز مواعيد الكشف والتقييم',
      titleEn: 'Targeted Patient Booking Ads & Diagnostic Consultation Funnels',
      tag: 'حجوزات العيادة',
      tagEn: 'Patient Bookings',
      desc: 'مسارات إعلانية مخصصة للمناطق الجغرافية المحيطة بالمركز لتسهيل حجز الجلسات التشخيصية والعلاجية.',
      descEn: 'Hyper-local geographic ad funnels driving qualified appointment bookings for physiotherapy sessions.'
    },
    {
      id: 'ipt-c-4',
      url: '/assets/ipt/ipt_creative_4.jpg',
      title: 'إبراز أحدث أجهزة العلاج بالموجات والليزر والتأهيل الرياضي',
      titleEn: 'Advanced Laser, Shockwave & Sports Rehab Equipment Spotlight',
      tag: 'الأجهزة الحديثة',
      tagEn: 'Medical Technology',
      desc: 'تسليط الضوء على تقنيات المركز المتطورة التي تسرع التعافي وتخفف الألم من الجلسة الأولى.',
      descEn: 'Showcasing state-of-the-art shockwave and therapeutic laser technologies providing rapid pain relief.'
    }
  ],
  'cs-b2c-penguin': [
    {
      id: 'penguin-c-1',
      url: '/assets/penguin/penguin_top_1.jpg',
      title: 'حملة العودة للمدارس: ثلاجات بينجوين العائلية (330 - 390 لتر)',
      titleEn: 'Back to School Campaign: Family Refrigerators (330-390L)',
      tag: 'موسم المدارس',
      tagEn: 'Seasonal Peak',
      desc: 'إبراز سعة التخزين العملية وجودة التبريد لتجهيز وجبات البيت اليومية.',
      descEn: 'Highlighting functional storage volume and fresh preservation for daily family meals.'
    },
    {
      id: 'penguin-c-2',
      url: '/assets/penguin/penguin_top_2.jpg',
      title: 'حملة التقسيط والشراكات: تقسيط 12 شهراً مع ValU وموزعي 2B',
      titleEn: 'Installment & Retail Partnership: 12-Month 0% via ValU & 2B',
      tag: 'عروض التقسيط',
      tagEn: 'Financial Offers',
      desc: 'تسهيل الشراء بمقدم 0% وبدون فوائد لكافة أجهزة التبريد ومبردات المياه والمراوح.',
      descEn: '0% down payment and zero interest across freezers, water dispensers, and fans.'
    },
    {
      id: 'penguin-c-3',
      url: '/assets/penguin/penguin_creative_1.jpg',
      title: 'حملة الصيف: الركن اللي كله برودة — تكنولوجيا إيطالية',
      titleEn: 'Summer Campaign: The Coolest Corner — Italian Tech',
      tag: 'حملة الصيف',
      tagEn: 'Summer Launch',
      desc: 'كمبروسر استوائي وغاز صديق للبيئة مع مظهر ميني بار عصري وأنيق.',
      descEn: 'Tropical compressor and CFC-free refrigerant with a sleek modern minibar layout.'
    },
    {
      id: 'penguin-c-4',
      url: '/assets/penguin/penguin_creative_2.jpg',
      title: 'تصميم مبردات المياه: مياه باردة وساخنة مع أمان كامل',
      titleEn: 'Water Dispensers: Instant Hot & Cold with Full Safety',
      tag: 'مبردات المياه',
      tagEn: 'Dispensers',
      desc: 'استهداف المكاتب والمنازل بمنتج عملي يدوم طويلاً وبأعلى كفاءة طاقة.',
      descEn: 'Targeting homes and executive offices with high-durability and energy-saving performance.'
    },
    {
      id: 'penguin-c-5',
      url: '/assets/penguin/penguin_creative_3.jpg',
      title: 'حملة الديب فريزر: تجميد فائق مع أسرع إذابة للثلوج',
      titleEn: 'Deep Freezers: Super Freezing with Fast Defrosting',
      tag: 'ديب فريزر',
      tagEn: 'Deep Freezers',
      desc: 'حلول تخزين اللحوم والمجمدات العائلية بمكونات إيطالية معتمدة.',
      descEn: 'Long-term storage solutions for household frozen meats with certified Italian parts.'
    },
    {
      id: 'penguin-c-6',
      url: '/assets/penguin/penguin_creative_4.jpg',
      title: 'تصميم ترويجي: متانة استثنائية وضمان حقيقي',
      titleEn: 'Promotional Feature: Unmatched Durability & Warranty',
      tag: 'ضمان وجودة',
      tagEn: 'Quality Trust',
      desc: 'بناء ثقة المشتري عبر إبراز شهادات الجودة وشبكة مراكز الصيانة وخدمة ما بعد البيع.',
      descEn: 'Strengthening buyer confidence through warranty coverage and certified service hubs.'
    },
    {
      id: 'penguin-c-7',
      url: '/assets/penguin/penguin_creative_5.jpg',
      title: 'حملة عروض الصيف الكبرى: انتعاش وتوفير',
      titleEn: 'Mega Summer Deals: Cool Refreshment & Value Savings',
      tag: 'عروض كبرى',
      tagEn: 'Mega Deals',
      desc: 'باقات ترويجية خاصة على المراوح ومبردات المياه في أشهر الذروة الحارة.',
      descEn: 'Exclusive promotional bundles on standing fans and dispensers during peak summer heat.'
    },
    {
      id: 'penguin-c-8',
      url: '/assets/penguin/penguin_creative_6.jpg',
      title: 'تصميم تعريفي: تكنولوجيا التبريد الإيطالية في منزلك',
      titleEn: 'Brand Authority: Certified Italian Technology in Your Home',
      tag: 'هوية البراند',
      tagEn: 'Brand Identity',
      desc: 'ترسيخ تموضع العلامة التجارية كبديل أوروبي موثوق وعالي الجودة بسعر منافس.',
      descEn: 'Establishing brand authority as a premium European-grade alternative at competitive pricing.'
    }
  ]
};

/**
 * Returns the effective list of creatives for any case study.
 * If the user has saved custom creatives or added plans/images in the Admin Portal,
 * those are returned. Otherwise, returns the default curated creative assets or falls back to gallery images.
 */
export function getCaseStudyCreatives(
  studyId: string,
  caseStudy?: CaseStudy
): CaseStudyCreative[] {
  // If custom creatives are explicitly saved in the case study object (even if modified/empty)
  if (caseStudy?.customCreatives && caseStudy.customCreatives.length > 0) {
    return caseStudy.customCreatives;
  }

  // Check predefined dictionary
  const defaults = DEFAULT_CREATIVES_BY_CASE_STUDY[studyId];
  if (defaults && defaults.length > 0) {
    return defaults;
  }

  // Fallback: build from case study gallery if available
  if (caseStudy?.gallery && caseStudy.gallery.length > 0) {
    return caseStudy.gallery.map((url, idx) => ({
      id: `${studyId}-gallery-${idx}`,
      url,
      title: `${caseStudy.title} — نموذج إعلاني ${idx + 1}`,
      titleEn: `${caseStudy.titleEn || caseStudy.title} — Asset ${idx + 1}`,
      tag: 'معرض الأعمال',
      tagEn: 'Portfolio Asset',
      desc: 'أحد النماذج والتصاميم الإعلانية المنفذة ضمن الحملة التسويقية الشاملة.',
      descEn: 'A verified creative visual and strategic asset delivered as part of the overall marketing campaign.'
    }));
  }

  return [];
}

/**
 * Returns the effective list of videos for any case study.
 */
export function getCaseStudyVideos(caseStudy?: CaseStudy): CaseStudyVideo[] {
  if (caseStudy?.videos && caseStudy.videos.length > 0) {
    return caseStudy.videos;
  }

  if (caseStudy?.videoUrl) {
    return [
      {
        id: `${caseStudy.id}-video-primary`,
        url: caseStudy.videoUrl,
        title: 'فيديو الحملة التوثيقي',
        titleEn: 'Campaign Video Showcase',
        desc: 'مقطع فيديو توثيقي يستعرض كواليس وأبعاد الاستراتيجية المنفذة والنتائج المحققة.',
        descEn: 'Documentary video showcase detailing strategic campaign execution and measured impact.',
        type: 'embed'
      }
    ];
  }

  // Known default videos by study ID if not already defined
  if (caseStudy?.id === 'cs-b2c-penguin') {
    return [
      {
        id: 'penguin-vid-default',
        url: 'https://digitaleffect.net/wp-content/uploads/2026/09/AQPUBQ3P47zGr6fhq_bjLfjTH848LQPtgBcI0Eg-DY65297wcQSeHQg6r6eP_-4IrQ-jLCx5uHnriibWQzauH6gcdryevazahVwZgrA6niA1fA.mp4',
        title: 'ريلز إعلاني موشن جرافيك — تكنولوجيا التبريد الإيطالية',
        titleEn: 'Featured Motion Reel — Italian Cooling Tech',
        desc: 'إبراز التكنولوجيا الإيطالية وجودة التبريد الاستوائي ومميزات الثلاجات والديب فريزر.',
        descEn: 'Showcasing Italian engineering, tropical cooling, and durability features across Penguin appliances.',
        type: 'direct'
      }
    ];
  }

  return [];
}
