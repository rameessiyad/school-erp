"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteEntityDialog } from "../shared/delete-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { feeStructureApi } from "@/lib/api/fee-structures";

interface FeeStructureRowActionsProps {
  feeStructureId: string;
  feeStructureName: string;
}

export function FeeStructureRowActions({
  feeStructureId,
  feeStructureName,
}: FeeStructureRowActionsProps) {
  const queryClient = useQueryClient();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/fee-structures/${feeStructureId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-text-secondary" />
        </Button>
      </Link>

      <DeleteEntityDialog
        entityLabel="fee structure"
        entityName={feeStructureName}
        onDelete={() => feeStructureApi.remove(feeStructureId)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["feeStructures"] })
        }
      />
    </div>
  );
}
