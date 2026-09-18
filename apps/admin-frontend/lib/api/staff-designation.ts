import { apiClient } from "@/lib/axios/client";

export interface StaffDesignation {
  id: string;
  name: string;
  allowedModules: string[];
}

export interface CreateStaffDesignationValues {
  name: string;
  allowedModules?: string[];
}

export const staffDesignationApi = {
  list: async (): Promise<StaffDesignation[]> => {
    const { data } = await apiClient.get("/staff-designation");
    return data;
  },

  create: async (
    values: CreateStaffDesignationValues,
  ): Promise<StaffDesignation> => {
    const { data } = await apiClient.post("/staff-designation/create", values);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateStaffDesignationValues>,
  ): Promise<StaffDesignation> => {
    const { data } = await apiClient.patch(`/staff-designation/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/staff-designation/${id}`);
    return data;
  },
};
