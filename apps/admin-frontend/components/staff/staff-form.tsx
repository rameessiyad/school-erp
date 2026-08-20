"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaffSchema,
  CreateStaffValues,
  staffDesignations,
} from "@/lib/validations/staff";
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
import { staffApi } from "@/lib/api/staff";
import { getErrorMessage } from "@/lib/api/error";
import { MobileInput } from "../ui/mobile-input";

interface StaffFormProps {
  staffId?: string;
  defaultValues?: Partial<CreateStaffValues>;
  photoUrl?: string | null;
}

export function StaffForm({
  staffId,
  defaultValues,
  photoUrl,
}: StaffFormProps) {
  const isEditMode = !!staffId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    photoUrl ?? null,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateStaffValues>({
    resolver: zodResolver(getStaffSchema(isEditMode)),
    defaultValues,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveStaffMutation = useMutation({
    mutationFn: (values: CreateStaffValues) => {
      const { password, ...rest } = values;
      const payload = isEditMode && !password ? rest : values;

      return isEditMode
        ? staffApi.update(staffId!, payload, photoFile)
        : staffApi.create(values, photoFile);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });

      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["staff", staffId] });
      }

      router.push("/dashboard/staff");
      router.refresh();
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} staff`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateStaffValues) => {
    setServerError(null);
    saveStaffMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-border bg-surface shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold text-text-primary">
          Staff Information
        </CardTitle>

        <p className="text-sm text-text-secondary">
          Enter the details of the staff member you want to add.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-primary">
              Photo
            </Label>

            <div className="flex items-center gap-4">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Staff photo preview"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary-soft text-lg font-semibold text-primary">
                  ?
                </div>
              )}

              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="h-11 max-w-xs rounded-lg border-border bg-surface-secondary/50"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-text-primary"
              >
                First Name
              </Label>

              <Input
                id="firstName"
                placeholder="Enter first name"
                {...register("firstName")}
                className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
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
                className="text-sm font-medium text-text-primary"
              >
                Last Name
              </Label>

              <Input
                id="lastName"
                placeholder="Enter last name"
                {...register("lastName")}
                className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-text-primary"
            >
              Email
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="staff@school.com"
              {...register("email")}
              className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-text-primary"
            >
              Phone
            </Label>

            <MobileInput
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              {...register("phone")}
              className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-text-primary"
            >
              Password
            </Label>

            <Input
              id="password"
              type="password"
              placeholder={
                isEditMode
                  ? "Leave blank to keep current password"
                  : "Create a secure password"
              }
              {...register("password")}
              className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="designation"
              className="text-sm font-medium text-text-primary"
            >
              Designation
            </Label>

            <Controller
              control={control}
              name="designation"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="designation"
                    className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
                  >
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>

                  <SelectContent>
                    {staffDesignations.map((designation) => (
                      <SelectItem
                        key={designation}
                        value={designation}
                        className="capitalize"
                      >
                        {designation.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.designation && (
              <p className="text-xs text-red-500">
                {errors.designation.message}
              </p>
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
              disabled={saveStaffMutation.isPending}
              className="h-11 rounded-lg border-border px-5 text-text-secondary hover:bg-surface-secondary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveStaffMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStaffMutation.isPending
                ? staffId
                  ? "Updating..."
                  : "Creating..."
                : staffId
                  ? "Update Staff"
                  : "Create Staff"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
