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

export interface TeacherSubjectAllocation {
  id: string;
  subject: { id: string; name: string; code: string | null };
  section: {
    id: string;
    name: string;
    class: { id: string; name: string };
  };
  academicYear: { id: string; label: string; isActive: boolean };
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

export interface TeacherProfile {
  id: string;
  schoolId: string;
  userId: string;
  employeeId: string | null;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  dob: string | null;
  qualification: string | null;
  experience: number | null;
  joiningDate: string | null;
  photoUrl: string | null;
  isActive: boolean;
  teacherSubjectAllocations: TeacherSubjectAllocation[];
}
