import { apiClient } from "../axios/client";
import { CreateSubjectValues, Subject } from "../validations/subject";

export const subjectsApi = {
  list: async (): Promise<Subject[]> => {
    const { data } = await apiClient.get("/subject");
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/subject/${id}`);
    return data;
  },

  create: async (payload: Partial<CreateSubjectValues>) => {
    const { data } = await apiClient.post("/subject/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateSubjectValues>,
  ): Promise<Subject> => {
    const { data } = await apiClient.patch(`/subject/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/subject/${id}`);
    return data;
  },
};
