import { apiClient } from "./client";
import {
  TeacherAttendanceRecord,
  TeacherAttendanceStatus,
} from "../types/attendance";

export const attendanceApi = {
  async mark(status: TeacherAttendanceStatus, date?: string) {
    const { data } = await apiClient.post<TeacherAttendanceRecord>(
      "/teacher-attendance/mark",
      { status, date },
    );
    return data;
  },
  async findMine(from?: string, to?: string) {
    const { data } = await apiClient.get<TeacherAttendanceRecord[]>(
      "/teacher-attendance/me",
      { params: { from, to } },
    );
    return data;
  },
};
