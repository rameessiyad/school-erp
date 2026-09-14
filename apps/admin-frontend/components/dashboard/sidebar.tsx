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
  {
    label: "Subject Allocation",
    href: "/dashboard/subject-allocation",
    icon: ClipboardList,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  {
    label: "Exams",
    href: "/dashboard/exams",
    icon: ClipboardList,
    requiredModules: [Module.ACADEMIC_YEAR],
  },
  {
    label: "Attendance",
    icon: ClipboardList,
    requiredModules: [Module.STUDENT_ATTENDANCE],
    children: [
      { label: "Teacher Attendance", href: "/dashboard/teacher-attendance" },
      { label: "Staff Attendance", href: "/dashboard/staff-attendance" },
      { label: "Student Attendance", href: "/dashboard/student-attendance" },
    ],
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
    adminOnly: true,
  },
  {
    label: "Apply Leave",
    href: "/dashboard/apply-leave",
    icon: ClipboardList,
    requiredModules: undefined,
    staffOnly: true,
  },
];

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";
const TOOLTIP_HIDE_DELAY_MS = 150;

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
    <aside
      className={`hidden h-full shrink-0 border-r border-border bg-surface transition-all duration-200 lg:flex lg:flex-col ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div
        className={`flex shrink-0 border-b border-border ${
          collapsed
            ? "flex-col items-center gap-2 px-2 py-3"
            : "h-16 items-center justify-between px-5"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <School className="h-5 w-5" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-text-primary">
                School ERP
              </h1>
              <p className="truncate text-[11px] text-text-muted">
                Administration
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Main Menu
          </p>
        )}

        <nav className="space-y-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const active = isChildActive(item.children);
              const open = !collapsed && (openGroups[item.label] ?? active);

              const groupButton = (
                <button
                  type="button"
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? "text-primary" : "text-text-muted"
                    }`}
                  />

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>

                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${
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
                      <div className="min-w-[190px] rounded-lg border border-border bg-surface p-2 shadow-lg">
                        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                          {item.label}
                        </p>

                        {item.children.map((child) => {
                          const childActive = pathname.startsWith(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium transition ${
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
                    <div className="mt-1 space-y-1 border-l border-border pl-4">
                      {item.children.map((child) => {
                        const childActive = pathname.startsWith(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    active ? "text-primary" : "text-text-muted"
                  }`}
                />

                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <SidebarTooltip
                  key={item.href}
                  content={
                    <div className="whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-xs font-medium text-surface shadow-md">
                      {item.label}
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
              <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                System
              </p>
            )}

            {collapsed && <div className="mt-4" />}

            {(() => {
              const settingsLink = (
                <Link
                  href="/dashboard/settings"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary ${
                    collapsed ? "justify-center px-0" : ""
                  }`}
                >
                  <Settings className="h-[18px] w-[18px] shrink-0 text-text-muted" />
                  {!collapsed && "Settings"}
                </Link>
              );

              if (collapsed) {
                return (
                  <SidebarTooltip
                    content={
                      <div className="whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-xs font-medium text-surface shadow-md">
                        Settings
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
          className={`flex items-center gap-3 rounded-lg bg-surface-secondary p-3 ${
            collapsed ? "flex-col gap-2" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            {(user.email?.[0] ?? "A").toUpperCase()}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {user.email ?? "Administrator"}
              </p>

              <p className="text-xs capitalize text-text-muted">
                {user.role.toLowerCase()}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="text-text-muted cursor-pointer transition hover:text-error disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
