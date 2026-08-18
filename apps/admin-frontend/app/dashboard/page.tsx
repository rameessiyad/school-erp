"use client";

import {
  GraduationCap,
  UserRound,
  Users,
  Wallet,
  ArrowUpRight,
  Clock3,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { dashboardApi } from "@/lib/api/dashboard";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";

function formatCurrency(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

const quickActions = [
  {
    title: "Add Teacher",
    href: "/dashboard/teachers/new",
    icon: UserRound,
  },
  {
    title: "Add Student",
    href: "/dashboard/students/new",
    icon: GraduationCap,
  },
  {
    title: "Add Fee Structure",
    href: "/dashboard/fee-structures/new",
    icon: ReceiptText,
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
  });

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

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading dashboard...</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Overview</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Welcome back. Here&apos;s what&apos;s happening in your school.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary shadow-sm">
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
              className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {stat.description}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-success">
                <ArrowUpRight className="h-3.5 w-3.5" />
                View details
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MiniCalendar />
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-medium text-text-secondary">
            Quick Actions
          </p>

          <div className="mt-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3 transition hover:border-primary/40 hover:bg-primary-soft"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-primary shadow-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>

                  <p className="text-sm font-medium text-text-secondary">
                    {action.title}
                  </p>

                  <ArrowUpRight className="ml-auto h-4 w-4 text-text-muted transition group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <DashboardCharts
        studentCount={stats?.studentCount ?? 0}
        teacherCount={stats?.teacherCount ?? 0}
        parentCount={stats?.parentCount ?? 0}
      />
    </div>
  );
}
