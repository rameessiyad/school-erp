"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, X } from "lucide-react";
import { classesApi } from "@/lib/api/classes";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { PageLoader } from "@/components/common/page-loader";

export default function StudentAttendancePage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["schoolClasses"],
    queryFn: classesApi.list,
  });

  if (isLoading) {
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

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Attendance</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Student Attendance
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Browse attendance records by class and section.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by class or section"
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

      {filteredClasses.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-text-muted">
            No classes or sections match &quot;{searchInput}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
            >
              <div className="border-b border-border bg-surface-secondary/40 px-5 py-3">
                <h2 className="font-semibold text-text-primary">{cls.name}</h2>
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
                          href={`/dashboard/student-attendance/section/${section.id}`}
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
      )}
    </div>
  );
}
