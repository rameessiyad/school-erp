"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parentsApi } from "@/lib/api/parents";
import { PageLoader } from "@/components/common/page-loader";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { classesApi } from "@/lib/api/classes";
import { AlertTriangle, Search, Users, X } from "lucide-react";

export default function ParentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["schoolClasses"],
    queryFn: classesApi.list,
  });

  const { data: parents = [], isLoading: parentsLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: parentsApi.list,
  });

  if (classesLoading) {
    return <PageLoader text="Loading classes..." />;
  }

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

  const matchingParents = isSearching
    ? parents.filter((p) => {
        const fullName = `${p.firstName} ${p.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          (p.email ?? "").toLowerCase().includes(debouncedSearch) ||
          (p.phone ?? "").toLowerCase().includes(debouncedSearch)
        );
      })
    : [];

  const linkedCount = parents.filter(
    (p) => p.parentStudents && p.parentStudents.length > 0,
  ).length;

  const noResults =
    isSearching && filteredClasses.length === 0 && matchingParents.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">People</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Parents
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage parents and their linked students.
          </p>
        </div>

        <Link
          href="/dashboard/parents/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          + Add Parent
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by parent name, email, phone, class or section"
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
              Total Parents
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {parentsLoading ? "—" : parents.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-secondary">
              Linked to a Student
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {parentsLoading ? "—" : linkedCount}
            </p>
          </div>
        </div>
      )}

      {isSearching && matchingParents.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border bg-surface-secondary/40 px-6 py-4">
            <h2 className="font-semibold text-text-primary">
              Matching Parents
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Parents whose name, email or phone match &quot;{searchInput}
              &quot;.
            </p>
          </div>

          <div className="divide-y divide-border">
            {matchingParents.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/parents/${p.id}`}
                className="flex items-center justify-between px-6 py-3 text-sm transition hover:bg-surface-secondary/70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {p.firstName.slice(0, 1).toUpperCase()}
                    {p.lastName?.slice(0, 1).toUpperCase() ?? ""}
                  </div>

                  <div>
                    <p className="font-medium text-text-primary">
                      {p.firstName} {p.lastName ?? ""}
                    </p>

                    <p className="text-xs text-text-muted">
                      {p.email ?? p.phone ?? "—"}
                    </p>
                  </div>
                </div>

                <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {p.parentStudents?.length
                    ? `${p.parentStudents.length} student${p.parentStudents.length === 1 ? "" : "s"}`
                    : "Unlinked"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {noResults ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-text-muted">
            No parents, classes or sections match &quot;{searchInput}&quot;.
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
                        .map((section) => {
                          const needsAttention =
                            (section.studentCount ?? 0) > 0 &&
                            (section.parentCount ?? 0) === 0;

                          return (
                            <Link
                              key={section.id}
                              href={`/dashboard/parents/section/${section.id}`}
                              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition hover:border-primary hover:bg-primary-soft ${
                                needsAttention
                                  ? "border-warning/40 bg-warning-soft/40"
                                  : "border-border bg-surface-secondary/50"
                              }`}
                            >
                              <Users className="h-3.5 w-3.5 text-text-muted" />

                              <span className="font-medium text-text-primary">
                                {section.name}
                              </span>

                              <span className="text-xs text-text-muted">
                                ({section.parentCount ?? 0} of{" "}
                                {section.studentCount ?? 0} linked)
                              </span>

                              {needsAttention && (
                                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                              )}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
