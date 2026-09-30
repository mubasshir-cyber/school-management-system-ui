'use client';

import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FolderSearch,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 lg:p-12 text-center bg-white border border-[#E5EAF1] rounded-2xl ${
        className || ''
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-[#172033] tracking-tight mb-1">
        {title}
      </h4>
      <p className="text-xs lg:text-sm text-[#667085] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
