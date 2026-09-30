'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Printer,
  ArrowLeft,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { examsService } from '@/services/exams.service';

export default function StudentReportCardPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const studentId = params.studentId as string;

  const { data: reportCard, isLoading, error } = useQuery({
    queryKey: ['report-card', examId, studentId],
    queryFn: () => examsService.getStudentReportCard(examId, studentId),
    enabled: !!examId && !!studentId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Generating student report card...</div>;
  }

  if (error || !reportCard) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Report card not found or results not yet calculated for this student.</p>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { result, subjects = [], gradingScale = [] } = reportCard;
  const student = result.student;
  const isPassed = result.resultStatus === 'PASSED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Official Student Report Card</h1>
            <p className="text-xs text-gray-500">{student?.firstName} {student?.lastName} • {result.exam?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Official Report Card Container */}
      <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-md print:shadow-none print:border print:p-6 print:rounded-none print:m-0">
        {/* School Header */}
        <div className="text-center border-b-2 border-gray-900 pb-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">
              ES
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
              EduSync International Academy
            </h2>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            Affiliated to Central Board of Secondary Education • School Code: 89124 • New Delhi
          </p>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs uppercase tracking-wider">
            {result.exam?.name || 'Academic Assessment Report Card'} • Session {result.academicYear?.name || '2026-27'}
          </div>
        </div>

        {/* Student Profile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 font-medium uppercase">Student Name:</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{student?.firstName} {student?.lastName}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Admission No:</span>
            <p className="text-sm font-mono font-bold text-blue-700 mt-0.5">{student?.admissionNumber || 'ADM-001'}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Class & Section:</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{result.class?.name} {result.section ? `(${result.section.name})` : ''}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Class Roll No:</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{student?.rollNumber || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Attendance Record:</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">{result.attendancePercentage ? `${result.attendancePercentage}%` : '96.5%'}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Class Rank:</span>
            <p className="text-sm font-bold text-purple-700 mt-0.5">#{result.rank || '1'} in class</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Exam Session:</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{result.exam?.startDate} - {result.exam?.endDate}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium uppercase">Evaluation Date:</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Subject Marks Table */}
        <div className="mt-5">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
            Scholastic Performance Matrix
          </h3>
          <table className="w-full text-left text-xs border border-gray-200">
            <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 border-r border-gray-200">Subject Name</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Theory (Max)</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Theory (Obt)</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Practical (Max)</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Practical (Obt)</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Total Max</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Marks Obtained</th>
                <th className="py-2.5 px-3 text-center border-r border-gray-200">Grade</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {subjects.map((sub, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="py-2 px-3 font-semibold border-r border-gray-200">
                    {sub.subjectName} <span className="text-gray-400 font-normal">({sub.subjectCode})</span>
                  </td>
                  <td className="py-2 px-3 text-center border-r border-gray-200">{sub.theoryMax}</td>
                  <td className="py-2 px-3 text-center font-semibold border-r border-gray-200">{sub.isAbsent ? 'AB' : sub.theoryObtained}</td>
                  <td className="py-2 px-3 text-center border-r border-gray-200">{sub.practicalMax}</td>
                  <td className="py-2 px-3 text-center font-semibold border-r border-gray-200">{sub.isAbsent ? 'AB' : sub.practicalObtained}</td>
                  <td className="py-2 px-3 text-center font-bold border-r border-gray-200">{sub.totalMax}</td>
                  <td className="py-2 px-3 text-center font-bold font-mono text-blue-700 border-r border-gray-200">
                    {sub.isAbsent ? 'AB' : sub.totalObtained}
                  </td>
                  <td className="py-2 px-3 text-center font-bold border-r border-gray-200">{sub.grade}</td>
                  <td className="py-2 px-3 text-center font-semibold">
                    <span className={sub.isPassed ? 'text-emerald-700' : 'text-rose-700'}>
                      {sub.isAbsent ? 'ABSENT' : sub.isPassed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Total Summary Row */}
              <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                <td className="py-2.5 px-3 border-r border-gray-200">GRAND TOTAL</td>
                <td className="py-2.5 px-3 text-center border-r border-gray-200">-</td>
                <td className="py-2.5 px-3 text-center border-r border-gray-200">-</td>
                <td className="py-2.5 px-3 text-center border-r border-gray-200">-</td>
                <td className="py-2.5 px-3 text-center border-r border-gray-200">-</td>
                <td className="py-2.5 px-3 text-center border-r border-gray-200">{result.totalMaxMarks}</td>
                <td className="py-2.5 px-3 text-center font-mono text-blue-700 border-r border-gray-200">{result.totalMarksObtained}</td>
                <td className="py-2.5 px-3 text-center text-sm border-r border-gray-200">{result.overallGrade}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={isPassed ? 'text-emerald-700' : 'text-rose-700'}>
                    {result.resultStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Aggregates Box & Grading Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Summary Box */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-600">Percentage Score:</span>
              <span className="text-sm font-bold text-blue-700">{result.percentage}%</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-600">Overall Grade / Scale:</span>
              <span className="text-sm font-bold text-gray-900">{result.overallGrade} {result.gpa ? `(GPA ${result.gpa})` : ''}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-600">Final Outcome:</span>
              <span className={`text-sm font-black ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result.resultStatus === 'PASSED' ? 'PASSED & PROMOTED' : result.resultStatus}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 font-medium">Remarks:</span>
              <p className="text-xs text-gray-800 italic mt-0.5">&quot;{result.teacherRemarks || 'Commendable performance throughout the academic term.'}&quot;</p>
            </div>
          </div>

          {/* Scale Legend */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-[11px]">
            <span className="font-bold text-gray-700 block mb-1.5 uppercase">Institutional Grading Scale</span>
            <div className="grid grid-cols-4 gap-1 text-center font-mono">
              <div className="p-1 bg-white rounded border border-gray-200 font-bold">A+ (90-100)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold">A (80-89)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold">B (70-79)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold">C (60-69)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold">D (50-59)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold">E (35-49)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold text-rose-600">F (&lt;35)</div>
              <div className="p-1 bg-white rounded border border-gray-200 font-bold text-red-600">AB (Absent)</div>
            </div>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="grid grid-cols-3 gap-8 pt-16 text-center text-xs">
          <div>
            <div className="border-t border-gray-400 pt-2 font-bold text-gray-800">Class Teacher</div>
            <p className="text-[10px] text-gray-500">Sign & Date</p>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2 font-bold text-gray-800">Controller of Examinations</div>
            <p className="text-[10px] text-gray-500">Verified by</p>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2 font-bold text-gray-800">Principal / Head of School</div>
            <p className="text-[10px] text-gray-500">Official Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
