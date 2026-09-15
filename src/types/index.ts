export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  daily_budget: number;
  monthly_budget: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  payment_method: PaymentMethod;
  expense_date: string; // YYYY-MM-DD
  created_at: string;
}

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'exceeded';

export interface BudgetStatus {
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
  alertLevel: AlertLevel;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}

export interface SpendingInsight {
  type: 'category' | 'trend' | 'saving' | 'warning';
  title: string;
  description: string;
  badge?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'danger';
}

export type ActivePage =
  | 'dashboard'
  | 'expenses'
  | 'budget'
  | 'analytics'
  | 'profile';
