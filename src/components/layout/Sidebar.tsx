import React from 'react';
import type { ActivePage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useExpenses } from '../../contexts/ExpenseContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  User,
  PlusCircle,
  Sun,
  Moon,
  LogOut,
  Wallet,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenAddExpense: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  onOpenAddExpense,
}) => {
  const { profile, logout, isDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { dailyBudgetStatus, monthlyBudgetStatus } = useExpenses();

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={19} /> },
    { id: 'budget', label: 'Budget', icon: <PiggyBank size={19} /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart size={19} /> },
    { id: 'profile', label: 'Profile & Settings', icon: <User size={19} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 shrink-0 transition-colors z-30">
      {/* Brand Logo & Name */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Wallet size={22} />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              SpendSmart
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Smart Expense Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Expense Action Button */}
      <div className="px-4 pt-5 pb-2">
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-brand-500/20 transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <PlusCircle size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mini Quick Status card */}
      <div className="mx-4 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles size={13} className="text-brand-500" />
            <span>Today's Limit</span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {dailyBudgetStatus.percentage}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              dailyBudgetStatus.alertLevel === 'exceeded'
                ? 'bg-rose-500'
                : dailyBudgetStatus.alertLevel === 'critical'
                ? 'bg-orange-500'
                : dailyBudgetStatus.alertLevel === 'warning'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(dailyBudgetStatus.percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          <span>Month: {monthlyBudgetStatus.percentage}%</span>
          {isDemo && <span className="text-brand-600 dark:text-brand-400 font-medium">Demo Mode</span>}
        </div>
      </div>

      {/* User Footer & Theme / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {profile?.email || 'user@spendsmart.app'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};
