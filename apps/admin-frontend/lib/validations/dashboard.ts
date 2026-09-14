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

export interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  classCount: number;

  totalFeesCollected: number;
  totalFeesPending: number;
  feeCollectionPercentage: number;

  feeTrend: FeeTrendItem[];
  attendanceTrend: AttendanceTrendItem[];
  studentDistribution: StudentDistributionItem[];

  recentActivities: RecentActivityItem[];
  upcomingItems: UpcomingItem[];

  academicYear: {
    id: string;
    label: string;
  } | null;
}
