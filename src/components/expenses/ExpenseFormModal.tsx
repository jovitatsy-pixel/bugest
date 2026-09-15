import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { CATEGORIES, PAYMENT_METHODS, getTodayDateString } from '../../lib/utils';
import { useExpenses } from '../../contexts/ExpenseContext';
import { Utensils, Bus, ShoppingBag, GraduationCap, Film, Receipt, HeartPulse, HelpCircle } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Expense | null; // If passed, we are in "Edit" mode
}

export const getCategoryIcon = (category: ExpenseCategory, size = 16) => {
  switch (category) {
    case 'Food':
      return <Utensils size={size} />;
    case 'Transport':
      return <Bus size={size} />;
    case 'Shopping':
      return <ShoppingBag size={size} />;
    case 'Education':
      return <GraduationCap size={size} />;
    case 'Entertainment':
      return <Film size={size} />;
    case 'Bills':
      return <Receipt size={size} />;
    case 'Health':
      return <HeartPulse size={size} />;
    default:
      return <HelpCircle size={size} />;
  }
};

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addExpense, updateExpense, currency } = useExpenses();

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [expenseDate, setExpenseDate] = useState<string>(getTodayDateString());
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDescription(initialData.description || '');
      setPaymentMethod(initialData.payment_method);
      setExpenseDate(initialData.expense_date);
    } else {
      setAmount('');
      setCategory('Food');
      setDescription('');
      setPaymentMethod('UPI');
      setExpenseDate(getTodayDateString());
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!expenseDate) {
      setError('Please select an expense date');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        const res = await updateExpense(initialData.id, {
          amount: parsedAmount,
          category,
          description: description.trim() || category,
          payment_method: paymentMethod,
          expense_date: expenseDate,
        });
        if (res.error) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addExpense({
          amount: parsedAmount,
          category,
          description: description.trim() || category,
          payment_method: paymentMethod,
          expense_date: expenseDate,
        });
        if (res.error) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving expense');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Expense' : 'Add New Expense'}
      subtitle={
        isEditMode
          ? 'Modify details of this expense transaction'
          : 'Track where your money goes to stay on budget'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Amount ({currency}) *
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <span className="text-slate-400 font-semibold text-base">{currency}</span>
            </div>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 pl-9 pr-4 py-2.5 text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 text-brand-700 dark:bg-brand-950/50 dark:border-brand-500 dark:text-brand-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`p-1 rounded-lg ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {getCategoryIcon(cat, 14)}
                  </span>
                  <span className="truncate">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description / Note
          </label>
          <input
            type="text"
            placeholder="e.g., Campus lunch, Bus pass, Books, Movie ticket"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Payment Method & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-200 dark:shadow-none transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
