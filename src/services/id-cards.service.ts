import { apiClient } from '../lib/api-client';

export type IdCardUserType = 'STUDENT' | 'STAFF' | 'GUARDIAN';
export type IdCardLayout = 'PORTRAIT' | 'LANDSCAPE';
export type IdCardStatus = 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REPRINTED';
export type CertificateType = 'TRANSFER' | 'BONAFIDE' | 'CHARACTER' | 'MERIT' | 'SPORTS' | 'CUSTOM';
export type CertificateStatus = 'DRAFT' | 'ISSUED' | 'REVOKED' | 'CANCELLED';

export interface IdCardTemplate {
  id: string;
  name: string;
  userType: IdCardUserType;
  layout: IdCardLayout;
  cardWidthMm: number;
  cardHeightMm: number;
  headerBgColor: string;
  headerTextColor: string;
  bgColor: string;
  accentColor: string;
  bgImageUrl?: string;
  logoUrl?: string;
  schoolName?: string;
  schoolTagline?: string;
  schoolAddress?: string;
  includeQrCode: boolean;
  qrCodeType: string;
  includeBarcode: boolean;
  barcodeField: string;
  includeBloodGroup: boolean;
  includeEmergencyContact: boolean;
  includeAddress: boolean;
  includeSignature: boolean;
  signatureTitle: string;
  signatureUrl?: string;
  customFields?: Array<{ label: string; field: string; showOnCard: boolean }>;
  isDefault: boolean;
  status: string;
  createdAt: string;
}

