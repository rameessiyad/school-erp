"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { studentsApi } from "@/lib/api/students";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { PageLoader } from "@/components/common/page-loader";
import { UnassignedStudentsTable } from "@/components/tables/unassigned-students-list";

export default function UnassignedStudentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", "unassigned"],
    queryFn: () => studentsApi.listUnassigned(),
  });

  if (isLoading) {
    return <PageLoader text="Loading students..." />;
  }

  const isSearching = debouncedSearch.length > 0;

  const filteredStudents = isSearching
    ? students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          s.admissionNo.toLowerCase().includes(debouncedSearch)
        );
      })
    : students;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/students"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Students
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Unassigned Students
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {students.length} {students.length === 1 ? "student" : "students"} not
          yet enrolled in a class or section.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or admission no."
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

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <UnassignedStudentsTable
          students={filteredStudents}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
