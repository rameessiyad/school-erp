"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { feeApi } from "@/lib/api/fee";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import { PaymentForm } from "@/components/fees/payment-form";
import { PageLoader } from "@/components/common/page-loader";
import { PaymentHistoryTable } from "@/components/tables/payment-history-table";

export default function FeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: fee,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student-fee", params.id],
    queryFn: () => feeApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/fees");
    return null;
  }

  if (isLoading || !fee) {
    return <PageLoader text="Loading fee record..." />;
  }

  const paid = Number(
    (fee.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0).toFixed(2),
  );
  const payable = Number(
    (Number(fee.totalAmount) - Number(fee.discountAmount)).toFixed(2),
  );
  const balance = Number((payable - paid).toFixed(2));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Finance</p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          {fee.student?.firstName} {fee.student?.lastName}
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {fee.feeStructure?.name} — {fee.feeStructure?.class?.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">
            Total Amount
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            ₹{fee.totalAmount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Discount</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            ₹{fee.discountAmount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Paid</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-success">
            ₹{paid}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Balance</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            ₹{balance}
          </p>
          <div className="mt-1">
            <FeeStatusBadge status={fee.status} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">Payment History</h2>
        </div>

        <PaymentHistoryTable payments={fee.payments ?? []} />
      </div>

      {balance > 0 && (
        <div className="max-w-3xl mx-auto">
          <PaymentForm studentFeeId={fee.id} remainingBalance={balance} />
        </div>
      )}
    </div>
  );
}
