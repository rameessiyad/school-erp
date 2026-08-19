"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { subjectsApi } from "@/lib/api/subjects";
import { PageLoader } from "@/components/common/page-loader";
import { SubjectTable } from "@/components/tables/subject-table";

export default function SubjectsPage() {
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectsApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading subjects..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Subjects
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage the subjects offered by your school.
          </p>
        </div>

        <Link
          href="/dashboard/subjects/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          + Add Subject
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Total Subjects
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {subjects.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            With Subject Codes
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {subjects.filter((s) => s.code).length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">All Subjects</h2>
            <p className="mt-1 text-xs text-text-secondary">
              View all subjects configured for your school
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </span>
        </div>

        <SubjectTable subjects={subjects} />
      </div>
    </div>
  );
}
