'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  academicService,
  AcademicYear,
  ClassItem,
  SectionItem,
  SubjectItem,
  ClassSubjectItem,
} from '../../../services/academic.service';
import { examsService, Exam, ExamSchedule } from '../../../services/exams.service';
import {
  BookOpen,
  Calendar,
  Layers,
  Grid,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Pencil,
  X,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  GripVertical,
  MoveRight,
  Check,
  HelpCircle,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';

// Standard 4 Exam Terms Configuration
const STANDARD_EXAM_TERMS = [
  {
    key: 'UNIT_1',
    name: '1st Unit Test',
    badge: 'Unit 1',
    defaultMaxMarks: 20,
    defaultPassMarks: 7,
    color: 'blue',
    description: 'First quarterly unit test',
  },
  {
    key: 'TERM_1',
    name: '1st Term / Mid-Term Exam',
    badge: 'Term 1',
    defaultMaxMarks: 50,
    defaultPassMarks: 18,
    color: 'amber',
    description: 'Half-yearly summative exam',
  },
  {
    key: 'UNIT_2',
    name: '2nd Unit Test',
    badge: 'Unit 2',
    defaultMaxMarks: 20,
    defaultPassMarks: 7,
    color: 'indigo',
    description: 'Second quarterly unit test',
  },
  {
    key: 'TERM_2',
    name: '2nd Term / Final Exam',
    badge: 'Final Term',
    defaultMaxMarks: 100,
    defaultPassMarks: 35,
    color: 'emerald',
    description: 'Annual final promotion exam',
  },
];

function AcademicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'years' | 'classes' | 'sections' | 'subjects' | 'curriculum'
  >('years');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['years', 'classes', 'sections', 'subjects', 'curriculum'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Selected class for Class Subjects & Kanban tab
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Planner View Mode ('kanban' or 'list')
  const [plannerView, setPlannerView] = useState<'kanban' | 'list'>('kanban');
  const [listSearchQuery, setListSearchQuery] = useState<string>('');
  const [listStatusFilter, setListStatusFilter] = useState<'all' | 'scheduled' | 'pending'>('all');

  // Drag & drop state
  const [draggedSubject, setDraggedSubject] = useState<SubjectItem | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);

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

  const { data: examTypes = [] } = useQuery({
    queryKey: ['exam-types'],
    queryFn: examsService.getExamTypes,
  });

  const { data: classSubjects = [] } = useQuery({
    queryKey: ['class-subjects', selectedClassId || classes[0]?.id],
    queryFn: () => academicService.getClassSubjects(selectedClassId || classes[0]?.id || ''),
    enabled: !!(selectedClassId || classes[0]?.id),
  });

  const { data: examsData } = useQuery({
    queryKey: ['exams-list-academic'],
    queryFn: () => examsService.getExams({ limit: 50 }),
  });

  // Set default selectedClassId once classes are loaded
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Modals state
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
  const [assignSubjectForm, setAssignSubjectForm] = useState({
    subjectId: '',
    isMandatory: true,
  });

  // Modal to edit/add schedule slot
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotModalData, setSlotModalData] = useState<{
    id?: string;
    examId: string;
    examName: string;
    subjectId: string;
    subjectName: string;
    classId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    maxMarks: number;
    passMarks: number;
    theoryMaxMarks: number;
    practicalMaxMarks: number;
    roomNumber: string;
  } | null>(null);

  // Form states
  const [yearForm, setYearForm] = useState({
    name: '',
    code: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    isCurrent: false,
  });

  const [classForm, setClassForm] = useState({
    academicYearId: '',
    name: '',
    code: '',
    level: 1,
    capacity: 120,
  });

  const [sectionForm, setSectionForm] = useState({
    academicYearId: '',
    classId: '',
    name: '',
    code: '',
    capacity: 40,
    roomNumber: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    type: 'CORE',
    hasTheoryPracticalSplit: false,
    maxMarks: 100,
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    passingMarks: 35,
    credit: 1.0,
  });

  // Mutations
  const createYearMutation = useMutation({
    mutationFn: academicService.createAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setShowYearModal(false);
      setEditingYear(null);
    },
  });

  const updateYearMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AcademicYear> }) =>
      academicService.updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setShowYearModal(false);
      setEditingYear(null);
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
      setEditingClass(null);
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      academicService.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowClassModal(false);
      setEditingClass(null);
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
      setEditingSection(null);
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      academicService.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setShowSectionModal(false);
      setEditingSection(null);
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
      setEditingSubject(null);
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      academicService.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setShowSubjectModal(false);
      setEditingSubject(null);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: academicService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const assignSubjectMutation = useMutation({
    mutationFn: (data: { classId: string; subjectId: string; isMandatory: boolean }) =>
      academicService.assignSubjectToClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', selectedClassId] });
      setShowAssignSubjectModal(false);
      setAssignSubjectForm({ subjectId: '', isMandatory: true });
    },
  });

  const unassignSubjectMutation = useMutation({
    mutationFn: academicService.deleteClassSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', selectedClassId] });
    },
  });

  // Schedule mutations for Kanban
  const createScheduleMutation = useMutation({
    mutationFn: examsService.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams-list-academic'] });
      setShowSlotModal(false);
      setSlotModalData(null);
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExamSchedule> }) =>
      examsService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams-list-academic'] });
      setShowSlotModal(false);
      setSlotModalData(null);
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: examsService.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams-list-academic'] });
    },
  });

  const createExamMutation = useMutation({
    mutationFn: examsService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams-list-academic'] });
    },
  });

  // Edit Handlers
  const handleEditYear = (year: AcademicYear) => {
    setEditingYear(year);
    setYearForm({
      name: year.name,
      code: year.code,
      startDate: year.startDate?.split('T')[0] || '',
      endDate: year.endDate?.split('T')[0] || '',
      isCurrent: year.isCurrent,
    });
    setShowYearModal(true);
  };

  const handleEditClass = (cls: ClassItem) => {
    setEditingClass(cls);
    setClassForm({
      academicYearId: cls.academicYear?.id || years.find((y) => y.isCurrent)?.id || years[0]?.id || '',
      name: cls.name,
      code: cls.code,
      level: cls.level,
      capacity: cls.capacity || 120,
    });
    setShowClassModal(true);
  };

  const handleEditSection = (sec: SectionItem) => {
    setEditingSection(sec);
    setSectionForm({
      academicYearId: sec.class?.academicYear?.id || years.find((y) => y.isCurrent)?.id || years[0]?.id || '',
      classId: sec.class?.id || '',
      name: sec.name,
      code: sec.code,
      capacity: sec.capacity || 40,
      roomNumber: sec.roomNumber || '',
    });
    setShowSectionModal(true);
  };

  const handleEditSubject = (sub: SubjectItem) => {
    setEditingSubject(sub);
    const theory = Number(sub.theoryMaxMarks) || 0;
    const practical = Number(sub.practicalMaxMarks) || 0;
    const hasSplit = practical > 0;
    const total = theory + practical;
    setSubjectForm({
      name: sub.name,
      code: sub.code,
      type: sub.type || 'CORE',
      hasTheoryPracticalSplit: hasSplit,
      maxMarks: total,
      theoryMaxMarks: hasSplit ? theory : total,
      practicalMaxMarks: practical,
      passingMarks: Number(sub.passingMarks) || 35,
      credit: Number(sub.credit) || 1.0,
    });
    setShowSubjectModal(true);
  };

  const handleOpenNewSubjectModal = () => {
    setEditingSubject(null);
    setSubjectForm({
      name: '',
      code: '',
      type: 'CORE',
      hasTheoryPracticalSplit: false,
      maxMarks: 100,
      theoryMaxMarks: 100,
      practicalMaxMarks: 0,
      passingMarks: 35,
      credit: 1.0,
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = () => {
    if (!subjectForm.name || !subjectForm.code) return;
    const finalTheory = subjectForm.hasTheoryPracticalSplit
      ? subjectForm.theoryMaxMarks
      : subjectForm.maxMarks;
    const finalPractical = subjectForm.hasTheoryPracticalSplit
      ? subjectForm.practicalMaxMarks
      : 0;

    const payload = {
      name: subjectForm.name,
      code: subjectForm.code,
      type: subjectForm.type,
      theoryMaxMarks: finalTheory,
      practicalMaxMarks: finalPractical,
      passingMarks: subjectForm.passingMarks,
      credit: subjectForm.credit,
    };

    if (editingSubject) {
      updateSubjectMutation.mutate({
        id: editingSubject.id,
        data: payload,
      });
    } else {
      createSubjectMutation.mutate(payload);
    }
  };

  const currentSelectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const allExams: Exam[] = examsData?.items || [];
  const activeYear = years.find((y) => y.isCurrent) || years[0];

  // Helper: Find or get exam for a standard term
  const getExamForTerm = (termKey: string, termName: string): Exam | undefined => {
    return allExams.find((e) => {
      const n = e.name.toLowerCase();
      if (termKey === 'UNIT_1') return n.includes('1st unit') || n.includes('unit 1') || n.includes('unit-1');
      if (termKey === 'TERM_1') return n.includes('1st term') || n.includes('term 1') || n.includes('mid') || n.includes('half');
      if (termKey === 'UNIT_2') return n.includes('2nd unit') || n.includes('unit 2') || n.includes('unit-2');
      if (termKey === 'TERM_2') return n.includes('2nd term') || n.includes('term 2') || n.includes('final') || n.includes('annual');
      return false;
    });
  };

  // Helper: Get scheduled papers for a specific exam and active class
  const getSchedulesForExam = (exam: Exam | undefined): ExamSchedule[] => {
    if (!exam || !exam.schedules) return [];
    return exam.schedules.filter((s) => s.classId === (selectedClassId || classes[0]?.id));
  };

  // Formatting Helpers for Subjects & Schedule
  const formatSubjectName = (name: string) => {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const getSubjectColorStyle = (code: string) => {
    const palette = [
      { bg: 'bg-blue-50 text-blue-700 border-blue-200', avatar: 'bg-blue-600' },
      { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', avatar: 'bg-emerald-600' },
      { bg: 'bg-purple-50 text-purple-700 border-purple-200', avatar: 'bg-purple-600' },
      { bg: 'bg-amber-50 text-amber-700 border-amber-200', avatar: 'bg-amber-600' },
      { bg: 'bg-rose-50 text-rose-700 border-rose-200', avatar: 'bg-rose-600' },
      { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', avatar: 'bg-indigo-600' },
    ];
    let hash = 0;
    const str = code || 'SUB';
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return palette[Math.abs(hash) % palette.length];
  };

  const formatDateNice = (d?: string) => {
    if (!d) return 'Date TBD';
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d.split('T')[0];
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (subject: SubjectItem) => {
    setDraggedSubject(subject);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    setActiveDropColumn(columnKey);
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDropOnExam = async (term: typeof STANDARD_EXAM_TERMS[0]) => {
    setActiveDropColumn(null);
    if (!draggedSubject || !currentSelectedClass) return;

    let targetExam = getExamForTerm(term.key, term.name);

    // If exam does not exist yet, auto-create it
    if (!targetExam) {
      if (!activeYear) {
        alert('Please create and activate an Academic Year first.');
        return;
      }
      let typeId = examTypes[0]?.id;
      if (!typeId) {
        try {
          const createdType = await examsService.createExamType({
            name: 'Standard Examination',
            code: 'STD-EXAM',
            weightage: 100,
            description: 'Standard institutional examination',
          });
          typeId = createdType.id;
          queryClient.invalidateQueries({ queryKey: ['exam-types'] });
        } catch (err) {
          console.error('Auto creating exam type', err);
        }
      }

      if (!typeId) {
        console.error('No exam type available');
        return;
      }

      try {
        targetExam = await examsService.createExam({
          name: `${term.name} (${activeYear.name})`,
          academicYearId: activeYear.id,
          examTypeId: typeId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
        });
        queryClient.invalidateQueries({ queryKey: ['exams-list-academic'] });
      } catch (err) {
        console.error('Failed to create term exam', err);
        return;
      }
    }

    // Check if subject is already scheduled for this exam
    const existingSchedules = getSchedulesForExam(targetExam);
    const alreadyScheduled = existingSchedules.some((s) => s.subjectId === draggedSubject.id);
    if (alreadyScheduled) {
      alert(`"${draggedSubject.name}" is already scheduled in ${term.name}.`);
      setDraggedSubject(null);
      return;
    }

    // Determine marks based on term
    const maxMarks = term.defaultMaxMarks;
    const passMarks = term.defaultPassMarks;
    const hasPractical = (draggedSubject.practicalMaxMarks ?? 0) > 0;
    const theoryMarks = hasPractical ? Math.round(maxMarks * 0.75) : maxMarks;
    const practicalMarks = hasPractical ? maxMarks - theoryMarks : 0;

    // Create schedule slot immediately
    createScheduleMutation.mutate({
      examId: targetExam.id,
      classId: currentSelectedClass.id,
      subjectId: draggedSubject.id,
      examDate: targetExam.startDate ? targetExam.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: '09:30:00',
      endTime: '12:00:00',
      maxMarks,
      passMarks,
      theoryMaxMarks: theoryMarks,
      practicalMaxMarks: practicalMarks,
    });

    setDraggedSubject(null);
  };

  const handleQuickSchedule = async (subject: SubjectItem, term: typeof STANDARD_EXAM_TERMS[0]) => {
    if (!currentSelectedClass) return;
    let targetExam = getExamForTerm(term.key, term.name);

    if (!targetExam) {
      if (!activeYear) {
        alert('Please create and activate an Academic Year first.');
        return;
      }
      let typeId = examTypes[0]?.id;
      if (!typeId) {
        try {
          const createdType = await examsService.createExamType({
            name: 'Standard Examination',
            code: 'STD-EXAM',
            weightage: 100,
            description: 'Standard institutional examination',
          });
          typeId = createdType.id;
          queryClient.invalidateQueries({ queryKey: ['exam-types'] });
        } catch (err) {
          console.error('Auto creating exam type', err);
        }
      }

      if (!typeId) return;

      try {
        targetExam = await examsService.createExam({
          name: `${term.name} (${activeYear.name})`,
          academicYearId: activeYear.id,
          examTypeId: typeId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
        });
        queryClient.invalidateQueries({ queryKey: ['exams-list-academic'] });
      } catch (err) {
        console.error('Failed to create term exam', err);
        return;
      }
    }

    const maxMarks = term.defaultMaxMarks;
    const passMarks = term.defaultPassMarks;
    const hasPractical = (subject.practicalMaxMarks ?? 0) > 0;
    const theoryMarks = hasPractical ? Math.round(maxMarks * 0.75) : maxMarks;
    const practicalMarks = hasPractical ? maxMarks - theoryMarks : 0;

    createScheduleMutation.mutate({
      examId: targetExam.id,
      classId: currentSelectedClass.id,
      subjectId: subject.id,
      examDate: targetExam.startDate ? targetExam.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: '09:30:00',
      endTime: '12:00:00',
      maxMarks,
      passMarks,
      theoryMaxMarks: theoryMarks,
      practicalMaxMarks: practicalMarks,
      roomNumber: 'Main Hall',
    });
  };

  // Handle open slot edit modal
  const handleOpenEditSlotModal = (slot: ExamSchedule, examName: string, fallbackSubjectName?: string) => {
    let safeDateStr = '';
    if (slot.examDate) {
      if (typeof slot.examDate === 'string') {
        safeDateStr = slot.examDate.includes('T') ? slot.examDate.split('T')[0] : slot.examDate;
      } else {
        try {
          safeDateStr = new Date(slot.examDate).toISOString().split('T')[0];
        } catch {
          safeDateStr = '';
        }
      }
    }

    setSlotModalData({
      id: slot.id,
      examId: slot.examId,
      examName,
      subjectId: slot.subjectId,
      subjectName: slot.subject?.name || fallbackSubjectName || 'Subject',
      classId: slot.classId,
      examDate: safeDateStr,
      startTime: slot.startTime ? String(slot.startTime).slice(0, 5) : '09:30',
      endTime: slot.endTime ? String(slot.endTime).slice(0, 5) : '12:00',
      maxMarks: Number(slot.maxMarks) || 20,
      passMarks: Number(slot.passMarks) || 7,
      theoryMaxMarks: Number(slot.theoryMaxMarks) || 20,
      practicalMaxMarks: Number(slot.practicalMaxMarks) || 0,
      roomNumber: slot.roomNumber || '',
    });
    setShowSlotModal(true);
  };

  // Determine subjects for left column: assigned to class, or fallback to all subjects
  const availableClassSubjects: SubjectItem[] =
    classSubjects.length > 0
      ? classSubjects.map((cs) => cs.subject).filter(Boolean)
      : subjects;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Dynamic Academic Structure & Exam Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure school sessions, standards, sections, taxonomy, and drag-and-drop subject papers to examination terms.
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'years' && (
          <button
            onClick={() => {
              setEditingYear(null);
              setYearForm({
                name: '',
                code: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                isCurrent: false,
              });
              setShowYearModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Academic Year
          </button>
        )}
        {activeTab === 'classes' && (
          <button
            onClick={() => {
              setEditingClass(null);
              const defaultYear = years.find((y) => y.isCurrent)?.id || years[0]?.id || '';
              setClassForm({
                academicYearId: defaultYear,
                name: '',
                code: '',
                level: classes.length + 1,
                capacity: 120,
              });
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
              setEditingSection(null);
              const defaultYear = years.find((y) => y.isCurrent)?.id || years[0]?.id || '';
              setSectionForm({
                academicYearId: defaultYear,
                classId: classes[0]?.id || '',
                name: '',
                code: '',
                capacity: 40,
                roomNumber: '',
              });
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
            onClick={handleOpenNewSubjectModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        )}
        {activeTab === 'curriculum' && (
          <div className="flex items-center gap-2">
            <Link
              href="/exams"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-all"
            >
              <Award className="w-4 h-4 text-indigo-600" />
              Exams Hub
            </Link>
            <button
              onClick={() => {
                setAssignSubjectForm({ subjectId: subjects[0]?.id || '', isMandatory: true });
                setShowAssignSubjectModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Assign Subject to Class
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'subjects'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subject Taxonomy ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'curriculum'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-indigo-600" />
          ✨ Exam & Subject Planner
        </button>
      </div>

      {/* Tab: Kanban Exam & Subject Planner */}
      {activeTab === 'curriculum' && (
        <div className="space-y-5">
          {/* Executive Control Header & Standard Selector */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Examination Blueprint & Subject Allocation
                    </h2>
                    {currentSelectedClass && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {currentSelectedClass.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plan quarterly unit tests and terminal examinations for all enrolled curriculum subjects.
                  </p>
                </div>
              </div>

              {/* View Switcher & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setPlannerView('kanban')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      plannerView === 'kanban'
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Kanban Columns
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlannerView('list')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      plannerView === 'list'
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Schedule Matrix Table
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAssignSubjectForm({ subjectId: subjects[0]?.id || '', isMandatory: true });
                    setShowAssignSubjectModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Assign Subject
                </button>
              </div>
            </div>

            {/* Class / Standard Pills */}
            <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Standard:
              </span>
              {classes.map((c) => {
                const isSelected = (selectedClassId || classes[0]?.id) === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassId(c.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {c.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentSelectedClass ? (
            <>
              {/* Term Progress & Coverage KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STANDARD_EXAM_TERMS.map((term) => {
                  const exam = getExamForTerm(term.key, term.name);
                  const schedules = getSchedulesForExam(exam);
                  const totalSubs = availableClassSubjects.length;
                  const count = schedules.length;
                  const pct = totalSubs > 0 ? Math.min(100, Math.round((count / totalSubs) * 100)) : 0;
                  const isComplete = totalSubs > 0 && count >= totalSubs;

                  return (
                    <div
                      key={term.key}
                      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            term.key === 'UNIT_1'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/70'
                              : term.key === 'TERM_1'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                              : term.key === 'UNIT_2'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          }`}
                        >
                          {term.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          {count} of {totalSubs} Scheduled
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <div className="text-xs font-extrabold text-slate-900">{term.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Max: <strong className="text-slate-700">{term.defaultMaxMarks}M</strong> • Pass: ≥{' '}
                          <strong className="text-slate-700">{term.defaultPassMarks}M</strong>
                        </div>
                      </div>

                      {/* Coverage Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isComplete
                                ? 'bg-emerald-500'
                                : pct > 0
                                ? 'bg-blue-600'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>{pct}% Coverage</span>
                          {isComplete ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : pct > 0 ? (
                            <span className="text-blue-600 font-bold">In Progress</span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {plannerView === 'kanban' ? (
              /* 5-Column Kanban Board */
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                {/* Column 1: All Subjects / Class Curriculum */}
                <div className="bg-slate-100/90 border border-slate-200 rounded-3xl p-4 flex flex-col min-h-[520px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Class Subjects
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {availableClassSubjects.length} subjects in {currentSelectedClass.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAssignSubjectForm({ subjectId: subjects[0]?.id || '', isMandatory: true });
                      setShowAssignSubjectModal(true);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                    title="Assign More Subjects"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {availableClassSubjects.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No subjects added yet.
                      <button
                        onClick={() => {
                          setAssignSubjectForm({ subjectId: subjects[0]?.id || '', isMandatory: true });
                          setShowAssignSubjectModal(true);
                        }}
                        className="block mx-auto mt-2 text-blue-600 font-bold hover:underline"
                      >
                        + Add Subject
                      </button>
                    </div>
                  ) : (
                    availableClassSubjects.map((sub) => {
                      const theory = Number(sub.theoryMaxMarks) || 0;
                      const practical = Number(sub.practicalMaxMarks) || 0;
                      const totalMarks = theory + practical;

                      return (
                        <div
                          key={sub.id}
                          draggable
                          onDragStart={() => handleDragStart(sub)}
                          className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-grab active:cursor-grabbing group select-none"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {sub.code}
                            </span>
                            <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-500 transition">
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <h4 className="text-xs font-extrabold text-slate-900">{sub.name}</h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                            <span>Default Max: <strong>{totalMarks}</strong></span>
                            <span className="text-[10px] text-blue-600 font-bold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                              Drag <MoveRight className="w-3 h-3 inline" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 mt-2">
                  <button
                    onClick={() => {
                      setAssignSubjectForm({ subjectId: subjects[0]?.id || '', isMandatory: true });
                      setShowAssignSubjectModal(true);
                    }}
                    className="w-full py-2 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Assign Subject
                  </button>
                </div>
              </div>

              {/* Columns 2-5: The 4 Standard Exam Terms */}
              {STANDARD_EXAM_TERMS.map((term) => {
                const exam = getExamForTerm(term.key, term.name);
                const schedules = getSchedulesForExam(exam);
                const isOver = activeDropColumn === term.key;

                return (
                  <div
                    key={term.key}
                    onDragOver={(e) => handleDragOver(e, term.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDropOnExam(term)}
                    className={`rounded-3xl p-4 flex flex-col min-h-[520px] transition-all border-2 ${
                      isOver
                        ? 'bg-blue-50 border-blue-500 shadow-lg scale-[1.01]'
                        : 'bg-slate-50/80 border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="pb-3 border-b border-slate-200 mb-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          term.key === 'UNIT_1' ? 'bg-blue-100 text-blue-800' :
                          term.key === 'TERM_1' ? 'bg-amber-100 text-amber-800' :
                          term.key === 'UNIT_2' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {term.badge}
                        </span>

                        <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {schedules.length} Papers
                        </span>
                      </div>

                      <h3 className="text-xs font-extrabold text-slate-900 mt-2">{term.name}</h3>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Out of: <strong>{term.defaultMaxMarks} Marks</strong></span>
                        <span>Pass: <strong>{term.defaultPassMarks}</strong></span>
                      </div>
                    </div>

                    {/* Paper Cards List */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[620px] pr-1">
                      {schedules.length === 0 ? (
                        <div className={`py-12 text-center rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center p-4 ${
                          isOver ? 'border-blue-400 bg-blue-100/50' : 'border-slate-200 bg-white/40'
                        }`}>
                          <Award className="w-7 h-7 text-slate-300 mb-1.5" />
                          <p className="text-[11px] text-slate-500 font-medium">
                            Drop subjects here
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            to schedule for {term.badge}
                          </p>
                        </div>
                      ) : (
                        schedules.map((slot) => {
                          const maxMarks = Number(slot.maxMarks) || term.defaultMaxMarks;
                          const passMarks = Number(slot.passMarks) || term.defaultPassMarks;

                          return (
                            <div
                              key={slot.id}
                              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition group"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                  {slot.subject?.code}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditSlotModal(slot, term.name, slot.subject?.name)}
                                    className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                                    title="Edit Marks & Date"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${slot.subject?.name} from ${term.name}?`)) {
                                        deleteScheduleMutation.mutate(slot.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                    title="Remove Paper"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <h4 className="text-xs font-extrabold text-slate-900">{slot.subject?.name}</h4>

                              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                <div>
                                  Max: <strong className="text-slate-900">{maxMarks}</strong> (Pass: {passMarks})
                                </div>
                                <div className="text-right text-[10px] text-slate-400 font-mono">
                                  {slot.examDate ? slot.examDate.split('T')[0] : 'Date TBD'}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Column Footer */}
                    <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between">
                      {exam ? (
                        <Link
                          href={`/exams/${exam.id}`}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Timetable <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-400">Ready on drop</span>
                      )}

                      <span className="text-[10px] font-semibold text-slate-400">
                        {term.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              /* Schedule Matrix List View */
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                {/* Table Header Controls Toolbar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by subject name or code..."
                        value={listSearchQuery}
                        onChange={(e) => setListSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition shadow-2xs"
                      />
                      {listSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setListSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setListStatusFilter('all')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                          listStatusFilter === 'all'
                            ? 'bg-white text-blue-600 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        All ({availableClassSubjects.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setListStatusFilter('scheduled')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                          listStatusFilter === 'scheduled'
                            ? 'bg-white text-emerald-600 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Fully Scheduled
                      </button>
                      <button
                        type="button"
                        onClick={() => setListStatusFilter('pending')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                          listStatusFilter === 'pending'
                            ? 'bg-white text-amber-600 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Pending Slots
                      </button>
                    </div>
                  </div>

                  {/* Summary Badges & Class Context */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-xs font-semibold text-slate-500 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      Curriculum: <strong className="text-slate-800 font-bold">{currentSelectedClass?.name}</strong>
                    </span>
                  </div>
                </div>

                {/* Master Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 min-w-[960px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                        <th className="px-6 py-4 w-72 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Subject & Blueprint
                        </th>
                        {STANDARD_EXAM_TERMS.map((term) => {
                          const exam = getExamForTerm(term.key, term.name);
                          const schedules = getSchedulesForExam(exam);
                          const count = schedules.length;
                          const total = availableClassSubjects.length;
                          const isFullyDone = total > 0 && count >= total;

                          return (
                            <th key={term.key} className="px-4 py-4 text-center min-w-[190px]">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                      term.key === 'UNIT_1'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : term.key === 'TERM_1'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : term.key === 'UNIT_2'
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}
                                  >
                                    {term.badge}
                                  </span>
                                  {isFullyDone && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="All subjects scheduled" />
                                  )}
                                </div>
                                <div className="text-xs font-extrabold text-slate-900 tracking-tight">
                                  {term.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  Weight: <strong className="text-slate-600">{term.defaultMaxMarks}M</strong> • Pass: <strong className="text-slate-600">≥ {term.defaultPassMarks}M</strong>
                                </div>
                                <div className="mt-1.5 flex items-center gap-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isFullyDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {count}/{total} Scheduled
                                  </span>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const filteredSubjects = availableClassSubjects.filter((sub) => {
                          const query = listSearchQuery.trim().toLowerCase();
                          const matchesSearch =
                            !query ||
                            sub.name.toLowerCase().includes(query) ||
                            sub.code.toLowerCase().includes(query);
                          if (!matchesSearch) return false;

                          if (listStatusFilter === 'all') return true;

                          const scheduledCount = STANDARD_EXAM_TERMS.reduce((acc, term) => {
                            const exam = getExamForTerm(term.key, term.name);
                            const schedules = getSchedulesForExam(exam);
                            return acc + (schedules.some((s) => s.subjectId === sub.id) ? 1 : 0);
                          }, 0);

                          if (listStatusFilter === 'scheduled') {
                            return scheduledCount === STANDARD_EXAM_TERMS.length;
                          }
                          if (listStatusFilter === 'pending') {
                            return scheduledCount < STANDARD_EXAM_TERMS.length;
                          }
                          return true;
                        });

                        if (filteredSubjects.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="px-6 py-16 text-center">
                                <div className="max-w-sm mx-auto flex flex-col items-center">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                                    <BookOpen className="w-6 h-6" />
                                  </div>
                                  <p className="text-xs font-extrabold text-slate-800">No matching subjects found</p>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    {listSearchQuery
                                      ? `No subjects match "${listSearchQuery}" in ${currentSelectedClass.name}.`
                                      : 'No subjects enrolled in this standard.'}
                                  </p>
                                  {listSearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setListSearchQuery('')}
                                      className="mt-3 px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-xl transition cursor-pointer"
                                    >
                                      Clear Search Filter
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return filteredSubjects.map((sub) => {
                          const theory = Number(sub.theoryMaxMarks) || 0;
                          const practical = Number(sub.practicalMaxMarks) || 0;
                          const totalMarks = theory + practical || 100;
                          const displayName = formatSubjectName(sub.name);
                          const colorStyle = getSubjectColorStyle(sub.code || sub.name);
                          const initials = (sub.code || sub.name.substring(0, 2)).toUpperCase().slice(0, 3);

                          return (
                            <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors group">
                              {/* Subject & Blueprint Column */}
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-2xl ${colorStyle.avatar} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="font-mono text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/70">
                                        {sub.code.toUpperCase()}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                        {sub.type || 'CORE'}
                                      </span>
                                    </div>
                                    <div className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {displayName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                      <span>
                                        Default Max: <strong className="text-slate-600 font-bold">{totalMarks}M</strong>
                                      </span>
                                      {practical > 0 && (
                                        <span className="text-slate-400">
                                          ({theory} Th + {practical} Pr)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 4 Term Exam Columns */}
                              {STANDARD_EXAM_TERMS.map((term) => {
                                const exam = getExamForTerm(term.key, term.name);
                                const schedules = getSchedulesForExam(exam);
                                const slot = schedules.find((s) => s.subjectId === sub.id);

                                return (
                                  <td key={term.key} className="px-3 py-3 align-middle text-center">
                                    {slot ? (
                                      /* Scheduled Paper Card */
                                      <div
                                        className={`relative p-3 rounded-2xl border text-left transition-all hover:shadow-xs group/card bg-white ${
                                          term.key === 'UNIT_1'
                                            ? 'border-blue-200/80 hover:border-blue-400'
                                            : term.key === 'TERM_1'
                                            ? 'border-amber-200/80 hover:border-amber-400'
                                            : term.key === 'UNIT_2'
                                            ? 'border-indigo-200/80 hover:border-indigo-400'
                                            : 'border-emerald-200/80 hover:border-emerald-400'
                                        }`}
                                      >
                                        {/* Top Bar: Status Pill & Actions */}
                                        <div className="flex items-center justify-between gap-1 mb-2">
                                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Scheduled
                                          </span>
                                          <div className="flex items-center gap-0.5 opacity-90 group-hover/card:opacity-100 transition">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditSlotModal(slot, term.name, displayName)}
                                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                              title="Edit Marks, Date & Timing"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (confirm(`Remove ${displayName} paper from ${term.name}?`)) {
                                                  deleteScheduleMutation.mutate(slot.id);
                                                }
                                              }}
                                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                              title="Remove Paper"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Middle Row: Marks Display */}
                                        <div className="flex items-baseline justify-between mb-2">
                                          <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-black text-slate-900 tracking-tight">
                                              {Number(slot.maxMarks) || term.defaultMaxMarks}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">Marks</span>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            Pass: ≥ {Number(slot.passMarks) || term.defaultPassMarks}
                                          </span>
                                        </div>

                                        {/* Bottom Row: Calendar Date & Time */}
                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                          <div className="flex items-center gap-1 font-medium">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>{formatDateNice(slot.examDate)}</span>
                                          </div>
                                          {slot.startTime && (
                                            <div className="flex items-center gap-0.5 text-slate-400 font-mono text-[9px]">
                                              <Clock className="w-2.5 h-2.5" />
                                              <span>{slot.startTime.slice(0, 5)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      /* Unscheduled Action Slot */
                                      <button
                                        type="button"
                                        onClick={() => handleQuickSchedule(sub, term)}
                                        className="w-full min-h-[96px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 p-2.5 flex flex-col items-center justify-center gap-1 text-center transition-all group/btn cursor-pointer"
                                        title={`Quick Schedule ${displayName} for ${term.name} (${term.defaultMaxMarks} Marks)`}
                                      >
                                        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover/btn:bg-blue-100 text-slate-400 group-hover/btn:text-blue-600 flex items-center justify-center transition-colors">
                                          <Plus className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 group-hover/btn:text-blue-600 transition-colors">
                                          + Schedule
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                          Out of {term.defaultMaxMarks}M
                                        </span>
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </>
          ) : null}
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClass(cls)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Class"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${cls.name}"?`)) {
                            deleteClassMutation.mutate(cls.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                  <td className="px-6 py-4 font-bold text-blue-600">{sec.class?.name || '—'}</td>
                  <td className="px-6 py-4 font-mono">{sec.code}</td>
                  <td className="px-6 py-4 font-medium">{sec.capacity} Students</td>
                  <td className="px-6 py-4 text-slate-500">{sec.roomNumber || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditSection(sec)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Section"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete section "${sec.name}"?`)) {
                            deleteSectionMutation.mutate(sec.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
          {subjects.map((sub) => {
            const theory = Number(sub.theoryMaxMarks) || 0;
            const practical = Number(sub.practicalMaxMarks) || 0;
            const totalMarks = theory + practical;
            const hasPractical = practical > 0;
            const passScore = Number(sub.passingMarks) || 0;
            const credits = Number(sub.credit) || 1;

            return (
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

                  <div className="text-xs text-slate-500 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Default Out of (Max Marks):</span>
                      <span className="text-slate-900 font-bold">{totalMarks}</span>
                    </div>

                    {hasPractical ? (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span>Theory: <strong className="text-slate-800">{theory}</strong></span>
                        <span>Practical: <strong className="text-slate-800">{practical}</strong></span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                        Direct / Single Exam Mode
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>Pass Score:</span>
                      <span className="text-emerald-600 font-bold">{passScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Credits:</span>
                      <span className="text-blue-600 font-bold">{credits}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleEditSubject(sub)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Edit Subject"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete subject "${sub.name}"?`)) {
                        deleteSubjectMutation.mutate(sub.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 5: Academic Years */}
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
                  <div className="flex items-center gap-2">
                    {year.isCurrent ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Session
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 capitalize font-medium">
                        {year.status?.toLowerCase() || 'inactive'}
                      </span>
                    )}
                    <button
                      onClick={() => handleEditYear(year)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Academic Year"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{year.name}</h3>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    Start Date: <span className="text-slate-800 font-semibold">{year.startDate?.split('T')[0]}</span>
                  </div>
                  <div>
                    End Date: <span className="text-slate-800 font-semibold">{year.endDate?.split('T')[0]}</span>
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

      {/* Modal: Edit Exam Paper Slot in Kanban */}
      {showSlotModal && slotModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Configure {slotModalData.subjectName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exam: {slotModalData.examName} ({currentSelectedClass?.name})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSlotModal(false);
                  setSlotModalData(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Max Marks (Out Of) *</label>
                  <input
                    type="number"
                    value={slotModalData.maxMarks}
                    onChange={(e) =>
                      setSlotModalData({ ...slotModalData, maxMarks: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Passing Marks *</label>
                  <input
                    type="number"
                    value={slotModalData.passMarks}
                    onChange={(e) =>
                      setSlotModalData({ ...slotModalData, passMarks: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Exam Date</label>
                <input
                  type="date"
                  value={slotModalData.examDate}
                  onChange={(e) =>
                    setSlotModalData({ ...slotModalData, examDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={slotModalData.startTime}
                    onChange={(e) =>
                      setSlotModalData({ ...slotModalData, startTime: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={slotModalData.endTime}
                    onChange={(e) =>
                      setSlotModalData({ ...slotModalData, endTime: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Exam Room / Hall</label>
                <input
                  type="text"
                  value={slotModalData.roomNumber}
                  onChange={(e) =>
                    setSlotModalData({ ...slotModalData, roomNumber: e.target.value })
                  }
                  placeholder="e.g. Room 204 or Main Hall"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setShowSlotModal(false);
                  setSlotModalData(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (slotModalData.id) {
                    updateScheduleMutation.mutate({
                      id: slotModalData.id,
                      data: {
                        examDate: slotModalData.examDate,
                        startTime: slotModalData.startTime,
                        endTime: slotModalData.endTime,
                        maxMarks: slotModalData.maxMarks,
                        passMarks: slotModalData.passMarks,
                        theoryMaxMarks: slotModalData.maxMarks,
                        practicalMaxMarks: 0,
                        roomNumber: slotModalData.roomNumber,
                      },
                    });
                  } else {
                    createScheduleMutation.mutate({
                      examId: slotModalData.examId,
                      classId: slotModalData.classId,
                      subjectId: slotModalData.subjectId,
                      examDate: slotModalData.examDate,
                      startTime: slotModalData.startTime,
                      endTime: slotModalData.endTime,
                      maxMarks: slotModalData.maxMarks,
                      passMarks: slotModalData.passMarks,
                      theoryMaxMarks: slotModalData.maxMarks,
                      practicalMaxMarks: 0,
                      roomNumber: slotModalData.roomNumber,
                    });
                  }
                }}
                disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {createScheduleMutation.isPending || updateScheduleMutation.isPending
                  ? 'Saving...'
                  : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Create / Edit Academic Year */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingYear ? 'Edit Academic Year' : 'Create Academic Year'}
              </h3>
              <button
                onClick={() => {
                  setShowYearModal(false);
                  setEditingYear(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Name</label>
                <input
                  type="text"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  placeholder="e.g. 2026-2027"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Code</label>
                <input
                  type="text"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                  placeholder="e.g. AY-2026-27"
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
                onClick={() => {
                  setShowYearModal(false);
                  setEditingYear(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingYear) {
                    updateYearMutation.mutate({
                      id: editingYear.id,
                      data: yearForm,
                    });
                  } else {
                    createYearMutation.mutate(yearForm);
                  }
                }}
                disabled={createYearMutation.isPending || updateYearMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {editingYear ? 'Update Year' : 'Create Year'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create / Edit Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingClass ? 'Edit Class Level' : 'Create Class Level'}
              </h3>
              <button
                onClick={() => {
                  setShowClassModal(false);
                  setEditingClass(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  placeholder="e.g. Grade 11 Science"
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
                    placeholder="e.g. G11-SCI"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Progression Level
                  </label>
                  <input
                    type="number"
                    value={classForm.level || ''}
                    onChange={(e) =>
                      setClassForm({ ...classForm, level: parseInt(e.target.value, 10) || 1 })
                    }
                    placeholder="e.g. 11"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Numerical grade rank for promotion.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Capacity</label>
                <input
                  type="number"
                  value={classForm.capacity || ''}
                  onChange={(e) =>
                    setClassForm({ ...classForm, capacity: parseInt(e.target.value, 10) || 0 })
                  }
                  placeholder="e.g. 120"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setShowClassModal(false);
                  setEditingClass(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingClass) {
                    updateClassMutation.mutate({
                      id: editingClass.id,
                      data: {
                        name: classForm.name,
                        code: classForm.code,
                        level: classForm.level,
                        capacity: classForm.capacity,
                        academicYearId: classForm.academicYearId,
                      },
                    });
                  } else {
                    createClassMutation.mutate(classForm);
                  }
                }}
                disabled={createClassMutation.isPending || updateClassMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {editingClass ? 'Update Class' : 'Save Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Create / Edit Section */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingSection ? 'Edit Section' : 'Create Section'}
              </h3>
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Class / Standard</label>
                <select
                  value={sectionForm.classId}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, classId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="">Select a Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section Name</label>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  placeholder="e.g. Section A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Code</label>
                  <input
                    type="text"
                    value={sectionForm.code}
                    onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Capacity</label>
                  <input
                    type="number"
                    value={sectionForm.capacity || ''}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value, 10) || 40 })
                    }
                    placeholder="e.g. 40"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Room Number</label>
                <input
                  type="text"
                  value={sectionForm.roomNumber}
                  onChange={(e) => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
                  placeholder="e.g. Room 204"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingSection) {
                    updateSectionMutation.mutate({
                      id: editingSection.id,
                      data: {
                        name: sectionForm.name,
                        code: sectionForm.code,
                        capacity: sectionForm.capacity,
                        roomNumber: sectionForm.roomNumber,
                        classId: sectionForm.classId,
                      },
                    });
                  } else {
                    createSectionMutation.mutate(sectionForm);
                  }
                }}
                disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {editingSection ? 'Update Section' : 'Save Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Create / Edit Subject (Flexible Simple vs Theory+Practical) */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingSubject ? 'Edit Subject' : 'Create Subject'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define subject taxonomy for primary, middle, or secondary standards.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setEditingSubject(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Mathematics / English / General Science / Rhymes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Code *</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="e.g. MATH, ENG, SCI-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="CORE">Compulsory / Main (e.g. English, Math)</option>
                    <option value="ELECTIVE">Choice Subject (e.g. Sanskrit / French / Biology)</option>
                    <option value="OPTIONAL">Extra / Activity (e.g. Art / Music / Sports)</option>
                    <option value="VOCATIONAL">Skill Training (e.g. Coding / Craft / IT)</option>
                  </select>
                </div>
              </div>

              {/* Evaluation Mode Toggle: Simple vs Theory + Practical */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Include Theory & Practical Breakdown?
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {subjectForm.hasTheoryPracticalSplit
                        ? 'Higher Std / Board mode (separate theory & lab marks)'
                        : 'Lower & General Std mode (single total marks rubric)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !subjectForm.hasTheoryPracticalSplit;
                      setSubjectForm({
                        ...subjectForm,
                        hasTheoryPracticalSplit: next,
                        practicalMaxMarks: next ? 20 : 0,
                        theoryMaxMarks: next ? 80 : subjectForm.maxMarks,
                      });
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      subjectForm.hasTheoryPracticalSplit
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {subjectForm.hasTheoryPracticalSplit ? 'Split Enabled' : 'Simple Mode'}
                  </button>
                </div>

                {/* Simple Mode (Default for Nursery to 5th Std) */}
                {!subjectForm.hasTheoryPracticalSplit ? (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Default Out Of (Max Marks)
                      </label>
                      <input
                        type="number"
                        value={subjectForm.maxMarks || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSubjectForm({
                            ...subjectForm,
                            maxMarks: val,
                            theoryMaxMarks: val,
                            practicalMaxMarks: 0,
                            passingMarks: Math.round(val * 0.35),
                          });
                        }}
                        placeholder="e.g. 100 or 50"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        * Note: Individual exams (Unit Test=20, Term=40) can override this.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Min Passing Marks
                      </label>
                      <input
                        type="number"
                        value={subjectForm.passingMarks || ''}
                        onChange={(e) =>
                          setSubjectForm({
                            ...subjectForm,
                            passingMarks: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g. 35"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  /* Split Mode (For Board / Higher Sciences) */
                  <div className="space-y-3 mt-3 pt-3 border-t border-slate-200/60">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Theory Max Marks
                        </label>
                        <input
                          type="number"
                          value={subjectForm.theoryMaxMarks || ''}
                          onChange={(e) => {
                            const th = parseFloat(e.target.value) || 0;
                            const total = th + (subjectForm.practicalMaxMarks || 0);
                            setSubjectForm({
                              ...subjectForm,
                              theoryMaxMarks: th,
                              maxMarks: total,
                              passingMarks: Math.round(total * 0.35),
                            });
                          }}
                          placeholder="e.g. 70 or 80"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Practical Max Marks
                        </label>
                        <input
                          type="number"
                          value={subjectForm.practicalMaxMarks || ''}
                          onChange={(e) => {
                            const pr = parseFloat(e.target.value) || 0;
                            const total = (subjectForm.theoryMaxMarks || 0) + pr;
                            setSubjectForm({
                              ...subjectForm,
                              practicalMaxMarks: pr,
                              maxMarks: total,
                              passingMarks: Math.round(total * 0.35),
                            });
                          }}
                          placeholder="e.g. 30 or 20"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Total Marks: <strong className="text-blue-600">{(subjectForm.theoryMaxMarks || 0) + (subjectForm.practicalMaxMarks || 0)}</strong>
                        </label>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Combined Pass Score
                        </label>
                        <input
                          type="number"
                          value={subjectForm.passingMarks || ''}
                          onChange={(e) =>
                            setSubjectForm({
                              ...subjectForm,
                              passingMarks: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="e.g. 33"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Credits / Weightage</label>
                <input
                  type="number"
                  step="0.5"
                  value={subjectForm.credit ?? ''}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      credit: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  placeholder="e.g. 1.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setEditingSubject(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubject}
                disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {editingSubject ? 'Update Subject' : 'Save Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Assign Subject to Class */}
      {showAssignSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Assign Subject to {currentSelectedClass?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link a taxonomy subject to this specific standard.
                </p>
              </div>
              <button
                onClick={() => setShowAssignSubjectModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Subject from Taxonomy *
                </label>
                <select
                  value={assignSubjectForm.subjectId}
                  onChange={(e) =>
                    setAssignSubjectForm({ ...assignSubjectForm, subjectId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="">Select a Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — {s.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Curriculum Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignSubjectForm({ ...assignSubjectForm, isMandatory: true })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                      assignSubjectForm.isMandatory
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Mandatory (Core)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignSubjectForm({ ...assignSubjectForm, isMandatory: false })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                      !assignSubjectForm.isMandatory
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Elective / Optional
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowAssignSubjectModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!assignSubjectForm.subjectId || !currentSelectedClass) return;
                  assignSubjectMutation.mutate({
                    classId: currentSelectedClass.id,
                    subjectId: assignSubjectForm.subjectId,
                    isMandatory: assignSubjectForm.isMandatory,
                  });
                }}
                disabled={!assignSubjectForm.subjectId || assignSubjectMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {assignSubjectMutation.isPending ? 'Assigning...' : 'Assign to Class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcademicPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading academic structure...</div>}>
      <AcademicContent />
    </Suspense>
  );
}
