import { Inquiry, ServicePackage } from '../types';

export interface ClientDeliverableTargets {
  postsTarget: number;
  reelsTarget: number;
  storiesTarget: number;
  totalTarget: number;
  source: 'parsed_from_name' | 'matched_package' | 'explicit' | 'sector_default';
}

/**
 * Resolves the true deliverables targets for a client.
 * Prioritizes numbers explicitly mentioned in the package name (e.g. "8 منشور • 4 ريلز"),
 * then matched catalog package specs, then explicit saved targets, then sector baseline.
 */
export const getClientDeliverableTargets = (
  client: Inquiry,
  packages: ServicePackage[] = []
): ClientDeliverableTargets => {
  // 1. If client.packageId matches a package in packages catalog
  if (client.packageId && packages && packages.length > 0) {
    const pkg = packages.find((p) => p.id === client.packageId);
    if (pkg && (pkg.postsCount !== undefined || pkg.reelsCount !== undefined)) {
      const posts = pkg.postsCount ?? 0;
      const reels = pkg.reelsCount ?? 0;
      const stories = pkg.storiesCount ?? 0;
      return {
        postsTarget: posts,
        reelsTarget: reels,
        storiesTarget: stories,
        totalTarget: Math.max(1, posts + reels + stories),
        source: 'matched_package',
      };
    }
  }

  // 2. If explicit targets were saved on the client (e.g., customized in Client Profile / Package Editor)
  if (
    (client.postsTarget !== undefined && client.postsTarget > 0) ||
    (client.reelsTarget !== undefined && client.reelsTarget > 0) ||
    (client.storiesTarget !== undefined && client.storiesTarget > 0)
  ) {
    const posts = client.postsTarget ?? 0;
    const reels = client.reelsTarget ?? 0;
    const stories = client.storiesTarget ?? 0;
    return {
      postsTarget: posts,
      reelsTarget: reels,
      storiesTarget: stories,
      totalTarget: Math.max(1, posts + reels + stories),
      source: 'explicit',
    };
  }

  // 3. Try parsing directly from client.packageName if it contains numbers like (8 منشور • 4 ريلز)
  if (client.packageName) {
    const nameStr = client.packageName;
    const postsMatch = nameStr.match(/(\d+)\s*(?:منشور|posts?)/i);
    const reelsMatch = nameStr.match(/(\d+)\s*(?:ريلز|reels?)/i);
    const storiesMatch = nameStr.match(/(\d+)\s*(?:ستوريز|stories?)/i);

    if (postsMatch || reelsMatch || storiesMatch) {
      const posts = postsMatch ? parseInt(postsMatch[1], 10) : (client.postsTarget ?? 0);
      const reels = reelsMatch ? parseInt(reelsMatch[1], 10) : (client.reelsTarget ?? 0);
      const stories = storiesMatch ? parseInt(storiesMatch[1], 10) : (client.storiesTarget ?? 0);
      return {
        postsTarget: posts,
        reelsTarget: reels,
        storiesTarget: stories,
        totalTarget: Math.max(1, posts + reels + stories),
        source: 'parsed_from_name',
      };
    }
  }

  // 4. Match package by name in catalog
  if (client.packageName && packages && packages.length > 0) {
    const pkg = packages.find((p) => 
      p.name.trim().toLowerCase() === client.packageName?.trim().toLowerCase() ||
      p.nameEn?.trim().toLowerCase() === client.packageName?.trim().toLowerCase() ||
      client.packageName?.includes(p.name) ||
      (p.nameEn && client.packageName?.includes(p.nameEn))
    );
    if (pkg && (pkg.postsCount !== undefined || pkg.reelsCount !== undefined)) {
      const posts = pkg.postsCount ?? 0;
      const reels = pkg.reelsCount ?? 0;
      const stories = pkg.storiesCount ?? 0;
      return {
        postsTarget: posts,
        reelsTarget: reels,
        storiesTarget: stories,
        totalTarget: Math.max(1, posts + reels + stories),
        source: 'matched_package',
      };
    }
  }

  // 5. Fallback based on sector official pricing sheet
  const defaultP = client.sector === 'b2b' ? 4 : client.sector === 'medical' ? 8 : 12;
  const defaultR = client.sector === 'b2b' ? 0 : client.sector === 'medical' ? 4 : 2;
  const defaultS = client.sector === 'b2c' ? 2 : 0;

  const posts = client.postsTarget ?? defaultP;
  const reels = client.reelsTarget ?? defaultR;
  const stories = client.storiesTarget ?? defaultS;

  return {
    postsTarget: posts,
    reelsTarget: reels,
    storiesTarget: stories,
    totalTarget: Math.max(1, posts + reels + stories),
    source: 'sector_default',
  };
};

