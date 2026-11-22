import React, { useState, useRef, useEffect } from 'react';
import { Inquiry } from '../types';
import { useAgencyData } from '../context/AgencyDataContext';
import {
  X,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Phone,
  Tag,
  CreditCard,
  ShieldCheck,
  Share2,
  Sparkles,
  Loader2,
  Layers,
  CheckSquare,
  AlertCircle,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  Paperclip
} from 'lucide-react';
import {
  parseInvoiceAmount,
  loadSavedTransferInfo,
  saveTransferInfo,
  captureElementToPdf,
  uploadInvoicePdfForShare,
  generateUniqueInvoiceNumber,
  InvoiceTransferInfo,
} from '../utils/invoicePdfGenerator';
import { formatInvoicePeriodLabel } from '../utils/billingPeriodUtils';

interface ClientInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Inquiry;
  packageName: string;
  budget: string;
  adCreditAmount?: number;
  billingCycle?: Inquiry['billingCycle'];
  contractStartDate?: string;
  contractPeriod?: string;
  renewalDate?: string;
  paymentStatus?: Inquiry['paymentStatus'];
  initialInvoiceNumber?: string;
  isPreviewOnly?: boolean;
  targetPosts: number;
  targetReels: number;
  targetStories: number;
  isAr?: boolean;
}

