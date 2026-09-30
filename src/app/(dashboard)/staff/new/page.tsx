'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { staffService } from '../../../../services/staff.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Stepper, StepItem } from '../../../../components/ui/stepper';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';

export default function NewStaffOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: staffService.getDepartments,
  });

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    bloodGroup: 'O+',
    qualification: '',

    // Step 2: Employment & Designation
    departmentId: '',
    designationId: '',
    employmentType: 'FULL_TIME' as const,
    dateOfJoining: new Date().toISOString().split('T')[0],
    experienceYears: 0,
    basicSalary: 45000,

    // Step 3: Contact & Address
    phone: '',
    alternatePhone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: 'Spouse',
    currentAddress: '',
    permanentAddress: '',

    // Step 4: Bank & Statutory
    bankName: '',
    bankAccountTitle: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    panOrTaxId: '',
    aadhaarOrNationalId: '',

    // Step 5: Document
    documentName: 'Resume / CV',
    documentType: 'RESUME',
    documentNumber: '',

    // Step 6: User Access & Role
    createUserAccount: true,
    roleName: 'Teacher',
  });

  const { data: designations = [] } = useQuery({
    queryKey: ['designations', formData.departmentId],
    queryFn: () => staffService.getDesignations(formData.departmentId || undefined),
    enabled: !!formData.departmentId,
  });

  const steps: StepItem[] = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'Department & Role' },
    { number: 3, title: 'Contact & Address' },
    { number: 4, title: 'Bank & Statutory' },
    { number: 5, title: 'Documents' },
    { number: 6, title: 'Review & Onboard' },
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await staffService.createStaff({
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        qualification: formData.qualification,
        departmentId: formData.departmentId || undefined,
        designationId: formData.designationId || undefined,
        employmentType: formData.employmentType,
        dateOfJoining: formData.dateOfJoining,
        experienceYears: Number(formData.experienceYears),
        basicSalary: Number(formData.basicSalary),
        phone: formData.phone,
        alternatePhone: formData.alternatePhone || undefined,
        email: formData.email,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        bankName: formData.bankName,
        bankAccountTitle: formData.bankAccountTitle,
        bankAccountNumber: formData.bankAccountNumber,
        bankIfscCode: formData.bankIfscCode,
        panOrTaxId: formData.panOrTaxId,
        aadhaarOrNationalId: formData.aadhaarOrNationalId,
        createUserAccount: formData.createUserAccount,
        roleName: formData.roleName,
      });

      router.push('/staff');
    } catch (err: any) {
      setTimeout(() => {
        router.push('/staff');
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-5xl mx-auto">
      <PageHeader
        title="Staff Onboarding Wizard"
        description="Onboard a new employee, configure department/designation, and set up user access."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff', href: '/staff' },
          { label: 'New Employee' },
        ]}
      />

      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(s) => setCurrentStep(s)}
      />

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-[#EF4444] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardHeader className="py-4">
          <CardTitle>
            Step {currentStep}: {steps.find((s) => s.number === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Brandon"
              />
              <Input
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Sephton"
              />
              <Select
                label="Gender"
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
              <Select
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                options={[
                  { label: 'Single', value: 'Single' },
                  { label: 'Married', value: 'Married' },
                  { label: 'Divorced', value: 'Divorced' },
                ]}
              />
              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                options={[
                  { label: 'A+', value: 'A+' },
                  { label: 'B+', value: 'B+' },
                  { label: 'O+', value: 'O+' },
                  { label: 'AB+', value: 'AB+' },
                ]}
              />
              <div className="md:col-span-2">
                <Input
                  label="Highest Qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. M.Sc. Mathematics, B.Ed."
                />
              </div>
            </div>
          )}

          {/* Step 2: Department & Designation */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Select
                label="Department"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, designationId: '' })}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </Select>

              <Select
                label="Designation"
                required
                value={formData.designationId}
                onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                disabled={!formData.departmentId}
              >
                <option value="">Select Designation</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.title}
                  </option>
                ))}
              </Select>

              <Select
                label="Employment Type"
                required
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                options={[
                  { label: 'Full Time', value: 'FULL_TIME' },
                  { label: 'Part Time', value: 'PART_TIME' },
                  { label: 'Contract', value: 'CONTRACT' },
                  { label: 'Intern', value: 'INTERN' },
                ]}
              />

              <Input
                label="Date of Joining"
                type="date"
                required
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              />

              <Input
                label="Total Experience (Years)"
                type="number"
                value={String(formData.experienceYears)}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              />

              <Input
                label="Basic Monthly Salary (₹)"
                type="number"
                value={String(formData.basicSalary)}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
              />
            </div>
          )}

          {/* Step 3: Contact & Address */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input
                label="Primary Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Official / Work Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@school.edu"
              />
              <Input
                label="Emergency Contact Name"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="e.g. Sarah Sephton"
              />
              <Input
                label="Emergency Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+91 98765 00000"
              />
              <div className="md:col-span-2">
                <Input
                  label="Current Residential Address"
                  required
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  placeholder="Street, City, State, PIN Code"
                />
              </div>
            </div>
          )}

          {/* Step 4: Bank & Statutory */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank"
              />
              <Input
                label="Account Holder Name"
                value={formData.bankAccountTitle}
                onChange={(e) => setFormData({ ...formData, bankAccountTitle: e.target.value })}
                placeholder="e.g. Brandon Sephton"
              />
              <Input
                label="Bank Account Number"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="e.g. 50100234567890"
              />
              <Input
                label="IFSC Code"
                value={formData.bankIfscCode}
                onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value })}
                placeholder="e.g. HDFC0001234"
              />
              <Input
                label="PAN / Tax Identification Number"
                value={formData.panOrTaxId}
                onChange={(e) => setFormData({ ...formData, panOrTaxId: e.target.value })}
                placeholder="e.g. ABCDE1234F"
              />
              <Input
                label="Aadhaar / National ID"
                value={formData.aadhaarOrNationalId}
                onChange={(e) => setFormData({ ...formData, aadhaarOrNationalId: e.target.value })}
                placeholder="e.g. 9988 7766 5544"
              />
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#F8FAFC]">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#172033]">
                  Upload employee contracts, resume, and degree certificates
                </p>
                <p className="text-[11px] text-[#667085] mt-1">
                  Supports PDF, PNG, JPG up to 10MB
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Document Name"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                />
                <Input
                  label="Document Ref / License No"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 6: Review & Onboard */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center gap-3 text-[#2563EB]">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">System Credentials & Access Setup:</span> A system user account will be provisioned with default credentials sent to their email.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.createUserAccount}
                    onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                  />
                  <span className="text-xs font-bold text-[#172033]">
                    Provision ERP Portal Login for this Employee
                  </span>
                </label>

                {formData.createUserAccount && (
                  <div className="pt-2">
                    <Select
                      label="Assign System Role"
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      options={[
                        { label: 'Teacher', value: 'Teacher' },
                        { label: 'Accountant', value: 'Accountant' },
                        { label: 'HR Manager', value: 'HR' },
                        { label: 'Administrator', value: 'Admin' },
                      ]}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-1.5">
                  <p className="font-bold text-[#172033] border-b pb-1">Employee Info</p>
                  <p><span className="text-[#667085]">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="text-[#667085]">Email:</span> {formData.email}</p>
                  <p><span className="text-[#667085]">Phone:</span> {formData.phone}</p>
                  <p><span className="text-[#667085]">Employment:</span> {formData.employmentType}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-1.5">
                  <p className="font-bold text-[#172033] border-b pb-1">Salary & Bank</p>
                  <p><span className="text-[#667085]">Basic Salary:</span> ₹ {formData.basicSalary.toLocaleString('en-IN')}</p>
                  <p><span className="text-[#667085]">Bank:</span> {formData.bankName || 'Not specified'}</p>
                  <p><span className="text-[#667085]">Account:</span> {formData.bankAccountNumber || 'N/A'}</p>
                  <p><span className="text-[#667085]">PAN:</span> {formData.panOrTaxId || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="mt-8 pt-4 border-t border-[#E5EAF1] flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <Link href="/staff">
                <Button type="button" variant="outline" size="md">
                  Cancel
                </Button>
              </Link>
            )}

            {currentStep < 6 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSubmit}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Complete Onboarding
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
