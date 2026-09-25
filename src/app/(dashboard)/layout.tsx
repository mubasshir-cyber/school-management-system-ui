'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  CreditCard,
  FileSpreadsheet,
  Award,
  IdCard,
  Settings,
  LogOut,
  Building2,
  BookOpen,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Academic Structure', href: '/academic', icon: BookOpen },
  { name: 'Students & Admissions', href: '/students', icon: Users, badge: 'Phase 3' },
  { name: 'Staff & HR', href: '/staff', icon: UserCheck, badge: 'Phase 4' },
  { name: 'Attendance & Leaves', href: '/attendance', icon: Calendar, badge: 'Phase 5' },
  { name: 'Fees & Ledger', href: '/fees', icon: CreditCard, badge: 'Phase 6' },
  { name: 'Payroll', href: '/payroll', icon: FileSpreadsheet, badge: 'Phase 7' },
  { name: 'Exams & Results', href: '/exams', icon: Award, badge: 'Phase 9' },
  { name: 'ID Cards & Certs', href: '/documents', icon: IdCard, badge: 'Phase 10' },
  { name: 'School Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading ERP Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              School ERP
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase block">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* School Context Badge */}
        <div className="px-4 py-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 truncate">
              Apex International School
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              Main Campus (Delhi)
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800 text-slate-400 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400">
                {user.firstName[0]}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-slate-200 truncate">
                  {user.firstName} {user.lastName || ''}
                </div>
                <div className="text-[10px] text-indigo-400 truncate font-semibold uppercase">
                  {user.roles?.[0] || 'User'}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100">
              Administrative Control Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Session
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div>
              Academic Session:{' '}
              <span className="font-semibold text-indigo-400">2026-27</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
