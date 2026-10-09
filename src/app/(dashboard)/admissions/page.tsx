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
import { admissionService, AdmissionItem } from '../../../services/admission.service';
import { academicService } from '../../../services/academic.service';

export default function AdmissionsPage() {
  const [academicYearId, setAcademicYearId] = useState('');
  const [status, setStatus] = useState('');
  const [classId, setClassId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicService.getAcademicYears(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['admissions', status, academicYearId, classId, search],
    queryFn: () =>
      admissionService.getAdmissions({
        status: status || undefined,
        academicYearId: academicYearId || undefined,
        classId: classId || undefined,
        search: search || undefined,
      }),
  });

  const admissionList = admissions;

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

  const columns: Column<AdmissionItem>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 text-center text-[#98A2B3]',
      render: (_, idx) => idx + 1,
    },
    {
      key: 'applicationNumber',
      header: 'App #',
      className: 'w-32',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#172033]">
          {row.applicationNumber}
        </span>
      ),
    },
    {
      key: 'applicantName',
      header: 'Applicant Name',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-[#172033] text-xs lg:text-sm">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (row) => row.class?.name || '-',
    },
    {
      key: 'applicationDate',
      header: 'Applied Date',
      render: (row) => <span className="text-[#667085]">{row.applicationDate ? new Date(row.applicationDate).toLocaleDateString() : '-'}</span>,
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
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/students/new?admissionId=${row.id}`} className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer">
            <Eye className="w-4 h-4" />
          </Link>
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
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicant name..."
        emptyTitle="No applications found"
        emptyDescription="There are no admission applications recorded in the database."
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name}
                </option>
              ))}
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
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
}
