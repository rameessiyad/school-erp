"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { feeStructureApi } from "@/lib/api/fee-structures";
import { classesApi } from "@/lib/api/classes";
import { PageLoader } from "@/components/common/page-loader";
import { FeeStructureRowActions } from "@/components/fee-structures/fee-structure-row-actions";

export default function ClassFeeStructuresPage() {
  const { classId } = useParams<{ classId: string }>();

  const { data: feeStructures = [], isLoading: loadingFees } = useQuery({
    queryKey: ["feeStructures"],
    queryFn: feeStructureApi.list,
  });

  const { data: schoolClass, isLoading: loadingClass } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => classesApi.get(classId),
  });

  if (loadingFees || loadingClass) {
    return <PageLoader text="Loading fee structures..." />;
  }

  const classFeeStructures = feeStructures.filter(
    (fs) => fs.class?.id === classId,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/fee-structures"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to classes
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">
              {schoolClass?.name ?? "Class"}
            </p>

            <h1 className="text-2xl font-semibold text-text-primary">
              Fee Structures
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Manage fee structures for {schoolClass?.name ?? "this class"}.
            </p>
          </div>

          <Link
            href={`/dashboard/fee-structures/new?classId=${classId}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
          >
            Add Fee Structure
          </Link>
        </div>
      </div>

      {classFeeStructures.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Receipt className="h-6 w-6" />
          </div>

          <p className="font-medium text-text-primary">
            No fee structures added yet
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            Add the first fee structure for {schoolClass?.name ?? "this class"}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classFeeStructures.map((fs) => (
            <Link
              key={fs.id}
              href={`/dashboard/fee-structures/${fs.id}`}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Receipt className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-text-primary">
                        {fs.name}
                      </p>

                      <p className="text-xs text-text-secondary">
                        {fs.academicYear?.label ?? "—"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      fs.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-surface-secondary text-text-muted"
                    }`}
                  >
                    {fs.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Amount</span>
                    <span className="font-medium text-text-primary">
                      ₹{Number(fs.amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Frequency</span>
                    <span className="capitalize text-text-primary">
                      {fs.frequency.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Due Date</span>
                    <span className="text-text-primary">
                      {new Date(fs.dueDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="mt-4 flex justify-end border-t border-border pt-3"
                onClick={(e) => e.preventDefault()}
              >
                <FeeStructureRowActions
                  feeStructureId={fs.id}
                  feeStructureName={fs.name}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
