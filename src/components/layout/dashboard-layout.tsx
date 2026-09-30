'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { DesktopSidebar } from './desktop-sidebar';
import { TabletSidebar } from './tablet-sidebar';
import { MobileDrawer } from './mobile-drawer';
import { MobileBottomNav } from './mobile-bottom-nav';
import { TopHeader } from './top-header';
import { GlobalSearchDialog } from './global-search-dialog';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayoutShell({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col antialiased">
      {/* 1. Desktop Sidebar (>= 1280px) */}
      <div className="hidden xl:block">
        <DesktopSidebar />
      </div>

      {/* 2. Tablet Sidebar (768px - 1279px) */}
      <div className="hidden md:block xl:hidden">
        <TabletSidebar />
      </div>

      {/* 3. Mobile Slide-over Drawer (< 768px) */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 4. Global Search Modal (Ctrl+K) */}
      <GlobalSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-[72px] xl:pl-60 transition-all">
        {/* Top Header */}
        <TopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 5. Mobile Fixed Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav onOpenDrawer={() => setIsDrawerOpen(true)} />
    </div>
  );
}
