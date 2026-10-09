'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Printer,
  CreditCard,
  ArrowLeft,
  DollarSign,
  TrendingDown,
  TrendingUp,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { feeService, FeeLedgerEntry } from '../../../../../services/fee.service';
import { studentService } from '../../../../../services/student.service';
import { PageHeader } from '../../../../../components/ui/page-header';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Card } from '../../../../../components/ui/card';
import { DataTable, Column } from '../../../../../components/tables/data-table';

export default function StudentLedgerPage() {
  const params = useParams();
  const studentId = params.id as string;

  // Queries
  const { data: student } = useQuery({
    queryKey: ['student-details-ledger', studentId],
    queryFn: () => studentService.getStudent(studentId),
  });

  const { data: ledgerData = [] } = useQuery({
    queryKey: ['student-fee-ledger', studentId],
    queryFn: () => feeService.getStudentLedger(studentId),
  });

  const ledgerEntries = ledgerData;

  const totalDebited = ledgerEntries
    .filter((e) => e.entryType === 'DEBIT')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalCredited = ledgerEntries
    .filter((e) => e.entryType === 'CREDIT')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netBalance = totalDebited - totalCredited;

  const columns: Column<FeeLedgerEntry>[] = [
    {
      key: 'transactionDate',
      header: 'Date',
      sortable: true,
      className: 'w-28',
      render: (row) => (
        <span className="text-xs text-[#667085]">
          {new Date(row.transactionDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => {
        if (row.category === 'INVOICE') return <Badge variant="neutral">Invoice (Debit)</Badge>;
        if (row.category === 'PAYMENT') return <Badge variant="success">Payment (Credit)</Badge>;
        if (row.category === 'DISCOUNT') return <Badge variant="primary">Concession</Badge>;
        if (row.category === 'FINE') return <Badge variant="danger">Late Fine</Badge>;
        return <Badge variant="warning">{row.category}</Badge>;
      },
    },
    {
      key: 'referenceNumber',
      header: 'Ref / Receipt #',
      render: (row) => (
        <span className="font-mono text-xs text-[#2563EB] font-medium">
          {row.referenceNumber || 'N/A'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Particulars & Description',
      render: (row) => (
        <p className="text-xs text-[#172033] font-medium max-w-sm">{row.description}</p>
      ),
    },
    {
      key: 'debit',
      header: 'Debit (₹ Charges)',
      className: 'text-right',
      render: (row) =>
        row.entryType === 'DEBIT' ? (
          <span className="font-bold text-xs text-[#EF4444]">
            ₹{Number(row.amount).toLocaleString()}
          </span>
        ) : (
          <span className="text-[#98A2B3] text-xs">-</span>
        ),
    },
    {
      key: 'credit',
      header: 'Credit (₹ Paid)',
      className: 'text-right',
      render: (row) =>
        row.entryType === 'CREDIT' ? (
          <span className="font-bold text-xs text-[#10B981]">
            ₹{Number(row.amount).toLocaleString()}
          </span>
        ) : (
          <span className="text-[#98A2B3] text-xs">-</span>
        ),
    },
    {
      key: 'balanceAfter',
      header: 'Running Balance',
      className: 'text-right font-mono font-bold',
      render: (row) => (
        <span
          className={`text-xs ${
            Number(row.balanceAfter) > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'
          }`}
        >
          ₹{Number(row.balanceAfter).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Student Double-Entry Financial Ledger"
        description="Immutable audit trail of all invoices, payments, concessions, and real-time running balances."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Ledger' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/fees">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Fee Hub
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Statement
            </Button>
            <Link href={`/fees/collect`}>
              <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                Collect Fee
              </Button>
            </Link>
          </div>
        }
      />

      {/* Student Profile Card */}
      <Card className="p-4 bg-white border border-[#E5EAF1] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-lg">
            {student?.firstName?.charAt(0) || 'S'}
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#172033]">
              {student ? `${student.firstName} ${student.lastName}` : 'Ahmed Khan'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[#667085] mt-0.5">
              <span className="font-mono">{student?.studentCode || 'STU-2026-0001'}</span>
              <span>•</span>
              <span>Class: Grade 5 - Section A</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] text-[#667085] block">Total Billed:</span>
            <span className="font-bold text-sm text-[#172033]">₹{totalDebited.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#667085] block">Total Settled:</span>
            <span className="font-bold text-sm text-[#10B981]">₹{totalCredited.toLocaleString()}</span>
          </div>
          <div className="pl-4 border-l border-[#E5EAF1]">
            <span className="text-[11px] text-[#667085] block">Current Balance:</span>
            <span className={`font-extrabold text-base ${netBalance > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
              ₹{netBalance.toLocaleString()} {netBalance > 0 ? 'Due' : 'Cleared'}
            </span>
          </div>
        </div>
      </Card>

      {/* Ledger DataTable */}
      <DataTable
        columns={columns}
        data={ledgerEntries}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Filter transactions..."
      />
    </div>
  );
}
