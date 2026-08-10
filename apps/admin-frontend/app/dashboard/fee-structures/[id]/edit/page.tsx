import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FeeStructureForm } from "@/components/fee-structures/fee-structure-form";

async function getFeeStructure(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/fee-structure/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  return res.json();
}

export default async function EditFeeStructurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const fs = await getFeeStructure(id);

  if (!fs) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Edit Fee Structure
      </h1>

      <FeeStructureForm
        feeStructureId={id}
        defaultValues={{
          academicYearId: fs.academicYear?.id,
          classId: fs.class?.id,
          name: fs.name,
          amount: Number(fs.amount),
          frequency: fs.frequency,
          dueDate: fs.dueDate.split("T")[0],
          description: fs.description ?? undefined,
        }}
      />
    </div>
  );
}
