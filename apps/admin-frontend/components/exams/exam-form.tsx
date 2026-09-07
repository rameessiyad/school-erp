"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";

import {
  createExamSchema,
  CreateExamValues,
  examTypes,
  examStatuses,
} from "@/lib/validations/exam";
import { examApi } from "@/lib/api/exam";
import { optionsApi } from "@/lib/api/options";
import { getErrorMessage } from "@/lib/api/error";

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
import { DatePicker } from "@/components/ui/date-picker";

interface Option {
  id: string;
  label?: string;
  name?: string;
}

interface ExamFormProps {
  examId?: string;
  defaultValues?: Partial<CreateExamValues>;
}

const inputClassName =
  "h-11 w-full min-w-0 rounded-lg border-border bg-surface px-3 text-sm text-text-primary shadow-none transition placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export function ExamForm({ examId, defaultValues }: ExamFormProps) {
  const isEditMode = !!examId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState<string | null>(null);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);

  useEffect(() => {
    async function loadOptions() {
      const yearsData = await optionsApi.academicYears();
      setAcademicYears(yearsData);
    }
    loadOptions();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateExamValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: defaultValues ?? { status: "DRAFT" },
  });

  const saveExamMutation = useMutation({
    mutationFn: (values: CreateExamValues) =>
      isEditMode ? examApi.update(examId!, values) : examApi.create(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      }
      router.push("/dashboard/exams");
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} exam`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateExamValues) => {
    setServerError(null);
    saveExamMutation.mutate(values);
  };

  return (
    <Card className="w-full overflow-hidden rounded-2xl border-border bg-surface shadow-sm">
      <CardHeader className="border-b border-border bg-surface px-6 py-5 lg:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <CalendarClock className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold text-text-primary">
              {isEditMode ? "Edit Exam" : "Create Exam"}
            </CardTitle>
            <p className="mt-0.5 text-sm text-text-secondary">
              {isEditMode
                ? "Update this exam's details."
                : "Set up a new exam for an academic year."}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 lg:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            {/* Exam Name */}
            <div className="min-w-0 space-y-2 sm:col-span-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-text-secondary"
              >
                Exam Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Onam Exam, Christmas Exam"
                {...register("name")}
                className={inputClassName}
              />
              {errors.name && (
                <p className="text-xs text-error">{errors.name.message}</p>
              )}
            </div>

            {/* Exam Type */}
            <div className="min-w-0 space-y-2">
              <Label className="text-sm font-medium text-text-secondary">
                Exam Type
              </Label>
              <Controller
                control={control}
                name="examType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select exam type">
                        {(value: string) =>
                          value
                            ? value.charAt(0) + value.slice(1).toLowerCase()
                            : "Select exam type"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.examType && (
                <p className="text-xs text-error">{errors.examType.message}</p>
              )}
            </div>

            {/* Academic Year */}
            <div className="min-w-0 space-y-2">
              <Label className="text-sm font-medium text-text-secondary">
                Academic Year
              </Label>
              <Controller
                control={control}
                name="academicYearId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select academic year">
                        {(value: string) =>
                          academicYears.find((y) => y.id === value)?.label ??
                          "Select academic year"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.academicYearId && (
                <p className="text-xs text-error">
                  {errors.academicYearId.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div className="min-w-0 space-y-2">
              <Label className="text-sm font-medium text-text-secondary">
                Start Date
              </Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                    minDate={new Date(2026, 0, 1)}
                    maxDate={new Date(new Date().getFullYear() + 3, 11, 31)}
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-xs text-error">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="min-w-0 space-y-2">
              <Label className="text-sm font-medium text-text-secondary">
                End Date
              </Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                    minDate={new Date(2026, 0, 1)}
                    maxDate={new Date(new Date().getFullYear() + 3, 11, 31)}
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-xs text-error">{errors.endDate.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="min-w-0 space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-text-secondary">
                Status
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select status">
                        {(value: string) =>
                          value
                            ? value.charAt(0) + value.slice(1).toLowerCase()
                            : "Select status"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {examStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {serverError && (
            <div className="rounded-xl border border-error/20 bg-error-soft px-4 py-3.5">
              <p className="text-center text-sm text-error">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saveExamMutation.isPending}
              className="h-11 rounded-lg border-border bg-surface px-5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveExamMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveExamMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Exam"
                  : "Create Exam"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
