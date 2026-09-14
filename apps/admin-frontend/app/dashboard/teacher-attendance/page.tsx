"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { teacherAttendanceApi } from "@/lib/api/teacher-attendance";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { DatePicker } from "@/components/ui/date-picker";
import { AttendanceTeacherTable } from "@/components/tables/attendance-teacher-table";
import { PageLoader } from "@/components/common/page-loader";

export default function TeacherAttendancePage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["teacherAttendance", date],
    queryFn: () => teacherAttendanceApi.getByDate(date),
  });

  if (isLoading || !data) {
    return <PageLoader text="Loading attendance..." />;
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-error">
        Failed to load teacher attendance.
      </div>
    );
  }

  const { teachers } = data;

  const isSearching = debouncedSearch.length > 0;

  const filteredTeachers = isSearching
    ? teachers.filter((t) => {
        const fullName = `${t.firstName} ${t.lastName ?? ""}`.toLowerCase();
        return fullName.includes(debouncedSearch);
      })
    : teachers;

  const presentCount = teachers.filter((t) => t.status === "PRESENT").length;
  const absentCount = teachers.filter((t) => t.status === "ABSENT").length;
  const notMarkedCount = teachers.filter((t) => !t.status).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Teacher Attendance
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}{" "}
          total.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <DatePicker value={date} onChange={setDate} maxDate={new Date()} />
        </div>

        <div className="flex gap-3 text-sm">
          <span className="rounded-full bg-success-soft px-3 py-1 font-medium text-success">
            {presentCount} Present
          </span>
          <span className="rounded-full bg-error-soft px-3 py-1 font-medium text-error">
            {absentCount} Absent
          </span>
          {notMarkedCount > 0 && (
            <span className="rounded-full bg-surface-secondary px-3 py-1 font-medium text-text-muted">
              {notMarkedCount} Not marked
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by teacher name"
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
        <AttendanceTeacherTable
          teachers={filteredTeachers}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
