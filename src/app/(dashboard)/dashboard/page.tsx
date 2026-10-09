'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
import { studentService } from '../../../services/student.service';
import { staffService } from '../../../services/staff.service';
import { feeService } from '../../../services/fee.service';
import { attendanceService } from '../../../services/attendance.service';

export default function DashboardPage() {
  const { data: studentsData } = useQuery({
    queryKey: ['dashboard-students'],
    queryFn: () => studentService.getStudents({ limit: 100 }),
  });

  const { data: staffData } = useQuery({
    queryKey: ['dashboard-staff'],
    queryFn: () => staffService.getStaffList({ limit: 100 }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['dashboard-invoices'],
    queryFn: () => feeService.getInvoices({ limit: 100 }),
  });

  const { data: holidaysData = [] } = useQuery({
    queryKey: ['dashboard-holidays'],
    queryFn: () => attendanceService.getHolidays(),
  });

  const students = studentsData?.items || [];
  const totalStudents = studentsData?.total ?? students.length;

  const staff = staffData?.items || [];
  const totalStaff = staffData?.total ?? staff.length;
  const teachersCount = staff.filter((s) => s.designation?.title?.toLowerCase().includes('teacher')).length;
  const otherStaffCount = totalStaff - teachersCount;

  const invoices = invoicesData?.items || [];
  const totalCollected = invoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);
  const totalPending = invoices.reduce((acc, inv) => acc + (Number(inv.balanceAmount) || 0), 0);

  // Gender demographics from students
  const boysCount = students.filter((s) => s.gender === 'MALE').length;
  const girlsCount = students.filter((s) => s.gender === 'FEMALE').length;
  const boysPercent = totalStudents > 0 ? ((boysCount / totalStudents) * 100).toFixed(1) : '0';
  const girlsPercent = totalStudents > 0 ? ((girlsCount / totalStudents) * 100).toFixed(1) : '0';

  const genderData = [
    { name: 'Boys', value: boysCount || (totalStudents === 0 ? 0 : 0), percentage: `${boysPercent}%`, color: '#2563EB' },
    { name: 'Girls', value: girlsCount || (totalStudents === 0 ? 0 : 0), percentage: `${girlsPercent}%`, color: '#F59E0B' },
  ];

  // Fee chart (derived or current total)
  const feeData = [
    { month: 'Total', collected: Math.round(totalCollected / 1000), pending: Math.round(totalPending / 1000) },
  ];

  // Upcoming Events from real holidays/calendar
  const upcomingEvents = holidaysData.slice(0, 3).map((h) => {
    const d = new Date(h.startDate);
    return {
      day: isNaN(d.getDate()) ? '1' : String(d.getDate()).padStart(2, '0'),
      month: isNaN(d.getMonth()) ? 'N/A' : d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      title: h.title,
      time: 'All Day',
      location: h.holidayType || 'School Event',
      color: 'bg-[#EFF6FF] text-[#2563EB]',
    };
  });

  // Recent Activities from recent students / staff registered
  const recentActivities = [
    ...students.slice(0, 2).map((s) => ({
      title: 'Student registered',
      desc: `${s.firstName} ${s.lastName} (${s.studentCode})`,
      time: new Date(s.createdAt).toLocaleDateString(),
      icon: Users,
      iconColor: 'bg-[#ECFDF5] text-[#10B981]',
    })),
    ...staff.slice(0, 2).map((st) => ({
      title: 'Staff member added',
      desc: `${st.firstName} ${st.lastName} (${st.employeeCode})`,
      time: new Date(st.createdAt).toLocaleDateString(),
      icon: Briefcase,
      iconColor: 'bg-[#EFF6FF] text-[#2563EB]',
    })),
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

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <KpiCard
          title="Students"
          value={totalStudents.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend="Total"
          trendPositive={true}
          colorScheme="blue"
        />
        <KpiCard
          title="Teachers"
          value={teachersCount.toLocaleString()}
          icon={<GraduationCap className="w-5 h-5" />}
          trend="Active"
          trendPositive={true}
          colorScheme="amber"
        />
        <KpiCard
          title="Staffs"
          value={totalStaff.toLocaleString()}
          icon={<Briefcase className="w-5 h-5" />}
          trend="Total"
          trendPositive={true}
          colorScheme="green"
        />
        <KpiCard
          title="Fee Collection"
          value={`₹ ${totalCollected.toLocaleString()}`}
          icon={<CreditCard className="w-5 h-5" />}
          trend={`₹ ${totalPending.toLocaleString()} pending`}
          trendPositive={totalPending === 0}
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
                  <span className="text-base font-bold text-[#172033]">{totalStudents.toLocaleString()}</span>
                  <span className="text-[10px] text-[#98A2B3]">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span className="text-[#667085] font-medium">Boys: {boysCount} ({boysPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#667085] font-medium">Girls: {girlsCount} ({girlsPercent}%)</span>
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
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[#98A2B3] py-4 text-center">No upcoming events recorded.</p>
              ) : (
                upcomingEvents.map((evt, idx) => (
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
                ))
              )}
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
                      strokeDasharray="100, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#172033]">{totalStudents > 0 ? '100%' : '0%'}</span>
                </div>
                <p className="text-xs font-bold text-[#172033] mt-2">Students</p>
                <p className="text-[11px] text-[#98A2B3]">{totalStudents} Total</p>
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
                      strokeDasharray="100, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#172033]">{totalStaff > 0 ? '100%' : '0%'}</span>
                </div>
                <p className="text-xs font-bold text-[#172033] mt-2">Staffs</p>
                <p className="text-[11px] text-[#98A2B3]">{totalStaff} Total</p>
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
