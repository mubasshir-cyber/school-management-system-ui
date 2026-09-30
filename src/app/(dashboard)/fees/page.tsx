'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  CreditCard,
  Download,
  Eye,
  PlusCircle,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { feeService, FeeInvoice, FeePayment, FeeType } from '../../../services/fee.service';
import { studentService } from '../../../services/student.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { DataTable, Column } from '../../../components/tables/data-table';

export default function FeesHubPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'PAYMENTS'>('INVOICES');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  // New Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    academicYearId: '00000000-0000-0000-0000-000000000001',
    title: 'Monthly Tuition & Transport Fee',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    feeTypeId: '',
    amount: 5000,
    discountAmount: 0,
    notes: 'Standard academic term fee invoice',
  });

  // Queries
  const { data: summaryData } = useQuery({
    queryKey: ['fee-summary'],
    queryFn: () => feeService.getFeeSummary(),
  });

  const { data: invoicesData, refetch: refetchInvoices } = useQuery({
    queryKey: ['fee-invoices', statusFilter],
    queryFn: () =>
      feeService.getInvoices({
        status: statusFilter || undefined,
        limit: 50,
      }),
  });

  const { data: paymentsData, refetch: refetchPayments } = useQuery({
    queryKey: ['fee-payments'],
    queryFn: () => feeService.getPayments({ limit: 50 }),
  });

  const { data: feeTypes = [] } = useQuery({
    queryKey: ['fee-types'],
    queryFn: () => feeService.getFeeTypes(),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-fee-dropdown'],
    queryFn: () => studentService.getStudents({ limit: 50 }),
  });

  // Sample data fallback for mockups
  const sampleInvoices: FeeInvoice[] = [
    {
      id: '1',
      studentId: 'stu-1',
      student: {
        id: 'stu-1',
        studentCode: 'STU-2026-0001',
        firstName: 'Ahmed',
        lastName: 'Khan',
        class: { name: 'Grade 5' },
        section: { name: 'A' },
      },
      academicYearId: 'ay-1',
      invoiceNumber: 'INV-2026-00101',
      title: 'Term 1 Tuition & Computer Fee',
      invoiceDate: '2026-08-01',
      dueDate: '2026-08-15',
      subtotal: 7500,
      discountAmount: 500,
      fineAmount: 0,
      totalAmount: 7000,
      paidAmount: 7000,
      balanceAmount: 0,
      status: 'PAID',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: '2',
      studentId: 'stu-2',
      student: {
        id: 'stu-2',
        studentCode: 'STU-2026-0002',
        firstName: 'Priya',
        lastName: 'Sharma',
        class: { name: 'Grade 5' },
        section: { name: 'A' },
      },
      academicYearId: 'ay-1',
      invoiceNumber: 'INV-2026-00102',
      title: 'Term 1 Tuition Fee',
      invoiceDate: '2026-08-01',
      dueDate: '2026-08-15',
      subtotal: 5000,
      discountAmount: 0,
      fineAmount: 0,
      totalAmount: 5000,
      paidAmount: 5000,
      balanceAmount: 0,
      status: 'PAID',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: '3',
      studentId: 'stu-3',
      student: {
        id: 'stu-3',
        studentCode: 'STU-2026-0003',
        firstName: 'Rohan',
        lastName: 'Patel',
        class: { name: 'Grade 5' },
        section: { name: 'A' },
      },
      academicYearId: 'ay-1',
      invoiceNumber: 'INV-2026-00103',
      title: 'Term 1 Tuition & Lab Fee',
      invoiceDate: '2026-08-01',
      dueDate: '2026-08-15',
      subtotal: 6200,
      discountAmount: 0,
      fineAmount: 200,
      totalAmount: 6400,
      paidAmount: 3000,
      balanceAmount: 3400,
      status: 'PARTIALLY_PAID',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: '4',
      studentId: 'stu-4',
      student: {
        id: 'stu-4',
        studentCode: 'STU-2026-0004',
        firstName: 'Sara',
        lastName: 'Ali',
        class: { name: 'Grade 5' },
        section: { name: 'A' },
      },
      academicYearId: 'ay-1',
      invoiceNumber: 'INV-2026-00104',
      title: 'Term 1 Tuition Fee',
      invoiceDate: '2026-08-01',
      dueDate: '2026-08-15',
      subtotal: 5000,
      discountAmount: 0,
      fineAmount: 0,
      totalAmount: 5000,
      paidAmount: 0,
      balanceAmount: 5000,
      status: 'UNPAID',
      createdAt: '2026-08-01T08:00:00Z',
    },
  ];

  const samplePayments: FeePayment[] = [
    {
      id: '1',
      studentId: 'stu-1',
      student: {
        id: 'stu-1',
        studentCode: 'STU-2026-0001',
        firstName: 'Ahmed',
        lastName: 'Khan',
      },
      receiptNumber: 'REC-2026-00142',
      paymentDate: '2026-08-10',
      amount: 7000,
      paymentMethod: 'UPI',
      transactionReference: 'UPI/9823481239',
      status: 'SUCCESS',
      remarks: 'Term 1 fee online settlement',
      createdAt: '2026-08-10T10:30:00Z',
    },
    {
      id: '2',
      studentId: 'stu-2',
      student: {
        id: 'stu-2',
        studentCode: 'STU-2026-0002',
        firstName: 'Priya',
        lastName: 'Sharma',
      },
      receiptNumber: 'REC-2026-00141',
      paymentDate: '2026-08-09',
      amount: 5000,
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      remarks: 'Paid at school fee counter',
      createdAt: '2026-08-09T14:15:00Z',
    },
    {
      id: '3',
      studentId: 'stu-3',
      student: {
        id: 'stu-3',
        studentCode: 'STU-2026-0003',
        firstName: 'Rohan',
        lastName: 'Patel',
      },
      receiptNumber: 'REC-2026-00140',
      paymentDate: '2026-08-08',
      amount: 3000,
      paymentMethod: 'CARD',
      transactionReference: 'POS-TXN-49102',
      status: 'SUCCESS',
      remarks: 'Part payment',
      createdAt: '2026-08-08T11:45:00Z',
    },
  ];

  const invoices =
    invoicesData?.items && invoicesData.items.length > 0 ? invoicesData.items : sampleInvoices;
  const payments =
    paymentsData?.items && paymentsData.items.length > 0 ? paymentsData.items : samplePayments;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feeService.generateInvoice({
        studentId:
          invoiceForm.studentId || (studentsData?.items?.[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
        academicYearId: invoiceForm.academicYearId,
        title: invoiceForm.title,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes,
        items: [
          {
            feeTypeId:
              invoiceForm.feeTypeId || (feeTypes[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
            amount: Number(invoiceForm.amount) || 5000,
            discountAmount: Number(invoiceForm.discountAmount) || 0,
          },
        ],
      });
      setIsInvoiceModalOpen(false);
      refetchInvoices();
    } catch {
      setIsInvoiceModalOpen(false);
    }
  };

  const invoiceColumns: Column<FeeInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice No.',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[#2563EB] font-semibold">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'student',
      header: 'Student Details',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">
            {row.student ? `${row.student.firstName} ${row.student.lastName}` : 'Student'}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.student?.studentCode}</span>
            <span>•</span>
            <span>{row.student?.class?.name || 'Grade 5'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Fee Description',
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-[#172033]">{row.title}</p>
          <span className="text-[11px] text-[#667085]">Due: {row.dueDate}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Total / Balance',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-[#172033] text-xs lg:text-sm">
            ₹{Number(row.totalAmount).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#EF4444] font-medium">
            ₹{Number(row.balanceAmount).toLocaleString()} Pending
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.status === 'PAID') return <Badge variant="success">Paid</Badge>;
        if (row.status === 'PARTIALLY_PAID') return <Badge variant="warning">Partial</Badge>;
        if (row.status === 'OVERDUE') return <Badge variant="danger">Overdue</Badge>;
        return <Badge variant="neutral">Unpaid</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-28 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/fees/ledger/${row.studentId}`}>
            <button
              className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
              title="Student Financial Ledger"
            >
              <Layers className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => setSelectedInvoice(row)}
            className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
            title="View Invoice Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const paymentColumns: Column<FeePayment>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt No.',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[#10B981] font-semibold">
          {row.receiptNumber}
        </span>
      ),
    },
    {
      key: 'student',
      header: 'Student Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">
            {row.student ? `${row.student.firstName} ${row.student.lastName}` : 'Student'}
          </span>
          <span className="font-mono text-[11px] text-[#98A2B3] ml-2">
            ({row.student?.studentCode})
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-[#10B981] text-xs lg:text-sm">
          ₹{Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (row) => (
        <Badge variant="primary" className="text-xs">
          {row.paymentMethod}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (row) => <span className="text-xs text-[#667085]">{row.paymentDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-20 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedReceipt(row)}
            className="p-1.5 text-[#667085] hover:text-[#10B981] hover:bg-[#ECFDF5] rounded-lg transition-colors cursor-pointer"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Fee Engine & Double-Entry Ledger"
        description="Manage fee heads, invoice schedules, live student financial ledgers, and POS receipts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Hub' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/fees/structures">
              <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                Fee Structures
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInvoiceModalOpen(true)}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Generate Invoice
            </Button>
            <Link href="/fees/collect">
              <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                + Collect Fee
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total Invoiced</p>
            <h4 className="text-xl font-bold text-[#172033] mt-0.5">
              ₹{(summaryData?.totalInvoiced || 4520000).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total Collected</p>
            <h4 className="text-xl font-bold text-[#10B981] mt-0.5">
              ₹{(summaryData?.totalCollected || 3840000).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Outstanding Arrears</p>
            <h4 className="text-xl font-bold text-[#EF4444] mt-0.5">
              ₹{(summaryData?.totalPending || 680000).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Recovery Rate</p>
            <h4 className="text-xl font-bold text-[#D97706] mt-0.5">
              {summaryData?.collectionRate || '84.9%'}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF1] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('INVOICES')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'INVOICES'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
          }`}
        >
          Fee Invoices ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'PAYMENTS'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
          }`}
        >
          Payment Receipts ({payments.length})
        </button>
      </div>

      {/* Main Table */}
      {activeTab === 'INVOICES' ? (
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoice #, student name, or code..."
          filterSlot={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#172033]"
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          }
        />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search receipt #, student name..."
        />
      )}

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Fee Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Select Student</label>
            <select
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            >
              <option value="">Select Student...</option>
              {studentsData?.items?.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Invoice Title</label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Fee Head</label>
              <select
                value={invoiceForm.feeTypeId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, feeTypeId: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                <option value="">Select Fee Type...</option>
                {feeTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Amount (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={invoiceForm.amount}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={invoiceForm.invoiceDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Due Date</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInvoiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Generate & Post to Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Student:</span>
                <span className="font-semibold text-[#172033]">
                  {selectedInvoice.student?.firstName} {selectedInvoice.student?.lastName} (
                  {selectedInvoice.student?.studentCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Invoice Date:</span>
                <span>{selectedInvoice.invoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Due Date:</span>
                <span className="font-semibold text-[#EF4444]">{selectedInvoice.dueDate}</span>
              </div>
              <div className="pt-2 border-t border-[#E5EAF1] flex justify-between font-bold text-sm">
                <span>Total Due:</span>
                <span className="text-[#2563EB]">
                  ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#10B981]">
                <span>Paid So Far:</span>
                <span>₹{Number(selectedInvoice.paidAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-[#EF4444] font-bold">
                <span>Balance:</span>
                <span>₹{Number(selectedInvoice.balanceAmount).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href={`/fees/ledger/${selectedInvoice.studentId}`}>
                <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                  View Full Ledger
                </Button>
              </Link>
              <Link href={`/fees/collect?invoiceId=${selectedInvoice.id}`}>
                <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                  Pay Invoice
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Receipt Preview Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Fee Receipt"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="p-5 bg-white border border-[#E5EAF1] rounded-xl text-center space-y-3 font-sans">
              <div className="border-b border-[#E5EAF1] pb-3">
                <h3 className="font-bold text-base text-[#172033]">GREENWOOD INTERNATIONAL ACADEMY</h3>
                <p className="text-[11px] text-[#667085]">Affiliated to State Board • Institutional Code: EDUSYNC-9042</p>
                <div className="inline-block mt-2 px-2.5 py-0.5 bg-[#ECFDF5] text-[#10B981] font-mono text-xs font-bold rounded-full border border-[#A7F3D0]">
                  OFFICIAL PAYMENT RECEIPT
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs pt-1">
                <div>
                  <span className="text-[#667085] block text-[11px]">Receipt No:</span>
                  <span className="font-mono font-bold text-[#172033]">{selectedReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Date:</span>
                  <span className="font-semibold text-[#172033]">{selectedReceipt.paymentDate}</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Student:</span>
                  <span className="font-semibold text-[#172033]">
                    {selectedReceipt.student?.firstName} {selectedReceipt.student?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Payment Mode:</span>
                  <span className="font-semibold text-[#2563EB]">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg flex justify-between items-center font-bold text-sm text-[#172033]">
                <span>Amount Paid:</span>
                <span className="text-[#10B981] text-base">₹{Number(selectedReceipt.amount).toLocaleString()}</span>
              </div>

              {selectedReceipt.remarks && (
                <p className="text-[11px] text-[#667085] italic text-left">
                  Note: {selectedReceipt.remarks}
                </p>
              )}

              <div className="pt-4 border-t border-[#E5EAF1] flex justify-between text-[10px] text-[#98A2B3]">
                <span>System Generated Receipt</span>
                <span>Authorized Signature</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
