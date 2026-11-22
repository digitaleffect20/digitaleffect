import React from 'react';
import { AgencyTeamMember, ClientWorkflowStage } from '../types';
import { Check, Clock, Calendar, Film, User, Lock } from 'lucide-react';

export const DEFAULT_WORKFLOW_STAGES: ClientWorkflowStage[] = [
  {
    id: 'content_creator',
    title: 'Content Creator',
    status: 'pending',
  },
  {
    id: 'visual_design',
    title: 'Visual Design',
    status: 'pending',
  },
  {
    id: 'final_design',
    title: 'Final Design',
    status: 'pending',
  },
  {
    id: 'client_approve',
    title: 'Client Approve',
    status: 'pending',
  },
  {
    id: 'publish',
    title: 'Publish',
    status: 'pending',
  },
];

/**
 * Builds/normalizes the Reels production timeline nodes for a client's package.
 * Preserves existing statuses, assignees & timestamps when package reel counts change,
 * and initializes completed nodes from reelsDelivered if no reelStages exist yet.
 */
export function buildReelWorkflowStages(
  reelsCount: number,
  existingReelStages?: ClientWorkflowStage[],
  deliveredFallback = 0
): ClientWorkflowStage[] {
  const safeCount = Math.max(0, Math.min(30, Math.floor(Number(reelsCount) || 0)));
  if (safeCount === 0) return [];

  const existingMap = new Map<string, ClientWorkflowStage>();
  if (Array.isArray(existingReelStages)) {
    for (const st of existingReelStages) {
      if (st?.id) existingMap.set(st.id, st);
    }
  }

  const hasSavedState = existingMap.size > 0;
  const fallbackCompleted = Math.max(0, Math.floor(Number(deliveredFallback) || 0));

  return Array.from({ length: safeCount }, (_, idx) => {
    const num = idx + 1;
    const id = `reel_${num}`;
    const existing = existingMap.get(id);
    if (existing) {
      return {
        ...existing,
        id,
        title: existing.title || `Reel ${num}`,
        track: 'reel',
      };
    }
    return {
      id,
      title: `Reel ${num}`,
      status: !hasSavedState && num <= fallbackCompleted ? 'completed' : 'pending',
      track: 'reel',
    };
  });
}

export interface SequentialStageCheck {
  allowed: boolean;
  reason?: 'prev_incomplete' | 'next_active';
  blockingStageTitle?: string;
}

/**
 * Enforces strict sequential execution on a timeline:
 * - A stage cannot be advanced (pending -> in_progress -> completed) until ALL prior stages are 'completed'.
 * - A completed stage cannot be reverted to 'pending' while a subsequent stage is already 'in_progress' or 'completed'.
 */
export function checkSequentialStageToggle(
  stages: ClientWorkflowStage[],
  stageId: string
): SequentialStageCheck {
  const idx = stages.findIndex((s) => s.id === stageId);
  if (idx === -1) return { allowed: false };
  const target = stages[idx];

  if (target.status !== 'completed') {
    const firstIncompletePrev = stages.slice(0, idx).find((s) => s.status !== 'completed');
    if (firstIncompletePrev) {
      return {
        allowed: false,
        reason: 'prev_incomplete',
        blockingStageTitle: firstIncompletePrev.title,
      };
    }
    return { allowed: true };
  }

  const firstActiveNext = stages.slice(idx + 1).find((s) => s.status !== 'pending');
  if (firstActiveNext) {
    return {
      allowed: false,
      reason: 'next_active',
      blockingStageTitle: firstActiveNext.title,
    };
  }
  return { allowed: true };
}

export function formatStageDisplayTitle(title: string | undefined, isAr: boolean): string {
  if (!title) return isAr ? 'المرحلة السابقة' : 'the previous stage';
  if (isAr && /^Reel\s+(\d+)$/i.test(title)) {
    return title.replace(/^Reel\s+/i, 'ريلز ');
  }
  return title;
}

export function formatSequentialBlockMessage(
  check: SequentialStageCheck,
  targetLabel: string,
  isAr: boolean
): string {
  const blocker = formatStageDisplayTitle(check.blockingStageTitle, isAr);
  if (check.reason === 'next_active') {
    return isAr
      ? `لا يمكن إلغاء «${targetLabel}» قبل إلغاء المرحلة التالية «${blocker}» أولاً.`
      : `Cannot reset "${targetLabel}" while "${blocker}" is already active or completed.`;
  }
  return isAr
    ? `لا يمكن تنفيذ أو إنهاء «${targetLabel}» قبل اكتمال المرحلة السابقة «${blocker}» أولاً.`
    : `Complete "${blocker}" first before starting or completing "${targetLabel}".`;
}

