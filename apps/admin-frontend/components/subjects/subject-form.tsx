"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSubjectSchema,
  CreateSubjectValues,
} from "@/lib/validations/subject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectsApi } from "@/lib/api/subjects";
import { getErrorMessage } from "@/lib/api/error";

interface SubjectFormProps {
  subjectId?: string;
  defaultValues?: Partial<CreateSubjectValues>;
}

export function SubjectForm({ subjectId, defaultValues }: SubjectFormProps) {
  const isEditMode = !!subjectId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSubjectValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues,
  });

  const saveSubjectMutation = useMutation({
    mutationFn: (values: CreateSubjectValues) =>
      isEditMode
        ? subjectsApi.update(subjectId!, values)
        : subjectsApi.create(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });

      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["subject", subjectId] });
      }

      router.push("/dashboard/subjects");
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} subject`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateSubjectValues) => {
    setServerError(null);
    saveSubjectMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-border bg-surface shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold text-text-primary">
          Subject Information
        </CardTitle>

        <p className="text-sm text-text-secondary">
          Enter the details of the subject you want to add.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-text-secondary"
            >
              Subject Name
            </Label>

            <Input
              id="name"
              placeholder="e.g. Mathematics"
              {...register("name")}
              className="h-11 rounded-lg border-border bg-surface-secondary transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="code"
              className="text-sm font-medium text-text-secondary"
            >
              Subject Code
            </Label>

            <Input
              id="code"
              placeholder="e.g. MATH101"
              {...register("code")}
              className="h-11 rounded-lg border-border bg-surface-secondary transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.code && (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            )}
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
              disabled={saveSubjectMutation.isPending}
              className="h-11 rounded-lg border-border px-5 text-text-secondary hover:bg-surface-secondary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveSubjectMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveSubjectMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Subject"
                  : "Create Subject"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
