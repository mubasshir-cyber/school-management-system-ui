'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = false,
  className,
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={twMerge(clsx('flex items-center text-xs text-[#98A2B3]', className))}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="hover:text-[#2563EB] transition-colors flex items-center gap-1 text-[#667085]"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
            <ChevronRight className="w-3 h-3 text-[#CBD5E1] mx-1" />
          </li>
        )}

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="flex items-center">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-[#CBD5E1] mx-1" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[#2563EB] transition-colors text-[#667085] font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={clsx(isLast ? 'text-[#172033] font-semibold' : 'text-[#667085]')}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
