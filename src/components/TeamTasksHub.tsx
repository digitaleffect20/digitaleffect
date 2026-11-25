import React, { useMemo, useState } from 'react';
import {
  Users,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Film,
  Layers,
  Plus,
  Trash2,
  Search,
  UserPlus,
  ExternalLink,
  Check,
  Filter,
  Shield,
  Lock,
} from 'lucide-react';
import { useAgencyData, DEFAULT_AGENCY_TEAM_MEMBERS } from '../context/AgencyDataContext';
import { ClientAccountNote, Inquiry, PortalRole, TeamMemberPermissions } from '../types';
import {
  DEFAULT_WORKFLOW_STAGES,
  buildReelWorkflowStages,
  checkSequentialStageToggle,
  formatSequentialBlockMessage,
  formatStageDisplayTitle,
  SequentialStageCheck,
} from './ClientWorkflowStepper';
import { getClientDeliverableTargets, getClientOverdueStatus } from '../utils/workflowUtils';

interface TeamTasksHubProps {
  clients: Inquiry[];
  isAr?: boolean;
  userRole?: PortalRole;
  permissions?: TeamMemberPermissions;
  currentMemberName?: string;
  onOpenTeamAccounts?: () => void;
  onOpenClient: (client: Inquiry) => void;
}

interface FlattenedTaskItem {
  key: string;
  client: Inquiry;
  track: 'main' | 'reel' | 'carryover_reel';
  stageId: string;
  stageTitle: string;
  displayLabel: string;
  originCycleLabel?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignee?: string;
  completedAt?: string;
  isOverdue: boolean;
  overdueBadge?: string;
  reelIndex?: number;
  seqCheck: SequentialStageCheck;
}

