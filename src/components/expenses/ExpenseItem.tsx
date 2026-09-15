import React from 'react';
import type { Expense } from '../../types';
import { formatCurrency, formatExpenseDate, CATEGORY_COLORS } from '../../lib/utils';
import { getCategoryIcon } from './ExpenseFormModal';
import { useExpenses } from '../../contexts/ExpenseContext';
import { Edit2, Trash2 } from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onEdit,
  onDelete,
}) => {
  const { currency } = useExpenses();
  const categoryColor = CATEGORY_COLORS[expense.category] || '#6366f1';

  return (
    <div className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all hover:shadow-md">
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${categoryColor}18`,
            color: categoryColor,
          }}
        >
          {getCategoryIcon(expense.category, 18)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {expense.description || expense.category}
            </h4>
            <span className="hidden sm:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {expense.category}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatExpenseDate(expense.expense_date)}</span>
            <span>•</span>
            <span className="inline-flex items-center text-[11px] font-medium text-brand-600 dark:text-brand-400">
              {expense.payment_method}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-2">
        <div className="text-right">
          <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            -{formatCurrency(expense.amount, currency)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(expense)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 dark:hover:text-brand-400 transition-colors"
            title="Edit expense"
            aria-label="Edit expense"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
            title="Delete expense"
            aria-label="Delete expense"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
