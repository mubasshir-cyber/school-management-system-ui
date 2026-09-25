import { apiClient } from '../lib/api-client';

export interface AcademicYear {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  level: number;
  displayOrder: number;
  capacity: number;
  status: string;
  academicYear?: AcademicYear;
}

export interface SectionItem {
  id: string;
  name: string;
  code: string;
  capacity: number;
  roomNumber?: string;
  status: string;
  class?: ClassItem;
  classTeacher?: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  type: string;
  theoryMaxMarks: number;
  practicalMaxMarks: number;
  passingMarks: number;
  credit: number;
  status: string;
}

export interface ClassSubjectItem {
  id: string;
  classId: string;
  subjectId: string;
  isMandatory: boolean;
  displayOrder: number;
  subject: SubjectItem;
  class: ClassItem;
}

export interface TeacherAssignmentItem {
  id: string;
  teacherId: string;
  classId: string;
  sectionId: string;
  subjectId?: string;
  isClassTeacher?: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
  class: ClassItem;
  section: SectionItem;
  subject?: SubjectItem;
}

export const academicService = {
  // Academic Years
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const res = await apiClient.get('/academic-years');
    return res.data.data || [];
  },

  getCurrentAcademicYear: async (): Promise<AcademicYear | null> => {
    const res = await apiClient.get('/academic-years/current');
    return res.data.data;
  },

  createAcademicYear: async (data: Partial<AcademicYear>): Promise<AcademicYear> => {
    const res = await apiClient.post('/academic-years', data);
    return res.data.data;
  },

  setCurrentAcademicYear: async (id: string): Promise<AcademicYear> => {
    const res = await apiClient.post(`/academic-years/${id}/set-current`);
    return res.data.data;
  },

  // Classes
  getClasses: async (academicYearId?: string): Promise<ClassItem[]> => {
    const params = academicYearId ? { academicYearId } : {};
    const res = await apiClient.get('/classes', { params });
    return res.data.data || [];
  },

  createClass: async (data: any): Promise<ClassItem> => {
    const res = await apiClient.post('/classes', data);
    return res.data.data;
  },

  deleteClass: async (id: string): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },

  // Sections
  getSections: async (classId?: string, academicYearId?: string): Promise<SectionItem[]> => {
    const params: any = {};
    if (classId) params.classId = classId;
    if (academicYearId) params.academicYearId = academicYearId;
    const res = await apiClient.get('/sections', { params });
    return res.data.data || [];
  },

  createSection: async (data: any): Promise<SectionItem> => {
    const res = await apiClient.post('/sections', data);
    return res.data.data;
  },

  deleteSection: async (id: string): Promise<void> => {
    await apiClient.delete(`/sections/${id}`);
  },

  // Subjects
  getSubjects: async (): Promise<SubjectItem[]> => {
    const res = await apiClient.get('/subjects');
    return res.data.data || [];
  },

  createSubject: async (data: any): Promise<SubjectItem> => {
    const res = await apiClient.post('/subjects', data);
    return res.data.data;
  },

  deleteSubject: async (id: string): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },

  // Class Subjects
  getClassSubjects: async (classId: string): Promise<ClassSubjectItem[]> => {
    const res = await apiClient.get('/class-subjects', { params: { classId } });
    return res.data.data || [];
  },

  assignSubjectToClass: async (data: any): Promise<ClassSubjectItem> => {
    const res = await apiClient.post('/class-subjects', data);
    return res.data.data;
  },

  deleteClassSubject: async (id: string): Promise<void> => {
    await apiClient.delete(`/class-subjects/${id}`);
  },

  // Teacher Assignments
  getTeacherClassAssignments: async (academicYearId?: string): Promise<TeacherAssignmentItem[]> => {
    const params = academicYearId ? { academicYearId } : {};
    const res = await apiClient.get('/teacher-assignments/classes', { params });
    return res.data.data || [];
  },

  getTeacherSubjectAssignments: async (academicYearId?: string): Promise<TeacherAssignmentItem[]> => {
    const params = academicYearId ? { academicYearId } : {};
    const res = await apiClient.get('/teacher-assignments/subjects', { params });
    return res.data.data || [];
  },

  assignTeacherToClass: async (data: any): Promise<TeacherAssignmentItem> => {
    const res = await apiClient.post('/teacher-assignments/class', data);
    return res.data.data;
  },

  assignTeacherToSubject: async (data: any): Promise<TeacherAssignmentItem> => {
    const res = await apiClient.post('/teacher-assignments/subject', data);
    return res.data.data;
  },
};
