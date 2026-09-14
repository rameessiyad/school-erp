"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { studentAttendanceApi } from "@/lib/api/student-attendance";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { DatePicker } from "@/components/ui/date-picker";
import { AttendanceStudentTable } from "@/components/tables/attendance-student-table";
import { PageLoader } from "@/components/common/page-loader";

export default function SectionAttendancePage() {
  const params = useParams<{ sectionId: string }>();
  const router = useRouter();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sectionAttendance", params.sectionId, date],
    queryFn: () =>
      studentAttendanceApi.getSectionAttendance(params.sectionId, date),
  });

  if (isError) {
    router.push("/dashboard/attendance");
    return null;
  }

  if (isLoading || !data) {
    return <PageLoader text="Loading attendance..." />;
  }

  const { section, students, isMarked } = data;

  const isSearching = debouncedSearch.length > 0;

  const filteredStudents = isSearching
    ? students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName ?? ""}`.toLowerCase();
        return fullName.includes(debouncedSearch);
      })
    : students;

  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/attendance"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Attendance
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          {section.className} — Section {section.name}
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {students.length} {students.length === 1 ? "student" : "students"}{" "}
          enrolled in this section.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <DatePicker value={date} onChange={setDate} maxDate={new Date()} />
        </div>

        {isMarked ? (
          <div className="flex gap-3 text-sm">
            <span className="rounded-full bg-success-soft px-3 py-1 font-medium text-success">
              {presentCount} Present
            </span>
            <span className="rounded-full bg-error-soft px-3 py-1 font-medium text-error">
              {absentCount} Absent
            </span>
          </div>
        ) : (
          <span className="rounded-full bg-surface-secondary px-3 py-1 text-sm font-medium text-text-muted">
            Not marked yet
          </span>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by student name"
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
        <AttendanceStudentTable
          students={filteredStudents}
          isMarked={isMarked}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
