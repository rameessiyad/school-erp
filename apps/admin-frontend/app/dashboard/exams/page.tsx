"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, X } from "lucide-react";
import { examApi } from "@/lib/api/exam";
import { ExamTable } from "@/components/exams/exam-table";
import { PageLoader } from "@/components/common/page-loader";
import { Button } from "@/components/ui/button";

export default function ExamsPage() {
  const [searchInput, setSearchInput] = useState("");

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: () => examApi.list(),
  });

  const isSearching = searchInput.trim().length > 0;

  const filteredExams = useMemo(() => {
    if (!isSearching) return exams;
    const query = searchInput.trim().toLowerCase();
    return exams.filter(
      (exam) =>
        exam.name.toLowerCase().includes(query) ||
        exam.examType.toLowerCase().includes(query) ||
        (exam.academicYear?.label ?? "").toLowerCase().includes(query),
    );
  }, [exams, searchInput, isSearching]);

  if (isLoading) {
    return <PageLoader text="Loading exams..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Exams
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage exams across academic years.
          </p>
        </div>

        <Link href="/dashboard/exams/new">
          <Button className="h-11 rounded-lg bg-primary px-5 font-medium text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by exam name, type or academic year"
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
        <ExamTable
          exams={filteredExams}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
