import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teachersApi } from "@/lib/api/teachers";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface TeacherRowActionsProps {
  teacherId: string;
  teacherName: string;
}

export function TeacherRowActions({
  teacherId,
  teacherName,
}: TeacherRowActionsProps) {
  const queryClient = useQueryClient();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/teachers/${teacherId}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <Link href={`/dashboard/teachers/${teacherId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <DeleteEntityDialog
        entityLabel="teacher"
        entityName={teacherName}
        onDelete={() => teachersApi.remove(teacherId)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["teachers"] })
        }
      />
    </div>
  );
}
