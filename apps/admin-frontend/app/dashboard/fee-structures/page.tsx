import { cookies } from "next/headers";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeeStructure } from "@/lib/validations/fee-structure";
import { DeactivateFeeStructureButton } from "@/components/fee-structures/deactivate-fee-structure-button";

async function getFeeStructures(): Promise<FeeStructure[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fee-structure`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function FeeStructuresPage() {
  const feeStructures = await getFeeStructures();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Fee Structures
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage fee structures for classes and academic years.
          </p>
        </div>

        <Link
          href="/dashboard/fee-structures/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Add Fee Structure
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Academic Year</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Frequency</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {feeStructures.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No fee structures added yet
                  </td>
                </tr>
              ) : (
                feeStructures.map((fs) => (
                  <tr
                    key={fs.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {fs.name}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {fs.class?.name ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {fs.academicYear?.label ?? "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      ₹{Number(fs.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 capitalize text-slate-600">
                      {fs.frequency.replace(/_/g, " ").toLowerCase()}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {new Date(fs.dueDate).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          fs.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {fs.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/fee-structures/${fs.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                        </Link>

                        <Link href={`/dashboard/fee-structures/${fs.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4 text-slate-500" />
                          </Button>
                        </Link>

                        {fs.isActive && (
                          <DeactivateFeeStructureButton
                            feeStructureId={fs.id}
                            feeStructureName={fs.name}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
