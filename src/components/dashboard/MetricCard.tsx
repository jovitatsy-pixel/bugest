import React from 'react';
import { formatCurrency } from '../../lib/utils';
import type { AlertLevel } from '../../types';
import { BudgetBadge } from '../common/BudgetBadge';
import { ProgressBar } from '../common/ProgressBar';

interface MetricCardProps {
  title: string;
  amount: number;
  currency: string;
  budgetTarget?: number;
  percentage?: number;
  alertLevel?: AlertLevel;
  icon: React.ReactNode;
  iconBgColor?: string;
  subtitle?: string;
  isNegativeAllowed?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  currency,
  budgetTarget,
  percentage,
  alertLevel,
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
  subtitle,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(amount, currency)}
            </h3>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${iconBgColor} shrink-0`}>
          {icon}
        </div>
      </div>

      {/* Progress & Target Section */}
      {budgetTarget !== undefined && percentage !== undefined && alertLevel && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Budget: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(budgetTarget, currency)}</span>
            </span>
            <BudgetBadge level={alertLevel} size="sm" />
          </div>

          <ProgressBar percentage={percentage} alertLevel={alertLevel} height="sm" showMarkers={false} />

          <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
            <span>{percentage}% used</span>
            <span>
              {amount > budgetTarget ? (
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  {formatCurrency(amount - budgetTarget, currency)} over limit
                </span>
              ) : (
                <span>
                  {formatCurrency(budgetTarget - amount, currency)} left
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {subtitle && !budgetTarget && (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{subtitle}</span>
          {alertLevel && <BudgetBadge level={alertLevel} size="sm" />}
        </div>
      )}
    </div>
  );
};
