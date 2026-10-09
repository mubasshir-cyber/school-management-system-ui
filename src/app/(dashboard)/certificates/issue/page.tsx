'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  ArrowLeft,
  Sparkles,
  Printer,
  CheckCircle2,
  FileText,
  User,
  ShieldCheck,
  QrCode,
  Calendar,
} from 'lucide-react';
import {
  idCardsService,
  CertificateTemplate,
  IssuedCertificate,
} from '@/services/id-cards.service';
import { academicService, ClassItem } from '@/services/academic.service';
import { studentService, StudentItem } from '@/services/student.service';

export default function IssueCertificatePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);

  // Selection state
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Form Fields
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [reasonForIssue, setReasonForIssue] = useState('Parents relocation / Higher studies');
  const [conductRemarks, setConductRemarks] = useState('Exemplary and well-disciplined');
  const [leavingDate, setLeavingDate] = useState(new Date().toISOString().split('T')[0]);
  const [promotedToClass, setPromotedToClass] = useState('Promoted to next academic standard');

  const [issuing, setIssuing] = useState(false);
  const [issuedCert, setIssuedCert] = useState<IssuedCertificate | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadStudents();
    }
  }, [selectedClassId]);

  const loadInitialData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        idCardsService.getCertificateTemplates().catch(() => []),
        academicService.getClasses().catch(() => []),
      ]);
      setTemplates(tRes);
      if (tRes.length > 0) setSelectedTemplateId(tRes[0].id);
      setClasses(cRes);
      if (cRes.length > 0) setSelectedClassId(cRes[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await studentService.getStudents({ classId: selectedClassId, limit: 100 });
      const stus = res.items || [];
      setStudents(stus);
      if (stus.length > 0) setSelectedStudentId(stus[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !selectedStudentId) {
      alert('Please select both a template and a student.');
      return;
    }

    setIssuing(true);
    try {
      const res = await idCardsService.issueCertificate({
        templateId: selectedTemplateId,
        studentId: selectedStudentId,
        issueDate,
        reasonForIssue,
        conductRemarks,
        leavingDate,
        promotedToClass,
      });
      setIssuedCert(res);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/certificates"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-emerald-600" />
              Issue Official Institutional Certificate
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Generate Transfer Certificates (TC), Bonafide credentials, and Character endorsements with immutable verification.
            </p>
          </div>
        </div>

        {issuedCert && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Official Document
          </button>
        )}
      </div>

      {!issuedCert ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Left Column */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Certificate Issuance Form
            </h2>

            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Certificate Template *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.certificateType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Class / Standard *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.admissionNumber || s.studentCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Date of Issue</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Date of Leaving School</label>
                  <input
                    type="date"
                    value={leavingDate}
                    onChange={(e) => setLeavingDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Reason for Leaving / Issue</label>
                <input
                  type="text"
                  value={reasonForIssue}
                  onChange={(e) => setReasonForIssue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">General Conduct & Character</label>
                  <input
                    type="text"
                    value={conductRemarks}
                    onChange={(e) => setConductRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Promoted Standard Status</label>
                  <input
                    type="text"
                    value={promotedToClass}
                    onChange={(e) => setPromotedToClass(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={issuing}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                <Sparkles className="w-4 h-4" />
                {issuing ? 'Generating Certificate...' : 'Generate & Issue Certificate'}
              </button>
            </form>
          </div>

          {/* Student Profile Quick Summary Right Column */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Student & Academic Summary
              </span>

              {selectedStudent ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                      {selectedStudent.firstName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Admission #: {selectedStudent.admissionNumber || selectedStudent.studentCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">GENDER</span>
                      <span className="font-semibold">{selectedStudent.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">DATE OF BIRTH</span>
                      <span className="font-semibold">{selectedStudent.dateOfBirth || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">BLOOD GROUP</span>
                      <span className="font-semibold text-rose-600">{selectedStudent.bloodGroup || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PRIMARY CONTACT</span>
                      <span className="font-semibold">{selectedStudent.mobile || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  Select a class and student to preview academic parameters.
                </div>
              )}

              {selectedTemplate && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
                  <span className="font-bold uppercase tracking-wider">Template: {selectedTemplate.title}</span>
                  <p className="text-emerald-800 line-clamp-2">{selectedTemplate.bodyTemplate}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic verification token will be permanently minted upon issue.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Rendered Certificate Ready To Print */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Certificate <strong>{issuedCert.certificateNumber}</strong> successfully generated and registered in the immutable credentials ledger.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIssuedCert(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
              >
                Issue Another
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
            </div>
          </div>

          {/* Certificate Paper */}
          <div className="max-w-3xl mx-auto border-8 border-double border-amber-900/40 p-10 rounded-2xl bg-amber-50/20 text-slate-900 space-y-8 shadow-xl print:shadow-none print:border-amber-900">
            {/* Crest Header */}
            <div className="text-center space-y-1">
              <div className="w-16 h-16 bg-blue-900 text-white rounded-full mx-auto flex items-center justify-center font-black text-2xl mb-2 shadow-sm">
                🏛️
              </div>
              <h2 className="text-2xl font-serif font-black uppercase tracking-wider text-blue-950">
                Springfield International Academy
              </h2>
              <p className="text-xs font-sans text-slate-600 font-medium">
                Affiliated to Central Board of Secondary Education • School Code: 10482
              </p>
              <div className="w-48 h-1 bg-amber-600 mx-auto mt-2 rounded-full" />
            </div>

            {/* Document Title */}
            <div className="text-center py-1">
              <span className="inline-block px-5 py-1.5 border border-amber-800/60 bg-amber-100/60 rounded-md font-serif font-bold text-sm tracking-widest text-amber-950 uppercase">
                {issuedCert.template?.title || 'TRANSFER CERTIFICATE'}
              </span>
              <p className="text-xs text-slate-500 mt-1.5 font-mono">
                Certificate No: <strong>{issuedCert.certificateNumber}</strong>
              </p>
            </div>

            {/* Body */}
            <div className="font-serif leading-relaxed text-slate-800 text-sm space-y-5 px-4 text-justify">
              <p className="indent-8">
                {issuedCert.renderedContent ||
                  `This is to certify that ${issuedCert.student?.firstName} ${issuedCert.student?.lastName} was a bonafide student of this institution.`}
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-white/70 p-4 rounded-lg border border-amber-200/60 my-4">
                <div>
                  <span className="text-slate-500 block">Admission Number:</span>
                  <span className="font-semibold font-mono">{issuedCert.student?.admissionNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Leaving:</span>
                  <span className="font-semibold">{issuedCert.leavingDate || issuedCert.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">General Conduct:</span>
                  <span className="font-semibold text-emerald-700">{issuedCert.conductRemarks || 'Exemplary'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Promoted to Standard:</span>
                  <span className="font-semibold">{issuedCert.promotedToClass || 'Passed and Advanced'}</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="flex items-end justify-between pt-10 border-t border-amber-200/70 text-xs px-4">
              <div className="text-center">
                <div className="w-32 border-b border-slate-700 mb-1" />
                <span className="font-bold text-slate-800 uppercase text-[10px]">
                  {issuedCert.template?.signatoryTitle1 || 'Class Teacher'}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border border-slate-400 p-1 rounded bg-white">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1">{issuedCert.verificationCode}</span>
              </div>

              <div className="text-center">
                <div className="w-32 border-b border-slate-700 mb-1" />
                <span className="font-bold text-slate-800 uppercase text-[10px]">
                  {issuedCert.template?.signatoryTitle2 || 'Principal / Headmaster'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
