import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeeStructure } from "@/lib/validations/fee-structure";

async function getFeeStructure(id: string): Promise<FeeStructure | null> {
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

export default async function FeeStructureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fs = await getFeeStructure(id);

  if (!fs) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/fee-structures"
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fee Structures
          </Link>

          <h1 className="text-2xl font-semibold text-slate-900">{fs.name}</h1>
        </div>

        <Link href={`/dashboard/fee-structures/${id}/edit`}>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Details Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-medium text-slate-900">
              Fee Structure Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Information about this fee structure.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              fs.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {fs.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">
          <div>
            <p className="text-xs font-medium text-slate-400">Class</p>
            <p className="mt-1 text-sm text-slate-800">
              {fs.class?.name ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Academic Year</p>
            <p className="mt-1 text-sm text-slate-800">
              {fs.academicYear?.label ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Amount</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              ₹{Number(fs.amount).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Frequency</p>
            <p className="mt-1 text-sm capitalize text-slate-800">
              {fs.frequency.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Due Date</p>
            <p className="mt-1 text-sm text-slate-800">
              {new Date(fs.dueDate).toLocaleDateString("en-IN")}
            </p>
          </div>

          {fs.description && (
            <div className="col-span-2 border-t border-slate-100 pt-6">
              <p className="text-xs font-medium text-slate-400">Description</p>
              <p className="mt-1 text-sm leading-6 text-slate-800">
                {fs.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
