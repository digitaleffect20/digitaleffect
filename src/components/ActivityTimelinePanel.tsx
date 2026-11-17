import React, { useState, useMemo } from 'react';
import { ActivityLogType, ClientAccountNote } from '../types';
import {
  Activity,
  Phone,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  Layers,
  Edit3,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  User,
  StickyNote,
} from 'lucide-react';

interface ActivityTimelinePanelProps {
  entries: ClientAccountNote[];
  isAr?: boolean;
  onAddEntry: (entry: { text: string; type: ActivityLogType; author?: string }) => void;
  createdAt?: string;
  initialNotes?: string;
  maxHeightClass?: string;
}

type FilterBucket = 'all' | 'status' | 'interactions' | 'notes' | 'billing' | 'workflow';

function formatRelativeTime(isoDate: string, isAr: boolean): string {
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return isAr ? 'الآن' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return isAr ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return isAr ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  return new Date(isoDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
}

export function getActivityTypeMeta(type: ActivityLogType | undefined, isAr: boolean) {
  switch (type) {
    case 'status_change':
      return {
        label: isAr ? 'تغيير حالة' : 'Status Change',
        bucket: 'status' as FilterBucket,
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
        Icon: Activity,
      };
    case 'call':
      return {
        label: isAr ? 'مكالمة هاتفية' : 'Phone Call',
        bucket: 'interactions' as FilterBucket,
        dotColor: 'bg-sky-500',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        iconBg: 'bg-sky-100 text-sky-700 border-sky-200',
        Icon: Phone,
      };
    case 'whatsapp':
      return {
        label: isAr ? 'تواصل واتساب' : 'WhatsApp Chat',
        bucket: 'interactions' as FilterBucket,
        dotColor: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Icon: MessageSquare,
      };
    case 'meeting':
      return {
        label: isAr ? 'اجتماع / متابعة' : 'Meeting',
        bucket: 'interactions' as FilterBucket,
        dotColor: 'bg-purple-500',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        iconBg: 'bg-purple-100 text-purple-700 border-purple-200',
        Icon: Calendar,
      };
    case 'payment':
      return {
        label: isAr ? 'حركة مالية / سداد' : 'Payment',
        bucket: 'billing' as FilterBucket,
        dotColor: 'bg-emerald-600',
        badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Icon: CreditCard,
      };
    case 'invoice':
      return {
        label: isAr ? 'فاتورة رسمية' : 'Invoice',
        bucket: 'billing' as FilterBucket,
        dotColor: 'bg-blue-600',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        iconBg: 'bg-blue-100 text-blue-700 border-blue-200',
        Icon: FileText,
      };
    case 'deliverable':
      return {
        label: isAr ? 'تسليم مخرجات' : 'Deliverable',
        bucket: 'workflow' as FilterBucket,
        dotColor: 'bg-indigo-500',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        iconBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        Icon: CheckCircle2,
      };
    case 'workflow':
      return {
        label: isAr ? 'سير العمل' : 'Workflow',
        bucket: 'workflow' as FilterBucket,
        dotColor: 'bg-cyan-600',
        badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        iconBg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        Icon: Layers,
      };
    case 'note':
      return {
        label: isAr ? 'ملاحظة داخلية' : 'Note',
        bucket: 'notes' as FilterBucket,
        dotColor: 'bg-slate-600',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
        Icon: StickyNote,
      };
    default:
      return {
        label: isAr ? 'تحديث الحساب' : 'Update',
        bucket: 'notes' as FilterBucket,
        dotColor: 'bg-slate-500',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
        Icon: Edit3,
      };
  }
}

export const ActivityTimelinePanel: React.FC<ActivityTimelinePanelProps> = ({
  entries,
  isAr = true,
  onAddEntry,
  createdAt,
  initialNotes,
  maxHeightClass = 'max-h-96',
}) => {
  const [noteText, setNoteText] = useState('');
  const [entryType, setEntryType] = useState<ActivityLogType>('note');
  const [authorName, setAuthorName] = useState('');
  const [filterBucket, setFilterBucket] = useState<FilterBucket>('all');

  const combinedEntries = useMemo(() => {
    const sorted = [...(entries || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (sorted.length === 0 && createdAt) {
      return [
        {
          id: 'initial-record-created',
          text: initialNotes
            ? `${isAr ? 'تم تسجيل السجل بالملاحظات الأولية:' : 'Lead recorded with initial notes:'} ${initialNotes}`
            : (isAr ? 'تم إنشاء السجل وإضافته إلى نظام إدارة العملاء.' : 'Record created in CRM.'),
          createdAt,
          author: isAr ? 'النظام' : 'System',
          type: 'status_change' as ActivityLogType,
        },
      ];
    }
    return sorted;
  }, [entries, createdAt, initialNotes, isAr]);

  const counts = useMemo(() => {
    const map: Record<FilterBucket, number> = {
      all: combinedEntries.length,
      status: 0,
      interactions: 0,
      notes: 0,
      billing: 0,
      workflow: 0,
    };
    combinedEntries.forEach((item) => {
      const meta = getActivityTypeMeta(item.type, isAr);
      map[meta.bucket] += 1;
    });
    return map;
  }, [combinedEntries, isAr]);

  const filteredEntries = useMemo(() => {
    if (filterBucket === 'all') return combinedEntries;
    return combinedEntries.filter((item) => getActivityTypeMeta(item.type, isAr).bucket === filterBucket);
  }, [combinedEntries, filterBucket, isAr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddEntry({
      text: noteText.trim(),
      type: entryType,
      author: authorName.trim() || (isAr ? 'مدير الحساب' : 'Account Manager'),
    });
    setNoteText('');
  };

  const handleQuickPreset = (type: ActivityLogType, presetText: string) => {
    onAddEntry({
      text: presetText,
      type,
      author: authorName.trim() || (isAr ? 'مدير الحساب' : 'Account Manager'),
    });
  };

  const filterOptions: Array<{ id: FilterBucket; labelAr: string; labelEn: string }> = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'status', labelAr: 'الحالات', labelEn: 'Status' },
    { id: 'interactions', labelAr: 'التفاعلات', labelEn: 'Interactions' },
    { id: 'notes', labelAr: 'الملاحظات', labelEn: 'Notes' },
    { id: 'billing', labelAr: 'المالية', labelEn: 'Billing' },
    { id: 'workflow', labelAr: 'التنفيذ', labelEn: 'Workflow' },
  ];

  return (
    <div className="space-y-4">
      {/* Add Activity / Interaction Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? 'تسجيل نشاط أو تفاعل جديد:' : 'Log New Activity or Interaction:'}</span>
          </span>

          {/* Quick 1-click interaction pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() =>
                handleQuickPreset(
                  'call',
                  isAr ? 'تم إجراء مكالمة هاتفية لمتابعة العميل ومناقشة التفاصيل.' : 'Completed follow-up phone call with client.'
                )
              }
              className="px-2 py-1 text-[10px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg cursor-pointer inline-flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{isAr ? '+ تسجيل مكالمة' : '+ Log Call'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPreset(
                  'whatsapp',
                  isAr ? 'تم إرسال رسالة متابعة وعرض التفاصيل عبر الواتساب.' : 'Sent follow-up message via WhatsApp.'
                )
              }
              className="px-2 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg cursor-pointer inline-flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{isAr ? '+ متابعة واتساب' : '+ WhatsApp'}</span>
            </button>
          </div>
        </div>

        <textarea
          rows={2}
          required
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={
            isAr
              ? 'اكتب تفاصيل المكالمة، ملاحظة التعاقد، التعديلات المطلوبة، أو ملخص الاجتماع...'
              : 'Write call notes, meeting summary, contract feedback, or follow-up details...'
          }
          className="w-full p-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as ActivityLogType)}
              className="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer"
            >
              <option value="note">{isAr ? '📝 ملاحظة داخلية' : '📝 Internal Note'}</option>
              <option value="call">{isAr ? '📞 مكالمة هاتفية' : '📞 Phone Call'}</option>
              <option value="whatsapp">{isAr ? '💬 تواصل واتساب' : '💬 WhatsApp'}</option>
              <option value="meeting">{isAr ? '🤝 اجتماع / عرض' : '🤝 Meeting'}</option>
              <option value="deliverable">{isAr ? '🎨 تسليم مخرجات' : '🎨 Deliverable'}</option>
              <option value="payment">{isAr ? '💵 حركة مالية' : '💵 Payment'}</option>
              <option value="update">{isAr ? '🔄 تحديث عام' : '🔄 General Update'}</option>
            </select>

            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={isAr ? 'بواسطة (اختياري)...' : 'Author (optional)...'}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 w-36 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة للسجل' : 'Add to Log'}</span>
          </button>
        </div>
      </form>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFilterBucket(opt.id)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer inline-flex items-center gap-1 ${
              filterBucket === opt.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{isAr ? opt.labelAr : opt.labelEn}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterBucket === opt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[opt.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Vertical Activity Timeline */}
      <div className={`space-y-3 overflow-y-auto pe-1 ${maxHeightClass}`}>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            {isAr ? 'لا توجد أنشطة مسجلة في هذا التصنيف.' : 'No activity entries in this category.'}
          </div>
        ) : (
          filteredEntries.map((item) => {
            const meta = getActivityTypeMeta(item.type, isAr);
            const IconComponent = meta.Icon;
            return (
              <div
                key={item.id}
                className="relative flex gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs"
              >
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBg}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${meta.badgeClass}`}>
                        {meta.label}
                      </span>

                      {item.author && (
                        <span className="text-[10px] font-semibold text-slate-500 inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                          <User className="w-2.5 h-2.5 text-slate-400" />
                          <span>{item.author}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400" title={item.createdAt}>
                      <Clock className="w-3 h-3" />
                      <span className="font-semibold text-slate-500">{formatRelativeTime(item.createdAt, isAr)}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  </div>

                  {/* Status Transition Badge if present */}
                  {(item.meta?.fromStatus || item.meta?.toStatus) && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-0.5">
                      {item.meta?.fromStatus && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200 line-through decoration-slate-400">
                          {item.meta.fromStatus}
                        </span>
                      )}
                      {item.meta?.fromStatus && item.meta?.toStatus && (
                        <ArrowRight className={`w-3.5 h-3.5 text-amber-600 ${isAr ? 'rotate-180' : ''}`} />
                      )}
                      {item.meta?.toStatus && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black border border-emerald-200">
                          {item.meta.toStatus}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">{item.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
