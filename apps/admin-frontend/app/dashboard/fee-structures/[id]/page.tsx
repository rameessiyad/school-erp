"use client";

import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeactivateFeeStructureButton } from "@/components/fee-structures/deactivate-fee-structure-button";
import { feeStructureApi } from "@/lib/api/fee-structures";
import { PageLoader } from "@/components/common/page-loader";

export default function FeeStructureDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: fs,
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

  if (isLoading || !fs) {
    return <PageLoader text="Loading fee structure..." />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/fee-structures"
            className="mb-3 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fee Structures
          </Link>

          <h1 className="text-2xl font-semibold text-text-primary">
            {fs.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/fee-structures/${params.id}/edit`}>
            <Button
              variant="outline"
              className="border-border text-text-secondary hover:bg-surface-secondary"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>

          {fs.isActive && (
            <DeactivateFeeStructureButton
              feeStructureId={fs.id}
              feeStructureName={fs.name}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="font-medium text-text-primary">
              Fee Structure Details
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Information about this fee structure.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              fs.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-surface-secondary text-text-muted"
            }`}
          >
            {fs.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">
          <div>
            <p className="text-xs font-medium text-text-muted">Class</p>
            <p className="mt-1 text-sm text-text-primary">
              {fs.class?.name ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted">Academic Year</p>
            <p className="mt-1 text-sm text-text-primary">
              {fs.academicYear?.label ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted">Amount</p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              ₹{Number(fs.amount).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted">Frequency</p>
            <p className="mt-1 text-sm capitalize text-text-primary">
              {fs.frequency.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted">Due Date</p>
            <p className="mt-1 text-sm text-text-primary">
              {new Date(fs.dueDate).toLocaleDateString("en-IN")}
            </p>
          </div>

          {fs.description && (
            <div className="col-span-2 border-t border-border pt-6">
              <p className="text-xs font-medium text-text-muted">Description</p>
              <p className="mt-1 text-sm leading-6 text-text-primary">
                {fs.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
