'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  UserCheck,
  Receipt,
  CheckCircle2,
  MoreHorizontal,
} from 'lucide-react';

export function RightSidebarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 10)); // July 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days grid for July 2026 (Starts Wednesday July 1)
  const calendarDays = [
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true, isSelected: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true, hasEvent: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true, hasEvent: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true, hasEvent: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
  ];

  const upcomingEvents = [
    {
      date: '15 July',
      time: '7.00 AM - 8.00 AM',
      title: 'New Student Inauguration Ceremony',
      grade: 'Grade 7',
      badgeBg: 'bg-amber-400 text-amber-950',
    },
    {
      date: '19 July',
      time: '10.00 AM - 11.00 AM',
      title: 'Chairman of Student Body Handover',
      grade: 'Grade 8',
      badgeBg: 'bg-amber-400 text-amber-950',
    },
    {
      date: '27 July',
      time: '3.00 PM',
      title: 'Closing of School Clubs Acceptance',
      grade: 'Grade 7',
      badgeBg: 'bg-amber-400 text-amber-950',
    },
  ];

  const recentActivities = [
    {
      icon: UserCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
      title: 'New student enrolled',
      detail: 'Ahmed Khan • Grade 5-A',
      time: '2m ago',
    },
    {
      icon: Receipt,
      iconColor: 'text-blue-600 bg-blue-50',
      title: 'Fee payment receipt generated',
      detail: 'Receipt #REC-2026-00142 • ₹12,500',
      time: '14m ago',
    },
    {
      icon: CheckCircle2,
      iconColor: 'text-purple-600 bg-purple-50',
      title: 'Term-1 Result Published',
      detail: 'Standard 10 Mathematics',
      time: '1h ago',
    },
  ];

  return (
    <aside className="w-full xl:w-[310px] space-y-5 flex-shrink-0">
      {/* Calendar Widget Card */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
        {/* Month Header with Navigation */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-extrabold text-base text-slate-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                )
              }
              className="p-1 rounded-lg hover:text-slate-800 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
                )
              }
              className="p-1 rounded-lg hover:text-slate-800 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="text-[11px] font-bold text-slate-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid Numbers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((item, idx) => (
            <div
              key={idx}
              className={`h-8 rounded-xl flex items-center justify-center text-xs font-semibold relative transition-all ${
                item.isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold'
                  : item.isCurrentMonth
                  ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                  : 'text-slate-300'
              }`}
            >
              <span>{item.day}</span>
              {item.hasEvent && !item.isSelected && (
                <span className="absolute bottom-1 w-1 h-1 bg-amber-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Card */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            Upcoming Events
          </h3>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((ev, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ev.badgeBg}`}>
                  {ev.date}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{ev.time}</span>
              </div>
              <div className="text-xs font-bold text-slate-800">
                {ev.title}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                {ev.grade}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Audit Stream */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            Recent Activity
          </h3>
          <Link
            href="/students"
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentActivities.map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${act.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {act.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{act.detail}</div>
                </div>
                <div className="text-[10px] text-slate-400 flex-shrink-0">{act.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
