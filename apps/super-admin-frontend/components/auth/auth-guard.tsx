"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";

type AuthStatus = "loading" | "authorized" | "unauthorized";

function subscribe(callback: () => void) {
  // Fires if another tab logs out or changes the stored session
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): AuthStatus {
  const token = localStorage.getItem("accessToken");
  try {
    const raw = localStorage.getItem("user");
    const role = raw ? JSON.parse(raw).role : null;
    return token && role === "SUPER_ADMIN" ? "authorized" : "unauthorized";
  } catch {
    return "unauthorized";
  }
}

// Used on the server and during hydration, so server and client HTML match
function getServerSnapshot(): AuthStatus {
  return "loading";
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (status === "unauthorized") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authorized") {
    return <PageLoader fullScreen text="Checking access" />;
  }

  return <>{children}</>;
}
