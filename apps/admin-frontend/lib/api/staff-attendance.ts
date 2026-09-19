import { apiClient } from "@/lib/axios/client";
import {
  StaffAttendanceByDateResponse,
  StaffAttendanceRecord,
  MarkStaffAttendanceValues,
} from "@/lib/validations/staff-attendance";

export const staffAttendanceApi = {
  getByDate: async (date: string): Promise<StaffAttendanceByDateResponse> => {
    const { data } = await apiClient.get("/staff-attendance/by-date", {
      params: { date },
    });
    return data;
  },

  mark: async (
    values: MarkStaffAttendanceValues,
  ): Promise<StaffAttendanceRecord> => {
    const { data } = await apiClient.post("/staff-attendance/mark", values);
    return data;
  },

  getMine: async (
    filters: {
      from?: string;
      to?: string;
    } = {},
  ): Promise<StaffAttendanceRecord[]> => {
    const { data } = await apiClient.get("/staff-attendance/me", {
      params: filters,
    });
    return data;
  },
};
