"use client";

import { useState } from "react";
import Link from "next/link";
import { teachersApi } from "@/lib/api/teachers";
import { TeacherTable } from "@/components/tables/teacher-table";
import { AssignClassTeacherModal } from "@/components/teachers/assign-class-teacher-modal";
import { PageLoader } from "@/components/common/page-loader";
import { useQuery } from "@tanstack/react-query";

export default function TeachersPage() {
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: teachersApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading teachers..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Teachers
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage teachers and their academic information.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            Assign Class Teacher
          </button>

          <Link
            href="/dashboard/teachers/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
          >
            + Add Teacher
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Total Teachers
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {teachers.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Active Teachers
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {teachers.filter((t) => t.isActive).length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">All Teachers</h2>
            <p className="mt-1 text-xs text-text-secondary">
              View all teachers registered in your school
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}
          </span>
        </div>

        <TeacherTable teachers={teachers} />
      </div>

      <AssignClassTeacherModal open={assignOpen} onOpenChange={setAssignOpen} />
    </div>
  );
}
