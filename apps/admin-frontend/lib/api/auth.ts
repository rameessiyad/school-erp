import { apiClient } from "@/lib/axios/client";

export interface CurrentUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  schoolName: string | null;
  allowedModules: string[];
  firstName?: string;
  lastName?: string | null;
  designation?: string | null;
}

export const authApi = {
  login: async (schoolId: string, email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", {
      schoolId,
      email,
      password,
    });
    localStorage.setItem("accessToken", data.accessToken);
    return data; // { accessToken, user, ... }
  },

  me: async (): Promise<CurrentUser> => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
  },
};
