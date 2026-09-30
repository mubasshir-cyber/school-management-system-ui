'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowUpRight,
  Plus,
  ArrowLeft,
  Check,
  X,
  Send,
  Eye,
  FileText,
  DollarSign,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { treasuryService, Expense, ExpenseCategory, TreasuryAccount } from '../../../../services/treasury.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    expenseCategoryId: '',
    treasuryAccountId: '',
    title: '',
    amount: 5000,
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    vendorName: '',
    invoiceNumber: '',
    notes: '',
  });

  // Queries
  const { data: expensesData, refetch } = useQuery({
    queryKey: ['expenses-list', activeTab],
    queryFn: () =>
      treasuryService.getExpenses({
        status: activeTab === 'ALL' ? undefined : activeTab,
        limit: 50,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => treasuryService.getExpenseCategories(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['treasury-accounts-expenses'],
    queryFn: () => treasuryService.getAccounts(),
  });

  // Sample data fallback
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      expenseCategoryId: 'cat-1',
      expenseCategory: { id: 'cat-1', name: 'Campus Maintenance & Repairs', code: 'MAINT', status: 'ACTIVE' },
      title: 'Solar Inverter Annual AMC & Battery Replacement',
      amount: 42000,
      expenseDate: '2026-09-28',
      paymentMethod: 'CHEQUE',
      voucherNumber: 'VOU-2026-0012',
      vendorName: 'SunTech Power Solutions Ltd.',
      invoiceNumber: 'INV-ST-9041',
      status: 'PAID',
      paidAt: '2026-09-28T14:00:00Z',
      createdAt: '2026-09-26T10:00:00Z',
    },
    {
      id: '2',
      expenseCategoryId: 'cat-2',
      expenseCategory: { id: 'cat-2', name: 'Lab Consumables & Reagents', code: 'LAB_CON', status: 'ACTIVE' },
      title: 'Chemistry & Biology Senior Secondary Lab Reagents',
      amount: 18500,
      expenseDate: '2026-09-29',
      paymentMethod: 'BANK_TRANSFER',
      voucherNumber: 'VOU-2026-0013',
      vendorName: 'Apex Scientific Chemicals',
      invoiceNumber: 'INV-ASC-491',
      status: 'APPROVED',
      approvedAt: '2026-09-29T16:00:00Z',
      createdAt: '2026-09-28T11:00:00Z',
    },
    {
      id: '3',
      expenseCategoryId: 'cat-3',
      expenseCategory: { id: 'cat-3', name: 'Electricity & Utilities', code: 'UTIL', status: 'ACTIVE' },
      title: 'State Electricity Board Monthly High-Tension Bill',
      amount: 85400,
      expenseDate: '2026-09-30',
      paymentMethod: 'BANK_TRANSFER',
      voucherNumber: 'VOU-2026-0014',
      vendorName: 'State Electricity Distribution Co.',
      status: 'PENDING',
      createdAt: '2026-09-30T09:00:00Z',
    },
  ];

  const expenseList =
    expensesData?.items && expensesData.items.length > 0 ? expensesData.items : sampleExpenses;

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await treasuryService.createExpense({
        expenseCategoryId:
          formData.expenseCategoryId || (categories[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
        treasuryAccountId: formData.treasuryAccountId || undefined,
        title: formData.title,
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        paymentMethod: formData.paymentMethod,
        vendorName: formData.vendorName || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        notes: formData.notes || undefined,
      });
      setIsClaimModalOpen(false);
      refetch();
    } catch {
      setIsClaimModalOpen(false);
    }
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedExpense) return;
    try {
      await treasuryService.reviewExpense(selectedExpense.id, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      });
      setSelectedExpense(null);
      refetch();
    } catch {
      setSelectedExpense(null);
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      await treasuryService.disburseExpense(id);
      setSelectedExpense(null);
      refetch();
    } catch {
      setSelectedExpense(null);
    }
  };

  const columns: Column<Expense>[] = [
    {
      key: 'title',
      header: 'Voucher Details & Vendor',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">{row.title}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.voucherNumber}</span>
            <span>•</span>
            <span>Vendor: {row.vendorName || 'Direct Expense'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <Badge variant="primary" className="text-xs">
          {row.expenseCategory?.name || 'Operating Expense'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      sortable: true,
      className: 'text-right',
      render: (row) => (
        <span className="font-bold text-xs lg:text-sm text-[#EF4444]">
          -₹{Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.status === 'PAID') return <Badge variant="success">Paid</Badge>;
        if (row.status === 'APPROVED') return <Badge variant="primary">Approved</Badge>;
        if (row.status === 'PENDING') return <Badge variant="warning">Pending Review</Badge>;
        if (row.status === 'REJECTED') return <Badge variant="danger">Rejected</Badge>;
        return <Badge variant="neutral">{row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-28 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-1 px-2.5"
            onClick={() => setSelectedExpense(row)}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Expense Claims & Vouchers"
        description="Submit departmental claims, process multi-level vendor approvals, and disburse petty cash/bank payments."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Treasury', href: '/treasury' },
          { label: 'Expenses' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/treasury">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Treasury Hub
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsClaimModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Submit Expense Claim
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF1] pb-2">
        {(['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({
              tab === 'ALL'
                ? expenseList.length
                : expenseList.filter((e) => e.status === tab).length
            })
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={expenseList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search expense title, voucher #, or vendor..."
      />

      {/* Submit Claim Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Submit New Expense Claim"
      >
        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Expense Category</label>
            <select
              value={formData.expenseCategoryId}
              onChange={(e) => setFormData({ ...formData, expenseCategoryId: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Expense Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Lab Reagent Kits"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="PETTY_CASH">Petty Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Vendor / Payee</label>
              <input
                type="text"
                placeholder="e.g. Apex Scientific Chemicals"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Payment Treasury Account</label>
            <select
              value={formData.treasuryAccountId}
              onChange={(e) => setFormData({ ...formData, treasuryAccountId: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            >
              <option value="">Select Account (Optional)...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountName} ({a.bankName || a.accountType})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClaimModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Claim for Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Expense Modal */}
      <Modal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title={`Review Voucher ${selectedExpense?.voucherNumber}`}
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Title:</span>
                <span className="font-semibold text-[#172033]">{selectedExpense.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Category:</span>
                <span>{selectedExpense.expenseCategory?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Vendor:</span>
                <span>{selectedExpense.vendorName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Amount:</span>
                <span className="font-bold text-sm text-[#EF4444]">
                  ₹{Number(selectedExpense.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Status:</span>
                <Badge variant={selectedExpense.status === 'PAID' ? 'success' : 'warning'}>
                  {selectedExpense.status}
                </Badge>
              </div>
            </div>

            {selectedExpense.status === 'PENDING' && (
              <div>
                <label className="block text-xs font-medium text-[#344054] mb-1">
                  Rejection Reason (If rejecting)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
              {selectedExpense.status === 'PENDING' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2]"
                    onClick={() => handleReview('REJECTED')}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Reject Claim
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#2563EB]"
                    onClick={() => handleReview('APPROVED')}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Approve Expense
                  </Button>
                </>
              )}

              {selectedExpense.status === 'APPROVED' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#10B981] hover:bg-[#059669]"
                  onClick={() => handleDisburse(selectedExpense.id)}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Disburse & Deduct from Treasury
                </Button>
              )}

              {selectedExpense.status === 'PAID' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExpense(null)}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
