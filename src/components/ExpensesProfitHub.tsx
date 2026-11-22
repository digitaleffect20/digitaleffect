import React, { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Repeat,
  PieChart,
  CheckCircle2,
  X,
  Search,
  DollarSign,
} from 'lucide-react';
import { useAgencyData } from '../context/AgencyDataContext';
import { AgencyExpense, ExpenseCategory } from '../types';

interface ExpensesProfitHubProps {
  isAr?: boolean;
}

const EXPENSE_CATEGORIES: Array<{
  id: ExpenseCategory;
  labelAr: string;
  labelEn: string;
  color: string;
  badgeClass: string;
}> = [
  {
    id: 'salaries',
    labelAr: 'رواتب الفريق',
    labelEn: 'Team Salaries',
    color: 'bg-blue-600',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'freelancers',
    labelAr: 'فريلانسرز وتصوير',
    labelEn: 'Freelancers & Shoots',
    color: 'bg-purple-600',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    id: 'tools',
    labelAr: 'اشتراكات وأدوات',
    labelEn: 'Software & Tools',
    color: 'bg-indigo-600',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    id: 'ads',
    labelAr: 'إعلانات الوكالة',
    labelEn: 'Agency Marketing',
    color: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'rent',
    labelAr: 'إيجار ومرافق ومكتب',
    labelEn: 'Office & Utilities',
    color: 'bg-teal-600',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'other',
    labelAr: 'مصروفات تشغيلية أخرى',
    labelEn: 'Other Operating',
    color: 'bg-slate-600',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

function getCategoryMeta(cat: ExpenseCategory) {
  return EXPENSE_CATEGORIES.find((c) => c.id === cat) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export const ExpensesProfitHub: React.FC<ExpensesProfitHubProps> = ({ isAr = true }) => {
  const { data, addExpense, deleteExpense } = useAgencyData();

  const [periodFilter, setPeriodFilter] = useState<'this_month' | 'last_3_months' | 'this_year' | 'all'>('this_month');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('salaries');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('إنستاباي / تحويل بنكي');
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const expenses = data.expenses || [];
  const invoices = data.invoices || [];

  const isDateInPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    if (periodFilter === 'all') return true;
    const now = new Date();
    const d = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
    if (isNaN(d.getTime())) return false;

    if (periodFilter === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'last_3_months') {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return d >= cutoff;
    }
    if (periodFilter === 'this_year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Realized collected revenue in selected period (supports partial payments + full paid invoices)
  const collectedRevenue = useMemo(() => {
    let total = 0;
    invoices
      .filter((inv) => inv.paymentStatus !== 'cancelled')
      .forEach((inv) => {
        if (Array.isArray(inv.payments) && inv.payments.length > 0) {
          inv.payments.forEach((p) => {
            if (isDateInPeriod(p.date || inv.issueDate)) {
              total += Number(p.amount) || 0;
            }
          });
        } else if (inv.paymentStatus === 'paid') {
          if (isDateInPeriod(inv.paidAt || inv.issueDate)) {
            total += Number(inv.grandTotal) || 0;
          }
        }
      });
    return total;
  }, [invoices, periodFilter]);

  // Period expenses
  const periodExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInPeriod(e.date));
  }, [expenses, periodFilter]);

  const filteredExpenses = useMemo(() => {
    return periodExpenses.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !e.title.toLowerCase().includes(q) &&
          !(e.notes || '').toLowerCase().includes(q) &&
          !(e.paymentMethod || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [periodExpenses, categoryFilter, searchQuery]);

  const totalExpenses = useMemo(
    () => periodExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [periodExpenses]
  );

  const recurringMonthlyBurn = useMemo(
    () => expenses.filter((e) => e.recurring).reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const netProfit = collectedRevenue - totalExpenses;
  const profitMargin =
    collectedRevenue > 0 ? Math.round((netProfit / collectedRevenue) * 100) : 0;

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    periodExpenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + (Number(e.amount) || 0));
    });
    return EXPENSE_CATEGORIES.map((cat) => {
      const value = map.get(cat.id) || 0;
      const pct = totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0;
      return { ...cat, value, pct };
    }).sort((a, b) => b.value - a.value);
  }, [periodExpenses, totalExpenses]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Math.max(0, parseFloat(amount) || 0);
    if (!title.trim() || numericAmount <= 0) return;

    addExpense({
      title: title.trim(),
      category,
      amount: numericAmount,
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod.trim() || undefined,
      recurring,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setRecurring(false);
    setIsAddModalOpen(false);
    showToast(isAr ? 'تم تسجيل المصروف وتحديث صافي الربح بنجاح!' : 'Expense recorded & Net Profit updated!');
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              {isAr ? 'مصروفات الوكالة وصافي الربح (Net Profit)' : 'Agency Expenses & Net Profit'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'تسجيل مصروفات التشغيل (رواتب، فريلانسرز، اشتراكات، إيجار) ومقارنتها بالتحصيل الفعلي لحساب صافي الربح الشهري تلقائياً.'
              : 'Track monthly operating costs against realized collections to monitor true agency net profit.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {(
              [
                { id: 'this_month', ar: 'هذا الشهر', en: 'This Month' },
                { id: 'last_3_months', ar: '3 أشهر', en: '3M' },
                { id: 'this_year', ar: 'السنة', en: 'Year' },
                { id: 'all', ar: 'الكل', en: 'All' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriodFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === opt.id
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {isAr ? opt.ar : opt.en}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'تسجيل مصروف جديد' : 'Add Expense'}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700">
              {isAr ? 'إجمالي التحصيل الفعلي' : 'Realized Collected'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-950 font-mono block">
            {collectedRevenue.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isAr ? 'يشمل الفواتير المسددة والدفعات الجزئية' : 'Includes full & partial payments'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700">
              {isAr ? 'إجمالي المصروفات' : 'Total Expenses'}
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-900 font-mono block">
            {totalExpenses.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {periodExpenses.length} {isAr ? 'بند مصروف مسجل' : 'expense records'}
          </span>
        </div>

        <div
          className={`rounded-2xl p-5 border shadow-sm space-y-1 ${
            netProfit >= 0
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-950 text-white border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">
              {isAr ? 'صافي الربح (Net Profit)' : 'Net Profit'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/30 text-rose-200'
              }`}
            >
              {isAr ? `هامش ${profitMargin}%` : `${profitMargin}% Margin`}
            </span>
          </div>
          <span
            className={`text-2xl font-black font-mono block ${
              netProfit >= 0 ? 'text-emerald-400' : 'text-rose-300'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}
            {netProfit.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isAr ? 'التحصيل الفعلي مطروحاً منه المصروفات' : 'Collected Revenue − Operating Expenses'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700">
              {isAr ? 'التزامات شهرية ثابتة' : 'Recurring Monthly Burn'}
            </span>
            <Repeat className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-950 font-mono block">
            {recurringMonthlyBurn.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isAr ? 'المصروفات المعلّمة كـ «متكررة شهرياً»' : 'Marked as monthly recurring'}
          </span>
        </div>
      </div>

      {/* Category Distribution + Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <span>{isAr ? 'توزيع المصروفات حسب البند' : 'Expenses by Category'}</span>
          </h3>

          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {isAr ? cat.labelAr : cat.labelEn}
                  </span>
                  <span className="font-black text-slate-900 font-mono">
                    {cat.value.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}{' '}
                    <span className="text-[10px] text-slate-400">({cat.pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cat.color}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Ledger List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في المصروفات...' : 'Search expenses...'}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'}`} />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 cursor-pointer"
            >
              <option value="all">{isAr ? 'كل البنود' : 'All Categories'}</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? c.labelAr : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center space-y-2.5 text-slate-400 flex-1 flex flex-col items-center justify-center">
              <DollarSign className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-bold text-slate-500">
                {isAr ? 'لا توجد مصروفات مسجلة في هذه الفترة بعد.' : 'No expenses recorded in this period yet.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة أول مصروف' : 'Add First Expense'}</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredExpenses.map((exp: AgencyExpense) => {
                const catMeta = getCategoryMeta(exp.category);
                return (
                  <div
                    key={exp.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">{exp.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.badgeClass}`}>
                          {isAr ? catMeta.labelAr : catMeta.labelEn}
                        </span>
                        {exp.recurring && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            <span>{isAr ? 'شهري ثابت' : 'Recurring'}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-mono" dir="ltr">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {exp.date}
                        </span>
                        {exp.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>{exp.paymentMethod}</span>
                          </>
                        )}
                        {exp.notes && (
                          <>
                            <span>•</span>
                            <span className="italic">{exp.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-rose-700 font-mono">
                        -{Number(exp.amount).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteExpense(exp.id);
                          showToast(isAr ? 'تم حذف المصروف.' : 'Expense deleted.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={isAr ? 'حذف المصروف' : 'Delete Expense'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black">
                  {isAr ? 'تسجيل مصروف تشغيلي جديد' : 'Record New Operating Expense'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'بيان المصروف:' : 'Expense Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: راتب المصمم / اشتراك Adobe / فريلانس مونتاج' : 'e.g. Designer Salary / Adobe Sub'}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'البند / التصنيف:' : 'Category:'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.labelAr : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'المبلغ (ج.م):' : 'Amount (EGP):'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full text-xs font-mono font-black p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'التاريخ:' : 'Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'وسيلة الدفع:' : 'Payment Method:'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 cursor-pointer"
                  >
                    <option value="إنستاباي">{isAr ? 'إنستاباي (InstaPay)' : 'InstaPay'}</option>
                    <option value="محفظة إلكترونية">{isAr ? 'محفظة إلكترونية' : 'E-Wallet'}</option>
                    <option value="تحويل بنكي">{isAr ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                    <option value="نقدي (كاش)">{isAr ? 'نقدي (كاش)' : 'Cash'}</option>
                    <option value="بطاقة بنكية / أونلاين">{isAr ? 'بطاقة بنكية / أونلاين' : 'Card / Online'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'ملاحظات (اختياري):' : 'Notes (Optional):'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'تفاصيل إضافية...' : 'Additional notes...'}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-indigo-950">
                  {isAr ? 'مصروف شهري متكرر (ثابت)' : 'Monthly Recurring Expense'}
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'حفظ المصروف' : 'Save Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
