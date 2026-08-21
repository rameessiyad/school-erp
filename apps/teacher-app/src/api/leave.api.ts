import { apiClient } from "./client";
import { TeacherLeaveApplication } from "../types/leave";

export interface ApplyLeavePayload {
  fromDate: string;
  toDate: string;
  reason: string;
}

export const leaveApi = {
  async apply(payload: ApplyLeavePayload) {
    const { data } = await apiClient.post<TeacherLeaveApplication>(
      "/teacher-leave/apply",
      payload,
    );
    return data;
  },
  async findMine() {
    const { data } =
      await apiClient.get<TeacherLeaveApplication[]>("/teacher-leave/me");
    return data;
  },
};