export const TeamTasksHub: React.FC<TeamTasksHubProps> = ({
  clients,
  isAr = true,
  userRole = 'admin',
  permissions,
  currentMemberName,
  onOpenTeamAccounts,
  onOpenClient,
}) => {
  const { data, updateInquiry, addTeamMember, deleteTeamMember } = useAgencyData();

  const canManageTeam = permissions ? permissions.canManageTeam : userRole === 'admin';
  const canAssignTasks = permissions ? Boolean(permissions.canAssignTasks) : userRole === 'admin';
  const allowedWorkflowStages = permissions?.allowedWorkflowStages;
  const canUpdateReelsTrack = permissions ? permissions.canUpdateReelsTrack !== false : true;
  const onlyAssigned = Boolean(permissions?.onlyAssignedTasks && currentMemberName?.trim());
  const normalizedMemberName = (currentMemberName || '').trim().toLowerCase();

  const teamMembers = useMemo(() => {
    return Array.isArray(data.teamMembers) && data.teamMembers.length > 0
      ? data.teamMembers
      : DEFAULT_AGENCY_TEAM_MEMBERS;
  }, [data.teamMembers]);

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<
    'open' | 'in_progress' | 'overdue' | 'pending' | 'completed' | 'all'
  >('open');
  const [trackFilter, setTrackFilter] = useState<'all' | 'main' | 'reel' | 'carryover_reel'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add Team Member form
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  // Flatten all workflow stages & reel stages across all active contracted clients
  const allTasks = useMemo<FlattenedTaskItem[]>(() => {
    const items: FlattenedTaskItem[] = [];

    clients.forEach((client) => {
      const overdue = getClientOverdueStatus(client, isAr);
      const targets = getClientDeliverableTargets(client, data.packages);

      const mainStages =
        client.workflowStages && client.workflowStages.length === 5
          ? client.workflowStages
          : DEFAULT_WORKFLOW_STAGES;

      mainStages.forEach((st) => {
        items.push({
          key: `${client.id}__main__${st.id}`,
          client,
          track: 'main',
          stageId: st.id,
          stageTitle: st.title,
          displayLabel: st.title,
          status: st.status,
          assignee: st.assignee,
          completedAt: st.completedAt,
          isOverdue: overdue.isOverdue && st.status !== 'completed',
          overdueBadge: isAr ? overdue.badgeTextAr : overdue.badgeTextEn,
          seqCheck: checkSequentialStageToggle(mainStages, st.id),
        });
      });

      const reelStages = buildReelWorkflowStages(
        targets.reelsTarget,
        client.reelStages,
        client.reelsDelivered ?? 0
      );

      reelStages.forEach((r, idx) => {
        items.push({
          key: `${client.id}__reel__${r.id}`,
          client,
          track: 'reel',
          stageId: r.id,
          stageTitle: r.title,
          displayLabel: isAr ? `ريلز ${idx + 1}` : `Reel ${idx + 1}`,
          status: r.status,
          assignee: r.assignee,
          completedAt: r.completedAt,
          isOverdue: overdue.isOverdue && r.status !== 'completed',
          overdueBadge: isAr ? overdue.badgeTextAr : overdue.badgeTextEn,
          reelIndex: idx + 1,
          seqCheck: checkSequentialStageToggle(reelStages, r.id),
        });
      });

      const carriedOver = client.carriedOverReels || [];
      carriedOver.forEach((r, idx) => {
        items.push({
          key: `${client.id}__carryover__${r.id}`,
          client,
          track: 'carryover_reel',
          stageId: r.id,
          stageTitle: r.title,
          displayLabel: formatStageDisplayTitle(r.title, isAr),
          originCycleLabel: r.originCycleLabel,
          status: r.status,
          assignee: r.assignee,
          completedAt: r.completedAt,
          isOverdue: overdue.isOverdue && r.status !== 'completed',
          overdueBadge: isAr ? overdue.badgeTextAr : overdue.badgeTextEn,
          reelIndex: idx + 1,
          seqCheck: { allowed: true },
        });
      });
    });

    // Sort: Overdue first, then in_progress, then pending, then completed
    const rank = (t: FlattenedTaskItem) => {
      if (t.isOverdue && t.status !== 'completed') return 0;
      if (t.status === 'in_progress') return 1;
      if (t.status === 'pending') return 2;
      return 3;
    };

    const stageScoped = items.filter((item) => {
      if (item.track === 'main' && allowedWorkflowStages) {
        return allowedWorkflowStages.includes(item.stageId as any);
      }
      if ((item.track === 'reel' || item.track === 'carryover_reel') && !canUpdateReelsTrack) {
        return false;
      }
      return true;
    });

    const scoped = onlyAssigned
      ? stageScoped.filter(
          (item) => (item.assignee || '').trim().toLowerCase() === normalizedMemberName
        )
      : stageScoped;

    return scoped.sort((a, b) => rank(a) - rank(b));
  }, [
    clients,
    data.packages,
    isAr,
    onlyAssigned,
    normalizedMemberName,
    allowedWorkflowStages,
    canUpdateReelsTrack,
  ]);

  // Metrics
  const metrics = useMemo(() => {
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
    const overdue = allTasks.filter((t) => t.isOverdue && t.status !== 'completed').length;
    const activeReels = allTasks.filter(
      (t) => (t.track === 'reel' || t.track === 'carryover_reel') && t.status !== 'completed'
    ).length;
    const completed = allTasks.filter((t) => t.status === 'completed').length;
    return { inProgress, overdue, activeReels, completed, total: allTasks.length };
  }, [allTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (trackFilter !== 'all' && t.track !== trackFilter) return false;
      if (statusFilter === 'open' && t.status === 'completed') return false;
      if (statusFilter === 'in_progress' && t.status !== 'in_progress') return false;
      if (statusFilter === 'pending' && t.status !== 'pending') return false;
      if (statusFilter === 'completed' && t.status !== 'completed') return false;
      if (statusFilter === 'overdue' && !t.isOverdue) return false;

      if (!onlyAssigned) {
        if (assigneeFilter === 'unassigned') {
          if (t.assignee) return false;
        } else if (assigneeFilter !== 'all') {
          if (t.assignee !== assigneeFilter) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          (t.client.company || '').toLowerCase().includes(q) ||
          t.client.name.toLowerCase().includes(q) ||
          t.displayLabel.toLowerCase().includes(q) ||
          (t.assignee || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [allTasks, trackFilter, statusFilter, assigneeFilter, searchQuery, onlyAssigned]);

  // Workload count per team member (open tasks)
  const memberWorkloadMap = useMemo(() => {
    const counts = new Map<string, number>();
    allTasks.forEach((t) => {
      if (t.status !== 'completed' && t.assignee) {
        counts.set(t.assignee, (counts.get(t.assignee) || 0) + 1);
      }
    });
    return counts;
  }, [allTasks]);

  // Toggle task status inline (auto-stamps logged-in member name when canAssignTasks is false)
  const handleToggleTaskStatus = (task: FlattenedTaskItem) => {
    const { client, track, stageId, displayLabel } = task;
    if (track === 'main' && allowedWorkflowStages && !allowedWorkflowStages.includes(stageId as any)) {
      return;
    }
    if ((track === 'reel' || track === 'carryover_reel') && !canUpdateReelsTrack) {
      return;
    }
    if (!task.seqCheck.allowed) {
      showToast(formatSequentialBlockMessage(task.seqCheck, displayLabel, isAr));
      return;
    }
    const nextStatus: 'pending' | 'in_progress' | 'completed' =
      task.status === 'pending'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'completed'
        : 'pending';
    const completedAt = nextStatus === 'pending' ? undefined : new Date().toISOString();
    const memberStamp = currentMemberName?.trim();
    const actorLabel = memberStamp || task.assignee || (isAr ? 'فريق التشغيل' : 'Operations');
    const statusLabel =
      nextStatus === 'completed'
        ? isAr
          ? 'مكتمل'
          : 'Completed'
        : nextStatus === 'in_progress'
        ? isAr
          ? 'قيد التنفيذ'
          : 'In Progress'
        : isAr
        ? 'في الانتظار'
        : 'Pending';

    if (track === 'main') {
      const base =
        client.workflowStages && client.workflowStages.length === 5
          ? client.workflowStages
          : DEFAULT_WORKFLOW_STAGES;
      const updatedStages = base.map((s) => {
        if (s.id !== stageId) return s;
        const nextAssignee =
          !canAssignTasks && memberStamp
            ? nextStatus === 'pending'
              ? undefined
              : memberStamp
            : s.assignee || (nextStatus !== 'pending' && memberStamp ? memberStamp : s.assignee);
        return { ...s, status: nextStatus, completedAt, assignee: nextAssignee };
      });
      const note: ClientAccountNote = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        text: isAr
          ? `تحديث مهمة «${displayLabel}» من شاشة مهام الفريق إلى «${statusLabel}» بواسطة ${actorLabel}.`
          : `Updated task "${displayLabel}" to "${statusLabel}" by ${actorLabel}.`,
        createdAt: new Date().toISOString(),
        author: actorLabel,
        type: 'workflow',
        meta: { stageTitle: displayLabel, toStatus: statusLabel },
      };
      updateInquiry(client.id, {
        workflowStages: updatedStages,
        clientNotes: [note, ...(client.clientNotes || [])],
      });
    } else if (track === 'carryover_reel') {
      const baseCarried = client.carriedOverReels || [];
      const updatedCarried = baseCarried.map((r) => {
        if (r.id !== stageId) return r;
        const nextAssignee =
          !canAssignTasks && memberStamp
            ? nextStatus === 'pending'
              ? undefined
              : memberStamp
            : r.assignee || (nextStatus !== 'pending' && memberStamp ? memberStamp : r.assignee);
        return { ...r, status: nextStatus, completedAt, assignee: nextAssignee };
      });
      const completedCount = updatedCarried.filter((r) => r.status === 'completed').length;
      const originTag = task.originCycleLabel ? ` (${task.originCycleLabel})` : '';
      const note: ClientAccountNote = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        text: isAr
          ? `تحديث فيديو مرحل «${displayLabel}»${originTag} من شاشة مهام الفريق إلى «${statusLabel}» (${completedCount}/${updatedCarried.length}) بواسطة ${actorLabel}.`
          : `Updated carried-over video "${displayLabel}"${originTag} to "${statusLabel}" (${completedCount}/${updatedCarried.length}) by ${actorLabel}.`,
        createdAt: new Date().toISOString(),
        author: actorLabel,
        type: 'workflow',
        meta: { stageTitle: displayLabel, toStatus: statusLabel },
      };
      updateInquiry(client.id, {
        carriedOverReels: updatedCarried,
        clientNotes: [note, ...(client.clientNotes || [])],
      });
    } else {
      const targets = getClientDeliverableTargets(client, data.packages);
      const baseReels = buildReelWorkflowStages(
        targets.reelsTarget,
        client.reelStages,
        client.reelsDelivered ?? 0
      );
      const updatedReels = baseReels.map((r) => {
        if (r.id !== stageId) return r;
        const nextAssignee =
          !canAssignTasks && memberStamp
            ? nextStatus === 'pending'
              ? undefined
              : memberStamp
            : r.assignee || (nextStatus !== 'pending' && memberStamp ? memberStamp : r.assignee);
        return { ...r, status: nextStatus, completedAt, assignee: nextAssignee };
      });
      const syncedReelsDelivered = updatedReels.filter((r) => r.status === 'completed').length;
      const note: ClientAccountNote = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        text: isAr
          ? `تحديث «${displayLabel}» من شاشة مهام الفريق إلى «${statusLabel}» (${syncedReelsDelivered}/${updatedReels.length}) بواسطة ${actorLabel}.`
          : `Updated "${displayLabel}" to "${statusLabel}" (${syncedReelsDelivered}/${updatedReels.length}) by ${actorLabel}.`,
        createdAt: new Date().toISOString(),
        author: actorLabel,
        type: 'workflow',
        meta: { stageTitle: displayLabel, toStatus: statusLabel },
      };
      updateInquiry(client.id, {
        reelStages: updatedReels,
        reelsDelivered: syncedReelsDelivered,
        clientNotes: [note, ...(client.clientNotes || [])],
      });
    }

    showToast(
      isAr
        ? `تم تحديث «${displayLabel}» (${client.company || client.name}) إلى ${statusLabel}`
        : `Updated ${displayLabel} to ${statusLabel}`
    );
  };

  // Assign / reassign team member inline
  const handleAssignTask = (task: FlattenedTaskItem, assigneeName: string) => {
    const { client, track, stageId, displayLabel } = task;
    const cleanAssignee = assigneeName || undefined;

    if (track === 'main') {
      const base =
        client.workflowStages && client.workflowStages.length === 5
          ? client.workflowStages
          : DEFAULT_WORKFLOW_STAGES;
      const updatedStages = base.map((s) =>
        s.id === stageId ? { ...s, assignee: cleanAssignee } : s
      );
      updateInquiry(client.id, { workflowStages: updatedStages });
    } else if (track === 'carryover_reel') {
      const baseCarried = client.carriedOverReels || [];
      const updatedCarried = baseCarried.map((r) =>
        r.id === stageId ? { ...r, assignee: cleanAssignee } : r
      );
      updateInquiry(client.id, { carriedOverReels: updatedCarried });
    } else {
      const targets = getClientDeliverableTargets(client, data.packages);
      const baseReels = buildReelWorkflowStages(
        targets.reelsTarget,
        client.reelStages,
        client.reelsDelivered ?? 0
      );
      const updatedReels = baseReels.map((r) =>
        r.id === stageId ? { ...r, assignee: cleanAssignee } : r
      );
      updateInquiry(client.id, { reelStages: updatedReels });
    }

    showToast(
      cleanAssignee
        ? isAr
          ? `تم إسناد «${displayLabel}» إلى ${cleanAssignee}`
          : `Assigned ${displayLabel} to ${cleanAssignee}`
        : isAr
        ? `تم إلغاء تعيين المسؤول عن «${displayLabel}»`
        : `Unassigned ${displayLabel}`
    );
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addTeamMember({
      name: newMemberName.trim(),
      roleTitle: newMemberRole.trim() || (isAr ? 'عضو تشغيل' : 'Team Member'),
      active: true,
    });
    setNewMemberName('');
    setNewMemberRole('');
    setIsAddingMember(false);
    showToast(isAr ? 'تمت إضافة عضو الفريق بنجاح!' : 'Team member added!');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {isAr ? 'شاشة مهام اليوم وتوزيع فريق التشغيل' : "Today's Tasks & Team Workload"}
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'متابعة فورية لكل مراحل العمل والريلز الجارية أو المتأخرة عبر جميع العملاء وتوزيعها على أعضاء الفريق.'
              : 'Track all active, pending, and overdue workflow stages & reels across clients by assignee.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          {onOpenTeamAccounts && canManageTeam && (
            <button
              type="button"
              onClick={onOpenTeamAccounts}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{isAr ? 'إدارة حسابات وصلاحيات الفريق' : 'Manage Team Accounts & Access'}</span>
            </button>
          )}
          {canManageTeam && (
            <button
              type="button"
              onClick={() => setIsAddingMember((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAr ? 'إضافة اسم سريع' : 'Quick Add Member'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setStatusFilter('in_progress')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className={`text-[11px] font-bold block ${statusFilter === 'in_progress' ? 'text-blue-100' : 'text-slate-500'}`}>
            {isAr ? 'قيد التنفيذ الآن' : 'In Progress Now'}
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block">{metrics.inProgress}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('overdue')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'overdue'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-rose-50/70 border-rose-200 hover:border-rose-400 text-rose-900'
          }`}
        >
          <span className={`text-[11px] font-bold block ${statusFilter === 'overdue' ? 'text-rose-100' : 'text-rose-700'}`}>
            {isAr ? 'مهام متأخرة / عاجلة' : 'Overdue / Urgent'}
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block">{metrics.overdue}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTrackFilter('reel');
            setStatusFilter('open');
          }}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            trackFilter === 'reel' && statusFilter === 'open'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-purple-50/70 border-purple-200 hover:border-purple-400 text-purple-900'
          }`}
        >
          <span className={`text-[11px] font-bold block ${trackFilter === 'reel' && statusFilter === 'open' ? 'text-purple-100' : 'text-purple-700'}`}>
            {isAr ? 'ريلز مفتوحة للإنتاج' : 'Open Reels'}
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block">{metrics.activeReels}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 text-emerald-900'
          }`}
        >
          <span className={`text-[11px] font-bold block ${statusFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            {isAr ? 'مهام مكتملة هذا الشهر' : 'Completed Tasks'}
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block">{metrics.completed}</span>
        </button>
      </div>

      {/* Add Team Member Inline Form */}
      {isAddingMember && canManageTeam && (
        <form
          onSubmit={handleAddMemberSubmit}
          className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-indigo-950 block">
              {isAr ? 'اسم الموظف / المسؤول:' : 'Member Name:'}
            </label>
            <input
              type="text"
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder={isAr ? 'مثال: أحمد — مصمم جرافيك' : 'e.g. Ahmed - Designer'}
              className="w-full text-xs p-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:w-52 space-y-1">
            <label className="text-xs font-bold text-indigo-950 block">
              {isAr ? 'التخصص / الدور:' : 'Role Title:'}
            </label>
            <input
              type="text"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              placeholder={isAr ? 'مونتير / كاتب محتوى...' : 'Video Editor / Writer'}
              className="w-full text-xs p-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'حفظ' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingMember(false)}
              className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {/* Team Members Workload Filter Chips */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        {onlyAssigned ? (
          <div className="flex items-center justify-between gap-2 flex-wrap p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
            <span className="font-black text-indigo-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>
                {isAr
                  ? `عرض المهام المسندة إلى «${currentMemberName}» فقط (بناءً على صلاحيات حسابك)`
                  : `Showing only tasks assigned to "${currentMemberName}"`}
              </span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 font-black tabular-nums">
              {allTasks.filter((t) => t.status !== 'completed').length} {isAr ? 'مهمة مفتوحة' : 'open'}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'فلترة حسب المسؤول (حمل العمل الحالي):' : 'Filter by Assignee (Open Load):'}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'اضغط على أي اسم لعرض مهامه فقط' : 'Click any member to view their tasks'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setAssigneeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  assigneeFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isAr ? 'كل الفريق' : 'All Team'}
              </button>

              <button
                type="button"
                onClick={() => setAssigneeFilter('unassigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  assigneeFilter === 'unassigned'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {isAr ? 'غير معيّن بعد' : 'Unassigned'}
              </button>

              {teamMembers.map((member) => {
                const count = memberWorkloadMap.get(member.name) || 0;
                const isSelected = assigneeFilter === member.name;
                return (
                  <div
                    key={member.id}
                    className={`inline-flex items-center rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setAssigneeFilter(member.name)}
                      className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{member.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                    {canManageTeam && teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (assigneeFilter === member.name) setAssigneeFilter('all');
                          deleteTeamMember(member.id);
                        }}
                        className={`px-1.5 py-1.5 cursor-pointer transition-colors ${
                          isSelected ? 'text-indigo-200 hover:text-white' : 'text-slate-300 hover:text-rose-600'
                        }`}
                        title={isAr ? 'حذف العضو' : 'Remove member'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Search + Track + Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث باسم العميل، المرحلة، أو المسؤول...' : 'Search client, stage, or assignee...'}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'}`} />
          </div>

          <div className="md:col-span-4 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 cursor-pointer"
            >
              <option value="open">{isAr ? 'المهام المفتوحة (قيد التنفيذ + بالانتظار)' : 'Open Tasks'}</option>
              <option value="in_progress">{isAr ? 'قيد التنفيذ الآن فقط' : 'In Progress Only'}</option>
              <option value="overdue">{isAr ? 'المتأخرة والعاجلة فقط 🚨' : 'Overdue Only 🚨'}</option>
              <option value="pending">{isAr ? 'في الانتظار فقط' : 'Pending Only'}</option>
              <option value="completed">{isAr ? 'المكتملة فقط ✅' : 'Completed Only ✅'}</option>
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 cursor-pointer"
            >
              <option value="all">{isAr ? 'كل الخطوط (المراحل + الريلز + المرحّلة)' : 'All Tracks'}</option>
              <option value="main">{isAr ? 'مراحل العمل الأساسية (5)' : 'Main Workflow'}</option>
              <option value="reel">{isAr ? 'فيديوهات الشهر الحالي' : 'Current Month Reels'}</option>
              <option value="carryover_reel">{isAr ? 'فيديوهات مرحلة من الشهر السابق' : 'Carried-Over Videos'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black text-slate-800">
            {isAr ? `قائمة المهام (${filteredTasks.length})` : `Tasks Queue (${filteredTasks.length})`}
          </span>
          <span className="text-[11px] text-slate-400">
            {isAr ? 'يمكنك تغيير الحالة أو تعيين المسؤول مباشرة من الجدول' : 'Toggle status or assign directly inline'}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center space-y-2 text-slate-400">
            <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-300" />
            <p className="text-xs font-bold text-slate-500">
              {isAr ? 'لا توجد مهام مطابقة للفلتر المحدد حالياً.' : 'No tasks match the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';
              const isSeqBlocked = !task.seqCheck.allowed;
              const blockTooltip = isSeqBlocked
                ? formatSequentialBlockMessage(task.seqCheck, task.displayLabel, isAr)
                : isAr
                ? 'اضغط لتبديل حالة المهمة'
                : 'Click to toggle status';
              return (
                <div
                  key={task.key}
                  className={`p-3.5 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors hover:bg-slate-50/80 ${
                    task.isOverdue ? 'bg-rose-50/35' : ''
                  } ${isSeqBlocked && !isCompleted ? 'opacity-75' : ''}`}
                >
                  {/* Client & Task Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
                        isSeqBlocked
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white cursor-pointer'
                          : isInProgress
                          ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100 cursor-pointer'
                          : 'bg-slate-100 border-slate-300 text-slate-400 hover:border-indigo-400 cursor-pointer'
                      }`}
                      title={blockTooltip}
                    >
                      {isSeqBlocked && !isCompleted ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : isInProgress ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 border ${
                            task.track === 'carryover_reel'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : task.track === 'reel'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {task.track === 'reel' || task.track === 'carryover_reel' ? (
                            <Film className="w-3 h-3" />
                          ) : (
                            <Layers className="w-3 h-3" />
                          )}
                          <span>{task.displayLabel}</span>
                        </span>

                        {task.track === 'carryover_reel' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            {isAr
                              ? `مرحل${task.originCycleLabel ? ` • ${task.originCycleLabel}` : ''}`
                              : `Carried Over${task.originCycleLabel ? ` • ${task.originCycleLabel}` : ''}`}
                          </span>
                        )}

                        <span className="text-xs font-black text-slate-900 truncate">
                          {task.client.company || task.client.name}
                        </span>

                        {isSeqBlocked && task.seqCheck.reason === 'prev_incomplete' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>
                              {isAr
                                ? `بانتظار إكمال ${formatStageDisplayTitle(task.seqCheck.blockingStageTitle, true)}`
                                : `Waiting on ${formatStageDisplayTitle(task.seqCheck.blockingStageTitle, false)}`}
                            </span>
                          </span>
                        )}

                        {task.isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{task.overdueBadge || (isAr ? 'متأخر' : 'Overdue')}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span>{task.client.packageName || (isAr ? 'باقة تسويق' : 'Package')}</span>
                        {task.client.renewalDate && (
                          <>
                            <span>•</span>
                            <span dir="ltr">
                              {isAr ? 'الاستحقاق:' : 'Due:'} {task.client.renewalDate}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline Controls: Assignee Select + Status Button + Open Client */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {!canAssignTasks ? (
                      task.assignee ? (
                        <span className="text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-indigo-50 text-indigo-900 border-indigo-200">
                          {task.assignee}
                        </span>
                      ) : currentMemberName ? (
                        <span className="text-[11px] font-bold py-1.5 px-2.5 rounded-xl border bg-slate-50 text-slate-500 border-slate-200">
                          {isAr ? `تلقائي: ${currentMemberName}` : `Auto: ${currentMemberName}`}
                        </span>
                      ) : null
                    ) : (
                      <select
                        value={task.assignee || ''}
                        onChange={(e) => handleAssignTask(task, e.target.value)}
                        className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          task.assignee
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        <option value="">{isAr ? '— تعيين مسؤول —' : '— Assign —'}</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      title={blockTooltip}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                        isSeqBlocked
                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                          : isInProgress
                          ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 cursor-pointer'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 cursor-pointer'
                      }`}
                    >
                      {isSeqBlocked && !isCompleted
                        ? isAr
                          ? '🔒 مقفل بالترتيب'
                          : '🔒 Locked'
                        : isCompleted
                        ? isAr
                          ? '✅ مكتمل'
                          : '✅ Done'
                        : isInProgress
                        ? isAr
                          ? '⚡ قيد التنفيذ'
                          : '⚡ Active'
                        : isAr
                        ? '⏳ في الانتظار'
                        : '⏳ Pending'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenClient(task.client)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 transition-colors cursor-pointer"
                      title={isAr ? 'فتح ملف العميل' : 'Open Client Account'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
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
