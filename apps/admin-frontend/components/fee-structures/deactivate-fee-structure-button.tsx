"use client";

import { useState } from "react";
import { PowerOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { feeStructureApi } from "@/lib/api/fee-structures";
import { getErrorMessage } from "@/lib/api/error";

interface DeactivateFeeStructureButtonProps {
  feeStructureId: string;
  feeStructureName: string;
}

export function DeactivateFeeStructureButton({
  feeStructureId,
  feeStructureName,
}: DeactivateFeeStructureButtonProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const deactivateMutation = useMutation({
    mutationFn: () => feeStructureApi.deactivate(feeStructureId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeStructures"] });
      queryClient.invalidateQueries({
        queryKey: ["feeStructure", feeStructureId],
      });

      setOpen(false);
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(error, "Failed to deactivate fee structure"),
      );
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setServerError(null);
      }}
    >
      <AlertDialogTrigger>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <PowerOff className="mr-2 h-4 w-4" />
          Deactivate
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-xl border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-slate-900">
            Deactivate Fee Structure?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-slate-500">
            Are you sure you want to deactivate{" "}
            <span className="font-medium text-slate-700">
              {feeStructureName}
            </span>
            ?
            <br />
            <span className="mt-2 block">
              This will hide the fee structure from active use. Existing student
              fee records and payment history will be preserved.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {serverError && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-center text-sm text-red-600">{serverError}</p>
          </div>
        )}

        <AlertDialogFooter className="border-t border-slate-100 pt-4">
          <AlertDialogCancel
            disabled={deactivateMutation.isPending}
            className="h-10 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              setServerError(null);
              deactivateMutation.mutate();
            }}
            disabled={deactivateMutation.isPending}
            className="h-10 rounded-lg bg-red-600 px-5 font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
