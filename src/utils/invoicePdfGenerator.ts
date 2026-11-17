import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toPng } from 'html-to-image';
import { Inquiry } from '../types';
import { getClientDeliverableTargets } from './workflowUtils';

export interface InvoiceTransferInfo {
  instaPay: string;
  walletNumber: string;
}

export const DEFAULT_INVOICE_TRANSFER_INFO: InvoiceTransferInfo = {
  instaPay: '01004860386',
  walletNumber: '01004860386',
};

const TRANSFER_STORAGE_KEY = 'de_invoice_transfer_info_v2';

/**
 * Normalizes Arabic-Indic (٠-٩) & Eastern Arabic (۰-۹) numerals to standard ASCII digits.
 */
export function normalizeNumerals(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/\u066C/g, ',')
    .replace(/\u066B/g, '.');
}

/**
 * Safely extracts numeric currency amount from strings like "٥٠٠٠", "5,000 ج.م", "5000.00", etc.
 */
export function parseInvoiceAmount(value: string | number | undefined | null): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }
  if (!value) return 0;

  const normalized = normalizeNumerals(String(value).trim());
  const match = normalized.match(/\d[\d,]*(?:\.\d+)?/);
  if (!match) return 0;

  const parsed = parseFloat(match[0].replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function loadSavedTransferInfo(): InvoiceTransferInfo {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_INVOICE_TRANSFER_INFO;
    }
    const raw = window.localStorage.getItem(TRANSFER_STORAGE_KEY);
    if (!raw) return DEFAULT_INVOICE_TRANSFER_INFO;
    const parsed = JSON.parse(raw);
    return {
      instaPay: parsed.instaPay?.trim() || DEFAULT_INVOICE_TRANSFER_INFO.instaPay,
      walletNumber: parsed.walletNumber?.trim() || DEFAULT_INVOICE_TRANSFER_INFO.walletNumber,
    };
  } catch {
    return DEFAULT_INVOICE_TRANSFER_INFO;
  }
}

export function saveTransferInfo(info: Partial<InvoiceTransferInfo>): InvoiceTransferInfo {
  const current = loadSavedTransferInfo();
  const next: InvoiceTransferInfo = {
    instaPay: info.instaPay !== undefined ? info.instaPay : current.instaPay,
    walletNumber: info.walletNumber !== undefined ? info.walletNumber : current.walletNumber,
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'));
  if (imgs.length === 0) return;

  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return typeof img.decode === 'function'
          ? img.decode().catch(() => undefined)
          : Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 3000);
        const done = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    })
  );
}

export interface GenerateInvoicePdfOptions {
  client: Inquiry;
  packageName?: string;
  deliverables?: {
    posts: number;
    reels: number;
    stories: number;
  };
  totalCost?: string;
  adCreditAmount?: number;
  billingCycle?: Inquiry['billingCycle'];
  contractStartDate?: string;
  renewalDate?: string;
  invoiceNumber?: string;
  transferInfo?: Partial<InvoiceTransferInfo>;
  isAr?: boolean;
}

/**
 * Generates an official A4 Client Invoice PDF using jsPDF.
 * Renders package name, deliverables breakdown, total cost, client details,
 * payment terms, official agency stamp and bank/wallet transfer details.
 */
