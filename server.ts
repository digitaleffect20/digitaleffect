import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio dev server must run strictly on port 3000
const port = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const DATA_STORE_PATH = path.resolve(__dirname, 'data-store.json');

// Endpoint: Get persisted agency data (case studies, packages, etc.)
app.get('/api/agency-data', (_req, res) => {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const content = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
      return res.json(JSON.parse(content));
    }
  } catch (err) {
    console.warn('Error reading data-store.json:', err);
  }
  res.json(null);
});

// Endpoint: Save / update persisted agency data on the server
app.post('/api/agency-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.caseStudies) {
      return res.status(400).json({ error: 'Invalid payload structure' });
    }
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    res.json({ success: true, message: 'Agency data persisted to server successfully' });
  } catch (err: any) {
    console.error('Error saving data-store.json:', err);
    res.status(500).json({ error: 'Failed to write agency data on server' });
  }
});

// Cloudflare GeoIP local development emulator
app.get('/api/geo', (req, res) => {
  const cfCountry = (req.headers['cf-ipcountry'] as string) || null;
  res.json({
    country: cfCountry ? cfCountry.toUpperCase() : null,
    isDetected: Boolean(cfCountry),
  });
});

// Endpoint: AI Creative / Plan Image Analyzer using Gemini Vision
app.post('/api/analyze-creative-image', async (req, res) => {
  try {
    const { imageBase64, imageUrl, projectName, sector } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // Prepare image part for Gemini
    let imagePart: any = null;
    const targetSource = imageBase64 || imageUrl;

    if (targetSource && targetSource.startsWith('data:')) {
      const matches = targetSource.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        imagePart = {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        };
      }
    }

    const fallbackResponse = {
      title: `تصميم وخطة إعلانية استراتيجية — ${projectName || 'ديجيتال إفكت'}`,
      titleEn: `Strategic Ad Creative & Plan — ${projectName || 'Digital Effect'}`,
      tag: 'خطة تسويقية',
      tagEn: 'Marketing Plan',
      desc: `تصميم إعلاني وخطة تسويقية متكاملة لمشروع ${projectName || 'المشروع'} تهدف لترسيخ المكانة السوقية وزيادة التحويل والمبيعات.`,
      descEn: `Integrated ad creative and marketing plan asset for ${projectName || 'Project'} designed to maximize conversions and brand authority.`
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ ...fallbackResponse, note: 'Used intelligent fallback (GEMINI_API_KEY not configured)' });
    }

    const promptText = `أنت خبير تسويق رقمي وإدارة حملات إعلانية في وكالة ديجيتال إفكت (Digital Effect).
قم بفحص وتحليل هذه الصورة المرفقة بدقة بالغة (قد تكون تصميماً إعلانياً، بوستر سوشيال ميديا، خطة تسويقية/بلان، صورة منتج أو كتالوج، أو رسم بياني للأداء).
سياق المشروع/العميل الحالي: "${projectName || 'مشروع تسويقي'}"، القطاع: "${sector || 'عام'}".

المطلوب:
استخرج وحلل محتوى الصورة بعناية شديدة، ثم أنشئ بيانات تسويقية متقنة بصيغة JSON فقط بهذه الحقول المحددة:
1. "title": عنوان رئيسي جذاب وموجز ودقيق باللغة العربية (بين 5 و 12 كلمة) يلخص ما تحتويه الصورة/الخطة وقيمتها الترويجية مع ذكر المنتج أو الخدمة البارزة.
2. "titleEn": عنوان احترافي مقابل باللغة الإنجليزية.
3. "tag": تصنيف تسويقي دقيق من كلمة أو كلمتين بالعربية يلائم المحتوى (مثل: "خطة تسويقية", "إعلانات تحويلية", "هوية رقمية", "تصميم إعلاني", "حملة الصيف", "عروض وتخفيضات", "توعية طبية", "موشن جرافيك", "أداء سحابي").
4. "tagEn": التصنيف المقابل باللغة الإنجليزية (e.g. "Ad Creative", "Marketing Plan", "Brand Campaign", "Seasonal Offer").
5. "desc": شرح تسويقي احترافي متكامل من جملتين إلى 3 جمل بالعربية يصف سياق الحملة، القيمة المضافة المعروضة في الصورة، الجمهور المستهدف، والهدف الترويجي.
6. "descEn": الشرح المقابل باللغة الإنجليزية.

أجب بصيغة JSON فقط بدون نصوص تمهيدية.`;

    const parts: any[] = [];
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: promptText });

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let resultJson = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response.text) {
          const cleanText = response.text.replace(/```json\n?|\n?```/g, '').trim();
          resultJson = JSON.parse(cleanText);
          if (resultJson.title) break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} error during image analysis:`, err?.message || err);
      }
    }

    if (resultJson && resultJson.title) {
      return res.json(resultJson);
    }

    return res.json(fallbackResponse);
  } catch (err: any) {
    console.error('Error analyzing creative image with AI:', err);
    return res.json({
      title: `تصميم إعلاني رقمي متكامل — ${req.body?.projectName || 'المشروع'}`,
      titleEn: `Integrated Digital Creative — ${req.body?.projectName || 'Project'}`,
      tag: 'تصميم إعلاني',
      tagEn: 'Ad Creative',
      desc: `تصميم إعلاني رقمي عالي الجودة يعزز التفاعل وتوليد الطلبات للعميل.`,
      descEn: `High-impact digital creative designed to maximize engagement and lead generation.`
    });
  }
});

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
أنت "المساعد الذكي لوكالة ديجيتال إفكت" (Digital Effect AI Advisor).
ديجيتال إفكت هي وكالة تسويق وحلول رقمية رائدة بخبرة تزيد عن ١٢ عاماً في السوق وخبرة تراكمية تتجاوز ٢٠ عاماً لشركائها وفريقها، ولها مقرات في القاهرة (التجمع الخامس) ودبي (الخليج التجاري).

مهمتك:
مساعدة العملاء والإجابة عن كافة استفساراتهم حول:
1. قطاعات الوكالة الثلاثة الرئيسية:
   - قطاع الشركات والمصانع (B2B): استراتيجيات ABM، إعلانات LinkedIn الموجهة، جذب العقود السنوية، صناعة المحتوى التخصصي والوثائقيات للمصانع، أتمتة الـ CRM. دراسات حالة بارزة: جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)، مجموعة الفنار للمعدات الثقيلة، كلاود مايند للـ ERP.
   - قطاع التجزئة والمستهلكين (B2C): مضاعفة المبيعات والمتاجر الإلكترونية، إعلانات Meta وتيك توك، إنتاج مقاطع فيديو ريلز وموشن جرافيك، حملات التقسيط البنكي (ValU و 2B). دراسات حالة بارزة: بينجوين للأجهزة المنزلية والتبريد، باينري راكس للاستضافة السحابية، قهوة جيموكا الإيطالية، معمار لاشين للتطوير العقاري، كونكريت للملابس، أكتون، يوكين، سيلتال، هامبورج، باساب (16898)، والوعد للسياحة.
   - القطاع الطبي والرعاية الصحية (Medical): التسويق الطبي الأخلاقي المعتمد، إنتاج فيديوهات الأطباء التوعوية، تصدر خرائط جوجل والبحث المحلي (Google Maps SEO)، مسارات الحجز الفوري وتحويل المشاهدات إلى مواعيد عيادة مؤكدة. دراسة حالة بارزة: مركز IPT للعلاج الطبيعي والتأهيل الحركي.

2. باقات الوكالة والأسعار:
   - باقات B2B: الباقة الاحترافية، وباقة الشركات الكبرى المخصصة (Custom Scope).
   - باقات B2C: الباقة الأساسية، باقة النمو، باقة التوسع ومقاطع الفيديو.
   - باقات Medical: باقة العيادات التخصصية، باقة المجمعات والمستشفيات، مع عروض الخصم الربع سنوي التي توفر حتى ١٧,٧٠٠ ج.م.

3. التواصل والحجز:
   - الهاتف والواتساب: 01505000349 (+20 150 500 0349)
   - البريد الإلكتروني: Sales@digitaleffect.net
   - تشجيع العميل دائماً على حجز استشارة مجانية مع خبراء الوكالة أو التواصل المباشر عبر الواتساب لدراسة مشروعه بالتفصيل.

أسلوب الرد:
- مهني، ودود، رصين، وواضح ومختصر.
- أجب بنفس لغة العميل (عربي افتراضياً، أو إنجليزي إذا سأل بالإنجليزية).
- استخدم نقاطاً مرتبة ومعلومات دقيقة تلائم نشاط العميل.
`;

