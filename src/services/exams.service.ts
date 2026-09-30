import { apiClient } from '../lib/api-client';

export interface ExamType {
  id: string;
  name: string;
  code: string;
  description?: string;
  weightage: number;
  status: string;
}

export interface GradeRange {
  grade: string;
  minScore: number;
  maxScore: number;
  gpaPoint?: number;
  remarks?: string;
}

export interface GradingScale {
  id: string;
  name: string;
  scaleType: 'PERCENTAGE' | 'GPA' | 'GRADE_ONLY';
  description?: string;
  isDefault: boolean;
  ranges: GradeRange[];
  status: string;
}

export interface ExamSchedule {
  id: string;
  examId: string;
  classId: string;
  class?: { id: string; name: string };
  sectionId?: string;
  section?: { id: string; name: string };
  subjectId: string;
  subject?: { id: string; name: string; code: string };
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  maxMarks: number;
  passMarks: number;
  theoryMaxMarks: number;
  practicalMaxMarks: number;
  invigilatorStaffId?: string;
  invigilatorStaff?: { id: string; firstName: string; lastName: string };
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface Exam {
  id: string;
  academicYearId: string;
  academicYear?: { id: string; name: string };
  examTypeId: string;
  examType?: ExamType;
  gradingScaleId?: string;
  gradingScale?: GradingScale;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'RESULTS_PUBLISHED' | 'CANCELLED';
  schedules?: ExamSchedule[];
  createdAt: string;
}

export interface StudentMarkRosterItem {
  studentId: string;
  student: {
    id: string;
    admissionNumber: string;
    rollNumber?: string;
    firstName: string;
    lastName: string;
    gender?: string;
    photoUrl?: string;
  };
  markId?: string | null;
  theoryMarks: number;
  practicalMarks: number;
  internalMarks: number;
  totalMarks: number;
  grade?: string;
  gpaPoint?: number | null;
  isAbsent: boolean;
  remarks?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED';
}

export interface ExamScheduleMarksResponse {
  schedule: ExamSchedule;
  roster: StudentMarkRosterItem[];
}

export interface ExamResultItem {
  id: string;
  examId: string;
  studentId: string;
  student: {
    id: string;
    admissionNumber: string;
    rollNumber?: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  academicYearId: string;
  classId: string;
  class?: { id: string; name: string };
  sectionId?: string;
  section?: { id: string; name: string };
  totalMaxMarks: number;
  totalMarksObtained: number;
  percentage: number;
  gpa?: number;
  overallGrade: string;
  resultStatus: 'PASSED' | 'FAILED' | 'COMPARTMENT' | 'WITHHELD';
  rank?: number;
  attendancePercentage?: number;
  teacherRemarks?: string;
  principalRemarks?: string;
  publishedAt?: string;
}

export interface SubjectReportItem {
  subjectCode: string;
  subjectName: string;
  theoryMax: number;
  practicalMax: number;
  theoryObtained: number;
  practicalObtained: number;
  internalObtained: number;
  totalMax: number;
  passMarks: number;
  totalObtained: number;
  grade: string;
  isAbsent: boolean;
  isPassed: boolean;
  remarks?: string;
}

export interface ReportCardResponse {
  result: ExamResultItem & {
    exam?: {
      name: string;
      startDate: string;
      endDate: string;
      examType?: ExamType;
      gradingScale?: GradingScale;
    };
    academicYear?: { name: string };
  };
  subjects: SubjectReportItem[];
  gradingScale: GradeRange[];
}

export interface ExamListResponse {
  items: Exam[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const examsService = {
  // Exam Types
  getExamTypes: async (): Promise<ExamType[]> => {
    const res = await apiClient.get('/exams/types');
    return res.data.data || res.data;
  },

  createExamType: async (data: Partial<ExamType>): Promise<ExamType> => {
    const res = await apiClient.post('/exams/types', data);
    return res.data.data || res.data;
  },

  // Grading Scales
  getGradingScales: async (): Promise<GradingScale[]> => {
    const res = await apiClient.get('/exams/grading-scales');
    return res.data.data || res.data;
  },

  createGradingScale: async (data: Partial<GradingScale>): Promise<GradingScale> => {
    const res = await apiClient.post('/exams/grading-scales', data);
    return res.data.data || res.data;
  },

  // Exams
  getExams: async (params?: {
    academicYearId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ExamListResponse> => {
    const res = await apiClient.get('/exams', { params });
    return res.data.data || res.data;
  },

  getExamById: async (id: string): Promise<Exam> => {
    const res = await apiClient.get(`/exams/${id}`);
    return res.data.data || res.data;
  },

  createExam: async (data: Partial<Exam>): Promise<Exam> => {
    const res = await apiClient.post('/exams', data);
    return res.data.data || res.data;
  },

  updateExamStatus: async (id: string, status: string): Promise<Exam> => {
    const res = await apiClient.patch(`/exams/${id}/status`, { status });
    return res.data.data || res.data;
  },

  // Schedules
  getSchedules: async (examId: string, classId?: string, sectionId?: string): Promise<ExamSchedule[]> => {
    const res = await apiClient.get(`/exams/${examId}/schedules`, {
      params: { classId, sectionId },
    });
    return res.data.data || res.data;
  },

  createSchedule: async (data: Partial<ExamSchedule>): Promise<ExamSchedule> => {
    const res = await apiClient.post('/exams/schedules', data);
    return res.data.data || res.data;
  },

  // Marks Entry
  getMarksBySchedule: async (scheduleId: string): Promise<ExamScheduleMarksResponse> => {
    const res = await apiClient.get(`/exams/schedules/${scheduleId}/marks`);
    return res.data.data || res.data;
  },

  submitMarks: async (data: {
    examScheduleId: string;
    marks: {
      studentId: string;
      theoryMarks?: number;
      practicalMarks?: number;
      internalMarks?: number;
      totalMarks?: number;
      isAbsent?: boolean;
      remarks?: string;
    }[];
    status?: string;
  }) => {
    const res = await apiClient.post('/exams/marks/submit', data);
    return res.data.data || res.data;
  },

  // Results & Publishing
  calculateResults: async (data: {
    examId: string;
    classId?: string;
    sectionId?: string;
    generalRemarks?: string;
  }) => {
    const res = await apiClient.post('/exams/results/calculate', data);
    return res.data.data || res.data;
  },

  getExamResults: async (examId: string, classId?: string, sectionId?: string): Promise<ExamResultItem[]> => {
    const res = await apiClient.get(`/exams/${examId}/results`, {
      params: { classId, sectionId },
    });
    return res.data.data || res.data;
  },

  getStudentReportCard: async (examId: string, studentId: string): Promise<ReportCardResponse> => {
    const res = await apiClient.get(`/exams/${examId}/report-card/${studentId}`);
    return res.data.data || res.data;
  },

  publishResults: async (examId: string) => {
    const res = await apiClient.post(`/exams/${examId}/publish`);
    return res.data.data || res.data;
  },
};
