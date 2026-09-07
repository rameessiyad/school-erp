"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { examApi } from "@/lib/api/exam";
import { getErrorMessage } from "@/lib/api/error";

interface ExamRowActionsProps {
  examId: string;
  examName: string;
}

export function ExamRowActions({ examId, examName }: ExamRowActionsProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => examApi.remove(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setConfirmOpen(false);
    },
    onError: (err) => {
      setError(getErrorMessage(err, "Failed to delete exam"));
    },
  });

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/dashboard/exams/${examId}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
        aria-label="View exam"
      >
        <Eye className="h-4 w-4 text-slate-500" />
      </Link>

      <Link
        href={`/dashboard/exams/${examId}/edit`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
        aria-label="Edit exam"
      >
        <Pencil className="h-4 w-4 text-slate-500" />
      </Link>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-error-soft hover:text-error"
        aria-label="Delete exam"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{examName}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the exam. Any linked exam results
              will also be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && <p className="text-sm text-error">{error}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setError(null);
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="bg-error text-white hover:bg-error/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
