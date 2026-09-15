import type { Expense, Profile } from '../types';
import { getTodayDateString } from './utils';
import { subDays, format } from 'date-fns';

const today = new Date();
const todayStr = getTodayDateString();
const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
const twoDaysAgoStr = format(subDays(today, 2), 'yyyy-MM-dd');
const fourDaysAgoStr = format(subDays(today, 4), 'yyyy-MM-dd');
const sixDaysAgoStr = format(subDays(today, 6), 'yyyy-MM-dd');
const tenDaysAgoStr = format(subDays(today, 10), 'yyyy-MM-dd');

export const INITIAL_DEMO_PROFILE: Profile = {
  id: 'demo-user-12345',
  full_name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  daily_budget: 600,
  monthly_budget: 15000,
  created_at: new Date().toISOString(),
};

export const INITIAL_DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    user_id: 'demo-user-12345',
    amount: 180,
    category: 'Food',
    description: 'Campus cafeteria lunch & juice',
    payment_method: 'UPI',
    expense_date: todayStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    user_id: 'demo-user-12345',
    amount: 60,
    category: 'Transport',
    description: 'Metro ticket commute',
    payment_method: 'UPI',
    expense_date: todayStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    user_id: 'demo-user-12345',
    amount: 320,
    category: 'Education',
    description: 'Course textbook & spiral notebook',
    payment_method: 'Debit Card',
    expense_date: yesterdayStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    user_id: 'demo-user-12345',
    amount: 110,
    category: 'Food',
    description: 'Evening snacks & chai with friends',
    payment_method: 'Cash',
    expense_date: yesterdayStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-5',
    user_id: 'demo-user-12345',
    amount: 299,
    category: 'Bills',
    description: 'Monthly 5G mobile recharge',
    payment_method: 'UPI',
    expense_date: twoDaysAgoStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-6',
    user_id: 'demo-user-12345',
    amount: 450,
    category: 'Entertainment',
    description: 'Weekend cinema ticket & popcorn',
    payment_method: 'UPI',
    expense_date: fourDaysAgoStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-7',
    user_id: 'demo-user-12345',
    amount: 850,
    category: 'Shopping',
    description: 'Casual running shoes sale',
    payment_method: 'Credit Card',
    expense_date: sixDaysAgoStr,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-8',
    user_id: 'demo-user-12345',
    amount: 500,
    category: 'Health',
    description: 'Vitamin supplements & pharmacy',
    payment_method: 'Cash',
    expense_date: tenDaysAgoStr,
    created_at: new Date().toISOString(),
  },
];
