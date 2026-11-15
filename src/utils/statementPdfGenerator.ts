import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toPng } from 'html-to-image';
import { Inquiry, AccountLedgerEntry, ClientInvoiceRecord } from '../types';

export interface GenerateStatementPdfOptions {
  client: Inquiry;
  fromDate: string;
  toDate: string;
  invoices?: ClientInvoiceRecord[];
  ledger: {
    entries: AccountLedgerEntry[];
    openingBalance: number;
    totalInvoiced: number;
    totalPaid: number;
    totalAdFunded: number;
    totalAdSpent: number;
    closingBalance: number;
    currentAdCreditBalance: number;
  };
  isAr?: boolean;
}

/**
 * Generates an official A4 Statement of Account (كشف حساب مالي رسمي) PDF using jsPDF.
 * Renders agency branding, client profile, statement period, summary metric cards,
 * comprehensive transaction movement table (كشف الحركة المالي), and official signature stamp.
 */
export async function generateAccountStatementPdf(
  options: GenerateStatementPdfOptions
): Promise<{ success: boolean; filename: string; error?: string }> {
  const {
    client,
    fromDate,
    toDate,
    ledger,
    isAr = true,
  } = options;

  const statementRef = `STMT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${client.id.replace(/\D/g, '').slice(-3) || '101'}`;
  const cleanCompany = (client.company || client.name).replace(/\s+/g, '_');
  const filename = `كشف_حساب_${cleanCompany}_${fromDate}_إلى_${toDate}.pdf`;

  // Offscreen high-definition container
  const targetElement = document.createElement('div');
  targetElement.id = 'temp-statement-generator';
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

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`;
  };

  const rowsHtml = ledger.entries.length > 0
    ? ledger.entries.map((entry, idx) => {
        const isPayment = entry.type === 'payment' || (entry.credit && entry.credit > 0);
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `
          <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 10px 12px; font-weight: 700; color: #475569; white-space: nowrap;">
              ${entry.date}
            </td>
            <td style="padding: 10px 12px; color: #1e293b; font-weight: 600;">
              <div>${entry.title}</div>
              ${entry.reference ? `<div style="font-size: 9px; color: #64748b; font-weight: 400; margin-top: 2px;">مرجع: ${entry.reference}</div>` : ''}
              ${entry.notes ? `<div style="font-size: 9px; color: #0284c7; margin-top: 2px;">${entry.notes}</div>` : ''}
            </td>
            <td style="padding: 10px 12px; text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 9.5px; font-weight: 700; ${
                isPayment 
                  ? 'background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;' 
                  : 'background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;'
              }">
                ${isPayment ? (isAr ? 'سداد / دائن' : 'Payment / Cr') : (isAr ? 'فاتورة / مدين' : 'Invoice / Dr')}
              </span>
            </td>
            <td style="padding: 10px 12px; font-weight: 800; color: #1e293b; text-align: ${isAr ? 'left' : 'right'}; font-family: monospace;">
              ${entry.debit && entry.debit > 0 ? entry.debit.toLocaleString() : '—'}
            </td>
            <td style="padding: 10px 12px; font-weight: 800; color: #059669; text-align: ${isAr ? 'left' : 'right'}; font-family: monospace;">
              ${entry.credit && entry.credit > 0 ? entry.credit.toLocaleString() : '—'}
            </td>
            <td style="padding: 10px 12px; font-weight: 900; color: #0f172a; text-align: ${isAr ? 'left' : 'right'}; font-family: monospace; background-color: ${entry.balance > 0 ? '#fffbeb' : '#f8fafc'};">
              ${entry.balance.toLocaleString()}
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <td colspan="6" style="padding: 30px; text-align: center; color: #64748b; font-size: 12px;">
          ${isAr ? 'لا توجد حركات مالية مسجلة خلال هذه الفترة المحددة.' : 'No financial transactions recorded in this period.'}
        </td>
      </tr>
    `;

  targetElement.innerHTML = `
    <!-- Statement Container -->
    <div style="max-width: 714px; margin: 0 auto; background-color: #ffffff;">

      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #0f172a; margin-bottom: 22px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #1d4ed8, #0284c7); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 18px;">
              DE
            </div>
            <div>
              <div style="font-size: 19px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">ديجيتال إفكت | Digital Effect</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">للحلول الرقمية، التسويق الإلكتروني وإدارة الحملات</div>
            </div>
          </div>
          <div style="font-size: 10px; color: #64748b; line-height: 1.5; margin-top: 4px;">
            <div>هاتف / واتساب: +201004860386 | البريد: digitaleffect20@gmail.com</div>
            <div>س.ت: 184920 | ب.ض: 649-218-491 | القاهرة، جمهورية مصر العربية</div>
          </div>
        </div>

        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <div style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 900; letter-spacing: 0.5px;">
            ${isAr ? 'كشف حساب مالي رسمي' : 'STATEMENT OF ACCOUNT'}
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #475569; font-weight: 700;">
            ${isAr ? 'رقم الكشف:' : 'Ref:'} <span style="color: #1d4ed8; font-family: monospace;">${statementRef}</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
            ${isAr ? 'تاريخ الاستخراج:' : 'Date Issued:'} <strong>${new Date().toISOString().split('T')[0]}</strong>
          </div>
        </div>
      </div>

      <!-- Client & Period Details Strip -->
      <div style="display: flex; gap: 16px; margin-bottom: 20px;">
        <!-- Client Info Box -->
        <div style="flex: 1.4; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>🏢</span> <span>${isAr ? 'بيانات العميل والتعاقد:' : 'Client & Account Details:'}</span>
          </div>
          <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">
            ${client.company || client.name}
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.6;">
            <div>${isAr ? 'المسؤول:' : 'Contact:'} <strong>${client.name}</strong> ${client.phone ? `(${client.phone})` : ''}</div>
            <div>${isAr ? 'الباقة المعتمدة:' : 'Active Package:'} <strong>${client.packageName || 'باقة مخصصة'}</strong></div>
            <div>${isAr ? 'قطاع النشاط:' : 'Sector:'} <strong style="text-transform: uppercase;">${client.sector}</strong> • ${isAr ? 'دورة المحاسبة:' : 'Billing:'} ${client.billingCycle || 'شهري'}</div>
          </div>
        </div>

        <!-- Period Box -->
        <div style="flex: 1; background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>📅</span> <span>${isAr ? 'الفترة المحاسبية المشمولة:' : 'Statement Period:'}</span>
          </div>
          <div style="font-size: 12px; color: #1e293b; font-weight: 700; margin-bottom: 6px;">
            <span>${isAr ? 'من:' : 'From:'}</span> <strong style="font-family: monospace; color: #1d4ed8;">${fromDate}</strong>
          </div>
          <div style="font-size: 12px; color: #1e293b; font-weight: 700; margin-bottom: 8px;">
            <span>${isAr ? 'إلى:' : 'To:'}</span> <strong style="font-family: monospace; color: #1d4ed8;">${toDate}</strong>
          </div>
          <div style="font-size: 10px; color: #059669; font-weight: 800; background-color: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #a7f3d0; display: inline-block;">
            ${isAr ? 'حساب مطابق ومعتمد' : 'Verified & Balanced'}
          </div>
        </div>
      </div>

      <!-- Financial Metrics Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px;">
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 3px;">
            ${isAr ? 'رصيد أول المدة' : 'Opening Balance'}
          </div>
          <div style="font-size: 14px; font-weight: 900; color: #334155; font-family: monospace;">
            ${formatCurrency(ledger.openingBalance)}
          </div>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 10px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 10px; color: #1e40af; font-weight: 700; margin-bottom: 3px;">
            ${isAr ? 'إجمالي المفوتر (مدين)' : 'Total Invoiced (Dr)'}
          </div>
          <div style="font-size: 14px; font-weight: 900; color: #1d4ed8; font-family: monospace;">
            ${formatCurrency(ledger.totalInvoiced)}
          </div>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 10px; color: #166534; font-weight: 700; margin-bottom: 3px;">
            ${isAr ? 'إجمالي المسدد (دائن)' : 'Total Paid (Cr)'}
          </div>
          <div style="font-size: 14px; font-weight: 900; color: #15803d; font-family: monospace;">
            ${formatCurrency(ledger.totalPaid)}
          </div>
        </div>

        <div style="background-color: ${ledger.closingBalance > 0 ? '#fff7ed' : '#f8fafc'}; border: 2px solid ${ledger.closingBalance > 0 ? '#f97316' : '#94a3b8'}; border-radius: 10px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 10px; color: ${ledger.closingBalance > 0 ? '#c2410c' : '#475569'}; font-weight: 800; margin-bottom: 3px;">
            ${isAr ? 'الرصيد المستحق النهائي' : 'Closing Balance Due'}
          </div>
          <div style="font-size: 15px; font-weight: 900; color: ${ledger.closingBalance > 0 ? '#ea580c' : '#0f172a'}; font-family: monospace;">
            ${formatCurrency(ledger.closingBalance)}
          </div>
        </div>
      </div>

      <!-- Ledger Transactions Table -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 900; color: #0f172a; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>${isAr ? '📋 كشف الحركة المالي التفصيلي (Transactions Ledger):' : 'Transactions Ledger:'}</span>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">
            ${isAr ? `عدد الحركات: ${ledger.entries.length}` : `Entries: ${ledger.entries.length}`}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff; font-size: 10.5px; font-weight: 800;">
              <th style="padding: 10px 12px; text-align: ${isAr ? 'right' : 'left'};">${isAr ? 'التاريخ' : 'Date'}</th>
              <th style="padding: 10px 12px; text-align: ${isAr ? 'right' : 'left'};">${isAr ? 'بيان الحركة والوصف' : 'Description'}</th>
              <th style="padding: 10px 12px; text-align: center;">${isAr ? 'النوع' : 'Type'}</th>
              <th style="padding: 10px 12px; text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'مدين (ج.م)' : 'Debit (Dr)'}</th>
              <th style="padding: 10px 12px; text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'دائن (ج.م)' : 'Credit (Cr)'}</th>
              <th style="padding: 10px 12px; text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'الرصيد (ج.م)' : 'Balance'}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Ad Spend Wallet Status Strip -->
      <div style="background-color: #faf5ff; border: 1px solid #d8b4fe; border-radius: 10px; padding: 12px 16px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">💳</span>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #581c87;">
              ${isAr ? 'موقف محفظة الرصيد الإعلاني الممول (Ad Credit Wallet):' : 'Paid Ads Spend Wallet Status:'}
            </div>
            <div style="font-size: 10px; color: #7e22ce;">
              ${isAr 
                ? `إجمالي تمويل الإعلانات: ${formatCurrency(ledger.totalAdFunded)} • المنصرف على الحملات: ${formatCurrency(ledger.totalAdSpent)}`
                : `Funded: ${formatCurrency(ledger.totalAdFunded)} • Spent: ${formatCurrency(ledger.totalAdSpent)}`}
            </div>
          </div>
        </div>
        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <div style="font-size: 9.5px; color: #6b21a8; font-weight: 700;">${isAr ? 'الرصيد المتاح حالياً للصرف:' : 'Available Balance:'}</div>
          <div style="font-size: 14px; font-weight: 900; color: #7e22ce; font-family: monospace;">
            ${formatCurrency(ledger.currentAdCreditBalance)}
          </div>
        </div>
      </div>

      <!-- Payment & Bank Accounts Box -->
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; font-size: 10px; color: #475569; line-height: 1.6;">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px;">
          ${isAr ? 'طرق وقنوات السداد المعتمدة لدى ديجيتال إفكت:' : 'Accepted Payment Methods:'}
        </div>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div>• <strong>البنك التجاري الدولي (CIB):</strong> حساب رقم 100049281729 (EGP)</div>
          <div>• <strong>إنستاباي (InstaPay):</strong> digitaleffect@instapay</div>
          <div>• <strong>فودافون كاش:</strong> 01004860386</div>
        </div>
      </div>

      <!-- Footer & Signatures Stamp -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 14px; border-top: 1px solid #e2e8f0;">
        <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.5;">
          <div>هذا المستند كشف حساب رسمي مستخرج إلكترونياً من نظام ديجيتال إفكت لإدارة الحسابات والتعاقدات.</div>
          <div>في حال وجود أي استفسار أو تدقيق مالي يرجى التواصل مع الإدارة المالية على: finance@digitaleffect.com</div>
        </div>

        <!-- Official Stamp Seal Box -->
        <div style="text-align: center; border: 2px dashed #0284c7; border-radius: 12px; padding: 8px 16px; background-color: #f0f9ff;">
          <div style="font-size: 9px; font-weight: 900; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">
            DIGITAL EFFECT AGENCY
          </div>
          <div style="font-size: 11px; font-weight: 900; color: #0284c7; margin: 2px 0;">
            ★ مراجعة واعتماد الحسابات ★
          </div>
          <div style="font-size: 8.5px; color: #64748b; font-family: monospace;">
            VERIFIED & BALANCED
          </div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(targetElement);

  try {
    // Generate high quality canvas
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));

    // Save and download
    pdf.save(filename);

    return { success: true, filename };
  } catch (error: any) {
    console.error('generateAccountStatementPdf error:', error);
    try {
      // Fallback via html-to-image
      const dataUrl = await toPng(targetElement, { quality: 0.95, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (targetElement.clientHeight * pdfWidth) / targetElement.clientWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(filename);
      return { success: true, filename };
    } catch (fbErr: any) {
      return { success: false, filename, error: fbErr?.message || error?.message };
    }
  } finally {
    if (targetElement.parentNode) {
      document.body.removeChild(targetElement);
    }
  }
}
