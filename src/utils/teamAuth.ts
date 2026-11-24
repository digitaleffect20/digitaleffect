import {
  AgencyTeamMember,
  PortalTabKey,
  TeamMemberPermissions,
  TeamRolePreset,
  WorkflowStageKey,
} from '../types';
import {
  normalizeUsername,
  usernamesMatch,
  hashPasswordPbkdf2,
  verifyStoredPasswordHash,
} from './teamCryptoEdge';

export { normalizeUsername, usernamesMatch };

export interface WorkflowStageDescriptor {
  key: WorkflowStageKey;
  label: string;
  labelAr: string;
}

export const WORKFLOW_STAGE_CATALOG: WorkflowStageDescriptor[] = [
  { key: 'content_creator', label: 'Content Creator', labelAr: 'صناعة المحتوى (Content Creator)' },
  { key: 'visual_design', label: 'Visual Design', labelAr: 'التصميم المبدئي (Visual Design)' },
  { key: 'final_design', label: 'Final Design', labelAr: 'التصميم النهائي (Final Design)' },
  { key: 'client_approve', label: 'Client Approve', labelAr: 'اعتماد العميل (Client Approve)' },
  { key: 'publish', label: 'Publish', labelAr: 'النشر (Publish)' },
];

export const ALL_WORKFLOW_STAGES: WorkflowStageKey[] = WORKFLOW_STAGE_CATALOG.map((s) => s.key);

export interface PortalTabDescriptor {
  key: PortalTabKey;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  category: 'operations' | 'finance' | 'marketing' | 'system';
  isFinancial?: boolean;
}

export const PORTAL_TAB_CATALOG: PortalTabDescriptor[] = [
  {
    key: 'tasks',
    labelAr: 'مهام اليوم والفريق',
    labelEn: 'Team Tasks',
    descAr: 'متابعة المهام النشطة، التايم لاين، والريلز اليومية',
    descEn: 'Active tasks, workflow stages, and daily reels',
    category: 'operations',
  },
  {
    key: 'clients',
    labelAr: 'العملاء والتعاقدات',
    labelEn: 'Clients & Retainers',
    descAr: 'ملفات العملاء، المخرجات الشهرية، وتحديث التايم لاين',
    descEn: 'Client accounts, deliverables, and timelines',
    category: 'operations',
  },
  {
    key: 'activity',
    labelAr: 'سجل النشاط والتفاعلات',
    labelEn: 'Activity Log',
    descAr: 'متابعة الملاحظات والتحديثات والتواصل مع العملاء',
    descEn: 'Notes, updates, and client interactions feed',
    category: 'operations',
  },
  {
    key: 'inquiries',
    labelAr: 'الطلبات والاستشارات',
    labelEn: 'Inquiries & Leads',
    descAr: 'الطلبات الواردة من الموقع وتحويل العملاء الجدد',
    descEn: 'Incoming website leads and consultation requests',
    category: 'operations',
  },
  {
    key: 'invoices',
    labelAr: 'أرشيف الفواتير وكشوف الحساب',
    labelEn: 'Invoices & Statements',
    descAr: 'إصدار الفواتير، الدفعات الجزئية، وإيصالات السداد',
    descEn: 'Client invoices, partial payments, and receipts',
    category: 'finance',
    isFinancial: true,
  },
  {
    key: 'expenses',
    labelAr: 'المصروفات وصافي الربح',
    labelEn: 'Expenses & Net Profit',
    descAr: 'تسجيل مصروفات الوكالة ومتابعة صافي الأرباح',
    descEn: 'Agency expenses and realized net profit',
    category: 'finance',
    isFinancial: true,
  },
  {
    key: 'analytics',
    labelAr: 'المبيعات والترافيك والجرافات',
    labelEn: 'Sales & Traffic Graphs',
    descAr: 'الرسوم البيانية للمبيعات، التدفقات النقدية، والزيارات',
    descEn: 'Revenue charts, cash flow trends, and traffic',
    category: 'finance',
    isFinancial: true,
  },
  {
    key: 'packages',
    labelAr: 'الباقات والعروض',
    labelEn: 'Packages & Offers',
    descAr: 'تعديل باقات الوكالة والأسعار وأكواد الخصم',
    descEn: 'Manage agency service packages and promo codes',
    category: 'marketing',
  },
  {
    key: 'projects',
    labelAr: 'دراسات الحالة والمشاريع',
    labelEn: 'Case Studies',
    descAr: 'إدارة معرض الأعمال والصور والفيديوهات',
    descEn: 'Manage portfolio case studies and media',
    category: 'marketing',
  },
  {
    key: 'banner',
    labelAr: 'شريط العروض والخصومات',
    labelEn: 'Global Promo Banner',
    descAr: 'التحكم في الشريط الترويجي أعلى الموقع',
    descEn: 'Edit top website promotional banner',
    category: 'marketing',
  },
  {
    key: 'backup',
    labelAr: 'النسخ الاحتياطي والضبط',
    labelEn: 'Backup & Settings',
    descAr: 'تصدير واستيراد البيانات والمزامنة السحابية',
    descEn: 'Export/import data and cloud sync tools',
    category: 'system',
  },
];

