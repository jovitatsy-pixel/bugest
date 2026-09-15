import React from 'react';
import type { AlertLevel } from '../../types';
import { getAlertConfig } from '../../lib/utils';

interface ProgressBarProps {
  percentage: number;
  alertLevel: AlertLevel;
  height?: 'sm' | 'md' | 'lg';
  showMarkers?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  alertLevel,
  height = 'md',
  showMarkers = true,
}) => {
  const config = getAlertConfig(alertLevel);
  const visualPercentage = Math.min(Math.max(percentage, 0), 100);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[height];

  return (
    <div className="w-full">
      <div className={`relative w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${heightClasses}`}>
        {/* Progress Bar Fill */}
        <div
          className={`h-full transition-all duration-500 rounded-full ${config.progressColor}`}
          style={{ width: `${visualPercentage}%` }}
        />

        {/* Threshold Markers */}
        {showMarkers && height !== 'sm' && (
          <>
            {/* 70% marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400/40 dark:bg-slate-600 pointer-events-none"
              style={{ left: '70%' }}
              title="70% Warning threshold"
            />
            {/* 90% marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400/40 dark:bg-slate-600 pointer-events-none"
              style={{ left: '90%' }}
              title="90% Critical threshold"
            />
          </>
        )}
      </div>

      {showMarkers && height === 'lg' && (
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium px-0.5">
          <span>0%</span>
          <span className="translate-x-1 text-amber-500">70% (Warn)</span>
          <span className="translate-x-1 text-orange-500">90% (Crit)</span>
          <span className="text-rose-500">100%</span>
        </div>
      )}
    </div>
  );
};
