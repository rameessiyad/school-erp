import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { parentsApi } from "@/lib/api/parents";

interface ParentRowActionsProps {
  parentId: string;
  parentName: string;
}

export function ParentRowActions({
  parentId,
  parentName,
}: ParentRowActionsProps) {
  const queryClient = useQueryClient();
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/parents/${parentId}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <Link href={`/dashboard/parents/${parentId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <DeleteEntityDialog
        entityLabel="parent"
        entityName={parentName}
        onDelete={() => parentsApi.remove(parentId)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["parents"] })
        }
      />
    </div>
  );
}
