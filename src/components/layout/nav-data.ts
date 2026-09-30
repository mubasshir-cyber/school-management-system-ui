import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserPlus,
  HeartHandshake,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Banknote,
  Award,
  FileText,
  BarChart3,
  Settings,
  LucideIcon,
  Layers,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Wallet,
  Clock,
  Briefcase,
  IdCard,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  requiredPermission?: string;
}

export interface NavGroup {
  name: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    name: 'DASHBOARD',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    name: 'ACADEMICS',
    items: [
      { name: 'Academic Years', href: '/academic/years', icon: Clock },
      { name: 'Classes & Grades', href: '/academic', icon: Layers },
      { name: 'Sections', href: '/academic/sections', icon: BookOpen },
      { name: 'Subjects', href: '/academic/subjects', icon: BookOpen },
    ],
  },
  {
    name: 'STUDENTS',
    items: [
      { name: 'All Students', href: '/students', icon: Users },
      { name: 'New Registration', href: '/students/new', icon: UserPlus, badge: 'Wizard' },
      { name: 'Admissions Pipeline', href: '/admissions', icon: ClipboardList, badge: 'Active' },
      { name: 'Guardians Master', href: '/guardians', icon: HeartHandshake },
      { name: 'Enrollment History', href: '/enrollments', icon: GraduationCap },
    ],
  },
  {
    name: 'STAFF',
    items: [
      { name: 'Staff Directory', href: '/staff', icon: Briefcase, badge: 'Phase 4' },
      { name: 'Departments', href: '/staff/departments', icon: Layers },
      { name: 'Designations', href: '/staff/designations', icon: ShieldCheck },
    ],
  },
  {
    name: 'ATTENDANCE',
    items: [
      { name: 'Student Attendance', href: '/attendance/students', icon: CalendarCheck, badge: 'Phase 5' },
      { name: 'Staff Attendance', href: '/attendance/staff', icon: Clock },
      { name: 'Leaves & Holidays', href: '/attendance/leaves', icon: Sparkles },
    ],
  },
  {
    name: 'FINANCE',
    items: [
      { name: 'Fees & Collections', href: '/fees', icon: CreditCard, badge: 'Phase 6' },
      { name: 'Fee Ledger', href: '/fees/ledger', icon: Wallet },
      { name: 'Receipts & Payments', href: '/fees/receipts', icon: Banknote },
      { name: 'Income & Expenses', href: '/finance', icon: BarChart3 },
    ],
  },
  {
    name: 'PAYROLL',
    items: [
      { name: 'Salary Structures', href: '/payroll/structures', icon: Banknote, badge: 'Phase 7' },
      { name: 'Payroll Processing', href: '/payroll/process', icon: Wallet },
      { name: 'Salary Slips', href: '/payroll/slips', icon: FileText },
    ],
  },
  {
    name: 'EXAMINATION',
    items: [
      { name: 'Exams & Schedule', href: '/exams', icon: Award, badge: 'Phase 9' },
      { name: 'Marks & Results', href: '/exams/results', icon: ClipboardList },
      { name: 'Report Cards', href: '/exams/report-cards', icon: FileText },
    ],
  },
  {
    name: 'DOCUMENTS',
    items: [
      { name: 'ID Cards', href: '/documents/id-cards', icon: IdCard, badge: 'Phase 10' },
      { name: 'Certificates', href: '/documents/certificates', icon: Award },
      { name: 'Document Vault', href: '/documents/vault', icon: FileText },
    ],
  },
  {
    name: 'REPORTS',
    items: [
      { name: 'Analytics & Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    name: 'SETTINGS',
    items: [
      { name: 'School Settings', href: '/settings', icon: Settings },
    ],
  },
];

// Top 5 bottom navigation touch targets for mobile
export const mobileBottomNavItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Fees', href: '/fees', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];
