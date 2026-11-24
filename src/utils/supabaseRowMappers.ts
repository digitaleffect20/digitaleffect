import type {
  ClientInvoiceRecord,
  Inquiry,
  InvoicePaymentEntry,
  SectorType,
} from '../types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function mapInquiryToCrmRow(inq: Inquiry) {
  return {
    id: inq.id,
    inquiry_id: UUID_REGEX.test(inq.id) ? inq.id : null,
    name: inq.name,
    phone: inq.phone,
    phone_e164: inq.phoneE164 || null,
    phone_country: inq.phoneCountry || 'EG',
    visitor_country: inq.visitorCountry || null,
    company: inq.company || null,
    sector: inq.sector || 'b2c',
    package_id: inq.packageId || null,
    package_name: inq.packageName || null,
    budget: inq.budget || null,
    notes: inq.notes || null,
    promo_code: inq.promoCode || null,
    discount_amount: inq.discountAmount ?? 0,
    final_price: inq.finalPrice ?? null,
    status: inq.status || 'new',
    contract_start_date: inq.contractStartDate || null,
    renewal_date: inq.renewalDate || null,
    contract_status: inq.contractStatus || 'active',
    payment_status: inq.paymentStatus || 'pending',
    billing_cycle: inq.billingCycle || 'monthly',
    retainer_amount: inq.retainerAmount ?? 0,
    posts_target: inq.postsTarget ?? 0,
    posts_delivered: inq.postsDelivered ?? 0,
    reels_target: inq.reelsTarget ?? 0,
    reels_delivered: inq.reelsDelivered ?? 0,
    stories_target: inq.storiesTarget ?? 0,
    stories_delivered: inq.storiesDelivered ?? 0,
    account_manager: inq.accountManager || null,
    current_workflow_day: inq.currentWorkflowDay ?? 1,
    today_task_title: inq.todayTaskTitle || null,
    workflow_stages: [
      ...(inq.workflowStages || []),
      ...(inq.reelStages || []).map((r) => ({ ...r, track: 'reel' as const })),
      ...(inq.adWalletRequests || []).map((req) => ({ ...req, _kind: 'ad_wallet_request' as const })),
    ],
    client_notes: inq.clientNotes || [],
    ad_credit_balance: inq.adCreditBalance ?? 0,
    pending_invoice_ad_credit: inq.pendingInvoiceAdCredit ?? 0,
    ad_credit_funded_total: inq.adCreditFundedTotal ?? 0,
    ad_credit_spent_total: inq.adCreditSpentTotal ?? 0,
    client_created_at: inq.createdAt || new Date().toISOString(),
  };
}

