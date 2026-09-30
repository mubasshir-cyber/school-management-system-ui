'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  Plus,
  Calendar,
  Layers,
  Award,
  BookOpen,
  ArrowUpRight,
  Eye,
  Settings2,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/tables/data-table';
import { examsService, Exam, ExamType, GradingScale } from '@/services/exams.service';
import { academicService } from '@/services/academic.service';

export default function ExaminationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicYearId: '',
    examTypeId: '',
    gradingScaleId: '',
    startDate: '',
    endDate: '',
  });

  // Queries
  const { data: examsData, isLoading } = useQuery({
    queryKey: ['exams-list', selectedYear, selectedStatus],
    queryFn: () => examsService.getExams({ academicYearId: selectedYear || undefined, status: selectedStatus || undefined }),
  });

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years-all'],
    queryFn: () => academicService.getAcademicYears(),
  });

  const { data: examTypes = [] } = useQuery({
    queryKey: ['exam-types-all'],
    queryFn: () => examsService.getExamTypes(),
  });

  const { data: gradingScales = [] } = useQuery({
    queryKey: ['grading-scales-all'],
    queryFn: () => examsService.getGradingScales(),
  });

  // Create Exam Mutation
  const createExamMutation = useMutation({
    mutationFn: (data: Partial<Exam>) => examsService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams-list'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to schedule exam.');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      academicYearId: academicYears[0]?.id || '',
      examTypeId: examTypes[0]?.id || '',
      gradingScaleId: gradingScales[0]?.id || '',
      startDate: '',
      endDate: '',
    });
    setErrorMsg('');
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      description: '',
      academicYearId: academicYears[0]?.id || '',
      examTypeId: examTypes[0]?.id || '',
      gradingScaleId: gradingScales[0]?.id || '',
      startDate: '',
      endDate: '',
    });
    setErrorMsg('');
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.academicYearId || !formData.examTypeId || !formData.startDate || !formData.endDate) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }
    createExamMutation.mutate(formData);
  };

  const exams = examsData?.items || [];

  // KPIs
  const scheduledCount = exams.filter(e => e.status === 'SCHEDULED' || e.status === 'ONGOING').length;
  const publishedCount = exams.filter(e => e.status === 'RESULTS_PUBLISHED').length;
  const totalSlotsCount = exams.reduce((acc, curr) => acc + (curr.schedules?.length || 0), 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'RESULTS_PUBLISHED': return 'success';
      case 'ONGOING': return 'warning';
      case 'SCHEDULED': return 'primary';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'danger';
      default: return 'neutral';
    }
  };

  const columns: Column<Exam>[] = [
    {
      key: 'name',
      header: 'Exam Title',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1.5">
            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
              {row.examType?.name || 'Standard Exam'}
            </span>
            <span>•</span>
            <span>{row.academicYear?.name || 'Academic Year'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Timeline',
      render: (row) => (
        <div className="text-xs text-gray-700 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{row.startDate}</span>
          <span className="text-gray-400">to</span>
          <span>{row.endDate}</span>
        </div>
      ),
    },
    {
      key: 'schedules',
      header: 'Schedules',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
          <Clock className="w-3 h-3 text-gray-500" />
          {row.schedules?.length || 0} papers
        </span>
      ),
    },
    {
      key: 'gradingScale',
      header: 'Grading Scale',
      render: (row) => (
        <span className="text-xs text-gray-600">
          {row.gradingScale?.name || 'Default % Scale'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-36',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/exams/${row.id}`}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors title='Timetable & Schedule'"
          >
            <Calendar className="w-4 h-4" />
          </Link>
          <Link
            href={`/exams/results/${row.id}`}
            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors title='Results & Rankings'"
          >
            <Award className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations & Assessments Engine"
        description="Configure exam terms, timetables, rapid marks entry rosters, grading rubrics, and printable report cards."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examinations' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/exams/marks-entry">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Marks Entry Sheet
              </Button>
            </Link>
            <Link href="/exams/grading">
              <Button variant="outline" className="text-gray-700">
                <Settings2 className="w-4 h-4 mr-1.5" />
                Grading Scales
              </Button>
            </Link>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleOpenModal}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Schedule Exam
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Exams</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{exams.length}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Academic Sessions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active / Scheduled</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{scheduledCount}</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Pending evaluation</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Published Results</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Report cards live</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Papers</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">{totalSlotsCount}</h3>
              <p className="text-xs text-purple-600 font-medium mt-1">Class-Subject slots</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="p-6 bg-white">
        <DataTable
          columns={columns}
          data={exams}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search exams..."
          isLoading={isLoading}
          filterSlot={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
              >
                <option value="">All Academic Years</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>{ay.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="RESULTS_PUBLISHED">Results Published</option>
              </select>
            </div>
          }
        />
      </Card>

      {/* Schedule Exam Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Examination Term"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Exam Title *
            </label>
            <Input
              placeholder="e.g. Mid-Term Examination 2026-27"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Academic Year *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={formData.academicYearId}
                onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>{ay.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Exam Type / Term *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={formData.examTypeId}
                onChange={(e) => setFormData({ ...formData, examTypeId: e.target.value })}
                required
              >
                <option value="">Select Exam Type</option>
                {examTypes.map((et) => (
                  <option key={et.id} value={et.id}>{et.name} ({et.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Grading Scale Rubric
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              value={formData.gradingScaleId}
              onChange={(e) => setFormData({ ...formData, gradingScaleId: e.target.value })}
            >
              <option value="">Default 100% Score Scale</option>
              {gradingScales.map((gs) => (
                <option key={gs.id} value={gs.id}>{gs.name} ({gs.scaleType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Instructions
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Guidelines for invigilators and students..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={createExamMutation.isPending}
            >
              {createExamMutation.isPending ? 'Scheduling...' : 'Save & Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
