'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { academicService } from '../../../services/academic.service';
import {
  Users,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: academicService.getAcademicYears,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: academicService.getSubjects,
  });

  const activeYear = years.find((y) => y.isCurrent) || years[0];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900/90 to-blue-950/60 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise ERP Active
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Apex International School
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Multi-Tenant ERP System initialized. Academic structure, dynamic classes,
            session configurations, and role-based permissions are active.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/academic"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Manage Academic Structure</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Current Session</div>
            <div className="text-xl font-bold text-white mt-1">
              {activeYear?.name || '2026-27'}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active Academic Year
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Classes Configured</div>
            <div className="text-2xl font-bold text-white mt-1">{classes.length}</div>
            <div className="text-[11px] text-indigo-400 mt-1 font-medium">
              Standards Registered
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Active Sections</div>
            <div className="text-2xl font-bold text-white mt-1">{sections.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Class Divisions
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Subjects Syllabus</div>
            <div className="text-2xl font-bold text-white mt-1">{subjects.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Core & Electives
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
