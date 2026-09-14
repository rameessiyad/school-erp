import { apiClient } from "../axios/client";
import { CreateExamTypeValues, ExamType } from "../validations/exam-type";

export const examTypeApi = {
  list: async (): Promise<ExamType[]> => {
    const { data } = await apiClient.get("/exam/types");
    return data;
  },

  create: async (payload: CreateExamTypeValues): Promise<ExamType> => {
    const { data } = await apiClient.post("/exam/types", payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/exam/types/${id}`);
    return data;
  },
};
