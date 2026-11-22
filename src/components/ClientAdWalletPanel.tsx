import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Film,
  Megaphone,
} from 'lucide-react';
import { AdWalletRequest, Inquiry } from '../types';
import { useAgencyData } from '../context/AgencyDataContext';

const AD_PLATFORMS = [
  'Meta Ads (Facebook & Instagram)',
  'TikTok Ads',
  'Google Ads & YouTube',
  'Snapchat Ads',
  'LinkedIn Ads',
];

function formatDateTime(iso?: string, isAr = true): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

interface ClientAdWalletPanelProps {
  client: Inquiry;
  canManageAdWallet: boolean;
  canApproveAdWallet: boolean;
  actorName: string;
  isAr?: boolean;
  onNotify?: (msg: string) => void;
  onCollectPendingInvoiceCredit?: () => void;
}

export const ClientAdWalletPanel: React.FC<ClientAdWalletPanelProps> = ({
  client,
  canManageAdWallet,
  canApproveAdWallet,
  actorName,
  isAr = true,
  onNotify,
  onCollectPendingInvoiceCredit,
}) => {
  const { submitAdWalletRequest, reviewAdWalletRequest } = useAgencyData();

  // Top-up form state
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [topUpNotes, setTopUpNotes] = useState<string>('');

  // Spend form state
  const [spendAmount, setSpendAmount] = useState<string>('');
  const [spendPlatform, setSpendPlatform] = useState<string>(AD_PLATFORMS[0]);
  const [spendNotes, setSpendNotes] = useState<string>('');

  // Local feedback
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

  const pushSuccess = (msg: string) => {
    setInlineError(null);
    setInlineSuccess(msg);
    if (onNotify) onNotify(msg);
    setTimeout(() => setInlineSuccess(null), 4000);
  };

  const pushError = (msg: string) => {
    setInlineSuccess(null);
    setInlineError(msg);
    setTimeout(() => setInlineError(null), 5000);
  };

  const adBalance = client.adCreditBalance || 0;
  const pendingInvoiceAd = client.pendingInvoiceAdCredit || 0;
  const fundedTotal = client.adCreditFundedTotal ?? adBalance;
  const spentTotal = client.adCreditSpentTotal || 0;
  const requests = client.adWalletRequests || [];

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'pending'),
    [requests]
  );
  const historyRequests = useMemo(
    () => requests.filter((r) => r.status !== 'pending'),
    [requests]
  );

  const pendingTopUpSum = useMemo(
    () =>
      pendingRequests
        .filter((r) => r.type === 'topup')
        .reduce((acc, r) => acc + (r.amount || 0), 0),
    [pendingRequests]
  );

  const pendingSpendSum = useMemo(
    () =>
      pendingRequests
        .filter((r) => r.type === 'spend')
        .reduce((acc, r) => acc + (r.amount || 0), 0),
    [pendingRequests]
  );

  const usableSpendBalance = Math.max(0, adBalance - pendingSpendSum);

  const handleSubmitTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Math.round(Number(topUpAmount) || 0);
    if (numeric <= 0) {
      pushError(isAr ? 'يرجى إدخال مبلغ شحن صحيح.' : 'Please enter a valid top-up amount.');
      return;
    }

    const res = submitAdWalletRequest(client.id, {
      type: 'topup',
      amount: numeric,
      notes: topUpNotes,
      requestedBy: actorName,
      autoApprove: canApproveAdWallet,
    });

    if (!res.ok) {
      pushError(isAr ? res.errorAr || 'تعذر تسجيل الطلب.' : res.errorEn || 'Failed to submit.');
      return;
    }

    setTopUpAmount('');
    setTopUpNotes('');

    if (canApproveAdWallet) {
      pushSuccess(
        res.linkedInvoiceNumber
          ? isAr
            ? `✅ تم اعتماد إضافة ${numeric.toLocaleString()} ج.م وإدراجها تلقائياً في الفاتورة رقم ${res.linkedInvoiceNumber}!`
            : `✅ Approved ${numeric.toLocaleString()} EGP and added to invoice ${res.linkedInvoiceNumber}!`
          : isAr
          ? `✅ تم اعتماد إضافة ${numeric.toLocaleString()} ج.م رصيد إعلاني وإدراجها كبند في الفاتورة!`
          : `✅ Approved ${numeric.toLocaleString()} EGP ad credit for invoicing!`
      );
    } else {
      pushSuccess(
        isAr
          ? `⏳ تم إرسال طلب إضافة رصيد إعلاني (${numeric.toLocaleString()} ج.م) للمحاسب للموافقة وإدراجه بالفاتورة.`
          : `⏳ Top-up request (${numeric.toLocaleString()} EGP) submitted for Accountant approval.`
      );
    }
  };

  const handleSubmitSpend = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Math.round(Number(spendAmount) || 0);
    if (numeric <= 0) {
      pushError(isAr ? 'يرجى إدخال مبلغ مصروف صحيح.' : 'Please enter a valid spend amount.');
      return;
    }

    const res = submitAdWalletRequest(client.id, {
      type: 'spend',
      amount: numeric,
      platform: spendPlatform,
      notes: spendNotes,
      requestedBy: actorName,
      autoApprove: canApproveAdWallet,
    });

    if (!res.ok) {
      pushError(isAr ? res.errorAr || 'تعذر تسجيل المصروف.' : res.errorEn || 'Failed to log spend.');
      return;
    }

    setSpendAmount('');
    setSpendNotes('');

    if (canApproveAdWallet) {
      pushSuccess(
        isAr
          ? `✅ تم اعتماد وخصم ${numeric.toLocaleString()} ج.م (${spendPlatform}) من الرصيد الإعلاني بنجاح!`
          : `✅ Approved and deducted ${numeric.toLocaleString()} EGP (${spendPlatform}) from ad wallet!`
      );
    } else {
      pushSuccess(
        isAr
          ? `⏳ تم تسجيل مصروف ${numeric.toLocaleString()} ج.م (${spendPlatform}) وإرساله للمحاسب للموافقة والخصم من الرصيد.`
          : `⏳ Spend of ${numeric.toLocaleString()} EGP submitted for Accountant approval.`
      );
    }
  };

  const handleReview = (req: AdWalletRequest, decision: 'approved' | 'rejected') => {
    const res = reviewAdWalletRequest(client.id, req.id, decision, actorName);
    if (!res.ok) {
      pushError(isAr ? res.errorAr || 'تعذر تنفيذ المراجعة.' : res.errorEn || 'Review failed.');
      return;
    }

    if (decision === 'rejected') {
      pushSuccess(
        isAr
          ? `❌ تم رفض الطلب (${req.amount.toLocaleString()} ج.م) دون تعديل الرصيد أو الفاتورة.`
          : `❌ Request (${req.amount.toLocaleString()} EGP) rejected.`
      );
      return;
    }

    if (req.type === 'topup') {
      pushSuccess(
        res.linkedInvoiceNumber
          ? isAr
            ? `✅ تمت الموافقة! تم إدراج ${req.amount.toLocaleString()} ج.م رصيد إعلاني في الفاتورة ${res.linkedInvoiceNumber}.`
            : `✅ Approved! Added ${req.amount.toLocaleString()} EGP to invoice ${res.linkedInvoiceNumber}.`
          : isAr
          ? `✅ تمت الموافقة على إضافة ${req.amount.toLocaleString()} ج.م وتم إدراجها كبند رصيد إعلاني في الفاتورة!`
          : `✅ Approved ${req.amount.toLocaleString()} EGP ad credit for the client's invoice!`
      );
    } else {
      pushSuccess(
        isAr
          ? `✅ تمت الموافقة وخصم ${req.amount.toLocaleString()} ج.م (${req.platform || 'حملات ممولة'}) من الرصيد الإعلاني بنجاح!`
          : `✅ Approved and deducted ${req.amount.toLocaleString()} EGP from ad balance!`
      );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Feedback Banners */}
      {inlineError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}
      {inlineSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{inlineSuccess}</span>
        </div>
      )}

      {/* Hero Wallet Card */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-purple-800/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-200 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-white">
                  {isAr ? 'محفظة الإعلانات الممولة (Ad Spend Wallet)' : 'Paid Ads Spend Wallet'}
                </h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-400/30">
                  {canApproveAdWallet
                    ? isAr
                      ? 'صلاحية محاسب / اعتماد فوري'
                      : 'Accountant Approval Mode'
                    : isAr
                    ? 'صلاحية ميديا باير (تخضع لاعتماد المحاسب)'
                    : 'Media Buyer Mode (Requires Accountant Approval)'}
                </span>
              </div>
              <p className="text-[11px] text-purple-200/80 mt-0.5">
                {canApproveAdWallet
                  ? isAr
                    ? 'مراجعة واعتماد طلبات شحن الرصيد الإعلاني (لإدراجها بالفاتورة) واعتماد المصروفات الإعلانية لخصمها من المحفظة.'
                    : 'Review & approve ad credit top-ups for invoicing and approve campaign spend deductions.'
                  : isAr
                  ? 'متابعة الرصيد الإعلاني المتاح، تقديم طلبات إضافة رصيد للفاتورة، وتسجيل مصروفات الحملات لاعتمادها من المحاسب.'
                  : 'Track available ad credit, request top-ups for invoicing, and log campaign spend for accountant approval.'}
              </p>
            </div>
          </div>

          {canApproveAdWallet && pendingInvoiceAd > 0 && onCollectPendingInvoiceCredit && (
            <button
              type="button"
              onClick={onCollectPendingInvoiceCredit}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isAr
                  ? `تحصيل وإيداع (${pendingInvoiceAd.toLocaleString()} ج.م)`
                  : `Collect & Deposit (${pendingInvoiceAd.toLocaleString()})`}
              </span>
            </button>
          )}
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-emerald-500/30">
            <span className="text-[11px] text-slate-300 font-bold block mb-1">
              {isAr ? 'الرصيد الإعلاني المتاح للصرف:' : 'Available Ad Balance:'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400 tabular-nums">
                {adBalance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-300/80">{isAr ? 'ج.م' : 'EGP'}</span>
            </div>
            {pendingSpendSum > 0 ? (
              <span className="text-[10px] text-amber-300 font-bold mt-1 block">
                {isAr
                  ? `⏳ منها ${pendingSpendSum.toLocaleString()} ج.م مصروفات قيد موافقة المحاسب`
                  : `⏳ ${pendingSpendSum.toLocaleString()} EGP pending spend approval`}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 mt-1 block">
                {adBalance > 0
                  ? isAr
                    ? '✅ جاهز لتمويل الحملات الممولة'
                    : 'Ready for active ad campaigns'
                  : isAr
                  ? '⚠️ لا يوجد رصيد إعلاني متاح حالياً'
                  : 'No available ad balance'}
              </span>
            )}
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/30">
            <span className="text-[11px] text-slate-300 font-bold block mb-1">
              {isAr ? 'معتمد بالفاتورة (قيد التحصيل):' : 'Approved on Invoice (Pending Payment):'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-black tabular-nums ${
                  pendingInvoiceAd > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {pendingInvoiceAd.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">{isAr ? 'ج.م' : 'EGP'}</span>
            </div>
            {pendingTopUpSum > 0 ? (
              <span className="text-[10px] text-purple-300 font-bold mt-1 block">
                {isAr
                  ? `📝 +${pendingTopUpSum.toLocaleString()} ج.م طلبات شحن بانتظار موافقة المحاسب`
                  : `📝 +${pendingTopUpSum.toLocaleString()} EGP top-up requests pending approval`}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 mt-1 block">
                {pendingInvoiceAd > 0
                  ? isAr
                    ? 'ينزل بالمحفظة فور تحصيل الفاتورة'
                    : 'Credited once invoice is collected'
                  : isAr
                  ? 'لا توجد مبالغ إعلانية معلقة بالفاتورة'
                  : 'No pending invoice ad credit'}
              </span>
            )}
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-700/70">
            <span className="text-[11px] text-slate-300 font-bold block mb-1.5">
              {isAr ? 'ملخص حركة المحفظة:' : 'Wallet Lifetime Summary:'}
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-200">
                <span>{isAr ? 'إجمالي المشحون المودع:' : 'Total Funded:'}</span>
                <span className="font-black text-white tabular-nums">
                  {fundedTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>{isAr ? 'إجمالي المصروف المعتمد:' : 'Approved Spent:'}</span>
                <span className="font-black text-rose-300 tabular-nums">
                  {spentTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests Requiring Accountant Approval */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h5 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>
                {isAr
                  ? `طلبات بانتظار موافقة المحاسب (${pendingRequests.length})`
                  : `Pending Accountant Approvals (${pendingRequests.length})`}
              </span>
            </h5>
            <span className="text-[11px] font-bold text-amber-800">
              {canApproveAdWallet
                ? isAr
                  ? 'راجع الطلبات أدناه ووافق عليها لتطبيقها فوراً على الفاتورة أو الرصيد'
                  : 'Approve to apply immediately to invoice or ad wallet'
                : isAr
                ? 'سيتم تطبيقها تلقائياً فور موافقة المحاسب'
                : 'Applied automatically once approved by Accountant'}
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingRequests.map((req) => {
              const isTopUp = req.type === 'topup';
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                          isTopUp
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isTopUp
                          ? isAr
                            ? '➕ طلب إضافة رصيد للفاتورة'
                            : '➕ Ad Credit Top-Up'
                          : isAr
                          ? '📢 مصروف إعلاني للخصم'
                          : '📢 Ad Spend Deduction'}
                      </span>
                      <span className="text-sm font-black text-slate-900 tabular-nums">
                        {req.amount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                      {req.platform && (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {req.platform}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                      <span>
                        {isAr ? 'بواسطة:' : 'By:'}{' '}
                        <strong className="text-slate-900">{req.requestedBy}</strong>
                      </span>
                      <span>•</span>
                      <span dir="ltr">{formatDateTime(req.requestedAt, isAr)}</span>
                      {req.notes && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 font-medium">{req.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {canApproveAdWallet ? (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleReview(req, 'approved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isTopUp
                            ? isAr
                              ? 'موافقة وإدراج بالفاتورة'
                              : 'Approve & Invoice'
                            : isAr
                            ? 'موافقة وخصم من الرصيد'
                            : 'Approve & Deduct'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(req, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'رفض' : 'Reject'}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black inline-flex items-center gap-1 shrink-0 self-start sm:self-center">
                      <Clock className="w-3 h-3" />
                      <span>{isAr ? 'بانتظار موافقة المحاسب' : 'Awaiting Accountant'}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Action Forms: Add Ad Credit & Log Ad Spend */}
      {canManageAdWallet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form 1: Add Ad Credit (Top-Up -> Invoice) */}
          <form
            onSubmit={handleSubmitTopUp}
            className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900">
                    {isAr ? 'إضافة رصيد إعلاني جديد' : 'Add Ad Credit Top-Up'}
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    {canApproveAdWallet
                      ? isAr
                        ? 'ينزل مباشرة في الفاتورة كبند رصيد إعلاني ممول'
                        : 'Added directly to the client invoice'
                      : isAr
                      ? 'يُرسل للمحاسب للموافقة وإدراجه تلقائياً في فاتورة العميل'
                      : 'Sent to Accountant to approve and add to the invoice'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {isAr ? 'مبلغ الرصيد الإعلاني المطلوب (ج.م):' : 'Ad Credit Amount (EGP):'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder={isAr ? 'مثال: 10000' : 'e.g. 10000'}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[3000, 5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setTopUpAmount(String((Number(topUpAmount) || 0) + preset))
                    }
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold cursor-pointer transition-colors tabular-nums"
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isAr ? 'ملاحظات / خطة الحملات (اختياري):' : 'Notes / Campaign Plan (Optional):'}
              </label>
              <input
                type="text"
                value={topUpNotes}
                onChange={(e) => setTopUpNotes(e.target.value)}
                placeholder={isAr ? 'مثال: ميزانية حملات Meta لشهر نوفمبر...' : 'e.g. November Meta ads budget...'}
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>
                {canApproveAdWallet
                  ? isAr
                    ? 'اعتماد وإدراج الرصيد بالفاتورة فوراً'
                    : 'Approve & Add to Invoice'
                  : isAr
                  ? 'إرسال طلب إضافة الرصيد للمحاسب'
                  : 'Submit Top-Up for Accountant Approval'}
              </span>
            </button>
          </form>

          {/* Form 2: Log Ad Spend (Deducted on Approval) */}
          <form
            onSubmit={handleSubmitSpend}
            className="bg-white rounded-2xl p-4 border border-purple-200 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900">
                    {isAr ? 'تسجيل مصروف إعلاني (Ad Spend)' : 'Log Campaign Ad Spend'}
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    {canApproveAdWallet
                      ? isAr
                        ? 'يُخصم مباشرة من الرصيد الإعلاني المتاح ويظهر بكشف الحساب'
                        : 'Deducted immediately from available ad credit'
                      : isAr
                      ? 'يراجعه المحاسب ويوافق عليه ليتم خصمه من الرصيد الإعلاني'
                      : 'Reviewed & approved by Accountant before deducting from balance'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums shrink-0">
                {isAr ? `متاح: ${usableSpendBalance.toLocaleString()} ج.م` : `Usable: ${usableSpendBalance.toLocaleString()}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'المبلغ المصروف (ج.م):' : 'Amount Spent (EGP):'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, usableSpendBalance)}
                  required
                  disabled={usableSpendBalance <= 0}
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder={
                    usableSpendBalance > 0
                      ? isAr
                        ? 'المبلغ بالجنيه...'
                        : 'Amount in EGP...'
                      : isAr
                      ? 'لا يوجد رصيد متاح'
                      : 'No balance available'
                  }
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'المنصة الإعلانية:' : 'Ad Platform:'}
                </label>
                <select
                  value={spendPlatform}
                  onChange={(e) => setSpendPlatform(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {AD_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isAr ? 'اسم الحملة / تفاصيل الصرف (اختياري):' : 'Campaign Name / Details (Optional):'}
              </label>
              <input
                type="text"
                value={spendNotes}
                onChange={(e) => setSpendNotes(e.target.value)}
                placeholder={isAr ? 'مثال: حملة رسائل Meta — الأسبوع الأول...' : 'e.g. Meta Lead Gen — Week 1...'}
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={usableSpendBalance <= 0}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-4 h-4" />
              <span>
                {canApproveAdWallet
                  ? isAr
                    ? 'اعتماد وخصم من الرصيد الإعلاني فوراً'
                    : 'Approve & Deduct Immediately'
                  : isAr
                  ? 'تسجيل المصروف وإرساله لموافقة المحاسب'
                  : 'Submit Spend for Accountant Approval'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Reviewed History (Approved / Rejected) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>
              {isAr
                ? `سجل حركات وموافقات محفظة الإعلانات (${historyRequests.length})`
                : `Ad Wallet Approval History (${historyRequests.length})`}
            </span>
          </span>
        </div>

        {historyRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium">
            {isAr
              ? 'لا توجد حركات معتمدة أو مرفوضة مسجلة في محفظة الإعلانات بعد.'
              : 'No reviewed ad wallet transactions yet.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {historyRequests.map((req) => {
              const isApproved = req.status === 'approved';
              const isTopUp = req.type === 'topup';
              return (
                <div
                  key={req.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/70"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                          isTopUp
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {isTopUp
                          ? isAr
                            ? 'إضافة رصيد'
                            : 'Top-Up'
                          : isAr
                          ? 'مصروف إعلاني'
                          : 'Ad Spend'}
                      </span>
                      <span className="font-black text-slate-900 tabular-nums">
                        {req.amount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                      {req.platform && (
                        <span className="text-[11px] font-semibold text-slate-600">
                          • {req.platform}
                        </span>
                      )}
                      {req.linkedInvoiceNumber && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {isAr ? `أُدرج بالفاتورة ${req.linkedInvoiceNumber}` : `Invoice ${req.linkedInvoiceNumber}`}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>
                        {isAr ? 'بواسطة:' : 'Requested by:'} {req.requestedBy}
                      </span>
                      {req.reviewedBy && (
                        <>
                          <span>•</span>
                          <span>
                            {isApproved
                              ? isAr
                                ? `اعتماد: ${req.reviewedBy}`
                                : `Approved by: ${req.reviewedBy}`
                              : isAr
                              ? `رفض: ${req.reviewedBy}`
                              : `Rejected by: ${req.reviewedBy}`}
                          </span>
                        </>
                      )}
                      {req.notes && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600">{req.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                      {formatDateTime(req.reviewedAt || req.requestedAt, isAr)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isApproved
                        ? isAr
                          ? '✅ معتمد'
                          : '✅ Approved'
                        : isAr
                        ? '❌ مرفوض'
                        : '❌ Rejected'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CENTRALIZED ACCOUNTANT APPROVAL QUEUE BANNER (Clients & Invoices Tabs)
// ============================================================================
interface AdWalletApprovalsBannerProps {
  clients: Inquiry[];
  reviewerName: string;
  isAr?: boolean;
  onNotify?: (msg: string) => void;
  onOpenClientWallet?: (client: Inquiry) => void;
}

export const AdWalletApprovalsBanner: React.FC<AdWalletApprovalsBannerProps> = ({
  clients,
  reviewerName,
  isAr = true,
  onNotify,
  onOpenClientWallet,
}) => {
  const { reviewAdWalletRequest } = useAgencyData();

  const pendingItems = useMemo(() => {
    const out: Array<{ client: Inquiry; request: AdWalletRequest }> = [];
    clients.forEach((client) => {
      (client.adWalletRequests || []).forEach((req) => {
        if (req.status === 'pending') {
          out.push({ client, request: req });
        }
      });
    });
    return out.sort(
      (a, b) =>
        new Date(b.request.requestedAt).getTime() - new Date(a.request.requestedAt).getTime()
    );
  }, [clients]);

  if (pendingItems.length === 0) return null;

  const handleDecision = (
    client: Inquiry,
    req: AdWalletRequest,
    decision: 'approved' | 'rejected'
  ) => {
    const res = reviewAdWalletRequest(client.id, req.id, decision, reviewerName);
    if (!res.ok) {
      if (onNotify) {
        onNotify(isAr ? res.errorAr || 'تعذر تنفيذ الإجراء.' : res.errorEn || 'Action failed.');
      }
      return;
    }

    if (onNotify) {
      if (decision === 'rejected') {
        onNotify(
          isAr
            ? `❌ تم رفض طلب محفظة الإعلانات لـ (${client.company || client.name}).`
            : `❌ Rejected ad wallet request for ${client.company || client.name}.`
        );
      } else if (req.type === 'topup') {
        onNotify(
          res.linkedInvoiceNumber
            ? isAr
              ? `✅ تمت الموافقة وإدراج ${req.amount.toLocaleString()} ج.م رصيد إعلاني في الفاتورة ${res.linkedInvoiceNumber}!`
              : `✅ Approved & added ${req.amount.toLocaleString()} EGP to invoice ${res.linkedInvoiceNumber}!`
            : isAr
            ? `✅ تمت الموافقة على إضافة ${req.amount.toLocaleString()} ج.م رصيد إعلاني لـ (${client.company || client.name}) وإدراجه بالفاتورة!`
            : `✅ Approved ${req.amount.toLocaleString()} EGP ad credit for ${client.company || client.name}!`
        );
      } else {
        onNotify(
          isAr
            ? `✅ تمت الموافقة وخصم ${req.amount.toLocaleString()} ج.م مصروف إعلاني من محفظة (${client.company || client.name})!`
            : `✅ Approved & deducted ${req.amount.toLocaleString()} EGP ad spend!`
        );
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
              <span>
                {isAr
                  ? `طلبات محفظة الإعلانات بانتظار موافقة المحاسب (${pendingItems.length})`
                  : `Ad Wallet Requests Awaiting Accountant Approval (${pendingItems.length})`}
              </span>
            </h4>
            <p className="text-[11px] text-amber-800">
              {isAr
                ? 'الموافقة على «إضافة رصيد» تُدرجه تلقائياً بالفاتورة — والموافقة على «مصروف إعلاني» تخصمه من رصيد المحفظة فوراً.'
                : 'Approving a top-up adds it to the invoice; approving spend deducts it from the ad wallet.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {pendingItems.map(({ client, request }) => {
          const isTopUp = request.type === 'topup';
          return (
            <div
              key={request.id}
              className="bg-white rounded-xl p-3 border border-amber-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-900">
                    {client.company || client.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                      isTopUp
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {isTopUp
                      ? isAr
                        ? '➕ طلب إضافة رصيد للفاتورة'
                        : '➕ Top-Up Request'
                      : isAr
                      ? '📢 مصروف إعلاني للخصم'
                      : '📢 Ad Spend Claim'}
                  </span>
                  <span className="text-sm font-black text-slate-900 tabular-nums">
                    {request.amount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                  {request.platform && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                      <Film className="w-2.5 h-2.5" />
                      <span>{request.platform}</span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                  <span>
                    {isAr ? 'مقدم من:' : 'By:'} <strong>{request.requestedBy}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {isAr ? 'الرصيد المتاح للعميل:' : 'Current Balance:'}{' '}
                    <strong className="text-emerald-700 tabular-nums">
                      {(client.adCreditBalance || 0).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </strong>
                  </span>
                  {request.notes && (
                    <>
                      <span>•</span>
                      <span className="text-slate-700">{request.notes}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => handleDecision(client, request, 'approved')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isTopUp
                      ? isAr
                        ? 'موافقة وإدراج بالفاتورة'
                        : 'Approve & Add to Invoice'
                      : isAr
                      ? 'موافقة وخصم من الرصيد'
                      : 'Approve & Deduct'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(client, request, 'rejected')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رفض' : 'Reject'}</span>
                </button>
                {onOpenClientWallet && (
                  <button
                    type="button"
                    onClick={() => onOpenClientWallet(client)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 transition-colors cursor-pointer"
                    title={isAr ? 'فتح محفظة إعلانات العميل' : 'Open Client Ad Wallet'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
