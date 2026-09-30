'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  colorScheme?: 'blue' | 'amber' | 'green' | 'rose' | 'purple';
  subtitle?: string;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendPositive = true,
  colorScheme = 'blue',
  subtitle,
  className,
}) => {
  const iconThemes = {
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
    amber: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]',
    green: 'bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]',
    rose: 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]',
    purple: 'bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]',
  };

  const trendThemes = {
    blue: 'bg-[#EFF6FF] text-[#2563EB]',
    amber: 'bg-[#FFFBEB] text-[#D97706]',
    green: 'bg-[#ECFDF5] text-[#10B981]',
    rose: 'bg-[#FFF1F2] text-[#E11D48]',
    purple: 'bg-[#FAF5FF] text-[#9333EA]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-white border border-[#E5EAF1] rounded-2xl p-4.5 lg:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#CBD5E1] flex flex-col justify-between',
          className,
        ),
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-0.5">
          <h4 className="text-2xl lg:text-[28px] font-bold text-[#172033] tracking-tight">
            {value}
          </h4>
          <p className="text-xs lg:text-sm font-medium text-[#667085]">{title}</p>
        </div>
        <div
          className={clsx(
            'w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center border shrink-0',
            iconThemes[colorScheme],
          )}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-[#F1F5F9]">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md',
              trendThemes[colorScheme],
            )}
          >
            {trendPositive ? (
              <TrendingUp className="w-3 h-3 inline" />
            ) : (
              <TrendingDown className="w-3 h-3 inline" />
            )}
            {trend}
          </span>
          {subtitle && (
            <span className="text-[11px] text-[#98A2B3] truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
