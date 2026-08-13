"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createParentSchema,
  CreateParentValues,
  relationships,
} from "@/lib/validations/parent";
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
import { parentsApi } from "@/lib/api/parents";
import { studentsApi } from "@/lib/api/students";
import { getErrorMessage } from "@/lib/api/error";

interface ParentFormProps {
  parentId?: string;
  defaultValues?: Partial<CreateParentValues>;
}

export function ParentForm({ parentId, defaultValues }: ParentFormProps) {
  const isEditMode = !!parentId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentsApi.list(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateParentValues>({
    resolver: zodResolver(createParentSchema),
    defaultValues: { isPrimary: false, ...defaultValues },
  });

  const saveParentMutation = useMutation({
    mutationFn: (values: CreateParentValues) =>
      isEditMode
        ? parentsApi.update(parentId!, values)
        : parentsApi.create(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });

      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["parent", parentId] });
      }

      router.push("/dashboard/parents");
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} parent`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateParentValues) => {
    setServerError(null);
    saveParentMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Parent Information
        </CardTitle>

        <p className="text-sm text-slate-500">
          Enter the parent&apos;s contact and relationship details.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Personal Details
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Basic information about the parent or guardian.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-slate-700"
                >
                  First Name
                </Label>

                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  {...register("firstName")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />

                {errors.firstName && (
                  <p className="text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-slate-700"
                >
                  Last Name
                </Label>

                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  {...register("lastName")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Contact Details
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Contact information that can be used to communicate with the
                parent.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  {...register("email")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />

                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-700"
                >
                  Phone
                </Label>

                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  {...register("phone")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="occupation"
                  className="text-sm font-medium text-slate-700"
                >
                  Occupation
                </Label>

                <Input
                  id="occupation"
                  placeholder="e.g. Business Owner"
                  {...register("occupation")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-700"
                >
                  Address
                </Label>

                <Input
                  id="address"
                  placeholder="Enter address"
                  {...register("address")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Student Relationship */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Student Relationship
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Link this parent to a student and specify their relationship.
              </p>
            </div>

            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/40 p-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Student
                </Label>

                <Controller
                  control={control}
                  name="studentId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                        <SelectValue placeholder="Select student">
                          {(value: string) => {
                            const student = students.find(
                              (s) => s.id === value,
                            );

                            return student
                              ? `${student.firstName} ${
                                  student.lastName ?? ""
                                } (${student.admissionNo})`
                              : "Select student";
                          }}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.firstName} {s.lastName ?? ""} ({s.admissionNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.studentId && (
                  <p className="text-xs text-red-500">
                    {errors.studentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Relationship
                </Label>

                <Controller
                  control={control}
                  name="relationship"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                        <SelectValue placeholder="Select relationship">
                          {(value: string) => value || "Select relationship"}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {relationships.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.relationship && (
                  <p className="text-xs text-red-500">
                    {errors.relationship.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  id="isPrimary"
                  type="checkbox"
                  {...register("isPrimary")}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <div>
                  <Label
                    htmlFor="isPrimary"
                    className="cursor-pointer text-sm font-medium text-slate-700"
                  >
                    Primary contact
                  </Label>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Mark this parent as the primary contact for the student.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-center text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saveParentMutation.isPending}
              className="h-11 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveParentMutation.isPending}
              className="h-11 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveParentMutation.isPending
                ? parentId
                  ? "Updating..."
                  : "Creating..."
                : parentId
                  ? "Update Parent"
                  : "Create Parent"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
