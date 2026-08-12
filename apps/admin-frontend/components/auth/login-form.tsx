"use client";

import { LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { Button, Input } from "@base-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/error";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-slate-50 w-full flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl bg-white">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <span className="text-xl font-bold">S</span>
          </div>

          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Sign in to your School ERP account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="schoolId"
                className="text-sm font-medium text-slate-700"
              >
                School ID
              </Label>
              <Input
                id="schoolId"
                placeholder="e.g. school_abc123"
                {...register("schoolId")}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-3.5 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.schoolId && (
                <p className="text-xs text-red-500">
                  {errors.schoolId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.com"
                {...register("email")}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-3.5 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-3.5 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-center">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg cursor-pointer bg-blue-600 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Secure access for authorized school staff
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
