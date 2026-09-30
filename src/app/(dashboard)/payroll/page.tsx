'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { payrollService, Payroll } from '../../../services/payroll.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { DataTable, Column } from '../../../components/tables/data-table';

export default function PayrollHubPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payrollTitle: `Staff Salary Payroll - ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    notes: 'Monthly institutional faculty & staff payroll calculation with automated LOP deduction.',
  });

  // Queries
  const { data: summaryData } = useQuery({
    queryKey: ['payroll-summary'],
    queryFn: () => payrollService.getPayrollSummary(),
  });

  const { data: payrollsData = [], refetch } = useQuery({
    queryKey: ['payroll-batches'],
    queryFn: () => payrollService.getPayrolls(),
  });

  // Sample data fallback
  const samplePayrolls: Payroll[] = [
    {
      id: '1',
      month: 9,
      year: 2026,
      payrollTitle: 'Faculty & Administrative Staff Payroll - September 2026',
      totalStaffCount: 42,
      totalGrossAmount: 1850000,
      totalDeductionsAmount: 240000,
      totalNetAmount: 1610000,
      status: 'PAID',
      paidAt: '2026-09-30T10:00:00Z',
      createdAt: '2026-09-28T09:00:00Z',
    },
    {
      id: '2',
      month: 8,
      year: 2026,
      payrollTitle: 'Faculty & Administrative Staff Payroll - August 2026',
      totalStaffCount: 42,
      totalGrossAmount: 1850000,
      totalDeductionsAmount: 232000,
      totalNetAmount: 1618000,
      status: 'PAID',
      paidAt: '2026-08-31T10:00:00Z',
      createdAt: '2026-08-28T09:00:00Z',
    },
    {
      id: '3',
      month: 10,
      year: 2026,
      payrollTitle: 'Staff Salary Payroll - October 2026',
      totalStaffCount: 42,
      totalGrossAmount: 1850000,
      totalDeductionsAmount: 228000,
      totalNetAmount: 1622000,
      status: 'CALCULATED',
      createdAt: '2026-09-30T18:00:00Z',
    },
  ];

  const payrollList = payrollsData.length > 0 ? payrollsData : samplePayrolls;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payrollService.generateMonthlyPayroll({
        month: Number(formData.month),
        year: Number(formData.year),
        payrollTitle: formData.payrollTitle,
        notes: formData.notes,
      });
      setIsGenerateModalOpen(false);
      refetch();
    } catch {
      setIsGenerateModalOpen(false);
    }
  };

  const columns: Column<Payroll>[] = [
    {
      key: 'title',
      header: 'Payroll Period & Batch Title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">
            {row.payrollTitle}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">
              {row.month}/{row.year}
            </span>
            <span>•</span>
            <span>{row.totalStaffCount} Employees Processed</span>
          </div>
        </div>
      ),
    },
    {
      key: 'gross',
      header: 'Total Gross',
      render: (row) => (
        <span className="font-medium text-xs text-[#172033]">
          ₹{Number(row.totalGrossAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'deductions',
      header: 'Deductions (PF/Tax/LOP)',
      render: (row) => (
        <span className="font-medium text-xs text-[#EF4444]">
          -₹{Number(row.totalDeductionsAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'net',
      header: 'Net Disbursed',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs lg:text-sm text-[#10B981]">
          ₹{Number(row.totalNetAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.status === 'PAID') return <Badge variant="success">Paid & Disbursed</Badge>;
        if (row.status === 'APPROVED') return <Badge variant="primary">Approved</Badge>;
        if (row.status === 'CALCULATED') return <Badge variant="warning">Calculated (Draft)</Badge>;
        return <Badge variant="neutral">{row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/payroll/${row.id}`}>
            <Button variant="outline" size="sm" className="text-xs py-1 px-2.5" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              View Register
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Faculty & Staff Payroll Engine"
        description="Run monthly payroll with automated attendance LOP sync, statutory deductions, and bulk disbursements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Payroll' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/payroll/structures">
              <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                Salary Structures
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGenerateModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              1-Click Run Payroll
            </Button>
          </div>
        }
      />

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total YTD Disbursed</p>
            <h4 className="text-xl font-bold text-[#10B981] mt-0.5">
              ₹{(summaryData?.totalDisbursed || 14850000).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Active Payroll Staff</p>
            <h4 className="text-xl font-bold text-[#2563EB] mt-0.5">
              {summaryData?.activeStaffCount || 42} Employees
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Latest Run Status</p>
            <h4 className="text-sm font-bold text-[#D97706] mt-1">
              {summaryData?.latestBatch || 'October 2026 (CALCULATED)'}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Monthly Outflow</p>
            <h4 className="text-xl font-bold text-[#172033] mt-0.5">
              ₹{(summaryData?.lastBatchAmount || 1622000).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] text-[#475467] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Batches Table */}
      <DataTable
        columns={columns}
        data={payrollList}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payroll batch title or period..."
      />

      {/* 1-Click Run Payroll Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Execute Monthly Payroll Run"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF] space-y-1">
            <p className="font-bold">⚡ Automated Calculation Engine:</p>
            <p>
              • Automatically calculates basic, HRA, statutory PF (12%), and professional tax.
            </p>
            <p>• Syncs staff monthly attendance and calculates Loss of Pay (LOP) deductions.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Month</label>
              <select
                value={formData.month}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  const monthName = new Date(2026, m - 1).toLocaleString('default', {
                    month: 'long',
                  });
                  setFormData({
                    ...formData,
                    month: m,
                    payrollTitle: `Staff Salary Payroll - ${monthName} ${formData.year}`,
                  });
                }}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Year</label>
              <input
                type="number"
                min="2020"
                max="2035"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: Number(e.target.value),
                    payrollTitle: `Staff Salary Payroll - ${new Date(2026, formData.month - 1).toLocaleString('default', { month: 'long' })} ${e.target.value}`,
                  })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Payroll Batch Title</label>
            <input
              type="text"
              required
              value={formData.payrollTitle}
              onChange={(e) => setFormData({ ...formData, payrollTitle: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Calculate & Generate Register
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
