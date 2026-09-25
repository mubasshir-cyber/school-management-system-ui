'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  academicService,
  AcademicYear,
  ClassItem,
  SectionItem,
  SubjectItem,
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
  Users,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function AcademicPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'years' | 'classes' | 'sections' | 'subjects' | 'assignments'
  >('years');

  // Queries
  const { data: years = [], isLoading: loadingYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: academicService.getAcademicYears,
  });

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });

  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
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

  const activeYear = years.find((y) => y.isCurrent) || years[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Dynamic Academic Structure
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure school sessions, standards, sections, subjects, and teacher allocations
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'years' && (
          <button
            onClick={() => setShowYearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Academic Year
          </button>
        )}
        {activeTab === 'classes' && (
          <button
            onClick={() => {
              if (activeYear) setClassForm((f) => ({ ...f, academicYearId: activeYear.id }));
              setShowClassModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        )}
        {activeTab === 'sections' && (
          <button
            onClick={() => {
              if (activeYear && classes.length > 0) {
                setSectionForm((f) => ({
                  ...f,
                  academicYearId: activeYear.id,
                  classId: classes[0].id,
                }));
              }
              setShowSectionModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Section
          </button>
        )}
        {activeTab === 'subjects' && (
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'years'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Years ({years.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Classes / Standards ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'sections'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          Class Sections ({sections.length})
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
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
              className={`p-5 rounded-2xl bg-slate-900/60 border ${
                year.isCurrent
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-800'
              } flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                    {year.code}
                  </span>
                  {year.isCurrent ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Session
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 capitalize">
                      {year.status.toLowerCase()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{year.name}</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    Start Date:{' '}
                    <span className="text-slate-300 font-medium">
                      {year.startDate}
                    </span>
                  </div>
                  <div>
                    End Date:{' '}
                    <span className="text-slate-300 font-medium">{year.endDate}</span>
                  </div>
                </div>
              </div>

              {!year.isCurrent && (
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setCurrentYearMutation.mutate(year.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-indigo-600/30 text-xs font-medium text-indigo-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Class Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Academic Year</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{cls.name}</td>
                  <td className="px-6 py-4 font-mono text-indigo-400">{cls.code}</td>
                  <td className="px-6 py-4">Level {cls.level}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {cls.academicYear?.name || 'Current'}
                  </td>
                  <td className="px-6 py-4">{cls.capacity || 'Unlimited'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteClassMutation.mutate(cls.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No classes created yet. Click &quot;Create Class&quot; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Sections */}
      {activeTab === 'sections' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Room No.</th>
                <th className="px-6 py-4">Class Teacher</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{sec.name}</td>
                  <td className="px-6 py-4 text-indigo-400">{sec.class?.name}</td>
                  <td className="px-6 py-4 font-mono">{sec.code}</td>
                  <td className="px-6 py-4">{sec.capacity} Students</td>
                  <td className="px-6 py-4 text-slate-400">{sec.roomNumber || '—'}</td>
                  <td className="px-6 py-4">
                    {sec.classTeacher ? (
                      <span className="text-emerald-400">
                        {sec.classTeacher.firstName} {sec.classTeacher.lastName || ''}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteSectionMutation.mutate(sec.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No sections configured yet.
                  </td>
                </tr>
              )}
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
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                    {sub.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                    {sub.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{sub.name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <div>
                    Theory Max:{' '}
                    <span className="text-white font-semibold">{sub.theoryMaxMarks}</span>
                  </div>
                  <div>
                    Practical:{' '}
                    <span className="text-white font-semibold">
                      {sub.practicalMaxMarks}
                    </span>
                  </div>
                  <div>
                    Pass Score:{' '}
                    <span className="text-emerald-400 font-semibold">
                      {sub.passingMarks}
                    </span>
                  </div>
                  <div>
                    Credits:{' '}
                    <span className="text-indigo-400 font-semibold">{sub.credit}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => deleteSubjectMutation.mutate(sub.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">
              No subjects registered. Click &quot;Create Subject&quot; to configure syllabus.
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create Academic Year */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Academic Year</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Session Name</label>
                <input
                  type="text"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Code</label>
                <input
                  type="text"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={yearForm.startDate}
                    onChange={(e) =>
                      setYearForm({ ...yearForm, startDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={yearForm.endDate}
                    onChange={(e) =>
                      setYearForm({ ...yearForm, endDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowYearModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => createYearMutation.mutate(yearForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Create Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Class Level</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Academic Year</label>
                <select
                  value={classForm.academicYearId}
                  onChange={(e) =>
                    setClassForm({ ...classForm, academicYearId: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} ({y.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Class Name</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Grade 10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Code</label>
                  <input
                    type="text"
                    value={classForm.code}
                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                    placeholder="e.g. G10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Progression Level
                  </label>
                  <input
                    type="number"
                    value={classForm.level}
                    onChange={(e) =>
                      setClassForm({ ...classForm, level: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => createClassMutation.mutate(classForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Save Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Create Section */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Section</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Class</label>
                <select
                  value={sectionForm.classId}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, classId: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Section Name
                  </label>
                  <input
                    type="text"
                    value={sectionForm.name}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, name: e.target.value })
                    }
                    placeholder="e.g. A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Code</label>
                  <input
                    type="text"
                    value={sectionForm.code}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, code: e.target.value })
                    }
                    placeholder="e.g. SEC-A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Capacity</label>
                  <input
                    type="number"
                    value={sectionForm.capacity}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        capacity: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Room No.</label>
                  <input
                    type="text"
                    value={sectionForm.roomNumber}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, roomNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSectionModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => createSectionMutation.mutate(sectionForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Create Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Subject</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  placeholder="e.g. Physics"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Code</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, code: e.target.value })
                    }
                    placeholder="e.g. PHY-101"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, type: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CORE">CORE</option>
                    <option value="ELECTIVE">ELECTIVE</option>
                    <option value="LANGUAGE">LANGUAGE</option>
                    <option value="PRACTICAL">PRACTICAL</option>
                    <option value="ACTIVITY">ACTIVITY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Theory Max
                  </label>
                  <input
                    type="number"
                    value={subjectForm.theoryMaxMarks}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        theoryMaxMarks: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Practical Max
                  </label>
                  <input
                    type="number"
                    value={subjectForm.practicalMaxMarks}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        practicalMaxMarks: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    value={subjectForm.passingMarks}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        passingMarks: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => createSubjectMutation.mutate(subjectForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
