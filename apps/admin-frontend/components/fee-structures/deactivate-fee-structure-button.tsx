"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PowerOff } from "lucide-react";
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

interface DeactivateFeeStructureButtonProps {
  feeStructureId: string;
  feeStructureName: string;
}

export function DeactivateFeeStructureButton({
  feeStructureId,
  feeStructureName,
}: DeactivateFeeStructureButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/fee-structures/${feeStructureId}/deactivate`,
        {
          method: "PATCH",
        },
      );

      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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

        <AlertDialogFooter className="border-t border-slate-100 pt-4">
          <AlertDialogCancel
            disabled={loading}
            className="h-10 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDeactivate}
            disabled={loading}
            className="h-10 rounded-lg bg-red-600 px-5 font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deactivating..." : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
