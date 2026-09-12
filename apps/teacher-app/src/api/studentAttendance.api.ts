import { apiClient } from "./client";
import {
  MyClassResponse,
  MarkStudentAttendancePayload,
  MarkStudentAttendanceResponse,
} from "../types/studentAttendance";

export const studentAttendanceApi = {
  async getMyClass(date: string) {
    const { data } = await apiClient.get<MyClassResponse>(
      "/student-attendance/my-class",
      { params: { date } },
    );
    return data;
  },
  async mark(payload: MarkStudentAttendancePayload) {
    const { data } = await apiClient.post<MarkStudentAttendanceResponse>(
      "/student-attendance/mark",
      payload,
    );
    return data;
  },
};
