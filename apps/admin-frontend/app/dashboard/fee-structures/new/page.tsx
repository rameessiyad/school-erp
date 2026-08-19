import { FeeStructureForm } from "@/components/fee-structures/fee-structure-form";

export default async function NewFeeStructurePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;

  return (
    <div className="w-auto">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">
        Add Fee Structure
      </h1>

      <FeeStructureForm
        defaultValues={classId ? { classId } : undefined}
        lockClass={!!classId}
      />
    </div>
  );
}
