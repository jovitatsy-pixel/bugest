import React from 'react';
import type { AlertLevel } from '../../types';
import { getAlertConfig } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface BudgetBadgeProps {
  level: AlertLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const BudgetBadge: React.FC<BudgetBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const config = getAlertConfig(level);

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    switch (level) {
      case 'normal':
        return <CheckCircle2 size={iconSize} className="mr-1.5 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={iconSize} className="mr-1.5 shrink-0" />;
      case 'critical':
        return <AlertOctagon size={iconSize} className="mr-1.5 shrink-0" />;
      case 'exceeded':
        return <Flame size={iconSize} className="mr-1.5 shrink-0" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeClasses} ${config.badgeBg}`}
    >
      {showIcon && getIcon()}
      <span>{config.label}</span>
    </span>
  );
};
