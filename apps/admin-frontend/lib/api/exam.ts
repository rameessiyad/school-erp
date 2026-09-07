import { apiClient } from "../axios/client";
import { CreateExamValues, Exam } from "../validations/exam";

export const examApi = {
  list: async (academicYearId?: string): Promise<Exam[]> => {
    const { data } = await apiClient.get("/exam", {
      params: academicYearId ? { academicYearId } : undefined,
    });
    return data;
  },

  get: async (id: string): Promise<Exam> => {
    const { data } = await apiClient.get(`/exam/${id}`);
    return data;
  },

  create: async (payload: CreateExamValues): Promise<Exam> => {
    const { data } = await apiClient.post("/exam/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateExamValues>,
  ): Promise<Exam> => {
    const { data } = await apiClient.patch(`/exam/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/exam/${id}`);
    return data;
  },
};
