import { apiClient } from "@/lib/axios/client";
import { StaffAttendanceByDateResponse } from "@/lib/validations/staff-attendance";

export const staffAttendanceApi = {
  getByDate: async (date: string): Promise<StaffAttendanceByDateResponse> => {
    const { data } = await apiClient.get("/staff-attendance/by-date", {
      params: { date },
    });
    return data;
  },
};
