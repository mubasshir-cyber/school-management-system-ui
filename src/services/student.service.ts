import { apiClient } from '../lib/api-client';
import { ClassItem, SectionItem, AcademicYear } from './academic.service';

export interface StudentGuardianItem {
  id: string;
  studentId: string;
  guardianId: string;
  relationshipType: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  canPickupStudent: boolean;
  receivesNotifications: boolean;
  hasPortalAccess: boolean;
  guardian: GuardianItem;
}

export interface GuardianItem {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  relationshipType: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  governmentIdType?: string;
  governmentIdNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: string;
}

export interface StudentEnrollmentItem {
  id: string;
  studentId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber?: string;
  enrollmentDate: string;
  status: string;
  promotionStatus?: string;
  startDate: string;
  endDate?: string;
  academicYear?: AcademicYear;
  class?: ClassItem;
  section?: SectionItem;
}

export interface StudentDocumentItem {
  id: string;
  studentId: string;
  documentType: string;
  documentName: string;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  issueDate?: string;
  expiryDate?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifier?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface StudentItem {
  id: string;
  studentCode: string;
  admissionNumber?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  nationality: string;
  category: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  mobile?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  currentAddress?: string;
  religion?: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  guardians?: StudentGuardianItem[];
  enrollments?: StudentEnrollmentItem[];
  documents?: StudentDocumentItem[];
}

export interface StudentListResponse {
  items: StudentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentStatistics {
  total: number;
  active: number;
  registered: number;
  male: number;
  female: number;
}

export const studentService = {
  getStudents: async (params?: {
    search?: string;
    status?: string;
    gender?: string;
    classId?: string;
    sectionId?: string;
    academicYearId?: string;
    page?: number;
    limit?: number;
  }): Promise<StudentListResponse> => {
    const res = await apiClient.get('/students', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || 0,
      page: res.data.meta?.page || 1,
      limit: res.data.meta?.limit || 20,
      totalPages: res.data.meta?.totalPages || 1,
    };
  },

  getStudent: async (id: string): Promise<StudentItem> => {
    const res = await apiClient.get(`/students/${id}`);
    return res.data.data;
  },

  getStatistics: async (): Promise<StudentStatistics> => {
    const res = await apiClient.get('/students/statistics');
    return res.data.data;
  },

  createStudent: async (data: Partial<StudentItem>): Promise<StudentItem> => {
    const res = await apiClient.post('/students', data);
    return res.data.data;
  },

  updateStudent: async (id: string, data: Partial<StudentItem>): Promise<StudentItem> => {
    const res = await apiClient.patch(`/students/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<StudentItem> => {
    const res = await apiClient.patch(`/students/${id}/status`, { status });
    return res.data.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};
