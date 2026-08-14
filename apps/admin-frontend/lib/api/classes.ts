import { apiClient } from "../axios/client";
import { CreateClassValues, SchoolClass } from "../validations/class";

export const classesApi = {
  list: async (): Promise<SchoolClass[]> => {
    const { data } = await apiClient.get("/class");
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/class/${id}`);
    return data;
  },

  create: async (payload: Partial<CreateClassValues>) => {
    const { data } = await apiClient.post("/class/create", payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateClassValues>) => {
    const { data } = await apiClient.patch(`/class/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/class/${id}`);
    return data;
  },
};
