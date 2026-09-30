'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  academicService,
} from '../../../services/academic.service';
import {
  BookOpen,
  Calendar,
  Layers,
  Grid,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
} from 'lucide-react';

export default function AcademicPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'years' | 'classes' | 'sections' | 'subjects'
  >('years');

  // Queries
  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: academicService.getAcademicYears,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: academicService.getSubjects,
  });

  // Modals state
  const [showYearModal, setShowYearModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Form states
  const [yearForm, setYearForm] = useState({
    name: '2027-28',
    code: 'AY-2027-28',
    startDate: '2027-04-01',
    endDate: '2028-03-31',
    isCurrent: false,
  });

  const [classForm, setClassForm] = useState({
    academicYearId: '',
    name: 'Grade 11 Science',
    code: 'G11-SCI',
    level: 11,
    capacity: 120,
  });

  const [sectionForm, setSectionForm] = useState({
    academicYearId: '',
    classId: '',
    name: 'Section A',
    code: 'SEC-A',
    capacity: 40,
    roomNumber: 'Room 201',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: 'Physics',
    code: 'PHY-101',
    type: 'CORE',
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    passingMarks: 33,
    credit: 1.0,
  });

  // Mutations
  const createYearMutation = useMutation({
    mutationFn: academicService.createAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setShowYearModal(false);
    },
  });

  const setCurrentYearMutation = useMutation({
    mutationFn: academicService.setCurrentAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });

  const createClassMutation = useMutation({
    mutationFn: academicService.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowClassModal(false);
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: academicService.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: academicService.createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setShowSectionModal(false);
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: academicService.deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: academicService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setShowSubjectModal(false);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: academicService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Dynamic Academic Structure
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure school sessions, standards, sections, subjects, and teacher allocations.
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'years' && (
          <button
            onClick={() => setShowYearModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Academic Year
          </button>
        )}
        {activeTab === 'classes' && (
          <button
            onClick={() => {
              if (years[0]) setClassForm((f) => ({ ...f, academicYearId: years[0].id }));
              setShowClassModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        )}
        {activeTab === 'sections' && (
          <button
            onClick={() => {
              if (years[0] && classes.length > 0) {
                setSectionForm((f) => ({
                  ...f,
                  academicYearId: years[0].id,
                  classId: classes[0].id,
                }));
              }
              setShowSectionModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Section
          </button>
        )}
        {activeTab === 'subjects' && (
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'years'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Years ({years.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Classes / Standards ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sections'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-4 h-4" />
          Class Sections ({sections.length})
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subject Taxonomy ({subjects.length})
        </button>
      </div>

      {/* Tab 1: Academic Years */}
      {activeTab === 'years' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {years.map((year) => (
            <div
              key={year.id}
              className={`p-5 rounded-3xl bg-white border ${
                year.isCurrent
                  ? 'border-blue-500 shadow-md shadow-blue-500/10'
                  : 'border-slate-200/80 shadow-xs'
              } flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {year.code}
                  </span>
                  {year.isCurrent ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Session
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 capitalize font-medium">
                      {year.status.toLowerCase()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{year.name}</h3>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    Start Date: <span className="text-slate-800 font-semibold">{year.startDate}</span>
                  </div>
                  <div>
                    End Date: <span className="text-slate-800 font-semibold">{year.endDate}</span>
                  </div>
                </div>
              </div>

              {!year.isCurrent && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentYearMutation.mutate(year.id)}
                    className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-xs font-bold text-blue-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Set As Current Session
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Classes */}
      {activeTab === 'classes' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Class Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Academic Year</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{cls.name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{cls.code}</td>
                  <td className="px-6 py-4 font-medium">Level {cls.level}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {cls.academicYear?.name || 'Current'}
                  </td>
                  <td className="px-6 py-4 font-medium">{cls.capacity || 'Unlimited'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteClassMutation.mutate(cls.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Sections */}
      {activeTab === 'sections' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Room No.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{sec.name}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{sec.class?.name}</td>
                  <td className="px-6 py-4 font-mono">{sec.code}</td>
                  <td className="px-6 py-4 font-medium">{sec.capacity} Students</td>
                  <td className="px-6 py-4 text-slate-500">{sec.roomNumber || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteSectionMutation.mutate(sec.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Subjects */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {sub.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {sub.type}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-2">{sub.name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    Theory Max: <span className="text-slate-900 font-bold">{sub.theoryMaxMarks}</span>
                  </div>
                  <div>
                    Practical: <span className="text-slate-900 font-bold">{sub.practicalMaxMarks}</span>
                  </div>
                  <div>
                    Pass Score: <span className="text-emerald-600 font-bold">{sub.passingMarks}</span>
                  </div>
                  <div>
                    Credits: <span className="text-blue-600 font-bold">{sub.credit}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => deleteSubjectMutation.mutate(sub.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Create Academic Year */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Create Academic Year</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Name</label>
                <input
                  type="text"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Code</label>
                <input
                  type="text"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={yearForm.startDate}
                    onChange={(e) =>
                      setYearForm({ ...yearForm, startDate: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={yearForm.endDate}
                    onChange={(e) =>
                      setYearForm({ ...yearForm, endDate: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowYearModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => createYearMutation.mutate(yearForm)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Create Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Create Class Level</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Academic Year</label>
                <select
                  value={classForm.academicYearId}
                  onChange={(e) =>
                    setClassForm({ ...classForm, academicYearId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} ({y.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Class Name</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Grade 10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Code</label>
                  <input
                    type="text"
                    value={classForm.code}
                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                    placeholder="e.g. G10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Progression Level
                  </label>
                  <input
                    type="number"
                    value={classForm.level}
                    onChange={(e) =>
                      setClassForm({ ...classForm, level: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => createClassMutation.mutate(classForm)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Save Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
