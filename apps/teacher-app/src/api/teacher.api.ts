import { apiClient } from "./client";
import { TeacherProfile } from "../types/teacher";

export const teacherApi = {
  async getMe() {
    const { data } = await apiClient.get<TeacherProfile>("/teacher/me");
    return data;
  },
};
