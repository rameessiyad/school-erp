"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Building2,
  Check,
  KeyRound,
  Mail,
  Phone,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { profileApi } from "@/lib/api/profile";
import { PageLoader } from "@/components/common/page-loader";

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.get,
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      setSuccess("Password updated successfully.");
      setError(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setError(err?.response?.data?.message ?? "Failed to update password");
      setSuccess(null);
    },
  });

  function handleChangePassword() {
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    changePasswordMutation.mutate({ oldPassword, newPassword });
  }

  function closePasswordForm() {
    setShowPasswordForm(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }

  if (isLoading || !profile) return <PageLoader text="Loading profile..." />;

  const isStaff = profile.role === "STAFF";
  const displayName = isStaff
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Overview
        </Link>

        <p className="mb-1 text-sm font-medium text-primary">Account</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          View your account details and update your password.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="divide-y divide-border">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-text-muted">School</p>
              <p className="text-sm font-medium text-text-primary">
                {profile.schoolName ?? "—"}
              </p>
            </div>
          </div>

          {isStaff && (
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Name</p>
                <p className="text-sm font-medium text-text-primary">
                  {displayName || "—"}
                </p>
                {profile.designation && (
                  <p className="text-xs text-text-muted">
                    {profile.designation}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isStaff && (
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Role</p>
                <p className="text-sm font-medium text-text-primary">
                  Administrator
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium text-text-primary">
                {profile.email ?? "—"}
              </p>
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Phone</p>
                <p className="text-sm font-medium text-text-primary">
                  {profile.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text-primary">Password</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Change the password used to sign in.
            </p>
          </div>

          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Current password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <p className="text-sm text-error sm:col-span-3">{error}</p>
            )}

            <div className="flex gap-2 sm:col-span-3">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {changePasswordMutation.isPending ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={closePasswordForm}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {success && !showPasswordForm && (
          <p className="mt-4 text-sm text-success">{success}</p>
        )}
      </div>
    </div>
  );
}