export const ALL_PORTAL_TABS: PortalTabKey[] = PORTAL_TAB_CATALOG.map((t) => t.key);

export const FULL_ADMIN_PERMISSIONS: TeamMemberPermissions = {
  allowedTabs: [...ALL_PORTAL_TABS],
  canViewFinancials: true,
  canEditClients: true,
  canDeleteRecords: true,
  canManageTeam: true,
  onlyAssignedTasks: false,
  allowedWorkflowStages: [...ALL_WORKFLOW_STAGES],
  canUpdateReelsTrack: true,
  canAssignTasks: true,
  canManageAdWallet: true,
  canApproveAdWallet: true,
};

export interface TeamRolePresetConfig {
  key: TeamRolePreset;
  labelAr: string;
  labelEn: string;
  defaultRoleTitleAr: string;
  defaultRoleTitleEn: string;
  badgeColor: string;
  permissions: TeamMemberPermissions;
}

export const TEAM_ROLE_PRESETS: TeamRolePresetConfig[] = [
  {
    key: 'content_creator',
    labelAr: 'صانع محتوى (Content Creator)',
    labelEn: 'Content Creator',
    defaultRoleTitleAr: 'صانع محتوى / Content Creator',
    defaultRoleTitleEn: 'Content Creator',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    permissions: {
      allowedTabs: ['tasks', 'clients', 'activity'],
      canViewFinancials: false,
      canEditClients: false,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: false,
      allowedWorkflowStages: ['content_creator', 'client_approve', 'publish'],
      canUpdateReelsTrack: true,
      canAssignTasks: false,
      canManageAdWallet: false,
      canApproveAdWallet: false,
    },
  },
  {
    key: 'video_editor',
    labelAr: 'مونتير / فيديو (Video Editor)',
    labelEn: 'Video Editor',
    defaultRoleTitleAr: 'مونتاج وإنتاج ريلز',
    defaultRoleTitleEn: 'Video & Reels Editor',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    permissions: {
      allowedTabs: ['tasks', 'clients'],
      canViewFinancials: false,
      canEditClients: false,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: true,
      allowedWorkflowStages: ['content_creator', 'publish'],
      canUpdateReelsTrack: true,
      canAssignTasks: false,
      canManageAdWallet: false,
      canApproveAdWallet: false,
    },
  },
  {
    key: 'account_manager',
    labelAr: 'مدير حسابات (Account Manager)',
    labelEn: 'Account Manager',
    defaultRoleTitleAr: 'مدير حسابات العملاء',
    defaultRoleTitleEn: 'Account Manager',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    permissions: {
      allowedTabs: ['inquiries', 'clients', 'tasks', 'activity'],
      canViewFinancials: false,
      canEditClients: true,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: false,
      allowedWorkflowStages: [...ALL_WORKFLOW_STAGES],
      canUpdateReelsTrack: true,
      canAssignTasks: true,
      canManageAdWallet: true,
      canApproveAdWallet: false,
    },
  },
  {
    key: 'media_buyer',
    labelAr: 'ميديا باير (Media Buyer)',
    labelEn: 'Media Buyer',
    defaultRoleTitleAr: 'إدارة الحملات الممولة',
    defaultRoleTitleEn: 'Media Buyer',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    permissions: {
      allowedTabs: ['clients', 'tasks', 'activity', 'projects'],
      canViewFinancials: false,
      canEditClients: false,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: false,
      allowedWorkflowStages: ['client_approve', 'publish'],
      canUpdateReelsTrack: false,
      canAssignTasks: false,
      canManageAdWallet: true,
      canApproveAdWallet: false,
    },
  },
  {
    key: 'accountant',
    labelAr: 'محاسب / مالية (Accountant)',
    labelEn: 'Accountant / Finance',
    defaultRoleTitleAr: 'مسؤول الحسابات والفوترة',
    defaultRoleTitleEn: 'Finance & Billing',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    permissions: {
      allowedTabs: ['clients', 'invoices', 'expenses', 'analytics', 'activity'],
      canViewFinancials: true,
      canEditClients: false,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: false,
      allowedWorkflowStages: [],
      canUpdateReelsTrack: false,
      canAssignTasks: false,
      canManageAdWallet: true,
      canApproveAdWallet: true,
    },
  },
  {
    key: 'custom',
    labelAr: 'صلاحيات مخصصة (اختيار حر)',
    labelEn: 'Custom Permissions',
    defaultRoleTitleAr: 'عضو فريق',
    defaultRoleTitleEn: 'Team Member',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    permissions: {
      allowedTabs: ['tasks', 'clients'],
      canViewFinancials: false,
      canEditClients: false,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: false,
      allowedWorkflowStages: [...ALL_WORKFLOW_STAGES],
      canUpdateReelsTrack: true,
      canAssignTasks: false,
      canManageAdWallet: false,
      canApproveAdWallet: false,
    },
  },
];

