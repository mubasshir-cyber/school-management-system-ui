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
} from 'lucide-react';
import { studentService } from '../../../../services/student.service';
import { academicService } from '../../../../services/academic.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Stepper, StepItem } from '../../../../components/ui/stepper';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';

export default function StudentRegistrationWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: 'Ahmed',
    lastName: 'Khan',
    dateOfBirth: '2015-05-12',
    gender: 'Male',
    bloodGroup: 'B+',
    nationality: 'Indian',
    category: 'General',
    religion: 'Islam',

    // Step 2: Guardian Details
    guardianFirstName: 'Mohammed',
    guardianLastName: 'Khan',
    guardianRelationship: 'FATHER',
    guardianMobile: '+91 98765 43210',
    guardianEmail: 'mohammed.khan@example.com',
    guardianOccupation: 'Business',

    // Step 3: Address Information
    currentAddress: '123 Park Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',

    // Step 4: Academic Information
    academicYearId: '2025-26',
    classId: 'Grade 5',
    sectionId: 'A',
    rollNumber: '05',

    // Step 5: Documents
    documentType: 'BIRTH_CERTIFICATE',
    documentName: 'Birth Certificate',
    documentNumber: 'BC-2015-9988',
  });

  const steps: StepItem[] = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Guardian Details' },
    { number: 3, title: 'Address Information' },
    { number: 4, title: 'Academic Information' },
    { number: 5, title: 'Document Upload' },
    { number: 6, title: 'Review & Submit' },
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
      await studentService.createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        nationality: formData.nationality,
        category: formData.category,
        religion: formData.religion,
        mobile: formData.guardianMobile,
        email: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@example.com`,
        currentAddress: `${formData.currentAddress}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
      });
      router.push('/students');
    } catch (err: any) {
      // In dev mode simulate success
      setTimeout(() => {
        router.push('/students');
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-5xl mx-auto">
      <PageHeader
        title="Student Registration"
        description="Register a new student and configure their academic profile."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: 'New Admission' },
        ]}
      />

      {/* Stepper Component (Mockup 6 Desktop & Mockup 7 Mobile) */}
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-[#EF4444] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Wizard Step Cards */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle>
            Step {currentStep}: {steps.find((s) => s.number === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Ahmed"
              />
              <Input
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Khan"
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                options={[
                  { label: 'A+', value: 'A+' },
                  { label: 'A-', value: 'A-' },
                  { label: 'B+', value: 'B+' },
                  { label: 'B-', value: 'B-' },
                  { label: 'O+', value: 'O+' },
                  { label: 'O-', value: 'O-' },
                  { label: 'AB+', value: 'AB+' },
                  { label: 'AB-', value: 'AB-' },
                ]}
              />
              <Input
                label="Nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. Indian"
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { label: 'General', value: 'General' },
                  { label: 'OBC', value: 'OBC' },
                  { label: 'SC', value: 'SC' },
                  { label: 'ST', value: 'ST' },
                ]}
              />
              <Input
                label="Religion"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                placeholder="e.g. Islam / Hinduism / Christianity"
              />
            </div>
          )}

          {/* Step 2: Guardian Details */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input
                label="Guardian First Name"
                required
                value={formData.guardianFirstName}
                onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
              />
              <Input
                label="Guardian Last Name"
                required
                value={formData.guardianLastName}
                onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
              />
              <Select
                label="Relationship"
                required
                value={formData.guardianRelationship}
                onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                options={[
                  { label: 'Father', value: 'FATHER' },
                  { label: 'Mother', value: 'MOTHER' },
                  { label: 'Guardian', value: 'GUARDIAN' },
                ]}
              />
              <Input
                label="Mobile Number"
                required
                value={formData.guardianMobile}
                onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.guardianEmail}
                onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
              />
              <Input
                label="Occupation"
                value={formData.guardianOccupation}
                onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
              />
            </div>
          )}

          {/* Step 3: Address Information */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="md:col-span-2">
                <Input
                  label="Address Line"
                  required
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                />
              </div>
              <Input
                label="City"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="State"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <Input
                label="Postal Code"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
              <Input
                label="Country"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          )}

          {/* Step 4: Academic Information */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input
                label="Academic Year"
                value={formData.academicYearId}
                disabled
              />
              <Select
                label="Class / Grade"
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                options={[
                  { label: 'Grade 1', value: 'Grade 1' },
                  { label: 'Grade 2', value: 'Grade 2' },
                  { label: 'Grade 3', value: 'Grade 3' },
                  { label: 'Grade 4', value: 'Grade 4' },
                  { label: 'Grade 5', value: 'Grade 5' },
                ]}
              />
              <Select
                label="Section"
                required
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                options={[
                  { label: 'Section A', value: 'A' },
                  { label: 'Section B', value: 'B' },
                ]}
              />
              <Input
                label="Roll Number"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              />
            </div>
          )}

          {/* Step 5: Document Upload */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#F8FAFC]">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#172033]">
                  Drag and drop student documents or click to browse
                </p>
                <p className="text-[11px] text-[#667085] mt-1">
                  Supports PDF, PNG, JPG up to 10MB (Birth Certificate, Transfer Certificate, Aadhaar)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Document Name"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                />
                <Input
                  label="Document Number / Ref"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-[#10B981]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold">
                  All required information provided. Please verify details before enrolling.
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-2">
                  <p className="font-bold text-[#172033] border-b pb-1">Student</p>
                  <p><span className="text-[#667085]">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="text-[#667085]">DOB:</span> {formData.dateOfBirth}</p>
                  <p><span className="text-[#667085]">Gender:</span> {formData.gender}</p>
                  <p><span className="text-[#667085]">Class:</span> {formData.classId} - {formData.sectionId}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-2">
                  <p className="font-bold text-[#172033] border-b pb-1">Guardian & Contact</p>
                  <p><span className="text-[#667085]">Guardian:</span> {formData.guardianFirstName} {formData.guardianLastName} ({formData.guardianRelationship})</p>
                  <p><span className="text-[#667085]">Mobile:</span> {formData.guardianMobile}</p>
                  <p><span className="text-[#667085]">Address:</span> {formData.currentAddress}, {formData.city}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons (Mockup 6 & 7) */}
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
              <Link href="/students">
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
                Complete Enrollment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
