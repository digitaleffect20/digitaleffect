import React, { useState, useEffect } from 'react';
import { useAgencyData } from '../context/AgencyDataContext';
import { Inquiry, ClientAccountNote, ClientWorkflowStage } from '../types';
import { 
  X, 
  Building2, 
  Phone, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Minus, 
  FileText, 
  Sparkles, 
  Edit3, 
  Save, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  Layers,
  ArrowRight,
  ExternalLink,
  CreditCard,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  Receipt,
  Printer,
  Download
} from 'lucide-react';
import { ClientWorkflowStepper, DEFAULT_WORKFLOW_STAGES } from './ClientWorkflowStepper';
import { ClientPackageDeliverablesCard } from './ClientPackageDeliverablesCard';
import { ClientPerformanceSummary } from './ClientPerformanceSummary';
import { ClientInvoiceModal } from './ClientInvoiceModal';
import { getClientOverdueStatus, getClientDeliverableTargets } from '../utils/workflowUtils';
import { generateClientInvoicePdf } from '../utils/invoicePdfGenerator';

interface ClientAccountDrawerProps {
  client: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated?: (updated: Inquiry) => void;
}

const DEFAULT_STAGES: ClientWorkflowStage[] = DEFAULT_WORKFLOW_STAGES;

export const ClientAccountDrawer: React.FC<ClientAccountDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onClientUpdated,
}) => {
  const { language, updateInquiry, data } = useAgencyData();
  const isAr = language === 'ar';

  // Local editable states initialized safely from client data
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'deliverables' | 'billing' | 'notes'>('overview');
  const [contractStatus, setContractStatus] = useState<Inquiry['contractStatus']>(client?.contractStatus || 'active');
  const [paymentStatus, setPaymentStatus] = useState<Inquiry['paymentStatus']>(client?.paymentStatus || 'paid');
  const [billingCycle, setBillingCycle] = useState<Inquiry['billingCycle']>(client?.billingCycle || 'monthly');
  const [contractStartDate, setContractStartDate] = useState(client?.contractStartDate || client?.createdAt?.split('T')[0] || '');
  const [renewalDate, setRenewalDate] = useState(
    client?.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState(client?.budget || (isAr ? '15,000 ج.م شهرياً' : '15,000 EGP / month'));
  const [packageName, setPackageName] = useState(client?.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package'));

  // Workflow Stages state with real-time sync
  const [workflowStages, setWorkflowStages] = useState<ClientWorkflowStage[]>(
    client?.workflowStages && client.workflowStages.length === 5 
      ? client.workflowStages 
      : DEFAULT_STAGES
  );

  // Today's Task Title
  const [todayTaskTitle, setTodayTaskTitle] = useState<string>(
    client?.todayTaskTitle || (isAr ? 'تصميم النسخة النهائية للمحتوى' : 'Design final approved creative assets')
  );
  const [isEditingTask, setIsEditingTask] = useState<boolean>(false);

  const [postsDelivered, setPostsDelivered] = useState(client?.postsDelivered ?? 0);
  const [reelsDelivered, setReelsDelivered] = useState(client?.reelsDelivered ?? 0);
  const [storiesDelivered, setStoriesDelivered] = useState(client?.storiesDelivered ?? 0);

  // New Note
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<ClientAccountNote['type']>('update');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isDirectDownloading, setIsDirectDownloading] = useState<boolean>(false);

  // Synchronize state when client or isOpen changes
  useEffect(() => {
    if (client && isOpen) {
      setContractStatus(client.contractStatus || 'active');
      setPaymentStatus(client.paymentStatus || 'paid');
      setBillingCycle(client.billingCycle || 'monthly');
      setContractStartDate(client.contractStartDate || client.createdAt?.split('T')[0] || '');
      setRenewalDate(client.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setBudget(client.budget || (isAr ? '15,000 ج.م شهرياً' : '15,000 EGP / month'));
      setPackageName(client.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package'));
      setWorkflowStages(
        client.workflowStages && client.workflowStages.length === 5
          ? client.workflowStages
          : DEFAULT_STAGES
      );
      setTodayTaskTitle(client.todayTaskTitle || (isAr ? 'تصميم النسخة النهائية للمحتوى' : 'Design final approved creative assets'));
      setPostsDelivered(client.postsDelivered ?? 0);
      setReelsDelivered(client.reelsDelivered ?? 0);
      setStoriesDelivered(client.storiesDelivered ?? 0);
      setActiveTab('overview');
    }
  }, [client, isOpen, isAr]);

  const showNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Deliverables progress targets
  const resolvedTargets = client 
    ? getClientDeliverableTargets(client, data?.packages || []) 
    : { postsTarget: 4, reelsTarget: 0, storiesTarget: 0, totalTarget: 4, source: 'sector_default' as const };
  const targetPosts = resolvedTargets.postsTarget;
  const targetReels = resolvedTargets.reelsTarget;
  const targetStories = resolvedTargets.storiesTarget;

  // Direct Invoice PDF Download using jsPDF
  const handleDirectDownloadInvoice = async () => {
    if (!client) return;
    setIsDirectDownloading(true);
    try {
      const res = await generateClientInvoicePdf({
        client,
        packageName: packageName || client.packageName,
        deliverables: {
          posts: targetPosts,
          reels: targetReels,
          stories: targetStories,
        },
        totalCost: budget,
        billingCycle,
        contractStartDate,
        renewalDate,
        isAr,
      });
      if (res.success) {
        showNotification(isAr ? 'تم تحميل ملف الفاتورة PDF بنجاح!' : 'Invoice PDF downloaded successfully!');
      }
    } catch (err) {
      console.error('Invoice download error:', err);
    } finally {
      setIsDirectDownloading(false);
    }
  };

  // Two-way real-time sync: cycle stage status and propagate instantly to context and parent
  const handleToggleStageStatus = (stageId: string) => {
    if (!client) return;
    const updatedStages = workflowStages.map((stage) => {
      if (stage.id === stageId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        return { ...stage, status: nextStatus, completedAt };
      }
      return stage;
    });

    setWorkflowStages(updatedStages);
    updateInquiry(client.id, { workflowStages: updatedStages });
    if (onClientUpdated) {
      onClientUpdated({ ...client, workflowStages: updatedStages });
    }
  };

  // Set explicit status for a stage
  const handleSetStageStatus = (stageId: string, status: 'completed' | 'in_progress' | 'pending') => {
    setWorkflowStages((prev) =>
      prev.map((stage) => (stage.id === stageId ? { ...stage, status } : stage))
    );
  };

  // Save changes
  const handleSaveAll = () => {
    if (!client) return;
    const updates: Partial<Inquiry> = {
      contractStatus,
      paymentStatus,
      billingCycle,
      contractStartDate,
      renewalDate,
      budget,
      packageName,
      postsTarget: targetPosts,
      postsDelivered,
      reelsTarget: targetReels,
      reelsDelivered,
      storiesTarget: targetStories,
      storiesDelivered,
      workflowStages,
      todayTaskTitle,
    };

    updateInquiry(client.id, updates);
    showNotification(isAr ? 'تم حفظ وتحديث بيانات حساب العميل بنجاح!' : 'Client account updated successfully!');
    if (onClientUpdated) {
      onClientUpdated({ ...client, ...updates });
    }
  };

  // Add new account note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !newNoteText.trim()) return;

    const newNote: ClientAccountNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
      author: 'Account Manager',
      type: newNoteType,
    };

    const updatedNotes = [newNote, ...(client.clientNotes || [])];
    updateInquiry(client.id, { clientNotes: updatedNotes });
    setNewNoteText('');
    showNotification(isAr ? 'تمت إضافة الملاحظة إلى سجل متابعة العميل.' : 'Note added to client activity log.');
    if (onClientUpdated) {
      onClientUpdated({ ...client, clientNotes: updatedNotes });
    }
  };

  // Unconditional render guard AFTER all React hooks have run
  if (!isOpen || !client) return null;

  // Calculate workflow stats
  const completedStagesCount = workflowStages.filter((s) => s.status === 'completed').length;
  const remainingStagesCount = workflowStages.filter((s) => s.status !== 'completed').length;

  // Calculate deliverables completion percentage
  const totalTargetAssets = Math.max(1, targetPosts + targetReels + targetStories);
  const totalDeliveredAssets = postsDelivered + reelsDelivered + storiesDelivered;
  const progressPercent = Math.min(100, Math.round((totalDeliveredAssets / totalTargetAssets) * 100));

  // Phone formatted for WhatsApp
  const cleanDigits = (client.phoneE164 || client.phone).replace(/\D/g, '');
  const waPhone = cleanDigits.startsWith('0') ? `20${cleanDigits.slice(1)}` : cleanDigits;
  const waText = encodeURIComponent(
    isAr 
      ? `مرحباً ${client.name}، معك مدير حسابك من فريق ديجيتال إفكت بخصوص متابعة باقة (${packageName}) وسير العمل اليوم.`
      : `Hello ${client.name}, this is your Account Manager from Digital Effect regarding your (${packageName}) daily task updates.`
  );

  const overdueInfo = getClientOverdueStatus(client, isAr);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden relative text-start flex flex-col my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[94vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* TOP HEADER / CLIENT BRANDED BAR                                   */}
        {/* ================================================================= */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-5 shrink-0 relative border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Right side (in RTL): Client Info (Company primary, Client secondary) */}
            <div className="flex items-center gap-3">
              {/* Teal Avatar */}
              <div className={`w-12 h-12 rounded-xl font-black text-lg flex items-center justify-center shrink-0 shadow-xs text-white ${
                overdueInfo.isOverdue 
                  ? 'bg-rose-700 border border-rose-500/50 text-rose-100' 
                  : 'bg-teal-700/80 text-teal-200 border border-teal-500/40'
              }`}>
                {(client.company || client.name).slice(0, 1).toUpperCase()}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">{client.company || client.name}</h3>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                    client.sector === 'medical' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : client.sector === 'b2b'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}>
                    {client.sector.toUpperCase()}
                  </span>

                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    <span>{isAr ? 'عميل متعاقد رسمي' : 'Contracted Client'}</span>
                  </span>

                  {overdueInfo.isOverdue && (
                    <span className="text-[10px] font-black bg-rose-500/30 text-rose-200 border border-rose-400/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-300" />
                      <span>{isAr ? `تجاوزت الاستحقاق (${overdueInfo.badgeTextAr})` : `Overdue (${overdueInfo.badgeTextEn})`}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>{client.name}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span dir="ltr">{client.phone}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{isAr ? 'تاريخ الانضمام:' : 'Joined:'} {new Date(client.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Left side (in RTL): Action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer border border-blue-400/30"
                title={isAr ? 'إصدار الفاتورة وبيان الحساب PDF' : 'Issue Invoice PDF'}
              >
                <FileText className="w-3.5 h-3.5 text-blue-200" />
                <span>{isAr ? 'إصدار الفاتورة' : 'Invoice'}</span>
              </button>

              <a
                href={`https://wa.me/${waPhone}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                title="WhatsApp Direct"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'مراسلة واتساب' : 'WhatsApp'}</span>
              </a>

              <a
                href={`tel:${client.phone}`}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                title={isAr ? 'اتصال هاتفي' : 'Call Client'}
              >
                <Phone className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2.5 border-t border-slate-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {isAr ? 'نظرة عامة والحساب' : 'Overview & Tasks'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white shadow-sm font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'ملخص الأداء الشهري 📊' : 'Monthly Performance 📊'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deliverables')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'deliverables'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {isAr ? `متابعة المخرجات الشهرية (${progressPercent}%)` : `Deliverables (${progressPercent}%)`}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {isAr ? 'المالية والتجديد' : 'Billing & Retainer'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {isAr ? `سجل المتابعة (${(client.clientNotes || []).length})` : `Activity Log (${(client.clientNotes || []).length})`}
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {saveSuccessNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center animate-in fade-in flex items-center justify-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* MAIN BODY CONTENT                                                 */}
        {/* ================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-slate-50/60">
          {/* TAB 1: OVERVIEW & WORKFLOW TASKS TRACKER */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Overdue Urgent Alert Banner */}
              {overdueInfo.isOverdue && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h5 className="text-xs sm:text-sm font-black text-rose-950">
                        {isAr ? overdueInfo.alertTitleAr : overdueInfo.alertTitleEn}
                      </h5>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white text-rose-700 border border-rose-200 shadow-2xs">
                        {isAr ? 'عاجل ومطلوب اتخاذ إجراء 🚨' : 'Action Required 🚨'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-rose-800 mt-1 leading-relaxed">
                      {isAr
                        ? `تجاوز هذا العميل تاريخ الاستحقاق المحدد (${overdueInfo.dueFormatted}) مع عدم اكتمال مرحلة "${overdueInfo.stalledStageName || 'المراحل التنفيذية'}". يرجى استكمال المهام ومتابعة مراحل التنفيذ أدناه.`
                        : `This client exceeded their due date (${overdueInfo.dueFormatted}) with pending stage "${overdueInfo.stalledStageName || 'Execution Stages'}". Please finalize tasks or toggle status below.`}
                    </p>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TOP 3 HIGH-LEVEL STATUS CARDS                                */}
              {/* ------------------------------------------------------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Card 1: حالة التعاقد والنشاط */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {isAr ? 'حالة التعاقد والنشاط' : 'Contract & Activity'}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      contractStatus === 'active' ? 'bg-emerald-500' :
                      contractStatus === 'renewal_due' ? 'bg-amber-500' :
                      contractStatus === 'paused' ? 'bg-slate-400' : 'bg-blue-500'
                    }`} />
                  </div>
                  <select
                    value={contractStatus}
                    onChange={(e) => setContractStatus(e.target.value as any)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">{isAr ? 'نشط ومفعل (Active) 🟢' : 'Active 🟢'}</option>
                    <option value="renewal_due">{isAr ? 'قيد التجديد (Renewal Due) 🟡' : 'Renewal Due 🟡'}</option>
                    <option value="paused">{isAr ? 'موقوف مؤقتاً (Paused) ⏸️' : 'Paused ⏸️'}</option>
                    <option value="completed">{isAr ? 'مكتمل / منتهي (Completed) ⚪' : 'Completed ⚪'}</option>
                  </select>
                </div>

                {/* Card 2: حالة السداد والتحصيل */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {isAr ? 'حالة السداد والتحصيل' : 'Payment Status'}
                    </span>
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="paid">{isAr ? 'مدفوع بالكامل (Paid) ✅' : 'Paid in Full ✅'}</option>
                    <option value="partially_paid">{isAr ? 'دفعة مقدمة 50% (Deposit) 🟡' : '50% Deposit Paid 🟡'}</option>
                    <option value="pending">{isAr ? 'قيد التحصيل (Pending) ⏳' : 'Pending ⏳'}</option>
                    <option value="overdue">{isAr ? 'متأخر عن السداد (Overdue) ❌' : 'Overdue ❌'}</option>
                  </select>
                </div>

                {/* Card 3: تاريخ التجديد القادم */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {isAr ? 'تاريخ التجديد القادم' : 'Next Renewal Date'}
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* PIPELINE / WORKFLOW STAGES (مراحل التنفيذ)                     */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {isAr ? 'اضغط على أي مرحلة لتحديث حالتها (مكتمل / قيد التنفيذ / في الانتظار) ويتم تحديثها تلقائياً بالخارج' : 'Click any stage to cycle status (auto-synced in real-time)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isAr ? 'مراحل التنفيذ' : 'Execution Stages'}
                    </h4>
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {/* Stepper Pipeline with Timestamps */}
                <ClientWorkflowStepper
                  stages={workflowStages}
                  onToggleStage={handleToggleStageStatus}
                  interactive={true}
                  size="lg"
                  isAr={isAr}
                />
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 3 SUMMARY CARDS: مهام اليوم + المهام المتبقية + المكتملة         */}
              {/* ------------------------------------------------------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Card 1: مهام اليوم (Today's Tasks) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isAr ? 'مهام اليوم' : "Today's Tasks"}
                    </span>
                    <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  </div>

                  {isEditingTask ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={todayTaskTitle}
                        onChange={(e) => setTodayTaskTitle(e.target.value)}
                        className="w-full text-xs font-bold p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingTask(false)}
                        className="p-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setIsEditingTask(true)}
                      className="group cursor-pointer flex items-center justify-between"
                      title={isAr ? 'اضغط لتعديل مهمة اليوم' : 'Click to edit task title'}
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {todayTaskTitle}
                      </span>
                      <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ms-1" />
                    </div>
                  )}
                </div>

                {/* Card 2: المهام المتبقية (Remaining Tasks) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isAr ? 'المهام المتبقية' : 'Remaining Tasks'}
                    </span>
                    <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                      {remainingStagesCount} {isAr ? 'مهام' : 'tasks'}
                    </span>
                  </div>
                </div>

                {/* Card 3: المهام المكتملة (Completed Tasks) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isAr ? 'المهام المكتملة' : 'Completed Tasks'}
                    </span>
                    <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                      {completedStagesCount} {isAr ? 'مهام' : 'tasks'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 3-BOX DELIVERABLES CARD (Matching Screenshot: Posts, Reels, Stories - No Price) */}
              {/* ------------------------------------------------------------- */}
              <ClientPackageDeliverablesCard
                packageName={packageName}
                postsCount={targetPosts}
                reelsCount={targetReels}
                storiesCount={targetStories}
                isAr={isAr}
                className="mt-2"
              />

              {/* ------------------------------------------------------------- */}
              {/* MONTHLY PERFORMANCE SUMMARY HIGHLIGHT CARD (Direct Overview Access) */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-800/60 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {isAr ? 'ملخص الأداء الشهري وتطور النتائج' : 'Monthly Performance & Results Summary'}
                        </h4>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {isAr ? 'رسوم بيانية تفاعلية recharts' : 'Interactive recharts'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                        {isAr
                          ? `تم إنجاز ${progressPercent}% من مخرجات الشهر (${postsDelivered + reelsDelivered + storiesDelivered} من أصل ${targetPosts + targetReels + targetStories} مخرج) عبر ${completedStagesCount} مراحل عمل مكتملة.`
                          : `Campaign is at ${progressPercent}% deliverables completion with ${completedStagesCount} workflow stages finalized.`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('performance')}
                    className="px-4 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-blue-200 via-white to-blue-100 hover:from-white hover:to-white rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 self-start md:self-center"
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'فتح قسم ملخص الأداء والرسوم البيانية' : 'View Full Performance Charts'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEDICATED MONTHLY PERFORMANCE SUMMARY */}
          {activeTab === 'performance' && (
            <ClientPerformanceSummary
              client={{
                ...client,
                postsDelivered,
                reelsDelivered,
                storiesDelivered,
                postsTarget: targetPosts,
                reelsTarget: targetReels,
                storiesTarget: targetStories,
                workflowStages,
                packageName,
                budget,
              }}
              isAr={isAr}
              onNavigateToDeliverables={() => setActiveTab('deliverables')}
            />
          )}

          {/* TAB 2: DELIVERABLES TRACKER */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{isAr ? 'تسجيل ومتابعة مخرجات الشهر' : 'Monthly Deliverables Tracker'}</h4>
                  <p className="text-xs text-slate-500">{isAr ? 'سجل المخرجات التي تم تسليمها أو نشرها للعميل خلال دورة الاشتراك الحالية.' : 'Track completed posts, reels, and stories for this billing cycle.'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPostsDelivered(0);
                    setReelsDelivered(0);
                    setStoriesDelivered(0);
                    showNotification(isAr ? 'تم تصفير العدادات لبدء شهر تعاقدي جديد.' : 'Reset for new monthly cycle.');
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                >
                  {isAr ? 'تصفير لشهر جديد' : 'New Month Cycle'}
                </button>
              </div>

              {/* Deliverable Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Posts counter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{isAr ? 'البوستات والتصاميم' : 'Graphic Posts'}</span>
                    <span className="text-xs font-mono font-black text-sky-800">{postsDelivered} / {targetPosts}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-600 rounded-full" 
                      style={{ width: `${Math.min(100, (postsDelivered / Math.max(1, targetPosts)) * 100)}%` }} 
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPostsDelivered(Math.max(0, postsDelivered - 1))}
                      className="flex-1 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostsDelivered(postsDelivered + 1)}
                      className="flex-1 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer"
                    >
                      +1 {isAr ? 'نُشر' : 'Done'}
                    </button>
                  </div>
                </div>

                {/* Reels counter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{isAr ? 'فيديوهات الريلز' : 'Video Reels'}</span>
                    <span className="text-xs font-mono font-black text-purple-800">{reelsDelivered} / {targetReels}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full" 
                      style={{ width: `${Math.min(100, (reelsDelivered / Math.max(1, targetReels)) * 100)}%` }} 
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setReelsDelivered(Math.max(0, reelsDelivered - 1))}
                      className="flex-1 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setReelsDelivered(reelsDelivered + 1)}
                      className="flex-1 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
                    >
                      +1 {isAr ? 'نُشر' : 'Done'}
                    </button>
                  </div>
                </div>

                {/* Stories counter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{isAr ? 'الستوريز التفاعلية' : 'Stories'}</span>
                    <span className="text-xs font-mono font-black text-amber-800">{storiesDelivered} / {targetStories}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${Math.min(100, (storiesDelivered / Math.max(1, targetStories)) * 100)}%` }} 
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStoriesDelivered(Math.max(0, storiesDelivered - 1))}
                      className="flex-1 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setStoriesDelivered(storiesDelivered + 1)}
                      className="flex-1 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg cursor-pointer"
                    >
                      +1 {isAr ? 'نُشر' : 'Done'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & CONTRACT */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{isAr ? 'إدارة التعاقد والدورة المالية' : 'Contract & Retainer Billing'}</h4>
                  <p className="text-xs text-slate-500">{isAr ? 'تعديل قيمة العقد، مواعيد التجديد، ودورة الدفعات، وإصدار الفواتير الرسمية.' : 'Adjust retainer value, renewal cycles, and export official client invoices.'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-blue-400/30"
                >
                  <FileText className="w-4 h-4 text-blue-200" />
                  <span>{isAr ? 'إصدار الفاتورة وبيان الحساب (PDF)' : 'Generate Invoice Statement (PDF)'}</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'قيمة الاشتراك المتفق عليها:' : 'Contract Retainer Fee:'}</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'دورة التعاقد:' : 'Billing Cycle:'}</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as any)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer text-slate-800"
                    >
                      <option value="monthly">{isAr ? 'شهرياً (Monthly Retainer)' : 'Monthly'}</option>
                      <option value="quarterly">{isAr ? 'ربع سنوي (Quarterly Retainer)' : 'Quarterly'}</option>
                      <option value="annual">{isAr ? 'سنوي (Annual Retainer)' : 'Annual'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'تاريخ بداية التعاقد:' : 'Contract Start Date:'}</label>
                    <input
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'تاريخ التجديد أو استحقاق الدفعة القادمة:' : 'Next Renewal / Due Date:'}</label>
                    <input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Official Invoice Statement Preview Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                {/* Subtle decorative glow */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                            {isAr ? 'بيان فاتورة رسمي' : 'Official Invoice'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            INV-{new Date().getFullYear()}-{client.id.replace('client-', '').slice(0, 4).toUpperCase()}
                          </span>
                        </div>
                        <h5 className="text-sm font-black text-white mt-0.5">
                          {isAr ? 'وثيقة استحقاق باقة التسويق الرقمي' : 'Digital Marketing Retainer Invoice'}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1.5 ${
                        paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : paymentStatus === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {paymentStatus === 'paid'
                            ? (isAr ? 'مدفوع بالكامل' : 'Paid in Full')
                            : paymentStatus === 'pending'
                            ? (isAr ? 'قيد التحصيل' : 'Pending Payment')
                            : (isAr ? 'متأخر في السداد' : 'Overdue')}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Three Key Pillars: Package Title, Deliverables, Cost */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* 1. Package Name as Invoice Title */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isAr ? 'عنوان الفاتورة والباقة:' : 'Invoice Title / Package:'}</span>
                      </div>
                      <p className="font-black text-white text-xs leading-snug line-clamp-2" title={packageName || client.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package')}>
                        {packageName || client.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package')}
                      </p>
                    </div>

                    {/* 2. Package Deliverables Contents */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>{isAr ? 'محتويات ومخرجات الباقة:' : 'Package Deliverables:'}</span>
                      </div>
                      <p className="font-bold text-slate-200 text-xs">
                        {targetPosts} {isAr ? 'منشور' : 'Posts'} • {targetReels} {isAr ? 'ريلز' : 'Reels'} • {targetStories} {isAr ? 'ستوري' : 'Stories'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isAr ? '+ إدارة حملات ممولة وتقارير دورية' : '+ Ads management & reporting'}
                      </p>
                    </div>

                    {/* 3. Cost / Fee */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isAr ? 'قيمة الاشتراك والتكلفة:' : 'Retainer Cost / Fee:'}</span>
                      </div>
                      <p className="font-black text-emerald-400 text-sm">
                        {budget}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {billingCycle === 'monthly' ? (isAr ? 'دورة شهرية' : 'Monthly') : billingCycle === 'quarterly' ? (isAr ? 'دورة ربع سنوية' : 'Quarterly') : (isAr ? 'دورة سنوية' : 'Annual')}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isAr ? 'الفاتورة مجهزة للطباعة بصيغة A4 مع الختم الرسمي وتفاصيل التحويل البنكي.' : 'A4 PDF formatted with official stamp, signature & bank details.'}</span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                      {/* Dedicated Download Invoice Button */}
                      <button
                        type="button"
                        disabled={isDirectDownloading}
                        onClick={handleDirectDownloadInvoice}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                        title={isAr ? 'تحميل ملف الفاتورة مباشرة على جهازك' : 'Download Invoice PDF directly'}
                      >
                        {isDirectDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Download className="w-4 h-4 text-emerald-100" />
                        )}
                        <span>{isAr ? 'تحميل الفاتورة' : 'Download Invoice'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <FileText className="w-4 h-4 text-blue-300" />
                        <span>{isAr ? 'معاينة وتخصيص الفاتورة' : 'Preview & Edit'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOG & NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{isAr ? 'سجل متابعة الحساب وملاحظات فريق العمل' : 'Account Activity & Team Notes'}</h4>
                <p className="text-xs text-slate-500">{isAr ? 'أضف ملاحظات الاتفاق، التعديلات المطلوبة، تقارير الاجتماعات، وحالة التحويلات المالية.' : 'Log meetings, payments, deliverables feedback, and milestones.'}</p>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <textarea
                  rows={2}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={isAr ? 'اكتب ملاحظة أو تحديث بخصوص العميل (مثال: تم الاتفاق على موعد التصوير، أو تم تحصيل الدفعة الثانية)...' : 'Write a follow-up note or update for this client...'}
                  className="w-full p-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">{isAr ? 'نوع التحديث:' : 'Type:'}</span>
                    <select
                      value={newNoteType}
                      onChange={(e) => setNewNoteType(e.target.value as any)}
                      className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="update">{isAr ? '📝 تحديث عام' : 'General Update'}</option>
                      <option value="deliverable">{isAr ? '🎨 تسليم مخرجات' : 'Deliverable'}</option>
                      <option value="payment">{isAr ? '💵 دفعة مالية' : 'Payment'}</option>
                      <option value="meeting">{isAr ? '📞 اجتماع / مكالمة' : 'Meeting'}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة للسجل' : 'Add Note'}</span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(client.clientNotes || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {isAr ? 'لا توجد ملاحظات مسجلة بعد لهذا العميل.' : 'No notes recorded yet.'}
                  </div>
                ) : (
                  (client.clientNotes || []).map((note) => (
                    <div 
                      key={note.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            note.type === 'payment' ? 'bg-emerald-500' :
                            note.type === 'deliverable' ? 'bg-sky-500' :
                            note.type === 'meeting' ? 'bg-purple-500' : 'bg-slate-400'
                          }`} />
                          <span>
                            {note.type === 'payment' ? (isAr ? 'دفعة مالية' : 'Payment') :
                             note.type === 'deliverable' ? (isAr ? 'مخرجات' : 'Deliverable') :
                             note.type === 'meeting' ? (isAr ? 'اجتماع' : 'Meeting') :
                             (isAr ? 'تحديث' : 'Update')}
                          </span>
                        </span>
                        <span>{new Date(note.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* FOOTER ACTIONS                                                    */}
        {/* ================================================================= */}
        <div className="p-4 bg-white border-t border-slate-200/90 flex items-center justify-between shrink-0">
          {/* Right side in RTL: Auto-save status */}
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'التعديلات تُحفظ فورياً في ملف العميل.' : 'Changes sync directly to client profile.'}</span>
          </div>

          {/* Left side in RTL: Close & Save Changes */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Client Invoice & Statement Modal (A4 PDF) */}
      {client && (
        <ClientInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          client={client}
          packageName={packageName || client.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package')}
          budget={budget}
          billingCycle={billingCycle}
          contractStartDate={contractStartDate}
          renewalDate={renewalDate}
          paymentStatus={paymentStatus}
          targetPosts={targetPosts}
          targetReels={targetReels}
          targetStories={targetStories}
          isAr={isAr}
        />
      )}
    </div>
  );
};
