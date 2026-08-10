import { FeeStructureForm } from "@/components/fee-structures/fee-structure-form";

export default function NewFeeStructurePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Add Fee Structure
      </h1>

      <FeeStructureForm />
    </div>
  );
}
