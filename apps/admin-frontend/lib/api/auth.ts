import { apiClient } from "@/lib/axios/client";

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  allowedModules: string[];
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
