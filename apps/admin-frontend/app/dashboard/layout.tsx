"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, User } from "lucide-react";
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
  const queryClient = useQueryClient();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    queryClient.clear();
    router.replace("/login");
  };

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
        <DashboardSidebar
          user={user}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-secondary lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="truncate text-sm font-medium text-text-secondary">
                School Administration
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-surface-secondary"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-text-primary">
                      {user.email ?? "Administrator"}
                    </p>
                    <p className="text-xs text-text-secondary">{user.role}</p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {(user.email?.[0] ?? "A").toUpperCase()}
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push("/dashboard/profile");
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-primary-soft hover:text-text-primary"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>

                    <div className="border-t border-border" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
