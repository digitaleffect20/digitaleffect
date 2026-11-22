import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Building, 
  DollarSign, 
  CreditCard, 
  Trash2, 
  ExternalLink, 
  Eye, 
  ChevronDown, 
  Layers, 
  Check, 
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Receipt,
  Wallet,
  MessageCircle,
  Banknote
} from 'lucide-react';
import { useAgencyData } from '../context/AgencyDataContext';
import { ClientInvoiceRecord, Inquiry, PaymentChannel, InvoicePaymentEntry } from '../types';
import {
  generateClientInvoicePdf,
  generatePaymentReceiptPdf,
  loadSavedTransferInfo,
  parseInvoiceAmount,
  generateUniqueInvoiceNumber,
} from '../utils/invoicePdfGenerator';
import { formatInvoicePeriodLabel } from '../utils/billingPeriodUtils';
import { ClientInvoiceModal } from './ClientInvoiceModal';
import { AccountStatementModal } from './AccountStatementModal';

interface InvoicesArchiveHubProps {
  isAr?: boolean;
}

const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, { ar: string; en: string }> = {
  instapay: { ar: 'إنستاباي (InstaPay)', en: 'InstaPay' },
  ewallet: { ar: 'محفظة إلكترونية (E-Wallet)', en: 'E-Wallet' },
  bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  cash: { ar: 'نقدي (Cash)', en: 'Cash' },
};

