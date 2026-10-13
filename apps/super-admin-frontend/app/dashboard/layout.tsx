"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, School } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useLogout } from "@/hooks/use-auth";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Schools", href: "/dashboard/schools", icon: School },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              S
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-primary">
                SKOLA DECK
              </p>
              <p className="text-xs text-text-secondary">Super Admin</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === href
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-error-soft hover:text-error"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-x-hidden p-6 md:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
