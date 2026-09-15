import React from 'react';
import type { ActivePage } from '../../types';
import { LayoutDashboard, Receipt, PiggyBank, PieChart, User, Plus } from 'lucide-react';

interface MobileNavProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenAddExpense: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePage,
  setActivePage,
  onOpenAddExpense,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => setActivePage('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activePage === 'dashboard'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Expenses */}
        <button
          onClick={() => setActivePage('expenses')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activePage === 'expenses'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Receipt size={20} />
          <span className="text-[10px]">Expenses</span>
        </button>

        {/* Floating Quick Add Button */}
        <div className="-mt-6">
          <button
            onClick={onOpenAddExpense}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Add Expense"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Budget */}
        <button
          onClick={() => setActivePage('budget')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activePage === 'budget'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <PiggyBank size={20} />
          <span className="text-[10px]">Budget</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => setActivePage('analytics')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activePage === 'analytics'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <PieChart size={20} />
          <span className="text-[10px]">Analytics</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActivePage('profile')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activePage === 'profile'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <User size={20} />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};
