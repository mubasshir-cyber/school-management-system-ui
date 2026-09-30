'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Users,
} from 'lucide-react';
import { staffService, Department, Designation } from '../../../../services/staff.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';

export default function DepartmentsDesignationsPage() {
  const queryClient = useQueryClient();
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [desigForm, setDesigForm] = useState({ departmentId: '', title: '', code: '', level: 1, description: '' });

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: staffService.getDepartments,
  });

  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: () => staffService.getDesignations(),
  });

  // Mutations
  const createDeptMutation = useMutation({
    mutationFn: staffService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', description: '' });
    },
  });

  const createDesigMutation = useMutation({
    mutationFn: staffService.createDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      setShowDesigModal(false);
      setDesigForm({ departmentId: '', title: '', code: '', level: 1, description: '' });
    },
  });

  // Mock fallbacks if database is fresh
  const displayDepartments: Department[] = departments.length > 0 ? departments : [
    { id: 'd1', name: 'Mathematics Department', code: 'MATH', description: 'Curriculum and faculty for mathematics', status: 'ACTIVE', createdAt: '' },
    { id: 'd2', name: 'Science & Physics', code: 'SCI', description: 'Physics, chemistry and biology labs', status: 'ACTIVE', createdAt: '' },
    { id: 'd3', name: 'Languages & Humanities', code: 'LANG', description: 'English, Hindi, and regional languages', status: 'ACTIVE', createdAt: '' },
    { id: 'd4', name: 'Administration & Accounts', code: 'ADMIN', description: 'School administrative and financial staff', status: 'ACTIVE', createdAt: '' },
  ];

  const displayDesignations: Designation[] = designations.length > 0 ? designations : [
    { id: 'des1', title: 'Senior Lecturer', code: 'SR-LEC', level: 3, status: 'ACTIVE', department: displayDepartments[0], createdAt: '' },
    { id: 'des2', title: 'Assistant Teacher', code: 'ASST-TCH', level: 2, status: 'ACTIVE', department: displayDepartments[0], createdAt: '' },
    { id: 'des3', title: 'Laboratory Instructor', code: 'LAB-INS', level: 2, status: 'ACTIVE', department: displayDepartments[1], createdAt: '' },
    { id: 'des4', title: 'Chief Accountant', code: 'ACC-CHIEF', level: 4, status: 'ACTIVE', department: displayDepartments[3], createdAt: '' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Departments & Designations"
        description="Organize your school hierarchy, staff departments, and job titles dynamically."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff', href: '/staff' },
          { label: 'Departments & Designations' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowDesigModal(true)}
            >
              + Add Designation
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowDeptModal(true)}
            >
              + Add Department
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-[#2563EB]" />
              <span>School Departments</span>
            </h3>
            <span className="text-xs text-[#667085] font-semibold">{displayDepartments.length} Active</span>
          </div>

          <div className="space-y-3">
            {displayDepartments.map((dept) => (
              <Card key={dept.id} hoverEffect className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">{dept.name}</h4>
                    <span className="font-mono text-[11px] font-semibold text-[#2563EB]">
                      {dept.code}
                    </span>
                    {dept.description && (
                      <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">{dept.description}</p>
                    )}
                  </div>
                  <Badge variant="success" size="sm" dot>
                    Active
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Designations Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#F59E0B]" />
              <span>Staff Designations</span>
            </h3>
            <span className="text-xs text-[#667085] font-semibold">{displayDesignations.length} Active</span>
          </div>

          <div className="space-y-3">
            {displayDesignations.map((desig) => (
              <Card key={desig.id} hoverEffect className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">{desig.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#667085]">
                      <span className="font-mono text-[#2563EB] font-semibold">{desig.code}</span>
                      <span>•</span>
                      <span>{desig.department?.name || 'General Department'}</span>
                      <span>•</span>
                      <span className="font-medium">Level {desig.level}</span>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Level {desig.level}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Add School Department"
        description="Define a new operational department (e.g. Science, Mathematics, Administration)."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowDeptModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createDeptMutation.mutate(deptForm)}
              isLoading={createDeptMutation.isPending}
            >
              Create Department
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            required
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            placeholder="e.g. Computer Science Department"
          />
          <Input
            label="Department Code"
            required
            value={deptForm.code}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
            placeholder="e.g. DEPT-CS"
          />
          <Input
            label="Description"
            value={deptForm.description}
            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
            placeholder="Optional department notes"
          />
        </div>
      </Modal>

      {/* Add Designation Modal */}
      <Modal
        isOpen={showDesigModal}
        onClose={() => setShowDesigModal(false)}
        title="Add Staff Designation"
        description="Configure a job title, hierarchy level, and assigned department."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowDesigModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createDesigMutation.mutate({ ...desigForm, level: Number(desigForm.level) })}
              isLoading={createDesigMutation.isPending}
            >
              Create Designation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Assigned Department"
            value={desigForm.departmentId}
            onChange={(e) => setDesigForm({ ...desigForm, departmentId: e.target.value })}
          >
            <option value="">Select Department</option>
            {displayDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Input
            label="Designation Title"
            required
            value={desigForm.title}
            onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
            placeholder="e.g. Senior Lecturer"
          />
          <Input
            label="Designation Code"
            required
            value={desigForm.code}
            onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })}
            placeholder="e.g. DESIG-SR-LEC"
          />
          <Input
            label="Hierarchy Level (1-10)"
            type="number"
            value={String(desigForm.level)}
            onChange={(e) => setDesigForm({ ...desigForm, level: Number(e.target.value) })}
          />
        </div>
      </Modal>
    </div>
  );
}
