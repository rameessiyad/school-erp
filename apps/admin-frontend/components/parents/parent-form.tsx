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

import { Card, CardContent } from "@/components/ui/card";

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
    defaultValues: {
      isPrimary: false,
      ...defaultValues,
    },
  });

  const saveParentMutation = useMutation({
    mutationFn: (values: CreateParentValues) =>
      isEditMode
        ? parentsApi.update(parentId!, values)
        : parentsApi.create(values),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parents"],
      });

      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["parent", parentId],
        });
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

  const inputClass =
    "h-11 rounded-lg border-border bg-surface-secondary text-text-primary placeholder:text-text-muted transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20";

  const labelClass = "text-sm font-medium text-text-secondary";

  return (
    <div className="w-full">
      <Card className="w-full overflow-hidden rounded-2xl border-border bg-surface shadow-sm">
        {/* ========================================================= */}
        {/* Form Header */}
        {/* ========================================================= */}

        <div className="border-b border-border bg-surface px-6 py-5 lg:px-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">
              {isEditMode ? "Edit Parent" : "Parent Information"}
            </h2>

            <p className="text-sm text-text-secondary">
              {isEditMode
                ? "Update the parent&apos;s information and student relationship."
                : "Add a parent or guardian and link them to a student."}
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ===================================================== */}
            {/* Personal Details */}
            {/* ===================================================== */}

            <section className="px-6 py-7 lg:px-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Personal Details
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Basic information about the parent or guardian.
                </p>
              </div>

              <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={labelClass}>
                    First Name
                  </Label>

                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    {...register("firstName")}
                    className={inputClass}
                  />

                  {errors.firstName && (
                    <p className="text-xs text-error">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={labelClass}>
                    Last Name
                  </Label>

                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    {...register("lastName")}
                    className={inputClass}
                  />

                  {errors.lastName && (
                    <p className="text-xs text-error">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Contact Details */}
            {/* ===================================================== */}

            <section className="border-t border-border px-6 py-7 lg:px-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Contact Details
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Contact information used to communicate with the parent.
                </p>
              </div>

              <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={labelClass}>
                    Email
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    {...register("email")}
                    className={inputClass}
                  />

                  {errors.email && (
                    <p className="text-xs text-error">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className={labelClass}>
                    Phone
                  </Label>

                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    {...register("phone")}
                    className={inputClass}
                  />

                  {errors.phone && (
                    <p className="text-xs text-error">{errors.phone.message}</p>
                  )}
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <Label htmlFor="occupation" className={labelClass}>
                    Occupation
                  </Label>

                  <Input
                    id="occupation"
                    placeholder="e.g. Business Owner"
                    {...register("occupation")}
                    className={inputClass}
                  />

                  {errors.occupation && (
                    <p className="text-xs text-error">
                      {errors.occupation.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className={labelClass}>
                    Address
                  </Label>

                  <Input
                    id="address"
                    placeholder="Enter address"
                    {...register("address")}
                    className={inputClass}
                  />

                  {errors.address && (
                    <p className="text-xs text-error">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Student Relationship */}
            {/* ===================================================== */}

            <section className="border-t border-border px-6 py-7 lg:px-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Student Relationship
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Link the parent to a student and define their relationship.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-secondary/50 p-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Student */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Student</Label>

                    <Controller
                      control={control}
                      name="studentId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface text-text-primary">
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

                          <SelectContent className="border-border bg-surface text-text-primary">
                            {students.map((student) => (
                              <SelectItem
                                key={student.id}
                                value={student.id}
                                className="focus:bg-primary-soft focus:text-text-primary"
                              >
                                {student.firstName} {student.lastName ?? ""} (
                                {student.admissionNo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {errors.studentId && (
                      <p className="text-xs text-error">
                        {errors.studentId.message}
                      </p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Relationship</Label>

                    <Controller
                      control={control}
                      name="relationship"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface text-text-primary">
                            <SelectValue placeholder="Select relationship">
                              {(value: string) =>
                                value || "Select relationship"
                              }
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent className="border-border bg-surface text-text-primary">
                            {relationships.map((relationship) => (
                              <SelectItem
                                key={relationship}
                                value={relationship}
                                className="focus:bg-primary-soft focus:text-text-primary"
                              >
                                {relationship}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {errors.relationship && (
                      <p className="text-xs text-error">
                        {errors.relationship.message}
                      </p>
                    )}
                  </div>

                  {/* Primary Contact */}
                  <div className="flex items-start gap-3 md:col-span-2">
                    <input
                      id="isPrimary"
                      type="checkbox"
                      {...register("isPrimary")}
                      className="mt-0.5 h-4 w-4 rounded border-border bg-surface text-primary accent-primary focus:ring-2 focus:ring-primary/20"
                    />

                    <div>
                      <Label
                        htmlFor="isPrimary"
                        className="cursor-pointer text-sm font-medium text-text-primary"
                      >
                        Primary contact
                      </Label>

                      <p className="mt-0.5 text-xs text-text-muted">
                        Mark this parent as the primary contact for the student.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Error */}
            {/* ===================================================== */}

            {serverError && (
              <div className="mx-6 mb-6 rounded-lg border border-error/20 bg-error-soft px-4 py-3 lg:mx-8">
                <p className="text-sm text-error">{serverError}</p>
              </div>
            )}

            {/* ===================================================== */}
            {/* Actions */}
            {/* ===================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface-secondary/30 px-6 py-4 sm:flex-row sm:justify-end lg:px-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saveParentMutation.isPending}
                className="h-10 rounded-lg border-border bg-surface px-5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saveParentMutation.isPending}
                className="h-10 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}
