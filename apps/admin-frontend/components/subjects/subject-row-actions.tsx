import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { subjectsApi } from "@/lib/api/subjects";

interface SubjectRowActionsProps {
  subjectId: string;
  subjectName: string;
}

export function SubjectRowActions({
  subjectId,
  subjectName,
}: SubjectRowActionsProps) {
  const queryClient = useQueryClient();
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/subjects/${subjectId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
      </Link>
      <DeleteEntityDialog
        entityLabel="subject"
        entityName={subjectName}
        onDelete={() => subjectsApi.remove(subjectId)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["subjects"] })
        }
      />
    </div>
  );
}
