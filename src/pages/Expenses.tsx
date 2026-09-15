import React, { useState, useMemo } from 'react';
import type { Expense } from '../types';
import { useExpenses } from '../contexts/ExpenseContext';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { CATEGORIES, formatCurrency } from '../lib/utils';
import { Search, Filter, Plus, ArrowUpDown, XCircle } from 'lucide-react';

interface ExpensesProps {
  onOpenAddExpense?: () => void;
  onOpenEditExpense?: (expense: Expense) => void;
  onOpenDeleteExpense?: (expense: Expense) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({
  onOpenAddExpense,
  onOpenEditExpense,
  onOpenDeleteExpense,
}) => {
  const { expenses, currency, loading } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filtering & searching
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchPayment = item.payment_method.toLowerCase().includes(q);
          const matchAmount = item.amount.toString().includes(q);
          const matchDate = item.expense_date.includes(q);
          return matchDesc || matchCat || matchPayment || matchAmount || matchDate;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime();
          case 'highest':
            return b.amount - a.amount;
          case 'lowest':
            return a.amount - b.amount;
          case 'newest':
          default:
            return new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime();
        }
      });
  }, [expenses, selectedCategory, searchQuery, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Top Header & Add Expense Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Expense Records
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter by category, and manage all your expense transactions
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by note, category, payment method or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <ArrowUpDown size={14} />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-8 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1 shrink-0">
          <Filter size={13} />
          <span>Filter:</span>
        </span>

        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            selectedCategory === 'All'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Summary Strip */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-semibold">{filteredExpenses.length}</strong> {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
        </span>
        <span>
          Filtered Total: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(totalFilteredAmount, currency)}</strong>
        </span>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-xs text-slate-400 animate-pulse">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching expenses found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try clearing your search query or selecting a different category filter.'
              : 'Start logging your daily expenses to see them organized here.'}
          </p>

          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => (
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
  );
};
