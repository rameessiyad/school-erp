// src/api/auth.api.ts
import { apiClient } from "./client";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    allowedModules: string[];
  };
}

export const authApi = {
  async login(schoolId: string, email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      schoolId,
      email,
      password,
    });
    return data;
  },
  async me() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};
