import React, { useState, useMemo } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_COLORS, formatCurrency } from '../lib/utils';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { subDays, format, parseISO, isWithinInterval } from 'date-fns';

export const Analytics: React.FC = () => {
  const { expenses, currency, insights, categoryBreakdown } = useExpenses();
  const { profile } = useAuth();
  const [timeframe, setTimeframe] = useState<'30days' | '7days' | 'all'>('30days');

  // Filter expenses by timeframe
  const filteredExpenses = useMemo(() => {
    const today = new Date();
    if (timeframe === '7days') {
      const interval = { start: subDays(today, 6), end: today };
      return expenses.filter((e) => {
        try {
          return isWithinInterval(parseISO(e.expense_date), interval);
        } catch {
          return false;
        }
      });
    }

    if (timeframe === '30days') {
      const interval = { start: subDays(today, 29), end: today };
      return expenses.filter((e) => {
        try {
          return isWithinInterval(parseISO(e.expense_date), interval);
        } catch {
          return false;
        }
      });
    }

    return expenses;
  }, [expenses, timeframe]);

  // Total spend in period
  const totalSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  // Daily average spend in period
  const dailyAverage = useMemo(() => {
    const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : Math.max(1, expenses.length);
    return Math.round(totalSpend / days);
  }, [totalSpend, timeframe, expenses.length]);

  // Category data for Pie Chart
  const pieChartData = useMemo(() => {
    const catTotals: Record<string, number> = {};
    filteredExpenses.forEach((item) => {
      catTotals[item.category] = (catTotals[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(catTotals).map(([name, value]) => ({
      name,
      value,
      color: (CATEGORY_COLORS as any)[name] || '#6366f1',
    }));
  }, [filteredExpenses]);

  // Bar chart data (Daily spending for the last 7 or 14 days)
  const barChartData = useMemo(() => {
    const today = new Date();
    const daysCount = timeframe === '7days' ? 7 : 14;
    const days = Array.from({ length: daysCount }).map((_, i) => {
      const d = subDays(today, daysCount - 1 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const label = format(d, 'MMM d');
      return { dateStr, label, amount: 0 };
    });

    filteredExpenses.forEach((item) => {
      const dayObj = days.find((d) => d.dateStr === item.expense_date);
      if (dayObj) {
        dayObj.amount += Number(item.amount);
      }
    });

    return days;
  }, [filteredExpenses, timeframe]);

  // Payment method distribution
  const paymentMethodData = useMemo(() => {
    const methods: Record<string, number> = {};
    filteredExpenses.forEach((item) => {
      methods[item.payment_method] = (methods[item.payment_method] || 0) + Number(item.amount);
    });
    return Object.entries(methods).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalSpend]);

  return (
    <div className="space-y-6">
      {/* Top Header & Timeframe selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Spending Analytics & Insights
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your expenses, analyze category distributions, and discover smart savings
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === '7days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === '30days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Spend ({timeframe === '7days' ? '7 Days' : timeframe === '30days' ? '30 Days' : 'All'})
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalSpend, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across {filteredExpenses.length} logged transactions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Daily Average Spend
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(dailyAverage, currency)}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Budget Target: {formatCurrency(profile?.daily_budget || 500, currency)}/day
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Highest Spend Area
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 truncate">
            {pieChartData[0]?.name || 'None'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {pieChartData[0] ? `${formatCurrency(pieChartData[0].value, currency)} total` : 'No data'}
          </p>
        </div>
      </div>

      {/* Dynamic Smart Insights Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Smart Financial Insights & Trends
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.badgeType === 'danger'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : item.badgeType === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Category Breakdown (Pie/Donut) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spending by Category
              </h3>
            </div>
          </div>

          {pieChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-xs">
              No expense data to display for this timeframe
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip
                      formatter={(value: any) => [formatCurrency(Number(value), currency), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Pills Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: (CATEGORY_COLORS as any)[cat.category] || '#6366f1' }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="truncate block font-medium text-slate-700 dark:text-slate-300">
                        {cat.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {cat.percentage}% ({formatCurrency(cat.amount, currency)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Daily Spending Trend (Bar Chart) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Spending Trend
              </h3>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415525" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <ReTooltip
                    formatter={(value: any) => [formatCurrency(Number(value), currency), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              Showing expenditure volume over recent days. Consistent bars indicate controlled spending habits.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Payment Method Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {paymentMethodData.map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {item.name}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white block">
                {formatCurrency(item.amount, currency)}
              </span>
              <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
                {item.percentage}% of total
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
