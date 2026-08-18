"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  UserRound,
  X,
  ZoomIn,
} from "lucide-react";

import { teachersApi } from "@/lib/api/teachers";
import { Button } from "@/components/ui/button";

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [isImageOpen, setIsImageOpen] = useState(false);

  const {
    data: teacher,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teacher", params.id],
    queryFn: () => teachersApi.get(params.id),
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
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-text-muted">Loading Teacher...</p>
      </div>
    );
  }

  if (isError || !teacher) {
    router.push("/dashboard/teachers");
    return null;
  }

  const fullName = `${teacher.firstName} ${teacher.lastName ?? ""}`.trim();

  const allocations = teacher.teacherSubjectAllocations ?? [];

  const initials = `${teacher.firstName.slice(0, 1)}${
    teacher.lastName?.slice(0, 1) ?? ""
  }`.toUpperCase();

  return (
    <>
      <div className="space-y-8">
        {/* ========================================================= */}
        {/* Page Header */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">Teachers</p>

            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              Teacher Details
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              View the teacher&apos;s personal and professional information.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/teachers">
              <Button
                variant="outline"
                className="h-10 rounded-lg border-border bg-surface px-4 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
              <Button className="h-10 rounded-lg bg-primary px-5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Teacher
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Main Card */}
        {/* ========================================================= */}

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {/* ======================================================= */}
          {/* Teacher Header */}
          {/* ======================================================= */}

          <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center lg:px-8">
            {/* Profile Image */}
            <div className="relative shrink-0">
              {teacher.photoUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="group relative block h-20 w-20 overflow-hidden rounded-full border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-surface"
                  aria-label={`View ${fullName}'s profile photo`}
                >
                  <Image
                    src={teacher.photoUrl}
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

            {/* Teacher Name */}
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-text-primary">
                {fullName}
              </h2>

              {teacher.employeeId && (
                <p className="mt-1 text-sm text-text-muted">
                  Employee ID:{" "}
                  <span className="font-medium text-text-secondary">
                    {teacher.employeeId}
                  </span>
                </p>
              )}
            </div>

            {/* Status */}
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold sm:ml-auto ${
                teacher.isActive
                  ? "bg-success-soft text-success"
                  : "bg-surface-secondary text-text-muted"
              }`}
            >
              <span
                className={`mr-2 h-1.5 w-1.5 rounded-full ${
                  teacher.isActive ? "bg-success" : "bg-text-muted"
                }`}
              />

              {teacher.isActive ? "Active" : "Inactive"}
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
                  Basic personal information about the teacher.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Gender */}
              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">Gender</p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {teacher.gender ?? "—"}
                </p>
              </div>

              {/* Date of Birth */}
              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">
                  Date of Birth
                </p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {teacher.dob
                    ? new Date(teacher.dob).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              {/* Joining Date */}
              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">
                  Joining Date
                </p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {teacher.joiningDate
                    ? new Date(teacher.joiningDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              {/* Employee ID */}
              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">
                  Employee ID
                </p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {teacher.employeeId ?? "—"}
                </p>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* Contact Information */}
          {/* ======================================================= */}

          <section className="border-b border-border p-6 lg:px-8">
            <div className="mb-5">
              <h3 className="font-semibold text-text-primary">
                Contact Information
              </h3>

              <p className="mt-1 text-xs text-text-muted">
                Contact and account details of the teacher.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">Email</p>

                <p className="mt-2 break-all text-sm font-medium text-text-primary">
                  {teacher.email ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">Phone</p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {teacher.phone ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">
                  Qualification
                </p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {teacher.qualification ?? "—"}
                </p>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* Subject Allocations */}
          {/* ======================================================= */}

          <section className="p-6 lg:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Subject Allocations
                </h3>

                <p className="text-xs text-text-muted">
                  Subjects, sections, and academic years assigned to this
                  teacher.
                </p>
              </div>
            </div>

            {allocations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-secondary/50 px-5 py-9 text-center">
                <p className="text-sm font-medium text-text-secondary">
                  No allocations assigned
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  This teacher has no subject allocations yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-surface-secondary/70 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Subject
                        </th>

                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Class
                        </th>

                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Section
                        </th>

                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Academic Year
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {allocations.map((allocation) => (
                        <tr
                          key={allocation.id}
                          className="transition-colors hover:bg-surface-secondary/40"
                        >
                          <td className="px-4 py-3 font-medium text-text-primary">
                            {allocation.subject.name}
                          </td>

                          <td className="px-4 py-3 text-text-secondary">
                            {allocation.section.class.name}
                          </td>

                          <td className="px-4 py-3 text-text-secondary">
                            {allocation.section.name}
                          </td>

                          <td className="px-4 py-3 text-text-secondary">
                            {allocation.academicYear.label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* =========================================================== */}
      {/* Image Preview Modal */}
      {/* =========================================================== */}

      {isImageOpen && teacher.photoUrl && (
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
                src={teacher.photoUrl}
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
