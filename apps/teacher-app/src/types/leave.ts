export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TeacherLeaveApplication {
  id: string;
  schoolId: string;
  teacherId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  appliedAt: string;
  updatedAt: string;
}
