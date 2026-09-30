'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Percent,
} from 'lucide-react';
import { feeService, FeeType, FeeStructure, FeeDiscount } from '../../../../services/fee.service';
import { academicService } from '../../../../services/academic.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function FeeStructuresPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'STRUCTURES' | 'HEADS' | 'DISCOUNTS'>('STRUCTURES');
  const [search, setSearch] = useState('');

  // Modals
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Forms
  const [headForm, setHeadForm] = useState({
    name: '',
    code: '',
    description: '',
    isOptional: false,
    accountCode: '',
  });

  const [structureForm, setStructureForm] = useState({
    name: '',
    code: '',
    academicYearId: '00000000-0000-0000-0000-000000000001',
    classId: '',
    frequency: 'MONTHLY' as any,
    feeTypeId: '',
    amount: 5000,
    dueDayOfMonth: 10,
    lateFineAmount: 100,
    graceDays: 5,
  });

  const [discountForm, setDiscountForm] = useState({
    name: '',
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 20,
    reason: '',
  });

  // Queries
  const { data: structuresData = [], refetch: refetchStructures } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: () => feeService.getFeeStructures(),
  });

  const { data: feeTypes = [], refetch: refetchHeads } = useQuery({
    queryKey: ['fee-types'],
    queryFn: () => feeService.getFeeTypes(),
  });

  const { data: discounts = [], refetch: refetchDiscounts } = useQuery({
    queryKey: ['fee-discounts'],
    queryFn: () => feeService.getDiscounts(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-for-structures'],
    queryFn: () => academicService.getClasses(),
  });

  // Sample data fallback
  const sampleStructures: FeeStructure[] = [
    {
      id: '1',
      academicYearId: 'ay-1',
      name: 'Primary Standard Fee Structure',
      code: 'FEE-PRI-2026',
      frequency: 'MONTHLY',
      description: 'Monthly tuition, transport and activity fees for Grades 1-5',
      status: 'ACTIVE',
      items: [
        { id: '1', feeTypeId: 'ft-1', feeType: { id: '1', name: 'Tuition Fee', code: 'TUI', isOptional: false, status: 'ACTIVE' }, amount: 4500, dueDayOfMonth: 10, lateFineAmount: 100, graceDays: 5 },
        { id: '2', feeTypeId: 'ft-2', feeType: { id: '2', name: 'Computer Lab Fee', code: 'LAB', isOptional: false, status: 'ACTIVE' }, amount: 500, dueDayOfMonth: 10, lateFineAmount: 50, graceDays: 5 },
      ],
    },
    {
      id: '2',
      academicYearId: 'ay-1',
      name: 'Middle School Standard Fee Structure',
      code: 'FEE-MID-2026',
      frequency: 'QUARTERLY',
      description: 'Quarterly fees for Grades 6-8',
      status: 'ACTIVE',
      items: [
        { id: '3', feeTypeId: 'ft-1', feeType: { id: '1', name: 'Tuition Fee', code: 'TUI', isOptional: false, status: 'ACTIVE' }, amount: 15000, dueDayOfMonth: 10, lateFineAmount: 250, graceDays: 7 },
      ],
    },
  ];

  const sampleHeads: FeeType[] = [
    { id: '1', name: 'Tuition Fee', code: 'TUI', description: 'Core academic instruction fee', isOptional: false, accountCode: 'ACC-4001', status: 'ACTIVE' },
    { id: '2', name: 'Computer Lab Fee', code: 'LAB', description: 'Technology & practical sessions', isOptional: false, accountCode: 'ACC-4002', status: 'ACTIVE' },
    { id: '3', name: 'School Bus Transport', code: 'TRANS', description: 'Zone-based daily pickup & drop', isOptional: true, accountCode: 'ACC-4003', status: 'ACTIVE' },
    { id: '4', name: 'Annual Sports & Activity Fee', code: 'SPORTS', description: 'Athletics & cultural festival charges', isOptional: false, accountCode: 'ACC-4004', status: 'ACTIVE' },
  ];

  const sampleDiscounts: FeeDiscount[] = [
    { id: '1', name: 'Sibling Concession', code: 'SIB-20', discountType: 'PERCENTAGE', value: 20, reason: 'Applied for second enrolled sibling', status: 'ACTIVE' },
    { id: '2', name: 'Merit Scholarship', code: 'MERIT-50', discountType: 'PERCENTAGE', value: 50, reason: 'Awarded to top 5% rank holders', status: 'ACTIVE' },
    { id: '3', name: 'Staff Child Waiver', code: 'STAFF-100', discountType: 'PERCENTAGE', value: 100, reason: 'Full tuition exemption for faculty wards', status: 'ACTIVE' },
  ];

  const structureList = structuresData.length > 0 ? structuresData : sampleStructures;
  const headList = feeTypes.length > 0 ? feeTypes : sampleHeads;
  const discountList = discounts.length > 0 ? discounts : sampleDiscounts;

  const handleCreateHead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feeService.createFeeType(headForm);
      setIsHeadModalOpen(false);
      refetchHeads();
    } catch {
      setIsHeadModalOpen(false);
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feeService.createFeeStructure({
        academicYearId: structureForm.academicYearId,
        classId: structureForm.classId || undefined,
        name: structureForm.name,
        code: structureForm.code,
        frequency: structureForm.frequency,
        items: [
          {
            feeTypeId: structureForm.feeTypeId || (headList[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
            amount: Number(structureForm.amount),
            dueDayOfMonth: Number(structureForm.dueDayOfMonth),
            lateFineAmount: Number(structureForm.lateFineAmount),
            graceDays: Number(structureForm.graceDays),
          },
        ],
      });
      setIsStructureModalOpen(false);
      refetchStructures();
    } catch {
      setIsStructureModalOpen(false);
    }
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feeService.createDiscount(discountForm);
      setIsDiscountModalOpen(false);
      refetchDiscounts();
    } catch {
      setIsDiscountModalOpen(false);
    }
  };

  const structureColumns: Column<FeeStructure>[] = [
    {
      key: 'name',
      header: 'Structure Title & Code',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">{row.name}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] mt-0.5">
            <span className="font-mono">{row.code}</span>
            <span>•</span>
            <span className="text-[#667085]">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (row) => (
        <Badge variant="primary" className="text-xs">
          {row.frequency}
        </Badge>
      ),
    },
    {
      key: 'items',
      header: 'Fee Heads & Total',
      render: (row) => {
        const total = row.items?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
        return (
          <div>
            <div className="font-bold text-xs text-[#10B981]">₹{total.toLocaleString()} / period</div>
            <div className="text-[11px] text-[#667085] mt-0.5">
              {row.items?.length || 0} Fee Head(s) linked
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const headColumns: Column<FeeType>[] = [
    {
      key: 'name',
      header: 'Fee Head Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">{row.name}</span>
          <p className="text-[11px] text-[#98A2B3] mt-0.5">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => <span className="font-mono text-xs text-[#2563EB]">{row.code}</span>,
    },
    {
      key: 'accountCode',
      header: 'GL Account Code',
      render: (row) => (
        <span className="font-mono text-xs text-[#667085]">{row.accountCode || 'ACC-DEFAULT'}</span>
      ),
    },
    {
      key: 'optional',
      header: 'Type',
      render: (row) => (
        <Badge variant={row.isOptional ? 'warning' : 'primary'}>
          {row.isOptional ? 'Optional Opt-In' : 'Mandatory'}
        </Badge>
      ),
    },
  ];

  const discountColumns: Column<FeeDiscount>[] = [
    {
      key: 'name',
      header: 'Concession / Scholarship Title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[#172033] text-xs lg:text-sm">{row.name}</span>
          <p className="text-[11px] text-[#98A2B3] mt-0.5">{row.reason}</p>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => <span className="font-mono text-xs text-[#2563EB]">{row.code}</span>,
    },
    {
      key: 'value',
      header: 'Discount Value',
      render: (row) => (
        <span className="font-bold text-xs text-[#10B981]">
          {row.discountType === 'PERCENTAGE' ? `${row.value}% OFF` : `₹${row.value} Fixed`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Fee Structure & Concession Configuration"
        description="Configure dynamic fee heads, multi-tier fee structures, billing frequencies, and scholarship rules."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Structures' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/fees">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Fees
              </Button>
            </Link>
            {activeTab === 'STRUCTURES' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStructureModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Create Structure
              </Button>
            )}
            {activeTab === 'HEADS' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsHeadModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Fee Head
              </Button>
            )}
            {activeTab === 'DISCOUNTS' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDiscountModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Concession
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF1] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('STRUCTURES')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'STRUCTURES'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
          }`}
        >
          Fee Structures ({structureList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HEADS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'HEADS'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
          }`}
        >
          Fee Heads / Types ({headList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DISCOUNTS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'DISCOUNTS'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
          }`}
        >
          Discounts & Concessions ({discountList.length})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'STRUCTURES' && (
        <DataTable
          columns={structureColumns}
          data={structureList}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search fee structures..."
        />
      )}

      {activeTab === 'HEADS' && (
        <DataTable
          columns={headColumns}
          data={headList}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search fee heads..."
        />
      )}

      {activeTab === 'DISCOUNTS' && (
        <DataTable
          columns={discountColumns}
          data={discountList}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search concessions..."
        />
      )}

      {/* Modal: Add Fee Head */}
      <Modal
        isOpen={isHeadModalOpen}
        onClose={() => setIsHeadModalOpen(false)}
        title="Create New Fee Head"
      >
        <form onSubmit={handleCreateHead} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Fee Head Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Lab Fee, Library Deposit"
              value={headForm.name}
              onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. LAB, LIB"
                value={headForm.code}
                onChange={(e) => setHeadForm({ ...headForm, code: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Account Code</label>
              <input
                type="text"
                placeholder="e.g. ACC-4005"
                value={headForm.accountCode}
                onChange={(e) => setHeadForm({ ...headForm, accountCode: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Description</label>
            <textarea
              rows={2}
              value={headForm.description}
              onChange={(e) => setHeadForm({ ...headForm, description: e.target.value })}
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isOptional"
              checked={headForm.isOptional}
              onChange={(e) => setHeadForm({ ...headForm, isOptional: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="isOptional" className="text-xs text-[#344054]">
              Optional fee head (students can opt-in/opt-out)
            </label>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsHeadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Fee Head
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Fee Structure */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title="Create Fee Structure"
      >
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Structure Title</label>
            <input
              type="text"
              required
              placeholder="e.g. High School Regular Fee Structure"
              value={structureForm.name}
              onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. FEE-HIGH-2026"
                value={structureForm.code}
                onChange={(e) => setStructureForm({ ...structureForm, code: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Frequency</label>
              <select
                value={structureForm.frequency}
                onChange={(e) =>
                  setStructureForm({ ...structureForm, frequency: e.target.value as any })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="TERM">Term-Wise</option>
                <option value="ANNUAL">Annual</option>
                <option value="ONE_TIME">One-Time</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Fee Head</label>
              <select
                value={structureForm.feeTypeId}
                onChange={(e) => setStructureForm({ ...structureForm, feeTypeId: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                {headList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
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
                value={structureForm.amount}
                onChange={(e) =>
                  setStructureForm({ ...structureForm, amount: Number(e.target.value) })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStructureModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Structure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Concession */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Create Concession / Scholarship"
      >
        <form onSubmit={handleCreateDiscount} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Concession Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sibling Concession, Sports Quota"
              value={discountForm.name}
              onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SIB-25"
                value={discountForm.code}
                onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Discount % or ₹</label>
              <input
                type="number"
                min="0"
                required
                value={discountForm.value}
                onChange={(e) =>
                  setDiscountForm({ ...discountForm, value: Number(e.target.value) })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Eligibility Reason</label>
            <textarea
              rows={2}
              value={discountForm.reason}
              onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDiscountModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Concession
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
