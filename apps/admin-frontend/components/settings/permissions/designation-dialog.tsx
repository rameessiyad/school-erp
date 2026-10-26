"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionMatrix } from "@/components/settings/permissions/permission-matrix";
import {
  ModuleGroup,
  StaffDesignation,
  staffDesignationApi,
} from "@/lib/api/staff-designation";
import { getErrorMessage } from "@/lib/api/error";
import { notify } from "@/lib/toast";

interface DesignationDialogProps {
  designation: StaffDesignation | null; // null = create
  groups: ModuleGroup[];
  onClose: () => void;
}

// Mount this only while open, so its state starts fresh each time.
export function DesignationDialog({
  designation,
  groups,
  onClose,
}: DesignationDialogProps) {
  const isEdit = !!designation;
  const queryClient = useQueryClient();

  const [name, setName] = useState(designation?.name ?? "");
  const [modules, setModules] = useState<string[]>(
    designation?.allowedModules ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const staffCount = designation?._count?.staff ?? 0;

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { name: name.trim(), allowedModules: modules };
      return isEdit
        ? staffDesignationApi.update(designation!.id, payload)
        : staffDesignationApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffDesignations"] });
      notify.success(isEdit ? "Designation updated" : "Designation created");
      onClose();
    },
    onError: (e) => {
      const message = getErrorMessage(
        e,
        `Failed to ${isEdit ? "update" : "create"} designation`,
      );
      setError(message);
      notify.error(message);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setError("Enter a name for the designation");
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-xl border-border bg-surface sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            {isEdit ? "Edit designation" : "New designation"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            {isEdit && staffCount > 0
              ? `Changes apply to the ${staffCount} staff member${staffCount === 1 ? "" : "s"} with this designation.`
              : "Choose which modules staff with this designation can access."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-primary">
              Name
            </Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Accountant, Librarian"
              className="h-11 rounded-lg border-border bg-surface-secondary/50"
            />
          </div>

          <PermissionMatrix
            groups={groups}
            value={modules}
            onChange={setModules}
          />

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="h-10 rounded-lg border-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending}
            className="h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Create designation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
