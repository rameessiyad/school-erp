"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClassSchema, CreateClassValues } from "@/lib/validations/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classesApi } from "@/lib/api/classes";
import { getErrorMessage } from "@/lib/api/error";

interface ClassFormProps {
  classId?: string;
  defaultValues?: Partial<CreateClassValues>;
}

export function ClassForm({ classId, defaultValues }: ClassFormProps) {
  const isEditMode = !!classId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClassValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues,
  });

  const saveClassMutation = useMutation({
    mutationFn: (values: CreateClassValues) => {
      return isEditMode
        ? classesApi.update(classId!, values)
        : classesApi.create(values);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schoolClasses"] });

      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["schoolClass", classId] });
      }

      router.push("/dashboard/classes");
      router.refresh();
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} class`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateClassValues) => {
    setServerError(null);
    saveClassMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Class Information
        </CardTitle>

        <p className="text-sm text-slate-500">
          Enter the details of the class you want to add.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Class Name
            </Label>

            <Input
              id="name"
              placeholder="e.g. Grade 8"
              {...register("name")}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
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
              disabled={saveClassMutation.isPending}
              className="h-11 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveClassMutation.isPending}
              className="h-11 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveClassMutation.isPending
                ? classId
                  ? "Updating..."
                  : "Creating..."
                : classId
                  ? "Update Class"
                  : "Create Class"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
