import { apiClient } from "@/lib/axios/client";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

interface AcademicYearOption extends Option {
  isActive: boolean;
}

export const optionsApi = {
  subjects: async (): Promise<Option[]> => {
    const { data } = await apiClient.get("/subject");
    return data;
  },

  classes: async (): Promise<Option[]> => {
    const { data } = await apiClient.get("/class");
    return data;
  },

  academicYears: async (): Promise<AcademicYearOption[]> => {
    const { data } = await apiClient.get("/academic-year");
    return data;
  },

  sections: async (classId: string): Promise<Option[]> => {
    const { data } = await apiClient.get(`/section?classId=${classId}`);
    return data;
  },
};
