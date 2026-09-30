'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  ArrowLeft,
  Calculator,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Trophy,
  Printer,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { examsService, ExamResultItem } from '@/services/exams.service';
import { academicService } from '@/services/academic.service';

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const queryClient = useQueryClient();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [calcRemarks, setCalcRemarks] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Queries
  const { data: exam, isLoading: isLoadingExam } = useQuery({
    queryKey: ['exam-detail', examId],
    queryFn: () => examsService.getExamById(examId),
    enabled: !!examId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['academic-classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['academic-sections', selectedClassId],
    queryFn: () => academicService.getSections(selectedClassId),
    enabled: !!selectedClassId,
  });

  const { data: results = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ['exam-results-list', examId, selectedClassId, selectedSectionId],
    queryFn: () => examsService.getExamResults(examId, selectedClassId || undefined, selectedSectionId || undefined),
    enabled: !!examId,
  });

  // Calculate Results Mutation
  const calculateMutation = useMutation({
    mutationFn: () => examsService.calculateResults({
      examId,
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
      generalRemarks: calcRemarks,
    }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['exam-results-list', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-detail', examId] });
      setIsCalcModalOpen(false);
      setActionSuccessMsg(res?.message || 'Results and rankings computed successfully.');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to calculate results.');
      setActionSuccessMsg('');
    },
  });

  // Publish Results Mutation
  const publishMutation = useMutation({
    mutationFn: () => examsService.publishResults(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results-list', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-detail', examId] });
      setActionSuccessMsg('Exam results and report cards published successfully!');
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to publish results.');
    },
  });

  // Statistics
  const totalEvaluated = results.length;
  const passedCount = results.filter((r) => r.resultStatus === 'PASSED').length;
  const passRate = totalEvaluated > 0 ? ((passedCount / totalEvaluated) * 100).toFixed(1) : '0';
  const topResult = results[0];
  const avgPercentage = totalEvaluated > 0
    ? (results.reduce((acc, curr) => acc + Number(curr.percentage), 0) / totalEvaluated).toFixed(1)
    : '0';

  const filteredResults = results.filter((r) =>
    r.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student?.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.student?.rollNumber && r.student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/exams/${examId}`}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {exam?.name || 'Exam'} Results & Merit Register
              </h1>
              <Badge variant={exam?.status === 'RESULTS_PUBLISHED' ? 'success' : 'primary'}>
                {exam?.status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {exam?.academicYear?.name} • Session Summative Analytics & Class Rankings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setIsCalcModalOpen(true)}
          >
            <Calculator className="w-4 h-4 mr-1.5" />
            Recalculate Results
          </Button>

          {exam?.status !== 'RESULTS_PUBLISHED' && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending || totalEvaluated === 0}
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              {publishMutation.isPending ? 'Publishing...' : 'Publish to Portal'}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Evaluated</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalEvaluated}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Students processed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pass Rate</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{passRate}%</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">{passedCount} of {totalEvaluated} passed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Average</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{avgPercentage}%</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Aggregate score</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Performer</p>
              <h3 className="text-base font-bold text-purple-700 mt-1 truncate">
                {topResult ? `${topResult.student?.firstName} (${topResult.percentage}%)` : 'N/A'}
              </h3>
              <p className="text-xs text-purple-600 font-medium mt-1">Rank #1 In Exam</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Table Card */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('');
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class / Section</th>
                <th className="py-3 px-3 text-right">Max Marks</th>
                <th className="py-3 px-3 text-right">Obtained</th>
                <th className="py-3 px-3 text-right">Percentage</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center">Result</th>
                <th className="py-3 px-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoadingResults ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">Loading exam merit register...</td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No results calculated yet. Click &quot;Recalculate Results&quot; above to process marks.
                  </td>
                </tr>
              ) : (
                filteredResults.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-3 text-center">
                      {row.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">🥇1</span>
                      ) : row.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">🥈2</span>
                      ) : row.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 font-bold text-xs">🥉3</span>
                      ) : (
                        <span className="font-mono text-gray-500 font-semibold">#{row.rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{row.student?.firstName} {row.student?.lastName}</div>
                      <div className="text-xs text-gray-400 font-mono">Adm: {row.student?.admissionNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-700">
                      {row.class?.name} {row.section ? `(${row.section.name})` : ''}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-gray-600">{row.totalMaxMarks}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-gray-900">{row.totalMarksObtained}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-600">{row.percentage}%</td>
                    <td className="py-3.5 px-3 text-center font-bold text-gray-800">{row.overallGrade}</td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant={row.resultStatus === 'PASSED' ? 'success' : row.resultStatus === 'COMPARTMENT' ? 'warning' : 'danger'}>
                        {row.resultStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/exams/report-card/${examId}/${row.studentId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Print Card
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Calculate Results Modal */}
      <Modal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        title="Execute Automated Result & Ranking Engine"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            This will process all marks submitted across scheduled subjects, apply grading thresholds, determine Pass/Fail/Compartment status, calculate attendance, and assign class rankings.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              General Faculty / Examination Remarks
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="e.g. Assessment conducted in accordance with institutional academic guidelines."
              value={calcRemarks}
              onChange={(e) => setCalcRemarks(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCalcModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => calculateMutation.mutate()}
              disabled={calculateMutation.isPending}
            >
              {calculateMutation.isPending ? 'Calculating...' : 'Run Result Engine'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
