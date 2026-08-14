import { apiClient } from "../axios/client";
import { DashboardStats } from "../validations/dashboard";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get("/dashboard/stats");
    return data;
  },
};
