import { apiClient } from '../lib/api-client';
import { AcademicYear, ClassItem, SectionItem } from './academic.service';
import { StudentItem, StudentEnrollmentItem } from './student.service';

export interface AdmissionItem {
  id: string;
  applicationNumber: string;
  studentId?: string;
  academicYearId: string;
  classId: string;
  preferredSectionId?: string;
  applicationDate: string;
  status: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianMobile: string;
  guardianEmail?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  academicYear?: AcademicYear;
  class?: ClassItem;
  preferredSection?: SectionItem;
  student?: StudentItem;
  reviewer?: { firstName: string; lastName: string };
  approver?: { firstName: string; lastName: string };
}

export const admissionService = {
  getAdmissions: async (params?: {
    status?: string;
    academicYearId?: string;
    classId?: string;
    search?: string;
  }): Promise<AdmissionItem[]> => {
    const res = await apiClient.get('/admissions', { params });
    return res.data.data || [];
  },

  getAdmission: async (id: string): Promise<AdmissionItem> => {
    const res = await apiClient.get(`/admissions/${id}`);
    return res.data.data;
  },

  createAdmission: async (data: Partial<AdmissionItem>): Promise<AdmissionItem> => {
    const res = await apiClient.post('/admissions', data);
    return res.data.data;
  },

  updateAdmission: async (id: string, data: Partial<AdmissionItem>): Promise<AdmissionItem> => {
    const res = await apiClient.patch(`/admissions/${id}`, data);
    return res.data.data;
  },

  submitAdmission: async (id: string): Promise<AdmissionItem> => {
    const res = await apiClient.post(`/admissions/${id}/submit`);
    return res.data.data;
  },

  reviewAdmission: async (id: string, notes?: string): Promise<AdmissionItem> => {
    const res = await apiClient.post(`/admissions/${id}/review`, { notes });
    return res.data.data;
  },

  approveAdmission: async (id: string): Promise<AdmissionItem> => {
    const res = await apiClient.post(`/admissions/${id}/approve`);
    return res.data.data;
  },

  rejectAdmission: async (id: string, rejectionReason: string): Promise<AdmissionItem> => {
    const res = await apiClient.post(`/admissions/${id}/reject`, { rejectionReason });
    return res.data.data;
  },

  enrollAdmission: async (
    id: string,
    data: { sectionId?: string; rollNumber?: string },
  ): Promise<{ admission: AdmissionItem; student: StudentItem; enrollment: StudentEnrollmentItem }> => {
    const res = await apiClient.post(`/admissions/${id}/enroll`, data);
    return res.data.data;
  },
};
