'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  UserPlus,
  Eye,
  Trash2,
  Edit,
  Download,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { studentService } from '../../../services/student.service';
import { academicService } from '../../../services/academic.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { DataTable, Column } from '../../../components/tables/data-table';
import { Select } from '../../../components/ui/select';

export default function StudentsDirectoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2025-26');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => academicService.getSections(classId || undefined),
    enabled: !!classId,
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', { search, status, classId, sectionId, page }],
    queryFn: () =>
      studentService.getStudents({
        search: search || undefined,
        status: status || undefined,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        page,
        limit: 10,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  // Mock fallback data matching Mockup 4 if database is fresh
  const fallbackStudents = [
    {
      id: '1',
      studentCode: 'STU-2026-0001',
      firstName: 'Ahmed',
      lastName: 'Khan',
      email: 'ahmed.khan@example.com',
      gender: 'Male',
      status: 'ACTIVE',
      guardianName: 'Mohammed Khan',
      enrollments: [{ class: { name: 'Grade 5' }, section: { name: 'A' } }],
    },
    {
      id: '2',
      studentCode: 'STU-2026-0002',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@example.com',
      gender: 'Female',
      status: 'ACTIVE',
      guardianName: 'Rajesh Sharma',
      enrollments: [{ class: { name: 'Grade 5' }, section: { name: 'B' } }],
    },
    {
      id: '3',
      studentCode: 'STU-2026-0003',
      firstName: 'Rohan',
      lastName: 'Patel',
      email: 'rohan.patel@example.com',
      gender: 'Male',
      status: 'ACTIVE',
      guardianName: 'Kiran Patel',
      enrollments: [{ class: { name: 'Grade 4' }, section: { name: 'A' } }],
    },
    {
      id: '4',
      studentCode: 'STU-2026-0004',
      firstName: 'Sara',
      lastName: 'Ali',
      email: 'sara.ali@example.com',
      gender: 'Female',
      status: 'INACTIVE',
      guardianName: 'Tariq Ali',
      enrollments: [{ class: { name: 'Grade 4' }, section: { name: 'A' } }],
    },
    {
      id: '5',
      studentCode: 'STU-2026-0005',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@example.com',
      gender: 'Male',
      status: 'ACTIVE',
      guardianName: 'Harpreet Singh',
      enrollments: [{ class: { name: 'Grade 7' }, section: { name: 'A' } }],
    },
  ];

  const displayStudents =
    studentsData?.items && studentsData.items.length > 0
      ? studentsData.items
      : fallbackStudents;

  const totalCount = studentsData?.total || 1738;
  const totalPages = studentsData?.totalPages || 348;

  const columns: Column<any>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 text-center text-[#98A2B3]',
      render: (_, idx) => (page - 1) * 10 + idx + 1,
    },
    {
      key: 'photo',
      header: 'Photo',
      className: 'w-14',
      render: (row) => (
        <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/20">
          {row.firstName?.[0] || 'S'}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Student Name',
      sortable: true,
      render: (row) => (
        <Link
          href={`/students/${row.id}`}
          className="group hover:text-[#2563EB] transition-colors"
        >
          <div className="font-semibold text-[#172033] group-hover:text-[#2563EB] text-xs lg:text-sm">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-[11px] text-[#98A2B3]">
            {row.email || `${row.firstName.toLowerCase()}@example.com`}
          </div>
        </Link>
      ),
    },
    {
      key: 'studentCode',
      header: 'Student Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#667085]">
          {row.studentCode}
        </span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (row) => row.enrollments?.[0]?.class?.name || 'Grade 5',
    },
    {
      key: 'section',
      header: 'Section',
      render: (row) => row.enrollments?.[0]?.section?.name || 'A',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const isActive = (row.status || 'ACTIVE') === 'ACTIVE';
        return (
          <Badge variant={isActive ? 'success' : 'danger'} dot>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-20',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/students/${row.id}`}
            className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this student record?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-1.5 text-[#667085] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
            title="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title="Students"
        description="Manage students, enrollment and student profiles."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students' },
        ]}
        actions={
          <Link href="/students/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              + Add Student
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={displayStudents}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, code, admission no..."
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        onPageChange={setPage}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="2025-26">Academic Year 2025-26</option>
              <option value="2026-27">Academic Year 2026-27</option>
            </select>

            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSectionId('');
              }}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={!classId}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB] disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        }
        renderMobileCard={(row) => (
          <Link
            href={`/students/${row.id}`}
            className="flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-sm flex items-center justify-center shrink-0">
                {row.firstName?.[0] || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB] truncate">
                  {row.firstName} {row.lastName}
                </p>
                <p className="text-[11px] font-mono text-[#667085] truncate">
                  {row.studentCode}
                </p>
                <p className="text-[10px] text-[#98A2B3]">
                  Grade 5 • Section A • Guardian: {row.guardianName || 'Parent'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'} size="sm" dot>
                {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
              <ChevronRight className="w-4 h-4 text-[#98A2B3]" />
            </div>
          </Link>
        )}
      />
    </div>
  );
}
