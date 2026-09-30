import { apiClient } from '../lib/api-client';
import { GuardianItem, StudentGuardianItem } from './student.service';

export const guardianService = {
  getGuardians: async (search?: string): Promise<GuardianItem[]> => {
    const params = search ? { search } : {};
    const res = await apiClient.get('/guardians', { params });
    return res.data.data || [];
  },

  getGuardian: async (id: string): Promise<GuardianItem> => {
    const res = await apiClient.get(`/guardians/${id}`);
    return res.data.data;
  },

  createGuardian: async (data: Partial<GuardianItem>): Promise<GuardianItem> => {
    const res = await apiClient.post('/guardians', data);
    return res.data.data;
  },

  updateGuardian: async (id: string, data: Partial<GuardianItem>): Promise<GuardianItem> => {
    const res = await apiClient.patch(`/guardians/${id}`, data);
    return res.data.data;
  },

  deleteGuardian: async (id: string): Promise<void> => {
    await apiClient.delete(`/guardians/${id}`);
  },

  linkGuardian: async (studentId: string, data: {
    guardianId: string;
    relationshipType: string;
    isPrimary?: boolean;
    isEmergencyContact?: boolean;
    canPickupStudent?: boolean;
    receivesNotifications?: boolean;
    hasPortalAccess?: boolean;
  }): Promise<StudentGuardianItem> => {
    const res = await apiClient.post(`/students/${studentId}/guardians`, data);
    return res.data.data;
  },

  updateLink: async (
    studentId: string,
    guardianId: string,
    data: Partial<StudentGuardianItem>,
  ): Promise<StudentGuardianItem> => {
    const res = await apiClient.patch(`/students/${studentId}/guardians/${guardianId}`, data);
    return res.data.data;
  },

  unlinkGuardian: async (studentId: string, guardianId: string): Promise<void> => {
    await apiClient.delete(`/students/${studentId}/guardians/${guardianId}`);
  },
};
