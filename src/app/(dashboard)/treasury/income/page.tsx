'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowDownLeft,
  Plus,
  ArrowLeft,
  DollarSign,
  Receipt,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { treasuryService, IncomeTransaction, IncomeCategory, TreasuryAccount } from '../../../../services/treasury.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function NonFeeIncomePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    incomeCategoryId: '',
    treasuryAccountId: '',
    title: '',
    amount: 10000,
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    payerName: '',
    referenceNumber: '',
    notes: '',
  });

  // Queries
  const { data: incomesData, refetch } = useQuery({
    queryKey: ['non-fee-incomes', categoryFilter],
    queryFn: () =>
      treasuryService.getIncomes({
        incomeCategoryId: categoryFilter || undefined,
        limit: 50,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['income-categories'],
    queryFn: () => treasuryService.getIncomeCategories(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['treasury-accounts-dropdown'],
    queryFn: () => treasuryService.getAccounts(),
  });

  // Sample data fallback
  const sampleIncomes: IncomeTransaction[] = [
    {
      id: '1',
      incomeCategoryId: 'cat-1',
      incomeCategory: { id: 'cat-1', name: 'Government & Research Grants', code: 'GRANT', status: 'ACTIVE' },
      title: 'State Science & Tech Laboratory Grant',
      amount: 500000,
      transactionDate: '2026-09-29',
      paymentMethod: 'BANK_TRANSFER',
      payerName: 'Department of Higher Education',
      referenceNumber: 'GRANT-2026-04',
      receiptNumber: 'INC-2026-0001',
      status: 'RECEIVED',
      createdAt: '2026-09-29T10:00:00Z',
    },
    {
      id: '2',
      incomeCategoryId: 'cat-2',
      incomeCategory: { id: 'cat-2', name: 'Alumni & Philanthropic Donations', code: 'DONATION', status: 'ACTIVE' },
      title: 'Alumni Sports Complex Renovation Gift',
      amount: 250000,
      transactionDate: '2026-09-25',
      paymentMethod: 'CHEQUE',
      payerName: 'Greenwood Alumni Foundation',
      referenceNumber: 'CHQ-891024',
      receiptNumber: 'INC-2026-0002',
      status: 'RECEIVED',
      createdAt: '2026-09-25T14:30:00Z',
    },
    {
      id: '3',
      incomeCategoryId: 'cat-3',
      incomeCategory: { id: 'cat-3', name: 'Campus Cafeteria & Canteen Lease', code: 'CANTEEN', status: 'ACTIVE' },
      title: 'Monthly Cafeteria Vendor Concession Fee',
      amount: 35000,
      transactionDate: '2026-09-20',
      paymentMethod: 'UPI',
      payerName: 'FreshBites Caterers Pvt Ltd',
      referenceNumber: 'UPI/98124981',
      receiptNumber: 'INC-2026-0003',
      status: 'RECEIVED',
      createdAt: '2026-09-20T11:15:00Z',
    },
  ];

  const incomeList = incomesData?.items && incomesData.items.length > 0 ? incomesData.items : sampleIncomes;

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await treasuryService.recordIncome({
        incomeCategoryId:
          formData.incomeCategoryId || (categories[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
        treasuryAccountId: formData.treasuryAccountId || undefined,
        title: formData.title,
        amount: Number(formData.amount),
        transactionDate: formData.transactionDate,
        paymentMethod: formData.paymentMethod,
        payerName: formData.payerName || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      });
      setIsRecordModalOpen(false);
      refetch();
    } catch {
      setIsRecordModalOpen(false);
    }
  };

  const columns: Column<IncomeTransaction>[] = [
    {
      key: 'title',
      header: 'Income Particulars & Payer',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">{row.title}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] mt-0.5">
            <span>Payer: {row.payerName || 'Direct Deposit'}</span>
            <span>•</span>
            <span className="font-mono">{row.receiptNumber}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <Badge variant="primary" className="text-xs">
          {row.incomeCategory?.name || 'General Income'}
        </Badge>
      ),
    },
    {
      key: 'method',
      header: 'Payment Method & Ref',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-[#172033]">{row.paymentMethod}</span>
          {row.referenceNumber && (
            <p className="font-mono text-[11px] text-[#667085] mt-0.5">{row.referenceNumber}</p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      sortable: true,
      className: 'text-right',
      render: (row) => (
        <span className="font-bold text-xs lg:text-sm text-[#10B981]">
          +₹{Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-xs text-[#667085]">{row.transactionDate}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Non-Fee Institutional Incomes"
        description="Record and track external grants, philanthropic endowments, campus facility rentals, and cafeteria leases."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Treasury', href: '/treasury' },
          { label: 'Income' },
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
              onClick={() => setIsRecordModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Record Non-Fee Income
            </Button>
          </div>
        }
      />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={incomeList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search income title, payer, or receipt #..."
        filterSlot={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
          >
            <option value="">All Income Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Record Income Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Non-Fee Revenue Inflow"
      >
        <form onSubmit={handleRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Income Category</label>
            <select
              value={formData.incomeCategoryId}
              onChange={(e) => setFormData({ ...formData, incomeCategoryId: e.target.value })}
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
            <label className="block text-xs font-medium text-[#344054] mb-1">Transaction Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Lab Equipment Upgrade Grant"
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
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CHEQUE">Cheque Deposit</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Payer / Source</label>
              <input
                type="text"
                placeholder="e.g. Higher Education Ministry"
                value={formData.payerName}
                onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Deposit To Treasury Account</label>
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
              onClick={() => setIsRecordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Record Inflow & Sync
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
