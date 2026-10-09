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
  ChevronRight,
  Layers,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { examsService, ExamSchedule } from '@/services/exams.service';
import { academicService, SubjectItem } from '@/services/academic.service';
import { staffService } from '@/services/staff.service';

export default function ExamScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const queryClient = useQueryClient();

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
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

  const { data: allSubjects = [] } = useQuery({
    queryKey: ['academic-subjects'],
    queryFn: () => academicService.getSubjects(),
  });

  const { data: classAssignedSubjects = [] } = useQuery({
    queryKey: ['class-subjects', slotData.classId],
    queryFn: () => academicService.getClassSubjects(slotData.classId),
    enabled: !!slotData.classId,
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

  const resetSlotForm = (prefillClassId?: string) => {
    const targetClassId = prefillClassId || classes[0]?.id || '';
    setSlotData({
      classId: targetClassId,
      sectionId: '',
      subjectId: '',
      examDate: exam?.startDate ? exam.startDate.split('T')[0] : '',
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

  const handleOpenSlotModal = (prefillClassId?: string) => {
    resetSlotForm(prefillClassId);
    setIsSlotModalOpen(true);
  };

  const handleSubjectChange = (subjectId: string) => {
    const sub = allSubjects.find((s) => s.id === subjectId);
    if (sub) {
      const theory = sub.theoryMaxMarks ?? 70;
      const practical = sub.practicalMaxMarks ?? 30;
      const total = theory + practical;
      const pass = sub.passingMarks ?? Math.round(total * 0.35);
      setSlotData({
        ...slotData,
        subjectId,
        theoryMaxMarks: theory,
        practicalMaxMarks: practical,
        maxMarks: total,
        passMarks: pass,
      });
    } else {
      setSlotData({ ...slotData, subjectId });
    }
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

  // Determine selectable subjects: prioritize subjects assigned to this class if available, else all subjects
  const availableSubjects: SubjectItem[] =
    classAssignedSubjects.length > 0
      ? classAssignedSubjects.map((cs) => cs.subject).filter(Boolean)
      : allSubjects;

  // Filter schedules by selected class
  const filteredSchedules =
    selectedClassFilter === 'ALL'
      ? schedules
      : schedules.filter((s) => s.classId === selectedClassFilter);

  // Group schedules by class for structured class-wise view
  const schedulesByClass = classes.map((cls) => {
    const classSchedules = schedules.filter((s) => s.classId === cls.id);
    return {
      class: cls,
      schedules: classSchedules,
    };
  }).filter((group) => selectedClassFilter === 'ALL' || group.class.id === selectedClassFilter);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{exam.name}</h1>
              <Badge variant={exam.status === 'RESULTS_PUBLISHED' ? 'success' : 'primary'}>
                {exam.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{exam.examType?.name}</span>
              <span>•</span>
              <span>{exam.academicYear?.name}</span>
              <span>•</span>
              <span>{exam.startDate?.split('T')[0]} to {exam.endDate?.split('T')[0]}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/exams/results/${exam.id}`}>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl">
              <Award className="w-4 h-4 mr-1.5" />
              View Results
            </Button>
          </Link>

          {exam.status === 'DRAFT' && (
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => updateStatusMutation.mutate('SCHEDULED')}
              disabled={updateStatusMutation.isPending}
            >
              Mark Scheduled
            </Button>
          )}

          {exam.status === 'SCHEDULED' && (
            <Button
              variant="outline"
              className="text-amber-700 border-amber-200 hover:bg-amber-50 rounded-2xl"
              onClick={() => updateStatusMutation.mutate('ONGOING')}
              disabled={updateStatusMutation.isPending}
            >
              Start Exam Session
            </Button>
          )}

          {exam.status === 'ONGOING' && (
            <Button
              variant="outline"
              className="text-blue-700 border-blue-200 hover:bg-blue-50 rounded-2xl"
              onClick={() => updateStatusMutation.mutate('COMPLETED')}
              disabled={updateStatusMutation.isPending}
            >
              Mark Completed
            </Button>
          )}

          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-500/20 cursor-pointer"
            onClick={() => handleOpenSlotModal()}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subject Paper
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Grading System:</span>
            <p className="font-bold text-slate-900 mt-0.5">{exam.gradingScale?.name || 'Standard Percentage'}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total Paper Slots:</span>
            <p className="font-bold text-blue-700 mt-0.5">{schedules.length} Papers Scheduled</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Exam Window:</span>
            <p className="font-bold text-slate-900 mt-0.5">{exam.startDate?.split('T')[0]} - {exam.endDate?.split('T')[0]}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Classes Covered:</span>
            <p className="font-bold text-slate-700 mt-0.5">
              {new Set(schedules.map((s) => s.classId)).size} / {classes.length} Classes
            </p>
          </div>
        </div>
      </Card>

      {/* Class Selector Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Class Filter:
        </span>
        <button
          onClick={() => setSelectedClassFilter('ALL')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            selectedClassFilter === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Classes ({schedules.length})
        </button>
        {classes.map((cls) => {
          const count = schedules.filter((s) => s.classId === cls.id).length;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassFilter(cls.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
                selectedClassFilter === cls.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cls.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Class-wise Grouped Timetable */}
      <div className="space-y-6">
        {schedulesByClass.map(({ class: cls, schedules: classSchedules }) => (
          <Card key={cls.id} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{cls.name}</h3>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {cls.code}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Level {cls.level}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {classSchedules.length} examination paper{classSchedules.length === 1 ? '' : 's'} scheduled for this class.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 text-xs font-bold"
                onClick={() => handleOpenSlotModal(cls.id)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Subject Paper for {cls.name}
              </Button>
            </div>

            {classSchedules.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No exam subject papers added for {cls.name} yet. Click &quot;Add Subject Paper&quot; above to schedule one.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Exam Date & Time</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Section / Room</th>
                      <th className="py-3 px-4">Marks Rubric</th>
                      <th className="py-3 px-4">Invigilator</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classSchedules.map((slot) => (
                      <tr key={slot.id} className="hover:bg-blue-50/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {slot.examDate?.split('T')[0]}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{slot.subject?.name}</div>
                          <div className="text-[11px] text-blue-600 font-mono font-semibold">
                            {slot.subject?.code}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {slot.section ? `Sec ${slot.section.name}` : 'All Sections'}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.roomNumber || 'TBD'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900">Total: {Number(slot.maxMarks) || 0}</span>
                            <span className="text-emerald-600 font-semibold ml-1.5">Pass: {Number(slot.passMarks) || 0}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Theory: {Number(slot.theoryMaxMarks) || 0} | Practical: {Number(slot.practicalMaxMarks) || 0}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {slot.invigilatorStaff ? (
                            <div className="flex items-center gap-1 text-slate-800 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{slot.invigilatorStaff.firstName} {slot.invigilatorStaff.lastName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/exams/marks-entry?scheduleId=${slot.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Enter Marks
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Paper Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Schedule Exam Subject Paper"
      >
        <form onSubmit={handleSlotSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Class *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
                value={slotData.classId}
                onChange={(e) => {
                  setSlotData({ ...slotData, classId: e.target.value, sectionId: '', subjectId: '' });
                }}
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name} ({cls.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Subject for this Class *
              </label>
              {classAssignedSubjects.length > 0 && (
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                  {classAssignedSubjects.length} class subjects loaded
                </span>
              )}
            </div>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
              value={slotData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code}) — Max: {(sub.theoryMaxMarks ?? 70) + (sub.practicalMaxMarks ?? 30)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Room / Hall Number
              </label>
              <Input
                placeholder="e.g. Exam Hall B-2"
                value={slotData.roomNumber}
                onChange={(e) => setSlotData({ ...slotData, roomNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Invigilator / Examiner
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Theory Max
              </label>
              <Input
                type="number"
                value={slotData.theoryMaxMarks}
                onChange={(e) => setSlotData({ ...slotData, theoryMaxMarks: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Practical Max
              </label>
              <Input
                type="number"
                value={slotData.practicalMaxMarks}
                onChange={(e) => setSlotData({ ...slotData, practicalMaxMarks: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-xs font-bold"
              onClick={() => setIsSlotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
              disabled={addScheduleMutation.isPending}
            >
              {addScheduleMutation.isPending ? 'Saving...' : 'Add Subject to Exam'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
