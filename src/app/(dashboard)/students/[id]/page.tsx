'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  Edit,
  Camera,
  HeartHandshake,
  FileText,
  Clock,
  CreditCard,
  Award,
} from 'lucide-react';
import { studentService } from '../../../../services/student.service';
import { documentService } from '../../../../services/document.service';
import { academicService } from '../../../../services/academic.service';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Tabs } from '../../../../components/ui/tabs';
import { Modal } from '../../../../components/ui/modal';

export default function StudentProfile360Page() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = params.id as string;

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch Student 360
  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudent(studentId),
    enabled: !!studentId,
  });

  // Mock Student data for preview if database is fresh
  const displayStudent = student || {
    id: studentId,
    studentCode: 'STU-2026-0001',
    firstName: 'Ahmed',
    lastName: 'Khan',
    dateOfBirth: '2015-05-12',
    gender: 'Male',
    bloodGroup: 'B+',
    category: 'General',
    nationality: 'Indian',
    religion: 'Islam',
    mobile: '+91 98765 43210',
    email: 'ahmed.khan@example.com',
    currentAddress: '123 Park Street, Mumbai, Maharashtra - 400001, India',
    status: 'ACTIVE',
    enrollments: [
      {
        id: 'e1',
        academicYear: { name: '2025-26' },
        class: { name: 'Grade 5' },
        section: { name: 'A' },
        rollNumber: '05',
        status: 'ENROLLED',
      },
    ],
    guardians: [
      {
        relationship: 'FATHER',
        isPrimary: true,
        guardian: {
          firstName: 'Mohammed',
          lastName: 'Khan',
          mobile: '+91 98765 43210',
          email: 'mohammed.khan@example.com',
          occupation: 'Business',
        },
      },
      {
        relationship: 'MOTHER',
        isPrimary: false,
        guardian: {
          firstName: 'Fatima',
          lastName: 'Khan',
          mobile: '+91 98765 43211',
          email: 'fatima.khan@example.com',
          occupation: 'Teacher',
        },
      },
    ],
    documents: [
      {
        id: 'doc1',
        documentName: 'Birth Certificate',
        documentType: 'BIRTH_CERTIFICATE',
        documentNumber: 'BC-2015-9988',
        isVerified: true,
      },
      {
        id: 'doc2',
        documentName: 'Previous School Transfer Certificate',
        documentType: 'TRANSFER_CERTIFICATE',
        documentNumber: 'TC-2024-1122',
        isVerified: true,
      },
    ],
  };

  const activeEnrollment = displayStudent.enrollments?.[0];
  const primaryGuardian = displayStudent.guardians?.find((g: any) => g.isPrimary) || displayStudent.guardians?.[0];

  const profileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic' },
    { id: 'guardians', label: 'Guardians' },
    { id: 'documents', label: 'Documents', badge: displayStudent.documents?.length || 2 },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: `${displayStudent.firstName} ${displayStudent.lastName}` },
        ]}
      />

      {/* Hero Profile Banner (Mockup 5 & 13) */}
      <div className="bg-white border border-[#E5EAF1] rounded-2xl p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4.5">
          <div className="relative">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white font-bold text-2xl flex items-center justify-center shadow-md border-2 border-white">
              {displayStudent.firstName?.[0]}
              {displayStudent.lastName?.[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-[#E5EAF1] shadow-xs flex items-center justify-center text-[#667085] hover:text-[#2563EB]">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-bold text-[#172033] tracking-tight">
                {displayStudent.firstName} {displayStudent.lastName}
              </h1>
              <Badge variant="success" dot size="sm">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#667085] flex-wrap">
              <span className="font-mono font-semibold text-[#2563EB]">
                {displayStudent.studentCode}
              </span>
              <span>•</span>
              <span className="font-medium">
                {activeEnrollment?.class?.name || 'Grade 5'} - {activeEnrollment?.section?.name || 'A'}
              </span>
              <span>•</span>
              <span>Academic Year {activeEnrollment?.academicYear?.name || '2025–26'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => alert('Edit Student dialog')}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Tabs Navigation */}
      <Tabs
        tabs={profileTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        className="bg-white p-2 rounded-xl border border-[#E5EAF1] shadow-xs"
      />

      {/* Tab: Overview (Mockup 5 Desktop & Mockup 13 Mobile) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Personal Information (4.5 Cols) */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <CardHeader className="py-3.5">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs lg:text-sm">
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Full Name</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.firstName} {displayStudent.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Date of Birth</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.dateOfBirth ? new Date(displayStudent.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 May 2015'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Gender</span>
                  <span className="font-semibold text-[#172033] capitalize">
                    {displayStudent.gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Blood Group</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.bloodGroup || 'B+'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Category</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.category || 'General'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-[#667085]">Nationality</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.nationality || 'Indian'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information (4.5 Cols) */}
          <div className="lg:col-span-4">
            <Card className="h-full">
              <CardHeader className="py-3.5">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs lg:text-sm">
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Mobile</span>
                  <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                    {displayStudent.mobile || '+91 98765 43210'}
                  </span>
                </div>
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Email</span>
                  <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                    {displayStudent.email || 'ahmed.khan@example.com'}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block mb-0.5">Address</span>
                  <span className="font-medium text-[#172033] leading-relaxed block">
                    {displayStudent.currentAddress || '123 Park Street, Mumbai, Maharashtra - 400001, India'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Photo Preview & Quick Actions (3 Cols) */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#93C5FD] text-white font-bold text-3xl flex items-center justify-center shadow-lg border-4 border-white mb-3">
                {displayStudent.firstName?.[0]}
                {displayStudent.lastName?.[0]}
              </div>
              <p className="text-xs font-bold text-[#172033]">
                {displayStudent.firstName} {displayStudent.lastName}
              </p>
              <p className="text-[11px] font-mono text-[#667085] mt-0.5 mb-4">
                {displayStudent.studentCode}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Camera className="w-3.5 h-3.5" />}
              >
                Change Photo
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Academic */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle>Current Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs lg:text-sm">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Academic Year</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.academicYear?.name || '2025-26'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Class</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.class?.name || 'Grade 5'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Section</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.section?.name || 'Section A'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-[#667085]">Roll Number</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.rollNumber || '05'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Guardians */}
      {activeTab === 'guardians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayStudent.guardians?.map((g: any, idx: number) => (
            <Card key={idx}>
              <CardHeader className="py-3.5">
                <div className="flex items-center justify-between w-full">
                  <CardTitle>
                    {g.guardian?.firstName} {g.guardian?.lastName}
                  </CardTitle>
                  <Badge variant={g.isPrimary ? 'primary' : 'neutral'} size="sm">
                    {g.relationship} {g.isPrimary && '• Primary'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs lg:text-sm">
                <p className="text-[#667085]">
                  Mobile: <span className="font-semibold text-[#172033]">{g.guardian?.mobile}</span>
                </p>
                <p className="text-[#667085]">
                  Email: <span className="font-semibold text-[#172033]">{g.guardian?.email}</span>
                </p>
                <p className="text-[#667085]">
                  Occupation: <span className="font-semibold text-[#172033]">{g.guardian?.occupation || 'Salaried'}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#172033]">Verified Student Documents</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Document
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayStudent.documents?.map((doc: any) => (
              <Card key={doc.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#172033]">{doc.documentName}</p>
                    <p className="text-[11px] text-[#98A2B3]">{doc.documentNumber}</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">Verified</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
