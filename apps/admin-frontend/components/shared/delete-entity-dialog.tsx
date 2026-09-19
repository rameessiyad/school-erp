"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { getErrorMessage } from "@/lib/api/error";
import { notify } from "@/lib/toast";

interface DeleteEntityDialogProps {
  entityLabel: string;
  entityName: string;
  onDelete: () => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  description?: string;
}

export function DeleteEntityDialog({
  entityLabel,
  entityName,
  onDelete,
  onSuccess,
  onError,
  description,
}: DeleteEntityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setServerError(null);
    try {
      await onDelete();
      setOpen(false);
      notify.success(`${entityName} deleted successfully`);
      onSuccess?.();
    } catch (error) {
      const message = getErrorMessage(error, `Failed to delete ${entityLabel}`);
      setServerError(message);
      notify.error(message);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {entityName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              `This will permanently remove this ${entityLabel} and all associated records. This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
