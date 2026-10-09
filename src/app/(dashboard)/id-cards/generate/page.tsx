'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Sparkles,
  IdCard,
  Users,
  CheckCircle2,
  Filter,
  CheckSquare,
  Square,
  QrCode,
  Layers,
} from 'lucide-react';
import { idCardsService, IdCardTemplate, IdCard as IdCardType, IdCardUserType } from '@/services/id-cards.service';
import { academicService, ClassItem, SectionItem } from '@/services/academic.service';
import { studentService, StudentItem } from '@/services/student.service';
import { staffService, StaffMember } from '@/services/staff.service';

export default function BatchIdCardGeneratorPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Selection states
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [userType, setUserType] = useState<IdCardUserType>('STUDENT');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  );

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<IdCardType[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (userType === 'STUDENT' && selectedClassId) {
      loadStudents();
    } else if (userType === 'STAFF') {
      loadStaff();
    }
  }, [userType, selectedClassId, selectedSectionId]);

  const loadInitialData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        idCardsService.getIdCardTemplates().catch(() => []),
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
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined,
        limit: 100,
      });
      const stus = res.items || [];
      setStudents(stus);
      setSelectedRecipientIds(stus.map((s: StudentItem) => s.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await staffService.getStaffList({ limit: 100 });
      const staffs = res.items || [];
      setStaffList(staffs);
      setSelectedRecipientIds(staffs.map((s: StaffMember) => s.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const allIds = userType === 'STUDENT' ? students.map((s) => s.id) : staffList.map((s) => s.id);
    if (selectedRecipientIds.length === allIds.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(allIds);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplateId) {
      alert('Please select an ID card template.');
      return;
    }
    if (selectedRecipientIds.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }

    setGenerating(true);
    try {
      const res = await idCardsService.generateIdCards({
        templateId: selectedTemplateId,
        userType,
        studentIds: userType === 'STUDENT' ? selectedRecipientIds : undefined,
        staffIds: userType === 'STAFF' ? selectedRecipientIds : undefined,
        issueDate,
        expiryDate,
      });
      setGeneratedCards(res || []);
      setPreviewMode(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to generate ID cards');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/id-cards"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <IdCard className="w-7 h-7 text-blue-600" />
              Batch ID Card Generator & Print Register
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select class, section, or department rosters to generate official verification cards in high resolution.
            </p>
          </div>
        </div>

        {previewMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Modify Selection
            </button>
            <button
              onClick={handlePrintAll}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Batch ({generatedCards.length} Cards)
            </button>
          </div>
        )}
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
          {/* Settings Left Column */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Generation Parameters
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Select Layout Template *
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.layout}) {t.isDefault ? '★ Default' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Recipient Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('STUDENT')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    userType === 'STUDENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('STAFF')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    userType === 'STAFF'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Staff & Faculty
                </button>
              </div>
            </div>

            {userType === 'STUDENT' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Select Class / Standard *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || selectedRecipientIds.length === 0}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Processing Batch...' : `Generate ${selectedRecipientIds.length} ID Cards`}
            </button>
          </div>

          {/* Roster Selection Table Right Column */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600"
                >
                  {selectedRecipientIds.length ===
                  (userType === 'STUDENT' ? students.length : staffList.length) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  Select All (
                  {userType === 'STUDENT' ? students.length : staffList.length})
                </button>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {selectedRecipientIds.length} Recipients Selected
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-700 font-semibold border-b border-slate-100 text-xs uppercase sticky top-0 shadow-2xs">
                  <tr>
                    <th className="px-4 py-2.5 w-10"></th>
                    <th className="px-4 py-2.5">Recipient Name</th>
                    <th className="px-4 py-2.5">{userType === 'STUDENT' ? 'Admission #' : 'Employee Code'}</th>
                    <th className="px-4 py-2.5">Gender & Blood</th>
                    <th className="px-4 py-2.5">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Loading roster records...
                      </td>
                    </tr>
                  ) : userType === 'STUDENT' ? (
                    students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          No students found in this class.
                        </td>
                      </tr>
                    ) : (
                      students.map((s) => {
                        const isSelected = selectedRecipientIds.includes(s.id);
                        return (
                          <tr
                            key={s.id}
                            onClick={() => toggleRecipient(s.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-4 py-3">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {s.firstName} {s.lastName}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-blue-600">
                              {s.admissionNumber || s.studentCode}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                              {s.gender} • <span className="font-semibold text-rose-600">{s.bloodGroup || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">{s.mobile || 'N/A'}</td>
                          </tr>
                        );
                      })
                    )
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No staff members found.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((st) => {
                      const isSelected = selectedRecipientIds.includes(st.id);
                      return (
                        <tr
                          key={st.id}
                          onClick={() => toggleRecipient(st.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {st.firstName} {st.lastName}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-purple-600">
                            {st.employeeCode}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {st.gender} • <span className="font-semibold text-rose-600">{st.bloodGroup || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{st.phone}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* PRINTABLE BATCH CARDS GRID */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Successfully generated <strong>{generatedCards.length} institutional ID cards</strong> ready for high-resolution printing.
              </span>
            </div>
            <button
              onClick={handlePrintAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print All Cards
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
            {generatedCards.map((card) => {
              const snap: any = card.cardSnapshot || {};
              return (
                <div
                  key={card.id}
                  className="w-72 rounded-2xl shadow-lg border border-slate-300 overflow-hidden bg-white text-slate-800 flex flex-col justify-between break-inside-avoid print:shadow-none print:border-slate-400"
                  style={{ height: '420px' }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3.5 text-center relative">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg mx-auto flex items-center justify-center font-black text-xs mb-1">
                      🏫
                    </div>
                    <h4 className="font-bold text-[11px] uppercase tracking-wider leading-tight">
                      {snap.schoolName || 'Springfield Academy'}
                    </h4>
                    <p className="text-[9px] text-blue-100 opacity-90">{snap.schoolTagline || 'Excellence in Education'}</p>
                  </div>

                  {/* Body & Photo */}
                  <div className="p-4 flex flex-col items-center text-center -mt-6">
                    <div className="w-18 h-18 rounded-full border-3 border-white shadow-md bg-slate-100 overflow-hidden flex items-center justify-center text-xl font-bold text-slate-600 mb-1.5">
                      {snap.photoUrl ? (
                        <img src={snap.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        (snap.userName || 'U')[0]
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xs">{snap.userName}</h3>
                    <p className="text-[10px] font-semibold text-blue-600 uppercase">
                      {card.userType === 'STUDENT'
                        ? `Class ${snap.className} - ${snap.sectionName}`
                        : `${snap.designation || 'Faculty'}`}
                    </p>

                    {/* Meta Box */}
                    <div className="w-full mt-2 grid grid-cols-2 gap-1 text-left text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">
                          {card.userType === 'STUDENT' ? 'Adm #' : 'Emp ID'}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {snap.admissionNumber || snap.employeeId || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Blood Group</span>
                        <span className="font-semibold text-rose-600">{snap.bloodGroup || 'O+'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Emergency</span>
                        <span className="font-semibold text-slate-800 truncate">{snap.emergencyContact || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Valid Thru</span>
                        <span className="font-semibold text-slate-800">{card.expiryDate || '2027'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Barcode & QR */}
                  <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-mono text-slate-900 text-[10px] font-bold">||||| | |||| |||||</div>
                      <span className="text-[8px] text-slate-400 font-mono">{card.cardNumber}</span>
                    </div>
                    <div className="w-8 h-8 bg-white border border-slate-300 rounded p-0.5 flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-800" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
