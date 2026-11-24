import { MonthlyCloseRecord } from '../types';
import {
  ClientAdFundsRow,
  ClientProfitabilityRow,
  formatMonthTitle,
  MonthlyCashFlowResult,
  MonthlyPnLResult,
  ReceivablesAgingSummary,
} from './accountingEngine';
import { captureElementToPdf } from './invoicePdfGenerator';

export interface GenerateFinancialReportPdfOptions {
  monthKey: string;
  pnl: MonthlyPnLResult;
  cashFlow: MonthlyCashFlowResult;
  receivablesAging: ReceivablesAgingSummary;
  adFundsReconciliation: {
    rows: ClientAdFundsRow[];
    totalAgreedBudget: number;
    totalCollectedAdFunds: number;
    totalActualSpend: number;
    totalRemainingLiability: number;
  };
  clientProfitability: {
    rows: ClientProfitabilityRow[];
    totalEarnedFees: number;
    totalDirectCosts: number;
    totalPayrollAllocated: number;
    totalContributionMargin: number;
  };
  closeRecord?: MonthlyCloseRecord;
  actorName?: string;
  isAr?: boolean;
}

function escapeHtml(input: string): string {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtMoney(val: number, isAr: boolean): string {
  const rounded = Math.round(Number(val) || 0);
  return `${rounded.toLocaleString('en-US')} ${isAr ? 'ج.م' : 'EGP'}`;
}

function fmtSignedMoney(val: number, isAr: boolean): string {
  const rounded = Math.round(Number(val) || 0);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toLocaleString('en-US')} ${isAr ? 'ج.م' : 'EGP'}`;
}

export async function generateMonthlyFinancialReportPdf(
  options: GenerateFinancialReportPdfOptions
): Promise<{ success: boolean; filename: string; error?: string }> {
  const {
    monthKey,
    pnl,
    cashFlow,
    receivablesAging,
    adFundsReconciliation,
    clientProfitability,
    closeRecord,
    actorName = 'الإدارة المالية',
    isAr = true,
  } = options;

  const monthTitle = formatMonthTitle(monthKey, isAr);
  const prevMonthTitle = pnl.prevMonth
    ? formatMonthTitle(pnl.prevMonth.monthKey, isAr)
    : '';
  const todayStr = new Date().toISOString().split('T')[0];
  const isClosed = closeRecord?.status === 'closed';

  const filename = isAr
    ? `التقرير_المالي_الشهري_DigitalEffect_${monthKey}.pdf`
    : `DigitalEffect_Financial_Report_${monthKey}.pdf`;

  const container = document.createElement('div');
  container.id = 'temp-financial-report-pdf';
  container.dir = isAr ? 'rtl' : 'ltr';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '30px 36px';
  container.style.fontFamily = 'Cairo, system-ui, -apple-system, sans-serif';
  container.style.color = '#0f172a';
  container.style.boxSizing = 'border-box';
  container.style.letterSpacing = '0px';

  const warnings = isAr ? pnl.completenessWarningsAr : pnl.completenessWarningsEn;

  const topClientsRows = clientProfitability.rows.slice(0, 12);
  const topAdRows = adFundsReconciliation.rows.slice(0, 10);

  container.innerHTML = `
    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:2px solid #0f172a;">
      <div>
        <img
          src="/assets/aistudio/Digital-effect-logo_d13b47e3.png"
          alt="Digital Effect"
          crossorigin="anonymous"
          style="height:40px; width:auto; max-width:200px; object-fit:contain; display:block; margin-bottom:6px;"
        />
        <div style="font-size:16px; font-weight:900; color:#0f172a;">
          ${isAr ? 'التقرير المالي التنفيذي الشهري (أساس الاستحقاق)' : 'Executive Monthly Financial Report (Accrual Basis)'}
        </div>
        <div style="font-size:11px; color:#2563eb; font-weight:800; margin-top:2px;">
          ${escapeHtml(monthTitle)} (${escapeHtml(monthKey)})
        </div>
      </div>

      <div style="text-align:${isAr ? 'left' : 'right'}; font-size:10px; color:#475569; line-height:1.6;">
        <div style="display:inline-block; padding:4px 10px; border-radius:6px; font-weight:900; font-size:10px; background:${isClosed ? '#ecfdf5' : '#fffbeb'}; color:${isClosed ? '#065f46' : '#92400e'}; border:1px solid ${isClosed ? '#a7f3d0' : '#fde68a'}; margin-bottom:5px;">
          ${isClosed ? (isAr ? 'شهر مقفول ومعتمد ✓' : 'CLOSED & LOCKED ✓') : (isAr ? 'شهر مفتوح للمراجعة' : 'OPEN FOR REVIEW')}
        </div>
        <div><strong>${isAr ? 'تاريخ التصدير:' : 'Generated:'}</strong> ${todayStr}</div>
        <div><strong>${isAr ? 'أعدّه:' : 'Prepared By:'}</strong> ${escapeHtml(actorName)}</div>
        ${isClosed && closeRecord?.closedBy ? `<div><strong>${isAr ? 'اعتماد الإقفال:' : 'Locked By:'}</strong> ${escapeHtml(closeRecord.closedBy)}</div>` : ''}
      </div>
    </div>

    ${warnings.length > 0 ? `
    <div style="margin-top:12px; padding:10px 14px; border-radius:10px; background:#fffbeb; border:1px solid #fcd34d; font-size:10px; color:#92400e; line-height:1.5;">
      <div style="font-weight:900; margin-bottom:3px;">${isAr ? '⚠️ تنبيهات اكتمال البيانات قبل الاعتماد النهائي:' : '⚠️ Data Completeness Warnings:'}</div>
      ${warnings.map((w) => `<div>• ${escapeHtml(w)}</div>`).join('')}
    </div>
    ` : ''}

    <!-- Executive KPI Grid (Accrual vs Cash Explicitly Separated) -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:14px;">
      <div style="padding:12px; border-radius:12px; background:#eff6ff; border:1px solid #bfdbfe;">
        <div style="font-size:9.5px; font-weight:800; color:#1d4ed8;">${isAr ? 'إيرادات الخدمات المكتسبة' : 'Earned Service Revenue'}</div>
        <div style="font-size:15px; font-weight:900; color:#0f172a; margin-top:4px;">${fmtMoney(pnl.earnedServiceRevenue, isAr)}</div>
        <div style="font-size:9px; color:#475569; margin-top:2px;">${isAr ? 'أساس استحقاق (بدون إعلانات)' : 'Accrual — Excl. Ad Funds'}</div>
      </div>

      <div style="padding:12px; border-radius:12px; background:${pnl.netProfitBeforeTax >= 0 ? '#ecfdf5' : '#fff1f2'}; border:1px solid ${pnl.netProfitBeforeTax >= 0 ? '#a7f3d0' : '#fecdd3'};">
        <div style="font-size:9.5px; font-weight:800; color:${pnl.netProfitBeforeTax >= 0 ? '#047857' : '#be123c'};">${isAr ? 'صافي الربح المحاسبي' : 'Accrual Net Profit'}</div>
        <div style="font-size:15px; font-weight:900; color:${pnl.netProfitBeforeTax >= 0 ? '#065f46' : '#9f1239'}; margin-top:4px;">${fmtSignedMoney(pnl.netProfitBeforeTax, isAr)}</div>
        <div style="font-size:9px; color:#475569; margin-top:2px;">${isAr ? `هامش صافي: ${pnl.netMarginPct}%` : `Net Margin: ${pnl.netMarginPct}%`}</div>
      </div>

      <div style="padding:12px; border-radius:12px; background:#fffbeb; border:1px solid #fde68a;">
        <div style="font-size:9.5px; font-weight:800; color:#b45309;">${isAr ? 'الفرق النقدي للشهر (≠ ربح)' : 'Net Cash Flow (≠ Profit)'}</div>
        <div style="font-size:15px; font-weight:900; color:#78350f; margin-top:4px;">${fmtSignedMoney(cashFlow.agencyNetCashFlow, isAr)}</div>
        <div style="font-size:9px; color:#78350f; margin-top:2px;">${isAr ? 'مؤشر سيولة نقدية فقط' : 'Liquidity Indicator Only'}</div>
      </div>

      <div style="padding:12px; border-radius:12px; background:#f8fafc; border:1px solid #cbd5e1;">
        <div style="font-size:9.5px; font-weight:800; color:#334155;">${isAr ? 'السيولة المتاحة للوكالة' : 'Agency Available Liquidity'}</div>
        <div style="font-size:15px; font-weight:900; color:#0f172a; margin-top:4px;">${fmtMoney(cashFlow.estimatedAgencyAvailableLiquidity, isAr)}</div>
        <div style="font-size:9px; color:#2563eb; margin-top:2px;">${isAr ? `أمانات إعلانات منفصلة: ${fmtMoney(cashFlow.heldClientAdFundsLiability, true)}` : `Held Ad Funds: ${fmtMoney(cashFlow.heldClientAdFundsLiability, false)}`}</div>
      </div>
    </div>

    <!-- Section 1: Monthly P&L Statement -->
    <div style="margin-top:16px;">
      <div style="font-size:12px; font-weight:900; color:#0f172a; margin-bottom:6px; padding-bottom:4px; border-bottom:1.5px solid #e2e8f0;">
        ${isAr ? '1. قائمة الأرباح والخسائر الشهرية (P&L Statement — Accrual)' : '1. Monthly Profit & Loss Statement (Accrual)'}
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f1f5f9; color:#334155; border-bottom:2px solid #cbd5e1;">
            <th style="padding:7px 10px; text-align:${isAr ? 'right' : 'left'}; font-weight:900;">${isAr ? 'البند المحاسبي' : 'Line Item'}</th>
            <th style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:900;">${escapeHtml(monthTitle)}</th>
            ${pnl.prevMonth ? `<th style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:900;">${escapeHtml(prevMonthTitle)}</th>` : ''}
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:7px 10px; font-weight:800; color:#0f172a;">${isAr ? 'إيرادات الخدمات المكتسبة (Earned Service Revenue)' : 'Earned Service Revenue'}</td>
            <td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:900; color:#1d4ed8;">${fmtMoney(pnl.earnedServiceRevenue, isAr)}</td>
            ${pnl.prevMonth ? `<td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; color:#64748b;">${fmtMoney(pnl.prevMonth.earnedServiceRevenue, isAr)}</td>` : ''}
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0; background:#fafafa;">
            <td style="padding:7px 10px; color:#334155;">${isAr ? '(-) تكاليف تنفيذ الخدمات المباشرة (COGS)' : '(-) Direct Delivery Costs (COGS)'}</td>
            <td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:700; color:#be123c;">(${fmtMoney(pnl.directDeliveryCosts, isAr)})</td>
            ${pnl.prevMonth ? `<td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; color:#64748b;">—</td>` : ''}
          </tr>
          <tr style="border-bottom:1.5px solid #cbd5e1; background:#eff6ff;">
            <td style="padding:7px 10px; font-weight:900; color:#1e3a8a;">${isAr ? `= مجمل الربح (Gross Profit — ${pnl.grossMarginPct}%)` : `= Gross Profit (${pnl.grossMarginPct}%)`}</td>
            <td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:900; color:#1e3a8a;">${fmtMoney(pnl.grossProfit, isAr)}</td>
            ${pnl.prevMonth ? `<td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:700; color:#475569;">${fmtMoney(pnl.prevMonth.grossProfit, isAr)}</td>` : ''}
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:7px 10px; color:#334155;">${isAr ? '(-) الرواتب والأجور المستحقة (Payroll)' : '(-) Accrued Payroll'}</td>
            <td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:700; color:#be123c;">(${fmtMoney(pnl.accruedPayroll, isAr)})</td>
            ${pnl.prevMonth ? `<td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; color:#64748b;">—</td>` : ''}
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0; background:#fafafa;">
            <td style="padding:7px 10px; color:#334155;">${isAr ? '(-) المصروفات التشغيلية الثابتة (إيجار / أدوات / اشتراكات)' : '(-) Fixed Operating Expenses'}</td>
            <td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:700; color:#be123c;">(${fmtMoney(pnl.fixedOpsExpenses, isAr)})</td>
            ${pnl.prevMonth ? `<td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; color:#64748b;">—</td>` : ''}
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:7px 10px; color:#334155;">${isAr ? '(-) المصروفات الإدارية والمالية والبنكية' : '(-) Admin & Finance Expenses'}</td>
            <td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:700; color:#be123c;">(${fmtMoney(pnl.adminFinanceExpenses, isAr)})</td>
            ${pnl.prevMonth ? `<td style="padding:7px 10px; text-align:${isAr ? 'left' : 'right'}; color:#64748b;">—</td>` : ''}
          </tr>
          <tr style="background:${pnl.netProfitBeforeTax >= 0 ? '#ecfdf5' : '#fff1f2'}; border-top:2px solid #0f172a;">
            <td style="padding:9px 10px; font-weight:900; font-size:11.5px; color:#0f172a;">${isAr ? `= صافي الربح قبل الضريبة (Net Profit — ${pnl.netMarginPct}%)` : `= Net Profit Before Tax (${pnl.netMarginPct}%)`}</td>
            <td style="padding:9px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:900; font-size:12px; color:${pnl.netProfitBeforeTax >= 0 ? '#065f46' : '#9f1239'};">${fmtSignedMoney(pnl.netProfitBeforeTax, isAr)}</td>
            ${pnl.prevMonth ? `<td style="padding:9px 10px; text-align:${isAr ? 'left' : 'right'}; font-weight:800; color:#475569;">${fmtSignedMoney(pnl.prevMonth.netProfitBeforeTax, isAr)}</td>` : ''}
          </tr>
        </tbody>
      </table>
      <div style="display:flex; justify-content:space-between; gap:10px; margin-top:6px; font-size:9.5px; color:#475569; flex-wrap:wrap;">
        <span><strong>${isAr ? 'إيرادات مؤجلة بنهاية الشهر:' : 'Deferred Revenue:'}</strong> ${fmtMoney(pnl.deferredRevenueAsOfMonthEnd, isAr)}</span>
        <span><strong>${isAr ? 'إيرادات مستحقة غير محصّلة:' : 'Accrued Uncollected:'}</strong> ${fmtMoney(pnl.accruedUncollectedRevenue, isAr)}</span>
        <span><strong>${isAr ? 'مصروفات/رواتب مستحقة غير مسددة:' : 'Unpaid Payables:'}</strong> ${fmtMoney(pnl.accruedPayablesUnpaid, isAr)}</span>
        ${pnl.recordedTaxes > 0 ? `<span><strong>${isAr ? 'ضرائب منفصلة مسجلة:' : 'Separate Taxes:'}</strong> ${fmtMoney(pnl.recordedTaxes, isAr)}</span>` : ''}
      </div>
    </div>

    <!-- Section 2: Cash Flow & Receivables Aging (Side by Side) -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px;">
      <div style="padding:12px; border-radius:12px; border:1px solid #e2e8f0; background:#f8fafc;">
        <div style="font-size:11px; font-weight:900; color:#0f172a; margin-bottom:8px;">
          ${isAr ? '2. ملخص التدفق النقدي والسيولة (Cash Basis)' : '2. Cash Flow & Liquidity Summary'}
        </div>
        <div style="font-size:10px; line-height:1.9;">
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? 'تحصيلات أتعاب الوكالة النقدية:' : 'Agency Retainer Cash In:'}</span><strong style="color:#047857;">+${fmtMoney(cashFlow.agencyCashInflows, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? 'تحصيلات إعلانات عملاء (أمانات):' : 'Client Ad Funds In:'}</span><strong style="color:#1d4ed8;">+${fmtMoney(cashFlow.clientAdFundsCashInflows, isAr)}</strong></div>
          ${cashFlow.taxCashInflows > 0 ? `<div style="display:flex; justify-content:space-between;"><span>${isAr ? 'ضرائب محصّلة (منفصلة):' : 'Tax Cash Inflows:'}</span><strong style="color:#92400e;">+${fmtMoney(cashFlow.taxCashInflows, isAr)}</strong></div>` : ''}
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? 'مصروفات ورواتب مسددة نقداً:' : 'Paid Expenses Out:'}</span><strong style="color:#be123c;">-${fmtMoney(cashFlow.paidExpensesOutflow, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? 'صرف إعلانات عملاء معتمد:' : 'Approved Ad Spend Out:'}</span><strong style="color:#475569;">-${fmtMoney(cashFlow.approvedAdSpendOutflow, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid #cbd5e1; margin-top:4px; padding-top:4px;"><span><strong>${isAr ? 'الفرق النقدي للوكالة:' : 'Agency Net Cash Flow:'}</strong></span><strong>${fmtSignedMoney(cashFlow.agencyNetCashFlow, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span><strong>${isAr ? 'إجمالي البنك والمحافظ التقديري:' : 'Est. Bank & Wallets:'}</strong></span><strong>${fmtMoney(cashFlow.totalBankAndWalletsEstimate, isAr)}</strong></div>
        </div>
      </div>

      <div style="padding:12px; border-radius:12px; border:1px solid #e2e8f0; background:#f8fafc;">
        <div style="font-size:11px; font-weight:900; color:#0f172a; margin-bottom:8px;">
          ${isAr ? '3. أعمار المديونيات (Accounts Receivable Aging)' : '3. Accounts Receivable Aging'}
        </div>
        <div style="font-size:10px; line-height:1.9;">
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? '0 – 30 يوماً (جارية):' : '0 – 30 Days:'}</span><strong>${fmtMoney(receivablesAging.bucket0_30, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? '31 – 60 يوماً (متأخرة):' : '31 – 60 Days:'}</span><strong style="color:#b45309;">${fmtMoney(receivablesAging.bucket31_60, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? '61 – 90 يوماً (حرجة):' : '61 – 90 Days:'}</span><strong style="color:#c2410c;">${fmtMoney(receivablesAging.bucket61_90, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? '+90 يوماً (متعثرة):' : '90+ Days:'}</span><strong style="color:#be123c;">${fmtMoney(receivablesAging.bucket90Plus, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid #cbd5e1; margin-top:4px; padding-top:4px;"><span><strong>${isAr ? 'إجمالي المستحقات لدى العملاء:' : 'Total Receivables:'}</strong></span><strong style="color:#0f172a;">${fmtMoney(receivablesAging.totalReceivables, isAr)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>${isAr ? 'عدد الفواتير المتأخرة:' : 'Overdue Invoices Count:'}</span><strong>${receivablesAging.overdueCount}</strong></div>
        </div>
      </div>
    </div>

    ${topAdRows.length > 0 ? `
    <!-- Section 4: Client Ad Funds Reconciliation -->
    <div style="margin-top:16px;">
      <div style="font-size:11.5px; font-weight:900; color:#0f172a; margin-bottom:6px; padding-bottom:4px; border-bottom:1.5px solid #e2e8f0;">
        ${isAr ? '4. تسوية أموال إعلانات العملاء (التزام منفصل عن إيراد الوكالة)' : '4. Client Ad Funds Reconciliation (Held Liability)'}
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:10px; border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#eff6ff; color:#1e3a8a; border-bottom:1.5px solid #bfdbfe;">
            <th style="padding:6px 8px; text-align:${isAr ? 'right' : 'left'};">${isAr ? 'العميل' : 'Client'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'المحصّل للإعلانات' : 'Collected'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'المصروف الفعلي' : 'Actual Spend'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'الرصيد المتبقي (التزام)' : 'Held Balance'}</th>
          </tr>
        </thead>
        <tbody>
          ${topAdRows
            .map(
              (r, idx) => `
            <tr style="border-bottom:1px solid #e2e8f0; background:${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
              <td style="padding:6px 8px; font-weight:800;">${escapeHtml(r.clientName)}</td>
              <td style="padding:6px 8px; text-align:center;">${fmtMoney(r.collectedAdFunds, isAr)}</td>
              <td style="padding:6px 8px; text-align:center;">${fmtMoney(r.actualPlatformSpend, isAr)}</td>
              <td style="padding:6px 8px; text-align:center; font-weight:900; color:#1d4ed8;">${fmtMoney(r.remainingBalance, isAr)}</td>
            </tr>
          `
            )
            .join('')}
          <tr style="background:#f1f5f9; font-weight:900;">
            <td style="padding:7px 8px;">${isAr ? 'الإجمالي' : 'Total'}</td>
            <td style="padding:7px 8px; text-align:center;">${fmtMoney(adFundsReconciliation.totalCollectedAdFunds, isAr)}</td>
            <td style="padding:7px 8px; text-align:center;">${fmtMoney(adFundsReconciliation.totalActualSpend, isAr)}</td>
            <td style="padding:7px 8px; text-align:center; color:#1e3a8a;">${fmtMoney(adFundsReconciliation.totalRemainingLiability, isAr)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    ${topClientsRows.length > 0 ? `
    <!-- Section 5: Client Profitability -->
    <div style="margin-top:16px;">
      <div style="font-size:11.5px; font-weight:900; color:#0f172a; margin-bottom:6px; padding-bottom:4px; border-bottom:1.5px solid #e2e8f0;">
        ${isAr ? '5. ربحية العملاء للشهر (Client Profitability)' : '5. Monthly Client Profitability'}
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:10px; border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f1f5f9; color:#334155; border-bottom:1.5px solid #cbd5e1;">
            <th style="padding:6px 8px; text-align:${isAr ? 'right' : 'left'};">${isAr ? 'العميل' : 'Client'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'الأتعاب المكتسبة' : 'Earned Fees'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'تكاليف مباشرة' : 'Direct Costs'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'نصيب الرواتب' : 'Allocated Payroll'}</th>
            <th style="padding:6px 8px; text-align:center;">${isAr ? 'هامش المساهمة' : 'Contribution'}</th>
          </tr>
        </thead>
        <tbody>
          ${topClientsRows
            .map(
              (r, idx) => `
            <tr style="border-bottom:1px solid #e2e8f0; background:${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
              <td style="padding:6px 8px; font-weight:800;">${escapeHtml(r.clientName)}</td>
              <td style="padding:6px 8px; text-align:center; font-weight:700;">${fmtMoney(r.earnedAgencyFees, isAr)}</td>
              <td style="padding:6px 8px; text-align:center;">${fmtMoney(r.directDeliveryCosts, isAr)}</td>
              <td style="padding:6px 8px; text-align:center;">${fmtMoney(r.allocatedTeamSalaryShare, isAr)}</td>
              <td style="padding:6px 8px; text-align:center; font-weight:900; color:${r.contributionMargin >= 0 ? '#065f46' : '#be123c'};">${fmtSignedMoney(r.contributionMargin, isAr)} (${r.contributionMarginPct}%)</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Footer Stamp -->
    <div style="margin-top:18px; padding-top:10px; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between; font-size:9px; color:#64748b;">
      <span>${isAr ? 'ديجيتال إفكت (Digital Effect) — نظام الإدارة المالية بالاستحقاق الشهري' : 'Digital Effect — Accrual Monthly Financial Management System'}</span>
      <span>${isAr ? `تم التصدير في ${todayStr} بواسطة ${escapeHtml(actorName)}` : `Exported ${todayStr} by ${escapeHtml(actorName)}`}</span>
    </div>
  `;

  try {
    return await captureElementToPdf(container, { filename, action: 'download' });
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
