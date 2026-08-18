"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { teachersApi } from "@/lib/api/teachers";
import { SectionAllocation } from "@/lib/validations/section";

interface SectionAllocationsTableProps {
  sectionId: string;
  allocations: SectionAllocation[];
}

export function SectionAllocationsTable({
  sectionId,
  allocations,
}: SectionAllocationsTableProps) {
  const queryClient = useQueryClient();

  const { mutate: removeAllocation } = useMutation({
    mutationFn: ({
      teacherId,
      allocationId,
    }: {
      teacherId: string;
      allocationId: string;
    }) => teachersApi.removeAllocation(teacherId, allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sectionAllocations", sectionId],
      });
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {allocations.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="py-12 text-center text-text-muted"
            >
              No subjects allocated to this section yet.
            </TableCell>
          </TableRow>
        ) : (
          allocations.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {a.subject.name} ({a.subject.code})
                </span>
              </TableCell>

              <TableCell className="font-medium text-text-primary">
                {a.teacher.firstName} {a.teacher.lastName ?? ""}
              </TableCell>

              <TableCell className="text-right">
                <button
                  type="button"
                  onClick={() =>
                    removeAllocation({
                      teacherId: a.teacherId,
                      allocationId: a.id,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-error hover:bg-error-soft"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
