import React from 'react';
import { ClientWorkflowStage } from '../types';
import { Check, Clock, Calendar, CheckCircle2 } from 'lucide-react';

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

interface ClientWorkflowStepperProps {
  stages?: ClientWorkflowStage[];
  onToggleStage?: (stageId: string) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isAr?: boolean;
}

export const ClientWorkflowStepper: React.FC<ClientWorkflowStepperProps> = ({
  stages,
  onToggleStage,
  interactive = true,
  size = 'md',
  isAr = true,
}) => {
  const currentStages = stages && stages.length === 5 ? stages : DEFAULT_WORKFLOW_STAGES;
  const completedCount = currentStages.filter((s) => s.status === 'completed').length;

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

  return (
    <div className="w-full space-y-2 select-none">
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

            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center text-center flex-1 transition-all ${
                  interactive ? 'cursor-pointer group' : ''
                }`}
                onClick={(e) => {
                  if (interactive && onToggleStage) {
                    e.stopPropagation();
                    onToggleStage(stage.id);
                  }
                }}
                title={interactive ? (isAr ? `تغيير حالة (${stage.title})` : `Toggle ${stage.title}`) : stage.title}
              >
                {/* Stage Circle Node */}
                <div className="mb-1.5 transition-transform group-hover:scale-105">
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
                    <div className={`${isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center group-hover:border-slate-400`}>
                      <Check className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[2]`} />
                    </div>
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

                {/* Timestamp Under the Task (تاريخ ووقت التعليم) */}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
