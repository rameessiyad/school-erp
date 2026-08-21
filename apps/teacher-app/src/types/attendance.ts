export type TeacherAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "ON_LEAVE";

export interface TeacherAttendanceRecord {
  id: string;
  schoolId: string;
  teacherId: string;
  date: string;
  status: TeacherAttendanceStatus;
  markedAt: string;
  createdAt: string;
  updatedAt: string;
}
