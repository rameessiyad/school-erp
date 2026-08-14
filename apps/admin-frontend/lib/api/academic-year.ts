import { apiClient } from "../axios/client";
import { AcademicYearOption } from "../validations/fee-structure";

export const academicYearApi = {
  list: async (): Promise<AcademicYearOption[]> => {
    const { data } = await apiClient.get("/academic-year");
    return data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post("/academic-year/create", payload);
    return data;
  },
};
