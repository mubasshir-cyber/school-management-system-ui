import { apiClient } from '../lib/api-client';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  category: 'CASUAL' | 'SICK' | 'ANNUAL' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'OTHER';
  daysAllowedPerYear: number;
  isPaid: boolean;
  isCarryForward: boolean;
  description?: string;
  status: string;
}

export interface LeaveRequest {
  id: string;
  applicantUserId: string;
  applicantUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  staffId?: string;
  staff?: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
  };
  studentId?: string;
  leaveTypeId: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  documentUrl?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface LeaveRequestListResponse {
  items: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const leaveService = {
  // Leave Types
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const res = await apiClient.get('/leaves/types');
    return res.data.data || res.data;
  },

  createLeaveType: async (data: Partial<LeaveType>): Promise<LeaveType> => {
    const res = await apiClient.post('/leaves/types', data);
    return res.data.data || res.data;
  },

  updateLeaveType: async (id: string, data: Partial<LeaveType>): Promise<LeaveType> => {
    const res = await apiClient.patch(`/leaves/types/${id}`, data);
    return res.data.data || res.data;
  },

  // Leave Requests
  getLeaveRequests: async (params?: {
    staffId?: string;
    studentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<LeaveRequestListResponse> => {
    const res = await apiClient.get('/leaves/requests', { params });
    return res.data.data || res.data;
  },

  createLeaveRequest: async (data: {
    staffId?: string;
    studentId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    documentUrl?: string;
  }): Promise<LeaveRequest> => {
    const res = await apiClient.post('/leaves/requests', data);
    return res.data.data || res.data;
  },

  reviewLeaveRequest: async (id: string, data: { status: string; rejectionReason?: string }): Promise<LeaveRequest> => {
    const res = await apiClient.patch(`/leaves/requests/${id}/review`, data);
    return res.data.data || res.data;
  },
};