export function mapCrmRowToInquiry(row: any): Inquiry {
  return {
    id: String(row.id),
    name: row.name || '',
    phone: row.phone || '',
    phoneE164: row.phone_e164 || undefined,
    phoneCountry: row.phone_country || 'EG',
    visitorCountry: row.visitor_country || undefined,
    company: row.company || undefined,
    sector: (row.sector || 'b2c') as SectorType,
    packageId: row.package_id || undefined,
    packageName: row.package_name || undefined,
    budget: row.budget || undefined,
    notes: row.notes || undefined,
    promoCode: row.promo_code || undefined,
    discountAmount:
      row.discount_amount !== null && row.discount_amount !== undefined
        ? Number(row.discount_amount)
        : undefined,
    finalPrice:
      row.final_price !== null && row.final_price !== undefined
        ? Number(row.final_price)
        : undefined,
    createdAt: row.client_created_at || row.created_at || new Date().toISOString(),
    status: row.status || 'new',
    contractStartDate: row.contract_start_date || undefined,
    renewalDate: row.renewal_date || undefined,
    contractStatus: row.contract_status || undefined,
    paymentStatus: row.payment_status || undefined,
    billingCycle: row.billing_cycle || undefined,
    retainerAmount:
      row.retainer_amount !== null && row.retainer_amount !== undefined
        ? Number(row.retainer_amount)
        : undefined,
    postsTarget:
      row.posts_target !== null && row.posts_target !== undefined
        ? Number(row.posts_target)
        : undefined,
    postsDelivered:
      row.posts_delivered !== null && row.posts_delivered !== undefined
        ? Number(row.posts_delivered)
        : undefined,
    reelsTarget:
      row.reels_target !== null && row.reels_target !== undefined
        ? Number(row.reels_target)
        : undefined,
    reelsDelivered:
      row.reels_delivered !== null && row.reels_delivered !== undefined
        ? Number(row.reels_delivered)
        : undefined,
    storiesTarget:
      row.stories_target !== null && row.stories_target !== undefined
        ? Number(row.stories_target)
        : undefined,
    storiesDelivered:
      row.stories_delivered !== null && row.stories_delivered !== undefined
        ? Number(row.stories_delivered)
        : undefined,
    accountManager: row.account_manager || undefined,
    currentWorkflowDay:
      row.current_workflow_day !== null && row.current_workflow_day !== undefined
        ? Number(row.current_workflow_day)
        : undefined,
    todayTaskTitle: row.today_task_title || undefined,
    workflowStages: (() => {
      if (!Array.isArray(row.workflow_stages)) return undefined;
      const mainStages = row.workflow_stages.filter(
        (s: any) =>
          s &&
          s._kind !== 'ad_wallet_request' &&
          s.track !== 'reel' &&
          !String(s.id || '').startsWith('reel_')
      );
      return mainStages.length > 0 ? mainStages : undefined;
    })(),
    reelStages: (() => {
      if (!Array.isArray(row.workflow_stages)) return undefined;
      const reels = row.workflow_stages.filter(
        (s: any) =>
          s &&
          s._kind !== 'ad_wallet_request' &&
          (s.track === 'reel' || String(s.id || '').startsWith('reel_'))
      );
      return reels.length > 0 ? reels : undefined;
    })(),
    adWalletRequests: (() => {
      if (!Array.isArray(row.workflow_stages)) return undefined;
      const reqs = row.workflow_stages
        .filter((s: any) => s && s._kind === 'ad_wallet_request' && s.id && s.type)
        .map(({ _kind: _k, ...rest }: any) => {
          void _k;
          return rest;
        });
      return reqs.length > 0 ? reqs : undefined;
    })(),
    clientNotes:
      Array.isArray(row.client_notes) && row.client_notes.length > 0 ? row.client_notes : undefined,
    cycleHistory: Array.isArray(row.client_notes)
      ? row.client_notes
          .map((n: any) => n?.meta?.cycleRecord)
          .filter((r: any) => Boolean(r && r.id && r.startDate))
      : undefined,
    adCreditBalance: Number(row.ad_credit_balance ?? 0),
    pendingInvoiceAdCredit: Number(row.pending_invoice_ad_credit ?? 0),
    adCreditFundedTotal: Number(row.ad_credit_funded_total ?? 0),
    adCreditSpentTotal: Number(row.ad_credit_spent_total ?? 0),
  };
}

