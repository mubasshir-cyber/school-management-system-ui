'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  AlertCircle,
  FileText,
  Trash2,
  Sparkles,
  Eye,
  Plus,
  ExternalLink,
  X,
} from 'lucide-react';
import { studentService } from '../../../../services/student.service';
import { academicService } from '../../../../services/academic.service';
import { enrollmentService } from '../../../../services/enrollment.service';
import { documentService } from '../../../../services/document.service';
import { guardianService } from '../../../../services/guardian.service';
import { PageHeader } from '../../../../components/ui/page-header';
import { Stepper, StepItem } from '../../../../components/ui/stepper';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { Camera } from 'lucide-react';

export interface DocumentUploadItem {
  id: string;
  file?: File;
  previewUrl?: string;
  documentType: string;
  documentName: string;
  documentNumber: string;
}

export default function StudentRegistrationWizardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentUploadItem | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Queries for dynamic Academic Year, Classes, and Sections
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: academicService.getAcademicYears,
  });

  const { data: currentAcademicYear } = useQuery({
    queryKey: ['current-academic-year'],
    queryFn: academicService.getCurrentAcademicYear,
  });

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: 'Indian',
    category: '',
    religion: 'Muslim',
    photoUrl: '',

    // Step 2: Guardian Details
    guardianFirstName: '',
    guardianLastName: '',
    guardianRelationship: '',
    guardianMobile: '',
    guardianEmail: '',
    guardianOccupation: '',

    // Step 3: Address Information
    currentAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

    // Step 4: Academic Information
    academicYearId: '',
    classId: '',
    sectionId: '',
    rollNumber: '',
  });

  // Auto-select active/current Academic Year once loaded
  useEffect(() => {
    if (!formData.academicYearId && academicYears.length > 0) {
      const activeYear = currentAcademicYear || academicYears.find((y) => y.isCurrent) || academicYears[0];
      if (activeYear) {
        setFormData((prev) => ({ ...prev, academicYearId: activeYear.id }));
      }
    }
  }, [academicYears, currentAcademicYear, formData.academicYearId]);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', formData.academicYearId],
    queryFn: () => academicService.getClasses(formData.academicYearId || undefined),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', formData.classId, formData.academicYearId],
    queryFn: () => academicService.getSections(formData.classId || undefined, formData.academicYearId || undefined),
  });

  // Query existing enrollments for the selected class & section to auto-generate the next roll number
  const { data: existingEnrollments = [] } = useQuery({
    queryKey: ['enrollments-count', formData.academicYearId, formData.classId, formData.sectionId],
    queryFn: () =>
      enrollmentService.getEnrollments({
        academicYearId: formData.academicYearId || undefined,
        classId: formData.classId || undefined,
        sectionId: formData.sectionId || undefined,
      }),
    enabled: !!formData.classId,
  });

  // Auto-generate next roll number whenever class or section is selected
  useEffect(() => {
    if (formData.classId) {
      const nextRoll = String(existingEnrollments.length + 1).padStart(2, '0');
      setFormData((prev) => ({
        ...prev,
        rollNumber: nextRoll,
      }));
    }
  }, [existingEnrollments.length, formData.classId, formData.sectionId]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreviewUrl(base64);
        setFormData((prev) => ({ ...prev, photoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setDocuments((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: base64,
            documentType: 'BIRTH_CERTIFICATE',
            documentName: file.name.replace(/\.[^/.]+$/, ''),
            documentNumber: '',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setDocuments((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: base64,
            documentType: 'BIRTH_CERTIFICATE',
            documentName: file.name.replace(/\.[^/.]+$/, ''),
            documentNumber: '',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDoc = (id: string, field: keyof DocumentUploadItem, val: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const cleanSlug = `${formData.firstName} ${formData.lastName}`
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.');
      const studentEmail = cleanSlug ? `${cleanSlug}@school.edu` : undefined;

      const studentPayload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || undefined,
        nationality: formData.nationality || 'Indian',
        category: formData.category || 'General',
        religion: formData.religion || 'Muslim',
        mobile: formData.guardianMobile?.trim() || undefined,
        email: studentEmail,
        addressLine1: formData.currentAddress?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        country: formData.country?.trim() || 'India',
        postalCode: formData.postalCode?.trim() || undefined,
        photoUrl: formData.photoUrl || undefined,
      };

      const createdStudent = await studentService.createStudent(studentPayload);

      if (createdStudent?.id && formData.guardianFirstName && formData.guardianLastName) {
        try {
          const guardianEmail = formData.guardianEmail?.trim() || undefined;
          const guardian = await guardianService.createGuardian({
            firstName: formData.guardianFirstName.trim(),
            lastName: formData.guardianLastName.trim(),
            mobile: formData.guardianMobile?.trim() || '0000000000',
            email: guardianEmail,
            occupation: formData.guardianOccupation?.trim() || undefined,
            relationshipType: formData.guardianRelationship || 'FATHER',
          });

          if (guardian?.id) {
            await guardianService.linkGuardian(createdStudent.id, {
              guardianId: guardian.id,
              relationshipType: formData.guardianRelationship || 'FATHER',
              isPrimary: true,
            });
          }
        } catch (gErr) {
          console.error('Failed to link guardian:', gErr);
        }
      }

      if (createdStudent?.id && formData.academicYearId && formData.classId) {
        try {
          await enrollmentService.createEnrollment({
            studentId: createdStudent.id,
            academicYearId: formData.academicYearId,
            classId: formData.classId,
            sectionId: formData.sectionId || undefined,
            rollNumber: formData.rollNumber || undefined,
          });
        } catch (enrollErr) {
          console.error('Failed to create enrollment:', enrollErr);
        }
      }

      if (createdStudent?.id && documents.length > 0) {
        for (const doc of documents) {
          try {
            await documentService.uploadDocument({
              studentId: createdStudent.id,
              documentType: doc.documentType || 'BIRTH_CERTIFICATE',
              documentName: doc.documentName || doc.file?.name || 'Document',
              documentNumber: doc.documentNumber || undefined,
              fileName: doc.file?.name || 'document.pdf',
              fileUrl: doc.previewUrl || '/uploads/' + (doc.file?.name || 'document.pdf'),
              mimeType: doc.file?.type || 'application/pdf',
              fileSize: Math.round(doc.file?.size || 1024),
            });
          } catch (docErr) {
            console.error('Failed to upload document:', docErr);
          }
        }
      }

      if (createdStudent?.id) {
        router.push(`/students/${createdStudent.id}`);
      } else {
        router.push('/students');
      }
    } catch (err: any) {
      console.error('Student registration error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to complete student registration');
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
            <div className="space-y-6">
              {/* Profile Photo Uploader */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#DBEAFE] bg-[#EFF6FF] flex items-center justify-center shadow-xs">
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Student Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#94A3B8]">
                        <Camera className="w-7 h-7 stroke-1 text-[#94A3B8]" />
                        <span className="text-[10px] mt-0.5 font-medium">No Photo</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => profilePhotoRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    title="Change Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-xs font-bold text-[#172033]">
                    Student Profile Photo
                  </h4>
                  <p className="text-[11px] text-[#667085]">
                    Upload a passport-size photo (PNG, JPG, max 5MB).
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={profilePhotoRef}
                      onChange={handlePhotoChange}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => profilePhotoRef.current?.click()}
                      className="text-xs h-7.5"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {photoPreviewUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {photoPreviewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPhotoPreviewUrl(null);
                          setFormData((prev) => ({ ...prev, photoUrl: '' }));
                          if (profilePhotoRef.current) profilePhotoRef.current.value = '';
                        }}
                        className="text-xs h-7.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
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
                    { label: 'Select Gender', value: '' },
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
                    { label: 'Select Blood Group', value: '' },
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
                <Select
                  label="Nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  options={[
                    { label: 'Indian', value: 'Indian' },
                    { label: 'Emirati', value: 'Emirati' },
                    { label: 'Saudi', value: 'Saudi' },
                    { label: 'Omani', value: 'Omani' },
                    { label: 'Qatari', value: 'Qatari' },
                    { label: 'Kuwaiti', value: 'Kuwaiti' },
                    { label: 'Bahraini', value: 'Bahraini' },
                    { label: 'American', value: 'American' },
                    { label: 'British', value: 'British' },
                    { label: 'Canadian', value: 'Canadian' },
                    { label: 'Australian', value: 'Australian' },
                    { label: 'Other', value: 'Other' },
                  ]}
                />
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { label: 'Select Category', value: '' },
                    { label: 'General', value: 'General' },
                    { label: 'OBC', value: 'OBC' },
                    { label: 'SC', value: 'SC' },
                    { label: 'ST', value: 'ST' },
                  ]}
                />
                <Select
                  label="Religion"
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  options={[
                    { label: 'Muslim', value: 'Muslim' },
                    { label: 'Islam', value: 'Islam' },
                    { label: 'Hindu', value: 'Hindu' },
                    { label: 'Christian', value: 'Christian' },
                    { label: 'Sikh', value: 'Sikh' },
                    { label: 'Buddhist', value: 'Buddhist' },
                    { label: 'Jain', value: 'Jain' },
                    { label: 'Other', value: 'Other' },
                  ]}
                />
              </div>
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
                placeholder="e.g. Mohammed"
              />
              <Input
                label="Guardian Last Name"
                required
                value={formData.guardianLastName}
                onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
                placeholder="e.g. Khan"
              />
              <Select
                label="Relationship"
                required
                value={formData.guardianRelationship}
                onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                options={[
                  { label: 'Select Relationship', value: '' },
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
                placeholder="e.g. +91 98765 43210"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.guardianEmail}
                onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                placeholder="e.g. mohammed.khan@example.com"
              />
              <Input
                label="Occupation"
                value={formData.guardianOccupation}
                onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                placeholder="e.g. Business / Engineer"
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
                  placeholder="e.g. 123 Park Street, Apt 4B"
                />
              </div>
              <Input
                label="City"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
              />
              <Input
                label="State"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
              />
              <Input
                label="Postal Code"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g. 400001"
              />
              <Input
                label="Country"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. India"
              />
            </div>
          )}

          {/* Step 4: Academic Information */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Select
                label="Academic Year"
                required
                value={formData.academicYearId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    academicYearId: e.target.value,
                    classId: '',
                    sectionId: '',
                  })
                }
                options={[
                  { label: 'Select Academic Year', value: '' },
                  ...academicYears.map((ay) => ({
                    label: `${ay.name}${ay.isCurrent ? ' (Active Session)' : ''}`,
                    value: ay.id,
                  })),
                ]}
              />
              <Select
                label="Class / Grade"
                required
                value={formData.classId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    sectionId: '',
                  })
                }
                options={[
                  { label: 'Select Class', value: '' },
                  ...classes.map((c) => ({
                    label: c.name,
                    value: c.id,
                  })),
                ]}
              />
              <Select
                label="Section"
                required
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                options={[
                  { label: 'Select Section', value: '' },
                  ...sections.map((s) => ({
                    label: s.name?.toLowerCase().startsWith('section') ? s.name : `Section ${s.name || s.code}`,
                    value: s.id,
                  })),
                ]}
              />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#172033]">
                    Roll Number
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE]">
                    <Sparkles className="w-3 h-3 text-[#2563EB]" />
                    Auto-generated
                  </span>
                </div>
                <Input
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 01"
                />
              </div>
            </div>
          )}

          {/* Step 5: Document Upload */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                multiple
                className="hidden"
              />

              {documents.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#93C5FD] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-[#172033]">
                    Drag and drop student documents or click to browse
                  </p>
                  <p className="text-[11px] text-[#667085] mt-1 mb-3">
                    Supports PDF, PNG, JPG up to 10MB (Birth Certificate, Transfer Certificate, Aadhaar)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Select Documents from Device
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#172033]">
                      Attached Documents ({documents.length})
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5 text-[#2563EB]" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      + Add More Document
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {documents.map((doc, idx) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl border border-[#E5EAF1] bg-[#F8FAFC] space-y-3"
                      >
                        {/* File Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EAF1] text-[#2563EB] flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#172033] truncate">
                                {doc.file?.name || doc.documentName || `Document ${idx + 1}`}
                              </p>
                              <p className="text-[11px] text-[#667085]">
                                {doc.file ? `${(doc.file.size / 1024).toFixed(1)} KB` : 'Attached'} • Document #{idx + 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              leftIcon={<Eye className="w-3.5 h-3.5 text-[#2563EB]" />}
                              onClick={() => setPreviewDoc(doc)}
                            >
                              View
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="p-2 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Document Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#E5EAF1]">
                          <Select
                            label="Document Type"
                            value={doc.documentType}
                            onChange={(e) => handleUpdateDoc(doc.id, 'documentType', e.target.value)}
                            options={[
                              { label: 'Birth Certificate', value: 'BIRTH_CERTIFICATE' },
                              { label: 'Aadhaar / National ID', value: 'GOVERNMENT_ID' },
                              { label: 'Transfer Certificate (TC)', value: 'TRANSFER_CERTIFICATE' },
                              { label: 'Previous Marksheet', value: 'PREVIOUS_MARKSHEET' },
                              { label: 'Medical Certificate', value: 'MEDICAL_CERTIFICATE' },
                              { label: 'Address Proof', value: 'ADDRESS_PROOF' },
                              { label: 'Passport Photo', value: 'PASSPORT_PHOTO' },
                              { label: 'Other Document', value: 'OTHER' },
                            ]}
                          />
                          <Input
                            label="Document Name / Title"
                            value={doc.documentName}
                            onChange={(e) => handleUpdateDoc(doc.id, 'documentName', e.target.value)}
                            placeholder="e.g. Birth Certificate"
                          />
                          <Input
                            label="Document Ref / Number"
                            value={doc.documentNumber}
                            onChange={(e) => handleUpdateDoc(doc.id, 'documentNumber', e.target.value)}
                            placeholder="e.g. BC-2015-9988"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-[#CBD5E1] rounded-xl p-3 text-center cursor-pointer hover:bg-white transition-colors flex items-center justify-center gap-2 text-xs font-medium text-[#2563EB]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Click to attach more documents</span>
                  </div>
                </div>
              )}
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
                  <div className="flex items-center justify-between border-b pb-2">
                    <p className="font-bold text-[#172033]">Student Information</p>
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Preview"
                        className="w-8 h-8 rounded-full object-cover border border-[#DBEAFE]"
                      />
                    ) : (
                      <span className="text-[10px] text-[#94A3B8] italic">No photo</span>
                    )}
                  </div>
                  <p><span className="text-[#667085]">Name:</span> {`${formData.firstName} ${formData.lastName}`.trim() || '-'}</p>
                  <p><span className="text-[#667085]">DOB:</span> {formData.dateOfBirth || '-'}</p>
                  <p><span className="text-[#667085]">Gender:</span> {formData.gender || '-'}</p>
                  <p><span className="text-[#667085]">Nationality:</span> {formData.nationality || '-'}</p>
                  <p><span className="text-[#667085]">Religion:</span> {formData.religion || '-'}</p>
                  <p>
                    <span className="text-[#667085]">Academic Year:</span>{' '}
                    {academicYears.find((y) => y.id === formData.academicYearId)?.name || formData.academicYearId || '-'}
                  </p>
                  <p>
                    <span className="text-[#667085]">Class:</span>{' '}
                    {classes.find((c) => c.id === formData.classId)?.name || formData.classId || '-'}{' '}
                    {sections.find((s) => s.id === formData.sectionId)?.name ? `- Section ${sections.find((s) => s.id === formData.sectionId)?.name}` : ''}
                  </p>
                  <p><span className="text-[#667085]">Roll Number:</span> {formData.rollNumber || '-'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-2">
                  <p className="font-bold text-[#172033] border-b pb-2">Guardian & Documents</p>
                  <p><span className="text-[#667085]">Guardian:</span> {`${formData.guardianFirstName} ${formData.guardianLastName}`.trim() || '-'} {formData.guardianRelationship ? `(${formData.guardianRelationship})` : ''}</p>
                  <p><span className="text-[#667085]">Mobile:</span> {formData.guardianMobile || '-'}</p>
                  <p><span className="text-[#667085]">Address:</span> {formData.currentAddress ? `${formData.currentAddress}${formData.city ? `, ${formData.city}` : ''}` : '-'}</p>
                  <p><span className="text-[#667085]">Documents Attached:</span> {documents.length > 0 ? `${documents.length} document(s)` : 'None'}</p>
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.documentName || previewDoc.file?.name || 'Document Preview'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5EAF1] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#172033] block">
                  {previewDoc.documentName || previewDoc.file?.name}
                </span>
                <span className="text-[#667085]">
                  Type: {previewDoc.documentType} {previewDoc.documentNumber ? `• Ref: ${previewDoc.documentNumber}` : ''}
                </span>
              </div>
              {previewDoc.previewUrl && (
                <a
                  href={previewDoc.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
              )}
            </div>

            <div className="w-full min-h-[350px] max-h-[65vh] overflow-auto flex items-center justify-center bg-[#F1F5F9] rounded-xl p-2 border border-[#CBD5E1]">
              {(() => {
                const isImage =
                  previewDoc.file?.type.startsWith('image/') ||
                  previewDoc.previewUrl?.startsWith('data:image') ||
                  /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(previewDoc.file?.name || '');
                const isPdf =
                  previewDoc.file?.type === 'application/pdf' ||
                  previewDoc.previewUrl?.startsWith('data:application/pdf') ||
                  /\.pdf$/i.test(previewDoc.file?.name || '');

                if (isImage && previewDoc.previewUrl) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewDoc.previewUrl}
                      alt={previewDoc.documentName}
                      className="max-h-[55vh] max-w-full rounded-lg object-contain shadow-sm"
                    />
                  );
                }

                if (isPdf && previewDoc.previewUrl) {
                  return (
                    <iframe
                      src={previewDoc.previewUrl}
                      title={previewDoc.documentName || 'PDF Preview'}
                      className="w-full h-[55vh] rounded-lg border border-slate-300 bg-white"
                    />
                  );
                }

                return (
                  <div className="text-center py-12 space-y-2">
                    <FileText className="w-16 h-16 text-[#2563EB] mx-auto opacity-70" />
                    <p className="text-xs font-bold text-[#172033]">
                      {previewDoc.file?.name || 'Document Attached'}
                    </p>
                    <p className="text-[11px] text-[#667085]">
                      Preview ready for upload ({previewDoc.file ? (previewDoc.file.size / 1024).toFixed(1) : 0} KB)
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
