"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, UserRound, Calendar, FileText, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import {
  unifiedLeaveApi,
  UnifiedLeaveApplication,
} from "@/lib/api/leave-unified";
import { getErrorMessage } from "@/lib/api/error";

interface LeaveReviewModalProps {
  leave: UnifiedLeaveApplication;
  onClose: () => void;
}

export function LeaveReviewModal({ leave, onClose }: LeaveReviewModalProps) {
  const queryClient = useQueryClient();
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reviewMutation = useMutation({
    mutationFn: (status: "APPROVED" | "REJECTED") =>
      unifiedLeaveApi.review(leave, {
        status,
        reviewNote: reviewNote || undefined,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-leave"] });
      onClose();
    },

    onError: (err) => {
      setError(getErrorMessage(err, "Failed to review leave application"));
    },
  });

  const isPending = leave.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-text-primary">
            Leave Application
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-lg text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="flex items-center gap-3">
            {leave.person.photoUrl ? (
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border">
                <Image
                  src={leave.person.photoUrl}
                  alt={leave.person.firstName}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary">
                <UserRound className="h-5 w-5 text-text-muted" />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-text-primary">
                {leave.person.firstName} {leave.person.lastName}{" "}
                <span className="font-normal text-text-muted">
                  ({leave.source === "TEACHER" ? "Teaching" : "Non-Teaching"})
                </span>
              </p>
              <p className="text-xs text-text-muted">
                Applied {format(new Date(leave.appliedAt), "dd MMM yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-secondary/40 p-4">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">
                {format(new Date(leave.fromDate), "dd MMM yyyy")}
              </span>{" "}
              to{" "}
              <span className="font-medium text-text-primary">
                {format(new Date(leave.toDate), "dd MMM yyyy")}
              </span>
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-secondary/40 p-4">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <p className="text-sm text-text-secondary">{leave.reason}</p>
          </div>

          {!isPending && leave.reviewNote && (
            <div className="rounded-xl border border-border bg-surface-secondary/40 p-4">
              <p className="text-xs font-medium text-text-muted">Review Note</p>
              <p className="mt-1 text-sm text-text-secondary">
                {leave.reviewNote}
              </p>
            </div>
          )}

          {isPending && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Review Note (optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
                placeholder="Add a note..."
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary transition placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-error/20 bg-error-soft px-4 py-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate("REJECTED")}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-error/30 bg-error-soft text-sm font-medium text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reviewMutation.isPending &&
              reviewMutation.variables === "REJECTED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </button>

            <button
              type="button"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate("APPROVED")}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reviewMutation.isPending &&
              reviewMutation.variables === "APPROVED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
