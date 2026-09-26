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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Module } from "@/lib/permissions/module.enum";

interface DashboardSidebarProps {
  user: {
    id: string;
    email?: string;
    role: string;
    allowedModules?: string[];
  };
}

interface NavChild {
  label: string;
  href: string;
  adminOnly?: boolean;
  staffOnly?: boolean;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  requiredModules?: string[];
  adminOnly?: boolean;
  staffOnly?: boolean;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Admission Management",
    icon: GraduationCap,
    requiredModules: [
      Module.STUDENT_ADMISSIONS,
      Module.STUDENT_REGISTRATION,
      Module.PARENT_DETAILS,
      Module.ACADEMIC_YEAR,
    ],
    children: [
      { label: "Students", href: "/dashboard/students" },
      { label: "Parents", href: "/dashboard/parents" },
      { label: "Academic Years", href: "/dashboard/academic-year" },
      { label: "Promote Students", href: "/dashboard/academic-year/promotion" },
    ],
  },
  {
    label: "Fee Management",
    icon: Wallet,
    requiredModules: [
      Module.STUDENT_FEES,
      Module.FEE_REPORTS,
      Module.PAYMENT_HISTORY,
    ],
    children: [
      { label: "Fee Structures", href: "/dashboard/fee-structures" },
      { label: "Fees", href: "/dashboard/fees" },
    ],
  },
  {
    label: "Teacher Enrollment & Details",
    icon: UserRound,
    requiredModules: [Module.TEACHER_MANAGEMENT],
    children: [
      { label: "Teachers", href: "/dashboard/teachers" },
      { label: "Subject Allocation", href: "/dashboard/subject-allocation" },
    ],
  },
  {
    label: "Class Management",
    href: "/dashboard/classes",
    icon: Layers,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  {
    label: "Subject Management",
    href: "/dashboard/subjects",
    icon: BookOpen,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  {
    label: "Attendance",
    icon: ClipboardList,
    requiredModules: [Module.STUDENT_ATTENDANCE, Module.ATTENDANCE],
    children: [
      { label: "Teacher Attendance", href: "/dashboard/teacher-attendance" },
      { label: "Staff Attendance", href: "/dashboard/staff-attendance" },
      { label: "Student Attendance", href: "/dashboard/student-attendance" },
    ],
  },
  {
    label: "Staff Management",
    href: "/dashboard/staff",
    icon: Briefcase,
    requiredModules: [Module.USER_MANAGEMENT],
  },
  {
    label: "Exam",
    href: "/dashboard/exams",
    icon: ClipboardList,
    requiredModules: [Module.EXAM_SETTINGS],
  },
  {
    label: "Leave Application",
    icon: School2,
    children: [
      {
        label: "Applications",
        href: "/dashboard/leave-applications",
        adminOnly: true,
      },
      { label: "Apply Leave", href: "/dashboard/apply-leave", staffOnly: true },
    ],
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    icon: Megaphone,
  },
];

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";
const TOOLTIP_HIDE_DELAY_MS = 150;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  SCHOOL_ADMIN: "Admin",
  TEACHER: "Teacher",
  STAFF: "Staff",
  PARENT: "Parent",
};

/* -------------------------------------------------------------------------- */
/* Portal-based tooltip — escapes the nav's overflow-y-auto clipping,        */
/* and stays open while the cursor travels toward / rests on the panel.      */
/* -------------------------------------------------------------------------- */

function SidebarTooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const clearHideTimeout = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  };

  const show = () => {
    clearHideTimeout();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeout.current = setTimeout(() => {
      setCoords(null);
    }, TOOLTIP_HIDE_DELAY_MS);
  };

  return (
    <div ref={triggerRef} onMouseEnter={show} onMouseLeave={scheduleHide}>
      {children}

      {coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[9999] -translate-y-1/2"
            onMouseEnter={clearHideTimeout}
            onMouseLeave={scheduleHide}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const isAdmin = user.role === "SCHOOL_ADMIN" || user.role === "SUPER_ADMIN";
  const allowedModules = user.allowedModules ?? [];
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  const isChildActive = (children?: NavChild[]) =>
    !!children?.some((c) => pathname.startsWith(c.href));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((item) => {
      if (item.children && isChildActive(item.children)) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filterChildren = (children?: NavChild[]) =>
    children?.filter((c) => {
      if (c.adminOnly) return isAdmin;
      if (c.staffOnly) return user.role === "STAFF";
      return true;
    });

  const visibleNavigation = navigation
    .map((item) => ({ ...item, children: filterChildren(item.children) }))
    .filter((item) => {
      if (item.children) return item.children.length > 0;
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
    <aside
      className={`hidden h-full shrink-0 border-r border-border bg-surface transition-[width] duration-300 ease-in-out lg:flex lg:flex-col ${
        collapsed ? "w-[76px]" : "w-[264px]"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div
        className={`relative flex shrink-0 border-b border-border ${
          collapsed
            ? "flex-col items-center gap-2 px-2 py-4"
            : "h-[68px] items-center justify-between px-5"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10">
            <School className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-bold leading-tight text-text-primary">
                School ERP
              </h1>
              <p className="truncate text-[11px] font-medium text-text-muted">
                Administration
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-150 hover:bg-surface-secondary hover:text-text-primary active:scale-90"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted/70">
            Main Menu
          </p>
        )}

        <nav className="space-y-0.5">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const active = isChildActive(item.children);
              const open = !collapsed && (openGroups[item.label] ?? active);

              const groupButton = (
                <button
                  type="button"
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  className={`group relative flex w-full items-center gap-2.5 rounded-lg py-2.5 pl-2.5 pr-3 text-sm font-medium transition-all duration-150 ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                      active
                        ? "bg-primary/15"
                        : "bg-transparent group-hover:scale-105 group-hover:bg-surface"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] ${
                        active ? "text-primary" : "text-text-muted"
                      }`}
                    />
                  </span>

                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        } ${active ? "text-primary" : "text-text-muted"}`}
                      />
                    </>
                  )}
                </button>
              );

              if (collapsed) {
                return (
                  <SidebarTooltip
                    key={item.label}
                    content={
                      <div className="min-w-[200px] rounded-xl border border-border bg-surface p-2 shadow-xl ring-1 ring-black/5">
                        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted/70">
                          {item.label}
                        </p>

                        {item.children.map((child) => {
                          const childActive = pathname.startsWith(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                                childActive
                                  ? "bg-primary-soft text-primary"
                                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    }
                  >
                    {groupButton}
                  </SidebarTooltip>
                );
              }

              return (
                <div key={item.label}>
                  {groupButton}

                  {open && (
                    <div className="ml-[27px] mt-0.5 space-y-0.5 border-l border-border/70 py-0.5 pl-4 duration-150 animate-in fade-in slide-in-from-top-1">
                      {item.children.map((child) => {
                        const childActive = pathname.startsWith(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`relative flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                              childActive
                                ? "bg-primary-soft text-primary"
                                : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                            }`}
                          >
                            <span
                              className={`absolute -left-[21px] h-1.5 w-1.5 rounded-full transition-colors ${
                                childActive ? "bg-primary" : "bg-border"
                              }`}
                            />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href!));

            const link = (
              <Link
                href={item.href!}
                className={`group relative flex items-center gap-2.5 rounded-lg py-2.5 pl-2.5 pr-3 text-sm font-medium transition-all duration-150 ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                    active
                      ? "bg-primary/15"
                      : "bg-transparent group-hover:scale-105 group-hover:bg-surface"
                  }`}
                >
                  <Icon
                    className={`h-[17px] w-[17px] ${
                      active ? "text-primary" : "text-text-muted"
                    }`}
                  />
                </span>

                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <SidebarTooltip
                  key={item.href}
                  content={
                    <div className="relative whitespace-nowrap rounded-md bg-text-primary px-2.5 py-1.5 text-xs font-medium text-surface shadow-lg ring-1 ring-black/5">
                      {item.label}
                      <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-text-primary" />
                    </div>
                  }
                >
                  {link}
                </SidebarTooltip>
              );
            }

            return <div key={item.href}>{link}</div>;
          })}
        </nav>

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="mb-2.5 mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted/70">
                System
              </p>
            )}

            {collapsed && (
              <div className="mt-4 border-t border-border/70 pt-4" />
            )}

            {(() => {
              const settingsActive = pathname.startsWith("/dashboard/settings");

              const settingsLink = (
                <Link
                  href="/dashboard/settings"
                  className={`group relative flex items-center gap-2.5 rounded-lg py-2.5 pl-2.5 pr-3 text-sm font-medium transition-all duration-150 ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    settingsActive
                      ? "bg-primary-soft text-primary"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                      settingsActive
                        ? "bg-primary/15"
                        : "bg-transparent group-hover:scale-105 group-hover:bg-surface"
                    }`}
                  >
                    <Settings
                      className={`h-[17px] w-[17px] ${
                        settingsActive ? "text-primary" : "text-text-muted"
                      }`}
                    />
                  </span>
                  {!collapsed && "Settings"}
                </Link>
              );

              if (collapsed) {
                return (
                  <SidebarTooltip
                    content={
                      <div className="relative whitespace-nowrap rounded-md bg-text-primary px-2.5 py-1.5 text-xs font-medium text-surface shadow-lg ring-1 ring-black/5">
                        Settings
                        <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-text-primary" />
                      </div>
                    }
                  >
                    {settingsLink}
                  </SidebarTooltip>
                );
              }

              return settingsLink;
            })()}
          </>
        )}
      </div>

      {/* User */}
      <div className="shrink-0 border-t border-border p-3">
        <div
          className={`flex items-center gap-3 rounded-xl bg-surface-secondary/70 p-2.5 transition-colors hover:bg-surface-secondary ${
            collapsed ? "flex-col gap-2" : ""
          }`}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary ring-2 ring-surface">
            {(user.email?.[0] ?? "A").toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {user.email ?? "Administrator"}
              </p>

              <span className="mt-0.5 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {roleLabel}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-150 hover:bg-surface hover:text-error disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
