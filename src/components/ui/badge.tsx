'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    success: 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]',
    info: 'bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]',
    primary: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
    neutral: 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]',
  };

  const dotColors = {
    success: 'bg-[#10B981]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#EF4444]',
    info: 'bg-[#3B82F6]',
    primary: 'bg-[#2563EB]',
    neutral: 'bg-[#64748B]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.75 font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full capitalize whitespace-nowrap',
          variants[variant],
          sizes[size],
          className,
        ),
      )}
      {...props}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
