"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { staffLeaveApi } from "@/lib/api/staff-leave";
import { PageLoader } from "@/components/common/page-loader";
import { getErrorMessage } from "@/lib/api/error";

export default function ApplyLeavePage() {
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: myLeaves = [], isLoading } = useQuery({
    queryKey: ["staff-leave-mine"],
    queryFn: staffLeaveApi.myLeaves,
  });

  const applyMutation = useMutation({
    mutationFn: staffLeaveApi.apply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-leave-mine"] });
      setFromDate("");
      setToDate("");
      setReason("");
      setError(null);
    },
    onError: (err) =>
      setError(getErrorMessage(err, "Failed to apply for leave")),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || reason.trim().length < 3) {
      setError("Fill both dates and a reason of at least 3 characters");
      return;
    }
    applyMutation.mutate({ fromDate, toDate, reason });
  };

  if (isLoading) return <PageLoader text="Loading your applications..." />;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Leave</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Apply for Leave
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Submit a leave request for admin review.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for leave..."
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-error/20 bg-error-soft px-4 py-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={applyMutation.isPending}
          className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {applyMutation.isPending ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">My Applications</h2>
        </div>

        <div className="divide-y divide-border">
          {myLeaves.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-text-muted">
              No leave applications yet.
            </p>
          )}

          {myLeaves.map((leave) => (
            <div
              key={leave.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {format(new Date(leave.fromDate), "dd MMM yyyy")} –{" "}
                  {format(new Date(leave.toDate), "dd MMM yyyy")}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {leave.reason}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  leave.status === "APPROVED"
                    ? "bg-success-soft text-success"
                    : leave.status === "REJECTED"
                      ? "bg-error-soft text-error"
                      : "bg-surface-secondary text-text-secondary"
                }`}
              >
                {leave.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