export const InvoicesArchiveHub: React.FC<InvoicesArchiveHubProps> = ({ isAr = true }) => {
  const {
    data,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
    recordInvoicePayment,
    deleteInvoicePayment,
    logInquiryActivity,
  } = useAgencyData();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'partially_paid' | 'pending' | 'overdue'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');

  // Modals
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedClientForStatement, setSelectedClientForStatement] = useState<Inquiry | null>(null);

  const [previewInvoice, setPreviewInvoice] = useState<ClientInvoiceRecord | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Partial Payments & Receipts Modal
  const [paymentsModalInvoiceId, setPaymentsModalInvoiceId] = useState<string | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [payChannel, setPayChannel] = useState<PaymentChannel>('instapay');
  const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [payReference, setPayReference] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [payFormError, setPayFormError] = useState<string | null>(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  // New Invoice Modal
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [newInvoicePackage, setNewInvoicePackage] = useState('');
  const [newInvoiceRetainer, setNewInvoiceRetainer] = useState(15000);
  const [newInvoiceAdCredit, setNewInvoiceAdCredit] = useState(5000);
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState('');
  const [newInvoicePeriod, setNewInvoicePeriod] = useState('');
  const [newInvoiceNotes, setNewInvoiceNotes] = useState('');

  // Downloading feedback & inline validation states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [newInvoiceError, setNewInvoiceError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'collect';
    invoice: ClientInvoiceRecord;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const clientList = useMemo(() => {
    return (data.inquiries || []).filter((inq) => inq.status === 'closed');
  }, [data.inquiries]);

  const invoices = useMemo(() => {
    return data.invoices || [];
  }, [data.invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchName = inv.clientName.toLowerCase().includes(q);
        const matchComp = (inv.clientCompany || '').toLowerCase().includes(q);
        const matchPkg = inv.packageName.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchComp && !matchPkg) return false;
      }

      // Client filter
      if (selectedClientFilter !== 'all' && inv.clientId !== selectedClientFilter) {
        return false;
      }

      // Payment status
      if (paymentStatusFilter !== 'all') {
        const paidSoFar = inv.paymentStatus === 'paid' ? inv.grandTotal : Math.max(0, inv.paidAmount || 0);
        const isPartial =
          inv.paymentStatus === 'partially_paid' ||
          (inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled' && paidSoFar > 0 && paidSoFar < inv.grandTotal);
        if (paymentStatusFilter === 'paid' && inv.paymentStatus !== 'paid') return false;
        if (paymentStatusFilter === 'partially_paid' && !isPartial) return false;
        if (paymentStatusFilter === 'pending' && (inv.paymentStatus !== 'pending' || isPartial)) return false;
        if (paymentStatusFilter === 'overdue') {
          if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled') return false;
          const today = new Date().toISOString().split('T')[0];
          const isExplicitOverdue = inv.paymentStatus === 'overdue';
          const isPastDue = Boolean(inv.dueDate && inv.dueDate < today);
          if (!isExplicitOverdue && !isPastDue) return false;
        }
      }

      // Date filter
      if (dateFilter !== 'all') {
        const today = new Date();
        const invDate = new Date(inv.issueDate);
        if (dateFilter === 'this_month') {
          if (invDate.getMonth() !== today.getMonth() || invDate.getFullYear() !== today.getFullYear()) return false;
        } else if (dateFilter === 'last_month') {
          const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          if (invDate.getMonth() !== prevMonth || invDate.getFullYear() !== prevYear) return false;
        } else if (dateFilter === 'this_year') {
          if (invDate.getFullYear() !== today.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [invoices, searchQuery, selectedClientFilter, paymentStatusFilter, dateFilter]);

  const activePaymentInvoice = useMemo(() => {
    if (!paymentsModalInvoiceId) return null;
    return invoices.find((i) => i.id === paymentsModalInvoiceId) || null;
  }, [invoices, paymentsModalInvoiceId]);

  // Overall Financial Archive Metrics (accounts for partial payments accurately)
  const metrics = useMemo(() => {
    let totalCount = invoices.length;
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalAdCredit = 0;

    invoices.forEach((inv) => {
      if (inv.paymentStatus === 'cancelled') return;
      totalInvoiced += inv.grandTotal;
      totalAdCredit += inv.adCreditAmount || 0;
      if (inv.paymentStatus === 'paid') {
        totalPaid += inv.grandTotal;
      } else {
        const paidSoFar = Math.min(inv.grandTotal, Math.max(0, inv.paidAmount || 0));
        totalPaid += paidSoFar;
        totalPending += Math.max(0, inv.grandTotal - paidSoFar);
      }
    });

    return {
      totalCount,
      totalInvoiced,
      totalPaid,
      totalPending,
      totalAdCredit,
    };
  }, [invoices]);

  // Download PDF directly from Archive
  const handleDownloadInvoicePdf = async (inv: ClientInvoiceRecord) => {
    setDownloadingId(inv.id);
    try {
      // Find client object or construct fallback
      const client = (data.inquiries || []).find((c) => c.id === inv.clientId) || {
        id: inv.clientId,
        name: inv.clientName,
        company: inv.clientCompany,
        phone: inv.clientPhone || '',
        sector: inv.sector || 'b2b',
        packageName: inv.packageName,
        budget: `${inv.retainerAmount.toLocaleString()} ج.م`,
        status: 'closed' as const,
        createdAt: inv.issueDate,
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const effectiveStatus: 'paid' | 'pending' | 'overdue' =
        inv.paymentStatus === 'paid'
          ? 'paid'
          : inv.paymentStatus === 'overdue' || (inv.paymentStatus === 'pending' && Boolean(inv.dueDate && inv.dueDate < todayStr))
          ? 'overdue'
          : 'pending';

      const res = await generateClientInvoicePdf({
        client: { ...client, paymentStatus: effectiveStatus },
        packageName: inv.packageName,
        totalCost: `${inv.retainerAmount.toLocaleString()} ج.م`,
        adCreditAmount: inv.adCreditAmount || 0,
        billingCycle: inv.billingCycle || 'monthly',
        contractStartDate: inv.issueDate,
        contractPeriod:
          inv.contractPeriod ||
          formatInvoicePeriodLabel(client.contractStartDate || inv.issueDate, inv.billingCycle || 'monthly', isAr),
        invoiceNumber: inv.invoiceNumber,
        paymentStatus: effectiveStatus,
        isAr,
      });

      if (res.success) {
        showToast(isAr ? `تم تحميل الفاتورة ${inv.invoiceNumber} بنجاح!` : `Invoice ${inv.invoiceNumber} downloaded!`);
      }
    } catch (err) {
      console.error('Invoice download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Preview Invoice in Modal
  const handlePreviewInvoice = (inv: ClientInvoiceRecord) => {
    setPreviewInvoice(inv);
    setIsPreviewModalOpen(true);
  };

  // Mark as Paid & Collect Ad Credit (via in-app confirmation modal)
  const handleCollectInvoice = (inv: ClientInvoiceRecord) => {
    setPendingAction({ type: 'collect', invoice: inv });
  };

  // Open Partial Payments & Receipts Modal
  const openPaymentsModal = (inv: ClientInvoiceRecord) => {
    const paidSoFar = inv.paymentStatus === 'paid' ? inv.grandTotal : Math.max(0, inv.paidAmount || 0);
    const remaining = Math.max(0, inv.grandTotal - paidSoFar);
    setPaymentsModalInvoiceId(inv.id);
    setPayAmountInput(remaining > 0 ? String(Math.round(remaining / 2)) : '');
    setPayChannel('instapay');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayReference('');
    setPayNotes('');
    setPayFormError(null);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice) return;
    setPayFormError(null);
    const amountNum = Number(payAmountInput);
    const paidSoFar =
      activePaymentInvoice.paymentStatus === 'paid'
        ? activePaymentInvoice.grandTotal
        : Math.max(0, activePaymentInvoice.paidAmount || 0);
    const remaining = Math.max(0, activePaymentInvoice.grandTotal - paidSoFar);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setPayFormError(isAr ? 'يرجى إدخال مبلغ صحيح أكبر من صفر.' : 'Please enter a valid payment amount.');
      return;
    }
    if (amountNum > remaining && remaining > 0) {
      setPayFormError(
        isAr
          ? `المبلغ المدخل أكبر من المتبقي المستحق (${remaining.toLocaleString()} ج.م).`
          : `Amount exceeds remaining balance (${remaining.toLocaleString()} EGP).`
      );
      return;
    }

    const entry = recordInvoicePayment(activePaymentInvoice.id, {
      amount: amountNum,
      method: payChannel,
      methodLabel: isAr ? PAYMENT_CHANNEL_LABELS[payChannel].ar : PAYMENT_CHANNEL_LABELS[payChannel].en,
      date: payDate || new Date().toISOString().split('T')[0],
      reference: payReference.trim() || undefined,
      notes: payNotes.trim() || undefined,
    });

    if (entry) {
      const nextRemaining = Math.max(0, remaining - amountNum);
      setPayAmountInput(nextRemaining > 0 ? String(nextRemaining) : '');
      setPayReference('');
      setPayNotes('');
      showToast(
        isAr
          ? `تم تسجيل دفعة ${amountNum.toLocaleString()} ج.م وإصدار الإيصال ${entry.receiptNumber}`
          : `Recorded ${amountNum.toLocaleString()} EGP — Receipt ${entry.receiptNumber}`
      );
    }
  };

  const handleDownloadReceiptPdf = async (inv: ClientInvoiceRecord, payment: InvoicePaymentEntry) => {
    setDownloadingReceiptId(payment.id);
    try {
      const res = await generatePaymentReceiptPdf({ invoice: inv, payment, isAr });
      if (res.success) {
        showToast(
          isAr
            ? `تم تحميل إيصال السداد الرسمي ${payment.receiptNumber}`
            : `Receipt ${payment.receiptNumber} downloaded!`
        );
      }
    } catch (err) {
      console.error('Receipt PDF error:', err);
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  // Update Invoice Payment Status from Archive selector
  const handleStatusChange = (
    inv: ClientInvoiceRecord,
    nextStatus: ClientInvoiceRecord['paymentStatus']
  ) => {
    if (nextStatus === inv.paymentStatus) return;
    if (nextStatus === 'paid') {
      handleCollectInvoice(inv);
      return;
    }
    if (nextStatus === 'partially_paid') {
      openPaymentsModal(inv);
      return;
    }
    updateInvoice(inv.id, {
      paymentStatus: nextStatus,
      paidAt: undefined,
    });
    const labelAr =
      nextStatus === 'overdue'
        ? 'متأخر عن السداد'
        : nextStatus === 'cancelled'
        ? 'ملغاة'
        : 'قيد التحصيل';
    const labelEn =
      nextStatus === 'overdue' ? 'Overdue' : nextStatus === 'cancelled' ? 'Cancelled' : 'Pending';
    showToast(
      isAr
        ? `تم تحديث حالة الفاتورة ${inv.invoiceNumber} إلى «${labelAr}».`
        : `Invoice ${inv.invoiceNumber} status updated to "${labelEn}".`
    );
  };

  // Delete Invoice (via in-app confirmation modal — works reliably inside iframes)
  const handleDeleteInvoice = (inv: ClientInvoiceRecord) => {
    setPendingAction({ type: 'delete', invoice: inv });
  };

  const handleConfirmPendingAction = () => {
    if (!pendingAction) return;
    const { type, invoice } = pendingAction;
    if (type === 'collect') {
      markInvoiceAsPaid(invoice.id, 'تحويل بنكي');
      showToast(
        isAr
          ? `تم تحصيل الفاتورة ${invoice.invoiceNumber} وإيداع الرصيد الإعلاني بنجاح!`
          : `Invoice ${invoice.invoiceNumber} collected and ad credit deposited!`
      );
    } else {
      deleteInvoice(invoice.id);
      showToast(
        isAr
          ? `تم حذف الفاتورة ${invoice.invoiceNumber} من الأرشيف.`
          : `Invoice ${invoice.invoiceNumber} deleted.`
      );
    }
    setPendingAction(null);
  };

  // Build WhatsApp direct URL cleanly for anchor tags (avoids window.open blocking in iframes)
  const getInvoiceWhatsAppHref = (inv: ClientInvoiceRecord) => {
    const cleanPhone = (inv.clientPhone || '').replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;

    const periodLine = inv.contractPeriod ? `\n🗓️ *فترة الفاتورة:* ${inv.contractPeriod}` : '';
    const message = isAr
      ? `📄 *فاتورة رسمية صادرة — ديجيتال إفكت*
🏢 *العميل:* ${inv.clientCompany || inv.clientName}
🔢 *رقم الفاتورة:* ${inv.invoiceNumber}
📅 *تاريخ الإصدار:* ${inv.issueDate}${periodLine}
📦 *الباقة:* ${inv.packageName}

💵 *تفاصيل التكلفة:*
• أتعاب إدارة الباقة: *${inv.retainerAmount.toLocaleString()} ج.م*
${inv.adCreditAmount ? `• رصيد إعلاني ممول: *${inv.adCreditAmount.toLocaleString()} ج.م*\n` : ''}• *الإجمالي المستحق:* *${inv.grandTotal.toLocaleString()} ج.م*
• *حالة السداد:* ${inv.paymentStatus === 'paid' ? '✅ مدفوع ومحصل' : '⏳ قيد التحصيل'}

_ديجيتال إفكت للحلول الرقمية والتسويق الإلكتروني._`
      : `📄 *Official Invoice — Digital Effect*
Client: ${inv.clientCompany || inv.clientName}
Invoice: ${inv.invoiceNumber}${inv.contractPeriod ? `\nPeriod: ${inv.contractPeriod}` : ''}
Total: ${inv.grandTotal.toLocaleString()} EGP
Status: ${inv.paymentStatus === 'paid' ? 'Paid' : 'Pending'}`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  };

  // Build One-Click Polite WhatsApp Payment Reminder URL (with remaining due + InstaPay & E-Wallet details)
  const getPaymentReminderWhatsAppHref = (inv: ClientInvoiceRecord) => {
    const cleanPhone = (inv.clientPhone || '').replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const transfer = loadSavedTransferInfo();
    const paidSoFar = inv.paymentStatus === 'paid' ? inv.grandTotal : Math.min(inv.grandTotal, Math.max(0, inv.paidAmount || 0));
    const remaining = Math.max(0, inv.grandTotal - paidSoFar);

    const message = isAr
      ? `السلام عليكم أستاذ/ ${inv.clientName || inv.clientCompany} 👋
تحية طيبة من فريق *ديجيتال إفكت*،

نود تذكير حضراتكم بلطف باستحقاق سداد الفاتورة التالية:
📄 *رقم الفاتورة:* ${inv.invoiceNumber}
📦 *الباقة:* ${inv.packageName}
💰 *إجمالي الفاتورة:* ${inv.grandTotal.toLocaleString()} ج.م
${paidSoFar > 0 ? `✅ *المدفوع حتى الآن:* ${paidSoFar.toLocaleString()} ج.م\n` : ''}⏳ *المبلغ المتبقي المستحق:* *${remaining.toLocaleString()} ج.م*
${inv.dueDate ? `📅 *تاريخ الاستحقاق:* ${inv.dueDate}\n` : ''}
💳 *بيانات التحويل السريع:*
• إنستاباي (InstaPay): ${transfer.instaPay}
• المحفظة الإلكترونية: ${transfer.walletNumber}

يرجى إرسال صورة إيصال التحويل فور الإتمام لإصدار إيصال السداد الرسمي وتحديث حسابكم فوراً.
شكراً لتعاونكم الدائم معنا 🌹`
      : `Hello ${inv.clientName || inv.clientCompany},
Warm greetings from *Digital Effect*.

This is a friendly payment reminder for your invoice:
📄 *Invoice #:* ${inv.invoiceNumber}
📦 *Package:* ${inv.packageName}
💰 *Grand Total:* ${inv.grandTotal.toLocaleString()} EGP
${paidSoFar > 0 ? `✅ *Paid So Far:* ${paidSoFar.toLocaleString()} EGP\n` : ''}⏳ *Remaining Due:* *${remaining.toLocaleString()} EGP*
${inv.dueDate ? `📅 *Due Date:* ${inv.dueDate}\n` : ''}
💳 *Payment Details:*
• InstaPay: ${transfer.instaPay}
• E-Wallet: ${transfer.walletNumber}

Please share the transfer screenshot once completed so we can issue your official receipt. Thank you!`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleLogPaymentReminder = (inv: ClientInvoiceRecord) => {
    const paidSoFar = Math.min(inv.grandTotal, Math.max(0, inv.paidAmount || 0));
    const remaining = Math.max(0, inv.grandTotal - paidSoFar);
    logInquiryActivity(inv.clientId, {
      type: 'whatsapp',
      text: isAr
        ? `تذكير سداد واتساب — فاتورة ${inv.invoiceNumber}: تم إرسال مطالبة سداد بقيمة المتبقي ${remaining.toLocaleString()} ج.م عبر واتساب.`
        : `WhatsApp payment reminder (${inv.invoiceNumber}): Sent reminder for remaining balance ${remaining.toLocaleString()} EGP.`,
      meta: { channel: 'whatsapp', invoiceNumber: inv.invoiceNumber },
    });
    showToast(
      isAr
        ? `تم فتح تذكير الواتساب وتسجيل المتابعة في سجل العميل.`
        : `WhatsApp payment reminder opened and logged.`
    );
  };

  // Create New Invoice Submit
  const handleCreateNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setNewInvoiceError(null);
    if (!newInvoiceClientId) {
      setNewInvoiceError(isAr ? 'يرجى اختيار العميل أولاً' : 'Please select a client');
      return;
    }

    const client = clientList.find((c) => c.id === newInvoiceClientId);
    if (!client) return;

    const grand = Number(newInvoiceRetainer) + Number(newInvoiceAdCredit || 0);
    const today = new Date().toISOString().split('T')[0];

    const resolvedPeriod =
      newInvoicePeriod.trim() ||
      formatInvoicePeriodLabel(client.contractStartDate || today, client.billingCycle || 'monthly', isAr);

    addInvoice({
      invoiceNumber: generateUniqueInvoiceNumber(client.id, invoices),
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientPhone: client.phone,
      sector: client.sector,
      issueDate: today,
      dueDate: newInvoiceDueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      packageName: newInvoicePackage || client.packageName || (isAr ? 'باقة تسويق رقمي' : 'Marketing Package'),
      retainerAmount: Number(newInvoiceRetainer),
      adCreditAmount: Number(newInvoiceAdCredit || 0),
      grandTotal: grand,
      billingCycle: client.billingCycle || 'monthly',
      contractPeriod: resolvedPeriod,
      paymentStatus: 'pending',
      notes: newInvoiceNotes,
      deliverables: {
        posts: client.postsTarget || 8,
        reels: client.reelsTarget || 4,
        stories: client.storiesTarget || 0,
      },
    });

    setIsNewInvoiceOpen(false);
    showToast(isAr ? 'تم إصدار الفاتورة وإدراجها في الأرشيف المالي بنجاح!' : 'New invoice issued and archived!');
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isAr ? 'أرشيف الفواتير وكشوف الحسابات المالية' : 'Invoices & Financial Statements Archive'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'المنظومة المحاسبية المعتمدة لأرشفة الفواتير المصدرة، تحصيل الأتعاب، إيداع الرصيد الإعلاني الممول، واستخراج كشف حساب تفصيلي معتمد عن أي فترة زمنية.'
                : 'Central repository for issued client invoices, retainer collections, ad spend deposits, and comprehensive statement generation.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Account Statement Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedClientForStatement(clientList[0] || null);
                setIsStatementModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? 'استخراج كشف حساب مالي (PDF)' : 'Statement of Account'}</span>
            </button>

            {/* Issue New Invoice Button */}
            <button
              type="button"
              onClick={() => {
                if (clientList.length > 0) {
                  const first = clientList[0];
                  setNewInvoiceClientId(first.id);
                  setNewInvoicePackage(first.packageName || '');
                  setNewInvoicePeriod(
                    formatInvoicePeriodLabel(first.contractStartDate || first.createdAt, first.billingCycle || 'monthly', isAr)
                  );
                }
                setIsNewInvoiceOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إصدار فاتورة جديدة' : 'Issue Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Archive Overview Metric Counters (5 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">
            {isAr ? 'إجمالي الفواتير الصادرة' : 'Total Invoices'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{metrics.totalCount}</span>
            <span className="text-xs text-slate-400">{isAr ? 'فاتورة' : 'invoices'}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 block mb-1">
            {isAr ? 'إجمالي المبالغ المفوترة' : 'Total Invoiced'}
          </span>
          <span className="text-xl font-black text-blue-900 font-mono">
            {metrics.totalInvoiced.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 block mb-1">
            {isAr ? 'إجمالي المحصل والمسدد' : 'Total Collected'}
          </span>
          <span className="text-xl font-black text-emerald-900 font-mono">
            {metrics.totalPaid.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 block mb-1">
            {isAr ? 'مستحق قيد التحصيل' : 'Pending Receivables'}
          </span>
          <span className="text-xl font-black text-amber-900 font-mono">
            {metrics.totalPending.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-purple-700 block mb-1 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isAr ? 'رصيد إعلاني مفوتر' : 'Ad Credit Invoiced'}</span>
          </span>
          <span className="text-xl font-black text-purple-900 font-mono">
            {metrics.totalAdCredit.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث برقم الفاتورة، اسم العميل، أو الشركة...' : 'Search invoice #, client, company...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'}`} />
          </div>

          {/* Client Filter */}
          <div className="md:col-span-3 relative">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع العملاء (الكل)' : 'All Clients'}</option>
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isAr ? 'left-3' : 'right-3'}`} />
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-3 relative">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
            >
              <option value="all">{isAr ? 'كافة حالات السداد' : 'All Payment Statuses'}</option>
              <option value="paid">{isAr ? 'مدفوعة ومحصلة ✅' : 'Paid'}</option>
              <option value="partially_paid">{isAr ? 'مدفوعة جزئياً 🟡' : 'Partially Paid'}</option>
              <option value="pending">{isAr ? 'قيد التحصيل ⏳' : 'Pending'}</option>
              <option value="overdue">{isAr ? 'متأخرة عن موعدها ⚠️' : 'Overdue'}</option>
            </select>
            <ChevronDown className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isAr ? 'left-3' : 'right-3'}`} />
          </div>

          {/* Date Filter */}
          <div className="md:col-span-2 relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
            >
              <option value="all">{isAr ? 'كل الفترات' : 'All Dates'}</option>
              <option value="this_month">{isAr ? 'هذا الشهر' : 'This Month'}</option>
              <option value="last_month">{isAr ? 'الشهر الماضي' : 'Last Month'}</option>
              <option value="this_year">{isAr ? 'العام الحالي' : 'This Year'}</option>
            </select>
            <ChevronDown className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isAr ? 'left-3' : 'right-3'}`} />
          </div>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-black text-xs text-slate-900">
              {isAr ? 'سجلات الفواتير المصدرة' : 'Archived Invoices'}
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              ({filteredInvoices.length} {isAr ? 'فاتورة' : 'records'})
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            {isAr ? 'انقر على تحميل الفاتورة لاستخراج نسخة PDF رسمية فوراً' : 'Click download to export official A4 PDF'}
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-500">
              {isAr ? 'لا توجد فواتير مطابقة للبحث أو الفلتر المحدد.' : 'No invoices match your search filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => {
              const isPaid = inv.paymentStatus === 'paid';
              const isCancelled = inv.paymentStatus === 'cancelled';
              const paidSoFar = isPaid
                ? inv.grandTotal
                : Math.min(inv.grandTotal, Math.max(0, inv.paidAmount || 0));
              const remainingAmount = isCancelled ? 0 : Math.max(0, inv.grandTotal - paidSoFar);
              const isPartiallyPaid =
                !isPaid &&
                !isCancelled &&
                (inv.paymentStatus === 'partially_paid' || (paidSoFar > 0 && remainingAmount > 0));
              const paidPercent =
                inv.grandTotal > 0 ? Math.min(100, Math.round((paidSoFar / inv.grandTotal) * 100)) : 0;
              const isOverdue =
                !isPaid &&
                !isCancelled &&
                (inv.paymentStatus === 'overdue' ||
                  Boolean(inv.dueDate && inv.dueDate < new Date().toISOString().split('T')[0]));
              const displayStatus: ClientInvoiceRecord['paymentStatus'] = isPaid
                ? 'paid'
                : isCancelled
                ? 'cancelled'
                : isPartiallyPaid
                ? 'partially_paid'
                : isOverdue
                ? 'overdue'
                : 'pending';
              const receiptsCount = inv.payments?.length || 0;

              return (
                <div 
                  key={inv.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Invoice info & client details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {inv.clientCompany || inv.clientName}
                      </span>
                      <span className="text-[10px] text-slate-500">({inv.clientName})</span>

                      {/* Payment Status Badge */}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : isPartiallyPaid
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 font-black'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isPaid
                          ? (isAr ? '✅ مدفوع بالكامل' : 'Paid in Full')
                          : isCancelled
                          ? (isAr ? '🚫 ملغاة' : 'Cancelled')
                          : isPartiallyPaid
                          ? (isAr ? `🟡 مدفوع جزئياً (${paidPercent}%)` : `Partially Paid (${paidPercent}%)`)
                          : isOverdue
                          ? (isAr ? '❌ متأخر عن السداد' : 'Overdue')
                          : (isAr ? '⏳ قيد التحصيل' : 'Pending')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{inv.packageName}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-500">
                        {isAr ? 'تاريخ الإصدار:' : 'Issued:'} <strong>{inv.issueDate}</strong>
                      </span>
                      {inv.contractPeriod && (
                        <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>{inv.contractPeriod}</span>
                        </span>
                      )}
                      {inv.dueDate && (
                        <>
                          <span>•</span>
                          <span className={`text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            {isAr ? 'الاستحقاق:' : 'Due:'} <strong>{inv.dueDate}</strong>
                          </span>
                        </>
                      )}
                      {inv.paymentMethod && isPaid && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            {inv.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Partial Payment Progress Strip */}
                    {(isPartiallyPaid || (receiptsCount > 0 && !isCancelled)) && (
                      <div className="pt-1 max-w-md space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-emerald-700">
                            {isAr ? 'المدفوع:' : 'Paid:'} {paidSoFar.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            {receiptsCount > 0 && (
                              <span className="text-slate-400 ms-1">
                                ({receiptsCount} {isAr ? 'إيصال' : 'receipts'})
                              </span>
                            )}
                          </span>
                          {remainingAmount > 0 && (
                            <span className="text-amber-700">
                              {isAr ? 'المتبقي:' : 'Due:'} {remainingAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPaid ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {inv.notes && (
                      <p className="text-[11px] text-slate-500 italic">{inv.notes}</p>
                    )}
                  </div>

                  {/* Middle: Financial amounts pill */}
                  <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {isAr ? 'أتعاب الإدارة' : 'Retainer'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {inv.retainerAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                    </div>

                    {Boolean(inv.adCreditAmount && inv.adCreditAmount > 0) && (
                      <>
                        <span className="text-slate-300">+</span>
                        <div>
                          <span className="text-[10px] text-purple-600 block font-bold">
                            {isAr ? 'رصيد إعلاني' : 'Ad Credit'}
                          </span>
                          <span className="text-xs font-black text-purple-700 font-mono">
                            {(inv.adCreditAmount ?? 0).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                      </>
                    )}

                    <span className="text-slate-300">=</span>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">
                        {isAr ? 'الإجمالي الكلي' : 'Grand Total'}
                      </span>
                      <span className="text-sm font-black text-blue-900 font-mono">
                        {inv.grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {/* Invoice Payment Status Selector */}
                    <div className="relative">
                      <select
                        value={displayStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            inv,
                            e.target.value as ClientInvoiceRecord['paymentStatus']
                          )
                        }
                        aria-label={isAr ? 'حالة الفاتورة' : 'Invoice status'}
                        className={`text-xs font-black py-1.5 ${
                          isAr ? 'pr-2.5 pl-7' : 'pl-2.5 pr-7'
                        } rounded-xl border transition-all shadow-2xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : isCancelled
                            ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            : isPartiallyPaid
                            ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                            : isOverdue
                            ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <option value="pending">{isAr ? '⏳ قيد التحصيل' : '⏳ Pending'}</option>
                        <option value="partially_paid">{isAr ? '🟡 مدفوع جزئياً' : '🟡 Partially Paid'}</option>
                        <option value="paid">{isAr ? '✅ مدفوع بالكامل' : '✅ Paid in Full'}</option>
                        <option value="overdue">{isAr ? '❌ متأخر عن السداد' : '❌ Overdue'}</option>
                        <option value="cancelled">{isAr ? '🚫 ملغاة' : '🚫 Cancelled'}</option>
                      </select>
                      <ChevronDown
                        className={`w-3.5 h-3.5 pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                          isAr ? 'left-2' : 'right-2'
                        } ${
                          isPaid
                            ? 'text-emerald-700'
                            : isCancelled
                            ? 'text-slate-500'
                            : isPartiallyPaid
                            ? 'text-sky-700'
                            : isOverdue
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      />
                    </div>

                    {/* Partial Payments & Official Receipts Button */}
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => openPaymentsModal(inv)}
                        className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        title={isAr ? 'تسجيل دفعة جزئية أو تحميل إيصال سداد PDF' : 'Record payment / download receipt'}
                      >
                        <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isAr ? 'دفعات وإيصال' : 'Payments'}</span>
                        {receiptsCount > 0 && (
                          <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-black">
                            {receiptsCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* One-Click WhatsApp Payment Reminder Button (Unpaid / Partially Paid / Overdue) */}
                    {!isPaid && !isCancelled && (
                      <a
                        href={getPaymentReminderWhatsAppHref(inv)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLogPaymentReminder(inv)}
                        className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        title={isAr ? 'إرسال تذكير سداد واتساب بالمبلغ المتبقي وبيانات التحويل' : 'Send WhatsApp payment reminder'}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isAr ? 'تذكير سداد واتساب' : 'WA Reminder'}</span>
                      </a>
                    )}

                    {/* Download PDF Button */}
                    <button
                      type="button"
                      disabled={downloadingId === inv.id}
                      onClick={() => handleDownloadInvoicePdf(inv)}
                      className="px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title={isAr ? 'تحميل الفاتورة PDF' : 'Download Invoice PDF'}
                    >
                      {downloadingId === inv.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{isAr ? 'تحميل الفاتورة' : 'Download'}</span>
                    </button>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => handlePreviewInvoice(inv)}
                      className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      title={isAr ? 'معاينة الفاتورة' : 'Preview'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* WhatsApp Direct Share Anchor Link */}
                    <a
                      href={getInvoiceWhatsAppHref(inv)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center"
                      title={isAr ? 'مشاركة تفاصيل الفاتورة عبر الواتساب' : 'Share Invoice via WhatsApp'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteInvoice(inv)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={isAr ? 'حذف من الأرشيف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Statement Modal */}
      {isStatementModalOpen && (
        <AccountStatementModal
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          initialClient={selectedClientForStatement}
          isAr={isAr}
        />
      )}

      {/* Invoice Preview Modal (ClientInvoiceModal) */}
      {previewInvoice && isPreviewModalOpen && (
        <ClientInvoiceModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewInvoice(null);
          }}
          client={{
            id: previewInvoice.clientId,
            name: previewInvoice.clientName,
            company: previewInvoice.clientCompany,
            phone: previewInvoice.clientPhone || '',
            sector: previewInvoice.sector || 'b2b',
            packageName: previewInvoice.packageName,
            budget: `${previewInvoice.retainerAmount.toLocaleString()} ج.م`,
            status: 'closed',
            createdAt: previewInvoice.issueDate,
          }}
          packageName={previewInvoice.packageName}
          budget={`${previewInvoice.retainerAmount.toLocaleString()} ج.م`}
          adCreditAmount={previewInvoice.adCreditAmount}
          billingCycle={previewInvoice.billingCycle || 'monthly'}
          contractStartDate={previewInvoice.issueDate}
          contractPeriod={
            previewInvoice.contractPeriod ||
            formatInvoicePeriodLabel(previewInvoice.issueDate, previewInvoice.billingCycle || 'monthly', isAr)
          }
          renewalDate={previewInvoice.dueDate}
          paymentStatus={
            previewInvoice.paymentStatus === 'cancelled' || previewInvoice.paymentStatus === 'partially_paid'
              ? 'pending'
              : previewInvoice.paymentStatus === 'pending' &&
                Boolean(previewInvoice.dueDate && previewInvoice.dueDate < new Date().toISOString().split('T')[0])
              ? 'overdue'
              : previewInvoice.paymentStatus
          }
          initialInvoiceNumber={previewInvoice.invoiceNumber}
          isPreviewOnly={true}
          targetPosts={previewInvoice.deliverables?.posts || 8}
          targetReels={previewInvoice.deliverables?.reels || 4}
          targetStories={previewInvoice.deliverables?.stories || 0}
          isAr={isAr}
        />
      )}

      {/* New Invoice Form Modal */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">
                  {isAr ? 'إصدار فاتورة جديدة للعميل' : 'Issue New Invoice'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsNewInvoiceOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewInvoice} className="space-y-3.5">
              {newInvoiceError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{newInvoiceError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'العميل المستفيد:' : 'Client:'}
                </label>
                <select
                  value={newInvoiceClientId}
                  onChange={(e) => {
                    setNewInvoiceClientId(e.target.value);
                    const selected = clientList.find((c) => c.id === e.target.value);
                    if (selected) {
                      setNewInvoicePackage(selected.packageName || '');
                      const num = parseInvoiceAmount(selected.budget) || selected.retainerAmount || 0;
                      if (num) setNewInvoiceRetainer(num);
                      setNewInvoicePeriod(
                        formatInvoicePeriodLabel(
                          selected.contractStartDate || selected.createdAt,
                          selected.billingCycle || 'monthly',
                          isAr
                        )
                      );
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">{isAr ? 'اختر العميل...' : 'Select client...'}</option>
                  {clientList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name} — {c.packageName || (isAr ? 'باقة مخصصة' : 'Package')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'اسم الباقة أو المسمى المالي للفاتورة:' : 'Package Title:'}
                </label>
                <input
                  type="text"
                  value={newInvoicePackage}
                  onChange={(e) => setNewInvoicePackage(e.target.value)}
                  placeholder={isAr ? 'مثال: باقة مخصصة — الشركات والمصانع' : 'Package title...'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'أتعاب إدارة الباقة (ج.م):' : 'Retainer Fee (EGP):'}
                  </label>
                  <input
                    type="number"
                    value={newInvoiceRetainer}
                    onChange={(e) => setNewInvoiceRetainer(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-700">
                    {isAr ? 'رصيد إعلاني ممول (ج.م):' : 'Ad Spend Budget (EGP):'}
                  </label>
                  <input
                    type="number"
                    value={newInvoiceAdCredit}
                    onChange={(e) => setNewInvoiceAdCredit(Number(e.target.value))}
                    className="w-full bg-purple-50/70 border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-indigo-800">
                  {isAr ? 'فترة الفاتورة (تُكتب تحت تاريخ الإصدار):' : 'Invoice Period (Shown Under Date):'}
                </label>
                <input
                  type="text"
                  value={newInvoicePeriod}
                  onChange={(e) => setNewInvoicePeriod(e.target.value)}
                  placeholder={isAr ? 'مثال: عن شهر ديسمبر 2026 — أو عن أشهر أكتوبر ونوفمبر وديسمبر 2026' : 'e.g. For December 2026'}
                  className="w-full bg-indigo-50/70 border border-indigo-200 rounded-xl px-3 py-2 text-xs font-black text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'ملاحظات إضافية على الفاتورة:' : 'Notes:'}
                </label>
                <textarea
                  value={newInvoiceNotes}
                  onChange={(e) => setNewInvoiceNotes(e.target.value)}
                  rows={2}
                  placeholder={isAr ? 'مثال: تشمل الحملات الإعلانية لشهر نوفمبر ومخرجات الأسبوع الأول' : 'Optional notes...'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  {isAr ? 'الإجمالي المستحق بالفاتورة:' : 'Total Amount Due:'}
                </span>
                <span className="text-sm font-black text-blue-900 font-mono">
                  {(Number(newInvoiceRetainer) + Number(newInvoiceAdCredit || 0)).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isAr ? 'حفظ وإصدار الفاتورة' : 'Issue & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal for Delete / Collect Invoice (Iframe-safe) */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPendingAction(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  pendingAction.type === 'delete'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {pendingAction.type === 'delete' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  {pendingAction.type === 'delete'
                    ? isAr
                      ? 'تأكيد حذف الفاتورة نهائياً'
                      : 'Confirm Invoice Deletion'
                    : isAr
                    ? 'تأكيد تحصيل الفاتورة'
                    : 'Confirm Invoice Collection'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pendingAction.type === 'delete'
                    ? isAr
                      ? `هل أنت متأكد من حذف الفاتورة (${pendingAction.invoice.invoiceNumber}) الخاصة بـ "${pendingAction.invoice.clientCompany || pendingAction.invoice.clientName}" نهائياً من الأرشيف؟`
                      : `Are you sure you want to permanently delete invoice ${pendingAction.invoice.invoiceNumber} from archive?`
                    : isAr
                    ? `هل تريد تأكيد تحصيل الفاتورة (${pendingAction.invoice.invoiceNumber}) بقيمة ${pendingAction.invoice.grandTotal.toLocaleString()} ج.م وإيداع الرصيد الإعلاني تلقائياً؟`
                    : `Confirm collection of invoice ${pendingAction.invoice.invoiceNumber} for ${pendingAction.invoice.grandTotal.toLocaleString()} EGP?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmPendingAction}
                className={`px-5 py-2 text-xs font-black text-white rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer ${
                  pendingAction.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {pendingAction.type === 'delete' ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {pendingAction.type === 'delete'
                    ? isAr
                      ? 'نعم، احذف الفاتورة'
                      : 'Yes, Delete Invoice'
                    : isAr
                    ? 'نعم، تأكيد التحصيل'
                    : 'Yes, Confirm Collection'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Partial Payments & Official Receipts Modal */}
      {activePaymentInvoice && (() => {
        const paidSoFar =
          activePaymentInvoice.paymentStatus === 'paid'
            ? activePaymentInvoice.grandTotal
            : Math.min(activePaymentInvoice.grandTotal, Math.max(0, activePaymentInvoice.paidAmount || 0));
        const remaining = Math.max(0, activePaymentInvoice.grandTotal - paidSoFar);
        const pct =
          activePaymentInvoice.grandTotal > 0
            ? Math.min(100, Math.round((paidSoFar / activePaymentInvoice.grandTotal) * 100))
            : 0;
        const paymentsList = activePaymentInvoice.payments || [];

        return (
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setPaymentsModalInvoiceId(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white flex items-center justify-between gap-3 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                    <Receipt className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black">
                      {isAr ? 'الدفعات الجزئية وإيصالات السداد الرسمية' : 'Partial Payments & Official Receipts'}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      <span className="font-mono text-sky-300">{activePaymentInvoice.invoiceNumber}</span> ·{' '}
                      {activePaymentInvoice.clientCompany || activePaymentInvoice.clientName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentsModalInvoiceId(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Summary Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      {isAr ? 'إجمالي الفاتورة' : 'Invoice Total'}
                    </span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {activePaymentInvoice.grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 block">
                      {isAr ? 'المدفوع حتى الآن' : 'Paid So Far'} ({pct}%)
                    </span>
                    <span className="text-base font-black text-emerald-900 font-mono">
                      {paidSoFar.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 block">
                      {isAr ? 'المتبقي المستحق' : 'Remaining Due'}
                    </span>
                    <span className="text-base font-black text-amber-900 font-mono">
                      {remaining.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      remaining === 0 ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Record New Payment Form */}
                {remaining > 0 ? (
                  <form
                    onSubmit={handleRecordPaymentSubmit}
                    className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-indigo-600" />
                        <span>{isAr ? 'تسجيل دفعة جديدة وإصدار إيصال' : 'Record New Payment'}</span>
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPayAmountInput(
                              String(Math.max(1, Math.round((paidSoFar === 0 ? activePaymentInvoice.grandTotal : remaining) / 2)))
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-[10px] font-black hover:bg-indigo-100 cursor-pointer"
                        >
                          {isAr ? '50% دفعة مقدمة' : '50% Split'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayAmountInput(String(remaining))}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 cursor-pointer"
                        >
                          {isAr
                            ? `سداد المتبقي بالكامل (${remaining.toLocaleString()})`
                            : `Pay Full Remaining (${remaining.toLocaleString()})`}
                        </button>
                      </div>
                    </div>

                    {payFormError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{payFormError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          {isAr ? 'قيمة الدفعة (ج.م):' : 'Payment Amount (EGP):'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={remaining}
                          value={payAmountInput}
                          onChange={(e) => setPayAmountInput(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          {isAr ? 'وسيلة التحويل / السداد:' : 'Payment Channel:'}
                        </label>
                        <select
                          value={payChannel}
                          onChange={(e) => setPayChannel(e.target.value as PaymentChannel)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          {(Object.keys(PAYMENT_CHANNEL_LABELS) as PaymentChannel[]).map((ch) => (
                            <option key={ch} value={ch}>
                              {isAr ? PAYMENT_CHANNEL_LABELS[ch].ar : PAYMENT_CHANNEL_LABELS[ch].en}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          {isAr ? 'تاريخ الاستلام:' : 'Payment Date:'}
                        </label>
                        <input
                          type="date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={payReference}
                        onChange={(e) => setPayReference(e.target.value)}
                        placeholder={isAr ? 'رقم المرجع / العملية (اختياري)' : 'Reference / Transaction ID (optional)'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        placeholder={isAr ? 'ملاحظات الدفعة (مثال: دفعة أولى 50%)' : 'Notes (e.g. 50% upfront)'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAr ? 'اعتماد الدفعة وإصدار الإيصال' : 'Record Payment & Issue Receipt'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isAr
                        ? 'تم سداد هذه الفاتورة بالكامل — يمكنك تحميل إيصالات السداد الرسمية أدناه.'
                        : 'This invoice is fully paid — download official receipts below.'}
                    </span>
                  </div>
                )}

                {/* Recorded Payments & Receipts History */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>
                        {isAr
                          ? `سجل الدفعات المسجلة والإيصالات (${paymentsList.length})`
                          : `Recorded Payments & Receipts (${paymentsList.length})`}
                      </span>
                    </h4>
                  </div>

                  {paymentsList.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                      {isAr
                        ? 'لم يتم تسجيل أي دفعات جزئية على هذه الفاتورة بعد.'
                        : 'No payments recorded on this invoice yet.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {paymentsList.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {entry.receiptNumber}
                              </span>
                              <span className="text-sm font-black text-slate-900 font-mono">
                                {entry.amount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                              </span>
                              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                {entry.methodLabel ||
                                  (isAr
                                    ? PAYMENT_CHANNEL_LABELS[entry.method]?.ar || entry.method
                                    : PAYMENT_CHANNEL_LABELS[entry.method]?.en || entry.method)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                              <span>
                                {isAr ? 'التاريخ:' : 'Date:'} <strong>{entry.date}</strong>
                              </span>
                              {entry.reference && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">
                                    {isAr ? 'مرجع:' : 'Ref:'} {entry.reference}
                                  </span>
                                </>
                              )}
                              {entry.notes && (
                                <>
                                  <span>•</span>
                                  <span>{entry.notes}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={downloadingReceiptId === entry.id}
                              onClick={() => handleDownloadReceiptPdf(activePaymentInvoice, entry)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              {downloadingReceiptId === entry.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>{isAr ? 'تحميل إيصال PDF' : 'Receipt PDF'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                deleteInvoicePayment(activePaymentInvoice.id, entry.id);
                                showToast(
                                  isAr
                                    ? `تم حذف الدفعة ${entry.receiptNumber} وإعادة احتساب المتبقي.`
                                    : `Payment ${entry.receiptNumber} removed.`
                                );
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                              title={isAr ? 'حذف الدفعة' : 'Delete payment'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
