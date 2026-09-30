import { apiClient } from '../lib/api-client';

export interface FeeType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isOptional: boolean;
  accountCode?: string;
  status: string;
}

export interface FeeStructureItem {
  id: string;
  feeTypeId: string;
  feeType?: FeeType;
  amount: number;
  dueDayOfMonth: number;
  lateFineAmount: number;
  graceDays: number;
}

export interface FeeStructure {
  id: string;
  academicYearId: string;
  academicYear?: { name: string };
  classId?: string;
  class?: { name: string };
  name: string;
  code: string;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'TERM' | 'ANNUAL';
  description?: string;
  status: string;
  items: FeeStructureItem[];
}

export interface FeeDiscount {
  id: string;
  name: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  reason?: string;
  status: string;
}

export interface FeeInvoiceItem {
  id: string;
  feeTypeId: string;
  feeType?: FeeType;
  amount: number;
  discountAmount: number;
  netAmount: number;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  student?: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
    section?: { name: string };
  };
  academicYearId: string;
  invoiceNumber: string;
  title: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  fineAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  items?: FeeInvoiceItem[];
  createdAt: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  student?: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string;
  };
  feeInvoiceId?: string;
  feeInvoice?: FeeInvoice;
  receiptNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
  transactionReference?: string;
  chequeNumber?: string;
  bankName?: string;
  status: 'SUCCESS' | 'PENDING' | 'BOUNCED' | 'REVERSED';
  remarks?: string;
  receivedBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface FeeLedgerEntry {
  id: string;
  studentId: string;
  academicYearId: string;
  transactionDate: string;
  entryType: 'DEBIT' | 'CREDIT';
  category: 'INVOICE' | 'PAYMENT' | 'DISCOUNT' | 'WAIVER' | 'FINE' | 'REFUND' | 'ADJUSTMENT';
  feeType?: FeeType;
  feeInvoice?: FeeInvoice;
  feePayment?: FeePayment;
  amount: number;
  balanceAfter: number;
  referenceNumber?: string;
  description: string;
  createdAt: string;
}

export interface FeeSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: string;
}

export interface FeeInvoiceListResponse {
  items: FeeInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeePaymentListResponse {
  items: FeePayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const feeService = {
  // Fee Types
  getFeeTypes: async (): Promise<FeeType[]> => {
    const res = await apiClient.get('/fees/types');
    return res.data.data || res.data;
  },

  createFeeType: async (data: Partial<FeeType>): Promise<FeeType> => {
    const res = await apiClient.post('/fees/types', data);
    return res.data.data || res.data;
  },

  updateFeeType: async (id: string, data: Partial<FeeType>): Promise<FeeType> => {
    const res = await apiClient.patch(`/fees/types/${id}`, data);
    return res.data.data || res.data;
  },

  // Fee Structures
  getFeeStructures: async (academicYearId?: string): Promise<FeeStructure[]> => {
    const res = await apiClient.get('/fees/structures', { params: { academicYearId } });
    return res.data.data || res.data;
  },

  getFeeStructureById: async (id: string): Promise<FeeStructure> => {
    const res = await apiClient.get(`/fees/structures/${id}`);
    return res.data.data || res.data;
  },

  createFeeStructure: async (data: any): Promise<FeeStructure> => {
    const res = await apiClient.post('/fees/structures', data);
    return res.data.data || res.data;
  },

  // Fee Discounts
  getDiscounts: async (): Promise<FeeDiscount[]> => {
    const res = await apiClient.get('/fees/discounts');
    return res.data.data || res.data;
  },

  createDiscount: async (data: Partial<FeeDiscount>): Promise<FeeDiscount> => {
    const res = await apiClient.post('/fees/discounts', data);
    return res.data.data || res.data;
  },

  // Invoices
  getInvoices: async (params?: {
    studentId?: string;
    academicYearId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<FeeInvoiceListResponse> => {
    const res = await apiClient.get('/fees/invoices', { params });
    return res.data.data || res.data;
  },

  getInvoiceById: async (id: string): Promise<FeeInvoice> => {
    const res = await apiClient.get(`/fees/invoices/${id}`);
    return res.data.data || res.data;
  },

  generateInvoice: async (data: any): Promise<FeeInvoice> => {
    const res = await apiClient.post('/fees/invoices', data);
    return res.data.data || res.data;
  },

  // Payments
  getPayments: async (params?: {
    studentId?: string;
    page?: number;
    limit?: number;
  }): Promise<FeePaymentListResponse> => {
    const res = await apiClient.get('/fees/payments', { params });
    return res.data.data || res.data;
  },

  getPaymentById: async (id: string): Promise<FeePayment> => {
    const res = await apiClient.get(`/fees/payments/${id}`);
    return res.data.data || res.data;
  },

  collectPayment: async (data: any): Promise<FeePayment> => {
    const res = await apiClient.post('/fees/payments', data);
    return res.data.data || res.data;
  },

  // Ledger & Summary
  getStudentLedger: async (studentId: string): Promise<FeeLedgerEntry[]> => {
    const res = await apiClient.get(`/fees/ledgers/student/${studentId}`);
    return res.data.data || res.data;
  },

  getFeeSummary: async (): Promise<FeeSummary> => {
    const res = await apiClient.get('/fees/summary');
    return res.data.data || res.data;
  },
};
