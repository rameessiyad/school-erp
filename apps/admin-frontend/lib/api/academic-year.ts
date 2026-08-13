import { apiClient } from "../axios/client";

export const academicYearApi = {
  create: async (payload) => {
    const { data } = await apiClient.post("/academic-year/create", payload);
    return data;
  },
};