export function getPresetPermissions(preset: TeamRolePreset): TeamMemberPermissions {
  const found = TEAM_ROLE_PRESETS.find((p) => p.key === preset);
  if (!found) {
    return {
      allowedTabs: ['tasks', 'clients'],
      canViewFinancials: false,
      canEditClients: false,
      canDeleteRecords: false,
      canManageTeam: false,
      onlyAssignedTasks: false,
      allowedWorkflowStages: [...ALL_WORKFLOW_STAGES],
      canUpdateReelsTrack: true,
      canAssignTasks: false,
      canManageAdWallet: false,
      canApproveAdWallet: false,
    };
  }
  return {
    ...found.permissions,
    allowedTabs: [...found.permissions.allowedTabs],
    allowedWorkflowStages: found.permissions.allowedWorkflowStages
      ? [...found.permissions.allowedWorkflowStages]
      : [...ALL_WORKFLOW_STAGES],
  };
}

/**
 * Resolves a team member's complete permissions, smoothly backfilling newly added
 * workflow stage, task-assignment & Ad Wallet approval rules for accounts created earlier.
 */
export function resolveMemberPermissions(member?: AgencyTeamMember | null): TeamMemberPermissions {
  if (!member) return getPresetPermissions('account_manager');

  const roleText = `${member.roleTitle || ''} ${member.username || ''}`.toLowerCase();
  const inferredPreset: TeamRolePreset =
    member.rolePreset && member.rolePreset !== 'custom'
      ? member.rolePreset
      : /content|محتو/i.test(roleText)
      ? 'content_creator'
      : /video|reel|مونتاج|مونتير/i.test(roleText)
      ? 'video_editor'
      : /accountant|finance|محاسب|مالي/i.test(roleText)
      ? 'accountant'
      : /media\s*buyer|ميديا|حملات|اعلانات|إعلانات/i.test(roleText)
      ? 'media_buyer'
      : /account\s*manager|مدير\s*حساب/i.test(roleText)
      ? 'account_manager'
      : member.rolePreset || 'custom';

  const fallback = getPresetPermissions(inferredPreset);
  const saved = member.permissions;
  if (!saved) return fallback;

  return {
    ...fallback,
    ...saved,
    allowedTabs: [...(saved.allowedTabs || fallback.allowedTabs)],
    allowedWorkflowStages:
      saved.allowedWorkflowStages !== undefined
        ? [...saved.allowedWorkflowStages]
        : fallback.allowedWorkflowStages,
    canUpdateReelsTrack:
      saved.canUpdateReelsTrack !== undefined
        ? saved.canUpdateReelsTrack
        : fallback.canUpdateReelsTrack,
    canAssignTasks:
      saved.canAssignTasks !== undefined
        ? saved.canAssignTasks
        : fallback.canAssignTasks,
    canManageAdWallet:
      saved.canManageAdWallet !== undefined
        ? saved.canManageAdWallet
        : fallback.canManageAdWallet,
    canApproveAdWallet:
      saved.canApproveAdWallet !== undefined
        ? saved.canApproveAdWallet
        : saved.canViewFinancials
        ? true
        : fallback.canApproveAdWallet,
  };
}

/**
 * Hashes a team member password securely.
 * Prefers server-side hashing via `/api/team/hash-password`,
 * with salted Web Crypto PBKDF2-SHA256 fallback.
 */
export async function hashTeamPassword(password: string): Promise<string> {
  try {
    const res = await fetch('/api/team/hash-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const json = await res.json();
      if (
        json &&
        typeof json.hash === 'string' &&
        (json.hash.startsWith('scrypt$') || json.hash.startsWith('pbkdf2$'))
      ) {
        return json.hash;
      }
    }
  } catch {
    // Fallback to browser Web Crypto PBKDF2
  }
  return hashPasswordPbkdf2(password);
}

/**
 * Verifies a plaintext password against a stored `scrypt$` or `pbkdf2$` hash.
 */
export async function verifyTeamPassword(
  password: string,
  storedHash: string
): Promise<{ valid: boolean; sessionToken?: string }> {
  if (!password || !storedHash) return { valid: false };

  try {
    const res = await fetch('/api/team/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, hash: storedHash }),
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        return {
          valid: Boolean(json?.valid),
          sessionToken: typeof json?.sessionToken === 'string' ? json.sessionToken : undefined,
        };
      }
    }
  } catch {
    // Fall back to runtime-agnostic local verification (supports both scrypt$ and pbkdf2$)
  }

  const valid = await verifyStoredPasswordHash(password, storedHash);
  return { valid };
}

export function generateStrongPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}
