"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLoader } from "@/components/common/page-loader";
import { DesignationDialog } from "@/components/settings/permissions/designation-dialog";
import {
  StaffDesignation,
  staffDesignationApi,
} from "@/lib/api/staff-designation";
import { getErrorMessage } from "@/lib/api/error";
import { notify } from "@/lib/toast";

export function StaffPermissionsPanel() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<{
    designation: StaffDesignation | null;
  } | null>(null);
  const [deleting, setDeleting] = useState<StaffDesignation | null>(null);

  const { data: designations = [], isLoading } = useQuery({
    queryKey: ["staffDesignations"],
    queryFn: staffDesignationApi.list,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["moduleGroups"],
    queryFn: staffDesignationApi.getModuleGroups,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffDesignationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffDesignations"] });
      notify.success("Designation deleted");
      setDeleting(null);
    },
    onError: (e) => {
      notify.error(getErrorMessage(e, "Failed to delete designation"));
      setDeleting(null);
    },
  });

  if (isLoading || groupsLoading) {
    return <PageLoader text="Loading designations..." />;
  }

  const totalModules = groups.reduce((n, g) => n + g.modules.length, 0);

  const accessGroups = (d: StaffDesignation) =>
    groups
      .filter((g) => g.modules.some((m) => d.allowedModules.includes(m.value)))
      .map((g) => g.label);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-text-secondary">
          Designations decide which modules your staff can open. Only school
          admins can manage them.
        </p>

        <Button
          onClick={() => setDialog({ designation: null })}
          className="h-10 rounded-lg bg-primary px-4 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New designation
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Designation</TableHead>
              <TableHead>Module access</TableHead>
              <TableHead>Staff assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {designations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-12 text-center text-text-muted"
                >
                  No designations yet. Create one to start giving staff access.
                </TableCell>
              </TableRow>
            ) : (
              designations.map((d) => {
                const staffCount = d._count?.staff ?? 0;
                const areas = accessGroups(d);

                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium capitalize text-text-primary">
                      {d.name.replace(/_/g, " ")}
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-text-primary">
                        {d.allowedModules.length} of {totalModules} modules
                      </p>
                      {areas.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {areas.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              className="rounded-md bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary"
                            >
                              {a}
                            </span>
                          ))}
                          {areas.length > 3 && (
                            <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-xs text-text-muted">
                              +{areas.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-text-secondary">
                      {staffCount}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDialog({ designation: d })}
                          className="h-8 w-8 text-text-secondary hover:text-primary"
                          aria-label={`Edit ${d.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={staffCount > 0}
                          title={
                            staffCount > 0
                              ? "Reassign its staff before deleting"
                              : "Delete designation"
                          }
                          onClick={() => setDeleting(d)}
                          className="h-8 w-8 text-text-secondary hover:text-red-600 disabled:opacity-40"
                          aria-label={`Delete ${d.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {dialog && (
        <DesignationDialog
          designation={dialog.designation}
          groups={groups}
          onClose={() => setDialog(null)}
        />
      )}

      <Dialog
        open={!!deleting}
        onOpenChange={(o) =>
          !o && !deleteMutation.isPending && setDeleting(null)
        }
      >
        <DialogContent className="rounded-xl border-border bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Delete designation?
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              &quot;{deleting?.name}&quot; will be permanently deleted. No staff
              currently use it.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={deleteMutation.isPending}
              className="h-10 rounded-lg border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              disabled={deleteMutation.isPending}
              className="h-10 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
