'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  ExternalLink,
  Download,
  X,
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
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { EmptyState } from '../../../../components/ui/empty-state';
import { Skeleton } from '../../../../components/ui/skeleton';

export default function StudentProfile360Page() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = params.id as string;

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: 'Indian',
    religion: 'Muslim',
    category: 'General',
    mobile: '',
    email: '',
    addressLine1: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
  });

  // New Document Upload State
  const [newDocData, setNewDocData] = useState({
    documentType: 'BIRTH_CERTIFICATE',
    documentName: '',
    documentNumber: '',
    file: null as File | null,
    previewUrl: '',
  });

  // Fetch Student 360
  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudent(studentId),
    enabled: !!studentId,
  });

  // Sync edit form with student data when student loads or edit modal opens
  useEffect(() => {
    if (student) {
      setEditForm({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).split('T')[0] : '',
        gender: student.gender || '',
        bloodGroup: student.bloodGroup || '',
        nationality: student.nationality || 'Indian',
        religion: student.religion || 'Muslim',
        category: student.category || 'General',
        mobile: student.mobile || '',
        email: student.email || '',
        addressLine1: student.addressLine1 || student.currentAddress || '',
        city: student.city || '',
        state: student.state || '',
        country: student.country || 'India',
        postalCode: student.postalCode || '',
      });
      setImgError(false);
    }
  }, [student]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdatingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        await studentService.updateStudent(studentId, { photoUrl: base64 });
        setImgError(false);
        queryClient.invalidateQueries({ queryKey: ['student', studentId] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } catch (err) {
        console.error('Failed to update student photo:', err);
      } finally {
        setIsUpdatingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setEditError(null);

    try {
      await studentService.updateStudent(studentId, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        bloodGroup: editForm.bloodGroup || undefined,
        nationality: editForm.nationality || undefined,
        religion: editForm.religion || undefined,
        category: editForm.category || undefined,
        mobile: editForm.mobile?.trim() || undefined,
        email: editForm.email?.trim() || undefined,
        addressLine1: editForm.addressLine1?.trim() || undefined,
        city: editForm.city?.trim() || undefined,
        state: editForm.state?.trim() || undefined,
        country: editForm.country?.trim() || 'India',
        postalCode: editForm.postalCode?.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Failed to update student:', err);
      setEditError(err.response?.data?.message || err.message || 'Failed to update student details');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDocData((prev) => ({
        ...prev,
        file,
        previewUrl: reader.result as string,
        documentName: prev.documentName || file.name.replace(/\.[^/.]+$/, ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocData.file && !newDocData.previewUrl) return;

    setIsUploadingDoc(true);
    try {
      await documentService.uploadDocument({
        studentId,
        documentType: newDocData.documentType,
        documentName: newDocData.documentName || newDocData.file?.name || 'Document',
        documentNumber: newDocData.documentNumber || undefined,
        fileName: newDocData.file?.name || 'document.pdf',
        fileUrl: newDocData.previewUrl || '/uploads/document.pdf',
        mimeType: newDocData.file?.type || 'application/pdf',
        fileSize: Math.round(newDocData.file?.size || 1024),
      });

      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      setShowUploadModal(false);
      setNewDocData({
        documentType: 'BIRTH_CERTIFICATE',
        documentName: '',
        documentNumber: '',
        file: null,
        previewUrl: '',
      });
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-5 pb-12">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Students', href: '/students' },
            { label: 'Profile' },
          ]}
        />
        <EmptyState
          title="Student Not Found"
          description="The student record you are looking for does not exist in the database."
          actionLabel="Back to Students Directory"
          onAction={() => router.push('/students')}
        />
      </div>
    );
  }

  const displayStudent = student;
  const activeEnrollment = displayStudent.enrollments?.[0];

  const profileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic' },
    { id: 'guardians', label: 'Guardians' },
    { id: 'documents', label: 'Documents', badge: displayStudent.documents?.length || 0 },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees' },
    { id: 'history', label: 'History' },
  ];

  const hasPhoto = !!displayStudent.photoUrl && !imgError;

  return (
    <div className="space-y-5 pb-12">
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: `${displayStudent.firstName} ${displayStudent.lastName}` },
        ]}
      />

      {/* Hero Profile Banner */}
      <div className="bg-white border border-[#E5EAF1] rounded-2xl p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4.5">
          <div className="relative group">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white font-bold text-2xl flex items-center justify-center shadow-md border-2 border-white">
              {hasPhoto ? (
                <img
                  src={displayStudent.photoUrl}
                  alt={`${displayStudent.firstName} ${displayStudent.lastName}`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="select-none">
                  {displayStudent.firstName?.[0]}
                  {displayStudent.lastName?.[0]}
                </span>
              )}
            </div>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={isUpdatingPhoto}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-[#E5EAF1] shadow-xs flex items-center justify-center text-[#667085] hover:text-[#2563EB] cursor-pointer hover:bg-slate-50 transition-colors"
              title="Upload / Change Photo"
            >
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
                {activeEnrollment?.class?.name ? `${activeEnrollment.class.name} - ${activeEnrollment.section?.name || 'A'}` : '-'}
              </span>
              <span>•</span>
              <span>Academic Year {activeEnrollment?.academicYear?.name || '-'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => setShowEditModal(true)}
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

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Info Cards (9 Cols) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Personal Info Card */}
            <Card className="h-full">
              <CardHeader className="py-3.5">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs lg:text-sm">
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Full Name</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.firstName} {displayStudent.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Date of Birth</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.dateOfBirth
                      ? new Date(displayStudent.dateOfBirth).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Gender</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.gender || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Blood Group</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.bloodGroup || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Category</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.category || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085]">Nationality</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.nationality || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#667085]">Religion</span>
                  <span className="font-semibold text-[#172033]">
                    {displayStudent.religion || '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="h-full">
              <CardHeader className="py-3.5">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs lg:text-sm">
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Mobile</span>
                  <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                    {displayStudent.mobile || '-'}
                  </span>
                </div>
                <div className="pb-2.5 border-b border-[#F1F5F9]">
                  <span className="text-[#667085] block mb-0.5">Email</span>
                  <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                    {displayStudent.email || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block mb-0.5">Address</span>
                  <span className="font-medium text-[#172033] leading-relaxed block">
                    {displayStudent.addressLine1 || displayStudent.currentAddress || '-'}
                    {displayStudent.city ? `, ${displayStudent.city}` : ''}
                    {displayStudent.state ? `, ${displayStudent.state}` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Photo Preview & Quick Actions (3 Cols) */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#2563EB] to-[#93C5FD] text-white font-bold text-3xl flex items-center justify-center shadow-lg border-4 border-white mb-3">
                {hasPhoto ? (
                  <img
                    src={displayStudent.photoUrl}
                    alt={`${displayStudent.firstName} ${displayStudent.lastName}`}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="select-none">
                    {displayStudent.firstName?.[0]}
                    {displayStudent.lastName?.[0]}
                  </span>
                )}
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
                onClick={() => photoInputRef.current?.click()}
                leftIcon={<Camera className="w-3.5 h-3.5" />}
                disabled={isUpdatingPhoto}
              >
                {isUpdatingPhoto ? 'Updating...' : 'Change Photo'}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Academic */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle>Current Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs lg:text-sm">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Academic Year</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.academicYear?.name || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Class</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.class?.name || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#667085]">Section</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.section?.name || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-[#667085]">Roll Number</span>
                <span className="font-semibold text-[#172033]">
                  {activeEnrollment?.rollNumber || '-'}
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
                    {g.relationshipType || g.relationship || 'Guardian'} {g.isPrimary && '• Primary'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs lg:text-sm">
                <p className="text-[#667085]">
                  Mobile: <span className="font-semibold text-[#172033]">{g.guardian?.mobile || '-'}</span>
                </p>
                <p className="text-[#667085]">
                  Email: <span className="font-semibold text-[#172033]">{g.guardian?.email || '-'}</span>
                </p>
                <p className="text-[#667085]">
                  Occupation: <span className="font-semibold text-[#172033]">{g.guardian?.occupation || '-'}</span>
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
            <h3 className="text-sm font-bold text-[#172033]">Student Documents</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Document
            </Button>
          </div>
          {(!displayStudent.documents || displayStudent.documents.length === 0) ? (
            <EmptyState
              title="No Documents Uploaded"
              description="Upload certificates, identity proofs, or transfer documents for this student."
              actionLabel="Upload First Document"
              onAction={() => setShowUploadModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayStudent.documents.map((doc: any) => (
                <Card key={doc.id} className="p-4 flex items-center justify-between hover:border-[#CBD5E1] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#172033]">{doc.documentName}</p>
                      <p className="text-[11px] text-[#667085]">
                        {doc.documentType?.replace(/_/g, ' ')} {doc.documentNumber ? `• ${doc.documentNumber}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDoc(doc)}
                      className="text-xs h-7.5"
                      leftIcon={<Eye className="w-3.5 h-3.5 text-[#2563EB]" />}
                    >
                      View
                    </Button>
                    {doc.isVerified && <Badge variant="success" size="sm">Verified</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student Profile"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <Input
              label="First Name"
              required
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              value={editForm.dateOfBirth}
              onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
            />
            <Select
              label="Gender"
              required
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
            />
            <Select
              label="Blood Group"
              value={editForm.bloodGroup}
              onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
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
              value={editForm.nationality}
              onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
              options={[
                { label: 'Indian', value: 'Indian' },
                { label: 'Emirati', value: 'Emirati' },
                { label: 'Saudi', value: 'Saudi' },
                { label: 'American', value: 'American' },
                { label: 'British', value: 'British' },
                { label: 'Canadian', value: 'Canadian' },
                { label: 'Other', value: 'Other' },
              ]}
            />
            <Select
              label="Religion"
              value={editForm.religion}
              onChange={(e) => setEditForm({ ...editForm, religion: e.target.value })}
              options={[
                { label: 'Muslim', value: 'Muslim' },
                { label: 'Islam', value: 'Islam' },
                { label: 'Hindu', value: 'Hindu' },
                { label: 'Christian', value: 'Christian' },
                { label: 'Sikh', value: 'Sikh' },
                { label: 'Other', value: 'Other' },
              ]}
            />
            <Select
              label="Category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              options={[
                { label: 'General', value: 'General' },
                { label: 'OBC', value: 'OBC' },
                { label: 'SC', value: 'SC' },
                { label: 'ST', value: 'ST' },
              ]}
            />
            <Input
              label="Mobile Number"
              value={editForm.mobile}
              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
              placeholder="e.g. +91 9876543210"
            />
            <Input
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="student@school.edu"
            />
            <div className="sm:col-span-2">
              <Input
                label="Residential Address"
                value={editForm.addressLine1}
                onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                placeholder="Street address, apartment, flat no"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E5EAF1]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document View / Preview Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.documentName || 'Document Preview'}
        size="lg"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5EAF1] flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#172033] block">{selectedDoc.documentName}</span>
                <span className="text-[#667085]">
                  Type: {selectedDoc.documentType?.replace(/_/g, ' ')} {selectedDoc.documentNumber ? `| Ref: ${selectedDoc.documentNumber}` : ''}
                </span>
              </div>
              {selectedDoc.isVerified ? (
                <Badge variant="success" size="sm">Verified</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Pending Verification</Badge>
              )}
            </div>

            {/* Document Viewer Container */}
            <div className="w-full min-h-[320px] max-h-[520px] rounded-xl border border-[#E5EAF1] bg-[#0F172A]/5 overflow-auto flex flex-col items-center justify-center p-4">
              {(() => {
                const url = selectedDoc.fileUrl || '';
                const mime = selectedDoc.mimeType || '';
                const fileName = (selectedDoc.fileName || selectedDoc.documentName || '').toLowerCase();
                const isImage = url.startsWith('data:image') || mime.startsWith('image/') || /\.(jpeg|jpg|png|gif|webp|svg|bmp)$/i.test(fileName) || /\.(jpeg|jpg|png|gif|webp|svg|bmp)/i.test(url);
                const isPdf = url.startsWith('data:application/pdf') || mime.includes('pdf') || fileName.endsWith('.pdf') || url.includes('.pdf');

                if (isImage && url) {
                  return (
                    <img
                      src={url}
                      alt={selectedDoc.documentName}
                      className="max-w-full max-h-[460px] object-contain rounded-lg shadow-sm"
                    />
                  );
                }

                if (isPdf && url) {
                  return (
                    <iframe
                      src={url}
                      title={selectedDoc.documentName}
                      className="w-full h-[460px] rounded-lg border border-slate-200"
                    />
                  );
                }

                return (
                  <div className="text-center p-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#172033]">
                        {selectedDoc.fileName || selectedDoc.documentName}
                      </p>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {selectedDoc.fileSize ? `${(selectedDoc.fileSize / 1024).toFixed(1)} KB` : 'Attached file'}
                      </p>
                    </div>
                    {url && (
                      <a
                        href={url}
                        download={selectedDoc.fileName || `${selectedDoc.documentName}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download / Open File
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 border-t border-[#E5EAF1]">
              {selectedDoc.fileUrl && (
                <a
                  href={selectedDoc.fileUrl}
                  download={selectedDoc.fileName || `${selectedDoc.documentName}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Direct Download
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDoc(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload New Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Student Document"
        size="md"
      >
        <form onSubmit={handleUploadDocSubmit} className="space-y-4">
          <input
            type="file"
            ref={docFileInputRef}
            onChange={handleDocFileSelect}
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
          />

          <Select
            label="Document Type"
            required
            value={newDocData.documentType}
            onChange={(e) => setNewDocData({ ...newDocData, documentType: e.target.value })}
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
            required
            value={newDocData.documentName}
            onChange={(e) => setNewDocData({ ...newDocData, documentName: e.target.value })}
            placeholder="e.g. Birth Certificate"
          />

          <Input
            label="Document Number / Ref"
            value={newDocData.documentNumber}
            onChange={(e) => setNewDocData({ ...newDocData, documentNumber: e.target.value })}
            placeholder="e.g. BC-2015-9988"
          />

          <div
            onClick={() => docFileInputRef.current?.click()}
            className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] rounded-xl p-4 text-center cursor-pointer bg-[#F8FAFC] transition-colors"
          >
            {newDocData.file ? (
              <div className="text-xs text-[#2563EB] font-semibold flex items-center justify-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{newDocData.file.name} ({(newDocData.file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="text-xs text-[#667085] flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-[#2563EB]" />
                <span className="font-semibold text-[#172033]">Click to select document file</span>
                <span className="text-[10px]">PDF, PNG, JPG up to 10MB</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5EAF1]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUploadingDoc || !newDocData.previewUrl}
            >
              {isUploadingDoc ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
