'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { enrollmentService } from '../../../services/enrollment.service';
import { academicService } from '../../../services/academic.service';
import { PageHeader } from '../../../components/ui/page-header';
import { DataTable, Column } from '../../../components/tables/data-table';
import { Select } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';

export default function EnrollmentHistoryPage() {
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: academicService.getAcademicYears,
  });

  useEffect(() => {
    if (!academicYearId && academicYears.length > 0) {
      const active = academicYears.find((y) => y.isCurrent) || academicYears[0];
      if (active) setAcademicYearId(active.id);
    }
  }, [academicYears, academicYearId]);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', academicYearId],
    queryFn: () => academicService.getClasses(academicYearId || undefined),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', classId, academicYearId],
    queryFn: () => academicService.getSections(classId || undefined, academicYearId || undefined),
    enabled: !!classId,
  });

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', { academicYearId, classId, sectionId, status }],
    queryFn: () =>
      enrollmentService.getEnrollments({
        academicYearId: academicYearId || undefined,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        status: status || undefined,
      }),
  });

  const columns: Column<any>[] = [
    {
      key: 'rollNumber',
      header: 'Roll #',
      className: 'w-20 font-mono font-bold text-[#2563EB]',
      render: (row) => row.rollNumber || '-',
    },
    {
      key: 'student',
      header: 'Student Name & Code',
      sortable: true,
      render: (row) => (
        <Link
          href={`/students/${row.student?.id || row.studentId}`}
          className="group flex items-center gap-3 hover:text-[#2563EB] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#E5EAF1]">
            {row.student?.photoUrl ? (
              <img
                src={row.student.photoUrl}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {row.student?.firstName?.[0] || 'S'}
                {row.student?.lastName?.[0] || ''}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-[#172033] group-hover:text-[#2563EB] text-xs lg:text-sm">
              {row.student?.firstName} {row.student?.lastName}
            </div>
            <div className="text-[11px] font-mono text-[#667085]">
              {row.student?.studentCode}
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'class',
      header: 'Class / Grade',
      render: (row) => row.class?.name || '-',
    },
    {
      key: 'section',
      header: 'Section',
      render: (row) => (
        <span className="font-medium text-[#172033]">
          {row.section?.name ? `Section ${row.section.name}` : '-'}
        </span>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Session',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[#172033]">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{row.academicYear?.name || '-'}</span>
          {row.academicYear?.isCurrent && (
            <Badge variant="primary" size="sm">Current</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Enrollment Status',
      render: (row) => {
        const isActive = (row.status || 'ACTIVE') === 'ACTIVE';
        return (
          <Badge variant={isActive ? 'success' : 'neutral'} dot>
            {row.status || 'ACTIVE'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-20',
      render: (row) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/students/${row.student?.id || row.studentId}`}
            className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
            title="View Student 360 Profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title="Enrollment History"
        description="Track student class promotions, section assignments, and roll numbers across academic years."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: 'Enrollments' },
        ]}
      />

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <Select
          label="Academic Year"
          value={academicYearId}
          onChange={(e) => {
            setAcademicYearId(e.target.value);
            setClassId('');
            setSectionId('');
          }}
          options={[
            { label: 'All Academic Years', value: '' },
            ...academicYears.map((ay) => ({
              label: `${ay.name}${ay.isCurrent ? ' (Active)' : ''}`,
              value: ay.id,
            })),
          ]}
        />
        <Select
          label="Class"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setSectionId('');
          }}
          options={[
            { label: 'All Classes', value: '' },
            ...classes.map((c) => ({
              label: c.name,
              value: c.id,
            })),
          ]}
        />
        <Select
          label="Section"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={!classId}
          options={[
            { label: 'All Sections', value: '' },
            ...sections.map((s) => ({
              label: `Section ${s.name}`,
              value: s.id,
            })),
          ]}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Transferred', value: 'TRANSFERRED' },
            { label: 'Withdrawn', value: 'WITHDRAWN' },
          ]}
        />
      </div>

      {/* Enrollments Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {enrollments.length === 0 && !isLoading ? (
          <EmptyState
            title="No Enrollments Found"
            description="There are no student enrollments recorded for the selected filters."
            actionLabel="Register New Student"
            onAction={() => window.location.href = '/students/new'}
          />
        ) : (
          <DataTable
            data={enrollments}
            columns={columns}
            isLoading={isLoading}
            keyExtractor={(row) => row.id}
          />
        )}
      </div>
    </div>
  );
}
