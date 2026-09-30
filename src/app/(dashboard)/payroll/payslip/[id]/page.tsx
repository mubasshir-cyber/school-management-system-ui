'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Download,
} from 'lucide-react';
import { payrollService, PayrollItem } from '../../../../../services/payroll.service';
import { PageHeader } from '../../../../../components/ui/page-header';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Card } from '../../../../../components/ui/card';

export default function PrintablePayslipPage() {
  const params = useParams();
  const itemId = params.id as string;

  const { data: payslip } = useQuery({
    queryKey: ['payslip-detail', itemId],
    queryFn: () => payrollService.getPayslip(itemId),
  });

  const sampleSlip: PayrollItem = {
    id: itemId,
    payrollId: 'pay-1',
    staffId: 'staff-1',
    staff: {
      id: 'staff-1',
      employeeCode: 'EMP-2026-0001',
      firstName: 'Dr. Robert',
      lastName: 'Jenkins',
      department: { name: 'Mathematics Department' },
      designation: { title: 'Senior Post-Graduate Teacher' },
    },
    basicSalary: 30000,
    totalEarnings: 60000,
    totalDeductions: 3800,
    unpaidLeavesCount: 0,
    lopDeductionAmount: 0,
    netSalary: 56200,
    breakdown: {
      earnings: [
        { name: 'Basic Pay (50%)', amount: 30000 },
        { name: 'House Rent Allowance (HRA 40%)', amount: 12000 },
        { name: 'Special Allowance', amount: 18000 },
      ],
      deductions: [
        { name: 'Employees Provident Fund (EPF 12%)', amount: 3600 },
        { name: 'Professional Tax (PT)', amount: 200 },
      ],
    },
    status: 'PAID',
    createdAt: '2026-09-30T10:00:00Z',
  };

  const item = payslip || sampleSlip;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="print:hidden">
        <PageHeader
          title="Monthly Salary Payslip"
          description={`Employee: ${item.staff?.firstName} ${item.staff?.lastName} (${item.staff?.employeeCode})`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Payroll', href: '/payroll' },
            { label: 'Payslip' },
          ]}
          actions={
            <div className="flex items-center gap-2.5">
              <Link href="/payroll">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Back
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print / Save PDF
              </Button>
            </div>
          }
        />
      </div>

      {/* Official Payslip Card */}
      <Card className="p-8 bg-white border border-[#E5EAF1] shadow-sm font-sans space-y-6">
        {/* Institutional Header */}
        <div className="text-center border-b border-[#E5EAF1] pb-5 space-y-1">
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">
            GREENWOOD INTERNATIONAL ACADEMY
          </h2>
          <p className="text-xs text-[#667085]">
            Plot 42, Knowledge Park III, Silicon Valley • CBSE Affiliation No: 1130492
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-[#F8FAFC] border border-[#E5EAF1] text-xs font-bold text-[#2563EB] rounded-full uppercase tracking-wider">
              SALARY PAYSLIP FOR SEPTEMBER 2026
            </span>
          </div>
        </div>

        {/* Employee Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8FAFC] rounded-xl text-xs">
          <div>
            <span className="text-[#667085] block text-[11px]">Employee Name:</span>
            <span className="font-bold text-[#172033]">
              {item.staff?.firstName} {item.staff?.lastName}
            </span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Employee Code:</span>
            <span className="font-mono font-bold text-[#2563EB]">{item.staff?.employeeCode}</span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Department:</span>
            <span className="font-medium text-[#172033]">
              {item.staff?.department?.name || 'Mathematics'}
            </span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Designation:</span>
            <span className="font-medium text-[#172033]">
              {item.staff?.designation?.title || 'Senior Teacher'}
            </span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Bank Name:</span>
            <span className="font-medium text-[#172033]">HDFC Bank Ltd.</span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Account No:</span>
            <span className="font-mono text-[#172033]">•••• •••• 9012</span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Payable Days:</span>
            <span className="font-bold text-[#10B981]">30 Days</span>
          </div>
          <div>
            <span className="text-[#667085] block text-[11px]">Unpaid LOP Days:</span>
            <span className="font-bold text-[#EF4444]">{item.unpaidLeavesCount || 0} Days</span>
          </div>
        </div>

        {/* Double Column Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Earnings */}
          <div className="border border-[#E5EAF1] rounded-xl overflow-hidden">
            <div className="p-3 bg-[#ECFDF5] border-b border-[#A7F3D0] font-bold text-xs text-[#065F46] flex justify-between">
              <span>EARNINGS (ALLOWANCES)</span>
              <span>AMOUNT (₹)</span>
            </div>
            <div className="p-3 space-y-2.5 text-xs divide-y divide-[#F2F4F7]">
              {item.breakdown?.earnings?.map((e, idx) => (
                <div key={idx} className="flex justify-between pt-1.5">
                  <span className="text-[#475467]">{e.name}</span>
                  <span className="font-semibold text-[#172033]">
                    ₹{Number(e.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E5EAF1] font-bold text-xs flex justify-between">
              <span>Gross Earnings:</span>
              <span className="text-[#10B981]">₹{Number(item.totalEarnings).toLocaleString()}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-[#E5EAF1] rounded-xl overflow-hidden">
            <div className="p-3 bg-[#FEF2F2] border-b border-[#FECACA] font-bold text-xs text-[#991B1B] flex justify-between">
              <span>DEDUCTIONS & RECOVERIES</span>
              <span>AMOUNT (₹)</span>
            </div>
            <div className="p-3 space-y-2.5 text-xs divide-y divide-[#F2F4F7]">
              {item.breakdown?.deductions?.map((d, idx) => (
                <div key={idx} className="flex justify-between pt-1.5">
                  <span className="text-[#475467]">{d.name}</span>
                  <span className="font-semibold text-[#EF4444]">
                    ₹{Number(d.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E5EAF1] font-bold text-xs flex justify-between">
              <span>Total Deductions:</span>
              <span className="text-[#EF4444]">-₹{Number(item.totalDeductions).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#1E40AF] font-bold uppercase block">
              Net Disbursed Take-Home Salary
            </span>
            <p className="text-[11px] text-[#667085] mt-0.5">
              Fifty-Six Thousand Two Hundred Rupees Only
            </p>
          </div>
          <div className="text-2xl font-extrabold text-[#2563EB]">
            ₹{Number(item.netSalary).toLocaleString()}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-[#E5EAF1] grid grid-cols-2 text-center text-xs text-[#667085]">
          <div>
            <div className="w-40 border-b border-dashed border-[#98A2B3] mx-auto mb-1"></div>
            <span>Employer / Principal Signature</span>
          </div>
          <div>
            <div className="w-40 border-b border-dashed border-[#98A2B3] mx-auto mb-1"></div>
            <span>Employee Signature / Acknowledgement</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