export interface IdCard {
  id: string;
  templateId: string;
  template?: IdCardTemplate;
  userType: IdCardUserType;
  studentId?: string;
  student?: {
    id: string;
    studentCode: string;
    admissionNumber?: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  staffId?: string;
  staff?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  cardNumber: string;
  issueDate: string;
  expiryDate?: string;
  verificationCode: string;
  qrData?: string;
  barcodeData?: string;
  cardSnapshot?: {
    userName: string;
    admissionNumber?: string;
    employeeId?: string;
    rollNumber?: string;
    className?: string;
    sectionName?: string;
    department?: string;
    designation?: string;
    bloodGroup?: string;
    dob?: string;
    gender?: string;
    emergencyContact?: string;
    guardianName?: string;
    address?: string;
    photoUrl?: string;
    schoolName?: string;
    schoolTagline?: string;
    schoolAddress?: string;
  };
  status: IdCardStatus;
  downloadCount: number;
  lastPrintedAt?: string;
  createdAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  certificateType: CertificateType;
  title: string;
  subTitle?: string;
  headerContent?: string;
  bodyTemplate: string;
  footerContent?: string;
  borderStyle: string;
  primaryColor: string;
  signatoryTitle1: string;
  signatoryTitle2: string;
  signatoryImage1?: string;
  signatoryImage2?: string;
  includeQrCode: boolean;
  status: string;
  createdAt: string;
}

export interface IssuedCertificate {
  id: string;
  templateId: string;
  template?: CertificateTemplate;
  studentId: string;
  student?: {
    id: string;
    studentCode: string;
    admissionNumber?: string;
    firstName: string;
    lastName: string;
  };
  academicYearId?: string;
  academicYear?: { id: string; name: string };
  certificateNumber: string;
  issueDate: string;
  verificationCode: string;
  reasonForIssue?: string;
  conductRemarks?: string;
  leavingDate?: string;
  promotedToClass?: string;
  customData?: Record<string, any>;
  renderedContent?: string;
  status: CertificateStatus;
  createdAt: string;
}

export interface IdCardDashboardSummary {
  totalIdCards: number;
  activeIdCards: number;
  totalCertificates: number;
  idCardTemplates: number;
  certTemplates: number;
  recentIdCards: IdCard[];
  recentCertificates: IssuedCertificate[];
}

export const idCardsService = {
  // Summary
  getDashboardSummary: async (): Promise<IdCardDashboardSummary> => {
    const res = await apiClient.get('/id-cards/dashboard/summary');
    return res.data;
  },

  // Templates
  getIdCardTemplates: async (userType?: IdCardUserType): Promise<IdCardTemplate[]> => {
    const res = await apiClient.get('/id-cards/templates', { params: { userType } });
    return res.data;
  },

  getIdCardTemplateById: async (id: string): Promise<IdCardTemplate> => {
    const res = await apiClient.get(`/id-cards/templates/${id}`);
    return res.data;
  },

  createIdCardTemplate: async (data: Partial<IdCardTemplate>): Promise<IdCardTemplate> => {
    const res = await apiClient.post('/id-cards/templates', data);
    return res.data;
  },

  updateIdCardTemplate: async (id: string, data: Partial<IdCardTemplate>): Promise<IdCardTemplate> => {
    const res = await apiClient.put(`/id-cards/templates/${id}`, data);
    return res.data;
  },

  deleteIdCardTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/id-cards/templates/${id}`);
  },

  // Cards
  generateIdCards: async (data: {
    templateId: string;
    userType: IdCardUserType;
    studentIds?: string[];
    classId?: string;
    sectionId?: string;
    academicYearId?: string;
    staffIds?: string[];
    departmentId?: string;
    issueDate?: string;
    expiryDate?: string;
  }): Promise<IdCard[]> => {
    const res = await apiClient.post('/id-cards/generate', data);
    return res.data;
  },

  queryIdCards: async (params?: {
    search?: string;
    userType?: IdCardUserType;
    status?: IdCardStatus;
    templateId?: string;
    studentId?: string;
    staffId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: IdCard[]; total: number; totalPages: number }> => {
    const res = await apiClient.get('/id-cards', { params });
    return res.data;
  },

  getIdCardById: async (id: string): Promise<IdCard> => {
    const res = await apiClient.get(`/id-cards/${id}`);
    return res.data;
  },

  markCardPrinted: async (id: string): Promise<IdCard> => {
    const res = await apiClient.post(`/id-cards/${id}/print`);
    return res.data;
  },

  revokeIdCard: async (id: string): Promise<IdCard> => {
    const res = await apiClient.post(`/id-cards/${id}/revoke`);
    return res.data;
  },

  // Certificates
  getCertificateTemplates: async (type?: CertificateType): Promise<CertificateTemplate[]> => {
    const res = await apiClient.get('/id-cards/certificate-templates', { params: { type } });
    return res.data;
  },

  getCertificateTemplateById: async (id: string): Promise<CertificateTemplate> => {
    const res = await apiClient.get(`/id-cards/certificate-templates/${id}`);
    return res.data;
  },

  createCertificateTemplate: async (data: Partial<CertificateTemplate>): Promise<CertificateTemplate> => {
    const res = await apiClient.post('/id-cards/certificate-templates', data);
    return res.data;
  },

  updateCertificateTemplate: async (id: string, data: Partial<CertificateTemplate>): Promise<CertificateTemplate> => {
    const res = await apiClient.put(`/id-cards/certificate-templates/${id}`, data);
    return res.data;
  },

  deleteCertificateTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/id-cards/certificate-templates/${id}`);
  },

  issueCertificate: async (data: {
    templateId: string;
    studentId: string;
    academicYearId?: string;
    issueDate?: string;
    reasonForIssue?: string;
    conductRemarks?: string;
    leavingDate?: string;
    promotedToClass?: string;
    customData?: Record<string, any>;
  }): Promise<IssuedCertificate> => {
    const res = await apiClient.post('/id-cards/certificates/issue', data);
    return res.data;
  },

  queryCertificates: async (params?: {
    search?: string;
    certificateType?: CertificateType;
    status?: CertificateStatus;
    templateId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: IssuedCertificate[]; total: number; totalPages: number }> => {
    const res = await apiClient.get('/id-cards/certificates', { params });
    return res.data;
  },

  getCertificateById: async (id: string): Promise<IssuedCertificate> => {
    const res = await apiClient.get(`/id-cards/certificates/${id}`);
    return res.data;
  },

  revokeCertificate: async (id: string): Promise<IssuedCertificate> => {
    const res = await apiClient.post(`/id-cards/certificates/${id}/revoke`);
    return res.data;
  },

  // Public Verification
  verifyIdCard: async (code: string): Promise<{ valid: boolean; card?: IdCard; message: string }> => {
    const res = await apiClient.get(`/id-cards/verify/${code}`);
    return res.data;
  },

  verifyCertificate: async (code: string): Promise<{ valid: boolean; certificate?: IssuedCertificate; message: string }> => {
    const res = await apiClient.get(`/id-cards/verify-certificate/${code}`);
    return res.data;
  },
};
