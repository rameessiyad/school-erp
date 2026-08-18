"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { authApi } from "@/lib/api/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
  });

  useEffect(() => {
    if (!hasToken || isError) {
      localStorage.removeItem("accessToken");
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hasToken, isError, pathname, router]);

  if (!hasToken || isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex h-full">
        <DashboardSidebar user={user} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
            <div>
              <h2 className="text-sm font-medium text-text-secondary">
                School Administration
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-text-primary">
                  {user.email ?? "Administrator"}
                </p>
                <p className="text-xs text-text-secondary">{user.role}</p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {(user.email?.[0] ?? "A").toUpperCase()}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
