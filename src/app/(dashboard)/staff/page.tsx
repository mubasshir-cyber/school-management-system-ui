'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase,
  UserPlus,
  Eye,
  Trash2,
  Building2,
  GraduationCap,
  Users,
  CalendarCheck,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { staffService, StaffMember } from '../../../services/staff.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { KpiCard } from '../../../components/ui/kpi-card';
import { DataTable, Column } from '../../../components/tables/data-table';

export default function StaffDirectoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: staffService.getDepartments,
  });

  const { data: designations = [] } = useQuery({
    queryKey: ['designations', departmentId],
    queryFn: () => staffService.getDesignations(departmentId || undefined),
  });

  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff-list', { search, departmentId, designationId, employmentType, status, page }],
    queryFn: () =>
      staffService.getStaffList({
        search: search || undefined,
        departmentId: departmentId || undefined,
        designationId: designationId || undefined,
        employmentType: employmentType || undefined,
        status: status || undefined,
        page,
        limit: 10,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: staffService.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
    },
  });

  // Mock sample staff if database is fresh
  const fallbackStaff: StaffMember[] = [
    {
      id: '1',
      employeeCode: 'EMP-2026-0001',
      firstName: 'Brandon',
      lastName: 'Sephton',
      email: 'brandon.sephton@school.edu',
      phone: '+91 98765 43210',
      gender: 'Male',
      dateOfBirth: '1988-04-15',
      dateOfJoining: '2022-06-01',
      employmentType: 'FULL_TIME',
      department: { id: 'd1', name: 'Mathematics', code: 'MATH', status: 'ACTIVE', createdAt: '' },
      designation: { id: 'des1', title: 'Senior Lecturer', code: 'SR-LEC', level: 3, status: 'ACTIVE', createdAt: '' },
      status: 'ACTIVE',
      createdAt: '',
    },
    {
      id: '2',
      employeeCode: 'EMP-2026-0002',
      firstName: 'Ayesha',
      lastName: 'Patel',
      email: 'ayesha.patel@school.edu',
      phone: '+91 98765 43211',
      gender: 'Female',
      dateOfBirth: '1992-08-20',
      dateOfJoining: '2023-01-15',
      employmentType: 'FULL_TIME',
      department: { id: 'd2', name: 'Science', code: 'SCI', status: 'ACTIVE', createdAt: '' },
      designation: { id: 'des2', title: 'Physics Teacher', code: 'PHY-TCH', level: 2, status: 'ACTIVE', createdAt: '' },
      status: 'ACTIVE',
      createdAt: '',
    },
    {
      id: '3',
      employeeCode: 'EMP-2026-0003',
      firstName: 'Vikram',
      lastName: 'Sharma',
      email: 'vikram.sharma@school.edu',
      phone: '+91 98765 43212',
      gender: 'Male',
      dateOfBirth: '1985-11-10',
      dateOfJoining: '2021-04-01',
      employmentType: 'FULL_TIME',
      department: { id: 'd3', name: 'Administration', code: 'ADMIN', status: 'ACTIVE', createdAt: '' },
      designation: { id: 'des3', title: 'Chief Accountant', code: 'ACC-CHIEF', level: 4, status: 'ACTIVE', createdAt: '' },
      status: 'ACTIVE',
      createdAt: '',
    },
    {
      id: '4',
      employeeCode: 'EMP-2026-0004',
      firstName: 'Fatima',
      lastName: 'Zaidi',
      email: 'fatima.zaidi@school.edu',
      phone: '+91 98765 43213',
      gender: 'Female',
      dateOfBirth: '1995-02-18',
      dateOfJoining: '2024-06-01',
      employmentType: 'CONTRACT',
      department: { id: 'd4', name: 'Languages', code: 'LANG', status: 'ACTIVE', createdAt: '' },
      designation: { id: 'des4', title: 'English Teacher', code: 'ENG-TCH', level: 2, status: 'ACTIVE', createdAt: '' },
      status: 'ON_LEAVE',
      createdAt: '',
    },
    {
      id: '5',
      employeeCode: 'EMP-2026-0005',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@school.edu',
      phone: '+91 98765 43214',
      gender: 'Male',
      dateOfBirth: '1990-07-25',
      dateOfJoining: '2023-08-15',
      employmentType: 'FULL_TIME',
      department: { id: 'd5', name: 'Physical Education', code: 'PET', status: 'ACTIVE', createdAt: '' },
      designation: { id: 'des5', title: 'Sports Instructor', code: 'SPORTS-INS', level: 2, status: 'ACTIVE', createdAt: '' },
      status: 'ACTIVE',
      createdAt: '',
    },
  ];

  const displayStaff =
    staffData?.items && staffData.items.length > 0 ? staffData.items : fallbackStaff;

  const totalCount = staffData?.total || 65;
  const totalPages = staffData?.totalPages || 7;

  const columns: Column<StaffMember>[] = [
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
          {row.firstName?.[0]}
          {row.lastName?.[0]}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Staff Name',
      sortable: true,
      render: (row) => (
        <Link
          href={`/staff/${row.id}`}
          className="group hover:text-[#2563EB] transition-colors"
        >
          <div className="font-semibold text-[#172033] group-hover:text-[#2563EB] text-xs lg:text-sm">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-[11px] text-[#98A2B3]">{row.email}</div>
        </Link>
      ),
    },
    {
      key: 'employeeCode',
      header: 'Employee Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#667085]">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row.department?.name || 'General',
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (row) => (
        <span className="text-xs font-medium text-[#172033]">
          {row.designation?.title || 'Staff'}
        </span>
      ),
    },
    {
      key: 'employmentType',
      header: 'Type',
      render: (row) => (
        <Badge variant="neutral" size="sm">
          {row.employmentType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const isActive = row.status === 'ACTIVE';
        const isOnLeave = row.status === 'ON_LEAVE';
        return (
          <Badge
            variant={isActive ? 'success' : isOnLeave ? 'warning' : 'danger'}
            dot
          >
            {row.status.replace('_', ' ')}
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
            href={`/staff/${row.id}`}
            className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
            title="View 360 Profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${row.firstName} ${row.lastName}?`)) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-1.5 text-[#667085] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
            title="Delete Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="Staff Directory"
        description="Manage teaching and non-teaching staff, departments, designations, and employee profiles."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/staff/departments">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                Departments & Designations
              </Button>
            </Link>
            <Link href="/staff/new">
              <Button
                variant="primary"
                size="md"
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                + Add Employee
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <KpiCard
          title="Total Staff"
          value="65"
          icon={<Briefcase className="w-5 h-5" />}
          trend="+ 4%"
          colorScheme="green"
        />
        <KpiCard
          title="Teaching Staff"
          value="48"
          icon={<GraduationCap className="w-5 h-5" />}
          trend="73.8%"
          colorScheme="blue"
        />
        <KpiCard
          title="Non-Teaching"
          value="17"
          icon={<Users className="w-5 h-5" />}
          trend="26.2%"
          colorScheme="amber"
        />
        <KpiCard
          title="On Leave Today"
          value="3"
          icon={<CalendarCheck className="w-5 h-5" />}
          trend="Approved"
          colorScheme="rose"
        />
      </div>

      {/* Staff DataTable */}
      <DataTable
        columns={columns}
        data={displayStaff}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, code, email, phone..."
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        onPageChange={setPage}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setDesignationId('');
              }}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={designationId}
              onChange={(e) => setDesignationId(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Designations</option>
              {designations.map((desig) => (
                <option key={desig.id} value={desig.id}>
                  {desig.title}
                </option>
              ))}
            </select>

            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="RESIGNED">Resigned</option>
            </select>
          </div>
        }
        renderMobileCard={(row) => (
          <Link
            href={`/staff/${row.id}`}
            className="flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-sm flex items-center justify-center shrink-0">
                {row.firstName?.[0]}
                {row.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB] truncate">
                  {row.firstName} {row.lastName}
                </p>
                <p className="text-[11px] font-mono text-[#667085] truncate">
                  {row.employeeCode} • {row.designation?.title || 'Staff'}
                </p>
                <p className="text-[10px] text-[#98A2B3]">
                  {row.department?.name || 'General'} • {row.employmentType.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant={row.status === 'ACTIVE' ? 'success' : 'warning'} size="sm" dot>
                {row.status.replace('_', ' ')}
              </Badge>
              <ChevronRight className="w-4 h-4 text-[#98A2B3]" />
            </div>
          </Link>
        )}
      />
    </div>
  );
}
