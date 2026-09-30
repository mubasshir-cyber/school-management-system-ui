'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileSpreadsheet,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { treasuryService, TreasurySummary, CashFlowItem, TreasuryAccount } from '../../../services/treasury.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { DataTable, Column } from '../../../components/tables/data-table';

export default function TreasuryDashboardPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Queries
  const { data: summaryData } = useQuery({
    queryKey: ['treasury-summary'],
    queryFn: () => treasuryService.getTreasurySummary(),
  });

  const { data: accountsData = [] } = useQuery({
    queryKey: ['treasury-accounts'],
    queryFn: () => treasuryService.getAccounts(),
  });

  const { data: cashFlowData = [] } = useQuery({
    queryKey: ['treasury-cashflow'],
    queryFn: () => treasuryService.getCashFlowLedger(),
  });

  // Sample data fallback
  const sampleAccounts: TreasuryAccount[] = [
    {
      id: 'acc-1',
      accountName: 'HDFC Main Operational Account',
      accountType: 'BANK',
      accountNumber: '50200049182391',
      bankName: 'HDFC Bank Ltd.',
      branchName: 'Knowledge Park Branch',
      openingBalance: 1200000,
      currentBalance: 3450000,
      status: 'ACTIVE',
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'acc-2',
      accountName: 'SBI Development & Grants Account',
      accountType: 'BANK',
      accountNumber: '392019481923',
      bankName: 'State Bank of India',
      branchName: 'City Center Branch',
      openingBalance: 500000,
      currentBalance: 1850000,
      status: 'ACTIVE',
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'acc-3',
      accountName: 'Campus Petty Cash Vault',
      accountType: 'PETTY_CASH',
      openingBalance: 50000,
      currentBalance: 38400,
      status: 'ACTIVE',
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  const sampleCashFlow: CashFlowItem[] = [
    {
      id: '1',
      date: '2026-09-30',
      type: 'INFLOW',
      category: 'Fee Collections',
      title: 'Daily Student Tuition Fee Counter Collection',
      reference: 'REC-2026-00142',
      amount: 48500,
      method: 'UPI / CASH',
    },
    {
      id: '2',
      date: '2026-09-30',
      type: 'OUTFLOW',
      category: 'Staff Payroll',
      title: 'Faculty Monthly Salary Disbursement (September 2026)',
      reference: 'NEFT-SAL-0926',
      amount: 1610000,
      method: 'BANK_TRANSFER',
      status: 'PAID',
    },
    {
      id: '3',
      date: '2026-09-29',
      type: 'INFLOW',
      category: 'Government Grant',
      title: 'State Science & Tech Laboratory Upgrade Grant',
      reference: 'GRANT-2026-04',
      amount: 500000,
      method: 'BANK_TRANSFER',
    },
    {
      id: '4',
      date: '2026-09-28',
      type: 'OUTFLOW',
      category: 'Campus Maintenance',
      title: 'Solar Inverter Annual AMC & Battery Replacement',
      reference: 'VOU-2026-0012',
      amount: 42000,
      method: 'CHEQUE',
      status: 'PAID',
    },
  ];

  const accounts = accountsData.length > 0 ? accountsData : sampleAccounts;
  const cashFlowList = cashFlowData.length > 0 ? cashFlowData : sampleCashFlow;

  const summary = summaryData || {
    totalInflow: 4340000,
    totalOutflow: 1652000,
    netLiquidity: 2688000,
    totalAccountBalance: 5338400,
    feeInflow: 3840000,
    nonFeeInflow: 500000,
    payrollOutflow: 1610000,
    expenseOutflow: 42000,
  };

  const columns: Column<CashFlowItem>[] = [
    {
      key: 'date',
      header: 'Date',
      className: 'w-28',
      render: (row) => <span className="text-xs text-[#667085]">{row.date}</span>,
    },
    {
      key: 'type',
      header: 'Flow Type',
      render: (row) => (
        <Badge variant={row.type === 'INFLOW' ? 'success' : 'danger'}>
          {row.type === 'INFLOW' ? '+ Inflow' : '- Outflow'}
        </Badge>
      ),
    },
    {
      key: 'category',
      header: 'Category / Head',
      render: (row) => (
        <span className="font-semibold text-xs text-[#172033]">{row.category}</span>
      ),
    },
    {
      key: 'title',
      header: 'Transaction Details',
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-[#172033]">{row.title}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.reference}</span>
            <span>•</span>
            <span>{row.method}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      className: 'text-right',
      render: (row) => (
        <span
          className={`font-bold text-xs lg:text-sm ${
            row.type === 'INFLOW' ? 'text-[#10B981]' : 'text-[#EF4444]'
          }`}
        >
          {row.type === 'INFLOW' ? '+' : '-'}₹{Number(row.amount).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Institutional Treasury & Cash Flow"
        description="Reconcile daily fee revenues, external income grants, payroll outlays, and operational expenses in real-time."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Treasury' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/treasury/categories">
              <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                Categories
              </Button>
            </Link>
            <Link href="/treasury/income">
              <Button variant="outline" size="sm" leftIcon={<ArrowDownLeft className="w-3.5 h-3.5 text-[#10B981]" />}>
                + Record Income
              </Button>
            </Link>
            <Link href="/treasury/expenses">
              <Button variant="primary" size="sm" leftIcon={<ArrowUpRight className="w-3.5 h-3.5 text-white" />}>
                + Submit Expense Claim
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Financial Liquidity KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total Revenue Inflows</p>
            <h4 className="text-xl font-bold text-[#10B981] mt-0.5">
              ₹{Number(summary.totalInflow).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total Outflows & Payroll</p>
            <h4 className="text-xl font-bold text-[#EF4444] mt-0.5">
              ₹{Number(summary.totalOutflow).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Net Monthly Liquidity</p>
            <h4 className="text-xl font-bold text-[#2563EB] mt-0.5">
              ₹{Number(summary.netLiquidity).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#667085] font-medium">Total Treasury Reserves</p>
            <h4 className="text-xl font-bold text-[#172033] mt-0.5">
              ₹{Number(summary.totalAccountBalance).toLocaleString()}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] text-[#475467] flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Treasury Accounts Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[#172033]">Institutional Bank Accounts & Vaults</h4>
          <span className="text-xs text-[#667085]">{accounts.length} Active Accounts</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className="p-4 border border-[#E5EAF1] bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={acc.accountType === 'BANK' ? 'primary' : 'warning'} className="text-[10px]">
                    {acc.accountType}
                  </Badge>
                  <h5 className="font-bold text-xs text-[#172033] mt-2">{acc.accountName}</h5>
                  {acc.accountNumber && (
                    <p className="font-mono text-[11px] text-[#667085] mt-0.5">
                      A/C: •••• {acc.accountNumber.slice(-4)} ({acc.bankName})
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#667085] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#F2F4F7] flex justify-between items-center">
                <span className="text-[11px] text-[#667085]">Current Balance:</span>
                <span className="font-bold text-sm text-[#10B981]">
                  ₹{Number(acc.currentBalance).toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Unified Cash Flow Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[#172033]">Recent Real-Time Cash Flow Transactions</h4>
          <span className="text-xs text-[#667085]">Inflows & Outflows</span>
        </div>
        <DataTable
          columns={columns}
          data={cashFlowList}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search cash flow transactions..."
        />
      </div>
    </div>
  );
}