export async function generateClientInvoicePdf(
  options: GenerateInvoicePdfOptions
): Promise<{ success: boolean; filename: string; error?: string }> {
  const {
    client,
    packageName = client.packageName || (options.isAr !== false ? 'باقة تسويق رقمي مخصصة' : 'Custom Digital Marketing Package'),
    totalCost = client.budget || (options.isAr !== false ? '15,000 ج.م' : '15,000 EGP'),
    adCreditAmount = options.adCreditAmount ?? client.pendingInvoiceAdCredit ?? 0,
    billingCycle = client.billingCycle || 'monthly',
    contractStartDate = client.contractStartDate || client.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    renewalDate = client.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isAr = true,
  } = options;

  const savedTransfer = loadSavedTransferInfo();
  const transferInfo: InvoiceTransferInfo = {
    instaPay: options.transferInfo?.instaPay?.trim() || savedTransfer.instaPay,
    walletNumber: options.transferInfo?.walletNumber?.trim() || savedTransfer.walletNumber,
  };

  // Calculate numeric grand total including ad credit (supports Arabic-Indic & English digits)
  const parsedCost = parseInvoiceAmount(totalCost);
  const numericRetainer = parsedCost > 0 ? parsedCost : (client.retainerAmount || 0);
  const effectiveAdCredit = parseInvoiceAmount(adCreditAmount);
  const grandTotalNumeric = numericRetainer + effectiveAdCredit;

  const formattedRetainerStr = numericRetainer > 0
    ? `${numericRetainer.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
    : totalCost;

  const finalGrandTotalStr = grandTotalNumeric > 0
    ? `${grandTotalNumeric.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
    : totalCost;

  // Resolve deliverables count
  const resolvedTargets = options.deliverables
    ? {
        postsTarget: options.deliverables.posts,
        reelsTarget: options.deliverables.reels,
        storiesTarget: options.deliverables.stories,
      }
    : getClientDeliverableTargets(client);

  const postsCount = resolvedTargets.postsTarget;
  const reelsCount = resolvedTargets.reelsTarget;
  const storiesCount = resolvedTargets.storiesTarget;

  // Invoice Number
  const invoiceNumber =
    options.invoiceNumber ||
    `DE-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${client.id.replace(/\D/g, '').slice(-3) || '101'}`;

  const cleanCompany = (client.company || client.name).replace(/\s+/g, '_');
  const filename = `فاتورة_${cleanCompany}_${invoiceNumber}.pdf`;

  // Cycle text
  const cycleText =
    billingCycle === 'annual'
      ? (isAr ? 'سنوي (Annual Retainer)' : 'Annual Retainer')
      : billingCycle === 'quarterly'
      ? (isAr ? 'ربع سنوي (Quarterly Retainer)' : 'Quarterly Retainer')
      : (isAr ? 'شهري (Monthly Retainer)' : 'Monthly Retainer');

  // Check if an existing visible invoice container exists in the DOM (e.g. inside open modal)
  const existingDom = document.getElementById('invoice-document-capture');

  // Otherwise, construct an offscreen high-definition container
  let targetElement: HTMLElement;
  let isTemp = false;

  if (existingDom && existingDom.clientHeight > 200) {
    targetElement = existingDom;
  } else {
    isTemp = true;
    targetElement = document.createElement('div');
    targetElement.id = 'temp-invoice-generator';
    targetElement.dir = isAr ? 'rtl' : 'ltr';
    targetElement.style.position = 'fixed';
    targetElement.style.top = '-9999px';
    targetElement.style.left = '-9999px';
    targetElement.style.width = '794px'; // Standard A4 width at 96 DPI
    targetElement.style.minHeight = '1123px'; // Standard A4 height
    targetElement.style.backgroundColor = '#ffffff';
    targetElement.style.padding = '36px 40px';
    targetElement.style.fontFamily = 'Cairo, system-ui, -apple-system, sans-serif';
    targetElement.style.color = '#0f172a';
    targetElement.style.boxSizing = 'border-box';
    targetElement.style.zIndex = '-100';

    targetElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2px solid #0f172a;">
        <div>
          <div style="margin-bottom: 6px;">
            <img
              src="/assets/aistudio/Digital-effect-logo_d13b47e3.png"
              alt="Digital Effect Logo"
              crossorigin="anonymous"
              style="height: 46px; width: auto; max-width: 220px; object-fit: contain; display: block;"
            />
          </div>
          <p style="margin: 2px 0 0; font-size: 11px; font-weight: 800; color: #2563eb;">
            ${isAr ? 'ديجيتال إفكت للحلول الرقمية والتسويق الإلكتروني المتكامل' : 'Digital Effect — Digital Solutions & Integrated Marketing'}
          </p>
          <div style="margin-top: 5px; font-size: 10px; color: #64748b; line-height: 1.4;">
            <span>📍 ${isAr ? 'العاشر من رمضان — محافظة الشرقية — مصر' : '10th of Ramadan City, Egypt'}</span> • 
            <span>📞 01505000349</span> • 
            <span>✉️ sales@digitaleffect.net</span>
          </div>
        </div>

        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <div style="display: inline-block; padding: 4px 12px; background-color: #0f172a; color: #ffffff; border-radius: 8px; font-size: 11px; font-weight: 900; text-transform: uppercase;">
            ${isAr ? 'بيان فاتورة تعاقد رسمي' : 'OFFICIAL INVOICE STATEMENT'}
          </div>
          <div style="font-family: monospace; font-size: 12px; font-weight: 900; color: #1e293b; margin-top: 6px;">
            #${invoiceNumber}
          </div>
          <div style="font-size: 10.5px; color: #475569; margin-top: 4px; line-height: 1.4;">
            <div><strong>${isAr ? 'تاريخ الإصدار:' : 'Date:'}</strong> ${contractStartDate}</div>
            <div><strong>${isAr ? 'تاريخ الاستحقاق:' : 'Due Date:'}</strong> ${renewalDate}</div>
          </div>
        </div>
      </div>

      <!-- Billed to grid -->
      <div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 18px; padding: 14px 18px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;">
        <div>
          <span style="font-size: 9.5px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 3px;">
            ${isAr ? 'بيانات العميل / الجهة المتعاقدة:' : 'BILLED TO:'}
          </span>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a;">
            ${client.company || client.name}
          </div>
          ${client.company ? `<div style="color: #475569; font-weight: 600; margin-top: 2px;">${isAr ? 'المسؤول:' : 'Contact:'} ${client.name}</div>` : ''}
          <div style="color: #64748b; font-family: monospace; direction: ltr; text-align: ${isAr ? 'right' : 'left'}; margin-top: 2px;">
            📞 ${client.phone}
          </div>
        </div>

        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <span style="font-size: 9.5px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 3px;">
            ${isAr ? 'تفاصيل التعاقد والقطاع:' : 'CONTRACT DETAILS:'}
          </span>
          <div style="color: #0f172a; font-weight: 700;">
            ${isAr ? 'القطاع المستهدف:' : 'Sector:'} <span style="display: inline-block; padding: 1px 6px; background-color: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 9.5px; font-weight: 800;">${client.sector.toUpperCase()}</span>
          </div>
          <div style="color: #0f172a; font-weight: 700; margin-top: 3px;">
            ${isAr ? 'دورة المحاسبة:' : 'Billing Cycle:'} <span style="color: #1d4ed8;">${cycleText}</span>
          </div>
        </div>
      </div>

      <!-- Package Title Banner -->
      <div style="margin-top: 16px; padding: 14px 18px; border-radius: 12px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%); color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 9.5px; font-weight: 800; color: #93c5fd; text-transform: uppercase; display: block;">
            ${isAr ? 'الباقة التسويقية المعتمدة:' : 'OFFICIAL MARKETING PACKAGE:'}
          </span>
          <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-top: 2px;">
            ${packageName}
          </div>
        </div>
        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <span style="font-size: 9.5px; color: #cbd5e1; display: block;">
            ${isAr ? 'قيمة الاشتراك' : 'Retainer Rate'}
          </span>
          <div style="font-size: 17px; font-weight: 900; color: #6ee7b7;">
            ${formattedRetainerStr}
          </div>
        </div>
      </div>

      <!-- Deliverables Table -->
      <div style="margin-top: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a; border-bottom: 2px solid #cbd5e1; text-align: ${isAr ? 'right' : 'left'};">
              <th style="padding: 10px 12px; font-weight: 900;">${isAr ? 'البند / مخرجات الباقة' : 'Item / Deliverable'}</th>
              <th style="padding: 10px 12px; font-weight: 900;">${isAr ? 'المواصفات والتفاصيل' : 'Specifications'}</th>
              <th style="padding: 10px 12px; font-weight: 900; text-align: center;">${isAr ? 'الكمية الدورية' : 'Quantity'}</th>
              <th style="padding: 10px 12px; font-weight: 900; text-align: center;">${isAr ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 800; color: #0f172a;">
                🎨 ${isAr ? 'تصميمات ومنشورات السوشيال ميديا' : 'Social Media Creative Posts'}
              </td>
              <td style="padding: 10px 12px; color: #475569;">
                ${isAr ? 'تصميمات بصرية احترافية، كتابة محتوى تسويقي مدروس وكابشن، مع خطة نشر استراتيجية' : 'High-impact creative graphics, strategic copywriting, and scheduled social distribution'}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 900; color: #1d4ed8;">
                ${postsCount} ${isAr ? 'منشور' : 'Posts'}
              </td>
              <td style="padding: 10px 12px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #dcfce7; color: #166534; font-weight: 800; font-size: 9.5px;">${isAr ? 'مشمول' : 'Included'}</span>
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;">
              <td style="padding: 10px 12px; font-weight: 800; color: #0f172a;">
                🎬 ${isAr ? 'مقاطع فيديو ريلز إبداعية (Reels / TikTok)' : 'Short-Form Reels & TikTok Videos'}
              </td>
              <td style="padding: 10px 12px; color: #475569;">
                ${isAr ? 'مونتاج احترافي، مؤثرات صوتية وبصرية جذابة، هوك قوي يجذب الجمهور المستهدف' : 'Dynamic editing, hooks, sound design, and viral vertical formatting'}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 900; color: #7c3aed;">
                ${reelsCount} ${isAr ? 'فيديو ريلز' : 'Reels'}
              </td>
              <td style="padding: 10px 12px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #dcfce7; color: #166534; font-weight: 800; font-size: 9.5px;">${isAr ? 'مشمول' : 'Included'}</span>
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 800; color: #0f172a;">
                📱 ${isAr ? 'الستوريز التفاعلية واستطلاعات الرأي' : 'Interactive Stories & Engagement'}
              </td>
              <td style="padding: 10px 12px; color: #475569;">
                ${isAr ? 'تغطية يومية وتفاعلية، استبيانات واستطلاعات رأي للحفاظ على تفاعل الجمهور' : 'Interactive polls, Q&A, and community touchpoints to maintain account reach'}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 900; color: #d97706;">
                ${storiesCount} ${isAr ? 'ستوري' : 'Stories'}
              </td>
              <td style="padding: 10px 12px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #dcfce7; color: #166534; font-weight: 800; font-size: 9.5px;">${isAr ? 'مشمول' : 'Included'}</span>
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;">
              <td style="padding: 10px 12px; font-weight: 800; color: #0f172a;">
                🎯 ${isAr ? 'إدارة الحملات الإعلانية الممولة (Paid Ads)' : 'Paid Advertising Campaign Management'}
              </td>
              <td style="padding: 10px 12px; color: #475569;">
                ${isAr ? 'تحديد الجماهير المستهدفة، ضبط الميزانية، تحسين معدل التحويل (A/B Testing)' : 'Audience targeting, pixel tracking, budget optimization, and conversion monitoring'}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #475569;">
                ${isAr ? 'إدارة متواصلة' : 'Continuous'}
              </td>
              <td style="padding: 10px 12px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #dcfce7; color: #166534; font-weight: 800; font-size: 9.5px;">${isAr ? 'مشمول' : 'Included'}</span>
              </td>
            </tr>

            <tr style="border-bottom: ${effectiveAdCredit > 0 ? '1px solid #e2e8f0' : '2px solid #cbd5e1'};">
              <td style="padding: 10px 12px; font-weight: 800; color: #0f172a;">
                📊 ${isAr ? 'التقارير التحليلية وجلسات المتابعة' : 'Monthly Performance Analytics'}
              </td>
              <td style="padding: 10px 12px; color: #475569;">
                ${isAr ? 'تقرير تحليلي شامل لمؤشرات الأداء، النمو، وتوصيات التطوير للشهر التالي' : 'Comprehensive ROI/KPI reports and strategic consultation review meetings'}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #475569;">
                ${isAr ? 'دوري منتظم' : 'Periodic'}
              </td>
              <td style="padding: 10px 12px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #dcfce7; color: #166534; font-weight: 800; font-size: 9.5px;">${isAr ? 'مشمول' : 'Included'}</span>
              </td>
            </tr>

            ${effectiveAdCredit > 0 ? `
            <tr style="border-bottom: 2px solid #2563eb; background-color: #eff6ff;">
              <td style="padding: 10px 12px; font-weight: 800; color: #1e3a8a;">
                💳 ${isAr ? 'شحن رصيد إعلاني ممول (Ad Spend Budget)' : 'Funded Ad Campaign Spend Budget'}
              </td>
              <td style="padding: 10px 12px; color: #1e40af;">
                ${isAr ? 'ميزانية إعلانية مدفوعة ومخصصة بالكامل لحملات العميل الممولة (Meta / TikTok / Google) تُودع في المحفظة فور التحصيل' : '100% dedicated paid advertising campaign budget, deposited into client ad wallet upon payment'}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 900; color: #2563eb;">
                ${effectiveAdCredit.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}
              </td>
              <td style="padding: 10px 12px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: 800; font-size: 9.5px;">${isAr ? 'رصيد إعلاني' : 'Ad Credit'}</span>
              </td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      <!-- Financial Total Box -->
      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <div style="width: 320px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
            <span>${isAr ? 'قيمة باقة التسويق الرقمي:' : 'Package Subtotal:'}</span>
            <span style="font-weight: 700; color: #0f172a;">${formattedRetainerStr}</span>
          </div>

          ${effectiveAdCredit > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #1d4ed8; font-weight: 800;">
            <span>${isAr ? 'الرصيد الإعلاني الممول المضاف:' : 'Added Ad Spend Credit:'}</span>
            <span>+${effectiveAdCredit.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}</span>
          </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #64748b;">
            <span>${isAr ? 'الضرائب ومصاريف الإشراف:' : 'Taxes & Management:'}</span>
            <span style="font-weight: 700; color: #16a34a;">${isAr ? 'مشمولة بالكامل' : '0.00 (Included)'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #0f172a; font-weight: 900; font-size: 13.5px; color: #0f172a;">
            <span>${isAr ? 'المبلغ الإجمالي المستحق:' : 'Total Amount Due:'}</span>
            <span style="color: #2563eb;">${finalGrandTotalStr}</span>
          </div>
        </div>
      </div>

      <!-- Bank & Payment Details -->
      <div style="margin-top: 16px; display: flex; gap: 14px; font-size: 10.5px;">
        <div style="flex: 1; background-color: #f1f5f9; padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 900; color: #0f172a; margin-bottom: 5px;">
            💳 ${isAr ? 'بيانات التحويل وحسابات الدفع المعتمدة:' : 'Approved Transfer & Payment Accounts:'}
          </div>
          <div style="color: #475569; line-height: 1.75;">
            <div>• <strong>${isAr ? 'إنستاباي (InstaPay):' : 'InstaPay:'}</strong> <span dir="ltr" style="font-family: monospace; font-weight: 800; color: #0f172a;">${transferInfo.instaPay}</span></div>
            <div>• <strong>${isAr ? 'رقم المحفظة الإلكترونية (فودافون كاش / E-Wallet):' : 'E-Wallet / Vodafone Cash:'}</strong> <span dir="ltr" style="font-family: monospace; font-weight: 800; color: #0f172a;">${transferInfo.walletNumber}</span></div>
          </div>
        </div>

        <div style="width: 220px; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 10px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #2563eb; color: #2563eb; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; transform: rotate(-8deg);">
            <span>DIGITAL</span>
            <span>EFFECT</span>
            <span style="font-size: 7px; color: #16a34a;">OFFICIAL</span>
          </div>
          <div style="font-size: 9.5px; font-weight: 800; color: #0f172a; margin-top: 4px;">
            ${isAr ? 'ختم واعتماد الوكالة الرسمي' : 'Official Agency Stamp'}
          </div>
          <div style="font-size: 8px; color: #64748b;">
            DE-ACCOUNT-DEPT-APPROVED
          </div>
        </div>
      </div>

      <!-- Terms & Notes -->
      <div style="margin-top: 14px; font-size: 9.5px; color: #64748b; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        <p style="margin: 0;">
          * ${isAr ? 'تعتبر هذه الفاتورة وثيقة تعاقدية رسمية ومطالبة مالية معتمدة صادرة من وكالة ديجيتال إفكت للحلول الرقمية والتسويق.' : 'This invoice is an official statement and financial claim issued by Digital Effect for integrated marketing services.'}
        </p>
      </div>
    `;

    document.body.appendChild(targetElement);
  }

  try {
    // Wait for logo/images inside container to finish loading before rasterization
    await waitForImages(targetElement);

    let imgData: string;
    let imgWidth: number;
    let imgHeight: number;
    let imgFormat: 'JPEG' | 'PNG' = 'JPEG';

    try {
      // Primary engine: html2canvas-pro with oklch & modern CSS support
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      imgData = canvas.toDataURL('image/jpeg', 0.98);
      imgWidth = canvas.width;
      imgHeight = canvas.height;
      imgFormat = 'JPEG';
    } catch (proErr) {
      console.warn('html2canvas-pro fallback to html-to-image:', proErr);
      // Fallback engine: html-to-image using native SVG rasterization
      imgData = await toPng(targetElement, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      imgFormat = 'PNG';
      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      imgWidth = img.naturalWidth || 1200;
      imgHeight = img.naturalHeight || 1700;
    }

    // Assemble PDF via jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    pdf.addImage(imgData, imgFormat, 0, 0, pdfWidth, pdfHeight);

    // Save PDF directly to user machine
    pdf.save(filename);

    return { success: true, filename };
  } catch (error: any) {
    console.error('generateClientInvoicePdf error:', error);
    return {
      success: false,
      filename,
      error: error?.message || 'Error creating PDF',
    };
  } finally {
    if (isTemp && document.body.contains(targetElement)) {
      document.body.removeChild(targetElement);
    }
  }
}
