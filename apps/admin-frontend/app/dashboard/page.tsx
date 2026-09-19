"use client";

import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  GraduationCap,
  ReceiptText,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { dashboardApi, DashboardFilterBy } from "@/lib/api/dashboard";
import { authApi } from "@/lib/api/auth";
import { Module } from "@/lib/permissions/module.enum";
import { PageLoader } from "@/components/common/page-loader";
import { DashboardChart } from "@/components/dashboard/dashboard-charts";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { StaffAttendanceCard } from "@/components/dashboard/staff-attendance-card";
import { useEffect, useRef, useState } from "react";
import { academicYearApi } from "@/lib/api/academic-year";

function formatCurrency(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

const quickActions = [
  {
    title: "Add Student",
    href: "/dashboard/students/new",
    icon: GraduationCap,
    requiredModules: [Module.STUDENT_ADMISSIONS, Module.STUDENT_REGISTRATION],
  },
  {
    title: "Add Staff",
    href: "/dashboard/staff/new",
    icon: UserRound,
    requiredModules: [Module.PARENT_DETAILS],
  },
  {
    title: "Add Teacher",
    href: "/dashboard/teachers/new",
    icon: UserRound,
    requiredModules: [Module.TEACHER_MANAGEMENT],
  },
  {
    title: "Add Fee Structure",
    href: "/dashboard/fee-structures/new",
    icon: ReceiptText,
    requiredModules: [Module.STUDENT_FEES, Module.FEE_REPORTS],
  },
];

export default function DashboardPage() {
  const [filterBy, setFilterBy] = useState<DashboardFilterBy>("month");
  const [selectedYearId, setSelectedYearId] = useState<string | undefined>(
    undefined,
  );
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const yearMenuRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.me,
  });

  const { data: academicYears } = useQuery({
    queryKey: ["academicYears"],
    queryFn: academicYearApi.getAll,
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats", filterBy, selectedYearId],
    queryFn: () => dashboardApi.getStats(filterBy, selectedYearId),
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        yearMenuRef.current &&
        !yearMenuRef.current.contains(e.target as Node)
      ) {
        setYearMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading || !user) {
    return <PageLoader text="Loading dashboard..." />;
  }

  const isAdmin = user.role === "SCHOOL_ADMIN" || user.role === "SUPER_ADMIN";
  const isStaff = user.role === "STAFF";
  const allowedModules = user.allowedModules ?? [];

  const hasModule = (requiredModules?: Module[]) => {
    if (isAdmin) return true;
    if (!requiredModules) return true;
    return requiredModules.some((m) => allowedModules.includes(m));
  };

  const visibleQuickActions = quickActions.filter((action) =>
    hasModule(action.requiredModules),
  );

  const canSeeFees = hasModule([
    Module.STUDENT_FEES,
    Module.FEE_REPORTS,
    Module.PAYMENT_HISTORY,
  ]);

  const canSeeAttendance = hasModule([Module.STUDENT_ATTENDANCE]);

  const canSeeClasses = hasModule([Module.ACADEMIC_YEAR]);

  const statCards = [
    {
      title: "Total Students",
      value: stats?.studentCount ?? 0,
      description: "Currently enrolled",
      icon: GraduationCap,
      show: hasModule([Module.STUDENT_ADMISSIONS, Module.STUDENT_REGISTRATION]),
    },
    {
      title: "Teachers",
      value: stats?.teacherCount ?? 0,
      description: "Active teachers",
      icon: UserRound,
      show: hasModule([Module.TEACHER_MANAGEMENT]),
    },
    {
      title: "Classes",
      value: stats?.classCount ?? 0,
      description: "Active classes",
      icon: BookOpen,
      show: canSeeClasses,
    },
    {
      title: "Fees Collected",
      value: formatCurrency(stats?.totalFeesCollected ?? 0),
      description: `${stats?.feeCollectionPercentage ?? 0}% collected`,
      secondaryLabel: "Pending",
      secondaryValue: formatCurrency(stats?.totalFeesPending ?? 0),
      icon: Wallet,
      show: canSeeFees,
    },
  ].filter((card) => card.show);

  return (
    <div className="max-w-auto space-y-6">
      {/* Header */}
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

        {isStaff && <StaffAttendanceCard />}

        {stats?.academicYear && (
          <div className="relative" ref={yearMenuRef}>
            <button
              type="button"
              onClick={() => setYearMenuOpen((v) => !v)}
              className="flex w-fit items-center cursor-pointer gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary shadow-sm transition hover:border-primary/40"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              <span>
                Academic Year{" "}
                <span className="font-medium text-text-primary">
                  {stats.academicYear.label}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>

            {yearMenuOpen && (
              <div className="absolute right-0 z-10 mt-1.5 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
                {academicYears?.map((year) => (
                  <button
                    key={year.id}
                    type="button"
                    onClick={() => {
                      setSelectedYearId(year.id);
                      setYearMenuOpen(false);
                    }}
                    className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition hover:bg-primary-soft ${
                      stats.academicYear?.id === year.id
                        ? "font-medium text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    {year.label}
                    {year.isActive && (
                      <span className="ml-1.5 text-xs text-text-muted">
                        (active)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {statCards.length > 0 && (
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

                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-2xl font-bold tracking-tight text-text-primary">
                        {stat.value}
                      </p>

                      {stat.secondaryValue && (
                        <p className="text-sm font-semibold text-orange-500">
                          {stat.secondaryValue}
                          <span className="ml-1 text-xs font-normal text-text-muted">
                            {stat.secondaryLabel}
                          </span>
                        </p>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-text-muted">
                      {stat.description}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fee Trend + Attendance Trend + Quick Actions — single row */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {(canSeeFees || canSeeAttendance) && (
          <div className="lg:col-span-2">
            <DashboardChart
              feeData={stats?.feeTrend ?? []}
              attendanceData={stats?.attendanceTrend ?? []}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
              allowedCharts={[
                ...(canSeeFees ? (["fee"] as const) : []),
                ...(canSeeAttendance ? (["attendance"] as const) : []),
              ]}
            />
          </div>
        )}

        {visibleQuickActions.length > 0 && (
          <div
            className={canSeeFees || canSeeAttendance ? "" : "lg:col-span-3"}
          >
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Quick Actions
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Common tasks you can access quickly.
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                {visibleQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-surface-secondary px-3 py-3 transition hover:border-primary/40 hover:bg-primary-soft"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary transition group-hover:text-text-primary">
                        {action.title}
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-text-muted transition group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fee Overview + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* {canSeeFees && (
          <div className="lg:col-span-1">
            <FeeOverview
              collected={stats?.totalFeesCollected ?? 0}
              pending={stats?.totalFeesPending ?? 0}
              percentage={stats?.feeCollectionPercentage ?? 0}
            />
          </div>
        )} */}

        <div className={canSeeFees ? "lg:col-span-2" : "lg:col-span-3"}>
          <DashboardActivity
            recentActivities={stats?.recentActivities ?? []}
            upcomingFees={stats?.upcomingFees ?? []}
            upcomingExams={stats?.upcomingExams ?? []}
          />
        </div>
      </div>
    </div>
  );
}
