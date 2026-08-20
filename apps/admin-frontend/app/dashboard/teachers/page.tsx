"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { teachersApi } from "@/lib/api/teachers";
import { TeacherTable } from "@/components/tables/teacher-table";
import { AssignClassTeacherModal } from "@/components/teachers/assign-class-teacher-modal";
import { PageLoader } from "@/components/common/page-loader";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";

export default function TeachersPage() {
  const [assignOpen, setAssignOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: teachersApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading teachers..." />;
  }

  const isSearching = debouncedSearch.length > 0;

  const filteredTeachers = isSearching
    ? teachers.filter((t) => {
        const fullName = `${t.firstName} ${t.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          t.email?.toLowerCase().includes(debouncedSearch) ||
          t.employeeId?.toLowerCase().includes(debouncedSearch) ||
          t.qualification?.toLowerCase().includes(debouncedSearch)
        );
      })
    : teachers;

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

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, employee ID or qualification"
          className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isSearching && (
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
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">
              {isSearching ? "Matching Teachers" : "All Teachers"}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {isSearching
                ? `Teachers whose name, email, employee ID or qualification match "${searchInput}".`
                : "View all teachers registered in your school"}
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {filteredTeachers.length}{" "}
            {filteredTeachers.length === 1 ? "teacher" : "teachers"}
          </span>
        </div>

        {isSearching && filteredTeachers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">
              No teachers match &quot;{searchInput}&quot;.
            </p>
          </div>
        ) : (
          <TeacherTable teachers={filteredTeachers} />
        )}
      </div>

      <AssignClassTeacherModal open={assignOpen} onOpenChange={setAssignOpen} />
    </div>
  );
}
