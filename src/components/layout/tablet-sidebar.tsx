'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationGroups } from './nav-data';
import { useAuthStore } from '../../stores/auth.store';
import {
  GraduationCap,
  LogOut,
} from 'lucide-react';

export function TabletSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const allItems = navigationGroups.flatMap((group) => group.items);

  return (
    <aside className="w-[72px] bg-white border-r border-slate-200/80 flex flex-col h-screen fixed inset-y-0 left-0 z-30 select-none items-center py-4 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Brand Icon */}
      <Link
        href="/dashboard"
        className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25 mb-6 hover:scale-105 transition-transform"
      >
        <GraduationCap className="w-6 h-6 text-white" />
      </Link>

      {/* Navigation Icons with Tooltips */}
      <nav className="flex-1 w-full px-3 space-y-2 overflow-y-auto no-scrollbar flex flex-col items-center">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <div key={item.name} className="relative group flex items-center justify-center w-full">
              <Link
                href={item.href}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>

              {/* Floating Tooltip */}
              <div className="absolute left-14 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap flex items-center gap-2">
                <span>{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-amber-400 text-slate-950 font-bold rounded">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Avatar & Logout */}
      <div className="w-full px-3 pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
        <div
          title={`${user?.firstName} (${user?.roles?.[0] || 'User'})`}
          className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center cursor-default shadow-xs"
        >
          {user?.firstName?.[0] || 'A'}
        </div>
        <button
          onClick={() => logout()}
          title="Logout"
          className="w-10 h-10 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
