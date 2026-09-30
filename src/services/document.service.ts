import { apiClient } from '../lib/api-client';
import { StudentDocumentItem } from './student.service';

export const documentService = {
  getStudentDocuments: async (studentId: string): Promise<StudentDocumentItem[]> => {
    const res = await apiClient.get(`/students/${studentId}/documents`);
    return res.data.data || [];
  },

  uploadDocument: async (data: Partial<StudentDocumentItem>): Promise<StudentDocumentItem> => {
    const res = await apiClient.post('/student-documents', data);
    return res.data.data;
  },

  verifyDocument: async (id: string, isVerified: boolean): Promise<StudentDocumentItem> => {
    const res = await apiClient.post(`/student-documents/${id}/verify`, { isVerified });
    return res.data.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/student-documents/${id}`);
  },
};
