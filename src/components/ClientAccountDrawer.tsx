import React, { useState, useEffect } from 'react';
import { useAgencyData, DEFAULT_AGENCY_TEAM_MEMBERS } from '../context/AgencyDataContext';
import { ClientAccountNote, ClientWorkflowStage, Inquiry, ActivityLogType, PortalRole, TeamMemberPermissions } from '../types';
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
  Download,
  Trash2,
  User,
  Package,
  Activity,
  RotateCcw,
  History
} from 'lucide-react';
import {
  ClientWorkflowStepper,
  DEFAULT_WORKFLOW_STAGES,
  buildReelWorkflowStages,
  checkSequentialStageToggle,
  formatSequentialBlockMessage,
} from './ClientWorkflowStepper';
import { ClientPackageDeliverablesCard } from './ClientPackageDeliverablesCard';
import { ClientPerformanceSummary } from './ClientPerformanceSummary';
import { ClientInvoiceModal } from './ClientInvoiceModal';
import { AccountStatementModal } from './AccountStatementModal';
import { ActivityTimelinePanel } from './ActivityTimelinePanel';
import { getClientOverdueStatus, getClientDeliverableTargets } from '../utils/workflowUtils';
import {
  generateClientInvoicePdf,
  parseInvoiceAmount,
  generateUniqueInvoiceNumber,
} from '../utils/invoicePdfGenerator';
import {
  ARABIC_MONTH_NAMES,
  ENGLISH_MONTH_NAMES,
  buildCycleDatesFromMonth,
  formatInvoicePeriodLabel,
  formatOperationCycleBadge,
  getNextOperationCycle,
  parseYearMonth,
} from '../utils/billingPeriodUtils';
import { CountryCode } from 'libphonenumber-js';
import { validateAndFormatPhone } from '../lib/phoneUtils';
import { deleteInquiryFromDb, isSupabaseConfigured } from '../lib/supabase';
import { ClientAdWalletPanel } from './ClientAdWalletPanel';

export type ClientDrawerTab = 'overview' | 'profile' | 'performance' | 'deliverables' | 'ad_wallet' | 'billing' | 'statement' | 'notes';

interface ClientAccountDrawerProps {
  client: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated?: (updated: Inquiry) => void;
  onClientDeleted?: (id: string) => void;
  initialTab?: ClientDrawerTab;
  userRole?: PortalRole;
  permissions?: TeamMemberPermissions;
  currentMemberName?: string;
}

const DEFAULT_STAGES: ClientWorkflowStage[] = DEFAULT_WORKFLOW_STAGES;

