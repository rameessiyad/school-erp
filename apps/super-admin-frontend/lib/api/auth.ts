import { apiClient } from "../axios/client";
import { LoginResponse, LoginValues } from "../validations/auth";

export const authApi = {
  login: async (payload: LoginValues): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/super-admin/auth/login",
      payload,
    );
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get("/super-admin/auth/me");
    return data;
  },
};
