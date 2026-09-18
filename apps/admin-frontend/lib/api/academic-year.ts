import { apiClient } from "../axios/client";

export interface AcademicYear {
  id: string;
  label: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface CreateAcademicYearValues {
  label: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export const academicYearApi = {
  getAll: async (): Promise<AcademicYear[]> => {
    const { data } = await apiClient.get("/academic-year");
    return data;
  },

  create: async (payload: CreateAcademicYearValues): Promise<AcademicYear> => {
    const { data } = await apiClient.post("/academic-year/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateAcademicYearValues>,
  ): Promise<AcademicYear> => {
    const { data } = await apiClient.patch(`/academic-year/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/academic-year/${id}`);
    return data;
  },
};
