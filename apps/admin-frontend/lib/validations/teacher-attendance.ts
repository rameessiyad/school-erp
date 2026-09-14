export type TeacherAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE";

export interface AttendanceTeacher {
  id: string;
  firstName: string;
  lastName?: string | null;
  photoUrl?: string | null;
  status: TeacherAttendanceStatus | null;
}

export interface TeacherAttendanceByDateResponse {
  date: string;
  teachers: AttendanceTeacher[];
}