function getIntelligentFallbackReply(userText: string, sectorContext?: string): string {
  const query = (userText || '').toLowerCase();
  const isEnglish = /[a-zA-Z]{3,}/.test(query) && !/[\u0600-\u06FF]/.test(query);

  if (isEnglish) {
    if (query.includes('medical') || query.includes('clinic') || query.includes('doctor') || query.includes('hospital') || query.includes('ipt') || sectorContext === 'medical') {
      return `Welcome to **Digital Effect - Medical Sector**!
With over 12 years of experience, we provide certified ethical medical growth solutions:

1. **Specialized Clinics Package**:
   - Targeted medical ad campaigns to drive qualified patient appointments.
   - Google Maps Medical SEO & local discovery.
   - Doctor awareness reel production and scripting.
   - Streamlined digital booking funnels.

2. **Medical Centers & Hospitals Package**:
   - Multi-specialty marketing & departmental coverage.
   - High-end documentary video & facility walk-throughs.
   - Automated CRM response and consultation booking.

🎁 **Quarterly Retainer Discount**:
Sign up for a 3-month retainer and save up to **17,700 EGP** on the full medical growth bundle!

📌 Check out our flagship case study: **IPT Physical Therapy & Rehabilitation Center**.
For immediate consultation, reach us on WhatsApp: **01505000349** (+20 150 500 0349).`;
    }

    if (query.includes('b2b') || query.includes('business') || query.includes('industrial') || query.includes('factory') || query.includes('bsizia') || sectorContext === 'b2b') {
      return `Welcome to **Digital Effect - B2B Sector**!
We empower manufacturers and enterprise businesses to secure long-term contracts and build market authority:

- **Account-Based Marketing (ABM)**: Precision LinkedIn targeting of C-level decision-makers and procurement managers.
- **Factory Documentaries & Technical Content**: Showcasing production lines, machinery, and capacity.
- **CRM & Sales Pipeline Automation**: Real-time lead tracking and CRM integration.

📌 **Flagship B2B Clients**: Beni Suef Industrial Zone Investors Association (BSIZIA), El-Fanar Heavy Equipment, and CloudMind ERP.
Chat with our enterprise advisors on WhatsApp: **01505000349** (+20 150 500 0349).`;
    }

    if (query.includes('b2c') || query.includes('retail') || query.includes('sales') || query.includes('store') || query.includes('penguin') || sectorContext === 'b2c') {
      return `Welcome to **Digital Effect - B2C Sector**!
We scale direct-to-consumer brands and retail revenue with high-impact creative campaigns:

- **High-ROAS Ad Campaigns**: Performance marketing across Meta, TikTok, and Google.
- **Creative Production**: Viral Reels, TikTok creative series, motion graphics, and product shoots.
- **Retail & Installment Campaigns**: Zero-interest promo launches with partners like ValU and 2B.

📌 **Featured Brands**: Penguin Home Appliances, Binary Racks, Gimoka Coffee, Memar Lashin, Concrete, Passap, and Al Waad Travel.
Connect with our creative team on WhatsApp: **01505000349** (+20 150 500 0349).`;
    }

    if (query.includes('price') || query.includes('cost') || query.includes('package') || query.includes('pricing')) {
      return `Digital Effect provides customized and fixed packages across 3 core sectors:
- **B2B**: ABM, LinkedIn management, factory documentary videos, and lead generation.
- **B2C**: Social media management, high-ROAS ads, Reels, and seasonal campaigns.
- **Medical**: Specialized clinic growth and center management, with quarterly discount savings up to **17,700 EGP**.

Explore our Packages section on the website or schedule a free strategy session with our team!`;
    }

    return `Welcome to **Digital Effect**!
We are an award-winning digital marketing agency with 12+ years in the market and 20+ years of collective leadership experience, operating from Cairo (New Cairo) and Dubai (Business Bay).

How can we assist you today?
- **Medical Sector**: Clinic marketing, doctor reels, Google Maps SEO, and quarterly discounts.
- **B2B Sector**: Enterprise ABM, LinkedIn campaigns, and factory documentaries.
- **B2C Sector**: Retail growth, viral video production, and performance ads.

Feel free to ask any question or chat with us on WhatsApp: **01505000349** (+20 150 500 0349).`;
  }

  // Arabic responses
  if (query.includes('طبي') || query.includes('ميديكال') || query.includes('عيادة') || query.includes('دكتور') || query.includes('مركز') || query.includes('ipt') || sectorContext === 'medical') {
    return `أهلاً بك! في **القطاع الطبي والرعاية الصحية (Medical)**، تقدم ديجيتال إفكت حلولاً تسويقية طبية متخصصة ومبنية على الامتثال الأخلاقي الكامل:

1. **باقة العيادات التخصصية**:
   - إدارة الحملات الطبية المركزة لجذب المرضى المناسبين.
   - تصدر خرائط جوجل والبحث المحلي (Google Maps Medical SEO).
   - إنتاج وتعديل مقاطع الفيديو التوعوية للأطباء.
   - مسار تحويل رقمي سلس لحجز المواعيد.

2. **باقة المراكز والمجمعات الطبية**:
   - إدارة متكاملة لكافة التخصصات والأقسام.
   - إنتاج تغطيات وثائقية وفيديوهات احترافية داخل المراكز.
   - أتمتة الردود وحجوزات المواعيد الطبية ومتابعة المرضى.

🎁 **عرض الخصم الربع سنوي**:
عند التعاقد الربع سنوي (٣ أشهر) نوفر خصماً مميزاً يصل توفيره إلى **١٧,٧٠٠ ج.م** على الباقة الشاملة.

📌 يمكنك الاطلاع على دراسة حالة عميلنا **مركز IPT للعلاج الطبيعي والتأهيل** من صفحة الدراسات في الموقع!
لأي استفسار إضافي أو لبدء خطتك فوراً، يمكنك مراسلتنا مباشرة على واتساب: **01505000349** (+20 150 500 0349).`;
  }

  if (query.includes('b2b') || query.includes('شركات') || query.includes('مصانع') || query.includes('مستثمر') || query.includes('صناعي') || query.includes('bsizia') || sectorContext === 'b2b') {
    return `أهلاً بك! في **قطاع الأعمال والشركات (B2B)**، نركز في ديجيتال إفكت على العقود طويلة الأجل وبناء الثقة المؤسسية:

- **استراتيجيات ABM (Account-Based Marketing)**: استهداف صناع القرار بدقة على LinkedIn.
- **صناعة المحتوى التخصصي والوثائقيات**: إبراز خطوط الإنتاج والقدرات التصنيعية للمصانع والشركات.
- **أتمتة المبيعات والـ CRM**: ربط الحملات الإعلانية بنظام إدارة العملاء لمتابعة الصفقات لحظة بلحظة.

📌 **أبرز شركاء النجاح**: دراسة حالة جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)، ومجموعة الفنار، وكلاود مايند.
تتوفر لدينا باقات مخصصة حسب حجم الشركة. للمزيد أو لحجز استشارة: **01505000349** (+20 150 500 0349).`;
  }

  if (query.includes('b2c') || query.includes('مبيعات') || query.includes('متاجر') || query.includes('ريلز') || query.includes('بينجوين') || query.includes('مستهلك') || sectorContext === 'b2c') {
    return `أهلاً بك! في **قطاع المستهلكين والتجزئة (B2C)**، نركز على تسريع المبيعات وتعزيز الانتشار الرقمي:

- **حملات التحويل العالي**: إعلانات Meta و TikTok مع التركيز على الـ ROAS (العائد على الإنفاق الإعلاني).
- **إنتاج المحتوى الإبداعي**: مقاطع Reels وفيديوهات تيك توك، موشن جرافيك، وتصوير منتجات عالي الدقة.
- **حملات المواسم والعروض**: حملات التقسيط والجمعة البيضاء وغيرها.

📌 **أبرز العلامات التجارية**: بينجوين للأجهزة المنزلية، باينري راكس، قهوة جيموكا، معمار لاشين، كونكريت، باساب، والوعد للسياحة.
يسعدنا دراسة خطتكم التسويقية مباشرة عبر الواتساب: **01505000349** (+20 150 500 0349).`;
  }

  if (query.includes('سعر') || query.includes('اسعار') || query.includes('باقة') || query.includes('باقات') || query.includes('تكلفة')) {
    return `أهلاً بك في ديجيتال إفكت!
لدينا باقات مصممة خصيصاً لكل قطاع:
- **قطاع B2B**: باقات مخصصة لتوليد العملاء المحتملين وصناع القرار.
- **قطاع B2C**: باقات تبدأ من إدارة السوشيال ميديا حتى الحملات الشاملة وإنتاج الفيديو الاحترافي.
- **القطاع الطبي**: باقات العيادات وباقات المراكز الطبية مع خصم ربع سنوي يوفر حتى **١٧,٧٠٠ ج.م**.

يمكنك تصفح صفحة الباقات في الموقع للاطلاع على تفاصيل كل باقة، أو الضغط على "حجز استشارة" للتحدث مع مستشارينا.`;
  }

  if (query.includes('تواصل') || query.includes('رقم') || query.includes('واتساب') || query.includes('عنوان') || query.includes('ايميل') || query.includes('مكان')) {
    return `يسعدنا تواصلك معنا دائماً!
- **الهاتف / واتساب**: 01505000349 (+20 150 500 0349)
- **البريد الإلكتروني**: Sales@digitaleffect.net
- **المقرات**: 
  - القاهرة: التجمع الخامس، القاهرة الجديدة
  - دبي: الخليج التجاري (Business Bay)
فريقنا متاح للرد على كافة استفساراتك على مدار الساعة!`;
  }

  return `مرحباً بك في ديجيتال إفكت (Digital Effect)!
نحن وكالة تسويق رقمي وحلول متكاملة بخبرة تتجاوز ١٢ عاماً في السوق العربي والخليجي.

كيف يمكنني مساعدتك اليوم؟
- هل تود الاستفسار عن باقات **القطاع الطبي (Medical)** وعروض الخصم؟
- أم خدمات وباقات **قطاع الشركات والمصانع (B2B)**؟
- أم حلول مضاعفة المبيعات لـ **قطاع التجزئة والمتاجر (B2C)**؟

يسعدني إرشادك لأفضل خيار أو يمكنك التواصل المباشر مع خبرائنا عبر الواتساب: **01505000349** (+20 150 500 0349).`;
}

// Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, sectorContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'مفتاح Gemini API غير مهيأ على الخادم. يرجى ضبط GEMINI_API_KEY في إعدادات البيئة.' 
      });
    }

    // Convert client messages to Gemini contents format
    // Map roles: 'user' -> 'user', 'assistant'/'model' -> 'model'
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Append context if sector is provided
    let instruction = SYSTEM_INSTRUCTION;
    if (sectorContext) {
      instruction += `\nسياق الصفحة الحالية للعميل: العميل يتصفح حالياً صفحة قطاع (${sectorContext}).`;
    }

    // Model calling with valid GenAI models
    let replyText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: instruction,
          },
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelName} returned error, trying fallback...`, callErr?.message || callErr);
      }
    }

    if (!replyText) {
      // Intelligently fallback to agency knowledge base during API spikes
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      replyText = getIntelligentFallbackReply(lastUserMessage, sectorContext);
    }

    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini API Error in /api/chat:', err);
    const lastUserMessage = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    const fallbackReply = getIntelligentFallbackReply(lastUserMessage, req.body?.sectorContext);
    return res.json({ reply: fallbackReply });
  }
});

// Setup Vite dev server or serve production build
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Digital Effect Server is running on http://0.0.0.0:${port}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
