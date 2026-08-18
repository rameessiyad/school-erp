"use client";

import { LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/error";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      await authApi.login(values.schoolId, values.email, values.password);

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setServerError(getErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl border-border/80 bg-surface shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.12)]">
      <CardHeader className="space-y-3 pb-6">
        <div>
          <CardTitle className="text-[27px] font-semibold tracking-tight text-text-primary">
            Welcome back
          </CardTitle>

          <CardDescription className="mt-2 text-sm leading-5 text-text-secondary">
            Sign in to continue to your school dashboard.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* School ID */}
          <div className="space-y-2">
            <Label
              htmlFor="schoolId"
              className="text-xs font-medium text-text-secondary"
            >
              School ID
            </Label>

            <Input
              id="schoolId"
              autoComplete="organization"
              placeholder="e.g. school_abc123"
              {...register("schoolId")}
              className="h-11 rounded-xl border-border bg-surface-secondary px-3.5 text-sm shadow-none transition-all placeholder:text-text-muted focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10"
            />

            {errors.schoolId && (
              <p className="text-xs text-error">{errors.schoolId.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-text-secondary"
            >
              Email address
            </Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@school.com"
              {...register("email")}
              className="h-11 rounded-xl border-border bg-surface-secondary px-3.5 text-sm shadow-none transition-all placeholder:text-text-muted focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10"
            />

            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-text-secondary"
              >
                Password
              </Label>

              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
                className="h-11 rounded-xl border-border bg-surface-secondary px-3.5 pr-11 text-sm shadow-none transition-all placeholder:text-text-muted focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 top-0 flex h-11 w-11 cursor-pointer items-center justify-center text-text-muted transition-colors hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="rounded-xl border border-error/20 bg-error-soft px-3.5 py-3">
              <p className="text-center text-xs font-medium text-error">
                {serverError}
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full cursor-pointer rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-primary/20 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Security */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
          <LockKeyhole className="h-3.5 w-3.5" />
          <span>Secure access for authorized school staff</span>
        </div>
      </CardContent>
    </Card>
  );
}
