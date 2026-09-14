export type StaffAttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE";

export interface AttendanceStaff {
  id: string;
  firstName: string;
  lastName?: string | null;
  photoUrl?: string | null;
  status: StaffAttendanceStatus | null;
}

export interface StaffAttendanceByDateResponse {
  date: string;
  staff: AttendanceStaff[];
}
