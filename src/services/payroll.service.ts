import { apiClient } from '../lib/api-client';

export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  componentType: 'EARNING' | 'DEDUCTION';
  calculationType: 'FIXED' | 'PERCENTAGE_OF_BASIC';
  defaultValue: number;
  isTaxable: boolean;
  isStatutory: boolean;
  description?: string;
  status: string;
}

export interface SalaryStructureItem {
  id: string;
  salaryComponentId: string;
  salaryComponent?: SalaryComponent;
  calculationType: 'FIXED' | 'PERCENTAGE_OF_BASIC';
  value: number;
}

export interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  items: SalaryStructureItem[];
  createdAt: string;
}

export interface StaffSalaryAssignment {
  id: string;
  staffId: string;
  staff?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
    designation?: { title: string };
  };
  salaryStructureId: string;
  salaryStructure?: SalaryStructure;
  baseGrossSalary: number;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  effectiveFrom: string;
  status: string;
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  staffId: string;
  staff?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
    designation?: { title: string };
  };
  basicSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  unpaidLeavesCount: number;
  lopDeductionAmount: number;
  netSalary: number;
  breakdown?: {
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  };
  status: string;
  remarks?: string;
  createdAt: string;
}

export interface Payroll {
  id: string;
  academicYearId?: string;
  month: number;
  year: number;
  payrollTitle: string;
  totalStaffCount: number;
  totalGrossAmount: number;
  totalDeductionsAmount: number;
  totalNetAmount: number;
  status: 'DRAFT' | 'CALCULATED' | 'REVIEW' | 'APPROVED' | 'PAID' | 'CANCELLED';
  processedByUser?: { firstName: string; lastName: string };
  approvedByUser?: { firstName: string; lastName: string };
  paidAt?: string;
  notes?: string;
  items?: PayrollItem[];
  createdAt: string;
}

export interface PayrollSummary {
  totalDisbursed: number;
  activeStaffCount: number;
  latestBatch: string;
  lastBatchAmount: number;
}

export const payrollService = {
  // Components
  getComponents: async (): Promise<SalaryComponent[]> => {
    const res = await apiClient.get('/payroll/components');
    return res.data.data || res.data;
  },

  createComponent: async (data: Partial<SalaryComponent>): Promise<SalaryComponent> => {
    const res = await apiClient.post('/payroll/components', data);
    return res.data.data || res.data;
  },

  updateComponent: async (id: string, data: Partial<SalaryComponent>): Promise<SalaryComponent> => {
    const res = await apiClient.patch(`/payroll/components/${id}`, data);
    return res.data.data || res.data;
  },

  // Structures
  getStructures: async (): Promise<SalaryStructure[]> => {
    const res = await apiClient.get('/payroll/structures');
    return res.data.data || res.data;
  },

  createStructure: async (data: any): Promise<SalaryStructure> => {
    const res = await apiClient.post('/payroll/structures', data);
    return res.data.data || res.data;
  },

  // Staff Assignments
  getStaffAssignments: async (): Promise<StaffSalaryAssignment[]> => {
    const res = await apiClient.get('/payroll/assignments');
    return res.data.data || res.data;
  },

  assignStaffSalary: async (data: any): Promise<StaffSalaryAssignment> => {
    const res = await apiClient.post('/payroll/assignments', data);
    return res.data.data || res.data;
  },

  // Payroll Batches
  getPayrolls: async (): Promise<Payroll[]> => {
    const res = await apiClient.get('/payroll/batches');
    return res.data.data || res.data;
  },

  getPayrollById: async (id: string): Promise<Payroll> => {
    const res = await apiClient.get(`/payroll/batches/${id}`);
    return res.data.data || res.data;
  },

  generateMonthlyPayroll: async (data: {
    month: number;
    year: number;
    payrollTitle: string;
    academicYearId?: string;
    notes?: string;
  }): Promise<Payroll> => {
    const res = await apiClient.post('/payroll/generate', data);
    return res.data.data || res.data;
  },

  approvePayroll: async (id: string): Promise<Payroll> => {
    const res = await apiClient.patch(`/payroll/batches/${id}/approve`);
    return res.data.data || res.data;
  },

  disbursePayroll: async (id: string, data: { paymentMethod: string; transactionReferencePrefix?: string }): Promise<Payroll> => {
    const res = await apiClient.post(`/payroll/batches/${id}/disburse`, data);
    return res.data.data || res.data;
  },

  getPayslip: async (id: string): Promise<PayrollItem> => {
    const res = await apiClient.get(`/payroll/payslips/${id}`);
    return res.data.data || res.data;
  },

  getPayrollSummary: async (): Promise<PayrollSummary> => {
    const res = await apiClient.get('/payroll/summary');
    return res.data.data || res.data;
  },
};
