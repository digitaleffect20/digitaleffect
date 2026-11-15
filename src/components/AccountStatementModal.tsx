import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Calendar, 
  Building, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  CreditCard, 
  FileText, 
  Printer, 
  ChevronDown,
  User,
  ExternalLink
} from 'lucide-react';
import { Inquiry } from '../types';
import { useAgencyData } from '../context/AgencyDataContext';
import { generateAccountStatementPdf } from '../utils/statementPdfGenerator';

interface AccountStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClient?: Inquiry | null;
  isAr?: boolean;
}

export const AccountStatementModal: React.FC<AccountStatementModalProps> = ({
  isOpen,
  onClose,
  initialClient,
  isAr = true,
}) => {
  const { data, getClientLedger } = useAgencyData();

  // Selected client
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClient?.id || data.inquiries?.find((c) => c.status === 'closed')?.id || ''
  );

  // Active clients list (status === 'closed' or any inquiry)
  const clientList = useMemo(() => {
    return (data.inquiries || []).filter((inq) => inq.status === 'closed');
  }, [data.inquiries]);

  // Current client
  const activeClient = useMemo(() => {
    return (data.inquiries || []).find((c) => c.id === selectedClientId) || initialClient || null;
  }, [data.inquiries, selectedClientId, initialClient]);

  // Period dates: Default to past 90 days to today
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultTo = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Quick preset period buttons
  const applyPreset = (preset: 'this_month' | 'last_3_months' | 'this_year' | 'all_time') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setFromDate(startOfMonth);
      setToDate(todayStr);
    } else if (preset === 'last_3_months') {
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split('T')[0];
      setFromDate(threeMonthsAgo);
      setToDate(todayStr);
    } else if (preset === 'this_year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      setFromDate(startOfYear);
      setToDate(todayStr);
    } else if (preset === 'all_time') {
      const contractStart = activeClient?.contractStartDate || '2026-01-01';
      setFromDate(contractStart);
      setToDate(todayStr);
    }
  };

  // Compute ledger entries and metrics
  const ledger = useMemo(() => {
    if (!selectedClientId) {
      return {
        entries: [],
        openingBalance: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        totalAdFunded: 0,
        totalAdSpent: 0,
        closingBalance: 0,
        currentAdCreditBalance: 0,
      };
    }
    return getClientLedger(selectedClientId, fromDate, toDate);
  }, [getClientLedger, selectedClientId, fromDate, toDate]);

  if (!isOpen) return null;

  // Handle PDF Export
  const handleDownloadPdf = async () => {
    if (!activeClient) return;
    setIsGeneratingPdf(true);
    try {
      const res = await generateAccountStatementPdf({
        client: activeClient,
        fromDate,
        toDate,
        ledger,
        isAr,
      });

      if (res.success) {
        setDownloadSuccessNotice(
          isAr
            ? `تم تحميل كشف الحساب بنجاح (${res.filename})`
            : `Statement downloaded successfully (${res.filename})`
        );
        setTimeout(() => setDownloadSuccessNotice(null), 3500);
      }
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle WhatsApp Share
  const handleShareWhatsApp = () => {
    if (!activeClient) return;
    const cleanPhone = (activeClient.phone || '').replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;

    const message = isAr
      ? `📄 *كشف حساب مالي رسمي — ديجيتال إفكت*
🏢 *العميل:* ${activeClient.company || activeClient.name}
📅 *الفترة:* من ${fromDate} إلى ${toDate}

📊 *ملخص المعاملات المالية:*
• إجمالي الفواتير الصادرة: *${ledger.totalInvoiced.toLocaleString()} ج.م*
• إجمالي المسدد والمحصل: *${ledger.totalPaid.toLocaleString()} ج.م*
• الرصيد المستحق المتبقي: *${ledger.closingBalance.toLocaleString()} ج.م*

💳 *محفظة الرصيد الإعلاني الممول:*
• إجمالي تمويل الإعلانات: *${ledger.totalAdFunded.toLocaleString()} ج.م*
• الرصيد الإعلاني المتاح حالياً للصرف: *${ledger.currentAdCreditBalance.toLocaleString()} ج.م*

_تم استخراج هذا البيان رسمياً عبر ديجيتال إفكت للحلول الرقمية والتسويق._`
      : `📄 *Statement of Account — Digital Effect*
🏢 *Client:* ${activeClient.company || activeClient.name}
📅 *Period:* ${fromDate} to ${toDate}

• Total Invoiced: *${ledger.totalInvoiced.toLocaleString()} EGP*
• Total Paid: *${ledger.totalPaid.toLocaleString()} EGP*
• Outstanding Balance: *${ledger.closingBalance.toLocaleString()} EGP*
• Available Ad Credit: *${ledger.currentAdCreditBalance.toLocaleString()} EGP*`;

    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        dir={isAr ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  {isAr ? 'استخراج كشف حساب مالي تفصيلي' : 'Generate Statement of Account'}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {isAr ? 'كشف حركة معتمد' : 'Official Ledger'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAr 
                  ? 'عرض وتصدير كافة الفواتير، الدفعات، حركات الرصيد الإعلاني والمطابقات المالية عن أي فترة زمنية.'
                  : 'Track and export complete invoice history, collections, and ad credit ledger for any timeframe.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice Banner */}
        {downloadSuccessNotice && (
          <div className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadSuccessNotice}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setDownloadSuccessNotice(null)} 
              className="text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter Controls & Client Selector Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 space-y-3.5 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            {/* Client Selector */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'اختيار العميل / الشركة:' : 'Select Client / Company:'}</span>
              </label>
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                >
                  {clientList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name} — ({c.packageName || (isAr ? 'باقة مخصصة' : 'Custom')})
                    </option>
                  ))}
                </select>
                <ChevronDown className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isAr ? 'left-3' : 'right-3'}`} />
              </div>
            </div>

            {/* From Date */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAr ? 'من تاريخ:' : 'From Date:'}</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* To Date */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAr ? 'إلى تاريخ:' : 'To Date:'}</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Print/Download Button */}
            <div className="md:col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || !activeClient}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title={isAr ? 'تحميل كشف الحساب بصيغة PDF' : 'Download PDF'}
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden md:inline">{isAr ? 'تصدير' : 'PDF'}</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons & Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-500">{isAr ? 'فترات سريعة:' : 'Quick Presets:'}</span>
            <button
              type="button"
              onClick={() => applyPreset('this_month')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {isAr ? 'هذا الشهر' : 'This Month'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('last_3_months')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {isAr ? 'آخر 3 أشهر' : 'Last 3 Months'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('this_year')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {isAr ? 'العام الحالي (2026)' : 'Year 2026'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all_time')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {isAr ? 'منذ بداية التعاقد' : 'Since Inception'}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeClient && (
            <>
              {/* Client Profile & Balance Strip */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-black text-lg">
                    {activeClient.company ? activeClient.company.charAt(0) : activeClient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">{activeClient.company || activeClient.name}</h4>
                    <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>{activeClient.name}</span>
                      <span>•</span>
                      <span>{activeClient.phone}</span>
                      <span>•</span>
                      <span className="text-blue-300 font-bold">{activeClient.packageName || 'باقة مخصصة'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مشاركة واتساب' : 'Share WhatsApp'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'تحميل PDF رسمي' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Financial Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    {isAr ? 'رصيد أول المدة' : 'Opening Balance'}
                  </span>
                  <span className="text-lg font-black text-slate-800 font-mono">
                    {ledger.openingBalance.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-700 block mb-1 flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3 text-blue-600" />
                    <span>{isAr ? 'إجمالي المفوتر (مدين)' : 'Total Invoiced'}</span>
                  </span>
                  <span className="text-lg font-black text-blue-900 font-mono">
                    {ledger.totalInvoiced.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-700 block mb-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                    <span>{isAr ? 'إجمالي المسدد (دائن)' : 'Total Paid'}</span>
                  </span>
                  <span className="text-lg font-black text-emerald-900 font-mono">
                    {ledger.totalPaid.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  ledger.closingBalance > 0 
                    ? 'bg-amber-50/80 border-amber-300' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[11px] font-bold block mb-1 ${
                    ledger.closingBalance > 0 ? 'text-amber-800' : 'text-slate-600'
                  }`}>
                    {isAr ? 'الرصيد المستحق النهائي' : 'Closing Balance Due'}
                  </span>
                  <span className={`text-lg font-black font-mono ${
                    ledger.closingBalance > 0 ? 'text-amber-700' : 'text-slate-900'
                  }`}>
                    {ledger.closingBalance.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>

              {/* Ad Spend Wallet Strip */}
              <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-purple-950">
                      {isAr ? 'موقف محفظة الرصيد الإعلاني الممول:' : 'Ad Spend Wallet Status:'}
                    </h5>
                    <p className="text-[11px] text-purple-700">
                      {isAr 
                        ? `إجمالي الشحن والتمويل: ${ledger.totalAdFunded.toLocaleString()} ج.م • المنصرف على الإعلانات: ${ledger.totalAdSpent.toLocaleString()} ج.م`
                        : `Total Funded: ${ledger.totalAdFunded.toLocaleString()} EGP • Spent: ${ledger.totalAdSpent.toLocaleString()} EGP`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-950">{isAr ? 'الرصيد المتاح للصرف:' : 'Available:'}</span>
                  <span className="px-3 py-1 rounded-xl bg-white text-purple-700 font-black text-sm border border-purple-200 shadow-2xs font-mono">
                    {ledger.currentAdCreditBalance.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'حركات كشف الحساب التفصيلية (Ledger Transactions):' : 'Ledger Transactions:'}</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    {isAr ? `إجمالي الحركات: ${ledger.entries.length}` : `Entries: ${ledger.entries.length}`}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[11px]">
                          <th className="p-3 text-right">{isAr ? 'التاريخ' : 'Date'}</th>
                          <th className="p-3 text-right">{isAr ? 'البيان والوصف' : 'Description'}</th>
                          <th className="p-3 text-center">{isAr ? 'نوع الحركة' : 'Type'}</th>
                          <th className="p-3 text-left font-mono">{isAr ? 'مدين (ج.م)' : 'Debit (Dr)'}</th>
                          <th className="p-3 text-left font-mono">{isAr ? 'دائن (ج.م)' : 'Credit (Cr)'}</th>
                          <th className="p-3 text-left font-mono">{isAr ? 'الرصيد بعد الحركة' : 'Balance'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledger.entries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">
                              {isAr ? 'لا توجد حركات مسجلة خلال هذه الفترة الزمنية.' : 'No transactions recorded for this period.'}
                            </td>
                          </tr>
                        ) : (
                          ledger.entries.map((entry, idx) => {
                            const isPayment = entry.type === 'payment' || (entry.credit && entry.credit > 0);
                            return (
                              <tr key={entry.id || idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                                  {entry.date}
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{entry.title}</div>
                                  {entry.reference && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      {isAr ? 'مرجع:' : 'Ref:'} {entry.reference}
                                    </div>
                                  )}
                                  {entry.notes && (
                                    <div className="text-[10px] text-blue-600 mt-0.5">
                                      {entry.notes}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isPayment
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : entry.type === 'ad_spend'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}>
                                    {isPayment
                                      ? (isAr ? 'سداد / دائن' : 'Payment')
                                      : entry.type === 'ad_spend'
                                      ? (isAr ? 'صرف إعلاني' : 'Ad Spend')
                                      : (isAr ? 'فاتورة / مدين' : 'Invoice')}
                                  </span>
                                </td>
                                <td className="p-3 text-left font-mono font-bold text-slate-800">
                                  {entry.debit && entry.debit > 0 ? entry.debit.toLocaleString() : '—'}
                                </td>
                                <td className="p-3 text-left font-mono font-bold text-emerald-600">
                                  {entry.credit && entry.credit > 0 ? entry.credit.toLocaleString() : '—'}
                                </td>
                                <td className={`p-3 text-left font-mono font-black ${
                                  entry.balance > 0 ? 'text-amber-700 bg-amber-50/40' : 'text-slate-900'
                                }`}>
                                  {entry.balance.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {isAr ? 'كشف الحساب مطابق للقيود المحاسبية والفواتير الصادرة.' : 'Statement synchronized with issued invoices.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || !activeClient}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isAr ? 'تحميل كشف الحساب (PDF)' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
