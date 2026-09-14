export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE";

export interface AttendanceStudent {
  studentId: string;
  firstName: string;
  lastName?: string | null;
  rollNo?: string | null;
  photoUrl?: string | null;
  status: AttendanceStatus | null;
}

export interface SectionAttendance {
  section: {
    id: string;
    name: string;
    className: string;
  };
  isMarked: boolean;
  students: AttendanceStudent[];
}
