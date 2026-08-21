export interface TeacherClassSubject {
  id: string;
  subjectName: string;
  className: string;
  sectionName: string;
  isClassTeacher: boolean;
}

export interface LeaveStatusSummary {
  pending: number;
  approved: number;
  rejected: number;
}

export interface TeacherProfileDetails {
  firstName: string;
  lastName?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  gender?: string;
  qualification?: string;
  experience?: number;
  joiningDate?: string;
  photoUrl?: string;
}
