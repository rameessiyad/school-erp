"use client";

import Link from "next/link";
import { Eye, Pencil, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teachersApi } from "@/lib/api/teachers";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/toast";

interface TeacherRowActionsProps {
  teacherId: string;
  teacherName: string;
  isActive: boolean;
}

export function TeacherRowActions({
  teacherId,
  teacherName,
  isActive,
}: TeacherRowActionsProps) {
  const queryClient = useQueryClient();

  const toggleActiveMutation = useMutation({
    mutationFn: () => teachersApi.update(teacherId, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      if (isActive) {
        notify.warning(`${teacherName} marked as inactive`);
      } else {
        notify.success(`${teacherName} marked as active`);
      }
    },
    onError: () => {
      notify.error("Failed to update teacher status");
    },
  });

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
        entityLabel="teacher"
        entityName={teacherName}
        onDelete={() => teachersApi.remove(teacherId)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["teachers"] });
          notify.success(`${teacherName} deleted successfully`);
        }}
      />
    </div>
  );
}
