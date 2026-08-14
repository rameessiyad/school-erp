"use client";

import { FeeStructureForm } from "@/components/fee-structures/fee-structure-form";
import { feeStructureApi } from "@/lib/api/fee-structures";
import { CreateFeeStructureValues } from "@/lib/validations/fee-structure";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function EditFeeStructurePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: feeStructure,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["feeStructure", params.id],
    queryFn: () => feeStructureApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/fee-structures");
    return null;
  }

  if (isLoading || !feeStructure) {
    return <p className="text-sm text-slate-400">Loading fee structure...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Edit Fee Structure
        </h1>
      </div>

      <FeeStructureForm
        feeStructureId={params.id}
        defaultValues={{
          name: feeStructure.name,
          classId: feeStructure.class?.id ?? "",
          academicYearId: feeStructure.academicYear?.id ?? "",
          amount: Number(feeStructure.amount),
          frequency:
            feeStructure.frequency as CreateFeeStructureValues["frequency"],
          dueDate: feeStructure.dueDate.slice(0, 10),
          description: feeStructure.description ?? "",
        }}
      />
    </div>
  );
}
