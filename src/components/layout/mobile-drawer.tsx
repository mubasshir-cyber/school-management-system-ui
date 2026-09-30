'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationGroups } from './nav-data';
import { useAuthStore } from '../../stores/auth.store';
import { GraduationCap, X, LogOut, ChevronRight } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0F2747] text-white flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#193860]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                EduSync
              </span>
              <span className="text-[9px] text-[#93C5FD] font-semibold tracking-wider uppercase block">
                School Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#193860] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-xl bg-[#193860]/70 border border-[#234E82] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center shrink-0">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.firstName || 'Brandon'} {user?.lastName || 'Sephton'}
            </p>
            <p className="text-[10px] text-[#93C5FD] truncate font-medium">
              {user?.roles?.[0] || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
          {navigationGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                {group.name}
              </div>
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
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                          : 'text-[#CBD5E1] hover:text-white hover:bg-[#193860]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-[#94A3B8]'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#193860] text-[#93C5FD]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-[#193860] bg-[#0A1B33]">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#193860] text-xs font-semibold text-white hover:bg-[#234E82] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#EF4444]" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
