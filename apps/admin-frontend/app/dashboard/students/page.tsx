"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, X } from "lucide-react";
import { classesApi } from "@/lib/api/classes";
import { studentsApi } from "@/lib/api/students";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { PageLoader } from "@/components/common/page-loader";

export default function StudentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["schoolClasses"],
    queryFn: classesApi.list,
  });

  const { data: unassigned = [], isLoading: unassignedLoading } = useQuery({
    queryKey: ["students", "unassigned"],
    queryFn: studentsApi.listUnassigned,
  });

  const { data: allStudents = [], isLoading: allStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.list,
  });

  if (classesLoading || unassignedLoading) {
    return <PageLoader text="Loading classes..." />;
  }

  const totalAssigned = classes.reduce(
    (sum, c) =>
      sum +
      (c.sections?.reduce((s, sec) => s + (sec.studentCount ?? 0), 0) ?? 0),
    0,
  );

  const isSearching = debouncedSearch.length > 0;

  const filteredClasses = isSearching
    ? classes.filter((cls) => {
        const classMatches = cls.name.toLowerCase().includes(debouncedSearch);
        const sectionMatches = cls.sections?.some((sec) =>
          `${cls.name} ${sec.name}`.toLowerCase().includes(debouncedSearch),
        );
        return classMatches || sectionMatches;
      })
    : classes;

  const matchingStudents = isSearching
    ? allStudents.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          s.admissionNo.toLowerCase().includes(debouncedSearch)
        );
      })
    : [];

  const noResults =
    isSearching &&
    filteredClasses.length === 0 &&
    matchingStudents.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Students</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Students
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Browse students by class and section.
          </p>
        </div>

        <Link
          href="/dashboard/students/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          + Add Student
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by student name, admission no., class or section"
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
              Enrolled Students
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {totalAssigned}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Across all classes and sections
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-secondary">
              Unassigned Students
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {unassignedLoading ? "—" : unassigned.length}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Not yet enrolled in a section
            </p>
          </div>
        </div>
      )}

      {isSearching && matchingStudents.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border bg-surface-secondary/40 px-6 py-4">
            <h2 className="font-semibold text-text-primary">
              Matching Students
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Students whose name or admission no. match &quot;{searchInput}
              &quot;.
            </p>
          </div>

          <div className="divide-y divide-border">
            {matchingStudents.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/students/${s.id}`}
                className="flex items-center justify-between px-6 py-3 text-sm transition hover:bg-surface-secondary/70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {s.firstName.slice(0, 1).toUpperCase()}
                    {s.lastName?.slice(0, 1).toUpperCase() ?? ""}
                  </div>

                  <span className="font-medium text-text-primary">
                    {s.firstName} {s.lastName ?? ""}
                  </span>
                </div>

                <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {s.admissionNo}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {noResults ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-text-muted">
            No students, classes or sections match &quot;{searchInput}&quot;.
          </p>
        </div>
      ) : (
        filteredClasses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              >
                <div className="border-b border-border bg-surface-secondary/40 px-5 py-3">
                  <h2 className="font-semibold text-text-primary">
                    {cls.name}
                  </h2>
                </div>

                <div className="p-5">
                  {!cls.sections || cls.sections.length === 0 ? (
                    <p className="text-sm text-text-muted">
                      No sections yet for this class.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cls.sections
                        .filter((section) =>
                          isSearching
                            ? `${cls.name} ${section.name}`
                                .toLowerCase()
                                .includes(debouncedSearch) ||
                              cls.name.toLowerCase().includes(debouncedSearch)
                            : true,
                        )
                        .map((section) => (
                          <Link
                            key={section.id}
                            href={`/dashboard/students/section/${section.id}`}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary/50 px-3 py-2 text-sm transition hover:border-primary hover:bg-primary-soft"
                          >
                            <Users className="h-3.5 w-3.5 text-text-muted" />

                            <span className="font-medium text-text-primary">
                              {section.name}
                            </span>

                            <span className="text-xs text-text-muted">
                              ({section.studentCount ?? 0})
                            </span>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!isSearching && !unassignedLoading && unassigned.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border bg-surface-secondary/40 px-6 py-4">
            <h2 className="font-semibold text-text-primary">
              Unassigned Students
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Students not yet enrolled in a class or section.
            </p>
          </div>

          <div className="divide-y divide-border">
            {unassigned.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/students/${s.id}`}
                className="flex items-center justify-between px-6 py-3 text-sm transition hover:bg-surface-secondary/70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {s.firstName.slice(0, 1).toUpperCase()}
                    {s.lastName?.slice(0, 1).toUpperCase() ?? ""}
                  </div>

                  <span className="font-medium text-text-primary">
                    {s.firstName} {s.lastName ?? ""}
                  </span>
                </div>

                <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {s.admissionNo}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
