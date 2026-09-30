'use client';

import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface TopHeaderProps {
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
}

export function TopHeader({ onOpenDrawer, onOpenSearch }: TopHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-[#F5F8FC] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-all border-b border-[#E5EAF1]/60">
      {/* Left: Mobile hamburger & Global Search bar on Desktop */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenDrawer}
          className="xl:hidden p-2 rounded-xl text-[#172033] hover:bg-white hover:shadow-xs transition-colors cursor-pointer"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Box */}
        <button
          onClick={onOpenSearch}
          className="w-full max-w-md hidden sm:flex items-center justify-between px-3.5 py-2 bg-white border border-[#E5EAF1] rounded-xl text-xs text-[#98A2B3] hover:border-[#2563EB] hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#98A2B3]" />
            <span>Search students, staff, fees, exams...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#98A2B3] bg-[#F1F5F9] border border-[#E2E8F0] rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Academic Year + Notifications + User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl bg-white border border-[#E5EAF1] text-[#667085] shadow-xs cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Academic Year Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E5EAF1] text-xs font-semibold text-[#172033] shadow-xs cursor-pointer hover:border-[#CBD5E1]">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Academic Year 2025–26</span>
          <ChevronDown className="w-3 h-3 text-[#98A2B3]" />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-xl bg-white border border-[#E5EAF1] text-[#667085] hover:text-[#172033] shadow-xs transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#E5EAF1] shadow-xs cursor-pointer hover:border-[#CBD5E1]">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-[#172033] leading-tight">
              {user?.firstName || 'Brandon'} {user?.lastName || 'Sephton'}
            </div>
            <div className="text-[10px] text-[#667085] font-medium">
              {user?.roles?.[0] || 'Administrator'}
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-[#98A2B3] hidden lg:block" />
        </div>
      </div>
    </header>
  );
}
