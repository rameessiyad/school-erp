import { apiClient } from "@/lib/axios/client";

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  schoolName: string | null;
  firstName?: string;
  lastName?: string | null;
  designation?: string | null;
}

export interface ChangePasswordValues {
  oldPassword: string;
  newPassword: string;
}

export const profileApi = {
  get: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get("/auth/profile");
    return data;
  },

  changePassword: async (payload: ChangePasswordValues) => {
    const { data } = await apiClient.patch("/auth/change-password", payload);
    return data;
  },
};
