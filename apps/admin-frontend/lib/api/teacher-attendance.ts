import { apiClient } from "@/lib/axios/client";
import { TeacherAttendanceByDateResponse } from "@/lib/validations/teacher-attendance";

export const teacherAttendanceApi = {
  getByDate: async (date: string): Promise<TeacherAttendanceByDateResponse> => {
    const { data } = await apiClient.get("/teacher-attendance/by-date", {
      params: { date },
    });
    return data;
  },
};
