"use client";

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
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: GraduationCap,
  },
  {
    label: "Teachers",
    href: "/dashboard/teachers",
    icon: UserRound,
  },
  {
    label: "Parents",
    href: "/dashboard/parents",
    icon: Users,
  },
  {
    label: "Staff",
    href: "/dashboard/staff",
    icon: Briefcase,
  },
  {
    label: "Subjects",
    href: "/dashboard/subjects",
    icon: BookOpen,
  },
  {
    label: "Classes",
    href: "/dashboard/classes",
    icon: Layers,
  },
  {
    label: "Sections",
    href: "/dashboard/sections",
    icon: LayoutGrid,
  },
  {
    label: "Fee Structures",
    href: "/dashboard/fee-structures",
    icon: Wallet,
  },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
          <School className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-sm font-bold text-slate-900">School ERP</h1>
          <p className="text-[11px] text-slate-400">Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
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
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${
                    active ? "text-blue-600" : "text-slate-400"
                  }`}
                />

                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          System
        </p>

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings className="h-[18px] w-[18px] text-slate-400" />
          Settings
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {(user.email?.[0] ?? "A").toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {user.email ?? "Administrator"}
            </p>

            <p className="text-xs capitalize text-slate-400">
              {user.role.toLowerCase()}
            </p>
          </div>

          <button
            type="button"
            className="text-slate-400 transition hover:text-red-500"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
