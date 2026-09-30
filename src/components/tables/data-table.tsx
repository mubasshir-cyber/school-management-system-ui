'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../ui/empty-state';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  renderMobileCard?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  onRefresh,
  onExport,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterSlot,
  actionsSlot,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  renderMobileCard,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white border border-[#E5EAF1] rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#E5EAF1] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-xs lg:text-sm bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
              />
            </div>
          )}
          {filterSlot}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {actionsSlot}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              aria-label="Refresh Table"
              leftIcon={<RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />}
            />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="border-none rounded-none py-12"
        />
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className={clsx('overflow-x-auto', renderMobileCard && 'hidden md:block')}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={clsx(
                        'px-4 py-3 text-xs font-semibold text-[#667085] uppercase tracking-wider',
                        col.sortable && 'cursor-pointer select-none hover:text-[#172033]',
                        col.className,
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-[#98A2B3]">
                            {sortColumn === col.key ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                              )
                            ) : (
                              <SlidersHorizontal className="w-3 h-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {data.map((row, idx) => (
                  <tr
                    key={keyExtractor(row)}
                    className="hover:bg-[#F8FAFC]/80 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx('px-4 py-3 text-xs lg:text-sm text-[#172033]', col.className)}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : (row as any)[col.key] !== undefined
                          ? String((row as any)[col.key])
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (if provided) */}
          {renderMobileCard && (
            <div className="md:hidden divide-y divide-[#E5EAF1]">
              {data.map((row) => (
                <div key={keyExtractor(row)} className="p-3.5 hover:bg-[#F8FAFC] transition-colors">
                  {renderMobileCard(row)}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <div className="px-4 py-3 border-t border-[#E5EAF1] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
          <div>
            Showing <span className="font-semibold text-[#172033]">{Math.min((currentPage - 1) * pageSize + 1, totalItems || data.length)}</span> to{' '}
            <span className="font-semibold text-[#172033]">{Math.min(currentPage * pageSize, totalItems || data.length)}</span> of{' '}
            <span className="font-semibold text-[#172033]">{totalItems || data.length}</span> records
          </div>

          {onPageChange && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-[#172033]">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
