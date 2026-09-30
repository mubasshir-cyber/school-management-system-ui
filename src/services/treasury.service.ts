import { apiClient } from '../lib/api-client';

export interface TreasuryAccount {
  id: string;
  accountName: string;
  accountType: 'BANK' | 'CASH' | 'PETTY_CASH' | 'ONLINE_WALLET';
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  ifscCode?: string;
  openingBalance: number;
  currentBalance: number;
  description?: string;
  status: string;
  createdAt: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
}

export interface IncomeTransaction {
  id: string;
  incomeCategoryId: string;
  incomeCategory?: IncomeCategory;
  treasuryAccountId?: string;
  treasuryAccount?: TreasuryAccount;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  payerName?: string;
  receiptNumber?: string;
  documentUrl?: string;
  notes?: string;
  receivedBy?: { firstName: string; lastName: string };
  status: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
}

export interface Expense {
  id: string;
  expenseCategoryId: string;
  expenseCategory?: ExpenseCategory;
  treasuryAccountId?: string;
  treasuryAccount?: TreasuryAccount;
  title: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  voucherNumber: string;
  payeeName?: string;
  vendorName?: string;
  invoiceNumber?: string;
  documentUrl?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  notes?: string;
  requestedBy?: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string };
  approvedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
  createdAt: string;
}

export interface TreasurySummary {
  totalInflow: number;
  totalOutflow: number;
  netLiquidity: number;
  totalAccountBalance: number;
  feeInflow: number;
  nonFeeInflow: number;
  payrollOutflow: number;
  expenseOutflow: number;
}

export interface CashFlowItem {
  id: string;
  date: string;
  type: 'INFLOW' | 'OUTFLOW';
  category: string;
  title: string;
  reference?: string;
  amount: number;
  method: string;
  status?: string;
}

export interface IncomeListResponse {
  items: IncomeTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  items: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const treasuryService = {
  // Accounts
  getAccounts: async (): Promise<TreasuryAccount[]> => {
    const res = await apiClient.get('/treasury/accounts');
    return res.data.data || res.data;
  },

  createAccount: async (data: Partial<TreasuryAccount>): Promise<TreasuryAccount> => {
    const res = await apiClient.post('/treasury/accounts', data);
    return res.data.data || res.data;
  },

  // Income Categories
  getIncomeCategories: async (): Promise<IncomeCategory[]> => {
    const res = await apiClient.get('/treasury/income-categories');
    return res.data.data || res.data;
  },

  createIncomeCategory: async (data: Partial<IncomeCategory>): Promise<IncomeCategory> => {
    const res = await apiClient.post('/treasury/income-categories', data);
    return res.data.data || res.data;
  },

  // Income Transactions
  getIncomes: async (params?: {
    incomeCategoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<IncomeListResponse> => {
    const res = await apiClient.get('/treasury/incomes', { params });
    return res.data.data || res.data;
  },

  recordIncome: async (data: any): Promise<IncomeTransaction> => {
    const res = await apiClient.post('/treasury/incomes', data);
    return res.data.data || res.data;
  },

  // Expense Categories
  getExpenseCategories: async (): Promise<ExpenseCategory[]> => {
    const res = await apiClient.get('/treasury/expense-categories');
    return res.data.data || res.data;
  },

  createExpenseCategory: async (data: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    const res = await apiClient.post('/treasury/expense-categories', data);
    return res.data.data || res.data;
  },

  // Expenses
  getExpenses: async (params?: {
    expenseCategoryId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ExpenseListResponse> => {
    const res = await apiClient.get('/treasury/expenses', { params });
    return res.data.data || res.data;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const res = await apiClient.get(`/treasury/expenses/${id}`);
    return res.data.data || res.data;
  },

  createExpense: async (data: any): Promise<Expense> => {
    const res = await apiClient.post('/treasury/expenses', data);
    return res.data.data || res.data;
  },

  reviewExpense: async (id: string, data: { status: string; rejectionReason?: string }): Promise<Expense> => {
    const res = await apiClient.patch(`/treasury/expenses/${id}/review`, data);
    return res.data.data || res.data;
  },

  disburseExpense: async (id: string): Promise<Expense> => {
    const res = await apiClient.post(`/treasury/expenses/${id}/disburse`);
    return res.data.data || res.data;
  },

  // Summary & Cash Flow
  getTreasurySummary: async (): Promise<TreasurySummary> => {
    const res = await apiClient.get('/treasury/summary');
    return res.data.data || res.data;
  },

  getCashFlowLedger: async (): Promise<CashFlowItem[]> => {
    const res = await apiClient.get('/treasury/cashflow');
    return res.data.data || res.data;
  },
};
