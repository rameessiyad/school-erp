import { apiClient } from "../axios/client";
import { DashboardStats } from "../validations/dashboard";

export type DashboardFilterBy = "week" | "month" | "year";

export const dashboardApi = {
  getStats: async (
    filterBy: DashboardFilterBy = "month",
    academicYearId?: string,
  ): Promise<DashboardStats> => {
    const { data } = await apiClient.get("/dashboard/stats", {
      params: { filterBy, academicYearId },
    });
    return data;
  },
};

export interface FeeTrendItem {
  month: string;
  collected: number;
}

export interface AttendanceTrendItem {
  date: string;
  percentage: number | null;
}

export interface StudentDistributionItem {
  className: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  type: "student" | "teacher" | "fee";
  title: string;
  description: string;
  createdAt: string;
}

export interface UpcomingItem {
  id: string;
  title: string;
  description: string;
  date: string;
}
