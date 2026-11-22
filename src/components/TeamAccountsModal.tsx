import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  Copy,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  DollarSign,
  LayoutGrid,
  Loader2,
  Layers,
  Film,
} from 'lucide-react';
import { useAgencyData, DEFAULT_AGENCY_TEAM_MEMBERS } from '../context/AgencyDataContext';
import {
  AgencyTeamMember,
  PortalTabKey,
  TeamMemberPermissions,
  TeamRolePreset,
  WorkflowStageKey,
} from '../types';
import {
  PORTAL_TAB_CATALOG,
  TEAM_ROLE_PRESETS,
  ALL_PORTAL_TABS,
  WORKFLOW_STAGE_CATALOG,
  ALL_WORKFLOW_STAGES,
  getPresetPermissions,
  resolveMemberPermissions,
  normalizeUsername,
  hashTeamPassword,
  generateStrongPassword,
} from '../utils/teamAuth';

interface TeamAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
  onPreviewMember?: (member: AgencyTeamMember) => void;
}

export const TeamAccountsModal: React.FC<TeamAccountsModalProps> = ({
  isOpen,
  onClose,
  isAr = true,
  onPreviewMember,
}) => {
  const { data, addTeamMember, updateTeamMember, deleteTeamMember } = useAgencyData();

  const teamMembers = useMemo(
    () =>
      data.teamMembers && data.teamMembers.length > 0
        ? data.teamMembers
        : DEFAULT_AGENCY_TEAM_MEMBERS,
    [data.teamMembers]
  );

  // Active editor state (null = list view, 'new' = create form, string id = edit form)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [rolePreset, setRolePreset] = useState<TeamRolePreset>('content_creator');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<TeamMemberPermissions>(() =>
    getPresetPermissions('content_creator')
  );

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDeleteMember, setPendingDeleteMember] = useState<AgencyTeamMember | null>(null);

  if (!isOpen) return null;

  const flashNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const openCreateForm = (preset: TeamRolePreset = 'content_creator') => {
    const presetCfg = TEAM_ROLE_PRESETS.find((p) => p.key === preset) || TEAM_ROLE_PRESETS[0];
    setEditingId('new');
    setName('');
    setRoleTitle(isAr ? presetCfg.defaultRoleTitleAr : presetCfg.defaultRoleTitleEn);
    setRolePreset(preset);
    setUsername('');
    setPassword('');
    setShowPassword(true);
    setActive(true);
    setPermissions(getPresetPermissions(preset));
    setFormError(null);
  };

  const openEditForm = (member: AgencyTeamMember) => {
    const inferredPreset: TeamRolePreset = member.rolePreset || 'custom';
    setEditingId(member.id);
    setName(member.name);
    setRoleTitle(member.roleTitle);
    setRolePreset(inferredPreset);
    setUsername(member.username || '');
    setPassword('');
    setShowPassword(false);
    setActive(member.active);
    const resolvedPerms = resolveMemberPermissions(member);
    setPermissions(resolvedPerms);
    setFormError(null);
  };

  const applyPreset = (preset: TeamRolePreset) => {
    const cfg = TEAM_ROLE_PRESETS.find((p) => p.key === preset);
    setRolePreset(preset);
    setPermissions(getPresetPermissions(preset));
    if (cfg && (!roleTitle.trim() || TEAM_ROLE_PRESETS.some((p) => p.defaultRoleTitleAr === roleTitle || p.defaultRoleTitleEn === roleTitle))) {
      setRoleTitle(isAr ? cfg.defaultRoleTitleAr : cfg.defaultRoleTitleEn);
    }
  };

  const toggleTab = (tab: PortalTabKey) => {
    setRolePreset('custom');
    setPermissions((prev) => {
      const exists = prev.allowedTabs.includes(tab);
      const nextTabs = exists
        ? prev.allowedTabs.filter((t) => t !== tab)
        : [...prev.allowedTabs, tab];
      const hasFinanceTab = nextTabs.some((t) => t === 'invoices' || t === 'expenses');
      return {
        ...prev,
        allowedTabs: nextTabs,
        canViewFinancials: hasFinanceTab ? true : prev.canViewFinancials,
      };
    });
  };

  const toggleWorkflowStage = (stage: WorkflowStageKey) => {
    setRolePreset('custom');
    setPermissions((prev) => {
      const current = prev.allowedWorkflowStages ?? [...ALL_WORKFLOW_STAGES];
      const exists = current.includes(stage);
      const nextStages = exists
        ? current.filter((s) => s !== stage)
        : [...current, stage];
      return {
        ...prev,
        allowedWorkflowStages: nextStages,
      };
    });
  };

  const togglePermissionFlag = (
    key: keyof Omit<TeamMemberPermissions, 'allowedTabs' | 'allowedWorkflowStages'>
  ) => {
    setRolePreset('custom');
    setPermissions((prev) => {
      const nextVal = !prev[key];
      // If admin explicitly turns OFF canViewFinancials, also uncheck invoices & expenses for clarity
      if (key === 'canViewFinancials' && !nextVal) {
        return {
          ...prev,
          canViewFinancials: false,
          allowedTabs: prev.allowedTabs.filter((t) => t !== 'invoices' && t !== 'expenses'),
        };
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanRole = roleTitle.trim() || (isAr ? 'عضو فريق' : 'Team Member');
    const cleanUsername = normalizeUsername(username);
    const isCreating = editingId === 'new';
    const existingMember = !isCreating
      ? teamMembers.find((m) => m.id === editingId) || null
      : null;

    if (!cleanName) {
      setFormError(isAr ? 'يرجى إدخال اسم عضو الفريق.' : 'Please enter the member name.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setFormError(
        isAr
          ? 'يرجى إدخال اسم مستخدم صالح (3 أحرف إنجليزية أو أرقام على الأقل).'
          : 'Please enter a valid username (at least 3 alphanumeric characters).'
      );
      return;
    }

    // Check username uniqueness across other accounts
    const duplicate = teamMembers.find(
      (m) =>
        m.id !== editingId &&
        (m.username || '').trim().toLowerCase() === cleanUsername
    );
    if (duplicate) {
      setFormError(
        isAr
          ? `اسم المستخدم "@${cleanUsername}" مستخدم بالفعل لحساب "${duplicate.name}". اختر اسماً آخر.`
          : `Username "@${cleanUsername}" is already in use by "${duplicate.name}".`
      );
      return;
    }

    const needsPassword = isCreating || !existingMember?.passwordHash;
    if (needsPassword && password.length < 6) {
      setFormError(
        isAr
          ? 'يرجى إدخال كلمة مرور لا تقل عن 6 أحرف لتفعيل تسجيل الدخول.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }
    if (!needsPassword && password.length > 0 && password.length < 6) {
      setFormError(
        isAr
          ? 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.'
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    if (permissions.allowedTabs.length === 0) {
      setFormError(
        isAr
          ? 'يرجى اختيار شاشة واحدة على الأقل يمكن للعضو الوصول إليها.'
          : 'Please select at least one screen for this account.'
      );
      return;
    }

    setSaving(true);
    try {
      let nextPasswordHash = existingMember?.passwordHash;
      if (password.length >= 6) {
        nextPasswordHash = await hashTeamPassword(password);
      }

      if (isCreating) {
        addTeamMember({
          name: cleanName,
          roleTitle: cleanRole,
          rolePreset,
          username: cleanUsername,
          passwordHash: nextPasswordHash,
          permissions: {
            ...permissions,
            allowedTabs: [...permissions.allowedTabs],
            allowedWorkflowStages: permissions.allowedWorkflowStages
              ? [...permissions.allowedWorkflowStages]
              : [...ALL_WORKFLOW_STAGES],
          },
          active,
          createdAt: new Date().toISOString(),
        });
        flashNotice(
          isAr
            ? `تم إنشاء حساب "${cleanName}" (@${cleanUsername}) وتشفير كلمة المرور وحفظ صلاحياته بنجاح!`
            : `Account "${cleanName}" (@${cleanUsername}) created with encrypted password!`
        );
      } else if (existingMember) {
        updateTeamMember(existingMember.id, {
          name: cleanName,
          roleTitle: cleanRole,
          rolePreset,
          username: cleanUsername,
          passwordHash: nextPasswordHash,
          permissions: {
            ...permissions,
            allowedTabs: [...permissions.allowedTabs],
            allowedWorkflowStages: permissions.allowedWorkflowStages
              ? [...permissions.allowedWorkflowStages]
              : [...ALL_WORKFLOW_STAGES],
          },
          active,
        });
        flashNotice(
          isAr
            ? `تم تحديث حساب وصلاحيات "${cleanName}" (@${cleanUsername}) بنجاح!`
            : `Updated account & permissions for "${cleanName}".`
        );
      }

      setEditingId(null);
      setPassword('');
    } catch {
      setFormError(
        isAr
          ? 'حدث خطأ أثناء حفظ الحساب وتشفير كلمة المرور. حاول مرة أخرى.'
          : 'Failed to save account credentials. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    const cleanUser = normalizeUsername(username);
    const text = isAr
      ? `بيانات الدخول لبوابة ديجيتال إفكت (فريق العمل):\n👤 اسم المستخدم: ${cleanUser}\n🔑 كلمة المرور: ${password || '(كلمة المرور المحفوظة)'}`
      : `Digital Effect Team Portal Login:\nUsername: ${cleanUser}\nPassword: ${password || '(saved password)'}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId('form');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getTabLabel = (key: PortalTabKey) => {
    const found = PORTAL_TAB_CATALOG.find((t) => t.key === key);
    return found ? (isAr ? found.labelAr : found.labelEn) : key;
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black">
                {isAr
                  ? 'إدارة حسابات الفريق والصلاحيات المخصصة'
                  : 'Team Accounts & Granular Permissions'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {isAr
                  ? 'أنشئ حساباً لكل عضو بـ Username & Password واختر بحرية الشاشات والمهام التي يراها'
                  : 'Create Username & Password accounts and freely choose which screens & actions each member can access'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {editingId === null ? (
            /* ============================================================= */
            /* VIEW A: TEAM ACCOUNTS DIRECTORY                               */
            /* ============================================================= */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>
                      {isAr
                        ? `حسابات أعضاء الفريق المسجلة (${teamMembers.length})`
                        : `Registered Team Accounts (${teamMembers.length})`}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isAr
                      ? 'كل عضو يدخل من شاشة «دخول أعضاء الفريق» باسم المستخدم وكلمة المرور ولا يرى سوى الأقسام المحددة له.'
                      : 'Each member signs in with their Username & Password and sees only the screens you grant.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateForm('content_creator')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء حساب عضو جديد' : 'Create Team Account'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const hasLogin = Boolean(member.username && member.passwordHash);
                  const perms = resolveMemberPermissions(member);
                  const tabs = perms.allowedTabs || ['tasks', 'clients'];
                  const seesFinance = Boolean(perms.canViewFinancials);
                  const stagesCount = perms.allowedWorkflowStages?.length ?? 5;

                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        member.active
                          ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                          : 'bg-slate-50 border-slate-200/80 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-slate-900">{member.name}</span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {member.roleTitle}
                            </span>
                            {hasLogin ? (
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <Key className="w-3 h-3" />
                                <span>@{member.username}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                {isAr ? 'بدون بيانات دخول بعد' : 'No login credentials yet'}
                              </span>
                            )}
                            {!member.active && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                {isAr ? 'حساب موقوف' : 'Suspended'}
                              </span>
                            )}
                          </div>

                          {/* Permissions Summary Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                                seesFinance
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {seesFinance ? (
                                <Unlock className="w-2.5 h-2.5 text-amber-600" />
                              ) : (
                                <Lock className="w-2.5 h-2.5 text-slate-500" />
                              )}
                              <span>
                                {seesFinance
                                  ? isAr
                                    ? 'يرى الحسابات والأسعار'
                                    : 'Financials Visible'
                                  : isAr
                                  ? 'الحسابات والأسعار مخفية'
                                  : 'No Financial Access'}
                              </span>
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5" />
                              <span>
                                {isAr
                                  ? `مراحل التايم لاين: ${stagesCount}/5`
                                  : `Timeline Stages: ${stagesCount}/5`}
                              </span>
                            </span>

                            {!perms.canAssignTasks && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {isAr ? 'تسجيل تلقائي باسمه' : 'Auto-Stamped Name'}
                              </span>
                            )}

                            {perms.canManageAdWallet && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                                {perms.canApproveAdWallet
                                  ? isAr
                                    ? 'اعتماد محفظة الإعلانات (محاسب)'
                                    : 'Ad Wallet Approver'
                                  : isAr
                                  ? 'محفظة الإعلانات (طلب رصيد/صرف)'
                                  : 'Ad Wallet Access'}
                              </span>
                            )}

                            {perms.onlyAssignedTasks && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                {isAr ? 'مهامه المسندة فقط' : 'Assigned Tasks Only'}
                              </span>
                            )}

                            {tabs.map((tabKey) => (
                              <span
                                key={tabKey}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/80"
                              >
                                {getTabLabel(tabKey)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {onPreviewMember && member.active && (
                            <button
                              type="button"
                              onClick={() => {
                                onPreviewMember(member);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                              title={isAr ? 'معاينة البوابة كما يراها هذا العضو' : 'Preview portal as this member'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isAr ? 'معاينة حسابه' : 'Preview'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditForm(member)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>
                              {hasLogin
                                ? isAr
                                  ? 'تعديل الصلاحيات / الباسورد'
                                  : 'Edit & Password'
                                : isAr
                                ? 'إعداد الدخول والصلاحيات'
                                : 'Setup Login'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateTeamMember(member.id, { active: !member.active })
                            }
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer ${
                              member.active
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                          >
                            {member.active
                              ? isAr
                                ? 'إيقاف'
                                : 'Suspend'
                              : isAr
                              ? 'تفعيل'
                              : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setPendingDeleteMember(member)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer"
                            title={isAr ? 'حذف الحساب' : 'Delete Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline Delete Confirmation */}
              {pendingDeleteMember && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-rose-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {isAr
                        ? `هل تريد حذف حساب "${pendingDeleteMember.name}" نهائياً وإيقاف دخوله للنظام؟`
                        : `Permanently delete account "${pendingDeleteMember.name}"?`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPendingDeleteMember(null)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteTeamMember(pendingDeleteMember.id);
                        flashNotice(
                          isAr
                            ? `تم حذف حساب "${pendingDeleteMember.name}".`
                            : `Deleted "${pendingDeleteMember.name}".`
                        );
                        setPendingDeleteMember(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? 'نعم، احذف' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ============================================================= */
            /* VIEW B: CREATE / EDIT TEAM MEMBER ACCOUNT & PERMISSIONS       */
            /* ============================================================= */
            <form onSubmit={handleSaveAccount} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>
                    {editingId === 'new'
                      ? isAr
                        ? 'إنشاء حساب عضو فريق جديد'
                        : 'Create New Team Member Account'
                      : isAr
                      ? `تعديل حساب وصلاحيات: ${name}`
                      : `Edit Account & Permissions: ${name}`}
                  </span>
                </h4>

                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'العودة لقائمة الفريق' : 'Back to List'}
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Step 1: Identity & Login Credentials */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>
                    {isAr
                      ? '1. بيانات العضو وحساب الدخول (Username & Password)'
                      : '1. Member Profile & Login Credentials'}
                  </span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      {isAr ? 'اسم العضو (يظهر في تعيين المهام):' : 'Full Name:'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? 'مثال: سارة محمود' : 'e.g. Sara Mahmoud'}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      {isAr ? 'المسمى الوظيفي:' : 'Role Title:'}
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder={isAr ? 'مثال: Content Creator' : 'e.g. Content Creator'}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      {isAr ? 'اسم المستخدم (Username):' : 'Username:'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="sara.content"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                    {username.trim() && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isAr ? 'سيتم الحفظ باسم:' : 'Normalized:'} @{normalizeUsername(username)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        {isAr ? 'كلمة المرور (Password):' : 'Password:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPassword(generateStrongPassword(10));
                          setShowPassword(true);
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isAr ? 'توليد تلقائي' : 'Generate'}</span>
                      </button>
                    </div>
                    <div className="relative flex items-center gap-1.5">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        dir="ltr"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          editingId === 'new'
                            ? isAr
                              ? '6 أحرف على الأقل...'
                              : 'Min 6 chars...'
                            : isAr
                            ? 'اتركه فارغاً للإبقاء على الحالي'
                            : 'Leave blank to keep current'
                        }
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                        title={showPassword ? 'Hide' : 'Show'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {username.trim() && password.length >= 6 && (
                        <button
                          type="button"
                          onClick={handleCopyCredentials}
                          className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer shrink-0"
                          title={isAr ? 'نسخ بيانات الدخول لإرسالها للعضو' : 'Copy credentials'}
                        >
                          {copiedId === 'form' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Quick Role Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>
                      {isAr
                        ? '2. قالب جاهز سريع (اختياري — ويمكنك التعديل بحرية أدناه)'
                        : '2. Quick Role Template (Optional — customize freely below)'}
                    </span>
                  </h5>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {TEAM_ROLE_PRESETS.map((preset) => {
                    const selected = rolePreset === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => applyPreset(preset.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        {isAr ? preset.labelAr : preset.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Open Screen/Section Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-sky-600" />
                    <span>
                      {isAr
                        ? `3. اختر الشاشات والأقسام المسموح للعضو برؤيتها (${permissions.allowedTabs.length} / ${ALL_PORTAL_TABS.length})`
                        : `3. Select Allowed Screens & Sections (${permissions.allowedTabs.length} / ${ALL_PORTAL_TABS.length})`}
                    </span>
                  </h5>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRolePreset('custom');
                        setPermissions((prev) => ({
                          ...prev,
                          allowedTabs: PORTAL_TAB_CATALOG.filter((t) => !t.isFinancial).map(
                            (t) => t.key
                          ),
                          canViewFinancials: false,
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black cursor-pointer"
                    >
                      {isAr ? 'الكل ماعدا الحسابات' : 'All Non-Financial'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRolePreset('custom');
                        setPermissions((prev) => ({
                          ...prev,
                          allowedTabs: [...ALL_PORTAL_TABS],
                          canViewFinancials: true,
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black cursor-pointer"
                    >
                      {isAr ? 'تحديد كل الشاشات' : 'Select All'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PORTAL_TAB_CATALOG.map((tab) => {
                    const checked = permissions.allowedTabs.includes(tab.key);
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => toggleTab(tab.key)}
                        className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                          checked
                            ? tab.isFinancial
                              ? 'bg-amber-50/90 border-amber-400 shadow-2xs'
                              : 'bg-indigo-50/80 border-indigo-400 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                            checked
                              ? tab.isFinancial
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900">
                              {isAr ? tab.labelAr : tab.labelEn}
                            </span>
                            {tab.isFinancial && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                {isAr ? 'مالي' : 'Finance'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            {isAr ? tab.descAr : tab.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Timeline Stages & Auto-Assignment Controls */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>
                      {isAr
                        ? '4. مراحل التايم لاين المسموح لهذا العضو بالعمل عليها'
                        : '4. Allowed Timeline Stages for This Member'}
                    </span>
                  </h5>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRolePreset('custom');
                        setPermissions((prev) => ({
                          ...prev,
                          allowedWorkflowStages: ['content_creator', 'client_approve', 'publish'],
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-black cursor-pointer"
                    >
                      {isAr ? 'مراحل صانع المحتوى (3)' : 'Content Creator (3)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRolePreset('custom');
                        setPermissions((prev) => ({
                          ...prev,
                          allowedWorkflowStages: [...ALL_WORKFLOW_STAGES],
                          canUpdateReelsTrack: true,
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black cursor-pointer"
                    >
                      {isAr ? 'كل المراحل (5)' : 'All 5 Stages'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {WORKFLOW_STAGE_CATALOG.map((stage) => {
                    const checked = (
                      permissions.allowedWorkflowStages ?? ALL_WORKFLOW_STAGES
                    ).includes(stage.key);
                    return (
                      <button
                        key={stage.key}
                        type="button"
                        onClick={() => toggleWorkflowStage(stage.key)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          checked
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            checked
                              ? 'bg-white/20 border-white/40 text-white'
                              : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="text-[11px] font-black leading-tight">{stage.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => togglePermissionFlag('canUpdateReelsTrack')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      permissions.canUpdateReelsTrack !== false
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span className="text-[11px] font-black leading-tight">
                      {isAr ? 'خط الريلز' : 'Reels Track'}
                    </span>
                  </button>
                </div>

                <p className="text-[10px] text-indigo-900/75 leading-relaxed">
                  {isAr
                    ? 'المراحل غير المحددة ستظهر للموظف للعرض فقط (مقفلة) حتى يتابع سير العمل بدون القدرة على تعديل مهام الأقسام الأخرى.'
                    : 'Unchecked stages remain visible as read-only so the member can track progress without modifying other departments.'}
                </p>
              </div>

              {/* Step 5: Granular Action Capabilities */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isAr
                      ? '5. صلاحيات تفصيلية داخل الشاشات (الأسعار، التعيين التلقائي، التعديل، والحذف)'
                      : '5. Granular Capabilities & Data Visibility'}
                  </span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300">
                    <input
                      type="checkbox"
                      checked={Boolean(permissions.canAssignTasks)}
                      onChange={() => togglePermissionFlag('canAssignTasks')}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'إظهار قائمة اختيار المسؤول (+ مسؤول) على المهام' : 'Allow Manual Assignee Picker (+ Assign)'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'عند إيقافه (مُوصى به للفريق): تختفي قائمة اختيار المسؤول ويتم تسجيل كل مهمة تلقائياً باسم الحساب الداخل.'
                          : 'When OFF: hides the assignee dropdown and automatically stamps every updated task with the logged-in member name.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-amber-300">
                    <input
                      type="checkbox"
                      checked={permissions.canViewFinancials}
                      onChange={() => togglePermissionFlag('canViewFinancials')}
                      className="mt-0.5 w-4 h-4 accent-amber-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'رؤية الحسابات والأسعار والفواتير' : 'View Pricing, Billing & Financials'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'عند إيقافه: تختفي أسعار الباقات، حالة السداد، MRR، الفواتير، وتبويبات المالية وكشف الحساب تماماً.'
                          : 'When OFF: hides client budgets, payment status, MRR, invoices, and billing tabs.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={Boolean(permissions.canManageAdWallet)}
                      onChange={() => togglePermissionFlag('canManageAdWallet')}
                      className="mt-0.5 w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'محفظة الإعلانات الممولة (للميديا باير)' : 'Ad Spend Wallet Access (Media Buyer)'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'يُظهر رصيد محفظة الإعلانات ويتيح تقديم طلب إضافة رصيد وتسجيل مصروفات الإعلانات (بانتظار موافقة المحاسب) دون كشف أسعار الباقات.'
                          : 'Shows client ad wallet balance and allows submitting top-up & ad spend requests for accountant approval.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300">
                    <input
                      type="checkbox"
                      checked={Boolean(permissions.canApproveAdWallet)}
                      onChange={() => togglePermissionFlag('canApproveAdWallet')}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'اعتماد وموافقة المحاسب على محفظة الإعلانات' : 'Accountant Approval for Ad Wallet'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'يتيح الموافقة على إضافة الرصيد الإعلاني (لينزل تلقائياً في الفاتورة) والموافقة على مصروفات الإعلانات لخصمها من الرصيد.'
                          : 'Allows approving ad credit top-ups (auto-added to invoice) and approving ad spend deductions.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={permissions.onlyAssignedTasks}
                      onChange={() => togglePermissionFlag('onlyAssignedTasks')}
                      className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'عرض المهام المسندة له فقط في لوحة المهام' : 'Show Only Assigned Tasks'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'يرى فقط المراحل والريلز المعينة باسمه في تبويب «مهام اليوم والفريق».'
                          : 'Restricts Team Tasks view to stages & reels assigned to this member.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={permissions.canEditClients}
                      onChange={() => togglePermissionFlag('canEditClients')}
                      className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'إضافة وتعديل بيانات العملاء والباقات' : 'Add & Edit Clients & Packages'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'يسمح بإضافة عملاء جدد وتعديل تفاصيل حساباتهم (بينما تحديث مراحله والمخرجات متاح دائماً).'
                          : 'Allows adding clients and editing profiles (stage/deliverable updates remain enabled).'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-rose-300">
                    <input
                      type="checkbox"
                      checked={permissions.canDeleteRecords}
                      onChange={() => togglePermissionFlag('canDeleteRecords')}
                      className="mt-0.5 w-4 h-4 accent-rose-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'السماح بحذف العملاء أو السجلات' : 'Allow Deleting Clients & Records'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'يفضل إبقاء هذا الخيار مغلقاً لحماية بيانات العملاء من الحذف بالخطأ.'
                          : 'Keep disabled to prevent accidental deletions.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={permissions.canManageTeam}
                      onChange={() => togglePermissionFlag('canManageTeam')}
                      className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'إدارة قائمة أعضاء الفريق' : 'Manage Team Roster'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'إضافة أو إزالة أعضاء من شريط الفريق داخل تبويب المهام.'
                          : 'Add or remove members from the Team Tasks roster bar.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => setActive((prev) => !prev)}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-slate-900 block">
                        {isAr ? 'الحساب نشط ومسموح له بتسجيل الدخول' : 'Account Active (Login Enabled)'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isAr
                          ? 'يمكنك إيقاف الحساب في أي وقت لمنع الدخول فوراً دون حذف سجله.'
                          : 'Disable anytime to immediately revoke login access.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري التشفير والحفظ...' : 'Encrypting & Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {editingId === 'new'
                          ? isAr
                            ? 'إنشاء الحساب وحفظ الصلاحيات'
                            : 'Create Account & Save'
                          : isAr
                          ? 'حفظ التعديلات والصلاحيات'
                          : 'Save Changes'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
