'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  Check,
  X,
  FileText,
  AlertCircle,
  Briefcase,
  Users,
} from 'lucide-react';
import { leaveService, LeaveRequest, LeaveType } from '../../../../services/leave.service';
import { staffService } from '../../../../services/staff.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function LeaveManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    staffId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    totalDays: 1,
    reason: '',
  });

  // Queries
  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveService.getLeaveTypes(),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-list-leaves'],
    queryFn: () => staffService.getStaffList({ limit: 100 }),
  });

  const { data: requestsData, refetch } = useQuery({
    queryKey: ['leave-requests', activeTab],
    queryFn: () =>
      leaveService.getLeaveRequests({
        status: activeTab === 'ALL' ? undefined : activeTab,
        limit: 50,
      }),
  });

  // Sample data fallback
  const sampleRequests: LeaveRequest[] = [
    {
      id: '1',
      applicantUserId: 'user-1',
      staffId: 'staff-1',
      staff: {
        employeeCode: 'EMP-2026-0001',
        firstName: 'Robert',
        lastName: 'Jenkins',
        department: { name: 'Mathematics' },
      },
      leaveTypeId: 'type-1',
      leaveType: {
        id: 'type-1',
        name: 'Sick Leave',
        code: 'SL',
        category: 'SICK',
        daysAllowedPerYear: 12,
        isPaid: true,
        isCarryForward: false,
        status: 'ACTIVE',
      },
      startDate: '2026-10-05',
      endDate: '2026-10-07',
      totalDays: 3,
      reason: 'Medical procedure and recovery rest',
      status: 'PENDING',
      createdAt: '2026-09-29T10:00:00Z',
    },
    {
      id: '2',
      applicantUserId: 'user-2',
      staffId: 'staff-2',
      staff: {
        employeeCode: 'EMP-2026-0002',
        firstName: 'Eleanor',
        lastName: 'Pena',
        department: { name: 'Science' },
      },
      leaveTypeId: 'type-2',
      leaveType: {
        id: 'type-2',
        name: 'Casual Leave',
        code: 'CL',
        category: 'CASUAL',
        daysAllowedPerYear: 10,
        isPaid: true,
        isCarryForward: false,
        status: 'ACTIVE',
      },
      startDate: '2026-10-12',
      endDate: '2026-10-12',
      totalDays: 1,
      reason: 'Attending family wedding ceremony',
      status: 'APPROVED',
      createdAt: '2026-09-28T14:30:00Z',
    },
    {
      id: '3',
      applicantUserId: 'user-3',
      staffId: 'staff-3',
      staff: {
        employeeCode: 'EMP-2026-0003',
        firstName: 'Guy',
        lastName: 'Hawkins',
        department: { name: 'Languages' },
      },
      leaveTypeId: 'type-3',
      leaveType: {
        id: 'type-3',
        name: 'Annual Vacation',
        code: 'AL',
        category: 'ANNUAL',
        daysAllowedPerYear: 15,
        isPaid: true,
        isCarryForward: true,
        status: 'ACTIVE',
      },
      startDate: '2026-10-20',
      endDate: '2026-10-25',
      totalDays: 5,
      reason: 'Annual trip abroad',
      status: 'REJECTED',
      rejectionReason: 'Clashes with mid-term examination schedule',
      createdAt: '2026-09-27T09:15:00Z',
    },
  ];

  const requestList =
    requestsData?.items && requestsData.items.length > 0 ? requestsData.items : sampleRequests;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leaveService.createLeaveRequest({
        staffId: formData.staffId || undefined,
        leaveTypeId: formData.leaveTypeId || (leaveTypes[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: Number(formData.totalDays) || 1,
        reason: formData.reason,
      });
      setIsApplyModalOpen(false);
      refetch();
    } catch {
      setIsApplyModalOpen(false);
    }
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    try {
      await leaveService.reviewLeaveRequest(selectedRequest.id, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      });
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      refetch();
    } catch {
      setIsReviewModalOpen(false);
    }
  };

  const pendingCount = requestList.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requestList.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requestList.filter((r) => r.status === 'REJECTED').length;

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'applicant',
      header: 'Applicant Details',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-[#172033] text-xs lg:text-sm">
            {row.staff ? `${row.staff.firstName} ${row.staff.lastName}` : 'Student Applicant'}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.staff?.employeeCode || 'STU'}</span>
            <span>•</span>
            <span>{row.staff?.department?.name || 'Academic'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Leave Type',
      render: (row) => (
        <Badge variant="neutral" className="text-xs font-semibold">
          {row.leaveType?.name || 'General Leave'}
        </Badge>
      ),
    },
    {
      key: 'duration',
      header: 'Duration & Dates',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-[#172033]">
            {row.startDate} <span className="text-[#98A2B3]">to</span> {row.endDate}
          </div>
          <div className="text-[11px] text-[#667085] mt-0.5">
            {row.totalDays} day{row.totalDays > 1 ? 's' : ''} duration
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <p className="text-xs text-[#475467] max-w-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (row) => {
        if (row.status === 'APPROVED') {
          return <Badge variant="success">Approved</Badge>;
        }
        if (row.status === 'REJECTED') {
          return <Badge variant="danger">Rejected</Badge>;
        }
        return <Badge variant="warning">Pending Review</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'PENDING' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs py-1 px-2.5"
              onClick={() => {
                setSelectedRequest(row);
                setIsReviewModalOpen(true);
              }}
            >
              Review
            </Button>
          ) : (
            <span className="text-[11px] text-[#98A2B3] italic">Completed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Leave Management"
        description="Review and process faculty, staff, and student leave applications."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Leaves' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/attendance/holidays">
              <Button variant="outline" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                Holiday Calendar
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsApplyModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Apply For Leave
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Pending Requests</p>
            <h4 className="text-xl font-bold text-[#D97706] mt-0.5">{pendingCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Approved Leaves</p>
            <h4 className="text-xl font-bold text-[#10B981] mt-0.5">{approvedCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Rejected Leaves</p>
            <h4 className="text-xl font-bold text-[#EF4444] mt-0.5">{rejectedCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Leave Policy Types</p>
            <h4 className="text-xl font-bold text-[#2563EB] mt-0.5">
              {leaveTypes.length > 0 ? leaveTypes.length : 4} Active
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF1] pb-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({
              tab === 'ALL'
                ? requestList.length
                : requestList.filter((r) => r.status === tab).length
            })
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={requestList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicant name, code, or reason..."
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">
              Select Staff / Employee
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            >
              <option value="">Select Employee...</option>
              {staffData?.items?.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Leave Type</label>
            <select
              value={formData.leaveTypeId}
              onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            >
              <option value="">Select Leave Category...</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.daysAllowedPerYear} days allowed)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Total Days</label>
            <input
              type="number"
              min="1"
              required
              value={formData.totalDays}
              onChange={(e) => setFormData({ ...formData, totalDays: Number(e.target.value) })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Reason for Leave</label>
            <textarea
              required
              rows={3}
              placeholder="State the detailed reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Request Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Leave Application"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Applicant:</span>
                <span className="font-semibold text-[#172033]">
                  {selectedRequest.staff
                    ? `${selectedRequest.staff.firstName} ${selectedRequest.staff.lastName}`
                    : 'Student'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Leave Type:</span>
                <span className="font-semibold text-[#172033]">
                  {selectedRequest.leaveType?.name || 'General Leave'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Duration:</span>
                <span className="font-semibold text-[#172033]">
                  {selectedRequest.startDate} to {selectedRequest.endDate} ({selectedRequest.totalDays} days)
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5EAF1]">
                <span className="text-[#667085] block mb-1">Reason:</span>
                <p className="text-[#344054] italic">{selectedRequest.reason}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">
                Rejection Remarks (Required if rejecting)
              </label>
              <textarea
                rows={2}
                placeholder="Reason for declining the leave request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2]"
                onClick={() => handleReview('REJECTED')}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Reject Request
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-[#10B981] hover:bg-[#059669]"
                onClick={() => handleReview('APPROVED')}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Approve Leave
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
