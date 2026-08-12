import { apiClient } from "@/lib/axios/client";

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

  logout: () => {
    localStorage.removeItem("accessToken");
  },
};
