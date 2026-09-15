import type { ExpenseCategory, PaymentMethod, AlertLevel, BudgetStatus } from '../types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Health',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
];

export const formatCurrency = (amount: number, currency = '₹'): string => {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatExpenseDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const calculateBudgetStatus = (
  spent: number,
  budget: number
): BudgetStatus => {
  const safeBudget = Math.max(0, budget);
  const safeSpent = Math.max(0, spent);
  const remaining = safeBudget - safeSpent;
  const percentage = safeBudget > 0 ? (safeSpent / safeBudget) * 100 : 0;

  let alertLevel: AlertLevel = 'normal';
  if (percentage >= 100) {
    alertLevel = 'exceeded';
  } else if (percentage >= 90) {
    alertLevel = 'critical';
  } else if (percentage >= 70) {
    alertLevel = 'warning';
  } else {
    alertLevel = 'normal';
  }

  return {
    spent: safeSpent,
    budget: safeBudget,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    alertLevel,
  };
};

export const getAlertConfig = (alertLevel: AlertLevel) => {
  switch (alertLevel) {
    case 'normal':
      return {
        label: 'Normal',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
        progressColor: 'bg-emerald-500',
        description: 'Spending is well within budget (< 70%). Keep it up!',
      };
    case 'warning':
      return {
        label: 'Warning',
        textColor: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        borderColor: 'border-amber-200 dark:border-amber-800',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        progressColor: 'bg-amber-500',
        description: 'Approaching budget limit (70%–89%). Be cautious on discretionary spends.',
      };
    case 'critical':
      return {
        label: 'Critical',
        textColor: 'text-orange-700 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/40',
        borderColor: 'border-orange-200 dark:border-orange-800',
        badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        progressColor: 'bg-orange-500',
        description: 'Near limit (90%–99%)! Essential expenses only recommended.',
      };
    case 'exceeded':
      return {
        label: 'Budget Exceeded',
        textColor: 'text-rose-700 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-950/40',
        borderColor: 'border-rose-200 dark:border-rose-800',
        badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
        progressColor: 'bg-rose-600',
        description: 'Budget limit exceeded (100%+)! Review and cut back immediately.',
      };
  }
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#f97316', // orange
  Transport: '#3b82f6', // blue
  Shopping: '#ec4899', // pink
  Education: '#8b5cf6', // purple
  Entertainment: '#06b6d4', // cyan
  Bills: '#eab308', // yellow
  Health: '#10b981', // emerald
  Other: '#64748b', // slate
};
