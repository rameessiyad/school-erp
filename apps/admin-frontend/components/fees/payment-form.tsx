"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentSchema,
  CreatePaymentValues,
  paymentMethods,
} from "@/lib/validations/fee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feeApi } from "@/lib/api/fee";
import { getErrorMessage } from "@/lib/api/error";

interface PaymentFormProps {
  studentFeeId?: string;
  remainingBalance?: number;
  onSuccess?: () => void;
}

export function PaymentForm({
  studentFeeId,
  remainingBalance,
  onSuccess,
}: PaymentFormProps) {
  const isFixed = !!studentFeeId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: allFees = [] } = useQuery({
    queryKey: ["student-fees", "outstanding"],
    queryFn: () => feeApi.list(),
    enabled: !isFixed,
  });

  const pickableFees = useMemo(
    () =>
      allFees.filter(
        (f) => f.status === "PENDING" || f.status === "PARTIALLY_PAID",
      ),
    [allFees],
  );

  const balanceOf = (fee: (typeof pickableFees)[number]) => {
    const paid = fee.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
    return Number(fee.totalAmount) - Number(fee.discountAmount) - paid;
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreatePaymentValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: { studentFeeId: studentFeeId ?? "" },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (values: CreatePaymentValues) => feeApi.recordPayment(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-fees"] });
      if (studentFeeId) {
        queryClient.invalidateQueries({
          queryKey: ["student-fee", studentFeeId],
        });
      }

      reset({ studentFeeId: studentFeeId ?? "" });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(
          studentFeeId ? `/dashboard/fees/${studentFeeId}` : "/dashboard/fees",
        );
      }
    },

    onError: (error) => {
      setServerError(getErrorMessage(error, "Failed to record payment"));
    },
  });

  const onSubmit = (values: CreatePaymentValues) => {
    setServerError(null);
    recordPaymentMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Record Payment
        </CardTitle>

        <p className="text-sm text-slate-500">
          {isFixed
            ? "Log an offline payment against this fee."
            : "Select a student's pending fee and log the payment received."}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isFixed && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Student Fee
              </Label>

              <Controller
                control={control}
                name="studentFeeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50">
                      <SelectValue>
                        {(value) => {
                          const fee = pickableFees.find((f) => f.id === value);
                          return fee
                            ? `${fee.student?.firstName} ${fee.student?.lastName} — ${fee.feeStructure?.name} (₹${balanceOf(fee)} due)`
                            : "Select a student fee";
                        }}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {pickableFees.map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.student?.firstName} {fee.student?.lastName} —{" "}
                          {fee.feeStructure?.name} (₹{balanceOf(fee)} due)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.studentFeeId && (
                <p className="text-xs text-red-500">
                  {errors.studentFeeId.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-slate-700"
            >
              Amount
              {remainingBalance !== undefined && (
                <span className="ml-2 font-normal text-slate-400">
                  (₹{remainingBalance} remaining)
                </span>
              )}
            </Label>

            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g. 5000"
              {...register("amount")}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />

            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Payment Method
            </Label>

            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50">
                    <SelectValue>
                      {(value) =>
                        value
                          ? value.replace("_", " ")
                          : "Select a payment method"
                      }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.paymentMethod && (
              <p className="text-xs text-red-500">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="remarks"
              className="text-sm font-medium text-slate-700"
            >
              Remarks (optional)
            </Label>

            <Input
              id="remarks"
              placeholder="e.g. Paid at front office"
              {...register("remarks")}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-center text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={recordPaymentMutation.isPending}
              className="h-11 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="h-11 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {recordPaymentMutation.isPending
                ? "Recording..."
                : "Record Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
