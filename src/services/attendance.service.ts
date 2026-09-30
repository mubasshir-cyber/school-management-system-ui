import { apiClient } from '../lib/api-client';

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  student?: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  classId: string;
  sectionId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY';
  remarks?: string;
}

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staff?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
    designation?: { title: string };
  };
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY';
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: number;
  isLate: boolean;
  isHalfDay: boolean;
  remarks?: string;
}

export interface Holiday {
  id: string;
  title: string;
  holidayType: 'NATIONAL' | 'RELIGIOUS' | 'SCHOOL_EVENT' | 'VACATION' | 'OTHER';
  startDate: string;
  endDate: string;
  totalDays: number;
  description?: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface AttendanceSummary {
  date: string;
  students: {
    present: number;
    total: number;
    percentage: string;
  };
  staff: {
    present: number;
    total: number;
    percentage: string;
  };
}

export const attendanceService = {
  // Student Attendance
  getStudentAttendance: async (params: {
    classId?: string;
    sectionId?: string;
    attendanceDate?: string;
    studentId?: string;
  }): Promise<StudentAttendanceRecord[]> => {
    const res = await apiClient.get('/attendance/students', { params });
    return res.data.data || res.data;
  },

  bulkSaveStudentAttendance: async (data: {
    academicYearId: string;
    classId: string;
    sectionId: string;
    attendanceDate: string;
    records: { studentId: string; status: string; remarks?: string }[];
  }) => {
    const res = await apiClient.post('/attendance/students/bulk', data);
    return res.data.data || res.data;
  },

  // Staff Attendance
  getStaffAttendance: async (params?: {
    departmentId?: string;
    attendanceDate?: string;
    staffId?: string;
  }): Promise<StaffAttendanceRecord[]> => {
    const res = await apiClient.get('/attendance/staff', { params });
    return res.data.data || res.data;
  },

  bulkSaveStaffAttendance: async (data: {
    attendanceDate: string;
    records: {
      staffId: string;
      status: string;
      checkInTime?: string;
      checkOutTime?: string;
      isLate?: boolean;
      isHalfDay?: boolean;
      remarks?: string;
    }[];
  }) => {
    const res = await apiClient.post('/attendance/staff/bulk', data);
    return res.data.data || res.data;
  },

  getAttendanceSummary: async (date?: string): Promise<AttendanceSummary> => {
    const res = await apiClient.get('/attendance/summary', { params: { date } });
    return res.data.data || res.data;
  },

  // Holidays
  getHolidays: async (academicYearId?: string): Promise<Holiday[]> => {
    const res = await apiClient.get('/holidays', { params: { academicYearId } });
    return res.data.data || res.data;
  },

  createHoliday: async (data: Partial<Holiday>): Promise<Holiday> => {
    const res = await apiClient.post('/holidays', data);
    return res.data.data || res.data;
  },

  updateHoliday: async (id: string, data: Partial<Holiday>): Promise<Holiday> => {
    const res = await apiClient.patch(`/holidays/${id}`, data);
    return res.data.data || res.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await apiClient.delete(`/holidays/${id}`);
  },
};