export interface ClientOverdueInfo {
  isOverdue: boolean;
  daysOverdue: number;
  dueFormatted: string;
  badgeTextAr: string;
  badgeTextEn: string;
  alertTitleAr: string;
  alertTitleEn: string;
  alertReasonAr: string;
  alertReasonEn: string;
  stalledStageName?: string;
}

/**
 * Checks whether a client has overdue/delayed tasks exceeding the scheduled due date.
 */
export const getClientOverdueStatus = (client: Inquiry, isAr: boolean = true): ClientOverdueInfo => {
  const stages = client.workflowStages || [];
  const isAllCompleted = stages.length > 0 && stages.every((s) => s.status === 'completed');

  // If all deliverables / stages are already completed, it is not overdue
  if (isAllCompleted) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      dueFormatted: client.renewalDate || '',
      badgeTextAr: '',
      badgeTextEn: '',
      alertTitleAr: '',
      alertTitleEn: '',
      alertReasonAr: '',
      alertReasonEn: '',
    };
  }

  // 1. Check if renewalDate (deadline for deliverables handoff) has passed
  if (client.renewalDate) {
    try {
      const parts = client.renewalDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const [year, month, day] = parts;
        // End of the due date in local time
        const dueDate = new Date(year, month - 1, day, 23, 59, 59);
        const now = new Date();
        const diffMs = now.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
          const daysTextAr = diffDays === 0 ? 'مستحقة اليوم' : `متأخرة منذ ${diffDays} يوم`;
          const daysTextEn = diffDays === 0 ? 'Due Today' : `Overdue by ${diffDays}d`;
          const stalled = stages.find((s) => s.status === 'in_progress') || stages.find((s) => s.status === 'pending');

          return {
            isOverdue: true,
            daysOverdue: diffDays,
            dueFormatted: client.renewalDate,
            badgeTextAr: daysTextAr,
            badgeTextEn: daysTextEn,
            alertTitleAr: `مهام متأخرة تجاوزت موعد الاستحقاق (${daysTextAr})`,
            alertTitleEn: `Tasks Overdue (${daysTextEn})`,
            alertReasonAr: `تجاوز تاريخ الاستحقاق المحدد (${client.renewalDate}) والمتبقي لم يكتمل بعد.`,
            alertReasonEn: `Exceeded scheduled due date (${client.renewalDate}) with pending deliverables.`,
            stalledStageName: stalled?.title,
          };
        }
      }
    } catch (e) {
      console.error('Error parsing client renewalDate:', e);
    }
  }

  // 2. Check if contractStatus is renewal_due
  if (client.contractStatus === 'renewal_due') {
    return {
      isOverdue: true,
      daysOverdue: 1,
      dueFormatted: client.renewalDate || '',
      badgeTextAr: 'تجديد متأخر',
      badgeTextEn: 'Renewal Overdue',
      alertTitleAr: 'الاشتراك قيد التجديد وتوجد مهام متأخرة',
      alertTitleEn: 'Renewal Due & Tasks Stalled',
      alertReasonAr: 'الاشتراك الشهري مستحق التجديد ولم يتم إنهاء وتسليم كافة مخرجات الشهر الحالي.',
      alertReasonEn: 'Subscription cycle is due for renewal and deliverables are not finalized.',
    };
  }

  return {
    isOverdue: false,
    daysOverdue: 0,
    dueFormatted: client.renewalDate || '',
    badgeTextAr: '',
    badgeTextEn: '',
    alertTitleAr: '',
    alertTitleEn: '',
    alertReasonAr: '',
    alertReasonEn: '',
  };
};