export const ClientInvoiceModal: React.FC<ClientInvoiceModalProps> = ({
  isOpen,
  onClose,
  client,
  packageName,
  budget,
  adCreditAmount = 0,
  billingCycle = 'quarterly',
  contractStartDate,
  contractPeriod: initialContractPeriod,
  renewalDate,
  paymentStatus = 'pending',
  initialInvoiceNumber,
  isPreviewOnly = false,
  targetPosts,
  targetReels,
  targetStories,
  isAr = true,
}) => {
  const { data, addInvoice, updateInvoice } = useAgencyData();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const archivedInvoiceIdRef = useRef<string | null>(null);
  const hasInitializedOpenRef = useRef<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparingWhatsApp, setIsPreparingWhatsApp] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPdfLink, setCopiedPdfLink] = useState(false);
  const [whatsAppReady, setWhatsAppReady] = useState<{
    waUrl: string;
    pdfUrl: string | null;
    filename: string;
    sharedNatively?: boolean;
  } | null>(null);

  // Editable invoice fields — automatically reset when modal opens for a different client
  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    initialInvoiceNumber || generateUniqueInvoiceNumber(client.id, data.invoices || [])
  );
  const [issueDate, setIssueDate] = useState(
    contractStartDate || new Date().toISOString().split('T')[0]
  );
  const [contractPeriod, setContractPeriod] = useState<string>(() =>
    (initialContractPeriod || '').trim() ||
    formatInvoicePeriodLabel(contractStartDate || client.contractStartDate || client.createdAt, billingCycle, isAr)
  );
  const [dueDate, setDueDate] = useState(
    renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(
    isAr
      ? 'شكراً لثقتكم بوكالة ديجيتال إفكت. تعتبر هذه الفاتورة بياناً رسمياً معتمداً لخدمات التسويق الرقمي وإدارة الحملات المتفق عليها.'
      : 'Thank you for choosing Digital Effect. This invoice constitutes an official statement of agreed marketing services.'
  );

  const [adCredit, setAdCredit] = useState<number>(adCreditAmount || client.pendingInvoiceAdCredit || 0);
  const [transferInfo, setTransferInfo] = useState<InvoiceTransferInfo>(() => loadSavedTransferInfo());

  // Financial calculations (supports Arabic-Indic & English numerals)
  const parsedBudget = parseInvoiceAmount(budget);
  const numericBudget = parsedBudget > 0 ? parsedBudget : (client.retainerAmount || 0);
  const formattedBudget = numericBudget > 0
    ? `${numericBudget.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
    : budget;
  const numericGrandTotal = numericBudget + (adCredit || 0);
  const cycleTextAr =
    billingCycle === 'annual'
      ? 'سنوي'
      : billingCycle === 'quarterly'
      ? 'ربع سنوي'
      : 'شهري';
  const cycleTextEn =
    billingCycle === 'annual'
      ? 'Annual'
      : billingCycle === 'quarterly'
      ? 'Quarterly'
      : 'Monthly';

  // Calculate multiplier for deliverables based on cycle
  const cycleMultiplier = billingCycle === 'quarterly' ? 3 : billingCycle === 'annual' ? 12 : 1;
  const cyclePosts = targetPosts * cycleMultiplier;
  const cycleReels = targetReels * cycleMultiplier;
  const cycleStories = targetStories * cycleMultiplier;

  // Auto-initialize and auto-archive invoice immediately upon opening (when not in preview-only mode)
  useEffect(() => {
    if (!isOpen) {
      hasInitializedOpenRef.current = false;
      archivedInvoiceIdRef.current = null;
      return;
    }
    if (hasInitializedOpenRef.current) return;
    hasInitializedOpenRef.current = true;

    const todayStr = new Date().toISOString().split('T')[0];
    const initIssueDate = isPreviewOnly
      ? contractStartDate || todayStr
      : todayStr;
    const initDueDate = renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const initPeriodLabel =
      (initialContractPeriod || '').trim() ||
      formatInvoicePeriodLabel(contractStartDate || client.contractStartDate || initIssueDate, billingCycle, isAr);
    const initAdCredit = adCreditAmount || client.pendingInvoiceAdCredit || 0;
    const initGrandTotal = numericBudget + initAdCredit;
    const currentInvoices = data.invoices || [];

    setIssueDate(initIssueDate);
    setContractPeriod(initPeriodLabel);
    setDueDate(initDueDate);
    setAdCredit(initAdCredit);
    setWhatsAppReady(null);
    setErrorMessage(null);
    setDownloadSuccess(false);

    if (isPreviewOnly) {
      setInvoiceNumber(
        initialInvoiceNumber || generateUniqueInvoiceNumber(client.id, currentInvoices)
      );
      return;
    }

    // Reuse an identical pending invoice already issued during the current billing cycle so re-opening doesn't duplicate
    const cycleBoundary = contractStartDate || initIssueDate;
    const matchingExisting = currentInvoices.find(
      (i) =>
        i.clientId === client.id &&
        i.paymentStatus !== 'paid' &&
        i.paymentStatus !== 'cancelled' &&
        i.issueDate >= cycleBoundary &&
        i.retainerAmount === numericBudget &&
        (i.adCreditAmount || 0) === initAdCredit &&
        i.packageName === packageName
    );

    if (matchingExisting) {
      archivedInvoiceIdRef.current = matchingExisting.id;
      setInvoiceNumber(matchingExisting.invoiceNumber);
      setIssueDate(matchingExisting.issueDate);
      setContractPeriod(
        (matchingExisting.contractPeriod || '').trim() || initPeriodLabel
      );
      return;
    }

    const nextNumber =
      initialInvoiceNumber || generateUniqueInvoiceNumber(client.id, currentInvoices);
    setInvoiceNumber(nextNumber);

    try {
      const created = addInvoice({
        invoiceNumber: nextNumber,
        clientId: client.id,
        clientName: client.name,
        clientCompany: client.company,
        clientPhone: client.phone,
        sector: client.sector,
        issueDate: initIssueDate,
        dueDate: initDueDate,
        packageName,
        retainerAmount: numericBudget,
        adCreditAmount: initAdCredit,
        grandTotal: initGrandTotal,
        billingCycle,
        contractPeriod: initPeriodLabel,
        paymentStatus,
        notes,
        deliverables: { posts: cyclePosts, reels: cycleReels, stories: cycleStories },
      });
      archivedInvoiceIdRef.current = created.id;
    } catch (archErr) {
      console.warn('Could not auto-archive invoice on open:', archErr);
    }
  }, [isOpen, client.id]);

  const handleUpdateTransferField = (field: keyof InvoiceTransferInfo, value: string) => {
    setTransferInfo((prev) => {
      const next = { ...prev, [field]: value };
      saveTransferInfo(next);
      return next;
    });
  };

  if (!isOpen) return null;

  const syncArchivedInvoiceField = (patch: {
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
    contractPeriod?: string;
    adCreditAmount?: number;
    grandTotal?: number;
    notes?: string;
  }) => {
    if (isPreviewOnly || !archivedInvoiceIdRef.current) return;
    updateInvoice(archivedInvoiceIdRef.current, patch);
  };

  const archiveInvoiceIfNeeded = () => {
    try {
      if (archivedInvoiceIdRef.current) {
        updateInvoice(archivedInvoiceIdRef.current, {
          invoiceNumber,
          issueDate,
          dueDate,
          contractPeriod: contractPeriod.trim() || undefined,
          retainerAmount: numericBudget,
          adCreditAmount: adCredit,
          grandTotal: numericGrandTotal,
          notes,
        });
        return invoiceNumber;
      }

      const currentInvoices = data.invoices || [];
      const exactMatch = currentInvoices.find(
        (i) => i.invoiceNumber === invoiceNumber && i.clientId === client.id
      );
      if (exactMatch) {
        archivedInvoiceIdRef.current = exactMatch.id;
        return exactMatch.invoiceNumber;
      }

      const collision = currentInvoices.some((i) => i.invoiceNumber === invoiceNumber);
      const finalNumber = collision
        ? generateUniqueInvoiceNumber(client.id, currentInvoices)
        : invoiceNumber;

      if (collision) {
        setInvoiceNumber(finalNumber);
      }

      const created = addInvoice({
        invoiceNumber: finalNumber,
        clientId: client.id,
        clientName: client.name,
        clientCompany: client.company,
        clientPhone: client.phone,
        sector: client.sector,
        issueDate,
        dueDate,
        packageName,
        retainerAmount: numericBudget,
        adCreditAmount: adCredit,
        grandTotal: numericGrandTotal,
        billingCycle,
        contractPeriod: contractPeriod.trim() || undefined,
        paymentStatus,
        notes,
        deliverables: { posts: cyclePosts, reels: cycleReels, stories: cycleStories },
      });
      archivedInvoiceIdRef.current = created.id;
      return finalNumber;
    } catch (archErr) {
      console.warn('Could not archive invoice:', archErr);
      return invoiceNumber;
    }
  };

  // Handle PDF Generation & Download with unclipped offscreen A4 rendering
  const handleGeneratePdf = async (action: 'download' | 'print' = 'download') => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);
    setDownloadSuccess(false);
    setErrorMessage(null);

    const activeInvNo = archiveInvoiceIfNeeded();

    try {
      const cleanCompany = (client.company || client.name).replace(/\s+/g, '_');
      const filename = `فاتورة_${cleanCompany}_${activeInvNo}.pdf`;

      const captureRes = await captureElementToPdf(invoiceRef.current, {
        filename,
        action,
      });

      if (!captureRes.success) {
        throw new Error(captureRes.error || 'Failed to render PDF');
      }

      if (action === 'download') {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setErrorMessage(
        isAr 
          ? 'تعذر تصدير الفاتورة مؤقتاً، يرجى المحاولة مرة أخرى أو استخدام زر الطباعة المباشرة.' 
          : 'Failed to generate PDF. Please retry or use the Print button.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // WhatsApp invoice sharing with PDF attachment / download & hosted link
  const cleanPhone = (client.phoneE164 || client.phone).replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `20${cleanPhone.slice(1)}` : cleanPhone;
  const baseWaText = isAr
    ? `مرحباً ${client.name}،\nمرفق لسيادتكم بيان فاتورة التعاقد الرسمي رقم (${invoiceNumber})${contractPeriod.trim() ? ` — ${contractPeriod.trim()}` : ''} الخاصة بشركة (${client.company || client.name}) لباقة:\n"${packageName}"\nاشتراك الباقة: ${formattedBudget} (${cycleTextAr})${adCredit > 0 ? `\nرصيد إعلاني ممول: +${adCredit.toLocaleString()} ج.م` : ''}\nإجمالي المستحق: ${numericGrandTotal.toLocaleString()} ج.م\n\nفريق ديجيتال إفكت للحلول الرقمية والتسويق.`
    : `Hello ${client.name},\nPlease find your official invoice (${invoiceNumber})${contractPeriod.trim() ? ` — ${contractPeriod.trim()}` : ''} for (${packageName}). Retainer: ${formattedBudget}${adCredit > 0 ? ` + Ad Credit: ${adCredit.toLocaleString()} EGP` : ''}. Total Due: ${numericGrandTotal.toLocaleString()} EGP.\n\nDigital Effect Team.`;

  const triggerPdfBlobDownload = (blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  };

  const handleSendWhatsApp = async () => {
    if (!invoiceRef.current) return;
    setIsPreparingWhatsApp(true);
    setErrorMessage(null);
    setDownloadSuccess(false);
    setCopiedPdfLink(false);

    const activeInvNo = archiveInvoiceIfNeeded();

    try {
      const cleanCompany = (client.company || client.name).replace(/\s+/g, '_');
      const filename = `فاتورة_${cleanCompany}_${activeInvNo}.pdf`;

      const captureRes = await captureElementToPdf(invoiceRef.current, {
        filename,
        action: 'blob',
      });

      if (!captureRes.success || !captureRes.blob) {
        throw new Error(captureRes.error || 'Failed to render invoice PDF');
      }

      const pdfBlob = captureRes.blob;
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      // Upload PDF to server so we can attach a direct downloadable PDF URL inside the WhatsApp message
      const hostedPdfUrl = await uploadInvoicePdfForShare(pdfBlob, activeInvNo);
      const waTextWithAttachment = hostedPdfUrl
        ? `${baseWaText}\n\n📎 ${isAr ? 'رابط تحميل ملف الفاتورة (PDF):' : 'Download Invoice PDF:'}\n${hostedPdfUrl}`
        : baseWaText;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waTextWithAttachment)}`;

      // Try native OS file share sheet first (attaches the actual PDF file directly on supported browsers/mobile)
      let sharedNatively = false;
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [pdfFile] })
      ) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: filename,
            text: waTextWithAttachment,
          });
          sharedNatively = true;
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            setIsPreparingWhatsApp(false);
            return;
          }
          // NotAllowedError in iframe or unsupported desktop context: fall through to download + WhatsApp chat link
        }
      }

      if (!sharedNatively) {
        if (captureRes.pdf) {
          captureRes.pdf.save(filename);
        } else {
          triggerPdfBlobDownload(pdfBlob, filename);
        }
      }

      setWhatsAppReady({
        waUrl,
        pdfUrl: hostedPdfUrl,
        filename,
        sharedNatively,
      });
    } catch (err: any) {
      console.error('Error preparing WhatsApp invoice:', err);
      setErrorMessage(
        isAr
          ? 'تعذر تجهيز ملف الفاتورة للواتساب حالياً، يمكنك تحميل الفاتورة وإرسالها يدوياً.'
          : 'Could not prepare the invoice PDF for WhatsApp.'
      );
    } finally {
      setIsPreparingWhatsApp(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[96vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* TOP TOOLBAR / ACTION BAR                                          */}
        {/* ================================================================= */}
        <div className="bg-[#0f172a] text-white p-3.5 sm:p-4 flex items-center justify-between gap-3 shrink-0 border-b border-slate-800 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{isAr ? 'إصدار الفاتورة وبيان التعاقد' : 'Generate & Export Official Invoice'}</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PDF A4 Ready
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? `فاتورة رسمية معتمدة لـ ${client.company || client.name} تتضمن تفاصيل الباقة والتكلفة.`
                  : `Official invoice statement for ${client.company || client.name} with deliverables breakdown.`}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {/* WhatsApp Share (Prepares PDF attachment + opens chat) */}
            <button
              type="button"
              disabled={isGenerating || isPreparingWhatsApp}
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title={isAr ? 'تجهيز ملف PDF وإرساله بالواتساب' : 'Prepare PDF & Share on WhatsApp'}
            >
              {isPreparingWhatsApp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? 'جارٍ تجهيز المرفق...' : 'Preparing PDF...'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'إرسال بالواتساب' : 'WhatsApp'}</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGeneratePdf('print')}
              className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={isAr ? 'طباعة مباشرة' : 'Print'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'طباعة' : 'Print'}</span>
            </button>

            {/* Download PDF Button (The primary requested button) */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGeneratePdf('download')}
              className="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? 'جارٍ إنشاء الـ PDF...' : 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل ملف PDF' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success toast */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-1.5 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isAr
                ? 'تم تنزيل ملف الفاتورة PDF بنجاح على جهازك!'
                : 'Invoice PDF downloaded successfully!'}
            </span>
          </div>
        )}

        {/* Error toast */}
        {errorMessage && (
          <div className="bg-rose-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-1.5 animate-in fade-in shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* WhatsApp PDF Attachment Ready Banner */}
        {whatsAppReady && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Paperclip className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-black text-emerald-950">
                  {whatsAppReady.sharedNatively
                    ? (isAr ? 'تمت مشاركة ملف الفاتورة PDF بنجاح!' : 'Invoice PDF shared successfully!')
                    : (isAr
                        ? `تم تحميل ملف الفاتورة PDF على جهازك (${whatsAppReady.filename})`
                        : `Invoice PDF downloaded (${whatsAppReady.filename})`)}
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {isAr
                    ? 'افتح محادثة الواتساب الآن واسحب الملف المحمّل داخل الشات لإرساله كمرفق، كما تم إدراج رابط تحميل مباشر للفاتورة في الرسالة.'
                    : 'Open the WhatsApp chat below and drag the downloaded PDF into the chat to attach it (a direct PDF link is also included in the message).'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
              {whatsAppReady.pdfUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(whatsAppReady.pdfUrl || '');
                      setCopiedPdfLink(true);
                      setTimeout(() => setCopiedPdfLink(false), 2500);
                    } catch {}
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedPdfLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPdfLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ رابط PDF' : 'Copy PDF Link')}</span>
                </button>
              )}

              <a
                href={whatsAppReady.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isAr ? 'فتح شات واتساب العميل الآن' : 'Open Client WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={() => setWhatsAppReady(null)}
                className="p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 rounded-lg cursor-pointer"
                aria-label="Close WhatsApp ready notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* QUICK CUSTOMIZATION SETTINGS BAR                                  */}
        {/* ================================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-3.5 shrink-0 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">{isAr ? 'رقم الفاتورة:' : 'Invoice #:'}</span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  setInvoiceNumber(val);
                  if (val.trim()) {
                    syncArchivedInvoiceField({ invoiceNumber: val.trim() });
                  }
                }}
                className="font-mono font-bold text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">{isAr ? 'تاريخ الإصدار:' : 'Date:'}</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setIssueDate(val);
                  syncArchivedInvoiceField({ issueDate: val });
                }}
                className="font-bold text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200">
              <span className="font-bold text-indigo-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAr ? 'فترة الفاتورة:' : 'Period:'}</span>
              </span>
              <input
                type="text"
                value={contractPeriod}
                onChange={(e) => {
                  const val = e.target.value;
                  setContractPeriod(val);
                  syncArchivedInvoiceField({ contractPeriod: val.trim() || undefined });
                }}
                placeholder={isAr ? 'عن شهر ديسمبر 2026' : 'For December 2026'}
                className="font-bold text-xs px-2 py-0.5 bg-white border border-indigo-300 rounded text-indigo-950 w-52 sm:w-60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200">
              <span className="font-bold text-blue-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'رصيد إعلاني مضاف:' : 'Ad Credit:'}</span>
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={adCredit || ''}
                placeholder="0"
                onChange={(e) => {
                  const nextAd = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setAdCredit(nextAd);
                  syncArchivedInvoiceField({
                    adCreditAmount: nextAd,
                    grandTotal: numericBudget + nextAd,
                  });
                }}
                className="font-mono font-bold text-xs px-2 py-0.5 bg-white border border-blue-300 rounded text-blue-800 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] font-bold text-blue-600">ج.م</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-200 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'رقم المحفظة:' : 'Wallet #:'}</span>
                </span>
                <input
                  type="text"
                  dir="ltr"
                  value={transferInfo.walletNumber}
                  onChange={(e) => handleUpdateTransferField('walletNumber', e.target.value)}
                  placeholder="01004860386"
                  className="font-mono font-bold text-xs px-2 py-0.5 bg-white border border-emerald-300 rounded text-slate-900 w-32 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700">{isAr ? 'إنستاباي:' : 'InstaPay:'}</span>
                <input
                  type="text"
                  dir="ltr"
                  value={transferInfo.instaPay}
                  onChange={(e) => handleUpdateTransferField('instaPay', e.target.value)}
                  placeholder="01004860386"
                  className="font-mono font-bold text-xs px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-900 w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'معاينة مباشرة مطابقة لملف الـ PDF' : 'Live preview matches exported PDF'}</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* INVOICE DOCUMENT (A4 PRINTABLE CONTAINER)                        */}
        {/* ================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/70 flex justify-center items-start">
          {/* A4 Sheet Container */}
          <div
            id="invoice-document-capture"
            ref={invoiceRef}
            className="w-full max-w-[760px] bg-white rounded-2xl shadow-lg border border-slate-300 p-6 sm:p-8 space-y-6 text-slate-900 relative"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Top Brand Header */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div>
                <div className="mb-2">
                  <img
                    src="/assets/aistudio/Digital-effect-logo_d13b47e3.png"
                    alt="Digital Effect Logo"
                    crossOrigin="anonymous"
                    className="h-12 w-auto max-w-[220px] object-contain block"
                  />
                </div>
                <p className="text-[11px] font-extrabold text-blue-600">
                  {isAr ? 'ديجيتال إفكت للحلول الرقمية والتسويق الإلكتروني المتكامل' : 'Digital Effect — Digital Solutions & Integrated Marketing'}
                </p>

                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                  <p>📍 {isAr ? 'العاشر من رمضان — محافظة الشرقية — مصر' : '10th of Ramadan City, Egypt'}</p>
                  <p>📞 {isAr ? 'خدمة العملاء والمبيعات:' : 'Tel:'} <span dir="ltr">01505000349</span></p>
                  <p>✉️ Sales@digitaleffect.net | www.digitaleffect.net</p>
                </div>
              </div>

              {/* Invoice Meta Box */}
              <div className="text-end space-y-1.5 shrink-0">
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-white font-black text-xs">
                  {isAr ? 'بيان فاتورة تعاقد' : 'INVOICE STATEMENT'}
                </span>
                <p className="text-xs font-mono font-black text-slate-800">
                  #{invoiceNumber}
                </p>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>
                    <span className="font-bold text-slate-800">{isAr ? 'تاريخ الإصدار:' : 'Date:'}</span>{' '}
                    {issueDate}
                  </p>
                  {contractPeriod.trim() && (
                    <p className="text-blue-700 font-extrabold">
                      {contractPeriod.trim()}
                    </p>
                  )}
                </div>

                {/* Payment status badge */}
                <div className="pt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : paymentStatus === 'partially_paid'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : paymentStatus === 'overdue'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    <CheckSquare className="w-3 h-3" />
                    <span>
                      {paymentStatus === 'paid'
                        ? (isAr ? 'مدفوعة بالكامل (PAID)' : 'PAID IN FULL')
                        : paymentStatus === 'partially_paid'
                        ? (isAr ? 'دفعة مقدمة 50% (PARTIAL)' : 'PARTIAL DEPOSIT')
                        : paymentStatus === 'overdue'
                        ? (isAr ? 'متأخرة عن السداد (OVERDUE)' : 'OVERDUE')
                        : (isAr ? 'قيد التحصيل (PENDING)' : 'PENDING PAYMENT')}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To & Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block">
                  {isAr ? 'بيانات العميل / الجهة المتعاقدة:' : 'BILLED TO:'}
                </span>
                <h4 className="text-base font-black text-slate-900">
                  {client.company || client.name}
                </h4>
                {client.company && (
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{isAr ? `المسؤول: ${client.name}` : `Contact: ${client.name}`}</span>
                  </p>
                )}
                <p className="text-xs font-mono text-slate-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span dir="ltr">{client.phone}</span>
                </p>
              </div>

              <div className="space-y-1 sm:text-end">
                <span className="text-[10px] font-black text-slate-400 block">
                  {isAr ? 'تفاصيل التعاقد والقطاع:' : 'CONTRACT DETAILS:'}
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {isAr ? 'القطاع المستهدف:' : 'Sector:'}{' '}
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase">
                    {client.sector.toUpperCase()}
                  </span>
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {isAr ? 'دورة المحاسبة:' : 'Billing Cycle:'}{' '}
                  <span className="text-blue-700">{isAr ? cycleTextAr : cycleTextEn}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'تاريخ سريان التعاقد:' : 'Effective From:'} {issueDate}
                </p>
              </div>
            </div>

            {/* ============================================================= */}
            {/* PACKAGE TITLE BANNER (As Requested by User)                   */}
            {/* ============================================================= */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-300 block">
                  {isAr ? 'الباقة التسويقية المعتمدة:' : 'OFFICIAL MARKETING PACKAGE:'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAr
                    ? /(?:شهرياً|شهريا)\s*$/.test((packageName || '').trim())
                      ? packageName
                      : `${(packageName || '').trim()} شهرياً`
                    : /monthly\s*$/i.test((packageName || '').trim())
                    ? packageName
                    : `${(packageName || '').trim()} Monthly`}
                </h3>
              </div>
              <div className="text-start sm:text-end shrink-0">
                <span className="text-[10px] text-slate-300 block font-medium">
                  {isAr ? 'قيمة الاشتراك' : 'Retainer Rate'}
                </span>
                <span className="text-lg font-black text-emerald-300 tabular-nums">
                  {formattedBudget}
                </span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* PACKAGE CONTENTS & DELIVERABLES TABLE (As Requested by User)  */}
            {/* ============================================================= */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'محتويات وبنود الباقة المشمولة في التعاقد:' : 'Included Package Deliverables & Scope:'}</span>
              </h5>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-start">{isAr ? 'البند والخدمة' : 'Item / Service'}</th>
                      <th className="p-3 text-center w-28">{isAr ? 'الكمية الشهرية' : 'Monthly Qty'}</th>
                      <th className="p-3 text-center w-28">{isAr ? `إجمالي (${cycleTextAr})` : 'Cycle Qty'}</th>
                      <th className="p-3 text-end w-28">{isAr ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Item 1: Posts */}
                    <tr>
                      <td className="p-3">
                        <span className="font-black text-slate-900 block">
                          {isAr ? 'منشورات وتصاميم السوشيال ميديا' : 'Social Media Graphic Posts'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isAr
                            ? 'إعداد المحتوى التسويقي، تصميم الجرافيك بدقة عالية، وتنسيق الهوية البصرية'
                            : 'Strategic copywriting, bespoke graphic designs, and brand layout alignment'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-sky-700 tabular-nums">
                        {targetPosts} {isAr ? 'منشور' : 'posts'}
                      </td>
                      <td className="p-3 text-center font-black text-slate-900 tabular-nums">
                        {cyclePosts} {isAr ? 'منشور' : 'posts'}
                      </td>
                      <td className="p-3 text-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {isAr ? 'مشمول' : 'Included'}
                        </span>
                      </td>
                    </tr>

                    {/* Item 2: Reels */}
                    <tr>
                      <td className="p-3">
                        <span className="font-black text-slate-900 block">
                          {isAr ? 'فيديوهات ريلز بتقنية الذكاء الاصطناعي (AI Reels)' : 'AI Video Reels & Short Form'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isAr
                            ? 'كتابة السيناريو التفاعلي، التعليق الصوتي المتقن، والمونتاج الرقمي لزيادة المشاهدات'
                            : 'Scriptwriting, professional voiceover, and high-retention video editing'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-purple-700 tabular-nums">
                        {targetReels} {isAr ? 'ريلز' : 'reels'}
                      </td>
                      <td className="p-3 text-center font-black text-slate-900 tabular-nums">
                        {cycleReels} {isAr ? 'ريلز' : 'reels'}
                      </td>
                      <td className="p-3 text-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {isAr ? 'مشمول' : 'Included'}
                        </span>
                      </td>
                    </tr>

                    {/* Item 3: Stories (if present) */}
                    {targetStories > 0 && (
                      <tr>
                        <td className="p-3">
                          <span className="font-black text-slate-900 block">
                            {isAr ? 'الستوريز اليومية والتفاعلية' : 'Interactive Daily Stories'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {isAr
                              ? 'استطلاعات رأي، تفاعل مباشر مع الجمهور، وتعزيز الحضور المستمر'
                              : 'Engagement polls, product highlights, and direct story interactions'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-700 tabular-nums">
                          {targetStories} {isAr ? 'ستوري' : 'stories'}
                        </td>
                        <td className="p-3 text-center font-black text-slate-900 tabular-nums">
                          {cycleStories} {isAr ? 'ستوري' : 'stories'}
                        </td>
                        <td className="p-3 text-end">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {isAr ? 'مشمول' : 'Included'}
                          </span>
                        </td>
                      </tr>
                    )}

                    {/* Item 4: Campaign Management */}
                    <tr>
                      <td className="p-3">
                        <span className="font-black text-slate-900 block">
                          {isAr ? 'إدارة وتمويل الحملات الإعلانية ومتابعة الجمهور' : 'Paid Ads & Campaign Optimization'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isAr
                            ? 'إعداد وتوجيه الإعلانات الممولة للجمهور المستهدف ومتابعة معدل التحويل'
                            : 'Audience targeting, conversion rate optimization, and A/B campaign testing'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-500">
                        {isAr ? 'مستمر' : 'Active'}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">
                        {isAr ? 'كامل الدورة' : 'Full Cycle'}
                      </td>
                      <td className="p-3 text-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {isAr ? 'مشمول' : 'Included'}
                        </span>
                      </td>
                    </tr>

                    {/* Item 5: Reporting & Management */}
                    <tr>
                      <td className="p-3">
                        <span className="font-black text-slate-900 block">
                          {isAr ? 'إدارة الحساب وتقارير الأداء الشهرية المتقدمة' : 'Dedicated Account Management & Reporting'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isAr
                            ? 'مدير حساب مخصص، تقرير تحليلي شهري للنتائج، ومتابعة فورية عبر الواتساب'
                            : 'Dedicated Account Manager, monthly ROI analytics, and priority support'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-500">
                        {isAr ? 'مستمر' : 'Active'}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">
                        {isAr ? 'كامل الدورة' : 'Full Cycle'}
                      </td>
                      <td className="p-3 text-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {isAr ? 'مشمول' : 'Included'}
                        </span>
                      </td>
                    </tr>

                    {/* Item 6: Ad Spend Credit (If added) */}
                    {adCredit > 0 && (
                      <tr className="bg-blue-50/80 border-t-2 border-blue-300">
                        <td className="p-3">
                          <span className="font-black text-blue-950 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{isAr ? 'شحن رصيد إعلاني ممول (ميزانية الحملات)' : 'Funded Ad Campaign Spend Budget'}</span>
                          </span>
                          <span className="text-[11px] text-blue-800 block mt-0.5">
                            {isAr
                              ? 'ميزانية إعلانية مدفوعة ومخصصة بالكامل لحملات العميل الممولة (Meta / TikTok / Google) تُودع في المحفظة الإعلانية للعميل فور التحصيل'
                              : '100% dedicated paid advertising budget, deposited into client ad wallet upon invoice collection'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-blue-700 tabular-nums">
                          {adCredit.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                        </td>
                        <td className="p-3 text-center font-black text-blue-900 tabular-nums">
                          {adCredit.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                        </td>
                        <td className="p-3 text-end">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {isAr ? 'رصيد إعلاني' : 'Ad Credit'}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ============================================================= */}
            {/* COST & FINANCIAL SUMMARY (As Requested by User)               */}
            {/* ============================================================= */}
            <div className="pt-2 flex flex-col sm:flex-row justify-between items-start gap-4">
              {/* Payment Methods */}
              <div className="w-full sm:w-1/2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAr ? 'بيانات التحويل وحسابات الدفع المعتمدة:' : 'Approved Transfer & Payment Accounts:'}</span>
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  ⚡ <strong className="text-slate-900">{isAr ? 'إنستاباي (InstaPay):' : 'InstaPay:'}</strong>{' '}
                  <span dir="ltr" className="font-mono font-bold text-slate-900">{transferInfo.instaPay}</span>
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  📱 <strong className="text-slate-900">{isAr ? 'رقم المحفظة الإلكترونية (فودافون كاش / E-Wallet):' : 'E-Wallet / Vodafone Cash:'}</strong>{' '}
                  <span dir="ltr" className="font-mono font-bold text-slate-900">{transferInfo.walletNumber}</span>
                </p>
              </div>

              {/* Total Calculation Card */}
              <div className="w-full sm:w-1/2 p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2 text-end">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{isAr ? 'قيمة باقة التسويق الرقمي:' : 'Retainer Subtotal:'}</span>
                  <span className="font-black text-slate-900 tabular-nums">{formattedBudget}</span>
                </div>

                {adCredit > 0 && (
                  <div className="flex justify-between text-xs text-blue-700 font-bold">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isAr ? 'الرصيد الإعلاني الممول المضاف:' : 'Added Ad Spend Credit:'}</span>
                    </span>
                    <span className="tabular-nums font-black">+{adCredit.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-950">
                    {isAr ? 'الإجمالي المستحق:' : 'Total Amount Due:'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-blue-700 tabular-nums">
                    {numericGrandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isAr 
                    ? `مستحقة عن فترة الاشتراك (${cycleTextAr})`
                    : `Payable for (${cycleTextEn}) billing cycle`}
                </p>
              </div>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-4">
              <div className="space-y-1">
                <p className="font-bold text-slate-800">
                  {isAr ? 'ملاحظة قانونية وتعاقدية:' : 'Terms Note:'}
                </p>
                <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
                  {notes}
                </p>
              </div>

              {/* Official Stamp Box */}
              <div className="text-center p-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 w-44">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-1 text-[10px] font-black shadow-2xs">
                  DE
                </div>
                <span className="text-[11px] font-black text-blue-900 block">
                  {isAr ? 'معتمد — ديجيتال إفكت' : 'Digital Effect Certified'}
                </span>
                <span className="text-[9px] text-blue-600 block">
                  {isAr ? 'قسم الحسابات والفوترة' : 'Finance & Accounts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
