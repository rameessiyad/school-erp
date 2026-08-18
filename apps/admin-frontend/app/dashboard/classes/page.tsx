"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { classesApi } from "@/lib/api/classes";
import { ClassListTable } from "@/components/tables/class-list-table";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";

export default function ClassesPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: schoolClasses = [], isLoading } = useQuery({
    queryKey: ["schoolClasses"],
    queryFn: classesApi.list,
  });

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading classes...</p>;
  }

  const isSearching = debouncedSearch.length > 0;

  const filteredClasses = isSearching
    ? schoolClasses.filter((c) => {
        const classMatches = c.name.toLowerCase().includes(debouncedSearch);
        const sectionMatches = c.sections?.some((s) =>
          `${c.name} ${s.name}`.toLowerCase().includes(debouncedSearch),
        );
        return classMatches || sectionMatches;
      })
    : schoolClasses;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Classes
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage the classes available in your school.
          </p>
        </div>

        <Link
          href="/dashboard/classes/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          + Add Class
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search classes or sections (e.g. 8, 7A)"
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
              Total Classes
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {schoolClasses.length}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Classes registered in your school
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">
              {isSearching ? "Search Results" : "All Classes"}
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              {isSearching
                ? `Classes matching "${searchInput}"`
                : "View all classes in your school"}
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {filteredClasses.length}{" "}
            {filteredClasses.length === 1 ? "class" : "classes"}
          </span>
        </div>

        <ClassListTable
          classes={filteredClasses}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
