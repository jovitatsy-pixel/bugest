import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  BudgetStatus,
  CategoryBreakdown,
  SpendingInsight,
} from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { calculateBudgetStatus, getTodayDateString } from '../lib/utils';
import { INITIAL_DEMO_EXPENSES } from '../lib/mockData';
import {
  isThisMonth,
  parseISO,
  subDays,
  isWithinInterval,
  getDaysInMonth,
  getDate,
  isSameMonth,
  subMonths,
} from 'date-fns';

interface AddExpenseInput {
  amount: number;
  category: ExpenseCategory;
  description: string;
  payment_method: PaymentMethod;
  expense_date: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  addExpense: (data: AddExpenseInput) => Promise<{ error?: string }>;
  updateExpense: (id: string, data: AddExpenseInput) => Promise<{ error?: string }>;
  deleteExpense: (id: string) => Promise<{ error?: string }>;
  refreshExpenses: () => Promise<void>;

  // Daily calculations
  todayExpenses: Expense[];
  todaySpending: number;
  dailyBudgetStatus: BudgetStatus;

  // Monthly calculations
  monthlyExpenses: Expense[];
  monthlySpending: number;
  monthlyBudgetStatus: BudgetStatus;

  // Analytics & Breakdown
  categoryBreakdown: CategoryBreakdown[];
  insights: SpendingInsight[];
  currency: string;
  setCurrency: (c: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const DEMO_EXPENSES_STORAGE_KEY = 'spendsmart_demo_expenses';
const CURRENCY_STORAGE_KEY = 'spendsmart_currency';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isDemo } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem(CURRENCY_STORAGE_KEY) || '₹';
  });

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (isDemo || !supabase) {
      const stored = localStorage.getItem(DEMO_EXPENSES_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setExpenses(parsed);
        } catch {
          setExpenses(INITIAL_DEMO_EXPENSES);
          localStorage.setItem(DEMO_EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EXPENSES));
        }
      } else {
        setExpenses(INITIAL_DEMO_EXPENSES);
        localStorage.setItem(DEMO_EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EXPENSES));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error.message);
      } else if (data) {
        setExpenses(data as Expense[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Add Expense
  const addExpense = async (data: AddExpenseInput): Promise<{ error?: string }> => {
    if (!user) return { error: 'Please log in to add expenses' };

    const newExpense: Expense = {
      id: isDemo || !supabase ? `demo-exp-${Date.now()}` : '',
      user_id: user.id,
      amount: Number(data.amount),
      category: data.category,
      description: data.description.trim(),
      payment_method: data.payment_method,
      expense_date: data.expense_date,
      created_at: new Date().toISOString(),
    };

    if (isDemo || !supabase) {
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      localStorage.setItem(DEMO_EXPENSES_STORAGE_KEY, JSON.stringify(updated));
      return {};
    }

    try {
      const { data: inserted, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            amount: newExpense.amount,
            category: newExpense.category,
            description: newExpense.description,
            payment_method: newExpense.payment_method,
            expense_date: newExpense.expense_date,
          },
        ])
        .select()
        .single();

      if (error) return { error: error.message };

      if (inserted) {
        setExpenses((prev) => [inserted as Expense, ...prev]);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to record expense' };
    }
  };

  // Update Expense
  const updateExpense = async (id: string, data: AddExpenseInput): Promise<{ error?: string }> => {
    if (!user) return { error: 'Please log in to update expenses' };

    if (isDemo || !supabase) {
      const updated = expenses.map((item) =>
        item.id === id
          ? {
              ...item,
              amount: Number(data.amount),
              category: data.category,
              description: data.description.trim(),
              payment_method: data.payment_method,
              expense_date: data.expense_date,
            }
          : item
      );
      setExpenses(updated);
      localStorage.setItem(DEMO_EXPENSES_STORAGE_KEY, JSON.stringify(updated));
      return {};
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: Number(data.amount),
          category: data.category,
          description: data.description.trim(),
          payment_method: data.payment_method,
          expense_date: data.expense_date,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error: error.message };

      setExpenses((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                amount: Number(data.amount),
                category: data.category,
                description: data.description.trim(),
                payment_method: data.payment_method,
                expense_date: data.expense_date,
              }
            : item
        )
      );
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update expense' };
    }
  };

  // Delete Expense
  const deleteExpense = async (id: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Please log in to delete expenses' };

    if (isDemo || !supabase) {
      const updated = expenses.filter((item) => item.id !== id);
      setExpenses(updated);
      localStorage.setItem(DEMO_EXPENSES_STORAGE_KEY, JSON.stringify(updated));
      return {};
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error: error.message };

      setExpenses((prev) => prev.filter((item) => item.id !== id));
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to delete expense' };
    }
  };

  // Calculations
  const todayStr = getTodayDateString();

  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => e.expense_date === todayStr);
  }, [expenses, todayStr]);

  const todaySpending = useMemo(() => {
    return todayExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [todayExpenses]);

  const dailyBudgetStatus = useMemo(() => {
    const dailyBudget = profile?.daily_budget ?? 500;
    return calculateBudgetStatus(todaySpending, dailyBudget);
  }, [todaySpending, profile?.daily_budget]);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e) => {
      try {
        return isThisMonth(parseISO(e.expense_date));
      } catch {
        return false;
      }
    });
  }, [expenses]);

  const monthlySpending = useMemo(() => {
    return monthlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthlyExpenses]);

  const monthlyBudgetStatus = useMemo(() => {
    const monthlyBudget = profile?.monthly_budget ?? 15000;
    return calculateBudgetStatus(monthlySpending, monthlyBudget);
  }, [monthlySpending, profile?.monthly_budget]);

  // Category Breakdown (for current month or all time if current month is small)
  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    const targetExpenses = monthlyExpenses.length > 0 ? monthlyExpenses : expenses;
    const totals: Record<string, { amount: number; count: number }> = {};

    targetExpenses.forEach((item) => {
      if (!totals[item.category]) {
        totals[item.category] = { amount: 0, count: 0 };
      }
      totals[item.category].amount += Number(item.amount);
      totals[item.category].count += 1;
    });

    const totalAmount = Object.values(totals).reduce((acc, curr) => acc + curr.amount, 0);

    return Object.entries(totals)
      .map(([cat, data]) => ({
        category: cat as ExpenseCategory,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyExpenses, expenses]);

  // Genuine Real Insights Generation
  const insights = useMemo((): SpendingInsight[] => {
    const list: SpendingInsight[] = [];
    const monthlyBudget = profile?.monthly_budget ?? 15000;
    const today = new Date();
    const currentDay = getDate(today);
    const totalDaysInMonth = getDaysInMonth(today);
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);

    // 1. Highest spending category insight
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      list.push({
        type: 'category',
        title: `Top Category: ${topCategory.category}`,
        description: `${topCategory.category} is your highest expense area, accounting for ${topCategory.percentage}% (${currency}${topCategory.amount.toLocaleString()}) of your spending this month.`,
        badge: `${topCategory.percentage}% of spend`,
        badgeType: topCategory.percentage > 50 ? 'warning' : 'info',
      });
    }

    // 2. Spending Pace & Safe Daily Allowance
    const remainingBudget = Math.max(0, monthlyBudget - monthlySpending);
    const safeDailySpend = Math.round(remainingBudget / daysRemaining);

    if (monthlySpending > monthlyBudget) {
      list.push({
        type: 'warning',
        title: 'Monthly Budget Exceeded',
        description: `You have spent ${currency}${(monthlySpending - monthlyBudget).toLocaleString()} over your monthly target. Consider pausing non-essential expenses for the next ${daysRemaining} days.`,
        badge: 'Over Budget',
        badgeType: 'danger',
      });
    } else {
      list.push({
        type: 'saving',
        title: 'Safe Daily Spending Allowance',
        description: `You have ${currency}${remainingBudget.toLocaleString()} left for this month. Spending under ${currency}${safeDailySpend.toLocaleString()}/day across the remaining ${daysRemaining} days will keep you inside your budget!`,
        badge: `${currency}${safeDailySpend}/day`,
        badgeType: 'success',
      });
    }

    // 3. Comparison with previous period (Last 7 days vs 7 days prior)
    const last7DaysInterval = {
      start: subDays(today, 6),
      end: today,
    };
    const prev7DaysInterval = {
      start: subDays(today, 13),
      end: subDays(today, 7),
    };

    let last7Sum = 0;
    let prev7Sum = 0;

    expenses.forEach((item) => {
      try {
        const d = parseISO(item.expense_date);
        if (isWithinInterval(d, last7DaysInterval)) {
          last7Sum += Number(item.amount);
        } else if (isWithinInterval(d, prev7DaysInterval)) {
          prev7Sum += Number(item.amount);
        }
      } catch {
        // ignore date parse errors
      }
    });

    if (prev7Sum > 0) {
      const diffPercent = Math.round(((last7Sum - prev7Sum) / prev7Sum) * 100);
      if (diffPercent > 0) {
        list.push({
          type: 'trend',
          title: 'Spending Increased this Week',
          description: `You spent ${currency}${last7Sum.toLocaleString()} in the last 7 days, up ${diffPercent}% compared to ${currency}${prev7Sum.toLocaleString()} in the previous 7 days.`,
          badge: `+${diffPercent}% vs last week`,
          badgeType: 'warning',
        });
      } else {
        list.push({
          type: 'trend',
          title: 'Great Discipline this Week',
          description: `You spent ${currency}${last7Sum.toLocaleString()} in the last 7 days, down ${Math.abs(diffPercent)}% compared to ${currency}${prev7Sum.toLocaleString()} in the previous week!`,
          badge: `${diffPercent}% vs last week`,
          badgeType: 'success',
        });
      }
    } else if (expenses.length > 0) {
      // Comparison with last month if available
      const lastMonthDate = subMonths(today, 1);
      const lastMonthExpenses = expenses.filter((e) => {
        try {
          return isSameMonth(parseISO(e.expense_date), lastMonthDate);
        } catch {
          return false;
        }
      });
      const lastMonthSum = lastMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);

      if (lastMonthSum > 0) {
        const monthDiff = Math.round(((monthlySpending - lastMonthSum) / lastMonthSum) * 100);
        list.push({
          type: 'trend',
          title: 'Month-over-Month Comparison',
          description: `Current month spending is ${currency}${monthlySpending.toLocaleString()} vs ${currency}${lastMonthSum.toLocaleString()} logged last month (${monthDiff >= 0 ? '+' : ''}${monthDiff}%).`,
          badge: `${monthDiff >= 0 ? '+' : ''}${monthDiff}%`,
          badgeType: monthDiff > 10 ? 'warning' : 'info',
        });
      }
    }

    return list;
  }, [categoryBreakdown, monthlySpending, profile?.monthly_budget, expenses, currency]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshExpenses: fetchExpenses,
        todayExpenses,
        todaySpending,
        dailyBudgetStatus,
        monthlyExpenses,
        monthlySpending,
        monthlyBudgetStatus,
        categoryBreakdown,
        insights,
        currency,
        setCurrency,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
