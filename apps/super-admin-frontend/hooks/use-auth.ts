"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { notify } from "@/lib/utils/toast";
import { getErrorMessage } from "@/lib/utils/error";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Check the role BEFORE storing anything
      if (data.user.role !== "SUPER_ADMIN") {
        notify.error("Access denied. Super admin accounts only.");
        return;
      }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      notify.success("Welcome back");
      router.replace("/dashboard");
    },
    onError: (error) => notify.error(getErrorMessage(error, "Login failed")),
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.replace("/login");
  };
}
