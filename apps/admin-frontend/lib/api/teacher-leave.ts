import { apiClient } from "../axios/client";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TeacherLeaveApplication {
  id: string;
  teacherId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string | null;
  appliedAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  };
}

export interface ReviewLeavePayload {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export const teacherLeaveApi = {
  list: async (status?: LeaveStatus): Promise<TeacherLeaveApplication[]> => {
    const { data } = await apiClient.get("/teacher-leave", {
      params: status ? { status } : undefined,
    });
    return data;
  },

  review: async (
    id: string,
    payload: ReviewLeavePayload,
  ): Promise<TeacherLeaveApplication> => {
    const { data } = await apiClient.patch(
      `/teacher-leave/${id}/review`,
      payload,
    );
    return data;
  },
};
