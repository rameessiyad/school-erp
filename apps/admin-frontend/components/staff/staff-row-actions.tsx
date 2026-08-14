import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff";

interface StaffRowActionsProps {
  staffId: string;
  staffName: string;
}

export function StaffRowActions({ staffId, staffName }: StaffRowActionsProps) {
  const queryClient = useQueryClient();
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
      <DeleteEntityDialog
        entityLabel="staff"
        entityName={staffName}
        onDelete={() => staffApi.remove(staffId)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["staff"] })}
      />
    </div>
  );
}
