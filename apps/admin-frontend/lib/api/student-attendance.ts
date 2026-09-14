import { apiClient } from "../axios/client";
import { SectionAttendance } from "../validations/student-attendance";

export const studentAttendanceApi = {
  getSectionAttendance: async (
    sectionId: string,
    date: string,
  ): Promise<SectionAttendance> => {
    const { data } = await apiClient.get(
      `/student-attendance/section/${sectionId}`,
      { params: { date } },
    );
    return data;
  },
};
