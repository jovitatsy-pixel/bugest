import React from 'react';
import type { ActivePage, Expense } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../contexts/ExpenseContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { BudgetAlertBanner } from '../components/dashboard/BudgetAlertBanner';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { ProgressBar } from '../components/common/ProgressBar';
import { BudgetBadge } from '../components/common/BudgetBadge';
import { formatCurrency } from '../lib/utils';
import {
  Calendar,
  Wallet,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  onOpenAddExpense?: () => void;
  onOpenEditExpense?: (expense: Expense) => void;
  onOpenDeleteExpense?: (expense: Expense) => void;
  setActivePage?: (page: ActivePage) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAddExpense,
  onOpenEditExpense,
  onOpenDeleteExpense,
  setActivePage,
}) => {
  const { profile } = useAuth();
  const {
    expenses,
    todaySpending,
    dailyBudgetStatus,
    monthlySpending,
    monthlyBudgetStatus,
    currency,
    insights,
  } = useExpenses();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Message & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-medium mb-2">
            <Sparkles size={13} />
            <span>Smart Expense Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {userName}!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
            Track your daily pocket money & expenses with real-time budget threshold alerts.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Budget Alert Banner */}
      <BudgetAlertBanner
        dailyStatus={dailyBudgetStatus}
        monthlyStatus={monthlyBudgetStatus}
        currency={currency}
      />

      {/* 3. 4 Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Spending */}
        <MetricCard
          title="Today's Spending"
          amount={todaySpending}
          currency={currency}
          budgetTarget={dailyBudgetStatus.budget}
          percentage={dailyBudgetStatus.percentage}
          alertLevel={dailyBudgetStatus.alertLevel}
          icon={<Clock size={22} />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        />

        {/* Metric 2: Today's Remaining */}
        <MetricCard
          title="Today's Remaining"
          amount={dailyBudgetStatus.remaining}
          currency={currency}
          subtitle={`Daily limit: ${formatCurrency(dailyBudgetStatus.budget, currency)}`}
          alertLevel={dailyBudgetStatus.alertLevel}
          icon={dailyBudgetStatus.remaining >= 0 ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
          iconBgColor={
            dailyBudgetStatus.remaining >= 0
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
          }
        />

        {/* Metric 3: Monthly Spending */}
        <MetricCard
          title="Monthly Spending"
          amount={monthlySpending}
          currency={currency}
          budgetTarget={monthlyBudgetStatus.budget}
          percentage={monthlyBudgetStatus.percentage}
          alertLevel={monthlyBudgetStatus.alertLevel}
          icon={<Calendar size={22} />}
          iconBgColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        />

        {/* Metric 4: Monthly Remaining */}
        <MetricCard
          title="Monthly Remaining"
          amount={monthlyBudgetStatus.remaining}
          currency={currency}
          subtitle={`Monthly limit: ${formatCurrency(monthlyBudgetStatus.budget, currency)}`}
          alertLevel={monthlyBudgetStatus.alertLevel}
          icon={<Wallet size={22} />}
          iconBgColor={
            monthlyBudgetStatus.remaining >= 0
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
          }
        />
      </div>

      {/* 4. Spending Progress Breakdown Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Spending Progress & Alert Tiers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Normal (&lt;70%) • Warning (70–89%) • Critical (90–99%) • Exceeded (100%+)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage?.('budget')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Adjust Budgets</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Daily Budget Progress
              </span>
              <BudgetBadge level={dailyBudgetStatus.alertLevel} size="sm" />
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(todaySpending, currency)}
                <span className="text-xs font-normal text-slate-400">
                  {' '}
                  / {formatCurrency(dailyBudgetStatus.budget, currency)}
                </span>
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {dailyBudgetStatus.percentage}%
              </span>
            </div>
            <ProgressBar
              percentage={dailyBudgetStatus.percentage}
              alertLevel={dailyBudgetStatus.alertLevel}
              height="lg"
              showMarkers={true}
            />
          </div>

          {/* Monthly Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Monthly Budget Progress
              </span>
              <BudgetBadge level={monthlyBudgetStatus.alertLevel} size="sm" />
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(monthlySpending, currency)}
                <span className="text-xs font-normal text-slate-400">
                  {' '}
                  / {formatCurrency(monthlyBudgetStatus.budget, currency)}
                </span>
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {monthlyBudgetStatus.percentage}%
              </span>
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

      {/* 5. Smart Insights & Recent Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Expenses */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest transactions recorded in SpendSmart
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage?.('expenses')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({expenses.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
              <Wallet size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No expenses logged yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Add your first expense to see your spending tracking and live alerts in action.
              </p>
              <button
                type="button"
                onClick={onOpenAddExpense}
                className="mt-4 text-xs font-semibold py-2 px-4 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add First Expense</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={(exp) => onOpenEditExpense?.(exp)}
                  onDelete={(exp) => onOpenDeleteExpense?.(exp)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Smart Insights Preview */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-600 dark:text-brand-400" />
                <span>Smart Insights</span>
              </h3>
              <button
                type="button"
                onClick={() => setActivePage?.('analytics')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Analytics →
              </button>
            </div>

            <div className="space-y-3">
              {insights.slice(0, 2).map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {insight.title}
                    </h4>
                    {insight.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                        {insight.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActivePage?.('analytics')}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Full Analytics & Breakdown</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
