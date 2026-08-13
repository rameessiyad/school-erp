import { apiClient } from "../axios/client";
import { CreateParentValues, Parent } from "../validations/parent";

export const parentsApi = {
  list: async (): Promise<Parent[]> => {
    const { data } = await apiClient.get("/parent");
    return data;
  },

  get: async (id: string): Promise<Parent> => {
    const { data } = await apiClient.get(`/parent/${id}`);
    return data;
  },

  create: async (payload: Partial<CreateParentValues>): Promise<Parent> => {
    const { data } = await apiClient.post("/parent/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateParentValues>,
  ): Promise<Parent> => {
    const { data } = await apiClient.patch(`/parent/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/parent/${id}`);
    return data;
  },
};
