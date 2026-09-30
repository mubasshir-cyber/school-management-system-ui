'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Printer,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  Send,
  Eye,
  AlertCircle,
  Users,
} from 'lucide-react';
import { payrollService, Payroll, PayrollItem } from '../../../../services/payroll.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function PayrollBatchRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const payrollId = params.id as string;
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);

  // Queries
  const { data: payroll, refetch } = useQuery({
    queryKey: ['payroll-batch-detail', payrollId],
    queryFn: () => payrollService.getPayrollById(payrollId),
  });

  // Sample data fallback
  const sampleItems: PayrollItem[] = [
    {
      id: 'item-1',
      payrollId,
      staffId: 'staff-1',
      staff: {
        id: 'staff-1',
        employeeCode: 'EMP-2026-0001',
        firstName: 'Dr. Robert',
        lastName: 'Jenkins',
        department: { name: 'Mathematics' },
        designation: { title: 'Senior Teacher' },
      },
      basicSalary: 30000,
      totalEarnings: 60000,
      totalDeductions: 3800,
      unpaidLeavesCount: 0,
      lopDeductionAmount: 0,
      netSalary: 56200,
      breakdown: {
        earnings: [
          { name: 'Basic Salary', amount: 30000 },
          { name: 'House Rent Allowance (HRA)', amount: 12000 },
          { name: 'Special Allowance', amount: 18000 },
        ],
        deductions: [
          { name: 'Provident Fund (PF)', amount: 3600 },
          { name: 'Professional Tax', amount: 200 },
        ],
      },
      status: 'PAID',
      createdAt: '2026-09-30T10:00:00Z',
    },
    {
      id: 'item-2',
      payrollId,
      staffId: 'staff-2',
      staff: {
        id: 'staff-2',
        employeeCode: 'EMP-2026-0002',
        firstName: 'Eleanor',
        lastName: 'Pena',
        department: { name: 'Science' },
        designation: { title: 'Department Head' },
      },
      basicSalary: 35000,
      totalEarnings: 70000,
      totalDeductions: 4400,
      unpaidLeavesCount: 0,
      lopDeductionAmount: 0,
      netSalary: 65600,
      breakdown: {
        earnings: [
          { name: 'Basic Salary', amount: 35000 },
          { name: 'House Rent Allowance (HRA)', amount: 14000 },
          { name: 'Special Allowance', amount: 21000 },
        ],
        deductions: [
          { name: 'Provident Fund (PF)', amount: 4200 },
          { name: 'Professional Tax', amount: 200 },
        ],
      },
      status: 'PAID',
      createdAt: '2026-09-30T10:00:00Z',
    },
    {
      id: 'item-3',
      payrollId,
      staffId: 'staff-3',
      staff: {
        id: 'staff-3',
        employeeCode: 'EMP-2026-0003',
        firstName: 'Guy',
        lastName: 'Hawkins',
        department: { name: 'Languages' },
        designation: { title: 'Teacher' },
      },
      basicSalary: 22500,
      totalEarnings: 45000,
      totalDeductions: 4400,
      unpaidLeavesCount: 1,
      lopDeductionAmount: 1500,
      netSalary: 40600,
      breakdown: {
        earnings: [
          { name: 'Basic Salary', amount: 22500 },
          { name: 'House Rent Allowance (HRA)', amount: 9000 },
          { name: 'Special Allowance', amount: 13500 },
        ],
        deductions: [
          { name: 'Provident Fund (PF)', amount: 2700 },
          { name: 'Professional Tax', amount: 200 },
          { name: 'Loss of Pay (1 Day)', amount: 1500 },
        ],
      },
      status: 'PAID',
      createdAt: '2026-09-30T10:00:00Z',
    },
  ];

  const currentPayroll = payroll || {
    id: payrollId,
    month: 9,
    year: 2026,
    payrollTitle: 'Staff Salary Payroll - September 2026',
    totalStaffCount: 3,
    totalGrossAmount: 175000,
    totalDeductionsAmount: 12600,
    totalNetAmount: 162400,
    status: 'CALCULATED' as any,
    items: sampleItems,
  };

  const itemsList = currentPayroll.items || sampleItems;

  const handleApprove = async () => {
    try {
      await payrollService.approvePayroll(payrollId);
      refetch();
    } catch {
      //
    }
  };

  const handleDisburse = async () => {
    try {
      await payrollService.disbursePayroll(payrollId, {
        paymentMethod: 'BANK_TRANSFER',
        transactionReferencePrefix: 'NEFT-SAL',
      });
      refetch();
    } catch {
      //
    }
  };

  const columns: Column<PayrollItem>[] = [
    {
      key: 'employee',
      header: 'Employee Details',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">
            {row.staff?.firstName} {row.staff?.lastName}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.staff?.employeeCode}</span>
            <span>•</span>
            <span>{row.staff?.department?.name || 'Department'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'earnings',
      header: 'Gross Earnings',
      render: (row) => (
        <span className="font-medium text-xs text-[#172033]">
          ₹{Number(row.totalEarnings).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'lop',
      header: 'LOP / Unpaid Days',
      render: (row) =>
        Number(row.unpaidLeavesCount) > 0 ? (
          <span className="text-xs text-[#EF4444] font-semibold">
            {row.unpaidLeavesCount} Day(s) (-₹{Number(row.lopDeductionAmount).toLocaleString()})
          </span>
        ) : (
          <span className="text-xs text-[#98A2B3]">0 Days</span>
        ),
    },
    {
      key: 'deductions',
      header: 'Total Deductions',
      render: (row) => (
        <span className="font-medium text-xs text-[#EF4444]">
          -₹{Number(row.totalDeductions).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'net',
      header: 'Net Payable',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs lg:text-sm text-[#10B981]">
          ₹{Number(row.netSalary).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-28 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/payroll/payslip/${row.id}`}>
            <Button variant="outline" size="sm" className="text-xs py-1 px-2.5" leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Payslip
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={currentPayroll.payrollTitle}
        description={`Period: ${currentPayroll.month}/${currentPayroll.year} • Status: ${currentPayroll.status}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Payroll', href: '/payroll' },
          { label: 'Batch Register' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/payroll">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Batches
              </Button>
            </Link>
            {currentPayroll.status === 'CALCULATED' && (
              <Button
                variant="primary"
                size="sm"
                className="bg-[#2563EB]"
                onClick={handleApprove}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Approve Batch
              </Button>
            )}
            {(currentPayroll.status === 'APPROVED' || currentPayroll.status === 'CALCULATED') && (
              <Button
                variant="primary"
                size="sm"
                className="bg-[#10B981] hover:bg-[#059669]"
                onClick={handleDisburse}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Disburse All Salaries
              </Button>
            )}
          </div>
        }
      />

      {/* Batch Summary Header Card */}
      <Card className="p-5 bg-white border border-[#E5EAF1] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#667085]">Batch Status</span>
          <div className="mt-1">
            <Badge variant={currentPayroll.status === 'PAID' ? 'success' : 'warning'}>
              {currentPayroll.status}
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-xs text-[#667085]">Total Employees</span>
          <p className="font-bold text-base text-[#172033] mt-0.5">{currentPayroll.totalStaffCount}</p>
        </div>

        <div>
          <span className="text-xs text-[#667085]">Total Gross Earnings</span>
          <p className="font-bold text-base text-[#172033] mt-0.5">
            ₹{Number(currentPayroll.totalGrossAmount).toLocaleString()}
          </p>
        </div>

        <div>
          <span className="text-xs text-[#667085]">Total Deductions</span>
          <p className="font-bold text-base text-[#EF4444] mt-0.5">
            -₹{Number(currentPayroll.totalDeductionsAmount).toLocaleString()}
          </p>
        </div>

        <div className="pl-4 border-l border-[#E5EAF1]">
          <span className="text-xs text-[#667085]">Net Amount Payable</span>
          <p className="font-extrabold text-xl text-[#10B981] mt-0.5">
            ₹{Number(currentPayroll.totalNetAmount).toLocaleString()}
          </p>
        </div>
      </Card>

      {/* Register DataTable */}
      <DataTable
        columns={columns}
        data={itemsList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name or code..."
      />
    </div>
  );
}
