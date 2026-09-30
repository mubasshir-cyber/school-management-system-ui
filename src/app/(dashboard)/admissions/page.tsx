'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  UserPlus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { DataTable, Column } from '../../../components/tables/data-table';

export default function AdmissionsPage() {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [status, setStatus] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Mock data matching Mockup 8 in the reference image
  const admissionList = [
    {
      id: '1',
      applicantName: 'Ayan Mehta',
      class: 'Grade 5',
      appliedDate: '10 Jul 2025',
      status: 'SUBMITTED',
    },
    {
      id: '2',
      applicantName: 'Simran Kaur',
      class: 'Grade 1',
      appliedDate: '09 Jul 2025',
      status: 'UNDER_REVIEW',
    },
    {
      id: '3',
      applicantName: 'Rohan Shaikh',
      class: 'Grade 6',
      appliedDate: '08 Jul 2025',
      status: 'APPROVED',
    },
    {
      id: '4',
      applicantName: 'Meera Gupta',
      class: 'Grade 2',
      appliedDate: '07 Jul 2025',
      status: 'ENROLLED',
    },
    {
      id: '5',
      applicantName: 'Arjun Nair',
      class: 'Grade 9',
      appliedDate: '05 Jul 2025',
      status: 'REJECTED',
    },
  ];

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'SUBMITTED':
        return <Badge variant="warning">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info">Under Review</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'ENROLLED':
        return <Badge variant="primary">Enrolled</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{s}</Badge>;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 text-center text-[#98A2B3]',
      render: (_, idx) => idx + 1,
    },
    {
      key: 'applicantName',
      header: 'Applicant Name',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-[#172033] text-xs lg:text-sm">
          {row.applicantName}
        </span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (row) => row.class,
    },
    {
      key: 'appliedDate',
      header: 'Applied Date',
      render: (row) => <span className="text-[#667085]">{row.appliedDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-20',
      render: () => (
        <div className="flex items-center justify-end gap-1.5">
          <button className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title="Admissions"
        description="Review incoming student applications and admission status."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admissions' },
        ]}
        actions={
          <Link href="/students/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              + New Admission
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={admissionList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicant name..."
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="2025-26">Academic Year 2025-26</option>
              <option value="2026-27">Academic Year 2026-27</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="">All Classes</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
