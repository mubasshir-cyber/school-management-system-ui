'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Search,
  BookOpen,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { examsService, Exam, ExamSchedule, StudentMarkRosterItem } from '@/services/exams.service';

function MarksEntryContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const urlScheduleId = searchParams.get('scheduleId') || '';
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState(urlScheduleId);
  const [searchFilter, setSearchFilter] = useState('');
  const [marksState, setMarksState] = useState<Record<string, {
    theoryMarks: number;
    practicalMarks: number;
    internalMarks: number;
    isAbsent: boolean;
    remarks: string;
  }>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Exams
  const { data: examsData } = useQuery({
    queryKey: ['exams-list-all'],
    queryFn: () => examsService.getExams({ limit: 100 }),
  });
  const exams = examsData?.items || [];

  // If URL has scheduleId, find the exam it belongs to
  useEffect(() => {
    if (urlScheduleId) {
      setSelectedScheduleId(urlScheduleId);
    }
  }, [urlScheduleId]);

  // Fetch schedules for selected exam
  const { data: schedules = [] } = useQuery({
    queryKey: ['exam-schedules', selectedExamId],
    queryFn: () => examsService.getSchedules(selectedExamId),
    enabled: !!selectedExamId,
  });

  // Fetch marks roster for selected schedule
  const { data: marksData, isLoading: isLoadingMarks } = useQuery({
    queryKey: ['schedule-marks', selectedScheduleId],
    queryFn: () => examsService.getMarksBySchedule(selectedScheduleId),
    enabled: !!selectedScheduleId,
  });

  const schedule = marksData?.schedule;
  const roster = marksData?.roster || [];

  // When roster loads, populate marksState
  useEffect(() => {
    if (roster.length > 0) {
      const initial: Record<string, any> = {};
      roster.forEach((r) => {
        initial[r.studentId] = {
          theoryMarks: r.theoryMarks || 0,
          practicalMarks: r.practicalMarks || 0,
          internalMarks: r.internalMarks || 0,
          isAbsent: r.isAbsent || false,
          remarks: r.remarks || '',
        };
      });
      setMarksState(initial);
      setSaveSuccessMsg('');
      setErrorMsg('');
    }
  }, [marksData]);

  // Submit Marks Mutation
  const submitMarksMutation = useMutation({
    mutationFn: (data: any) => examsService.submitMarks(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['schedule-marks', selectedScheduleId] });
      setSaveSuccessMsg(res?.message || 'Marks saved successfully.');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to submit marks.');
      setSaveSuccessMsg('');
    },
  });

  const handleScoreChange = (studentId: string, field: 'theoryMarks' | 'practicalMarks' | 'internalMarks', val: number) => {
    const current = marksState[studentId] || {
      theoryMarks: 0,
      practicalMarks: 0,
      internalMarks: 0,
      isAbsent: false,
      remarks: '',
    };

    // Validation against max marks
    if (field === 'theoryMarks' && schedule?.theoryMaxMarks && val > schedule.theoryMaxMarks) {
      val = schedule.theoryMaxMarks;
    }
    if (field === 'practicalMarks' && schedule?.practicalMaxMarks && val > schedule.practicalMaxMarks) {
      val = schedule.practicalMaxMarks;
    }

    setMarksState({
      ...marksState,
      [studentId]: {
        ...current,
        [field]: Math.max(0, val),
      },
    });
  };

  const handleAbsentToggle = (studentId: string, isAbsent: boolean) => {
    const current = marksState[studentId] || {
      theoryMarks: 0,
      practicalMarks: 0,
      internalMarks: 0,
      isAbsent: false,
      remarks: '',
    };

    setMarksState({
      ...marksState,
      [studentId]: {
        ...current,
        isAbsent,
        theoryMarks: isAbsent ? 0 : current.theoryMarks,
        practicalMarks: isAbsent ? 0 : current.practicalMarks,
        internalMarks: isAbsent ? 0 : current.internalMarks,
      },
    });
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    const current = marksState[studentId] || {
      theoryMarks: 0,
      practicalMarks: 0,
      internalMarks: 0,
      isAbsent: false,
      remarks: '',
    };

    setMarksState({
      ...marksState,
      [studentId]: {
        ...current,
        remarks,
      },
    });
  };

  const handleSaveAll = () => {
    if (!selectedScheduleId) return;

    const payload = {
      examScheduleId: selectedScheduleId,
      status: 'SUBMITTED',
      marks: Object.entries(marksState).map(([studentId, data]) => ({
        studentId,
        theoryMarks: data.theoryMarks,
        practicalMarks: data.practicalMarks,
        internalMarks: data.internalMarks,
        isAbsent: data.isAbsent,
        remarks: data.remarks,
      })),
    };

    submitMarksMutation.mutate(payload);
  };

  const filteredRoster = roster.filter((r) =>
    r.student.firstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.student.lastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.student.rollNumber && r.student.rollNumber.toLowerCase().includes(searchFilter.toLowerCase())) ||
    r.student.admissionNumber.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrix Marks Entry Sheet"
        description="Rapid grade entry and live validation sheet for examination invigilators and subject teachers."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examinations', href: '/exams' },
          { label: 'Marks Entry' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveAll}
              disabled={submitMarksMutation.isPending || !selectedScheduleId || roster.length === 0}
            >
              <Save className="w-4 h-4 mr-1.5" />
              {submitMarksMutation.isPending ? 'Submitting...' : 'Save & Submit Marks'}
            </Button>
          </div>
        }
      />

      {/* Selectors Card */}
      <Card className="p-5 bg-white shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Step 1: Select Examination
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedScheduleId('');
              }}
            >
              <option value="">Choose Exam Term</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.academicYear?.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Step 2: Select Subject / Timetable Slot
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              disabled={!selectedExamId && schedules.length === 0}
            >
              <option value="">Choose Class & Subject Paper</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.class?.name} {s.section ? `(${s.section.name})` : ''} - {s.subject?.name} ({s.examDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Filter Students
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search roll no or student name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Messages */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Schedule Info Ribbon */}
      {schedule && (
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500 font-medium">Class & Subject:</span>
              <p className="font-bold text-gray-900 text-sm">{schedule.class?.name} - {schedule.subject?.name}</p>
            </div>
            <div className="border-l border-blue-200 pl-4">
              <span className="text-gray-500 font-medium">Date & Room:</span>
              <p className="font-semibold text-gray-800">{schedule.examDate} • {schedule.roomNumber || 'Hall A'}</p>
            </div>
            <div className="border-l border-blue-200 pl-4">
              <span className="text-gray-500 font-medium">Marks Weightage:</span>
              <p className="font-semibold text-blue-700">Max: {schedule.maxMarks} (Th: {schedule.theoryMaxMarks} / Pr: {schedule.practicalMaxMarks}) | Pass: {schedule.passMarks}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-gray-500 font-medium">Roster Count:</span>
            <p className="font-bold text-gray-900">{roster.length} Enrolled Students</p>
          </div>
        </div>
      )}

      {/* Matrix Marks Entry Table */}
      <Card className="p-6 bg-white shadow-sm">
        {!selectedScheduleId ? (
          <div className="py-12 text-center text-gray-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-base font-semibold text-gray-600">No Exam Paper Selected</p>
            <p className="text-xs text-gray-400 mt-1">Please select an Exam Term and Subject from the dropdown above to open the entry sheet.</p>
          </div>
        ) : isLoadingMarks ? (
          <div className="py-12 text-center text-gray-500">Loading student roster...</div>
        ) : filteredRoster.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No students enrolled in this class/section.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-16">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3 text-center">Absent?</th>
                  <th className="py-3 px-3 w-28">Theory (Max {schedule?.theoryMaxMarks})</th>
                  <th className="py-3 px-3 w-28">Practical (Max {schedule?.practicalMaxMarks})</th>
                  <th className="py-3 px-3 w-24 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4">Evaluator Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredRoster.map((item) => {
                  const state = marksState[item.studentId] || {
                    theoryMarks: item.theoryMarks,
                    practicalMarks: item.practicalMarks,
                    internalMarks: item.internalMarks,
                    isAbsent: item.isAbsent,
                    remarks: item.remarks || '',
                  };

                  const computedTotal = state.isAbsent ? 0 : Number(state.theoryMarks || 0) + Number(state.practicalMarks || 0) + Number(state.internalMarks || 0);
                  const isPassed = !state.isAbsent && schedule && computedTotal >= Number(schedule.passMarks);

                  return (
                    <tr key={item.studentId} className={`hover:bg-gray-50/80 transition ${state.isAbsent ? 'bg-red-50/30' : ''}`}>
                      <td className="py-3 px-3 font-mono font-bold text-gray-800">
                        {item.student.rollNumber || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{item.student.firstName} {item.student.lastName}</div>
                        <div className="text-xs text-gray-400 font-mono">{item.student.admissionNumber}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={state.isAbsent}
                          onChange={(e) => handleAbsentToggle(item.studentId, e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          disabled={state.isAbsent}
                          value={state.theoryMarks}
                          onChange={(e) => handleScoreChange(item.studentId, 'theoryMarks', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          disabled={state.isAbsent}
                          value={state.practicalMarks}
                          onChange={(e) => handleScoreChange(item.studentId, 'practicalMarks', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold font-mono text-sm ${state.isAbsent ? 'text-red-500' : isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {state.isAbsent ? 'AB' : computedTotal}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {state.isAbsent ? (
                          <Badge variant="danger">Absent</Badge>
                        ) : isPassed ? (
                          <Badge variant="success">Pass</Badge>
                        ) : (
                          <Badge variant="danger">Fail</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional comment..."
                          value={state.remarks}
                          onChange={(e) => handleRemarksChange(item.studentId, e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MarksEntryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading marks matrix...</div>}>
      <MarksEntryContent />
    </Suspense>
  );
}
