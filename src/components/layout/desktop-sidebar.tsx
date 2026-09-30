'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationGroups } from './nav-data';
import { useAuthStore } from '../../stores/auth.store';
import {
  GraduationCap,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <aside className="w-60 bg-[#0F2747] text-white flex flex-col h-screen fixed inset-y-0 left-0 z-30 select-none shadow-xl border-r border-[#193860]">
      {/* Brand & Logo Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#193860]/80">
        <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="overflow-hidden">
          <span className="font-bold text-base tracking-tight text-white block truncate">
            EduSync
          </span>
          <span className="text-[10px] text-[#93C5FD] font-semibold tracking-wider uppercase block truncate">
            School Management
          </span>
        </div>
      </div>

      {/* Grouped ERP Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto scrollbar-none">
        {navigationGroups.map((group) => {
          const isCollapsed = !!collapsedGroups[group.name];
          const hasActiveChild = group.items.some((item) =>
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)),
          );

          return (
            <div key={group.name} className="space-y-1">
              {/* Group Header */}
              {group.name !== 'DASHBOARD' ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-[#94A3B8] hover:text-white uppercase tracking-wider rounded-md cursor-pointer transition-colors"
                >
                  <span className={hasActiveChild ? 'text-[#93C5FD] font-bold' : ''}>
                    {group.name}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#64748B]" />
                  )}
                </button>
              ) : null}

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                            : 'text-[#CBD5E1] hover:text-white hover:bg-[#193860]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-white'
                                : 'text-[#94A3B8] group-hover:text-white'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#193860] text-[#93C5FD] border border-[#2563EB]/40'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-[#193860] bg-[#0A1B33]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.firstName || 'Brandon'} {user?.lastName || 'Sephton'}
              </p>
              <p className="text-[10px] text-[#94A3B8] truncate">
                {user?.email || 'admin@school.edu'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#193860] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