export const ClientAccountDrawer: React.FC<ClientAccountDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onClientUpdated,
  onClientDeleted,
  initialTab = 'overview',
  userRole = 'admin',
  permissions,
  currentMemberName,
}) => {
  const { language, updateInquiry, logInquiryActivity, deleteInquiry, data, addInvoice, closeClientBillingCycle } = useAgencyData();
  const isAr = language === 'ar';
  const canViewFinancials = permissions ? permissions.canViewFinancials : userRole !== 'operations';
  const canEditClients = permissions ? permissions.canEditClients : true;
  const canDeleteRecords = permissions ? permissions.canDeleteRecords : userRole !== 'operations';
  const allowedWorkflowStages = permissions?.allowedWorkflowStages;
  const canUpdateReelsTrack = permissions ? permissions.canUpdateReelsTrack !== false : true;
  const canAssignTasks = permissions ? Boolean(permissions.canAssignTasks) : userRole !== 'operations';
  const canApproveAdWallet = permissions
    ? Boolean(permissions.canApproveAdWallet)
    : userRole !== 'operations';
  const canManageAdWallet = permissions
    ? Boolean(permissions.canManageAdWallet) || canApproveAdWallet || canViewFinancials
    : true;
  const canAccessAdWallet = canManageAdWallet || canApproveAdWallet || canViewFinancials;
  const pendingAdWalletCount = (client?.adWalletRequests || []).filter(
    (r) => r.status === 'pending'
  ).length;
  const actorName =
    currentMemberName?.trim() ||
    (userRole === 'admin'
      ? isAr
        ? 'الإدارة'
        : 'Admin'
      : isAr
      ? 'فريق التنفيذ'
      : 'Delivery Team');
  const teamMembers =
    data.teamMembers && data.teamMembers.length > 0
      ? data.teamMembers
      : DEFAULT_AGENCY_TEAM_MEMBERS;

  // Local editable states initialized safely from client data
  const sanitizeTab = (tab: ClientDrawerTab): ClientDrawerTab => {
    if (!canViewFinancials && (tab === 'billing' || tab === 'statement')) return 'overview';
    if (!canAccessAdWallet && tab === 'ad_wallet') return 'overview';
    if (!canEditClients && tab === 'profile') return 'overview';
    return tab;
  };
  const safeInitialTab: ClientDrawerTab = sanitizeTab(initialTab);
  const [activeTab, setActiveTab] = useState<ClientDrawerTab>(safeInitialTab);
  const [contractStatus, setContractStatus] = useState<Inquiry['contractStatus']>(client?.contractStatus || 'active');
  const [paymentStatus, setPaymentStatus] = useState<Inquiry['paymentStatus']>(client?.paymentStatus || 'pending');
  const [billingCycle, setBillingCycle] = useState<Inquiry['billingCycle']>(client?.billingCycle || 'monthly');
  const [contractStartDate, setContractStartDate] = useState(client?.contractStartDate || client?.createdAt?.split('T')[0] || '');
  const [renewalDate, setRenewalDate] = useState(
    client?.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState(client?.budget || (isAr ? '15,000 ج.م شهرياً' : '15,000 EGP / month'));
  const [packageName, setPackageName] = useState(client?.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package'));

  // Editable Client Profile & Package Settings
  const [clientName, setClientName] = useState(client?.name || '');
  const [clientCompany, setClientCompany] = useState(client?.company || '');
  const [clientPhone, setClientPhone] = useState(client?.phone || '');
  const [clientSector, setClientSector] = useState<'all' | 'b2b' | 'b2c' | 'medical'>(client?.sector || 'b2c');
  const [clientGeneralNotes, setClientGeneralNotes] = useState(client?.notes || '');
  const [accountManager, setAccountManager] = useState(client?.accountManager || '');
  const [selectedPackageId, setSelectedPackageId] = useState(client?.packageId || '');
  const [customPostsTarget, setCustomPostsTarget] = useState<number>(client?.postsTarget ?? 0);
  const [customReelsTarget, setCustomReelsTarget] = useState<number>(client?.reelsTarget ?? 0);
  const [customStoriesTarget, setCustomStoriesTarget] = useState<number>(client?.storiesTarget ?? 0);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingClient, setIsDeletingClient] = useState(false);

  // Workflow Stages state with real-time sync
  const [workflowStages, setWorkflowStages] = useState<ClientWorkflowStage[]>(
    client?.workflowStages && client.workflowStages.length === 5 
      ? client.workflowStages 
      : DEFAULT_STAGES
  );
  const [reelStages, setReelStages] = useState<ClientWorkflowStage[]>(() =>
    buildReelWorkflowStages(client?.reelsTarget ?? 0, client?.reelStages, client?.reelsDelivered ?? 0)
  );

  // Today's Task Title
  const [todayTaskTitle, setTodayTaskTitle] = useState<string>(client?.todayTaskTitle || '');
  const [isEditingTask, setIsEditingTask] = useState<boolean>(false);

  const [postsDelivered, setPostsDelivered] = useState(client?.postsDelivered ?? 0);
  const [reelsDelivered, setReelsDelivered] = useState(client?.reelsDelivered ?? 0);
  const [storiesDelivered, setStoriesDelivered] = useState(client?.storiesDelivered ?? 0);

  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState<boolean>(false);
  const [isDirectDownloading, setIsDirectDownloading] = useState<boolean>(false);

  // Close Month / Start New Billing Cycle Modal states
  const [isCloseCycleModalOpen, setIsCloseCycleModalOpen] = useState<boolean>(false);
  const [nextCycleMonth, setNextCycleMonth] = useState<number>(() => new Date().getMonth());
  const [nextCycleYear, setNextCycleYear] = useState<number>(() => new Date().getFullYear());
  const [nextCycleStartDate, setNextCycleStartDate] = useState<string>('');
  const [nextCycleRenewalDate, setNextCycleRenewalDate] = useState<string>('');
  const [nextCycleAdCredit, setNextCycleAdCredit] = useState<number>(0);
  const [issueNextInvoiceNow, setIssueNextInvoiceNow] = useState<boolean>(false);
  const [closeInvoiceTargetCycle, setCloseInvoiceTargetCycle] = useState<'closed' | 'new'>('closed');
  const [closeCycleNotes, setCloseCycleNotes] = useState<string>('');

  // Ad Credit & Campaign Wallet States (الرصيد الإعلاني ومحفظة الحملات)
  const [adCreditBalance, setAdCreditBalance] = useState<number>(client?.adCreditBalance ?? 0);
  const [invoiceAdCredit, setInvoiceAdCredit] = useState<number>(client?.pendingInvoiceAdCredit ?? 0);
  const [adCreditFundedTotal, setAdCreditFundedTotal] = useState<number>(client?.adCreditFundedTotal ?? (client?.adCreditBalance ?? 0));
  const [adCreditSpentTotal, setAdCreditSpentTotal] = useState<number>(client?.adCreditSpentTotal ?? 0);
  const [isDeductingSpendOpen, setIsDeductingSpendOpen] = useState(false);
  const [spendAmountInput, setSpendAmountInput] = useState<string>('');
  const [spendCampaignPlatform, setSpendCampaignPlatform] = useState<string>('Meta Ads (Facebook & Instagram)');

  // Synchronize state when client or isOpen changes
  useEffect(() => {
    if (client && isOpen) {
      const initialResolved = getClientDeliverableTargets(client, data?.packages || []);
      setContractStatus(client.contractStatus || 'active');
      setPaymentStatus(client.paymentStatus || 'pending');
      setBillingCycle(client.billingCycle || 'monthly');
      setContractStartDate(client.contractStartDate || client.createdAt?.split('T')[0] || '');
      setRenewalDate(client.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setBudget(client.budget || (isAr ? '15,000 ج.م شهرياً' : '15,000 EGP / month'));
      setPackageName(client.packageName || (isAr ? 'باقة مخصصة' : 'Custom Package'));

      setClientName(client.name || '');
      setClientCompany(client.company || '');
      setClientPhone(client.phone || '');
      setClientSector(client.sector || 'b2c');
      setClientGeneralNotes(client.notes || '');
      setAccountManager(client.accountManager || '');
      const matchedCatalogPkg = (data?.packages || []).find(
        (p) => p.id === client.packageId || p.name === client.packageName || p.nameEn === client.packageName
      );
      setSelectedPackageId(client.packageId || matchedCatalogPkg?.id || '');
      setCustomPostsTarget(initialResolved.postsTarget);
      setCustomReelsTarget(initialResolved.reelsTarget);
      setCustomStoriesTarget(initialResolved.storiesTarget);
      setProfileFormError(null);
      setIsConfirmingDelete(false);
      setIsDeletingClient(false);

      setAdCreditBalance(client.adCreditBalance ?? 0);
      setInvoiceAdCredit(client.pendingInvoiceAdCredit ?? 0);
      setAdCreditFundedTotal(client.adCreditFundedTotal ?? (client.adCreditBalance ?? 0));
      setAdCreditSpentTotal(client.adCreditSpentTotal ?? 0);
      setWorkflowStages(
        client.workflowStages && client.workflowStages.length === 5
          ? client.workflowStages
          : DEFAULT_STAGES
      );
      setReelStages(
        buildReelWorkflowStages(
          initialResolved.reelsTarget,
          client.reelStages,
          client.reelsDelivered ?? 0
        )
      );
      setTodayTaskTitle(client.todayTaskTitle || '');
      setPostsDelivered(client.postsDelivered ?? 0);
      setReelsDelivered(client.reelsDelivered ?? 0);
      setStoriesDelivered(client.storiesDelivered ?? 0);
    }
  }, [client, isOpen, isAr]);

  useEffect(() => {
    if (isOpen && client?.id) {
      setActiveTab(sanitizeTab(initialTab || 'overview'));
    }
  }, [client?.id, isOpen, initialTab]);

  useEffect(() => {
    if (
      (!canViewFinancials && (activeTab === 'billing' || activeTab === 'statement')) ||
      (!canAccessAdWallet && activeTab === 'ad_wallet') ||
      (!canEditClients && activeTab === 'profile')
    ) {
      setActiveTab('overview');
    }
  }, [canViewFinancials, canAccessAdWallet, canEditClients, activeTab]);

  const showNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Deliverables progress targets (reflect live edits in Profile & Package tab)
  const targetPosts = customPostsTarget;
  const targetReels = customReelsTarget;
  const targetStories = customStoriesTarget;

  // Direct Invoice PDF Download using jsPDF
  const handleDirectDownloadInvoice = async () => {
    if (!client) return;
    setIsDirectDownloading(true);
    try {
      const existingInvoices = data.invoices || [];
      const existingClientInv = existingInvoices.find(
        (i) => i.clientId === client.id && i.paymentStatus !== 'cancelled'
      );
      const invNum =
        existingClientInv?.invoiceNumber ||
        generateUniqueInvoiceNumber(client.id, existingInvoices);
      const effectiveStatus = existingClientInv?.paymentStatus || paymentStatus || 'pending';

      const activePeriodLabel = formatInvoicePeriodLabel(
        contractStartDate || client.contractStartDate || client.createdAt,
        billingCycle,
        isAr
      );

      const res = await generateClientInvoicePdf({
        client,
        packageName: packageName || client.packageName,
        deliverables: {
          posts: targetPosts,
          reels: targetReels,
          stories: targetStories,
        },
        totalCost: budget,
        adCreditAmount: invoiceAdCredit,
        billingCycle,
        contractStartDate,
        contractPeriod: existingClientInv?.contractPeriod || activePeriodLabel,
        renewalDate,
        invoiceNumber: invNum,
        paymentStatus: effectiveStatus === 'cancelled' ? 'pending' : effectiveStatus,
        isAr,
      });
      if (res.success) {
        showNotification(isAr ? 'تم تحميل ملف الفاتورة PDF وحفظها بالأرشيف!' : 'Invoice PDF downloaded and archived!');
        try {
          const parsedRet = parseInvoiceAmount(budget);
          const numRetainer = parsedRet > 0 ? parsedRet : (client.retainerAmount || 0);
          const grandTotal = numRetainer + (invoiceAdCredit || 0);
          const today = new Date().toISOString().split('T')[0];
          const existing = existingInvoices.find(
            (i) => i.invoiceNumber === invNum && i.clientId === client.id
          );
          if (!existing) {
            addInvoice({
              invoiceNumber: invNum,
              clientId: client.id,
              clientName: client.name,
              clientCompany: client.company,
              clientPhone: client.phone,
              sector: client.sector,
              issueDate: today,
              dueDate: renewalDate,
              packageName: packageName || client.packageName || 'باقة تسويق رقمي',
              retainerAmount: numRetainer,
              adCreditAmount: invoiceAdCredit,
              grandTotal,
              billingCycle,
              contractPeriod: activePeriodLabel,
              paymentStatus: 'pending',
              deliverables: { posts: targetPosts, reels: targetReels, stories: targetStories },
            });
          }
        } catch {}
      }
    } catch (err) {
      console.error('Invoice download error:', err);
    } finally {
      setIsDirectDownloading(false);
    }
  };

  // Confirm invoice payment & deposit ad credit into client wallet
  const handleCollectAndDepositAdCredit = () => {
    if (!client) return;
    if (invoiceAdCredit <= 0) {
      showNotification(isAr ? 'لا يوجد رصيد إعلاني معلق في الفاتورة لإيداعه.' : 'No pending ad credit to deposit.');
      return;
    }

    const depositedAmount = invoiceAdCredit;
    const newBalance = adCreditBalance + depositedAmount;
    const newFundedTotal = adCreditFundedTotal + depositedAmount;

    setAdCreditBalance(newBalance);
    setAdCreditFundedTotal(newFundedTotal);
    setInvoiceAdCredit(0);
    setPaymentStatus('paid');

    const depositNote: ClientAccountNote = {
      id: `note-${Date.now()}`,
      text: isAr
        ? `💵 تم تأكيد تحصيل الفاتورة رسمياً وإيداع مبلغ ${depositedAmount.toLocaleString()} ج.م في الرصيد الإعلاني للعميل. (الرصيد المتاح الحالي: ${newBalance.toLocaleString()} ج.م).`
        : `💵 Invoice collected and ${depositedAmount.toLocaleString()} EGP deposited into client ad credit balance. (New balance: ${newBalance.toLocaleString()} EGP).`,
      createdAt: new Date().toISOString(),
      type: 'payment',
      author: isAr ? 'الإدارة المالية' : 'Finance Dept',
    };

    const updatedNotes = [depositNote, ...(client.clientNotes || [])];

    const updates: Partial<Inquiry> = {
      paymentStatus: 'paid',
      adCreditBalance: newBalance,
      pendingInvoiceAdCredit: 0,
      adCreditFundedTotal: newFundedTotal,
      clientNotes: updatedNotes,
    };

    updateInquiry(client.id, updates);
    if (onClientUpdated) {
      onClientUpdated({ ...client, ...updates });
    }

    showNotification(
      isAr 
        ? `✅ تم تحصيل الفاتورة وإيداع ${depositedAmount.toLocaleString()} ج.م رصيد إعلاني بنجاح!` 
        : `✅ Invoice collected and ${depositedAmount.toLocaleString()} EGP ad credit deposited!`
    );
  };

  // Deduct ad campaign spend
  const handleDeductAdSpend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    const amount = parseFloat(spendAmountInput);
    if (!amount || amount <= 0) return;

    if (amount > adCreditBalance) {
      showNotification(isAr ? 'المبلغ المطلوب صرفه يتجاوز الرصيد الإعلاني المتاح!' : 'Spend amount exceeds available ad balance!');
      return;
    }

    const newBalance = adCreditBalance - amount;
    const newSpentTotal = adCreditSpentTotal + amount;

    setAdCreditBalance(newBalance);
    setAdCreditSpentTotal(newSpentTotal);
    setSpendAmountInput('');
    setIsDeductingSpendOpen(false);

    const spendNote: ClientAccountNote = {
      id: `note-${Date.now()}`,
      text: isAr
        ? `📢 تم صرف مبلغ ${amount.toLocaleString()} ج.م من الرصيد الإعلاني في حملات (${spendCampaignPlatform}). الرصيد الإعلاني المتبقي: ${newBalance.toLocaleString()} ج.م.`
        : `📢 Spent ${amount.toLocaleString()} EGP from ad credit on (${spendCampaignPlatform}). Remaining balance: ${newBalance.toLocaleString()} EGP.`,
      createdAt: new Date().toISOString(),
      type: 'update',
      author: isAr ? 'فريق إدارة الإعلانات الممولة' : 'Media Buying Team',
    };

    const updatedNotes = [spendNote, ...(client.clientNotes || [])];

    const updates: Partial<Inquiry> = {
      adCreditBalance: newBalance,
      adCreditSpentTotal: newSpentTotal,
      clientNotes: updatedNotes,
    };

    updateInquiry(client.id, updates);
    if (onClientUpdated) {
      onClientUpdated({ ...client, ...updates });
    }

    showNotification(
      isAr 
        ? `تم تسجيل صرف ${amount.toLocaleString()} ج.م من الرصيد الإعلاني بنجاح!` 
        : `Logged ${amount.toLocaleString()} EGP ad spend successfully!`
    );
  };

  // Two-way real-time sync: cycle stage status, auto-stamp actor assignee, log workflow activity
  const handleToggleStageStatus = (stageId: string) => {
    if (!client) return;
    if (allowedWorkflowStages && !allowedWorkflowStages.includes(stageId as any)) {
      return;
    }
    const seqCheck = checkSequentialStageToggle(workflowStages, stageId);
    if (!seqCheck.allowed) {
      const targetStage = workflowStages.find((s) => s.id === stageId);
      showNotification(
        formatSequentialBlockMessage(seqCheck, targetStage?.title || stageId, isAr)
      );
      return;
    }
    let changedStageTitle = '';
    let changedStageNextStatus = '';
    const memberStamp = currentMemberName?.trim();
    const updatedStages = workflowStages.map((stage) => {
      if (stage.id === stageId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        const nextAssignee =
          !canAssignTasks && memberStamp
            ? nextStatus === 'pending'
              ? undefined
              : memberStamp
            : stage.assignee || (nextStatus !== 'pending' && memberStamp ? memberStamp : stage.assignee);
        changedStageTitle = stage.title;
        changedStageNextStatus =
          nextStatus === 'completed'
            ? (isAr ? 'مكتملة' : 'Completed')
            : nextStatus === 'in_progress'
            ? (isAr ? 'قيد التنفيذ' : 'In Progress')
            : (isAr ? 'قيد الانتظار' : 'Pending');
        return { ...stage, status: nextStatus, completedAt, assignee: nextAssignee };
      }
      return stage;
    });

    const stageActivity: ClientAccountNote | null = changedStageTitle
      ? {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          text: isAr
            ? `تحديث مرحلة التنفيذ «${changedStageTitle}» إلى «${changedStageNextStatus}» بواسطة ${actorName}.`
            : `Updated workflow stage "${changedStageTitle}" to "${changedStageNextStatus}" by ${actorName}.`,
          createdAt: new Date().toISOString(),
          author: actorName,
          type: 'workflow',
          meta: { stageTitle: changedStageTitle },
        }
      : null;

    const updatedNotes = stageActivity ? [stageActivity, ...(client.clientNotes || [])] : client.clientNotes;

    setWorkflowStages(updatedStages);
    updateInquiry(client.id, {
      workflowStages: updatedStages,
      ...(updatedNotes ? { clientNotes: updatedNotes } : {}),
    });
    if (onClientUpdated) {
      onClientUpdated({
        ...client,
        workflowStages: updatedStages,
        ...(updatedNotes ? { clientNotes: updatedNotes } : {}),
      });
    }
  };

  // Two-way real-time sync for the Reels timeline track (auto-syncs reelsDelivered)
  const handleToggleReelStageStatus = (reelStageId: string) => {
    if (!client) return;
    if (!canUpdateReelsTrack) return;
    const normalized = buildReelWorkflowStages(targetReels, reelStages, reelsDelivered);
    const reelSeqCheck = checkSequentialStageToggle(normalized, reelStageId);
    if (!reelSeqCheck.allowed) {
      const targetIdx = normalized.findIndex((s) => s.id === reelStageId);
      const targetLabel = isAr ? `ريلز ${targetIdx + 1}` : `Reel ${targetIdx + 1}`;
      showNotification(formatSequentialBlockMessage(reelSeqCheck, targetLabel, isAr));
      return;
    }
    let toggledReelIndex = 0;
    let nextStatusLabel = '';
    const memberStamp = currentMemberName?.trim();

    const updatedReelStages = normalized.map((stage, idx) => {
      if (stage.id === reelStageId) {
        const nextStatus: 'completed' | 'in_progress' | 'pending' =
          stage.status === 'pending'
            ? 'in_progress'
            : stage.status === 'in_progress'
            ? 'completed'
            : 'pending';
        const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
        const nextAssignee =
          !canAssignTasks && memberStamp
            ? nextStatus === 'pending'
              ? undefined
              : memberStamp
            : stage.assignee || (nextStatus !== 'pending' && memberStamp ? memberStamp : stage.assignee);
        toggledReelIndex = idx + 1;
        nextStatusLabel =
          nextStatus === 'completed'
            ? (isAr ? 'مكتمل' : 'Completed')
            : nextStatus === 'in_progress'
            ? (isAr ? 'قيد التنفيذ' : 'In Progress')
            : (isAr ? 'في الانتظار' : 'Pending');
        return { ...stage, status: nextStatus, completedAt, assignee: nextAssignee };
      }
      return stage;
    });

    const syncedReelsDelivered = updatedReelStages.filter((s) => s.status === 'completed').length;
    const reelLabel = isAr ? `ريلز ${toggledReelIndex}` : `Reel ${toggledReelIndex}`;

    const reelActivity: ClientAccountNote = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: isAr
        ? `تحديث تايم لاين الريلز «${reelLabel}» إلى «${nextStatusLabel}» (${syncedReelsDelivered}/${updatedReelStages.length}) بواسطة ${actorName}.`
        : `Updated Reels timeline "${reelLabel}" to "${nextStatusLabel}" (${syncedReelsDelivered}/${updatedReelStages.length}) by ${actorName}.`,
      createdAt: new Date().toISOString(),
      author: actorName,
      type: 'workflow',
      meta: { stageTitle: reelLabel },
    };

    const updatedNotes = [reelActivity, ...(client.clientNotes || [])];

    setReelStages(updatedReelStages);
    setReelsDelivered(syncedReelsDelivered);
    updateInquiry(client.id, {
      reelStages: updatedReelStages,
      reelsDelivered: syncedReelsDelivered,
      clientNotes: updatedNotes,
    });
    if (onClientUpdated) {
      onClientUpdated({
        ...client,
        reelStages: updatedReelStages,
        reelsDelivered: syncedReelsDelivered,
        clientNotes: updatedNotes,
      });
    }
  };

  // Assign a team member to one of the 5 core workflow stages
  const handleAssignStage = (stageId: string, assignee: string) => {
    if (!client) return;
    let stageName = '';
    const updatedStages = workflowStages.map((stage) => {
      if (stage.id === stageId) {
        stageName = stage.title;
        return { ...stage, assignee: assignee || undefined };
      }
      return stage;
    });

    const assignNote: ClientAccountNote = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: assignee
        ? isAr
          ? `تم إسناد مرحلة «${stageName}» إلى ${assignee}.`
          : `Assigned stage "${stageName}" to ${assignee}.`
        : isAr
        ? `تم إلغاء تعيين المسؤول عن مرحلة «${stageName}».`
        : `Unassigned stage "${stageName}".`,
      createdAt: new Date().toISOString(),
      author: isAr ? 'إدارة التشغيل' : 'Operations',
      type: 'workflow',
      meta: { stageTitle: stageName },
    };

    const updatedNotes = [assignNote, ...(client.clientNotes || [])];
    setWorkflowStages(updatedStages);
    updateInquiry(client.id, {
      workflowStages: updatedStages,
      clientNotes: updatedNotes,
    });
    if (onClientUpdated) {
      onClientUpdated({
        ...client,
        workflowStages: updatedStages,
        clientNotes: updatedNotes,
      });
    }
  };

  // Assign a team member to a specific Reel node in the Reels timeline
  const handleAssignReelStage = (reelStageId: string, assignee: string) => {
    if (!client) return;
    const normalized = buildReelWorkflowStages(targetReels, reelStages, reelsDelivered);
    let reelLabel = '';
    const updatedReelStages = normalized.map((stage, idx) => {
      if (stage.id === reelStageId) {
        reelLabel = isAr ? `ريلز ${idx + 1}` : `Reel ${idx + 1}`;
        return { ...stage, assignee: assignee || undefined };
      }
      return stage;
    });

    const assignNote: ClientAccountNote = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: assignee
        ? isAr
          ? `تم إسناد «${reelLabel}» إلى ${assignee}.`
          : `Assigned "${reelLabel}" to ${assignee}.`
        : isAr
        ? `تم إلغاء تعيين المسؤول عن «${reelLabel}».`
        : `Unassigned "${reelLabel}".`,
      createdAt: new Date().toISOString(),
      author: isAr ? 'إدارة التشغيل' : 'Operations',
      type: 'workflow',
      meta: { stageTitle: reelLabel },
    };

    const updatedNotes = [assignNote, ...(client.clientNotes || [])];
    setReelStages(updatedReelStages);
    updateInquiry(client.id, {
      reelStages: updatedReelStages,
      clientNotes: updatedNotes,
    });
    if (onClientUpdated) {
      onClientUpdated({
        ...client,
        reelStages: updatedReelStages,
        clientNotes: updatedNotes,
      });
    }
  };

  // Set explicit status for a stage
  const handleSetStageStatus = (stageId: string, status: 'completed' | 'in_progress' | 'pending') => {
    setWorkflowStages((prev) =>
      prev.map((stage) => (stage.id === stageId ? { ...stage, status } : stage))
    );
  };

  // Select a catalog package from agency packages
  const handleSelectCatalogPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    if (!pkgId) return;
    const found = (data.packages || []).find((p) => p.id === pkgId);
    if (found) {
      setPackageName(isAr ? found.name : found.nameEn);
      setCustomPostsTarget(found.postsCount ?? 0);
      setCustomReelsTarget(found.reelsCount ?? 0);
      setCustomStoriesTarget(found.storiesCount ?? 0);
      setBudget(
        isAr
          ? `${found.price.toLocaleString('ar-EG')} ج.م ${found.period}`
          : `${found.price.toLocaleString('en-US')} ${found.currencyEn} ${found.periodEn}`
      );
    }
  };

  // Delete client permanently from CRM + Supabase
  const handleConfirmDeleteClient = async () => {
    if (!client) return;
    setIsDeletingClient(true);
    try {
      deleteInquiry(client.id);
      if (isSupabaseConfigured) {
        await deleteInquiryFromDb(client.id);
      }
      if (onClientDeleted) {
        onClientDeleted(client.id);
      }
      setIsConfirmingDelete(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete client:', err);
    } finally {
      setIsDeletingClient(false);
    }
  };

  // Save changes
  const handleSaveAll = () => {
    if (!client) return;
    const trimmedName = clientName.trim();
    const trimmedPhone = clientPhone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setProfileFormError(isAr ? 'يرجى إدخال اسم العميل / المسؤول.' : 'Please enter client name.');
      setActiveTab('profile');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 6) {
      setProfileFormError(isAr ? 'يرجى إدخال رقم هاتف صالح.' : 'Please enter a valid phone number.');
      setActiveTab('profile');
      return;
    }

    setProfileFormError(null);
    const phoneValidation = validateAndFormatPhone(trimmedPhone, (client.phoneCountry || 'EG') as CountryCode);
    const cleanPhoneE164 = phoneValidation.isValid && phoneValidation.e164 ? phoneValidation.e164 : trimmedPhone;
    const cleanPackageName = packageName.trim() || (isAr ? 'باقة مخصصة' : 'Custom Package');

    const updates: Partial<Inquiry> = {
      name: trimmedName,
      company: clientCompany.trim() || undefined,
      phone: trimmedPhone,
      phoneE164: cleanPhoneE164,
      sector: clientSector,
      notes: clientGeneralNotes.trim() || undefined,
      accountManager: accountManager.trim() || undefined,
      packageId: selectedPackageId || undefined,
      packageName: cleanPackageName,
      contractStatus,
      paymentStatus,
      billingCycle,
      contractStartDate,
      renewalDate,
      budget: budget.trim(),
      retainerAmount: parseInvoiceAmount(budget) || client.retainerAmount,
      postsTarget: Math.max(0, Number(targetPosts) || 0),
      postsDelivered,
      reelsTarget: Math.max(0, Number(targetReels) || 0),
      reelsDelivered,
      storiesTarget: Math.max(0, Number(targetStories) || 0),
      storiesDelivered,
      workflowStages,
      reelStages: buildReelWorkflowStages(Math.max(0, Number(targetReels) || 0), reelStages, reelsDelivered),
      todayTaskTitle,
      adCreditBalance,
      pendingInvoiceAdCredit: invoiceAdCredit,
      adCreditFundedTotal,
      adCreditSpentTotal,
    };

    updateInquiry(client.id, updates);
    showNotification(isAr ? 'تم حفظ وتحديث بيانات العميل والباقة بنجاح!' : 'Client profile & package updated successfully!');
    if (onClientUpdated) {
      onClientUpdated({ ...client, ...updates });
    }
  };

  // Add new entry to Activity Log
  const handleAddActivityEntry = (entry: { text: string; type: ActivityLogType; author?: string }) => {
    if (!client || !entry.text.trim()) return;
    const updated = logInquiryActivity(client.id, {
      text: entry.text.trim(),
      type: entry.type,
      author: entry.author || (isAr ? 'مدير الحساب' : 'Account Manager'),
    });
    showNotification(isAr ? 'تمت إضافة النشاط إلى سجل المتابعة بنجاح.' : 'Activity logged to client history.');
    if (updated && onClientUpdated) {
      onClientUpdated(updated);
    }
  };

  // Open Close Month / Start New Billing Cycle modal with smart calendar month defaults
  const handleOpenCloseCycleModal = () => {
    const next = getNextOperationCycle(contractStartDate || client?.createdAt, billingCycle);
    setNextCycleYear(next.year);
    setNextCycleMonth(next.monthIndex);
    setNextCycleStartDate(next.startDate);
    setNextCycleRenewalDate(next.endDate);
    setNextCycleAdCredit(0);
    setIssueNextInvoiceNow(false);
    setCloseInvoiceTargetCycle('closed');
    setCloseCycleNotes('');
    setIsCloseCycleModalOpen(true);
  };

  const handleSelectNextCycleMonthYear = (year: number, monthIndex: number) => {
    setNextCycleYear(year);
    setNextCycleMonth(monthIndex);
    const { startDate, endDate } = buildCycleDatesFromMonth(year, monthIndex, billingCycle);
    setNextCycleStartDate(startDate);
    setNextCycleRenewalDate(endDate);
  };

  // Confirm closing current monthly cycle & starting a fresh month
  const handleConfirmCloseCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const targetPeriodDate =
      closeInvoiceTargetCycle === 'closed'
        ? contractStartDate || client.contractStartDate || client.createdAt
        : nextCycleStartDate;
    const invoicePeriodLabel = formatInvoicePeriodLabel(targetPeriodDate, billingCycle, true);

    const { updatedClient, createdInvoice } = closeClientBillingCycle(client.id, {
      newStartDate: nextCycleStartDate || new Date().toISOString().split('T')[0],
      newRenewalDate:
        nextCycleRenewalDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newPendingAdCredit: nextCycleAdCredit,
      issueInvoiceNow: issueNextInvoiceNow,
      invoiceTargetCycle: closeInvoiceTargetCycle,
      invoiceContractPeriod: invoicePeriodLabel,
      cycleNotes: closeCycleNotes,
      actorName: currentMemberName || (isAr ? 'المدير العام (Admin)' : 'General Manager (Admin)'),
    });

    if (updatedClient) {
      setPostsDelivered(0);
      setReelsDelivered(0);
      setStoriesDelivered(0);
      setWorkflowStages(DEFAULT_STAGES);
      setReelStages(buildReelWorkflowStages(targetReels, [], 0));
      setTodayTaskTitle('');
      setContractStartDate(updatedClient.contractStartDate || nextCycleStartDate);
      setRenewalDate(updatedClient.renewalDate || nextCycleRenewalDate);
      setContractStatus('active');
      setPaymentStatus('pending');
      setInvoiceAdCredit(Math.max(0, nextCycleAdCredit || 0));

      if (onClientUpdated) {
        onClientUpdated(updatedClient);
      }

      const nextCycleName = formatOperationCycleBadge(
        updatedClient.contractStartDate || nextCycleStartDate,
        billingCycle,
        isAr
      );

      showNotification(
        createdInvoice
          ? isAr
            ? `تم إغلاق الدورة وبدء «${nextCycleName}» وإصدار الفاتورة (${createdInvoice.invoiceNumber} — ${invoicePeriodLabel})!`
            : `Cycle closed, started "${nextCycleName}", and issued invoice ${createdInvoice.invoiceNumber}!`
          : isAr
          ? `تم إغلاق الدورة وأرشفتها وتصفير المهام لبدء «${nextCycleName}» بنجاح.`
          : `Cycle closed & archived! Operational tasks reset for "${nextCycleName}".`
      );
    }

    setIsCloseCycleModalOpen(false);
  };

  // Unconditional render guard AFTER all React hooks have run
  if (!isOpen || !client) return null;

  // Resolve archived cycle history (from direct cycleHistory or persisted clientNotes metadata)
  const resolvedCycleHistory = (() => {
    const direct = client.cycleHistory || [];
    const fromNotes = (client.clientNotes || [])
      .map((n) => n.meta?.cycleRecord)
      .filter((r): r is NonNullable<typeof r> => Boolean(r && r.id));
    const seen = new Set<string>();
    const combined = [...direct, ...fromNotes].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    return combined.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime());
  })();

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
  const currentCycleBadge = formatOperationCycleBadge(
    contractStartDate || client.createdAt,
    billingCycle,
    isAr
  );
  const currentInvoicePeriodLabel = formatInvoicePeriodLabel(
    contractStartDate || client.createdAt,
    billingCycle,
    isAr
  );
  const nextCyclePreviewBadge = formatOperationCycleBadge(
    nextCycleStartDate || buildCycleDatesFromMonth(nextCycleYear, nextCycleMonth, billingCycle).startDate,
    billingCycle,
    isAr
  );
  const nextCycleInvoicePeriodPreview = formatInvoicePeriodLabel(
    nextCycleStartDate || buildCycleDatesFromMonth(nextCycleYear, nextCycleMonth, billingCycle).startDate,
    billingCycle,
    isAr
  );
  const monthNamesList = isAr ? ARABIC_MONTH_NAMES : ENGLISH_MONTH_NAMES;
  const baseYear = new Date().getFullYear();
  const selectableYears = [baseYear - 1, baseYear, baseYear + 1, baseYear + 2];

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
                {(clientCompany || clientName || client.company || client.name).slice(0, 1).toUpperCase()}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">{clientCompany || clientName || client.company || client.name}</h3>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                    clientSector === 'medical' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : clientSector === 'b2b'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}>
                    {clientSector.toUpperCase()}
                  </span>

                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    <span>{isAr ? 'عميل متعاقد رسمي' : 'Contracted Client'}</span>
                  </span>

                  <span className="text-[10px] font-black bg-sky-500/20 text-sky-200 border border-sky-400/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-300" />
                    <span>{currentCycleBadge}</span>
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
                    <span>{clientName || client.name}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span dir="ltr">{clientPhone || client.phone}</span>
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
              {canEditClients && (
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                    activeTab === 'profile'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                  title={isAr ? 'تعديل بيانات العميل والباقة' : 'Edit Client & Package'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل البيانات والباقة' : 'Edit Client'}</span>
                </button>
              )}

              {canViewFinancials && (
                <>
                  <button
                    type="button"
                    onClick={handleOpenCloseCycleModal}
                    className="px-3 py-1.5 text-xs font-black text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    title={isAr ? 'إغلاق الشهر الحالي وأرشفته وبدء دورة جديدة' : 'Close Month & Start New Cycle'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'إغلاق الشهر / دورة جديدة' : 'New Cycle'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer border border-blue-400/30"
                    title={isAr ? 'إصدار الفاتورة وبيان الحساب PDF' : 'Issue Invoice PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-200" />
                    <span>{isAr ? 'إصدار الفاتورة' : 'Invoice'}</span>
                  </button>
                </>
              )}

              <a
                href={`https://wa.me/${waPhone}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const updated = logInquiryActivity(client.id, {
                    type: 'whatsapp',
                    text: isAr
                      ? `تم فتح محادثة واتساب مباشرة مع العميل (${client.phone}).`
                      : `Opened direct WhatsApp conversation with client (${client.phone}).`,
                  });
                  if (updated && onClientUpdated) onClientUpdated(updated);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                title="WhatsApp Direct"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'مراسلة واتساب' : 'WhatsApp'}</span>
              </a>

              <a
                href={`tel:${clientPhone || client.phone}`}
                onClick={() => {
                  const updated = logInquiryActivity(client.id, {
                    type: 'call',
                    text: isAr
                      ? `تم بدء اتصال هاتفي بالعميل على رقم (${clientPhone || client.phone}).`
                      : `Initiated phone call to client (${clientPhone || client.phone}).`,
                  });
                  if (updated && onClientUpdated) onClientUpdated(updated);
                }}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                title={isAr ? 'اتصال هاتفي' : 'Call Client'}
              >
                <Phone className="w-4 h-4" />
              </a>

              {canDeleteRecords && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-2 text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-600 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
                  title={isAr ? 'حذف العميل نهائياً' : 'Delete Client'}
                  aria-label={isAr ? 'حذف العميل' : 'Delete Client'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

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

            {canEditClients && (
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-amber-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isAr ? 'بيانات العميل والباقة' : 'Profile & Package'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'performance'
                  ? 'bg-white text-slate-900 shadow-sm font-black'
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

            {canAccessAdWallet && (
              <button
                type="button"
                onClick={() => setActiveTab('ad_wallet')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'ad_wallet'
                    ? 'bg-purple-600 text-white shadow-sm font-black'
                    : 'text-purple-200 hover:text-white hover:bg-purple-900/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isAr ? 'محفظة الإعلانات الممولة' : 'Ad Wallet'}</span>
                {pendingAdWalletCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 leading-none">
                    {pendingAdWalletCount}
                  </span>
                )}
              </button>
            )}

            {canViewFinancials && (
              <>
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
                  onClick={() => setActiveTab('statement')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'statement'
                      ? 'bg-emerald-600 text-white shadow-sm font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isAr ? 'كشف الحساب والفواتير 📄' : 'Statement & Invoices 📄'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? `سجل النشاط (${(client.clientNotes || []).length})` : `Activity Log (${(client.clientNotes || []).length})`}</span>
            </button>
          </div>
        </div>

        {/* Delete Client Confirmation Banner */}
        {isConfirmingDelete && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-rose-950">
                  {isAr
                    ? `هل أنت متأكد من حذف ملف العميل "${clientCompany || clientName}" نهائياً؟`
                    : `Permanently delete client "${clientCompany || clientName}"?`}
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  {isAr
                    ? 'سيتم حذف العميل من لوحة التحكم ومن قاعدة بيانات Supabase بشكل نهائي (لا يمكن التراجع عن هذا الإجراء).'
                    : 'This removes the client permanently from CRM and Supabase. This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                disabled={isDeletingClient}
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingClient}
                onClick={handleConfirmDeleteClient}
                className="px-4 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeletingClient ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isAr ? 'تأكيد الحذف النهائي' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        )}

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
              {/* TOP HIGH-LEVEL STATUS CARDS                                   */}
              {/* ------------------------------------------------------------- */}
              <div className={`grid grid-cols-1 ${canViewFinancials ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
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
                    disabled={!canEditClients}
                    onChange={(e) => setContractStatus(e.target.value as any)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer disabled:cursor-default disabled:opacity-80 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">{isAr ? 'نشط ومفعل (Active) 🟢' : 'Active 🟢'}</option>
                    <option value="renewal_due">{isAr ? 'قيد التجديد (Renewal Due) 🟡' : 'Renewal Due 🟡'}</option>
                    <option value="paused">{isAr ? 'موقوف مؤقتاً (Paused) ⏸️' : 'Paused ⏸️'}</option>
                    <option value="completed">{isAr ? 'مكتمل / منتهي (Completed) ⚪' : 'Completed ⚪'}</option>
                  </select>
                </div>

                {/* Card 2: حالة السداد والتحصيل (Financial Access Only) */}
                {canViewFinancials && (
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
                )}

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
                    disabled={!canEditClients}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-80 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* PIPELINE / WORKFLOW STAGES (مراحل التنفيذ)                     */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {!canAssignTasks && currentMemberName
                      ? isAr
                        ? `اضغط على مراحلك المفعّلة للتحديث — يتم تسجيل اسمك (${currentMemberName}) تلقائياً على كل مهمة.`
                        : `Click your allowed stages to update — tasks auto-stamp with your name (${currentMemberName}).`
                      : isAr
                      ? 'اضغط على أي مرحلة لتحديث حالتها (مكتمل / قيد التنفيذ / في الانتظار) ويتم تحديثها تلقائياً بالخارج'
                      : 'Click any stage to cycle status (auto-synced in real-time)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isAr ? 'مراحل التنفيذ' : 'Execution Stages'}
                    </h4>
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {/* Stepper Pipeline with Timestamps + Package Reels Timeline + Role-Scoped Assignees */}
                <ClientWorkflowStepper
                  stages={workflowStages}
                  onToggleStage={handleToggleStageStatus}
                  reelsTarget={targetReels}
                  reelStages={reelStages}
                  reelsDelivered={reelsDelivered}
                  onToggleReelStage={handleToggleReelStageStatus}
                  teamMembers={teamMembers}
                  onAssignStage={canAssignTasks ? handleAssignStage : undefined}
                  onAssignReelStage={canAssignTasks ? handleAssignReelStage : undefined}
                  allowedStageIds={allowedWorkflowStages}
                  canToggleReels={canUpdateReelsTrack}
                  canAssignTasks={canAssignTasks}
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
                        placeholder={isAr ? 'أدخل عنوان مهمة اليوم...' : "Enter today's task..."}
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
                      <span className={`text-xs sm:text-sm font-bold transition-colors ${todayTaskTitle ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                        {todayTaskTitle || (isAr ? 'لا توجد مهمة محددة (اضغط للإضافة)' : 'No task set (click to add)')}
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

          {/* TAB: EDIT CLIENT PROFILE & PACKAGE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
              {profileFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileFormError}</span>
                </div>
              )}

              {/* Section 1: Client Basic Info */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {isAr ? 'البيانات الأساسية للعميل' : 'Client Basic Details'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isAr ? 'تعديل اسم المسؤول، اسم الشركة أو العيادة، رقم الهاتف، والقطاع.' : 'Edit contact name, company/brand, phone, sector, and notes.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'اسم العميل / المسؤول *' : 'Client / Contact Name *'}
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={isAr ? 'اسم العميل...' : 'Client full name...'}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'اسم الشركة / العيادة / النشاط' : 'Company / Clinic / Brand'}
                    </label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder={isAr ? 'مثال: هانورا للتطوير العقاري...' : 'Company name...'}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="010xxxxxxxx"
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-mono font-bold text-start focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'القطاع المستهدف (Sector)' : 'Sector'}
                    </label>
                    <select
                      value={clientSector}
                      onChange={(e) => setClientSector(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="b2b">{isAr ? 'قطاع الأعمال والمصانع (B2B)' : 'B2B & Enterprise'}</option>
                      <option value="b2c">{isAr ? 'التجزئة والمستهلكين (B2C)' : 'B2C & Retail'}</option>
                      <option value="medical">{isAr ? 'القطاع الطبي والعيادات (Medical)' : 'Medical & Clinics'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'مدير الحساب المسؤول' : 'Account Manager'}
                    </label>
                    <input
                      type="text"
                      value={accountManager}
                      onChange={(e) => setAccountManager(e.target.value)}
                      placeholder={isAr ? 'اسم مدير الحساب (اختياري)...' : 'Assigned manager (optional)...'}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'ملاحظات عامة' : 'General Notes'}
                    </label>
                    <input
                      type="text"
                      value={clientGeneralNotes}
                      onChange={(e) => setClientGeneralNotes(e.target.value)}
                      placeholder={isAr ? 'ملاحظات أو تفاصيل الاتفاق...' : 'General notes...'}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Package & Deliverables Customization */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {isAr ? 'تغيير الباقة وتعديل المخرجات والسعر' : 'Package, Deliverables & Pricing'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isAr ? 'اختر باقة جاهزة من الوكالة أو عدّل اسم الباقة والمخرجات والسعر يدوياً.' : 'Pick a catalog package or customize title, monthly deliverables, and price.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                    {targetPosts} {isAr ? 'منشور' : 'Posts'} • {targetReels} {isAr ? 'ريلز' : 'Reels'} • {targetStories} {isAr ? 'ستوري' : 'Stories'}
                  </span>
                </div>

                {/* Quick Catalog Selector */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700 block">
                    {isAr ? 'تبديل سريع إلى إحدى باقات الوكالة الجاهزة:' : 'Quick Switch to Agency Catalog Package:'}
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => handleSelectCatalogPackage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{isAr ? '— باقة مخصصة / تعديل يدوي —' : '— Custom Package / Manual Setup —'}</option>
                    {(data.packages || []).map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {`[${pkg.sector.toUpperCase()}] ${isAr ? pkg.name : pkg.nameEn} — ${pkg.price.toLocaleString()} ${isAr ? 'ج.م' : pkg.currencyEn} (${pkg.postsCount ?? 0} بوست • ${pkg.reelsCount ?? 0} ريلز • ${pkg.storiesCount ?? 0} ستوري)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Name + Budget + Cycle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'اسم الباقة المعتمد للعميل:' : 'Package Title:'}
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => {
                        setPackageName(e.target.value);
                        setSelectedPackageId('');
                      }}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {canViewFinancials && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        {isAr ? 'قيمة الاشتراك / الميزانية:' : 'Retainer Fee / Budget:'}
                      </label>
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {isAr ? 'دورة التعاقد:' : 'Billing Cycle:'}
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="monthly">{isAr ? 'شهرياً (Monthly)' : 'Monthly'}</option>
                      <option value="quarterly">{isAr ? 'ربع سنوي (Quarterly)' : 'Quarterly'}</option>
                      <option value="annual">{isAr ? 'سنوي (Annual)' : 'Annual'}</option>
                    </select>
                  </div>
                </div>

                {/* Custom Deliverable Targets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 space-y-1.5">
                    <label className="font-bold text-sky-900 block">
                      {isAr ? 'عدد البوستات المطلوبة شهرياً:' : 'Monthly Posts Target:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCustomPostsTarget((v) => Math.max(0, v - 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-sky-200 text-sky-800 font-black hover:bg-sky-100 cursor-pointer flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={customPostsTarget}
                        onChange={(e) => {
                          setSelectedPackageId('');
                          setCustomPostsTarget(Math.max(0, parseInt(e.target.value, 10) || 0));
                        }}
                        className="flex-1 text-center p-1.5 bg-white border border-sky-200 rounded-lg font-black text-slate-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCustomPostsTarget((v) => v + 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black hover:bg-sky-700 cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/80 space-y-1.5">
                    <label className="font-bold text-purple-900 block">
                      {isAr ? 'عدد الريلز المطلوبة شهرياً:' : 'Monthly Reels Target:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCustomReelsTarget((v) => Math.max(0, v - 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-purple-200 text-purple-800 font-black hover:bg-purple-100 cursor-pointer flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={customReelsTarget}
                        onChange={(e) => {
                          setSelectedPackageId('');
                          setCustomReelsTarget(Math.max(0, parseInt(e.target.value, 10) || 0));
                        }}
                        className="flex-1 text-center p-1.5 bg-white border border-purple-200 rounded-lg font-black text-slate-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCustomReelsTarget((v) => v + 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black hover:bg-purple-700 cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
                    <label className="font-bold text-amber-900 block">
                      {isAr ? 'عدد الستوريز المطلوبة شهرياً:' : 'Monthly Stories Target:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCustomStoriesTarget((v) => Math.max(0, v - 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-amber-200 text-amber-800 font-black hover:bg-amber-100 cursor-pointer flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={customStoriesTarget}
                        onChange={(e) => {
                          setSelectedPackageId('');
                          setCustomStoriesTarget(Math.max(0, parseInt(e.target.value, 10) || 0));
                        }}
                        className="flex-1 text-center p-1.5 bg-white border border-amber-200 rounded-lg font-black text-slate-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCustomStoriesTarget((v) => v + 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-600 cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Danger Zone - Delete Client */}
              {canDeleteRecords && (
                <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-rose-950 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>{isAr ? 'منطقة الخطر: حذف العميل من النظام' : 'Danger Zone: Delete Client'}</span>
                    </h4>
                    <p className="text-[11px] text-rose-800">
                      {isAr
                        ? 'سيؤدي حذف العميل إلى إزالة ملفه بالكامل من قسم العملاء ومن قاعدة البيانات السحابية.'
                        : 'Permanently removes this client profile from the CRM dashboard and Supabase database.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حذف هذا العميل نهائياً' : 'Delete Client Permanently'}</span>
                  </button>
                </div>
              )}
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
                    setReelStages(buildReelWorkflowStages(targetReels, [], 0));
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
          {/* TAB: AD SPEND WALLET & ACCOUNTANT APPROVALS (MEDIA BUYER / ACCOUNTANT / ADMIN) */}
          {canAccessAdWallet && activeTab === 'ad_wallet' && (
            <ClientAdWalletPanel
              client={client}
              canManageAdWallet={canManageAdWallet}
              canApproveAdWallet={canApproveAdWallet}
              actorName={actorName}
              isAr={isAr}
              onNotify={(msg) => showNotification(msg)}
              onCollectPendingInvoiceCredit={
                canViewFinancials ? handleCollectAndDepositAdCredit : undefined
              }
            />
          )}

          {canViewFinancials && activeTab === 'billing' && (
            <div className="space-y-4">
              {canApproveAdWallet && pendingAdWalletCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-amber-950 font-black">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                    <span>
                      {isAr
                        ? `يوجد ${pendingAdWalletCount} طلب معلق بمحفظة الإعلانات بانتظار موافقة المحاسب (شحن رصيد / مصروف إعلاني).`
                        : `${pendingAdWalletCount} pending Ad Wallet request(s) awaiting Accountant approval.`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ad_wallet')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black cursor-pointer transition-colors"
                  >
                    {isAr ? 'مراجعة والموافقة الآن' : 'Review & Approve'}
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{isAr ? 'إدارة التعاقد والدورة المالية' : 'Contract & Retainer Billing'}</h4>
                  <p className="text-xs text-slate-500">{isAr ? 'تعديل قيمة العقد، مواعيد التجديد، ودورة الدفعات، وإصدار الفواتير الرسمية.' : 'Adjust retainer value, renewal cycles, and export official client invoices.'}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenCloseCycleModal}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-700"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'إغلاق الشهر وبدء دورة جديدة' : 'Close Month & New Cycle'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsStatementModalOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-emerald-400/30"
                  >
                    <FileText className="w-4 h-4 text-emerald-200" />
                    <span>{isAr ? 'كشف حساب عن فترة (PDF)' : 'Statement of Account (PDF)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-blue-400/30"
                  >
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span>{isAr ? 'إصدار الفاتورة وبيان الحساب (PDF)' : 'Generate Invoice Statement (PDF)'}</span>
                  </button>
                </div>
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
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'تاريخ بداية دورة التشغيل الحالية:' : 'Current Cycle Start Date:'}</label>
                    <input
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{isAr ? 'تاريخ نهاية / تجديد الدورة:' : 'Cycle End / Renewal Date:'}</label>
                    <input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                {/* Active Cycle & Invoice Period Live Preview Banner */}
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 block">
                        {isAr ? 'دورة التشغيل النشطة حالياً:' : 'Active Operating Cycle:'}
                      </span>
                      <span className="font-black text-indigo-950">{currentCycleBadge}</span>
                    </div>
                  </div>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200/90 text-[11px]">
                    <span className="text-slate-500 font-bold">{isAr ? 'يظهر في الفاتورة: ' : 'On Invoice: '}</span>
                    <span className="font-black text-blue-700">{currentInvoicePeriodLabel}</span>
                  </div>
                </div>

                {/* Ad Spend Credit Input for Invoicing */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>{isAr ? 'إضافة رصيد إعلاني ممول للفاتورة (Ad Spend Credit):' : 'Add Ad Campaign Spend Credit to Invoice:'}</span>
                      </label>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                        {isAr ? 'ينزل تلقائياً في حساب العميل فور التحصيل' : 'Auto-credited to wallet once paid'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={invoiceAdCredit || ''}
                          placeholder={isAr ? 'اكتب مبلغ الرصيد الإعلاني (مثال: 10000)...' : 'Enter ad credit amount (e.g. 10000)...'}
                          onChange={(e) => setInvoiceAdCredit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-14"
                        />
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                          {isAr ? 'ج.م' : 'EGP'}
                        </span>
                      </div>

                      {/* Quick preset chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setInvoiceAdCredit((prev) => prev + 5000)}
                          className="px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        >
                          +5,000
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceAdCredit((prev) => prev + 10000)}
                          className="px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        >
                          +10,000
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceAdCredit((prev) => prev + 20000)}
                          className="px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        >
                          +20,000
                        </button>
                        {invoiceAdCredit > 0 && (
                          <button
                            type="button"
                            onClick={() => setInvoiceAdCredit(0)}
                            className="px-2 py-1.5 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                            title={isAr ? 'تفريغ الرصيد الإعلاني' : 'Clear ad credit'}
                          >
                            {isAr ? 'إلغاء' : 'Clear'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isAr
                        ? '💡 يُدرج هذا المبلغ كبند مستقل في الفاتورة الرسمية (ميزانية إعلانات ممولة)، وعند تحصيل الفاتورة سيتم إيداعه فورياً في رصيد العميل الإعلاني المتاح.'
                        : '💡 This amount will be added as an itemized ad campaign budget in the invoice. Once collected, it is deposited into the client ad balance.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Ad Credit Wallet Card */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-blue-800/80 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black text-white">
                          {isAr ? 'محفظة الرصيد الإعلاني للعميل (Ad Credit Wallet)' : 'Client Ad Campaign Wallet'}
                        </h5>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {isAr ? 'حساب إعلاني نشط' : 'Active Wallet'}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200/80">
                        {isAr ? 'إدارة الميزانيات الممولة المودعة، التحصيل، ومتابعة رصيد الحملات الإعلانية.' : 'Manage deposited ad budgets, invoice collections, and campaign spends.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Collect & Deposit or Deduct Spend */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    {invoiceAdCredit > 0 && paymentStatus !== 'paid' && (
                      <button
                        type="button"
                        onClick={handleCollectAndDepositAdCredit}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                        title={isAr ? 'تأكيد تحصيل الفاتورة وإيداع الرصيد الإعلاني فورياً' : 'Collect invoice and deposit ad credit now'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? `تحصيل وإيداع (${invoiceAdCredit.toLocaleString()} ج.م)` : `Deposit Ad Credit`}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsDeductingSpendOpen(!isDeductingSpendOpen)}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isAr ? 'تسجيل صرف إعلاني' : 'Log Ad Spend'}</span>
                    </button>
                  </div>
                </div>

                {/* 3 Wallet Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  {/* Metric 1: Available Ad Balance */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-blue-500/30">
                    <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                      {isAr ? 'الرصيد الإعلاني المتاح حالياً:' : 'Available Ad Balance:'}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
                        {adCreditBalance.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-emerald-300/80">{isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {adCreditBalance > 0 
                        ? (isAr ? '✅ جاهز لتمويل حملات Meta و Google و TikTok' : 'Ready for active campaigns')
                        : (isAr ? '⚠️ لا يوجد رصيد إعلاني متاح حالياً' : 'Zero available balance')}
                    </span>
                  </div>

                  {/* Metric 2: Pending Ad Credit in Invoice */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                      {isAr ? 'رصيد الفاتورة قيد التحصيل:' : 'Pending Invoice Ad Credit:'}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xl sm:text-2xl font-black tabular-nums ${invoiceAdCredit > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {invoiceAdCredit.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {invoiceAdCredit > 0 
                        ? (isAr ? '⏳ سينزل في الحساب فور تحصيل الفاتورة' : 'Deposited upon payment collection')
                        : (isAr ? 'لا توجد مبالغ إعلانية معلقة بالفاتورة' : 'No pending ad credit')}
                    </span>
                  </div>

                  {/* Metric 3: Total Funded vs Total Spent */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                      {isAr ? 'حركة المحفظة الإجمالية:' : 'Lifetime Ad Spending:'}
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>{isAr ? 'إجمالي المشحون:' : 'Total Funded:'}</span>
                        <span className="font-bold text-white tabular-nums">{adCreditFundedTotal.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isAr ? 'إجمالي المصروف:' : 'Total Spent:'}</span>
                        <span className="font-bold text-rose-300 tabular-nums">{adCreditSpentTotal.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deduct Spend Inline Form (Collapsible) */}
                {isDeductingSpendOpen && (
                  <form onSubmit={handleDeductAdSpend} className="mt-3.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تسجيل خصم ميزانية مصروفة في الحملات الإعلانية:' : 'Deduct Campaign Ad Spend:'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsDeductingSpendOpen(false)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">{isAr ? 'المبلغ المصروف:' : 'Amount Spent:'}</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max={adCreditBalance}
                            required
                            value={spendAmountInput}
                            onChange={(e) => setSpendAmountInput(e.target.value)}
                            placeholder={isAr ? 'المبلغ بالجنيه...' : 'Amount in EGP...'}
                            className="w-full text-xs font-bold p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                          <span className="absolute left-2.5 top-2 text-[11px] text-slate-400">ج.م</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">{isAr ? 'المنصة الإعلانية:' : 'Platform:'}</label>
                        <select
                          value={spendCampaignPlatform}
                          onChange={(e) => setSpendCampaignPlatform(e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-pointer"
                        >
                          <option value="Meta Ads (Facebook & Instagram)">Meta Ads (Facebook & Instagram)</option>
                          <option value="TikTok Ads">TikTok Ads</option>
                          <option value="Google Ads & YouTube">Google Ads & YouTube</option>
                          <option value="Snapchat Ads">Snapchat Ads</option>
                          <option value="LinkedIn Ads">LinkedIn Ads</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsDeductingSpendOpen(false)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {isAr ? 'خصم وتحديث الرصيد' : 'Deduct & Update'}
                      </button>
                    </div>
                  </form>
                )}
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
                          {isAr ? 'وثيقة استحقاق باقة التسويق ورصيد الإعلانات' : 'Digital Marketing & Ad Spend Invoice'}
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

                  {/* Key Pillars: Package Title, Deliverables, Retainer, Ad Credit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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
                        {isAr ? '+ إدارة الحملات والتقارير' : '+ Ads management & reports'}
                      </p>
                    </div>

                    {/* 3. Retainer Cost */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isAr ? 'اشتراك إدارة الباقة:' : 'Retainer Management Fee:'}</span>
                      </div>
                      <p className="font-black text-emerald-400 text-sm">
                        {budget}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {billingCycle === 'monthly' ? (isAr ? 'دورة شهرية' : 'Monthly') : billingCycle === 'quarterly' ? (isAr ? 'دورة ربع سنوية' : 'Quarterly') : (isAr ? 'دورة سنوية' : 'Annual')}
                      </p>
                    </div>

                    {/* 4. Added Ad Spend Credit */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-500/40">
                      <div className="text-[11px] text-blue-300 mb-1 flex items-center gap-1.5 font-bold">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isAr ? 'الرصيد الإعلاني المضاف:' : 'Added Ad Spend Credit:'}</span>
                      </div>
                      <p className="font-black text-blue-300 text-sm tabular-nums">
                        {invoiceAdCredit > 0 ? `+${invoiceAdCredit.toLocaleString()} ج.م` : (isAr ? '0 ج.م' : '0 EGP')}
                      </p>
                      <p className="text-[10px] text-blue-200/70 mt-0.5">
                        {invoiceAdCredit > 0 ? (isAr ? 'مخصص بالكامل للحملات' : 'Dedicated campaign spend') : (isAr ? 'لا يوجد رصيد إعلاني مضاف' : 'No ad credit added')}
                      </p>
                    </div>
                  </div>

                  {/* Combined Grand Total Due Banner */}
                  <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-800/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-slate-300">
                      {isAr ? 'المبلغ الإجمالي المستحق بالفاتورة (اشتراك الباقة + الرصيد الإعلاني):' : 'Total Invoice Due (Retainer + Ad Credit):'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 tabular-nums">
                      {(() => {
                        const parsedRet = parseInvoiceAmount(budget);
                        const effRetainer = parsedRet > 0 ? parsedRet : (client.retainerAmount || 0);
                        const combined = effRetainer + (invoiceAdCredit || 0);
                        return combined > 0
                          ? `${combined.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
                          : budget;
                      })()}
                    </span>
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

              {/* ================================================================= */}
              {/* PAST MONTHLY CYCLES ARCHIVE (سجل الدورات الشهرية المغلقة)         */}
              {/* ================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                      <History className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900">
                        {isAr ? 'سجل الدورات الشهرية السابقة (أرشيف الإغلاق)' : 'Past Monthly Cycles Archive'}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {isAr
                          ? 'توثيق دائم لنسب إنجاز المخرجات والرصيد الإعلاني المرحّل عن كل شهر منتهٍ.'
                          : 'Permanent snapshot of deliverables completion and carried-over ad credit per closed cycle.'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                    {resolvedCycleHistory.length} {isAr ? 'دورة مغلقة' : 'closed cycles'}
                  </span>
                </div>

                {resolvedCycleHistory.length === 0 ? (
                  <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1.5">
                    <p className="font-bold text-slate-600">
                      {isAr ? 'لا توجد دورات شهرية مغلقة لهذا العميل بعد.' : 'No closed monthly cycles recorded yet.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAr
                        ? 'عند انتهاء الشهر اضغط «إغلاق الشهر وبدء دورة جديدة» لحفظ تقرير الشهر وتصفير التاسكات والمخرجات تلقائياً.'
                        : 'Click "Close Month & New Cycle" at month-end to archive performance and start fresh.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {resolvedCycleHistory.map((cyc) => {
                      const totalDel = cyc.postsDelivered + cyc.reelsDelivered + cyc.storiesDelivered;
                      const totalTgt = cyc.postsTarget + cyc.reelsTarget + cyc.storiesTarget;
                      return (
                        <div
                          key={cyc.id}
                          className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-slate-900">
                                {cyc.cycleLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {cyc.startDate} → {cyc.endDate}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  cyc.paymentStatus === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : cyc.paymentStatus === 'overdue'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {cyc.paymentStatus === 'paid'
                                  ? isAr
                                    ? 'مدفوع بالكامل'
                                    : 'Paid'
                                  : cyc.paymentStatus === 'overdue'
                                  ? isAr
                                    ? 'متأخر'
                                    : 'Overdue'
                                  : isAr
                                  ? 'قيد التحصيل'
                                  : 'Pending'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 flex items-center gap-2.5 flex-wrap">
                              <span>
                                {isAr ? 'المخرجات:' : 'Deliverables:'}{' '}
                                <strong className="text-slate-900">
                                  {totalDel}/{totalTgt} ({cyc.deliverablesCompletionRate}%)
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                {isAr ? 'مراحل التنفيذ:' : 'Stages:'}{' '}
                                <strong className="text-slate-900">
                                  {cyc.workflowCompletedStages}/{cyc.workflowTotalStages}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                {isAr ? 'رصيد إعلاني مرحّل:' : 'Ad Credit Carried:'}{' '}
                                <strong className="text-blue-700 tabular-nums">
                                  {cyc.adCreditBalanceCarriedOver.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                                </strong>
                              </span>
                            </div>

                            {cyc.notes && (
                              <p className="text-[11px] text-slate-500 italic">{cyc.notes}</p>
                            )}
                          </div>

                          <div className="text-end shrink-0">
                            <span className="text-xs font-black text-slate-900 tabular-nums block">
                              {cyc.retainerAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            </span>
                            {cyc.invoiceNumber && (
                              <span className="text-[10px] font-mono text-blue-700">
                                {cyc.invoiceNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CLIENT STATEMENT OF ACCOUNT & INVOICES ARCHIVE */}
          {canViewFinancials && activeTab === 'statement' && client && (
            <div className="space-y-4">
              {/* Header Box */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-4 rounded-2xl text-white flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      {isAr ? 'كشف الحساب المالي وفواتير العميل' : 'Statement of Account & Invoices'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isAr 
                      ? 'متابعة الفواتير المصدرة لحساب العميل، المسدد منها، واستخراج كشف حساب رسمي معتمد لأي فترة.' 
                      : 'Track client invoices, payments, and export verified ledger statements for any period.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsStatementModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isAr ? 'استخراج كشف حساب مالي (PDF)' : 'Statement (PDF)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إصدار فاتورة جديدة' : 'New Invoice'}</span>
                  </button>
                </div>
              </div>

              {/* Client Invoices List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'الفواتير المصدرة لحساب هذا العميل:' : 'Client Issued Invoices:'}</span>
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    {((data.invoices || []).filter(inv => inv.clientId === client.id)).length} {isAr ? 'فاتورة' : 'invoices'}
                  </span>
                </div>

                {((data.invoices || []).filter(inv => inv.clientId === client.id)).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">{isAr ? 'لم يتم إصدار فواتير سابقة لهذا العميل بعد.' : 'No invoices issued for this client yet.'}</p>
                    <button
                      type="button"
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? 'إصدار أول فاتورة الآن' : 'Issue First Invoice'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(data.invoices || [])
                      .filter(inv => inv.clientId === client.id)
                      .map((inv) => {
                        const isPaid = inv.paymentStatus === 'paid';
                        return (
                          <div
                            key={inv.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 flex-wrap shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  {inv.invoiceNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-800">{inv.packageName}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {isPaid ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'قيد التحصيل' : 'Pending')}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>{isAr ? 'تاريخ الإصدار:' : 'Issued:'} {inv.issueDate}</span>
                                {inv.dueDate && (
                                  <>
                                    <span>•</span>
                                    <span>{isAr ? 'الاستحقاق:' : 'Due:'} {inv.dueDate}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-left font-mono">
                                <div className="text-sm font-black text-slate-900">
                                  {inv.grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                                </div>
                                {inv.adCreditAmount ? (
                                  <div className="text-[10px] text-purple-700 font-bold">
                                    {isAr ? `(تشمل ${inv.adCreditAmount.toLocaleString()} إعلانات)` : `(incl. ${inv.adCreditAmount.toLocaleString()} ads)`}
                                  </div>
                                ) : null}
                              </div>

                              <button
                                type="button"
                                onClick={async () => {
                                  await generateClientInvoicePdf({
                                    client,
                                    packageName: inv.packageName,
                                    totalCost: `${inv.retainerAmount.toLocaleString()} ج.م`,
                                    adCreditAmount: inv.adCreditAmount || 0,
                                    invoiceNumber: inv.invoiceNumber,
                                    isAr,
                                  });
                                  showNotification(isAr ? 'تم تحميل الفاتورة بنجاح!' : 'Invoice downloaded!');
                                }}
                                className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
                                title={isAr ? 'تحميل الفاتورة PDF' : 'Download PDF'}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOG & INTERACTIONS TIMELINE */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'سجل النشاط وتاريخ التفاعلات والحالات' : 'Activity Log, Status History & Interactions'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr
                    ? 'سجل زمني كامل لتغييرات الحالة، المكالمات، محادثات الواتساب، الفواتير، المراحل التنفيذية وملاحظات الفريق.'
                    : 'Complete chronological log of status transitions, calls, WhatsApp chats, invoices, workflow updates, and notes.'}
                </p>
              </div>

              <ActivityTimelinePanel
                entries={client.clientNotes || []}
                isAr={isAr}
                onAddEntry={handleAddActivityEntry}
                createdAt={client.createdAt}
                initialNotes={client.notes}
                maxHeightClass="max-h-96"
              />
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

            {canEditClients && (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
              </button>
            )}
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
          contractPeriod={currentInvoicePeriodLabel}
          renewalDate={renewalDate}
          paymentStatus="pending"
          targetPosts={targetPosts}
          targetReels={targetReels}
          targetStories={targetStories}
          adCreditAmount={invoiceAdCredit}
          isAr={isAr}
        />
      )}

      {/* Official Account Statement Modal (كشف حساب مالي عن فترة معينة) */}
      {isStatementModalOpen && client && (
        <AccountStatementModal
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          initialClient={client}
          isAr={isAr}
        />
      )}

      {/* Close Monthly Cycle & Start New Cycle Confirmation Modal */}
      {isCloseCycleModalOpen && client && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsCloseCycleModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-start animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {isAr ? 'إغلاق الشهر الحالي وبدء دورة جديدة' : 'Close Current Month & Start New Cycle'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {client.company || client.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCloseCycleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCloseCycle} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Closing Cycle Snapshot Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-slate-700">
                    {isAr ? 'الدورة التي سيتم إغلاقها وأرشفتها:' : 'Cycle being archived:'}
                  </span>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-white inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    <span>{currentCycleBadge}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {isAr ? 'المخرجات المسلمة' : 'Deliverables'}
                    </span>
                    <span className="font-black text-slate-900 tabular-nums">
                      {totalDeliveredAssets} / {totalTargetAssets} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {isAr ? 'مراحل العمل' : 'Stages'}
                    </span>
                    <span className="font-black text-indigo-700 tabular-nums">
                      {completedStagesCount} / {workflowStages.length}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {isAr ? 'رصيد إعلاني مرحّل' : 'Ad Credit Kept'}
                    </span>
                    <span className="font-black text-emerald-700 tabular-nums">
                      {adCreditBalance.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr
                    ? '• سيتم حفظ هذا التقرير في «سجل الدورات الشهرية»، وتصفير عدادات البوستات والريلز ومراحل التايم لاين للدورة الجديدة، مع الإبقاء على الرصيد الإعلاني المتبقي كما هو.'
                    : '• This snapshot is saved permanently, operational deliverables & workflow stages reset to 0/pending, and remaining ad credit carries over untouched.'}
                </p>
              </div>

              {/* Next Operating Cycle Month & Year Picker */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>
                      {billingCycle === 'quarterly'
                        ? isAr
                          ? 'بداية أشهر الدورة الربع سنوية القادمة:'
                          : 'Next Quarterly Cycle Starting Month:'
                        : isAr
                        ? 'اختر شهر دورة التشغيل القادمة:'
                        : 'Select Next Operating Cycle Month:'}
                    </span>
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200">
                    {billingCycle === 'quarterly'
                      ? isAr ? 'ربع سنوي (3 شهور)' : 'Quarterly (3 mo)'
                      : billingCycle === 'annual'
                      ? isAr ? 'سنوي (12 شهر)' : 'Annual (12 mo)'
                      : isAr ? 'شهري' : 'Monthly'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={nextCycleMonth}
                    onChange={(e) =>
                      handleSelectNextCycleMonthYear(nextCycleYear, parseInt(e.target.value, 10))
                    }
                    className="w-full text-xs font-black p-2.5 bg-white border border-indigo-300 rounded-xl text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {monthNamesList.map((mName, idx) => (
                      <option key={mName} value={idx}>
                        {mName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={nextCycleYear}
                    onChange={(e) =>
                      handleSelectNextCycleMonthYear(parseInt(e.target.value, 10), nextCycleMonth)
                    }
                    className="w-full text-xs font-black p-2.5 bg-white border border-indigo-300 rounded-xl text-slate-900 font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {selectableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-indigo-200/90 text-[11px] flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-slate-500 font-bold">
                      {isAr ? 'مسمى الدورة الجديدة:' : 'New Cycle Name:'}
                    </span>
                    <span className="font-black text-indigo-900">{nextCyclePreviewBadge}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-slate-500 font-bold">
                      {isAr ? 'سيُكتب في فاتورة هذه الدورة:' : 'Invoice Period Label:'}
                    </span>
                    <span className="font-black text-blue-700">{nextCycleInvoicePeriodPreview}</span>
                  </div>
                </div>
              </div>

              {/* Exact Cycle Start & End Dates (Auto-filled from Month picker, still editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'تاريخ بداية الدورة الجديدة:' : 'New Cycle Start Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={nextCycleStartDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNextCycleStartDate(val);
                      const parsed = parseYearMonth(val);
                      setNextCycleYear(parsed.year);
                      setNextCycleMonth(parsed.monthIndex);
                    }}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'تاريخ نهاية / تجديد الدورة:' : 'Cycle End / Renewal Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={nextCycleRenewalDate}
                    onChange={(e) => setNextCycleRenewalDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Optional Ad Credit for Upcoming Month */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'رصيد إعلاني إضافي مخطط للدورة الجديدة (اختياري):' : 'Planned Ad Credit for New Cycle (Optional):'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={nextCycleAdCredit || ''}
                  onChange={(e) => setNextCycleAdCredit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Optional Closing Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'ملاحظة إغلاق الدورة (اختياري):' : 'Cycle Closing Note (Optional):'}
                </label>
                <input
                  type="text"
                  value={closeCycleNotes}
                  onChange={(e) => setCloseCycleNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: تم تسليم كامل الخطة وزيادة التفاعل 40%...' : 'e.g. All deliverables completed on schedule...'}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Flexible Invoicing Option */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issueNextInvoiceNow}
                    onChange={(e) => setIssueNextInvoiceNow(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-black text-blue-950 block">
                      {isAr ? 'إصدار فاتورة وإدراجها في الأرشيف الآن' : 'Issue and archive invoice right now'}
                    </span>
                    <span className="text-[11px] text-blue-700 block leading-relaxed">
                      {isAr
                        ? 'اترك هذا الخيار غير محدد إذا كنت تفضل إصدار الفاتورة لاحقاً في أي وقت.'
                        : 'Leave unchecked to issue the invoice whenever you are ready.'}
                    </span>
                  </div>
                </label>

                {issueNextInvoiceNow && (
                  <div className="pt-2 border-t border-blue-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-900 block">
                      {isAr ? 'الفاتورة الصادرة الآن عن أي دورة؟ (ستُكتب تحت تاريخ الإصدار):' : 'Invoice billing period:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCloseInvoiceTargetCycle('closed')}
                        className={`p-2 rounded-xl border text-start text-[11px] transition-all cursor-pointer ${
                          closeInvoiceTargetCycle === 'closed'
                            ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                            : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50 font-bold'
                        }`}
                      >
                        <span className="block text-[10px] opacity-80">
                          {isAr ? 'الدورة المنتهية للتو:' : 'Just Finished Cycle:'}
                        </span>
                        <span>{currentInvoicePeriodLabel}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCloseInvoiceTargetCycle('new')}
                        className={`p-2 rounded-xl border text-start text-[11px] transition-all cursor-pointer ${
                          closeInvoiceTargetCycle === 'new'
                            ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                            : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50 font-bold'
                        }`}
                      >
                        <span className="block text-[10px] opacity-80">
                          {isAr ? 'الدورة الجديدة (مقدماً):' : 'Upcoming Cycle:'}
                        </span>
                        <span>{nextCycleInvoicePeriodPreview}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCloseCycleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تأكيد إغلاق الشهر وبدء دورة جديدة' : 'Confirm & Start New Cycle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
