import Link from "next/link";
import { Eye, Pencil, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff";
import { notify } from "@/lib/toast";

interface StaffRowActionsProps {
  staffId: string;
  staffName: string;
  isActive: boolean;
}

export function StaffRowActions({
  staffId,
  staffName,
  isActive,
}: StaffRowActionsProps) {
  const queryClient = useQueryClient();

  const toggleActiveMutation = useMutation({
    mutationFn: () => staffApi.update(staffId, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      if (isActive) {
        notify.warning(`${staffName} marked as inactive`);
      } else {
        notify.success(`${staffName} marked as active`);
      }
    },
    onError: () => {
      notify.error("Failed to update staff status");
    },
  });
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/staff/${staffId}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <Link href={`/dashboard/staff/${staffId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title={isActive ? "Mark as inactive" : "Mark as active"}
        disabled={toggleActiveMutation.isPending}
        onClick={() => toggleActiveMutation.mutate()}
      >
        {isActive ? (
          <UserX className="h-4 w-4 text-warning" />
        ) : (
          <UserCheck className="h-4 w-4 text-success" />
        )}
      </Button>

      <DeleteEntityDialog
        entityLabel="staff"
        entityName={staffName}
        onDelete={() => staffApi.remove(staffId)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["staff"] })}
      />
    </div>
  );
}
