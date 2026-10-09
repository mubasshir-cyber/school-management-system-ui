'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  HeartHandshake,
  Search,
  Plus,
  Phone,
  Mail,
  User,
  GraduationCap,
  Eye,
  Trash2,
  Edit,
  AlertCircle,
} from 'lucide-react';
import { guardianService } from '../../../services/guardian.service';
import { PageHeader } from '../../../components/ui/page-header';
import { DataTable, Column } from '../../../components/tables/data-table';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';

export default function GuardiansMasterPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    relationshipType: 'FATHER',
    mobile: '',
    email: '',
    occupation: '',
    employer: '',
    addressLine1: '',
    city: '',
  });

  const { data: guardians = [], isLoading } = useQuery({
    queryKey: ['guardians', search],
    queryFn: () => guardianService.getGuardians(search || undefined),
  });

  const createMutation = useMutation({
    mutationFn: guardianService.createGuardian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create guardian');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      guardianService.updateGuardian(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      setEditingGuardian(null);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update guardian');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: guardianService.deleteGuardian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      relationshipType: 'FATHER',
      mobile: '',
      email: '',
      occupation: '',
      employer: '',
      addressLine1: '',
      city: '',
    });
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (guardian: any) => {
    setEditingGuardian(guardian);
    setFormData({
      firstName: guardian.firstName || '',
      lastName: guardian.lastName || '',
      relationshipType: guardian.relationshipType || 'FATHER',
      mobile: guardian.mobile || '',
      email: guardian.email || '',
      occupation: guardian.occupation || '',
      employer: guardian.employer || '',
      addressLine1: guardian.addressLine1 || '',
      city: guardian.city || '',
    });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      relationshipType: formData.relationshipType,
      mobile: formData.mobile.trim(),
      email: formData.email.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      employer: formData.employer.trim() || undefined,
      addressLine1: formData.addressLine1.trim() || undefined,
      city: formData.city.trim() || undefined,
    };

    if (editingGuardian) {
      updateMutation.mutate({ id: editingGuardian.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Guardian Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#DBEAFE]">
            {row.firstName?.[0]}
            {row.lastName?.[0]}
          </div>
          <div>
            <div className="font-semibold text-[#172033] text-xs lg:text-sm">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-[11px] text-[#667085]">
              {row.relationshipType || 'Primary Contact'} {row.occupation ? `• ${row.occupation}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-[#172033]">
          <div className="flex items-center gap-1.5 font-medium">
            <Phone className="w-3 h-3 text-[#2563EB]" />
            <span>{row.mobile}</span>
          </div>
          {row.email && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
              <Mail className="w-3 h-3 text-[#94A3B8]" />
              <span>{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Linked Student(s)',
      render: (row) => {
        const studentLinks = row.students || [];
        if (studentLinks.length === 0) {
          return <span className="text-[11px] text-[#94A3B8] italic">No active links</span>;
        }

        return (
          <div className="flex flex-wrap gap-1.5">
            {studentLinks.map((sg: any) => (
              <Link
                key={sg.id}
                href={`/students/${sg.student?.id || sg.studentId}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] text-[11px] font-medium transition-colors"
              >
                <GraduationCap className="w-3 h-3" />
                <span>{sg.student?.firstName} {sg.student?.lastName}</span>
              </Link>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-24',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-[#667085] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
            title="Edit Guardian"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this guardian?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-1.5 text-[#667085] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
            title="Delete Guardian"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title="Guardians Master"
        description="Directory of parents, primary guardians, and emergency contacts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: 'Guardians' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Guardian
          </Button>
        }
      />

      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div className="w-full sm:w-96 relative">
          <Input
            placeholder="Search by name, mobile, or email..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-[#667085] font-medium">
          Total Guardians: <span className="font-bold text-[#172033]">{guardians.length}</span>
        </div>
      </div>

      {/* Guardians Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {guardians.length === 0 && !isLoading ? (
          <EmptyState
            title="No Guardians Found"
            description="There are no guardians matching your search criteria or registered in the database."
            actionLabel="Add First Guardian"
            onAction={handleOpenAdd}
          />
        ) : (
          <DataTable
            data={guardians}
            columns={columns}
            isLoading={isLoading}
            keyExtractor={(row) => row.id}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingGuardian}
        onClose={() => {
          setShowAddModal(false);
          setEditingGuardian(null);
        }}
        title={editingGuardian ? 'Edit Guardian Details' : 'Add New Guardian'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Rashid"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Khan"
            />
            <Select
              label="Relationship"
              required
              value={formData.relationshipType}
              onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
              options={[
                { label: 'Father', value: 'FATHER' },
                { label: 'Mother', value: 'MOTHER' },
                { label: 'Guardian / Relative', value: 'GUARDIAN' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />
            <Input
              label="Mobile Number"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="+91 9876543210"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="parent@example.com"
            />
            <Input
              label="Occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="e.g. Business / Engineer"
            />
            <div className="sm:col-span-2">
              <Input
                label="Residential Address"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Street address, city"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5EAF1]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddModal(false);
                setEditingGuardian(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingGuardian
                ? 'Update Guardian'
                : 'Create Guardian'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
