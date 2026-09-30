'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Edit,
  Camera,
  Upload,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { staffService, StaffMember } from '../../../../services/staff.service';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Tabs } from '../../../../components/ui/tabs';

export default function StaffProfile360Page() {
  const params = useParams();
  const staffId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: staffMember, isLoading } = useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffService.getStaff(staffId),
    enabled: !!staffId,
  });

  const displayStaff: StaffMember = staffMember || {
    id: staffId,
    employeeCode: 'EMP-2026-0001',
    firstName: 'Brandon',
    lastName: 'Sephton',
    email: 'brandon.sephton@school.edu',
    phone: '+91 98765 43210',
    gender: 'Male',
    dateOfBirth: '1988-04-15',
    dateOfJoining: '2022-06-01',
    employmentType: 'FULL_TIME',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    experienceYears: 8.5,
    maritalStatus: 'Married',
    bloodGroup: 'O+',
    emergencyContactName: 'Sarah Sephton',
    emergencyContactPhone: '+91 98765 00000',
    emergencyContactRelationship: 'Spouse',
    currentAddress: '456 College Avenue, Mumbai, Maharashtra - 400002, India',
    permanentAddress: '456 College Avenue, Mumbai, Maharashtra - 400002, India',
    bankAccountTitle: 'Brandon Sephton',
    bankName: 'HDFC Bank',
    bankAccountNumber: '50100234567890',
    bankIfscCode: 'HDFC0001234',
    panOrTaxId: 'ABCDE1234F',
    aadhaarOrNationalId: '9988 7766 5544',
    basicSalary: 65000,
    status: 'ACTIVE',
    department: { id: 'd1', name: 'Mathematics Department', code: 'MATH', status: 'ACTIVE', createdAt: '' },
    designation: { id: 'des1', title: 'Senior Lecturer', code: 'SR-LEC', level: 3, status: 'ACTIVE', createdAt: '' },
    documents: [
      {
        id: 'doc1',
        staffId,
        documentType: 'DEGREE_CERTIFICATE',
        documentName: 'Master of Science (Mathematics)',
        documentNumber: 'DEG-2012-9981',
        fileUrl: '#',
        fileName: 'msc_mathematics.pdf',
        mimeType: 'application/pdf',
        fileSize: 1048576,
        isVerified: true,
        createdAt: '',
      },
      {
        id: 'doc2',
        staffId,
        documentType: 'CONTRACT',
        documentName: 'Employment Agreement 2022-2026',
        documentNumber: 'EMP-AGR-001',
        fileUrl: '#',
        fileName: 'employment_contract.pdf',
        mimeType: 'application/pdf',
        fileSize: 2048576,
        isVerified: true,
        createdAt: '',
      },
    ],
    createdAt: '',
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'employment', label: 'Employment & Salary' },
    { id: 'documents', label: 'Documents', badge: displayStaff.documents?.length || 2 },
    { id: 'classes', label: 'Assigned Classes' },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff', href: '/staff' },
          { label: `${displayStaff.firstName} ${displayStaff.lastName}` },
        ]}
      />

      {/* Staff 360 Hero Header */}
      <div className="bg-white border border-[#E5EAF1] rounded-2xl p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4.5">
          <div className="relative">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white font-bold text-2xl flex items-center justify-center shadow-md border-2 border-white">
              {displayStaff.firstName?.[0]}
              {displayStaff.lastName?.[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-[#E5EAF1] shadow-xs flex items-center justify-center text-[#667085] hover:text-[#2563EB]">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-bold text-[#172033] tracking-tight">
                {displayStaff.firstName} {displayStaff.lastName}
              </h1>
              <Badge variant="success" dot size="sm">
                {displayStaff.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#667085] flex-wrap">
              <span className="font-mono font-semibold text-[#2563EB]">
                {displayStaff.employeeCode}
              </span>
              <span>•</span>
              <span className="font-medium text-[#172033]">
                {displayStaff.designation?.title || 'Senior Lecturer'}
              </span>
              <span>•</span>
              <span>{displayStaff.department?.name || 'Mathematics'}</span>
              <span>•</span>
              <span>Joined {new Date(displayStaff.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => alert('Edit Staff Dialog')}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        className="bg-white p-2 rounded-xl border border-[#E5EAF1] shadow-xs"
      />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Personal Info */}
          <div className="lg:col-span-6">
            <Card className="h-full">
              <CardHeader className="py-3.5">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs lg:text-sm">
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Full Name</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStaff.firstName} {displayStaff.middleName || ''} {displayStaff.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Gender</span>
                  <span className="font-semibold text-[#172033] capitalize">
                    {displayStaff.gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Date of Birth</span>
                  <span className="font-semibold text-[#172033]">
                    {new Date(displayStaff.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Marital Status</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStaff.maritalStatus || 'Married'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Blood Group</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStaff.bloodGroup || 'O+'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-[#667085]">Highest Qualification</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStaff.qualification || 'M.Sc. Mathematics'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Address */}
          <div className="lg:col-span-6">
            <Card className="h-full">
              <CardHeader className="py-3.5">
                <CardTitle>Contact & Emergency Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs lg:text-sm">
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Primary Mobile</span>
                  <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                    {displayStaff.phone}
                  </span>
                </div>
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Work Email</span>
                  <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                    {displayStaff.email}
                  </span>
                </div>
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Emergency Contact</span>
                  <span className="font-semibold text-[#172033] block">
                    {displayStaff.emergencyContactName} ({displayStaff.emergencyContactRelationship}) • {displayStaff.emergencyContactPhone}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block mb-0.5">Current Address</span>
                  <span className="font-medium text-[#172033] leading-relaxed block">
                    {displayStaff.currentAddress}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Employment & Salary */}
      {activeTab === 'employment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle>Department & Designation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs lg:text-sm">
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Department</span>
                <span className="font-semibold text-[#172033]">{displayStaff.department?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Designation</span>
                <span className="font-semibold text-[#172033]">{displayStaff.designation?.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Employment Type</span>
                <span className="font-semibold text-[#172033]">{displayStaff.employmentType.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-[#667085]">Total Experience</span>
                <span className="font-semibold text-[#172033]">{displayStaff.experienceYears} Years</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3.5">
              <CardTitle>Bank & Statutory Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs lg:text-sm">
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Bank Name</span>
                <span className="font-semibold text-[#172033]">{displayStaff.bankName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Account Number</span>
                <span className="font-mono font-semibold text-[#172033]">{displayStaff.bankAccountNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">IFSC Code</span>
                <span className="font-mono font-semibold text-[#172033]">{displayStaff.bankIfscCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">PAN / Tax ID</span>
                <span className="font-mono font-semibold text-[#172033]">{displayStaff.panOrTaxId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-[#667085]">Basic Monthly Salary</span>
                <span className="font-bold text-[#10B981]">₹ {displayStaff.basicSalary?.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#172033]">Employee Documents & Credentials</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => alert('Upload Document Dialog')}
            >
              Upload Document
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayStaff.documents?.map((doc) => (
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

      {/* Tab: Assigned Classes */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-[#2563EB]">
            <h4 className="text-xs font-bold text-[#172033]">Grade 5 - Section A</h4>
            <p className="text-[11px] text-[#667085] mt-0.5">Subject: Mathematics (Core)</p>
            <p className="text-[10px] text-[#98A2B3] mt-2">Class Teacher Assigned</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-[#F59E0B]">
            <h4 className="text-xs font-bold text-[#172033]">Grade 6 - Section B</h4>
            <p className="text-[11px] text-[#667085] mt-0.5">Subject: Advanced Statistics</p>
            <p className="text-[10px] text-[#98A2B3] mt-2">Subject Teacher</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-[#10B981]">
            <h4 className="text-xs font-bold text-[#172033]">Grade 7 - Section A</h4>
            <p className="text-[11px] text-[#667085] mt-0.5">Subject: Geometry & Algebra</p>
            <p className="text-[10px] text-[#98A2B3] mt-2">Subject Teacher</p>
          </Card>
        </div>
      )}
    </div>
  );
}
