import React from 'react';
import type { ActivePage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, PlusCircle, Wallet } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePage;
  onOpenAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onOpenAddExpense,
}) => {
  const { profile, isDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'expenses':
        return 'All Expenses';
      case 'budget':
        return 'Budget & Limits';
      case 'analytics':
        return 'Spending Analytics';
      case 'profile':
        return 'Profile & Preferences';
      default:
        return 'SpendSmart';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Brand & Desktop Title */}
        <div className="flex items-center gap-3">
          <div className="flex md:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Wallet size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">SpendSmart</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo badge if active */}
          {isDemo && (
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Demo Mode
            </span>
          )}

          {/* Add Expense button (Desktop) */}
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle size={15} />
            <span>Add Expense</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Initial / Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-200 dark:border-brand-800">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden lg:inline-block text-xs font-medium text-slate-700 dark:text-slate-300">
              {profile?.full_name?.split(' ')[0] || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
