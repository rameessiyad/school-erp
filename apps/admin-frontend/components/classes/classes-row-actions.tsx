import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { classesApi } from "@/lib/api/classes";

interface ClassesRowProps {
  classId: string;
  className: string;
}

export function ClassesRow({ classId, className }: ClassesRowProps) {
  const queryClient = useQueryClient();
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/classes/${classId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <DeleteEntityDialog
        entityLabel="class"
        entityName={className}
        onDelete={() => classesApi.remove(classId)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["schoolClasses"] })
        }
      />
    </div>
  );
}
