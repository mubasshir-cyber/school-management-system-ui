'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Layers,
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { payrollService, SalaryComponent, SalaryStructure } from '../../../../services/payroll.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { DataTable, Column } from '../../../../components/tables/data-table';

export default function SalaryStructuresPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'STRUCTURES' | 'COMPONENTS'>('STRUCTURES');
  const [search, setSearch] = useState('');

  // Modals
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  // Forms
  const [componentForm, setComponentForm] = useState({
    name: '',
    code: '',
    componentType: 'EARNING' as 'EARNING' | 'DEDUCTION',
    calculationType: 'FIXED' as 'FIXED' | 'PERCENTAGE_OF_BASIC',
    defaultValue: 0,
    isTaxable: true,
    isStatutory: false,
    description: '',
  });

  const [structureForm, setStructureForm] = useState({
    name: '',
    code: '',
    description: '',
    componentId: '',
    value: 30000,
  });

  // Queries
  const { data: structuresData = [], refetch: refetchStructures } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: () => payrollService.getStructures(),
  });

  const { data: componentsData = [], refetch: refetchComponents } = useQuery({
    queryKey: ['salary-components'],
    queryFn: () => payrollService.getComponents(),
  });

  // Sample data fallback
  const sampleStructures: SalaryStructure[] = [
    {
      id: '1',
      name: 'Senior Teaching Faculty Structure (PGT/TGT)',
      code: 'SAL-FAC-SR',
      description: 'Standard pay scale for senior secondary educators',
      status: 'ACTIVE',
      items: [
        { id: '1', salaryComponentId: '1', salaryComponent: { id: '1', name: 'Basic Salary', code: 'BASIC', componentType: 'EARNING', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 50, isTaxable: true, isStatutory: false, status: 'ACTIVE' }, calculationType: 'PERCENTAGE_OF_BASIC', value: 50 },
        { id: '2', salaryComponentId: '2', salaryComponent: { id: '2', name: 'House Rent Allowance (HRA)', code: 'HRA', componentType: 'EARNING', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 40, isTaxable: true, isStatutory: false, status: 'ACTIVE' }, calculationType: 'PERCENTAGE_OF_BASIC', value: 40 },
        { id: '3', salaryComponentId: '3', salaryComponent: { id: '3', name: 'Provident Fund (PF)', code: 'PF', componentType: 'DEDUCTION', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 12, isTaxable: false, isStatutory: true, status: 'ACTIVE' }, calculationType: 'PERCENTAGE_OF_BASIC', value: 12 },
      ],
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Administrative & Support Staff Structure',
      code: 'SAL-ADMIN-01',
      description: 'Standard pay scale for office, accounts, and lab support staff',
      status: 'ACTIVE',
      items: [
        { id: '4', salaryComponentId: '1', salaryComponent: { id: '1', name: 'Basic Salary', code: 'BASIC', componentType: 'EARNING', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 50, isTaxable: true, isStatutory: false, status: 'ACTIVE' }, calculationType: 'PERCENTAGE_OF_BASIC', value: 50 },
        { id: '5', salaryComponentId: '3', salaryComponent: { id: '3', name: 'Provident Fund (PF)', code: 'PF', componentType: 'DEDUCTION', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 12, isTaxable: false, isStatutory: true, status: 'ACTIVE' }, calculationType: 'PERCENTAGE_OF_BASIC', value: 12 },
      ],
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  const sampleComponents: SalaryComponent[] = [
    { id: '1', name: 'Basic Salary', code: 'BASIC', componentType: 'EARNING', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 50, isTaxable: true, isStatutory: false, description: 'Base component (50% of gross)', status: 'ACTIVE' },
    { id: '2', name: 'House Rent Allowance (HRA)', code: 'HRA', componentType: 'EARNING', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 40, isTaxable: true, isStatutory: false, description: 'Housing assistance allowance', status: 'ACTIVE' },
    { id: '3', name: 'Special Allowance', code: 'SPL_ALW', componentType: 'EARNING', calculationType: 'FIXED', defaultValue: 10000, isTaxable: true, isStatutory: false, description: 'Performance and grade pay supplement', status: 'ACTIVE' },
    { id: '4', name: 'Provident Fund (PF)', code: 'PF', componentType: 'DEDUCTION', calculationType: 'PERCENTAGE_OF_BASIC', defaultValue: 12, isTaxable: false, isStatutory: true, description: 'Statutory employee retirement deduction', status: 'ACTIVE' },
    { id: '5', name: 'Professional Tax (PT)', code: 'PT', componentType: 'DEDUCTION', calculationType: 'FIXED', defaultValue: 200, isTaxable: false, isStatutory: true, description: 'State professional tax levy', status: 'ACTIVE' },
  ];

  const structureList = structuresData.length > 0 ? structuresData : sampleStructures;
  const componentList = componentsData.length > 0 ? componentsData : sampleComponents;

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payrollService.createComponent(componentForm);
      setIsComponentModalOpen(false);
      refetchComponents();
    } catch {
      setIsComponentModalOpen(false);
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payrollService.createStructure({
        name: structureForm.name,
        code: structureForm.code,
        description: structureForm.description,
        items: [
          {
            salaryComponentId:
              structureForm.componentId || (componentList[0]?.id ?? '00000000-0000-0000-0000-000000000001'),
            value: Number(structureForm.value),
          },
        ],
      });
      setIsStructureModalOpen(false);
      refetchStructures();
    } catch {
      setIsStructureModalOpen(false);
    }
  };

  const structureColumns: Column<SalaryStructure>[] = [
    {
      key: 'name',
      header: 'Structure Title & Scale Code',
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
      key: 'items',
      header: 'Assigned Salary Components',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.items?.map((it) => (
            <Badge
              key={it.id}
              variant={it.salaryComponent?.componentType === 'EARNING' ? 'primary' : 'danger'}
              className="text-[10px]"
            >
              {it.salaryComponent?.name || 'Component'}
            </Badge>
          ))}
        </div>
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

  const componentColumns: Column<SalaryComponent>[] = [
    {
      key: 'name',
      header: 'Salary Component',
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
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge variant={row.componentType === 'EARNING' ? 'success' : 'danger'}>
          {row.componentType}
        </Badge>
      ),
    },
    {
      key: 'calc',
      header: 'Calculation Rule',
      render: (row) => (
        <span className="text-xs text-[#475467] font-medium">
          {row.calculationType === 'PERCENTAGE_OF_BASIC' ? `${row.defaultValue}% of Basic` : `₹${row.defaultValue} Fixed`}
        </span>
      ),
    },
    {
      key: 'statutory',
      header: 'Statutory',
      render: (row) =>
        row.isStatutory ? (
          <Badge variant="primary" className="text-[10px]">
            Statutory Rule
          </Badge>
        ) : (
          <span className="text-xs text-[#98A2B3]">Standard</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Salary Structure & Component Configuration"
        description="Define institutional salary components, statutory PF/Tax deductions, and grade-wise pay scale templates."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Payroll', href: '/payroll' },
          { label: 'Structures' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/payroll">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Payroll
              </Button>
            </Link>
            {activeTab === 'STRUCTURES' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStructureModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Create Structure
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsComponentModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Component
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
          Salary Structures ({structureList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COMPONENTS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'COMPONENTS'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-[#667085] hover:bg-[#F8FAFC]'
          }`}
        >
          Salary Components / Heads ({componentList.length})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'STRUCTURES' ? (
        <DataTable
          columns={structureColumns}
          data={structureList}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search salary structures..."
        />
      ) : (
        <DataTable
          columns={componentColumns}
          data={componentList}
          keyExtractor={(row) => row.id}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search salary components..."
        />
      )}

      {/* Modal: Add Salary Component */}
      <Modal
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
        title="Add Salary Component"
      >
        <form onSubmit={handleCreateComponent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Component Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Travel Allowance, Medical Allowance"
              value={componentForm.name}
              onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. TA, MED"
                value={componentForm.code}
                onChange={(e) => setComponentForm({ ...componentForm, code: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Type</label>
              <select
                value={componentForm.componentType}
                onChange={(e) =>
                  setComponentForm({
                    ...componentForm,
                    componentType: e.target.value as any,
                  })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                <option value="EARNING">Earning (+)</option>
                <option value="DEDUCTION">Deduction (-)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Calculation</label>
              <select
                value={componentForm.calculationType}
                onChange={(e) =>
                  setComponentForm({
                    ...componentForm,
                    calculationType: e.target.value as any,
                  })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                <option value="FIXED">Fixed Amount (₹)</option>
                <option value="PERCENTAGE_OF_BASIC">% of Basic Salary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Default Value</label>
              <input
                type="number"
                min="0"
                required
                value={componentForm.defaultValue}
                onChange={(e) =>
                  setComponentForm({
                    ...componentForm,
                    defaultValue: Number(e.target.value),
                  })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-[#344054]">
              <input
                type="checkbox"
                checked={componentForm.isStatutory}
                onChange={(e) =>
                  setComponentForm({ ...componentForm, isStatutory: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Statutory Deduction (e.g. PF, ESIC)
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsComponentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Component
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Salary Structure */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title="Create Salary Structure Profile"
      >
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Structure Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Primary Teacher Pay Scale"
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
                placeholder="e.g. SAL-PRT-01"
                value={structureForm.code}
                onChange={(e) => setStructureForm({ ...structureForm, code: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">Primary Component</label>
              <select
                value={structureForm.componentId}
                onChange={(e) =>
                  setStructureForm({ ...structureForm, componentId: e.target.value })
                }
                className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
              >
                {componentList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#344054] mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Scale description..."
              value={structureForm.description}
              onChange={(e) =>
                setStructureForm({ ...structureForm, description: e.target.value })
              }
              className="w-full p-2.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#172033]"
            />
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
              Create Salary Structure
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
