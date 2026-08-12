import { apiClient } from "@/lib/axios/client";
import { CreateStaffValues, Staff } from "@/lib/validations/staff";

export const staffApi = {
  list: async (): Promise<Staff[]> => {
    const { data } = await apiClient.get("/staff");
    return data;
  },

  create: async (values: CreateStaffValues): Promise<Staff> => {
    const { data } = await apiClient.post("/staff/create", values);
    return data;
  },
};
