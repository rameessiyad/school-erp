"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft, UserRound, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studentsApi } from "@/lib/api/students";
import { optionsApi } from "@/lib/api/options";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [showPhoto, setShowPhoto] = useState(false);

  const {
    data: student,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student", params.id],
    queryFn: () => studentsApi.get(params.id),
  });

  const { data: years } = useQuery({
    queryKey: ["academicYears"],
    queryFn: optionsApi.academicYears,
  });

  const activeYear = years?.find((y) => y.isActive) ?? null;

  const {
    data: enrollment,
    isLoading: enrollmentLoading,
    isError: enrollmentError,
  } = useQuery({
    queryKey: ["enrollment", params.id, activeYear?.id],
    queryFn: () => studentsApi.getEnrollment(params.id, activeYear!.id),
    enabled: !!activeYear,
    retry: false, // a 404 just means "not enrolled", not a real failure
  });

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading Student...</p>;
  }

  if (isError || !student) {
    router.push("/dashboard/students");
    return null;
  }

  const fullName = `${student.firstName} ${student.lastName ?? ""}`.trim();
  const hasEnrollment = !!enrollment && !enrollmentError;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Students</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Student Details
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            View the student&apos;s admission and personal information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/students">
            <Button variant="outline" className="h-10 rounded-lg border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/students/${student.id}/edit`}>
            <Button className="h-10 rounded-lg bg-primary px-5 text-primary-foreground hover:bg-primary-hover">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => student.photoUrl && setShowPhoto(true)}
            disabled={!student.photoUrl}
            className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-lg font-bold text-primary ${
              student.photoUrl
                ? "cursor-pointer transition hover:scale-105 hover:ring-4 hover:ring-primary/10"
                : "cursor-default"
            }`}
          >
            {student.photoUrl ? (
              <Image
                src={student.photoUrl}
                alt={fullName}
                className="h-full w-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <>
                {student.firstName[0]?.toUpperCase()}
                {student.lastName?.[0]?.toUpperCase() ?? ""}
              </>
            )}
          </button>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text-primary">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Admission No.{" "}
              <span className="font-medium text-text-primary">
                {student.admissionNo}
              </span>
            </p>
          </div>

          <span
            className={`sm:ml-auto inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
              student.isActive
                ? "bg-success-soft text-success"
                : "bg-surface-secondary text-text-muted"
            }`}
          >
            <span
              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                student.isActive ? "bg-success" : "bg-text-muted"
              }`}
            />
            {student.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <UserRound className="h-4 w-4 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-text-primary">
                Personal Information
              </h3>

              <p className="text-xs text-text-secondary">
                Basic information about the student.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="text-xs font-medium text-text-muted">Gender</p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {student.gender ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="text-xs font-medium text-text-muted">
                Date of Birth
              </p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {student.dob ? new Date(student.dob).toLocaleDateString() : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="text-xs font-medium text-text-muted">Blood Group</p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {student.bloodGroup ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="text-xs font-medium text-text-muted">
                Admission Date
              </p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {student.admissionDate
                  ? new Date(student.admissionDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment */}
        <div className="border-t border-border p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-text-primary">Enrollment</h3>

              <p className="text-xs text-text-secondary">
                Current class and section for the active academic year.
              </p>
            </div>
          </div>

          {enrollmentLoading ? (
            <p className="text-sm text-text-muted">Loading enrollment...</p>
          ) : hasEnrollment ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">Class</p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {enrollment.section?.class?.name ?? "—"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">Section</p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {enrollment.section?.name ?? "—"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">Roll No.</p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {enrollment.rollNo ?? "—"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
                <p className="text-xs font-medium text-text-muted">
                  Academic Year
                </p>

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {activeYear?.label ?? "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-info/20 bg-info-soft px-4 py-3">
              <p className="text-sm text-info">
                This student is not enrolled in a class for the current academic
                year.
              </p>
            </div>
          )}
        </div>
      </div>
      {showPhoto && student.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowPhoto(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPhoto(false)}
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/70 text-white shadow-lg transition hover:bg-black"
              aria-label="Close photo"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="overflow-hidden rounded-2xl bg-surface shadow-2xl">
              <Image
                src={student.photoUrl}
                alt={fullName}
                width={800}
                height={800}
                className="max-h-[85vh] w-auto max-w-[85vw] object-contain"
                priority
              />
            </div>

            <p className="mt-3 text-center text-sm font-medium text-white">
              {fullName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