export function mapInvoiceToRow(inv: ClientInvoiceRecord) {
  const packedDeliverables: Record<string, any> = {
    ...(inv.deliverables || {}),
  };
  if (Array.isArray(inv.payments) && inv.payments.length > 0) {
    packedDeliverables._payments = inv.payments;
  }
  if (inv.paidAmount !== undefined) {
    packedDeliverables._paidAmount = inv.paidAmount;
  }
  const meta: Record<string, any> = {};
  if (inv.serviceStartDate) meta.serviceStartDate = inv.serviceStartDate;
  if (inv.serviceEndDate) meta.serviceEndDate = inv.serviceEndDate;
  if (inv.taxAmount !== undefined) meta.taxAmount = inv.taxAmount;
  if (inv.adFundsTreatment) meta.adFundsTreatment = inv.adFundsTreatment;
  if (inv.isDraft !== undefined) meta.isDraft = inv.isDraft;
  if (inv.cancellationReason) meta.cancellationReason = inv.cancellationReason;
  if (inv.cancelledAt) meta.cancelledAt = inv.cancelledAt;
  if (inv.cancelledBy) meta.cancelledBy = inv.cancelledBy;
  if (Object.keys(meta).length > 0) {
    packedDeliverables._meta = meta;
  }

  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    client_id: inv.clientId,
    client_name: inv.clientName,
    client_company: inv.clientCompany || null,
    client_phone: inv.clientPhone || null,
    sector: inv.sector || 'b2c',
    issue_date: inv.issueDate,
    due_date: inv.dueDate || null,
    package_name: inv.packageName,
    retainer_amount: inv.retainerAmount ?? 0,
    ad_credit_amount: inv.adCreditAmount ?? 0,
    discount_amount: inv.discountAmount ?? 0,
    grand_total: inv.grandTotal ?? 0,
    billing_cycle: inv.billingCycle || 'monthly',
    contract_period: inv.contractPeriod || null,
    payment_status: inv.paymentStatus || 'pending',
    paid_at: inv.paidAt || null,
    payment_method: inv.paymentMethod || null,
    deliverables: packedDeliverables,
    notes: inv.notes || null,
    invoice_created_at: inv.createdAt || new Date().toISOString(),
  };
}

export function mapRowToInvoice(row: any): ClientInvoiceRecord {
  const rawDel = row.deliverables && typeof row.deliverables === 'object' ? row.deliverables : undefined;
  const extractedPayments: InvoicePaymentEntry[] | undefined =
    rawDel && Array.isArray(rawDel._payments) ? rawDel._payments : undefined;
  const extractedPaidAmount: number | undefined =
    rawDel && rawDel._paidAmount !== undefined ? Number(rawDel._paidAmount) : undefined;
  const extractedMeta: Record<string, any> =
    rawDel && rawDel._meta && typeof rawDel._meta === 'object' ? rawDel._meta : {};

  let cleanDeliverables: ClientInvoiceRecord['deliverables'] = undefined;
  if (rawDel) {
    const { _payments: _p, _paidAmount: _pa, _meta: _m, ...rest } = rawDel;
    void _p;
    void _pa;
    void _m;
    if (Object.keys(rest).length > 0) {
      cleanDeliverables = rest;
    }
  }

  return {
    id: String(row.id),
    invoiceNumber: row.invoice_number,
    clientId: row.client_id,
    clientName: row.client_name,
    clientCompany: row.client_company || undefined,
    clientPhone: row.client_phone || undefined,
    sector: (row.sector || 'b2c') as SectorType,
    issueDate: row.issue_date,
    dueDate: row.due_date || undefined,
    serviceStartDate: extractedMeta.serviceStartDate || undefined,
    serviceEndDate: extractedMeta.serviceEndDate || undefined,
    taxAmount: extractedMeta.taxAmount !== undefined ? Number(extractedMeta.taxAmount) : undefined,
    adFundsTreatment: extractedMeta.adFundsTreatment || undefined,
    isDraft: extractedMeta.isDraft !== undefined ? Boolean(extractedMeta.isDraft) : undefined,
    cancellationReason: extractedMeta.cancellationReason || undefined,
    cancelledAt: extractedMeta.cancelledAt || undefined,
    cancelledBy: extractedMeta.cancelledBy || undefined,
    packageName: row.package_name,
    retainerAmount: Number(row.retainer_amount ?? 0),
    adCreditAmount: Number(row.ad_credit_amount ?? 0),
    discountAmount:
      row.discount_amount !== null && row.discount_amount !== undefined
        ? Number(row.discount_amount)
        : undefined,
    grandTotal: Number(row.grand_total ?? 0),
    billingCycle: row.billing_cycle || 'monthly',
    contractPeriod: row.contract_period || undefined,
    paymentStatus: row.payment_status || 'pending',
    paidAt: row.paid_at || undefined,
    paymentMethod: row.payment_method || undefined,
    paidAmount: extractedPaidAmount,
    payments: extractedPayments,
    deliverables: cleanDeliverables,
    notes: row.notes || undefined,
    createdAt: row.invoice_created_at || row.created_at || new Date().toISOString(),
  };
}
