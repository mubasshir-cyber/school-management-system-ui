'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  Palmtree,
  Sparkles,
  Flag,
  Flame,
  Clock,
  Briefcase,
  Users,
} from 'lucide-react';
import { attendanceService, Holiday } from '../../../../services/attendance.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function HolidaysPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    holidayType: 'NATIONAL' as 'NATIONAL' | 'RELIGIOUS' | 'SCHOOL_EVENT' | 'VACATION' | 'OTHER',
    startDate: '',
    endDate: '',
    totalDays: 1,
    description: '',
    isRecurring: false,
  });

  // Queries
  const { data: holidaysData = [], refetch } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => attendanceService.getHolidays(),
  });

  const sampleHolidays: Holiday[] = [
    {
      id: '1',
      title: 'Independence Day',
      holidayType: 'NATIONAL',
      startDate: '2026-08-15',
      endDate: '2026-08-15',
      totalDays: 1,
      description: 'National public holiday celebration',
      isRecurring: true,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Eid-ul-Fitr Break',
      holidayType: 'RELIGIOUS',
      startDate: '2026-04-10',
      endDate: '2026-04-12',
      totalDays: 3,
      description: 'Religious festival celebration and break',
      isRecurring: false,
      createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Winter Vacation',
      holidayType: 'VACATION',
      startDate: '2026-12-24',
      endDate: '2027-01-05',
      totalDays: 13,
      description: 'Mid-term winter term break for all grades',
      isRecurring: true,
      createdAt: '2026-12-01T00:00:00Z',
    },
    {
      id: '4',
      title: 'Annual Sports Day Holiday',
      holidayType: 'SCHOOL_EVENT',
      startDate: '2026-11-18',
      endDate: '2026-11-18',
      totalDays: 1,
      description: 'Day off post sports day events',
      isRecurring: false,
      createdAt: '2026-11-01T00:00:00Z',
    },
  ];

  const holidayList = holidaysData.length > 0 ? holidaysData : sampleHolidays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await attendanceService.updateHoliday(editingHoliday.id, formData);
      } else {
        await attendanceService.createHoliday(formData);
      }
      setIsAddModalOpen(false);
      setEditingHoliday(null);
      refetch();
    } catch {
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      try {
        await attendanceService.deleteHoliday(id);
        refetch();
      } catch {
        // silent catch
      }
    }
  };

  const openAddModal = () => {
    setEditingHoliday(null);
    setFormData({
      title: '',
      holidayType: 'NATIONAL',
      startDate: '',
      endDate: '',
      totalDays: 1,
      description: '',
      isRecurring: false,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (h: Holiday) => {
    setEditingHoliday(h);
    setFormData({
      title: h.title,
      holidayType: h.holidayType,
      startDate: h.startDate,
      endDate: h.endDate,
      totalDays: h.totalDays,
      description: h.description || '',
      isRecurring: h.isRecurring,
    });
    setIsAddModalOpen(true);
  };

  const nationalCount = holidayList.filter((h) => h.holidayType === 'NATIONAL').length;
  const religiousCount = holidayList.filter((h) => h.holidayType === 'RELIGIOUS').length;
  const vacationDays = holidayList
    .filter((h) => h.holidayType === 'VACATION')
    .reduce((acc, curr) => acc + curr.totalDays, 0);
  const totalDays = holidayList.reduce((acc, curr) => acc + curr.totalDays, 0);

  const columns: Column<Holiday>[] = [
    {
      key: 'title',
      header: 'Holiday / Event Title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">{row.title}</span>
          {row.description && (
            <p className="text-[11px] text-[#98A2B3] mt-0.5 max-w-sm truncate">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      render: (row) => {
        const typeMap: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'primary' | 'neutral' }> = {
          NATIONAL: { label: 'National Holiday', variant: 'info' },
          RELIGIOUS: { label: 'Religious Festival', variant: 'primary' },
          VACATION: { label: 'Vacation Break', variant: 'success' },
          SCHOOL_EVENT: { label: 'School Event', variant: 'warning' },
          OTHER: { label: 'Other', variant: 'neutral' },
        };
        const conf = typeMap[row.holidayType] || typeMap.OTHER;
        return <Badge variant={conf.variant}>{conf.label}</Badge>;
      },
    },
    {
      key: 'dates',
      header: 'Schedule & Duration',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-[#172033]">
            {row.startDate} {row.startDate !== row.endDate && `to ${row.endDate}`}
          </div>
          <div className="text-[11px] text-[#667085] mt-0.5">
            {row.totalDays} day{row.totalDays > 1 ? 's' : ''} total
          </div>
        </div>
      ),
    },
    {
      key: 'recurring',
      header: 'Recurrence',
      render: (row) =>
        row.isRecurring ? (
          <Badge variant="success" className="text-[10px]">
            Annual Recurring
          </Badge>
        ) : (
          <span className="text-xs text-[#98A2B3]">Single Event</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 hover:bg-[#F2F4F7] rounded-lg text-[#667085] transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-[#FEF2F2] rounded-lg text-[#EF4444] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Holiday Calendar"
        description="Configure institutional holidays, national observances, and seasonal vacation schedules."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Holidays' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/attendance">
              <Button variant="outline" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
                Student Attendance
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Holiday
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total Off-Days</p>
            <h4 className="text-xl font-bold text-[#2563EB] mt-0.5">{totalDays} Days</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">National Holidays</p>
            <h4 className="text-xl font-bold text-[#10B981] mt-0.5">{nationalCount} Events</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Religious Observances</p>
            <h4 className="text-xl font-bold text-[#7C3AED] mt-0.5">{religiousCount} Events</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Vacation Days</p>
            <h4 className="text-xl font-bold text-[#F59E0B] mt-0.5">{vacationDays} Days</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
            <Palmtree className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={holidayList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search holiday title or description..."
      />

      {/* Add / Edit Holiday Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingHoliday ? 'Edit Holiday Event' : 'Add New Academic Holiday'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Holiday Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Independence Day, Winter Break"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Holiday Type</label>
            <select
              value={formData.holidayType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  holidayType: e.target.value as any,
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            >
              <option value="NATIONAL">National Holiday</option>
              <option value="RELIGIOUS">Religious Festival</option>
              <option value="VACATION">Vacation Break</option>
              <option value="SCHOOL_EVENT">School Event</option>
              <option value="OTHER">Other</option>
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
            <label className="block text-xs font-medium text-[#344054] mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Provide event notes or announcement details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isRecurring" className="text-xs text-[#344054]">
              Repeats annually on this date
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingHoliday ? 'Save Changes' : 'Create Holiday'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
