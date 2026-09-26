import { Module } from './module.enum';

export interface ModuleGroup {
  key: string;
  label: string;
  modules: { value: Module; label: string }[];
}

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    key: 'FEE_MANAGEMENT',
    label: 'Fee Management',
    modules: [
      { value: Module.STUDENT_FEES, label: 'Student Fees' },
      { value: Module.FEE_REPORTS, label: 'Fee Reports' },
      { value: Module.PAYMENT_HISTORY, label: 'Payment History' },
    ],
  },
  {
    key: 'ADMISSION_MANAGEMENT',
    label: 'Admission Management',
    modules: [
      { value: Module.STUDENT_ADMISSIONS, label: 'Student Admissions' },
      { value: Module.STUDENT_REGISTRATION, label: 'Student Registration' },
      { value: Module.PARENT_DETAILS, label: 'Parent Details' },
      { value: Module.ACADEMIC_YEAR, label: 'Academic Year' },
    ],
  },
  {
    key: 'TEACHER_MANAGEMENT',
    label: 'Teacher Management',
    modules: [
      { value: Module.TEACHER_MANAGEMENT, label: 'Teacher Management' },
    ],
  },
  {
    key: 'EXAM',
    label: 'Exam',
    modules: [{ value: Module.EXAM_SETTINGS, label: 'Exam Settings' }],
  },
  {
    key: 'ATTENDANCE',
    label: 'Attendance',
    modules: [
      { value: Module.ATTENDANCE, label: 'Staff/Teacher Attendance' },
      { value: Module.STUDENT_ATTENDANCE, label: 'Student Attendance' },
    ],
  },
  {
    key: 'STAFF_MANAGEMENT',
    label: 'Staff Management',
    modules: [{ value: Module.USER_MANAGEMENT, label: 'User Management' }],
  },
  {
    key: 'PAYROLL',
    label: 'Payroll',
    modules: [{ value: Module.PAYROLL, label: 'Payroll' }],
  },
];
