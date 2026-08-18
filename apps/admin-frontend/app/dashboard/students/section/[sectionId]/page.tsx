"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import { sectionsApi } from "@/lib/api/sections";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { SectionStudentsTable } from "@/components/tables/section-student-list";
import { PageLoader } from "@/components/common/page-loader";

export default function SectionStudentsPage() {
  const params = useParams<{ sectionId: string }>();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const {
    data: details,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sectionDetails", params.sectionId],
    queryFn: () => sectionsApi.getDetails(params.sectionId),
  });

  if (isError) {
    router.push("/dashboard/students");
    return null;
  }

  if (isLoading || !details) {
    return <PageLoader text="Loading students..." />;
  }

  const { section, students } = details;
  const isSearching = debouncedSearch.length > 0;

  const filteredStudents = isSearching
    ? students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          s.admissionNo.toLowerCase().includes(debouncedSearch) ||
          (s.rollNo ?? "").toLowerCase().includes(debouncedSearch)
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
          {section.class?.name} — Section {section.name}
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {students.length} {students.length === 1 ? "student" : "students"}{" "}
          enrolled in this section.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, admission no. or roll no."
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
        <SectionStudentsTable
          students={filteredStudents}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
