"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFeeStructureSchema,
  CreateFeeStructureValues,
  feeFrequencies,
} from "@/lib/validations/fee-structure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classesApi } from "@/lib/api/classes";
import { academicYearApi } from "@/lib/api/academic-year";
import { feeStructureApi } from "@/lib/api/fee-structures";
import { getErrorMessage } from "@/lib/api/error";

interface FeeStructureFormProps {
  feeStructureId?: string;
  defaultValues?: Partial<CreateFeeStructureValues>;
}

export function FeeStructureForm({
  feeStructureId,
  defaultValues,
}: FeeStructureFormProps) {
  const isEditMode = !!feeStructureId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["schoolClasses"],
    queryFn: classesApi.list,
  });

  const { data: academicYears = [] } = useQuery({
    queryKey: ["academicYears"],
    queryFn: academicYearApi.list,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateFeeStructureValues>({
    resolver: zodResolver(createFeeStructureSchema),
    defaultValues,
  });

  const saveFeeStructureMutation = useMutation({
    mutationFn: (values: CreateFeeStructureValues) => {
      return isEditMode
        ? feeStructureApi.update(feeStructureId!, values)
        : feeStructureApi.create(values);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeStructures"] });

      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["feeStructure", feeStructureId],
        });
      }

      router.push("/dashboard/fee-structures");
      router.refresh();
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} fee structure`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateFeeStructureValues) => {
    setServerError(null);
    saveFeeStructureMutation.mutate(values);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {isEditMode ? "Edit Fee Structure" : "Fee Structure Information"}
        </CardTitle>

        <p className="text-sm text-slate-500">
          {isEditMode
            ? "Update the fee structure details for this class."
            : "Enter the details of the fee structure you want to add."}
        </p>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Fee Name
            </Label>

            <Input
              id="name"
              placeholder="e.g. Tuition Fee - Term 1"
              {...register("name")}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Class
              </Label>

              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select class">
                        {(value: string) =>
                          classes.find((c) => c.id === value)?.name ??
                          "Select class"
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.classId && (
                <p className="text-xs text-red-500">{errors.classId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Academic Year
              </Label>

              <Controller
                control={control}
                name="academicYearId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select academic year">
                        {(value: string) =>
                          academicYears.find((y) => y.id === value)?.label ??
                          "Select academic year"
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {academicYears.map((y) => (
                        <SelectItem key={y.id} value={y.id}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.academicYearId && (
                <p className="text-xs text-red-500">
                  {errors.academicYearId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-slate-700"
              >
                Amount (₹)
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
              <Label
                htmlFor="dueDate"
                className="text-sm font-medium text-slate-700"
              >
                Due Date
              </Label>

              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />

              {errors.dueDate && (
                <p className="text-xs text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Frequency
            </Label>

            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select frequency">
                      {(value: string) =>
                        value ? value.replace(/_/g, " ") : "Select frequency"
                      }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {feeFrequencies.map((f) => (
                      <SelectItem key={f} value={f} className="capitalize">
                        {f.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.frequency && (
              <p className="text-xs text-red-500">{errors.frequency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </Label>

            <Textarea
              id="description"
              placeholder="Add any additional information about this fee..."
              {...register("description")}
              className="min-h-24 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
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
              disabled={saveFeeStructureMutation.isPending}
              className="h-11 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveFeeStructureMutation.isPending}
              className="h-11 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveFeeStructureMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Fee Structure"
                  : "Create Fee Structure"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
