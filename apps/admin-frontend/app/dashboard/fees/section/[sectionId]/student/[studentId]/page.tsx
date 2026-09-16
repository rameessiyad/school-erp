"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { feeApi } from "@/lib/api/fee";
import { FeeRowActions } from "@/components/fees/fee-row-actions";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import { PageLoader } from "@/components/common/page-loader";

export default function StudentFeesPage() {
  const params = useParams<{ sectionId: string; studentId: string }>();
  const router = useRouter();

  const {
    data: studentFees = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student-fees-by-student", params.studentId],
    queryFn: () => feeApi.listByStudent(params.studentId),
  });

  if (isError) {
    router.push(`/dashboard/fees/section/${params.sectionId}`);
    return null;
  }

  if (isLoading) {
    return <PageLoader text="Loading student fees..." />;
  }

  const balanceOf = (fee: (typeof studentFees)[number]) => {
    const paid = fee.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
    return Number(fee.totalAmount) - Number(fee.discountAmount) - paid;
  };

  const student = studentFees[0]?.student;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/fees/section/${params.sectionId}`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Section
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          {student?.firstName} {student?.lastName}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Admission No: {student?.admissionNumber}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">Fees</h2>
          <span className="text-sm text-text-muted">
            {studentFees.length}{" "}
            {studentFees.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-secondary/40 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Fee
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Total
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Balance
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Status
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {studentFees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    No fee records for this student.
                  </td>
                </tr>
              ) : (
                studentFees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="transition hover:bg-surface-secondary/50"
                  >
                    <td className="px-6 py-4 text-text-secondary">
                      {fee.feeStructure?.name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      ₹{fee.totalAmount}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      ₹{balanceOf(fee)}
                    </td>
                    <td className="px-6 py-4">
                      <FeeStatusBadge status={fee.status} />
                    </td>
                    <td className="px-6 py-4">
                      <FeeRowActions studentFeeId={fee.id} />
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
