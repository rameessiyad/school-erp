import { cookies } from "next/headers";
import {
  GraduationCap,
  UserRound,
  Users,
  Wallet,
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  totalFeesCollected: number;
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  console.log("getDashboardStats called"); // ADD THIS FIRST

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  console.log("Token found:", !!token); // AND THIS

  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  console.log("Response status:", res.status); // AND THIS

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Error response:", errorText); // AND THIS
    return null;
  }

  return res.json();
}

function formatCurrency(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Students",
      value: stats?.studentCount ?? 0,
      description: "Currently enrolled",
      icon: GraduationCap,
    },
    {
      title: "Teachers",
      value: stats?.teacherCount ?? 0,
      description: "Active teachers",
      icon: UserRound,
    },
    {
      title: "Parents",
      value: stats?.parentCount ?? 0,
      description: "Registered parents",
      icon: Users,
    },
    {
      title: "Fees Collected",
      value: formatCurrency(stats?.totalFeesCollected ?? 0),
      description: "This academic year",
      icon: Wallet,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Overview</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back. Here&apos;s what&apos;s happening in your school.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
          <Clock3 className="h-4 w-4" />
          Academic Year 2026–27
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                View details
              </div>
            </div>
          );
        })}
      </div>

      <DashboardCharts
        studentCount={stats?.studentCount ?? 0}
        teacherCount={stats?.teacherCount ?? 0}
        parentCount={stats?.parentCount ?? 0}
      />

      {/* Keep your existing Recent Activity + Quick Actions sections below as-is */}
    </div>
  );
}
