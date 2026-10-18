"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { announcementApi } from "@/lib/api/announcement";
import { getErrorMessage } from "@/lib/api/error";
import { notify } from "@/lib/toast";

interface AnnouncementRowActionsProps {
  announcementId: string;
  title: string;
}

export function AnnouncementRowActions({
  announcementId,
  title,
}: AnnouncementRowActionsProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => announcementApi.remove(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      notify.success("Announcement deleted");
      setOpen(false);
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, "Failed to delete announcement"));
    },
  });

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link href={`/dashboard/announcements/${announcementId}/edit`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary hover:text-primary"
            aria-label="Edit announcement"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="h-8 w-8 text-text-secondary hover:text-red-600"
          aria-label="Delete announcement"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl border-border bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Delete announcement?
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              &quot;{title}&quot; will be permanently deleted and removed for
              everyone. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteMutation.isPending}
              className="h-10 rounded-lg border-border"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="h-10 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
