"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
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
  const [studentSearch, setStudentSearch] = useState("");

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

  const filteredFees = useMemo(() => {
    if (!studentSearch.trim()) return pickableFees;

    const query = studentSearch.trim().toLowerCase();
    return pickableFees.filter((fee) => {
      const fullName =
        `${fee.student?.firstName ?? ""} ${fee.student?.lastName ?? ""}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [pickableFees, studentSearch]);

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

      reset({
        studentFeeId: studentFeeId ?? "",
        amount: undefined,
        paymentMethod: undefined,
        remarks: "",
      });
      setStudentSearch("");

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
    <Card className="rounded-xl border-border bg-surface shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold text-text-primary">
          Record Payment
        </CardTitle>

        <p className="text-sm text-text-secondary">
          {isFixed
            ? "Log an offline payment against this fee."
            : "Select a student's pending fee and log the payment received."}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isFixed && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-secondary">
                Student Fee
              </Label>

              <Controller
                control={control}
                name="studentFeeId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    onOpenChange={(open) => {
                      if (!open) setStudentSearch("");
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-secondary transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20">
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
                      <div className="sticky top-0 z-10 -mx-1 -mt-1 mb-1 border-b border-border bg-popover p-1.5">
                        <div className="relative">
                          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-text-muted" />

                          <Input
                            placeholder="Search student name..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            className="h-9 rounded-md border-border bg-surface-secondary pl-8 text-sm focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      {filteredFees.length === 0 ? (
                        <p className="px-2 py-4 text-center text-sm text-text-muted">
                          No matching students found.
                        </p>
                      ) : (
                        filteredFees.map((fee) => (
                          <SelectItem key={fee.id} value={fee.id}>
                            {fee.student?.firstName} {fee.student?.lastName} —{" "}
                            {fee.feeStructure?.name} (₹{balanceOf(fee)} due)
                          </SelectItem>
                        ))
                      )}
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
              className="text-sm font-medium text-text-secondary"
            >
              Amount
              {remainingBalance !== undefined && (
                <span className="ml-2 font-normal text-text-muted">
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
              className="h-11 rounded-lg border-border bg-surface-secondary transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-secondary">
              Payment Method
            </Label>

            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-secondary transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20">
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
              className="text-sm font-medium text-text-secondary"
            >
              Remarks (optional)
            </Label>

            <Input
              id="remarks"
              placeholder="e.g. Paid at front office"
              {...register("remarks")}
              className="h-11 rounded-lg border-border bg-surface-secondary transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-center text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={recordPaymentMutation.isPending}
              className="h-11 rounded-lg border-border px-5 text-text-secondary hover:bg-surface-secondary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
