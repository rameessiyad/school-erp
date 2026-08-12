import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { studentsApi } from "@/lib/api/students";
import { useQueryClient } from "@tanstack/react-query";

interface StudentRowActionsProps {
  studentId: string;
  studentName: string;
}

export function StudentRowActions({
  studentId,
  studentName,
}: StudentRowActionsProps) {
  const queryClient = useQueryClient();
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/students/${studentId}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <Link href={`/dashboard/students/${studentId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <DeleteEntityDialog
        entityLabel="student"
        entityName={studentName}
        onDelete={() => studentsApi.remove(studentId)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["students"] })
        }
      />
    </div>
  );
}
