'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Briefcase,
  CreditCard,
  Calendar,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileCheck,
  CalendarCheck,
  Award,
  IdCard,
  BarChart3,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KpiCard } from '../../../components/ui/kpi-card';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function DashboardPage() {
  // Fee Collection Line/Area Data (Jan - Aug)
  const feeData = [
    { month: 'Jan', collected: 210, pending: 80 },
    { month: 'Feb', collected: 260, pending: 95 },
    { month: 'Mar', collected: 230, pending: 70 },
    { month: 'Apr', collected: 340, pending: 110 },
    { month: 'May', collected: 290, pending: 85 },
    { month: 'Jun', collected: 380, pending: 130 },
    { month: 'Jul', collected: 320, pending: 90 },
    { month: 'Aug', collected: 420, pending: 105 },
  ];

  // Gender Demographics Data
  const genderData = [
    { name: 'Boys', value: 912, percentage: '52.5%', color: '#2563EB' },
    { name: 'Girls', value: 826, percentage: '47.5%', color: '#F59E0B' },
  ];

  // Upcoming Events
  const upcomingEvents = [
    {
      day: '15',
      month: 'JUL',
      title: 'New Student Orientation',
      time: '09:00 AM',
      location: 'Grade 7 - Main Auditorium',
      color: 'bg-[#EFF6FF] text-[#2563EB]',
    },
    {
      day: '19',
      month: 'JUL',
      title: 'Parent-Teacher Meeting',
      time: '10:30 AM',
      location: 'All Classes',
      color: 'bg-[#EFF6FF] text-[#2563EB]',
    },
    {
      day: '27',
      month: 'JUL',
      title: 'Science Fair',
      time: '02:00 PM',
      location: 'Grade 5–8',
      color: 'bg-[#EFF6FF] text-[#2563EB]',
    },
  ];

  // Recent Activities
  const recentActivities = [
    {
      title: 'New student registered',
      desc: 'Ahmed Khan (Grade 5)',
      time: '10 mins ago',
      icon: Users,
      iconColor: 'bg-[#ECFDF5] text-[#10B981]',
    },
    {
      title: 'Fee payment received',
      desc: 'Receipt #REC-2025-00142',
      time: '15 mins ago',
      icon: CreditCard,
      iconColor: 'bg-[#EFF6FF] text-[#2563EB]',
    },
    {
      title: 'Staff attendance updated',
      desc: 'Ayesha Patel',
      time: '2 hours ago',
      icon: CalendarCheck,
      iconColor: 'bg-[#FFFBEB] text-[#D97706]',
    },
    {
      title: 'Result published',
      desc: 'Grade 10 - Annual Exam',
      time: '3 hours ago',
      icon: Award,
      iconColor: 'bg-[#EFF6FF] text-[#2563EB]',
    },
  ];

  // Quick Action Items
  const quickActions = [
    { label: 'Add Student', icon: PlusCircle, href: '/students/new', color: 'text-[#2563EB] bg-[#EFF6FF]' },
    { label: 'Collect Fee', icon: CreditCard, href: '/fees', color: 'text-[#D97706] bg-[#FFFBEB]' },
    { label: 'Mark Attendance', icon: CalendarCheck, href: '/attendance', color: 'text-[#10B981] bg-[#ECFDF5]' },
    { label: 'Create Exam', icon: FileCheck, href: '/exams', color: 'text-[#E11D48] bg-[#FFF1F2]' },
    { label: 'Generate ID Card', icon: IdCard, href: '/students', color: 'text-[#9333EA] bg-[#FAF5FF]' },
    { label: 'View Reports', icon: BarChart3, href: '/dashboard', color: 'text-[#0284C7] bg-[#F0F9FF]' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Subtitle */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#172033] tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs lg:text-sm text-[#667085] mt-0.5">
          Good Morning, Admin! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Row 1: 4 KPI Cards (Desktop 4 cards, Mobile/Tablet 2x2 grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <KpiCard
          title="Students"
          value="1,738"
          icon={<Users className="w-5 h-5" />}
          trend="+ 12%"
          trendPositive={true}
          colorScheme="blue"
        />
        <KpiCard
          title="Teachers"
          value="179"
          icon={<GraduationCap className="w-5 h-5" />}
          trend="+ 2%"
          trendPositive={true}
          colorScheme="amber"
        />
        <KpiCard
          title="Staffs"
          value="65"
          icon={<Briefcase className="w-5 h-5" />}
          trend="+ 4%"
          trendPositive={true}
          colorScheme="green"
        />
        <KpiCard
          title="Fee Collection"
          value="₹ 8,93,450"
          icon={<CreditCard className="w-5 h-5" />}
          trend="+ 18%"
          trendPositive={true}
          colorScheme="rose"
        />
      </div>

      {/* Row 2: Fee Collection Overview (Line/Area Chart) + Students by Gender + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Fee Collection Overview Area Chart (7 Cols on Desktop) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="py-3.5">
              <div>
                <CardTitle>Fee Collection Overview</CardTitle>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#667085]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Collected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Pending
                  </span>
                </div>
              </div>
              <button className="text-[#98A2B3] hover:text-[#172033] p-1 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={feeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="feeCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="feePending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#98A2B3', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#98A2B3', fontSize: 11 }}
                      tickFormatter={(v) => `${v}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5EAF1',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#feeCollected)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#feePending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students by Gender Donut Chart (3.5 Cols) */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="py-3.5">
              <CardTitle>Students by Gender</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2 pb-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      innerRadius={48}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base font-bold text-[#172033]">1,738</span>
                  <span className="text-[10px] text-[#98A2B3]">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span className="text-[#667085] font-medium">Boys: 912 (52.5%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#667085] font-medium">Girls: 826 (47.5%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events (3.5 Cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="py-3.5">
              <CardTitle>Upcoming Events</CardTitle>
              <Link href="/academic" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 pb-4">
              {upcomingEvents.map((evt, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${evt.color}`}>
                    <span className="text-xs font-bold leading-none">{evt.day}</span>
                    <span className="text-[9px] font-semibold leading-tight">{evt.month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#172033] truncate">{evt.title}</p>
                    <p className="text-[11px] text-[#667085] truncate">{evt.location}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#98A2B3] shrink-0">{evt.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Today's Attendance Meters + Recent Activities + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Attendance Progress Circles (3 Cols) */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="py-3.5">
              <CardTitle>Today&apos;s Attendance</CardTitle>
              <button className="text-[#98A2B3] hover:text-[#172033] p-1 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="py-4 flex flex-row lg:flex-col items-center justify-around gap-4">
              {/* Students Circle */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E2E8F0]"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#10B981]"
                      strokeDasharray="94.2, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#172033]">94.2%</span>
                </div>
                <p className="text-xs font-bold text-[#172033] mt-2">Students</p>
                <p className="text-[11px] text-[#98A2B3]">1,637 / 1,738</p>
              </div>

              {/* Staffs Circle */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E2E8F0]"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#2563EB]"
                      strokeDasharray="96.5, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#172033]">96.5%</span>
                </div>
                <p className="text-xs font-bold text-[#172033] mt-2">Staffs</p>
                <p className="text-[11px] text-[#98A2B3]">62 / 65</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="py-3.5">
              <CardTitle>Recent Activities</CardTitle>
              <button className="text-xs font-semibold text-[#2563EB] hover:underline">
                View All
              </button>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-2 pb-4">
              {recentActivities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#172033] truncate">{act.title}</p>
                      <p className="text-[11px] text-[#667085] truncate">{act.desc}</p>
                    </div>
                    <span className="text-[10px] text-[#98A2B3] shrink-0 whitespace-nowrap">{act.time}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="py-3.5">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="grid grid-cols-3 gap-2.5">
                {quickActions.map((qa, idx) => {
                  const Icon = qa.icon;
                  return (
                    <Link
                      key={idx}
                      href={qa.href}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E5EAF1] hover:border-[#CBD5E1] hover:shadow-xs transition-all text-center group bg-white"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${qa.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#172033] leading-tight">
                        {qa.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
