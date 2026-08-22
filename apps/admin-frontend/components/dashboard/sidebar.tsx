"use client";

import { authApi } from "@/lib/api/auth";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserRound,
  Wallet,
  Settings,
  LogOut,
  School,
  Briefcase,
  BookOpen,
  Layers,
  Receipt,
  ClipboardList,
  School2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Module } from "@/lib/permissions/module.enum";

interface DashboardSidebarProps {
  user: {
    id: string;
    email?: string;
    role: string;
    allowedModules?: string[];
  };
}

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiredModules: undefined,
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: GraduationCap,
    requiredModules: [Module.STUDENT_ADMISSIONS, Module.STUDENT_REGISTRATION],
  },
  {
    label: "Teachers",
    href: "/dashboard/teachers",
    icon: UserRound,
    requiredModules: [Module.TEACHER_MANAGEMENT],
  },
  {
    label: "Parents",
    href: "/dashboard/parents",
    icon: Users,
    requiredModules: [Module.PARENT_DETAILS],
  },
  {
    label: "Staff",
    href: "/dashboard/staff",
    icon: Briefcase,
    requiredModules: [Module.USER_MANAGEMENT],
  },
  {
    label: "Subjects",
    href: "/dashboard/subjects",
    icon: BookOpen,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  {
    label: "Classes",
    href: "/dashboard/classes",
    icon: Layers,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  // {
  //   label: "Sections",
  //   href: "/dashboard/sections",
  //   icon: LayoutGrid,
  //   requiredModules: [Module.ACADEMIC_YEAR],
  // },
  {
    label: "Subject Allocation",
    href: "/dashboard/subject-allocation",
    icon: ClipboardList,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  {
    label: "Fee Structures",
    href: "/dashboard/fee-structures",
    icon: Wallet,
    requiredModules: [
      Module.STUDENT_FEES,
      Module.FEE_REPORTS,
      Module.PAYMENT_HISTORY,
    ],
  },
  {
    label: "Fees",
    href: "/dashboard/fees",
    icon: Receipt,
    requiredModules: [Module.STUDENT_FEES, Module.PAYMENT_HISTORY],
  },
  {
    label: "Leave Applications",
    href: "/dashboard/leave-applications",
    icon: School2,
    requiredModules: undefined,
    adminOnly: true, // NEW
  },
  {
    label: "Apply Leave",
    href: "/dashboard/apply-leave",
    icon: ClipboardList,
    requiredModules: undefined,
    staffOnly: true,
  },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = user.role === "SCHOOL_ADMIN" || user.role === "SUPER_ADMIN";
  const allowedModules = user.allowedModules ?? [];

  const visibleNavigation = navigation.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.staffOnly) return user.role === "STAFF";
    if (isAdmin) return true;
    if (!item.requiredModules) return true;
    return item.requiredModules.some((m) => allowedModules.includes(m));
  });

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      authApi.logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <School className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-sm font-bold text-text-primary">School ERP</h1>
          <p className="text-[11px] text-text-muted">Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Main Menu
        </p>

        <nav className="space-y-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${
                    active ? "text-primary" : "text-text-muted"
                  }`}
                />

                {item.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <>
            <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              System
            </p>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              <Settings className="h-[18px] w-[18px] text-text-muted" />
              Settings
            </Link>
          </>
        )}
      </div>

      {/* User */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-surface-secondary p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            {(user.email?.[0] ?? "A").toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user.email ?? "Administrator"}
            </p>

            <p className="text-xs capitalize text-text-muted">
              {user.role.toLowerCase()}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-text-muted cursor-pointer transition hover:text-error disabled:opacity-50"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
