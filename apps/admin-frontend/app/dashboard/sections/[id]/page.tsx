"use client";

import { useState } from "react";
import { sectionsApi } from "@/lib/api/sections";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { SectionStudentsTable } from "@/components/tables/section-student-list";
import Link from "next/link";
import { PageLoader } from "@/components/common/page-loader";

export default function SectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sectionDetails", params.id],
    queryFn: () => sectionsApi.getDetails(params.id),
  });

  if (isError) {
    router.push("/dashboard/sections");
    return null;
  }

  if (isLoading || !data) {
    return (
      <PageLoader text="Loading section details" />
    );
  }

  const { section, academicYear, classTeacher, students } = data;
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
        <p className="mb-1 text-sm font-medium text-primary">
          {section.class?.name ?? "Class"}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Section {section.name}
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {academicYear
            ? `Academic Year: ${academicYear.label}`
            : "No academic year configured"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Class Teacher
          </p>

          {classTeacher ? (
            <>
              <Link
                href={`/dashboard/teachers/${classTeacher.id}`}
                className="mt-2 inline-block text-lg font-semibold text-text-primary hover:text-primary hover:underline"
              >
                {classTeacher.firstName} {classTeacher.lastName ?? ""}
              </Link>

              <p className="mt-1 text-xs text-text-muted">
                {classTeacher.email ?? classTeacher.phone ?? "No contact info"}
              </p>

              {classTeacher.subjects?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {classTeacher.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-text-muted">
              No class teacher assigned
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Total Students
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {students.length}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Enrolled in this section for {academicYear?.label ?? "—"}
          </p>
        </div>
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
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">Students</h2>

          <p className="mt-1 text-xs text-text-secondary">
            All students enrolled in this section
          </p>
        </div>

        <SectionStudentsTable
          students={filteredStudents}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
