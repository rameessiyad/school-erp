export type StudentAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE";

export interface MyClassStudent {
  studentId: string;
  firstName: string;
  lastName: string | null;
  rollNo: string | null;
  photoUrl: string | null;
  status: StudentAttendanceStatus;
}

export interface MyClassSection {
  id: string;
  name: string;
  className: string;
}

export interface MyClassResponse {
  section: MyClassSection;
  isMarked: boolean;
  students: MyClassStudent[];
}

export interface MarkStudentAttendanceRecord {
  studentId: string;
  status: StudentAttendanceStatus;
}

export interface MarkStudentAttendancePayload {
  sectionId: string;
  date: string;
  records: MarkStudentAttendanceRecord[];
}

export interface MarkStudentAttendanceResponse {
  message: string;
  count: number;
}
