import {
  teacherLeaveApi,
  TeacherLeaveApplication,
  LeaveStatus,
} from "./teacher-leave";
import { staffLeaveApi, StaffLeaveApplication } from "./staff-leave";

export type LeaveSource = "TEACHER" | "STAFF";

export interface UnifiedLeaveApplication {
  id: string;
  source: LeaveSource;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string | null;
  appliedAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  };
}

function fromTeacher(l: TeacherLeaveApplication): UnifiedLeaveApplication {
  return {
    id: l.id,
    source: "TEACHER",
    fromDate: l.fromDate,
    toDate: l.toDate,
    reason: l.reason,
    status: l.status,
    reviewNote: l.reviewNote,
    appliedAt: l.appliedAt,
    reviewedAt: l.reviewedAt,
    reviewedById: l.reviewedById,
    person: {
      id: l.teacher.id,
      firstName: l.teacher.firstName,
      lastName: l.teacher.lastName,
      photoUrl: l.teacher.photoUrl,
    },
  };
}

function fromStaff(l: StaffLeaveApplication): UnifiedLeaveApplication {
  return {
    id: l.id,
    source: "STAFF",
    fromDate: l.fromDate,
    toDate: l.toDate,
    reason: l.reason,
    status: l.status,
    reviewNote: l.reviewNote,
    appliedAt: l.appliedAt,
    reviewedAt: l.reviewedAt,
    reviewedById: l.reviewedById,
    person: {
      id: l.staff.id,
      firstName: l.staff.firstName,
      lastName: l.staff.lastName,
      photoUrl: l.staff.photoUrl,
    },
  };
}

export const unifiedLeaveApi = {
  listAll: async (status?: LeaveStatus): Promise<UnifiedLeaveApplication[]> => {
    const [teachers, staff] = await Promise.all([
      teacherLeaveApi.list(status),
      staffLeaveApi.list(status),
    ]);

    return [...teachers.map(fromTeacher), ...staff.map(fromStaff)].sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
  },

  review: async (
    item: UnifiedLeaveApplication,
    payload: ReviewLeavePayload,
  ) => {
    return item.source === "TEACHER"
      ? teacherLeaveApi.review(item.id, payload)
      : staffLeaveApi.review(item.id, payload);
  },
};

interface ReviewLeavePayload {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}
