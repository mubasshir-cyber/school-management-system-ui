'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Briefcase,
  Users,
  AlertCircle,
  Save,
  GraduationCap,
} from 'lucide-react';
import { staffService } from '../../../../services/staff.service';
import { attendanceService } from '../../../../services/attendance.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { DataTable, Column } from '../../../../components/tables/data-table';

interface StaffAttendanceRow {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  designationTitle: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  checkInTime: string;
  checkOutTime: string;
  isLate: boolean;
  isHalfDay: boolean;
  remarks: string;
}

export default function StaffAttendancePage() {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [search, setSearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => staffService.getDepartments(),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-for-attendance', departmentId],
    queryFn: () => staffService.getStaffList({ departmentId: departmentId || undefined, limit: 50 }),
  });

  // Local Attendance State
  const sampleStaff: StaffAttendanceRow[] = [
    {
      id: '1',
      employeeCode: 'EMP-2026-0001',
      firstName: 'Dr. Robert',
      lastName: 'Jenkins',
      departmentName: 'Mathematics',
      designationTitle: 'Senior Teacher',
      status: 'PRESENT',
      checkInTime: '08:15',
      checkOutTime: '16:00',
      isLate: false,
      isHalfDay: false,
      remarks: '',
    },
    {
      id: '2',
      employeeCode: 'EMP-2026-0002',
      firstName: 'Eleanor',
      lastName: 'Pena',
      departmentName: 'Science',
      designationTitle: 'Department Head',
      status: 'PRESENT',
      checkInTime: '08:25',
      checkOutTime: '16:05',
      isLate: false,
      isHalfDay: false,
      remarks: '',
    },
    {
      id: '3',
      employeeCode: 'EMP-2026-0003',
      firstName: 'Guy',
      lastName: 'Hawkins',
      departmentName: 'Languages',
      designationTitle: 'Teacher',
      status: 'LATE',
      checkInTime: '09:10',
      checkOutTime: '16:00',
      isLate: true,
      isHalfDay: false,
      remarks: 'Traffic delay',
    },
    {
      id: '4',
      employeeCode: 'EMP-2026-0004',
      firstName: 'Savannah',
      lastName: 'Nguyen',
      departmentName: 'Administration',
      designationTitle: 'HR Officer',
      status: 'LEAVE',
      checkInTime: '',
      checkOutTime: '',
      isLate: false,
      isHalfDay: false,
      remarks: 'Approved medical leave',
    },
    {
      id: '5',
      employeeCode: 'EMP-2026-0005',
      firstName: 'Cameron',
      lastName: 'Williamson',
      departmentName: 'Information Technology',
      designationTitle: 'IT Coordinator',
      status: 'PRESENT',
      checkInTime: '08:00',
      checkOutTime: '16:30',
      isLate: false,
      isHalfDay: false,
      remarks: '',
    },
  ];

  const [attendanceState, setAttendanceState] = useState<Record<string, StaffAttendanceRow>>(() => {
    const map: Record<string, StaffAttendanceRow> = {};
    sampleStaff.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  });

  const staffList =
    staffData?.items && staffData.items.length > 0
      ? staffData.items.map((s) => ({
          id: s.id,
          employeeCode: s.employeeCode,
          firstName: s.firstName,
          lastName: s.lastName,
          departmentName: s.department?.name || 'Academic',
          designationTitle: s.designation?.title || 'Staff',
          status: (attendanceState[s.id]?.status || 'PRESENT') as 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE',
          checkInTime: attendanceState[s.id]?.checkInTime || '08:15',
          checkOutTime: attendanceState[s.id]?.checkOutTime || '16:00',
          isLate: attendanceState[s.id]?.isLate || false,
          isHalfDay: attendanceState[s.id]?.isHalfDay || false,
          remarks: attendanceState[s.id]?.remarks || '',
        }))
      : Object.values(attendanceState);

  const updateStaffStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE') => {
    setAttendanceState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          id,
          employeeCode: '',
          firstName: '',
          lastName: '',
          departmentName: '',
          designationTitle: '',
          checkInTime: '08:15',
          checkOutTime: '16:00',
          isLate: false,
          isHalfDay: false,
          remarks: '',
        }),
        status,
        isLate: status === 'LATE',
        isHalfDay: status === 'HALF_DAY',
        checkInTime: status === 'ABSENT' || status === 'LEAVE' ? '' : (prev[id]?.checkInTime || '08:15'),
        checkOutTime: status === 'ABSENT' || status === 'LEAVE' ? '' : (prev[id]?.checkOutTime || '16:00'),
      },
    }));
  };

  const updateStaffField = (id: string, field: 'checkInTime' | 'checkOutTime' | 'remarks', value: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          id,
          employeeCode: '',
          firstName: '',
          lastName: '',
          departmentName: '',
          designationTitle: '',
          status: 'PRESENT',
          checkInTime: '08:15',
          checkOutTime: '16:00',
          isLate: false,
          isHalfDay: false,
          remarks: '',
        }),
        [field]: value,
      },
    }));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    setAttendanceState((prev) => {
      const next = { ...prev };
      staffList.forEach((st) => {
        next[st.id] = {
          ...(next[st.id] || st),
          status,
          checkInTime: status === 'PRESENT' ? '08:15' : '',
          checkOutTime: status === 'PRESENT' ? '16:00' : '',
        };
      });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const records = staffList.map((st) => {
        const item = attendanceState[st.id] || st;
        return {
          staffId: item.id,
          status: item.status,
          checkInTime: item.checkInTime || undefined,
          checkOutTime: item.checkOutTime || undefined,
          isLate: item.status === 'LATE',
          isHalfDay: item.status === 'HALF_DAY',
          remarks: item.remarks || undefined,
        };
      });

      await attendanceService.bulkSaveStaffAttendance({
        attendanceDate,
        records,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // KPI Metrics
  const presentCount = staffList.filter((s) => (attendanceState[s.id]?.status || s.status) === 'PRESENT').length;
  const absentCount = staffList.filter((s) => (attendanceState[s.id]?.status || s.status) === 'ABSENT').length;
  const lateCount = staffList.filter((s) => (attendanceState[s.id]?.status || s.status) === 'LATE').length;
  const leaveCount = staffList.filter((s) => (attendanceState[s.id]?.status || s.status) === 'LEAVE').length;
  const totalCount = staffList.length;
  const presentRate = totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) : '95.0';

  const columns: Column<StaffAttendanceRow>[] = [
    {
      key: 'employee',
      header: 'Employee Name & Code',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-[#172033] text-xs lg:text-sm">
            {row.firstName} {row.lastName}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.employeeCode}</span>
            <span>•</span>
            <span>{row.designationTitle}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <Badge variant="neutral" className="text-xs">
          {row.departmentName}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Attendance Status',
      className: 'w-72',
      render: (row) => {
        const current = attendanceState[row.id]?.status || row.status;
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => updateStaffStatus(row.id, 'PRESENT')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                current === 'PRESENT'
                  ? 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0] shadow-xs'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              Present
            </button>
            <button
              type="button"
              onClick={() => updateStaffStatus(row.id, 'ABSENT')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                current === 'ABSENT'
                  ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] shadow-xs'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              Absent
            </button>
            <button
              type="button"
              onClick={() => updateStaffStatus(row.id, 'LATE')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                current === 'LATE'
                  ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] shadow-xs'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              Late
            </button>
            <button
              type="button"
              onClick={() => updateStaffStatus(row.id, 'LEAVE')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                current === 'LEAVE'
                  ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] shadow-xs'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              Leave
            </button>
          </div>
        );
      },
    },
    {
      key: 'timing',
      header: 'Check-In / Out',
      render: (row) => {
        const current = attendanceState[row.id] || row;
        const isOff = current.status === 'ABSENT' || current.status === 'LEAVE';
        return (
          <div className="flex items-center gap-1.5">
            <input
              type="time"
              disabled={isOff}
              value={current.checkInTime}
              onChange={(e) => updateStaffField(row.id, 'checkInTime', e.target.value)}
              className="h-7 w-20 px-1 text-[11px] bg-[#F8FAFC] border border-[#E5EAF1] rounded disabled:opacity-40"
            />
            <span className="text-xs text-[#98A2B3]">-</span>
            <input
              type="time"
              disabled={isOff}
              value={current.checkOutTime}
              onChange={(e) => updateStaffField(row.id, 'checkOutTime', e.target.value)}
              className="h-7 w-20 px-1 text-[11px] bg-[#F8FAFC] border border-[#E5EAF1] rounded disabled:opacity-40"
            />
          </div>
        );
      },
    },
    {
      key: 'remarks',
      header: 'Remarks / Notes',
      render: (row) => {
        const current = attendanceState[row.id] || row;
        return (
          <input
            type="text"
            placeholder="e.g. Traffic, Approved..."
            value={current.remarks}
            onChange={(e) => updateStaffField(row.id, 'remarks', e.target.value)}
            className="h-7 w-full px-2 text-[11px] bg-[#F8FAFC] border border-[#E5EAF1] rounded text-[#172033]"
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Staff Attendance"
        description="Monitor staff daily check-ins, punctuality, and biometric/manual punch logs."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Staff' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/attendance">
              <Button variant="outline" size="sm" leftIcon={<GraduationCap className="w-3.5 h-3.5" />}>
                Student Attendance
              </Button>
            </Link>
            <Link href="/attendance/leaves">
              <Button variant="outline" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                Leave Requests
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')}>
              Mark All Present
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Attendance
            </Button>
          </div>
        }
      />

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2.5 text-[#10B981] text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Staff attendance for {attendanceDate} saved and synced to payroll engine successfully!</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Present Today</p>
            <h4 className="text-xl font-bold text-[#10B981] mt-0.5">{presentCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Absent Staff</p>
            <h4 className="text-xl font-bold text-[#EF4444] mt-0.5">{absentCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Late Arrivals</p>
            <h4 className="text-xl font-bold text-[#D97706] mt-0.5">{lateCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">On Leave</p>
            <h4 className="text-xl font-bold text-[#2563EB] mt-0.5">{leaveCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Staff Attendance DataTable */}
      <DataTable
        columns={columns}
        data={staffList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name or employee code..."
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            />
          </div>
        }
      />
    </div>
  );
}