interface ClientWorkflowStepperProps {
  stages?: ClientWorkflowStage[];
  onToggleStage?: (stageId: string) => void;
  onAssignStage?: (stageId: string, assignee: string) => void;
  reelsTarget?: number;
  reelStages?: ClientWorkflowStage[];
  reelsDelivered?: number;
  onToggleReelStage?: (reelStageId: string) => void;
  onAssignReelStage?: (reelStageId: string, assignee: string) => void;
  teamMembers?: AgencyTeamMember[];
  allowedStageIds?: string[];
  canToggleReels?: boolean;
  canAssignTasks?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isAr?: boolean;
}

export const ClientWorkflowStepper: React.FC<ClientWorkflowStepperProps> = ({
  stages,
  onToggleStage,
  onAssignStage,
  reelsTarget = 0,
  reelStages,
  reelsDelivered = 0,
  onToggleReelStage,
  onAssignReelStage,
  teamMembers = [],
  allowedStageIds,
  canToggleReels = true,
  canAssignTasks = true,
  interactive = true,
  size = 'md',
  isAr = true,
}) => {
  const currentStages = stages && stages.length === 5 ? stages : DEFAULT_WORKFLOW_STAGES;
  const completedCount = currentStages.filter((s) => s.status === 'completed').length;

  const currentReelStages = buildReelWorkflowStages(reelsTarget, reelStages, reelsDelivered);
  const completedReelsCount = currentReelStages.filter((s) => s.status === 'completed').length;

  const formatStageTime = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month} ${hours}:${mins}`;
    } catch {
      return null;
    }
  };

  const isSmall = size === 'sm';
  const isReelsScrollable = currentReelStages.length > 6;

  return (
    <div className="w-full space-y-2.5 select-none">
      {/* ================================================================ */}
      {/* TRACK 1: MAIN 5-STAGE WORKFLOW PIPELINE                          */}
      {/* ================================================================ */}
      <div className="relative pt-1 pb-1">
        {/* Progress connecting bar */}
        <div className="absolute top-5 start-8 end-8 h-1 bg-slate-200 -z-0 rounded-full">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(100, (completedCount / Math.max(1, currentStages.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* 5 Stages Grid */}
        <div className="relative z-10 flex items-start justify-between gap-1 sm:gap-2">
          {currentStages.map((stage) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isPending = stage.status === 'pending';
            const formattedTime = formatStageTime(stage.completedAt);
            const isStageAllowed =
              !allowedStageIds || allowedStageIds.includes(stage.id);
            const seqCheck = checkSequentialStageToggle(currentStages, stage.id);
            const isSeqBlocked = !seqCheck.allowed;
            const canClickStage =
              interactive && Boolean(onToggleStage) && isStageAllowed && !isSeqBlocked;
            const canTriggerBlockedNotice =
              interactive && Boolean(onToggleStage) && isStageAllowed && isSeqBlocked;

            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center text-center flex-1 transition-all ${
                  canClickStage
                    ? 'cursor-pointer group'
                    : interactive && (!isStageAllowed || isSeqBlocked)
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
                onClick={(e) => {
                  if ((canClickStage || canTriggerBlockedNotice) && onToggleStage) {
                    e.stopPropagation();
                    onToggleStage(stage.id);
                  }
                }}
                title={
                  canClickStage
                    ? isAr
                      ? `تغيير حالة (${stage.title})`
                      : `Toggle ${stage.title}`
                    : !isStageAllowed
                    ? isAr
                      ? `${stage.title} — مرحلة مخصصة لقسم آخر (للعرض فقط)`
                      : `${stage.title} — Assigned to another role (Read-only)`
                    : isSeqBlocked
                    ? formatSequentialBlockMessage(seqCheck, stage.title, isAr)
                    : stage.title
                }
              >
                {/* Stage Circle Node */}
                <div className={`mb-1.5 relative transition-transform ${canClickStage ? 'group-hover:scale-105' : ''}`}>
                  {isCompleted && (
                    <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-emerald-400/40`}>
                      <Check className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} stroke-[2.5]`} />
                    </div>
                  )}

                  {isInProgress && (
                    <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-white border-[3px] border-blue-600 flex items-center justify-center shadow-xs ring-4 ring-blue-100`}>
                      <div className={`${isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-blue-600 animate-pulse`} />
                    </div>
                  )}

                  {isPending && (
                    <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center ${canClickStage ? 'group-hover:border-slate-400' : ''}`}>
                      {!isStageAllowed || isSeqBlocked ? (
                        <Lock className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-400`} />
                      ) : (
                        <Check className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[2]`} />
                      )}
                    </div>
                  )}

                  {!isStageAllowed && !isPending && (
                    <span className="absolute -bottom-1 -end-1 w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center border border-white shadow-2xs">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Stage Label */}
                <span className={`text-[10px] sm:text-[11px] leading-tight font-bold mb-1 transition-colors ${
                  isInProgress ? 'text-slate-900 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {stage.title}
                </span>

                {/* Status Badge */}
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isInProgress
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCompleted && (
                    <>
                      <Check className="w-2.5 h-2.5" />
                      <span>{isAr ? 'مكتمل' : 'Done'}</span>
                    </>
                  )}
                  {isInProgress && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping inline-block" />
                      <span>{isAr ? 'قيد التنفيذ' : 'Active'}</span>
                    </>
                  )}
                  {isPending && (
                    <>
                      <Clock className="w-2.5 h-2.5" />
                      <span>{isAr ? 'في الانتظار' : 'Waiting'}</span>
                    </>
                  )}
                </span>

                {/* Timestamp Under the Task */}
                {formattedTime && (isCompleted || isInProgress) ? (
                  <div
                    className="mt-1 px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-[9px] font-mono text-slate-600 flex items-center gap-1 shadow-3xs"
                    title={isAr ? `تاريخ ووقت التحديث: ${formattedTime}` : `Updated at: ${formattedTime}`}
                  >
                    <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span dir="ltr">{formattedTime}</span>
                  </div>
                ) : (
                  <div className="mt-1 h-4 flex items-center">
                    <span className="text-[9px] text-slate-300 font-mono">-</span>
                  </div>
                )}

                {/* Assignee Badge or Inline Selector */}
                {canAssignTasks && onAssignStage && teamMembers.length > 0 ? (
                  <div
                    className="mt-1 w-full max-w-[110px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={stage.assignee || ''}
                      onChange={(e) => onAssignStage(stage.id, e.target.value)}
                      aria-label={isAr ? `تعيين مسؤول لـ ${stage.title}` : `Assign ${stage.title}`}
                      className={`w-full text-[9px] font-bold py-0.5 px-1 rounded-md border text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        stage.assignee
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <option value="">{isAr ? '+ مسؤول' : '+ Assign'}</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : stage.assignee ? (
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200/80 text-[9px] font-bold text-indigo-800 inline-flex items-center gap-0.5 max-w-[96px] truncate">
                    <User className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                    <span className="truncate">{stage.assignee}</span>
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TRACK 2: PACKAGE REELS TIMELINE (DYNAMIC PER PACKAGE REELS COUNT) */}
      {/* ================================================================ */}
      {currentReelStages.length > 0 && (
        <div className="pt-2.5 mt-1 border-t border-slate-200/80 space-y-2">
          {/* Reels Track Header */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{isAr ? 'تايم لاين الريلز (حسب الباقة):' : 'Reels Production Timeline:'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black tabular-nums">
              {completedReelsCount} / {currentReelStages.length} {isAr ? 'ريلز مكتمل' : 'Reels Done'}
            </span>
          </div>

          <div className={isReelsScrollable ? 'overflow-x-auto pb-1' : ''}>
            <div className={`relative pt-1 pb-1 ${isReelsScrollable ? 'min-w-max px-2' : ''}`}>
              {/* Progress connecting bar */}
              {currentReelStages.length > 1 && (
                <div className="absolute top-5 start-8 end-8 h-1 bg-purple-100 -z-0 rounded-full">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, (completedReelsCount / Math.max(1, currentReelStages.length - 1)) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* Reels Nodes Row */}
              <div className="relative z-10 flex items-start justify-between gap-1.5 sm:gap-2">
                {currentReelStages.map((reel, index) => {
                  const isCompleted = reel.status === 'completed';
                  const isInProgress = reel.status === 'in_progress';
                  const isPending = reel.status === 'pending';
                  const formattedTime = formatStageTime(reel.completedAt);
                  const reelLabel = isAr ? `ريلز ${index + 1}` : `Reel ${index + 1}`;
                  const reelSeqCheck = checkSequentialStageToggle(currentReelStages, reel.id);
                  const isReelSeqBlocked = !reelSeqCheck.allowed;
                  const canToggle =
                    interactive &&
                    canToggleReels &&
                    Boolean(onToggleReelStage) &&
                    !isReelSeqBlocked;
                  const canTriggerReelBlockedNotice =
                    interactive &&
                    canToggleReels &&
                    Boolean(onToggleReelStage) &&
                    isReelSeqBlocked;

                  return (
                    <div
                      key={reel.id}
                      className={`flex flex-col items-center text-center transition-all ${
                        isReelsScrollable ? 'min-w-[82px] shrink-0' : 'flex-1'
                      } ${
                        canToggle
                          ? 'cursor-pointer group'
                          : interactive && (!canToggleReels || isReelSeqBlocked)
                          ? 'cursor-not-allowed opacity-60'
                          : ''
                      }`}
                      onClick={(e) => {
                        if ((canToggle || canTriggerReelBlockedNotice) && onToggleReelStage) {
                          e.stopPropagation();
                          onToggleReelStage(reel.id);
                        }
                      }}
                      title={
                        canToggle
                          ? isAr
                            ? `تغيير حالة (${reelLabel})`
                            : `Toggle ${reelLabel}`
                          : !canToggleReels
                          ? isAr
                            ? `${reelLabel} — للعرض فقط`
                            : `${reelLabel} — Read-only`
                          : isReelSeqBlocked
                          ? formatSequentialBlockMessage(reelSeqCheck, reelLabel, isAr)
                          : reelLabel
                      }
                    >
                      {/* Reel Circle Node */}
                      <div className={`mb-1.5 transition-transform ${canToggle ? 'group-hover:scale-105' : ''}`}>
                        {isCompleted && (
                          <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-purple-400/40`}>
                            <Check className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} stroke-[2.5]`} />
                          </div>
                        )}

                        {isInProgress && (
                          <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-white border-[3px] border-purple-600 flex items-center justify-center shadow-xs ring-4 ring-purple-100`}>
                            <div className={`${isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-purple-600 animate-pulse`} />
                          </div>
                        )}

                        {isPending && (
                          <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-purple-50/70 border-2 border-purple-200 text-purple-400 flex items-center justify-center ${canToggle ? 'group-hover:border-purple-400' : ''}`}>
                            {!canToggleReels || isReelSeqBlocked ? (
                              <Lock className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-purple-300`} />
                            ) : (
                              <Film className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[2]`} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reel Label */}
                      <span className={`text-[10px] sm:text-[11px] leading-tight font-bold mb-1 transition-colors ${
                        isInProgress ? 'text-purple-950 font-black' : isCompleted ? 'text-purple-900' : 'text-slate-500'
                      }`}>
                        {reelLabel}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          isCompleted
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : isInProgress
                            ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {isCompleted && (
                          <>
                            <Check className="w-2.5 h-2.5" />
                            <span>{isAr ? 'مكتمل' : 'Done'}</span>
                          </>
                        )}
                        {isInProgress && (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping inline-block" />
                            <span>{isAr ? 'قيد التنفيذ' : 'Active'}</span>
                          </>
                        )}
                        {isPending && (
                          <>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{isAr ? 'في الانتظار' : 'Waiting'}</span>
                          </>
                        )}
                      </span>

                      {/* Timestamp Under the Reel Node */}
                      {formattedTime && (isCompleted || isInProgress) ? (
                        <div
                          className="mt-1 px-1.5 py-0.5 rounded bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 text-[9px] font-mono text-purple-700 flex items-center gap-1 shadow-3xs"
                          title={isAr ? `تاريخ ووقت التحديث: ${formattedTime}` : `Updated at: ${formattedTime}`}
                        >
                          <Calendar className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                          <span dir="ltr">{formattedTime}</span>
                        </div>
                      ) : (
                        <div className="mt-1 h-4 flex items-center">
                          <span className="text-[9px] text-slate-300 font-mono">-</span>
                        </div>
                      )}

                      {/* Reel Assignee Badge or Inline Selector */}
                      {canAssignTasks && onAssignReelStage && teamMembers.length > 0 ? (
                        <div
                          className="mt-1 w-full max-w-[100px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={reel.assignee || ''}
                            onChange={(e) => onAssignReelStage(reel.id, e.target.value)}
                            aria-label={isAr ? `تعيين مسؤول لـ ${reelLabel}` : `Assign ${reelLabel}`}
                            className={`w-full text-[9px] font-bold py-0.5 px-1 rounded-md border text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                              reel.assignee
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'
                            }`}
                          >
                            <option value="">{isAr ? '+ مسؤول' : '+ Assign'}</option>
                            {teamMembers.map((m) => (
                              <option key={m.id} value={m.name}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : reel.assignee ? (
                        <span className="mt-1 px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200/80 text-[9px] font-bold text-purple-800 inline-flex items-center gap-0.5 max-w-[90px] truncate">
                          <User className="w-2.5 h-2.5 shrink-0 text-purple-500" />
                          <span className="truncate">{reel.assignee}</span>
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
