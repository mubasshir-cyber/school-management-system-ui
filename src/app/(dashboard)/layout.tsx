'use client';

import React from 'react';
import { DashboardLayoutShell } from '../../components/layout/dashboard-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
