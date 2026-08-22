"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeaveStatus } from "@/lib/api/teacher-leave";
import {
  unifiedLeaveApi,
  UnifiedLeaveApplication,
  LeaveSource,
} from "@/lib/api/leave-unified";
import { PageLoader } from "@/components/common/page-loader";
import { LeaveApplicationTable } from "@/components/tables/leave-application-table";
import { LeaveReviewModal } from "@/components/modals/leave-review-modal";

const statusFilters: { label: string; value: LeaveStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const categoryFilters: { label: string; value: LeaveSource | "ALL" }[] = [
  { label: "All Staff", value: "ALL" },
  { label: "Teaching Staff", value: "TEACHER" },
  { label: "Non-Teaching Staff", value: "STAFF" },
];

export default function LeaveApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | undefined>(
    undefined,
  );
  const [category, setCategory] = useState<LeaveSource | "ALL">("ALL");
  const [selectedLeave, setSelectedLeave] =
    useState<UnifiedLeaveApplication | null>(null);

  const { data: allLeaves = [], isLoading } = useQuery({
    queryKey: ["unified-leave", statusFilter],
    queryFn: () => unifiedLeaveApi.listAll(statusFilter),
  });

  const leaves =
    category === "ALL"
      ? allLeaves
      : allLeaves.filter((l) => l.source === category);

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;

  if (isLoading) {
    return <PageLoader text="Loading leave applications..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Staff</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Leave Applications
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Review and act on leave applications from teaching and non-teaching
          staff.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Total Applications
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {leaves.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Pending Review
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2">
        {categoryFilters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setCategory(f.value)}
            className={`h-9 rounded-lg px-3.5 cursor-pointer text-sm font-medium transition ${
              category === f.value
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`h-8 rounded-lg px-3 text-xs font-medium transition ${
              statusFilter === f.value
                ? "bg-surface-secondary text-text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-semibold text-text-primary">
              {categoryFilters.find((c) => c.value === category)?.label}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Click a row&apos;s View button to see details and take action.
            </p>
          </div>
          <span className="text-sm text-text-muted">
            {leaves.length}{" "}
            {leaves.length === 1 ? "application" : "applications"}
          </span>
        </div>

        <LeaveApplicationTable leaves={leaves} onView={setSelectedLeave} />
      </div>

      {selectedLeave && (
        <LeaveReviewModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
        />
      )}
    </div>
  );
}
