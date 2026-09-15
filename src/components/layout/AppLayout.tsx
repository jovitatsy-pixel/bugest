import React, { useState } from 'react';
import type { ActivePage, Expense } from '../../types';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { ExpenseFormModal } from '../expenses/ExpenseFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useExpenses } from '../../contexts/ExpenseContext';
import { formatCurrency } from '../../lib/utils';

export interface LayoutActions {
  onOpenAddExpense: () => void;
  onOpenEditExpense: (expense: Expense) => void;
  onOpenDeleteExpense: (expense: Expense) => void;
}

interface AppLayoutProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  children: ((actions: LayoutActions) => React.ReactNode) | React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activePage,
  setActivePage,
  children,
}) => {
  const { deleteExpense, currency } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    await deleteExpense(deletingExpense.id);
    setIsDeleting(false);
    setDeletingExpense(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar for Desktop */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAddExpense={handleOpenAdd}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header
          activePage={activePage}
          onOpenAddExpense={handleOpenAdd}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {typeof children === 'function'
            ? children({
                onOpenAddExpense: handleOpenAdd,
                onOpenEditExpense: handleOpenEdit,
                onOpenDeleteExpense: handleOpenDelete,
              })
            : children}
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAddExpense={handleOpenAdd}
      />

      {/* Global Add / Edit Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />

      {/* Global Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message={
          deletingExpense
            ? `Are you sure you want to delete this expense of ${formatCurrency(
                deletingExpense.amount,
                currency
              )} for "${deletingExpense.description || deletingExpense.category}"? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
