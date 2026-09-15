import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../contexts/ExpenseContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { BudgetBadge } from '../components/common/BudgetBadge';
import { formatCurrency } from '../lib/utils';
import {
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Calendar,
  Save,
  Info,
} from 'lucide-react';
import { getDaysInMonth, getDate } from 'date-fns';

export const Budget: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const {
    todaySpending,
    dailyBudgetStatus,
    monthlySpending,
    monthlyBudgetStatus,
    currency,
  } = useExpenses();

  const [dailyInput, setDailyInput] = useState<string>('500');
  const [monthlyInput, setMonthlyInput] = useState<string>('15000');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setDailyInput(profile.daily_budget.toString());
      setMonthlyInput(profile.monthly_budget.toString());
    }
  }, [profile]);

  const handleSaveBudgets = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const dVal = parseFloat(dailyInput);
    const mVal = parseFloat(monthlyInput);

    if (isNaN(dVal) || dVal <= 0) {
      setErrorMessage('Daily budget must be a positive number');
      return;
    }

    if (isNaN(mVal) || mVal <= 0) {
      setErrorMessage('Monthly budget must be a positive number');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      daily_budget: dVal,
      monthly_budget: mVal,
    });
    setIsSaving(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('Budget limits updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Safe daily spend calculation
  const today = new Date();
  const daysInMonth = getDaysInMonth(today);
  const currentDay = getDate(today);
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const safeDailyTarget = Math.max(0, Math.round(monthlyBudgetStatus.remaining / remainingDays));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Budget Configuration & Alerts
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Set your daily and monthly targets and monitor your threshold alert levels
        </p>
      </div>

      {/* Set Budgets Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <PiggyBank size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Set Your Budget Limits
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SpendSmart will trigger alerts as your spending approaches these numbers.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSaveBudgets} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Daily Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Budget Target ({currency})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-semibold text-sm">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={dailyInput}
                  onChange={(e) => setDailyInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 pl-8 pr-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ideal for pocket money, food & daily transit.
              </p>
            </div>

            {/* Monthly Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Monthly Budget Target ({currency})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-semibold text-sm">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={monthlyInput}
                  onChange={(e) => setMonthlyInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 pl-8 pr-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Overall monthly budget for all expenses.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Budget Limits'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Calculation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Budget Status Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Budget Health
            </h3>
            <BudgetBadge level={dailyBudgetStatus.alertLevel} />
          </div>

          {/* Key numbers */}
          <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="block text-[11px] text-slate-400 font-medium">Spent</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(todaySpending, currency)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 font-medium">Remaining</span>
              <span
                className={`text-sm sm:text-base font-bold ${
                  dailyBudgetStatus.remaining >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(dailyBudgetStatus.remaining, currency)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 font-medium">Usage</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {dailyBudgetStatus.percentage}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span>Daily limit: {formatCurrency(dailyBudgetStatus.budget, currency)}</span>
              <span>{dailyBudgetStatus.percentage}% used</span>
            </div>
            <ProgressBar
              percentage={dailyBudgetStatus.percentage}
              alertLevel={dailyBudgetStatus.alertLevel}
              height="lg"
              showMarkers={true}
            />
          </div>
        </div>

        {/* Monthly Budget Status Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Budget Health
            </h3>
            <BudgetBadge level={monthlyBudgetStatus.alertLevel} />
          </div>

          {/* Key numbers */}
          <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="block text-[11px] text-slate-400 font-medium">Spent</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(monthlySpending, currency)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 font-medium">Remaining</span>
              <span
                className={`text-sm sm:text-base font-bold ${
                  monthlyBudgetStatus.remaining >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(monthlyBudgetStatus.remaining, currency)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 font-medium">Usage</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {monthlyBudgetStatus.percentage}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span>Monthly limit: {formatCurrency(monthlyBudgetStatus.budget, currency)}</span>
              <span>{monthlyBudgetStatus.percentage}% used</span>
            </div>
            <ProgressBar
              percentage={monthlyBudgetStatus.percentage}
              alertLevel={monthlyBudgetStatus.alertLevel}
              height="lg"
              showMarkers={true}
            />
          </div>
        </div>
      </div>

      {/* Safe Daily Pace Recommendation Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/30 border border-brand-200/80 dark:border-brand-800/80 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-brand-600 text-white shrink-0">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-950 dark:text-brand-100">
            Recommended Daily Allowance: {formatCurrency(safeDailyTarget, currency)} / day
          </h4>
          <p className="text-xs text-brand-800 dark:text-brand-300 mt-1 leading-relaxed">
            There are <strong>{remainingDays} days</strong> remaining in this month. Keeping your average daily spending at or below{' '}
            <strong>{formatCurrency(safeDailyTarget, currency)}</strong> will ensure you finish the month safely within your {formatCurrency(monthlyBudgetStatus.budget, currency)} target!
          </p>
        </div>
      </div>

      {/* 4 Alert Tiers Reference Guide */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Budget Alert Tier Reference
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Normal */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
              <CheckCircle2 size={16} />
              <span>Normal (&lt; 70%)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Spending is completely safe and well within limits. Good job!
            </p>
          </div>

          {/* Warning */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs mb-1">
              <AlertTriangle size={16} />
              <span>Warning (70%–89%)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Approaching threshold. Review spending and limit extra purchases.
            </p>
          </div>

          {/* Critical */}
          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/50">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-xs mb-1">
              <AlertOctagon size={16} />
              <span>Critical (90%–99%)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Danger zone! Only urgent and essential expenses recommended.
            </p>
          </div>

          {/* Exceeded */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs mb-1">
              <Flame size={16} />
              <span>Exceeded (100%+)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Budget exceeded! Immediate cut-backs required to prevent deficits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
