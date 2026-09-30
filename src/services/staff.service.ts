import { apiClient } from '../lib/api-client';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartmentId?: string;
  status: string;
  designations?: Designation[];
  staffMembers?: StaffMember[];
  createdAt: string;
}

export interface Designation {
  id: string;
  departmentId?: string;
  department?: Department;
  title: string;
  code: string;
  description?: string;
  level: number;
  status: string;
  staffMembers?: StaffMember[];
  createdAt: string;
}

export interface StaffDocument {
  id: string;
  staffId: string;
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
  createdAt: string;
}

export interface StaffMember {
  id: string;
  employeeCode: string;
  userId?: string;
  departmentId?: string;
  department?: Department;
  designationId?: string;
  designation?: Designation;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  gender: string;
  dateOfBirth: string;
  dateOfJoining: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'VISITING';
  qualification?: string;
  experienceYears?: number;
  maritalStatus?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  currentAddress?: string;
  permanentAddress?: string;
  bankAccountTitle?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  panOrTaxId?: string;
  aadhaarOrNationalId?: string;
  basicSalary?: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'RESIGNED' | 'TERMINATED' | 'RETIRED';
  photoUrl?: string;
  documents?: StaffDocument[];
  createdAt: string;
}

export interface StaffListResponse {
  items: StaffMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const staffService = {
  // Staff Directory
  getStaffList: async (params?: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    employmentType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<StaffListResponse> => {
    const res = await apiClient.get('/staff', { params });
    return res.data.data || res.data;
  },

  getStaff: async (id: string): Promise<StaffMember> => {
    const res = await apiClient.get(`/staff/${id}`);
    return res.data.data || res.data;
  },

  getStatistics: async (): Promise<{ total: number; active: number; onLeave: number }> => {
    const res = await apiClient.get('/staff/statistics');
    return res.data.data || res.data;
  },

  createStaff: async (data: Partial<StaffMember> & { createUserAccount?: boolean; roleName?: string }): Promise<StaffMember> => {
    const res = await apiClient.post('/staff', data);
    return res.data.data || res.data;
  },

  updateStaff: async (id: string, data: Partial<StaffMember>): Promise<StaffMember> => {
    const res = await apiClient.patch(`/staff/${id}`, data);
    return res.data.data || res.data;
  },

  deleteStaff: async (id: string): Promise<void> => {
    await apiClient.delete(`/staff/${id}`);
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const res = await apiClient.get('/departments');
    return res.data.data || res.data;
  },

  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    const res = await apiClient.post('/departments', data);
    return res.data.data || res.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    const res = await apiClient.patch(`/departments/${id}`, data);
    return res.data.data || res.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },

  // Designations
  getDesignations: async (departmentId?: string): Promise<Designation[]> => {
    const res = await apiClient.get('/designations', { params: { departmentId } });
    return res.data.data || res.data;
  },

  createDesignation: async (data: Partial<Designation>): Promise<Designation> => {
    const res = await apiClient.post('/designations', data);
    return res.data.data || res.data;
  },

  updateDesignation: async (id: string, data: Partial<Designation>): Promise<Designation> => {
    const res = await apiClient.patch(`/designations/${id}`, data);
    return res.data.data || res.data;
  },

  deleteDesignation: async (id: string): Promise<void> => {
    await apiClient.delete(`/designations/${id}`);
  },

  // Staff Documents
  getStaffDocuments: async (staffId: string): Promise<StaffDocument[]> => {
    const res = await apiClient.get(`/staff-documents/staff/${staffId}`);
    return res.data.data || res.data;
  },

  uploadStaffDocument: async (data: Partial<StaffDocument>): Promise<StaffDocument> => {
    const res = await apiClient.post('/staff-documents', data);
    return res.data.data || res.data;
  },

  verifyStaffDocument: async (id: string, isVerified: boolean): Promise<StaffDocument> => {
    const res = await apiClient.patch(`/staff-documents/${id}/verify`, { isVerified });
    return res.data.data || res.data;
  },

  deleteStaffDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/staff-documents/${id}`);
  },
};
