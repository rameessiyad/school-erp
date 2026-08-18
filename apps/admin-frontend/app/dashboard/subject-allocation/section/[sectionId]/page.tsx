"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sectionsApi } from "@/lib/api/sections";
import { useQuery } from "@tanstack/react-query";
import { SectionAllocationsTable } from "@/components/tables/section-allocation-table";
import { AddAllocationModal } from "@/components/subject-allocation/add-allocation-modal";
import { PageLoader } from "@/components/common/page-loader";

export default function SectionAllocationsPage() {
  const params = useParams<{ sectionId: string }>();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  const {
    data: details,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sectionAllocations", params.sectionId],
    queryFn: () => sectionsApi.getAllocations(params.sectionId),
  });

  if (isError) {
    router.push("/dashboard/subject-allocation");
    return null;
  }

  if (isLoading || !details) {
    return <PageLoader text="Loading allocations..." />;
  }

  const { section, academicYear, allocations } = details;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/subject-allocation"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Subject Allocation
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {section.class?.name} — Section {section.name}
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              {allocations.length}{" "}
              {allocations.length === 1 ? "subject" : "subjects"} allocated this
              year.
            </p>
          </div>

          {academicYear && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
            >
              + Add Allocation
            </button>
          )}
        </div>
      </div>

      {!academicYear ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-text-muted">
            No active academic year found for this school.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <SectionAllocationsTable
            sectionId={section.id}
            allocations={allocations}
          />
        </div>
      )}

      {academicYear && (
        <AddAllocationModal
          open={addOpen}
          onOpenChange={setAddOpen}
          sectionId={section.id}
          academicYearId={academicYear.id}
        />
      )}
    </div>
  );
}
