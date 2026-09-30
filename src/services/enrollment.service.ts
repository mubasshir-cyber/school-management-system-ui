import { apiClient } from '../lib/api-client';
import { StudentEnrollmentItem } from './student.service';

export const enrollmentService = {
  getEnrollments: async (params?: {
    academicYearId?: string;
    classId?: string;
    sectionId?: string;
    status?: string;
  }): Promise<StudentEnrollmentItem[]> => {
    const res = await apiClient.get('/enrollments', { params });
    return res.data.data || [];
  },

  getStudentEnrollments: async (studentId: string): Promise<StudentEnrollmentItem[]> => {
    const res = await apiClient.get(`/students/${studentId}/enrollments`);
    return res.data.data || [];
  },

  getEnrollment: async (id: string): Promise<StudentEnrollmentItem> => {
    const res = await apiClient.get(`/enrollments/${id}`);
    return res.data.data;
  },

  createEnrollment: async (data: Partial<StudentEnrollmentItem>): Promise<StudentEnrollmentItem> => {
    const res = await apiClient.post('/enrollments', data);
    return res.data.data;
  },

  updateEnrollment: async (id: string, data: Partial<StudentEnrollmentItem>): Promise<StudentEnrollmentItem> => {
    const res = await apiClient.patch(`/enrollments/${id}`, data);
    return res.data.data;
  },

  transferEnrollment: async (
    id: string,
    data: {
      targetClassId: string;
      targetSectionId: string;
      newRollNumber?: string;
      reason?: string;
    },
  ): Promise<StudentEnrollmentItem> => {
    const res = await apiClient.post(`/enrollments/${id}/transfer`, data);
    return res.data.data;
  },

  withdrawEnrollment: async (id: string, reason?: string): Promise<StudentEnrollmentItem> => {
    const res = await apiClient.post(`/enrollments/${id}/withdraw`, { reason });
    return res.data.data;
  },
};
