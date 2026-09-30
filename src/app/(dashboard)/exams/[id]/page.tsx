'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  ArrowLeft,
  FileSpreadsheet,
  Award,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { examsService, ExamSchedule } from '@/services/exams.service';
import { academicService } from '@/services/academic.service';
import { staffService } from '@/services/staff.service';

export default function ExamScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const queryClient = useQueryClient();

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [slotData, setSlotData] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    examDate: '',
    startTime: '09:00:00',
    endTime: '12:00:00',
    roomNumber: '',
    maxMarks: 100,
    passMarks: 35,
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    invigilatorStaffId: '',
  });

  // Queries
  const { data: exam, isLoading: isLoadingExam } = useQuery({
    queryKey: ['exam-detail', examId],
    queryFn: () => examsService.getExamById(examId),
    enabled: !!examId,
  });

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['exam-schedules', examId],
    queryFn: () => examsService.getSchedules(examId),
    enabled: !!examId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['academic-classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['academic-sections', slotData.classId],
    queryFn: () => academicService.getSections(slotData.classId),
    enabled: !!slotData.classId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['academic-subjects'],
    queryFn: () => academicService.getSubjects(),
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff-list-all'],
    queryFn: async () => {
      const res = await staffService.getStaffList({ limit: 100 });
      return res?.items || [];
    },
  });

  // Add Schedule Slot Mutation
  const addScheduleMutation = useMutation({
    mutationFn: (data: Partial<ExamSchedule>) => examsService.createSchedule({ ...data, examId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-detail', examId] });
      setIsSlotModalOpen(false);
      resetSlotForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to add exam slot.');
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => examsService.updateExamStatus(examId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-detail', examId] });
    },
  });

  const resetSlotForm = () => {
    setSlotData({
      classId: '',
      sectionId: '',
      subjectId: '',
      examDate: exam?.startDate || '',
      startTime: '09:00:00',
      endTime: '12:00:00',
      roomNumber: '',
      maxMarks: 100,
      passMarks: 35,
      theoryMaxMarks: 80,
      practicalMaxMarks: 20,
      invigilatorStaffId: '',
    });
    setErrorMsg('');
  };

  const handleOpenSlotModal = () => {
    resetSlotForm();
    setIsSlotModalOpen(true);
  };

  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotData.classId || !slotData.subjectId || !slotData.examDate) {
      setErrorMsg('Please select Class, Subject, and Exam Date.');
      return;
    }
    addScheduleMutation.mutate(slotData);
  };

  if (isLoadingExam) {
    return <div className="p-8 text-center text-gray-500">Loading examination timetable...</div>;
  }

  if (!exam) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Exam not found.</p>
        <Button className="mt-4" onClick={() => router.push('/exams')}>Back to Exams</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{exam.name}</h1>
              <Badge variant={exam.status === 'RESULTS_PUBLISHED' ? 'success' : 'primary'}>
                {exam.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {exam.examType?.name} • {exam.academicYear?.name} • {exam.startDate} to {exam.endDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/exams/results/${exam.id}`}>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Award className="w-4 h-4 mr-1.5" />
              View Results
            </Button>
          </Link>

          {exam.status === 'DRAFT' && (
            <Button
              variant="outline"
              onClick={() => updateStatusMutation.mutate('SCHEDULED')}
              disabled={updateStatusMutation.isPending}
            >
              Mark Scheduled
            </Button>
          )}

          {exam.status === 'SCHEDULED' && (
            <Button
              variant="outline"
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
              onClick={() => updateStatusMutation.mutate('ONGOING')}
              disabled={updateStatusMutation.isPending}
            >
              Start Exam Session
            </Button>
          )}

          {exam.status === 'ONGOING' && (
            <Button
              variant="outline"
              className="text-blue-700 border-blue-200 hover:bg-blue-50"
              onClick={() => updateStatusMutation.mutate('COMPLETED')}
              disabled={updateStatusMutation.isPending}
            >
              Mark Completed
            </Button>
          )}

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleOpenSlotModal}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Paper Slot
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-medium">Grading System:</span>
            <p className="font-semibold text-gray-900 mt-0.5">{exam.gradingScale?.name || 'Standard Percentage'}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Total Paper Slots:</span>
            <p className="font-semibold text-blue-700 mt-0.5">{schedules.length} scheduled</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Exam Window:</span>
            <p className="font-semibold text-gray-900 mt-0.5">{exam.startDate} - {exam.endDate}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Description:</span>
            <p className="font-semibold text-gray-700 mt-0.5 line-clamp-1">{exam.description || 'Summative semester examination'}</p>
          </div>
        </div>
      </Card>

      {/* Timetable Slots Table */}
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Examination Timetable & Papers</h3>
            <p className="text-xs text-gray-500">Scheduled test dates, classrooms, invigilators, and score rubrics.</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Class / Section</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Marks Structure</th>
                <th className="py-3 px-4">Invigilator</th>
                <th className="py-3 px-4 text-right">Marks Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoadingSchedules ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Loading timetable slots...</td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No examination paper slots added yet. Click &quot;Add Paper Slot&quot; above.
                  </td>
                </tr>
              ) : (
                schedules.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {slot.examDate}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {slot.class?.name} {slot.section ? `• Sec ${slot.section.name}` : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{slot.subject?.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{slot.subject?.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {slot.roomNumber || 'TBD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div><span className="font-semibold text-gray-900">Total: {slot.maxMarks}</span> (Pass: {slot.passMarks})</div>
                      <div className="text-gray-500">Th: {slot.theoryMaxMarks} | Pr: {slot.practicalMaxMarks}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {slot.invigilatorStaff ? (
                        <div className="flex items-center gap-1 text-gray-800">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{slot.invigilatorStaff.firstName} {slot.invigilatorStaff.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/exams/marks-entry?scheduleId=${slot.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Enter Marks
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Paper Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Schedule Exam Paper Slot"
      >
        <form onSubmit={handleSlotSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Class *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={slotData.classId}
                onChange={(e) => setSlotData({ ...slotData, classId: e.target.value, sectionId: '' })}
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Section (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={slotData.sectionId}
                onChange={(e) => setSlotData({ ...slotData, sectionId: e.target.value })}
                disabled={!slotData.classId}
              >
                <option value="">All Sections / Unified</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subject *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              value={slotData.subjectId}
              onChange={(e) => setSlotData({ ...slotData, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Exam Date *
              </label>
              <Input
                type="date"
                value={slotData.examDate}
                onChange={(e) => setSlotData({ ...slotData, examDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Time *
              </label>
              <Input
                type="time"
                value={slotData.startTime}
                onChange={(e) => setSlotData({ ...slotData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                End Time *
              </label>
              <Input
                type="time"
                value={slotData.endTime}
                onChange={(e) => setSlotData({ ...slotData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Room / Hall Number
              </label>
              <Input
                placeholder="e.g. Exam Hall B-2"
                value={slotData.roomNumber}
                onChange={(e) => setSlotData({ ...slotData, roomNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Invigilator / Examiner
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={slotData.invigilatorStaffId}
                onChange={(e) => setSlotData({ ...slotData, invigilatorStaffId: e.target.value })}
              >
                <option value="">Select Faculty</option>
                {staffList.map((st: any) => (
                  <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Max Marks *
              </label>
              <Input
                type="number"
                value={slotData.maxMarks}
                onChange={(e) => setSlotData({ ...slotData, maxMarks: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pass Marks *
              </label>
              <Input
                type="number"
                value={slotData.passMarks}
                onChange={(e) => setSlotData({ ...slotData, passMarks: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Theory Max
              </label>
              <Input
                type="number"
                value={slotData.theoryMaxMarks}
                onChange={(e) => setSlotData({ ...slotData, theoryMaxMarks: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Practical Max
              </label>
              <Input
                type="number"
                value={slotData.practicalMaxMarks}
                onChange={(e) => setSlotData({ ...slotData, practicalMaxMarks: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSlotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={addScheduleMutation.isPending}
            >
              {addScheduleMutation.isPending ? 'Saving...' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
