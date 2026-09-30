'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5',
          className,
        ),
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} className="mb-1.5" />
        )}
        <h1 className="text-xl lg:text-2xl font-bold text-[#172033] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs lg:text-sm text-[#667085] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
