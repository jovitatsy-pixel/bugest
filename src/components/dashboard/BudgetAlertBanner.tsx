import React from 'react';
import type { AlertLevel, BudgetStatus } from '../../types';
import { getAlertConfig, formatCurrency } from '../../lib/utils';
import { AlertTriangle, AlertOctagon, Flame, CheckCircle2 } from 'lucide-react';

interface BudgetAlertBannerProps {
  dailyStatus: BudgetStatus;
  monthlyStatus: BudgetStatus;
  currency: string;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  dailyStatus,
  monthlyStatus,
  currency,
}) => {
  // Determine highest alert priority: exceeded > critical > warning > normal
  const getPriority = (lvl: AlertLevel): number => {
    switch (lvl) {
      case 'exceeded': return 4;
      case 'critical': return 3;
      case 'warning': return 2;
      case 'normal': return 1;
    }
  };

  const dailyPri = getPriority(dailyStatus.alertLevel);
  const monthlyPri = getPriority(monthlyStatus.alertLevel);

  const highestLevel = dailyPri >= monthlyPri ? dailyStatus.alertLevel : monthlyStatus.alertLevel;
  const isDailyTrigger = dailyPri >= monthlyPri;
  const triggeringStatus = isDailyTrigger ? dailyStatus : monthlyStatus;
  const timeframeLabel = isDailyTrigger ? 'Daily' : 'Monthly';

  const config = getAlertConfig(highestLevel);

  if (highestLevel === 'normal') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">Budget Health: On Track</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            Spending is healthy across both daily ({dailyStatus.percentage}%) and monthly ({monthlyStatus.percentage}%) budgets.
          </p>
        </div>
      </div>
    );
  }

  const getAlertIcon = () => {
    switch (highestLevel) {
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'critical':
        return <AlertOctagon size={20} />;
      case 'exceeded':
        return <Flame size={20} />;
      default:
        return <CheckCircle2 size={20} />;
    }
  };

  return (
    <div
      className={`flex items-start sm:items-center gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`p-2.5 rounded-xl shrink-0 ${config.badgeBg}`}>
        {getAlertIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/60 border border-current">
            {timeframeLabel} Alert • {config.label}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {triggeringStatus.percentage}% of budget used
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
          {highestLevel === 'exceeded' ? (
            <>
              You have exceeded your {timeframeLabel.toLowerCase()} budget by{' '}
              <strong className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(Math.abs(triggeringStatus.remaining), currency)}
              </strong>
              . Restrict any further discretionary spending!
            </>
          ) : highestLevel === 'critical' ? (
            <>
              Critical limit! Only{' '}
              <strong className="font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(triggeringStatus.remaining, currency)}
              </strong>{' '}
              left before your {timeframeLabel.toLowerCase()} budget is fully exhausted.
            </>
          ) : (
            <>
              Approaching limit: You have used {triggeringStatus.percentage}% of your{' '}
              {timeframeLabel.toLowerCase()} limit. Remaining:{' '}
              <strong>{formatCurrency(triggeringStatus.remaining, currency)}</strong>.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
