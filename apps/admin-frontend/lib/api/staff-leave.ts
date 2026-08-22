import { apiClient } from "../axios/client";
import { LeaveStatus } from "./teacher-leave";

export interface StaffLeaveApplication {
  id: string;
  staffId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string | null;
  appliedAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  };
}

export interface ApplyLeavePayload {
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface ReviewLeavePayload {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export const staffLeaveApi = {
  list: async (status?: LeaveStatus): Promise<StaffLeaveApplication[]> => {
    const { data } = await apiClient.get("/staff-leave", {
      params: status ? { status } : undefined,
    });
    return data;
  },

  myLeaves: async (): Promise<StaffLeaveApplication[]> => {
    const { data } = await apiClient.get("/staff-leave/me");
    return data;
  },

  apply: async (payload: ApplyLeavePayload): Promise<StaffLeaveApplication> => {
    const { data } = await apiClient.post("/staff-leave/apply", payload);
    return data;
  },

  review: async (
    id: string,
    payload: ReviewLeavePayload,
  ): Promise<StaffLeaveApplication> => {
    const { data } = await apiClient.patch(
      `/staff-leave/${id}/review`,
      payload,
    );
    return data;
  },
};
