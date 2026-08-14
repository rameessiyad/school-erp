import { apiClient } from "@/lib/axios/client";
import { CreateStaffValues, Staff } from "@/lib/validations/staff";

export const staffApi = {
  list: async (): Promise<Staff[]> => {
    const { data } = await apiClient.get("/staff");
    return data;
  },

  get: async (id: string): Promise<Staff> => {
    const { data } = await apiClient.get(`/staff/${id}`);
    return data;
  },

  create: async (values: CreateStaffValues): Promise<Staff> => {
    const { data } = await apiClient.post("/staff/create", values);
    return data;
  },

  update: async (id: string, payload: Partial<CreateStaffValues>): Promise<Staff> => {
    const { data } = await apiClient.patch(`/staff/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/staff/${id}`);
    return data;
  },
};
