"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { feeApi } from "@/lib/api/fee";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import { PaymentForm } from "@/components/fees/payment-form";

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
    return <p className="text-sm text-slate-400">Loading fee record...</p>;
  }

  const paid = fee.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const payable = Number(fee.totalAmount) - Number(fee.discountAmount);
  const balance = payable - paid;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Finance</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {fee.student?.firstName} {fee.student?.lastName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {fee.feeStructure?.name} — {fee.feeStructure?.class?.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Amount</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ₹{fee.totalAmount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Discount</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ₹{fee.discountAmount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Paid</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-green-600">
            ₹{paid}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Balance</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ₹{balance}
          </p>
          <div className="mt-1">
            <FeeStatusBadge status={fee.status} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Receipt
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Method
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">Date</th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Collected By
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(fee.payments ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                fee.payments!.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {p.receiptNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      ₹{p.amount}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.collectedBy?.email ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {balance > 0 && (
        <div className="max-w-3xl">
          <PaymentForm studentFeeId={fee.id} remainingBalance={balance} />
        </div>
      )}
    </div>
  );
}
