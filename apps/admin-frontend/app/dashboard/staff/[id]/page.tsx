"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Pencil,
  Phone,
  UserRound,
  X,
  ZoomIn,
} from "lucide-react";

import { staffApi } from "@/lib/api/staff";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/page-loader";

export default function StaffDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [isImageOpen, setIsImageOpen] = useState(false);

  const {
    data: staff,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staff", params.id],
    queryFn: () => staffApi.get(params.id),
  });

  /*
   * Close image popup with Escape key
   */
  useEffect(() => {
    if (!isImageOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageOpen]);

  /*
   * Prevent page scrolling while image popup is open
   */
  useEffect(() => {
    if (!isImageOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isImageOpen]);

  if (isLoading) {
    return <PageLoader text="Loading staff details..." />;
  }

  if (isError || !staff) {
    router.push("/dashboard/staff");
    return null;
  }

  const fullName = `${staff.firstName} ${staff.lastName ?? ""}`.trim();

  const initials = `${staff.firstName.slice(0, 1)}${
    staff.lastName?.slice(0, 1) ?? ""
  }`.toUpperCase();

  return (
    <>
      <div className="space-y-8">
        {/* ========================================================= */}
        {/* Page Header */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">Staff</p>

            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              Staff Details
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              View this staff member&apos;s personal information and role.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/staff">
              <Button
                variant="outline"
                className="h-10 rounded-lg border-border bg-surface px-4 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <Link href={`/dashboard/staff/${staff.id}/edit`}>
              <Button className="h-10 rounded-lg bg-primary px-5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Staff
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Main Card */}
        {/* ========================================================= */}

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {/* ======================================================= */}
          {/* Staff Header */}
          {/* ======================================================= */}

          <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center lg:px-8">
            {/* Profile Image */}
            <div className="relative shrink-0">
              {staff.photoUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="group relative block h-20 w-20 overflow-hidden rounded-full border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-surface"
                  aria-label={`View ${fullName}'s profile photo`}
                >
                  <Image
                    src={staff.photoUrl}
                    alt={fullName}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-5 w-5 text-white" />
                  </span>
                </button>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">
                  {initials}
                </div>
              )}
            </div>

            {/* Staff Name */}
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-text-primary">
                {fullName}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {staff.designation.replace(/_/g, " ")}
              </p>
            </div>

            {/* Status */}
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold sm:ml-auto ${
                staff.isActive
                  ? "bg-success-soft text-success"
                  : "bg-surface-secondary text-text-muted"
              }`}
            >
              <span
                className={`mr-2 h-1.5 w-1.5 rounded-full ${
                  staff.isActive ? "bg-success" : "bg-text-muted"
                }`}
              />

              {staff.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* ======================================================= */}
          {/* Personal Information */}
          {/* ======================================================= */}

          <section className="border-b border-border p-6 lg:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
                <UserRound className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Personal Information
                </h3>

                <p className="text-xs text-text-muted">
                  Basic personal information about the staff member.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-medium text-text-primary">
                  {staff.email ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {staff.phone ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                  <Briefcase className="h-3.5 w-3.5" />
                  Designation
                </p>

                <p className="mt-2 text-sm font-medium capitalize text-text-primary">
                  {staff.designation.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* =========================================================== */}
      {/* Image Preview Modal */}
      {/* =========================================================== */}

      {isImageOpen && staff.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${fullName} profile photo`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsImageOpen(false);
            }
          }}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-surface text-text-secondary shadow-lg transition hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl">
              <Image
                src={staff.photoUrl}
                alt={fullName}
                width={800}
                height={800}
                className="max-h-[85vh] w-auto max-w-[85vw] object-contain"
                priority
              />
            </div>

            {/* Name */}
            <p className="mt-3 text-center text-sm font-medium text-white">
              {fullName}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
