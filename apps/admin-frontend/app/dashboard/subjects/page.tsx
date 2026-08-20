"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { subjectsApi } from "@/lib/api/subjects";
import { PageLoader } from "@/components/common/page-loader";
import { SubjectTable } from "@/components/tables/subject-table";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";

export default function SubjectsPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectsApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading subjects..." />;
  }

  const isSearching = debouncedSearch.length > 0;

  const filteredSubjects = isSearching
    ? subjects.filter((s) => {
        return (
          s.name.toLowerCase().includes(debouncedSearch) ||
          s.code?.toLowerCase().includes(debouncedSearch)
        );
      })
    : subjects;

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

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by subject name or code"
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
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">
              {isSearching ? "Matching Subjects" : "All Subjects"}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {isSearching
                ? `Subjects whose name or code match "${searchInput}".`
                : "View all subjects configured for your school"}
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {filteredSubjects.length}{" "}
            {filteredSubjects.length === 1 ? "subject" : "subjects"}
          </span>
        </div>

        {isSearching && filteredSubjects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">
              No subjects match &quot;{searchInput}&quot;.
            </p>
          </div>
        ) : (
          <SubjectTable subjects={filteredSubjects} />
        )}
      </div>
    </div>
  );
}
