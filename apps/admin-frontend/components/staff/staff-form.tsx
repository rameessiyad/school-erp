"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { getStaffSchema, CreateStaffValues } from "@/lib/validations/staff";
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
import { staffDesignationApi } from "@/lib/api/staff-designation";
import { getErrorMessage } from "@/lib/api/error";
import { MobileInput } from "../ui/mobile-input";
import { notify } from "@/lib/toast";

interface StaffFormProps {
  staffId?: string;
  defaultValues?: Partial<CreateStaffValues>;
  photoUrl?: string | null;
}

// Keep this list in sync with your Module enum on the backend
const ALL_MODULES = [
  "STUDENT_FEES",
  "FEE_REPORTS",
  "PAYMENT_HISTORY",
  "STUDENT_ADMISSIONS",
  "STUDENT_REGISTRATION",
  "PARENT_DETAILS",
  "TEACHER_MANAGEMENT",
  "EXAM_SETTINGS",
  "ACADEMIC_YEAR",
  "USER_MANAGEMENT",
  "ATTENDANCE",
  "PAYROLL",
  "STUDENT_ATTENDANCE",
] as const;

function formatModuleLabel(mod: string) {
  return mod
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
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

  const [isAddingDesignation, setIsAddingDesignation] = useState(false);
  const [newDesignationName, setNewDesignationName] = useState("");
  const [newDesignationModules, setNewDesignationModules] = useState<string[]>(
    [],
  );
  const [newDesignationError, setNewDesignationError] = useState<string | null>(
    null,
  );

  const { data: designations = [] } = useQuery({
    queryKey: ["staffDesignations"],
    queryFn: staffDesignationApi.list,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateStaffValues>({
    resolver: zodResolver(getStaffSchema(isEditMode)),
    defaultValues: {
      ...defaultValues,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const createDesignationMutation = useMutation({
    mutationFn: staffDesignationApi.create,
    onSuccess: (newDesignation) => {
      queryClient.invalidateQueries({ queryKey: ["staffDesignations"] });
      setValue("designationId", newDesignation.id, { shouldValidate: true });
      setIsAddingDesignation(false);
      setNewDesignationName("");
      setNewDesignationModules([]);
      setNewDesignationError(null);
      notify.success("Designation added successfully");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to add designation");
      setNewDesignationError(message);
      notify.error(message);
    },
  });

  const handleAddDesignation = () => {
    const trimmed = newDesignationName.trim();
    if (!trimmed) {
      setNewDesignationError("Enter a name for the designation");
      return;
    }
    createDesignationMutation.mutate({
      name: trimmed,
      allowedModules: newDesignationModules,
    });
  };

  const toggleModule = (mod: string) => {
    setNewDesignationModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

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

      notify.success(
        isEditMode
          ? "Staff updated successfully"
          : "Staff created successfully",
      );
      router.push("/dashboard/staff");
      router.refresh();
    },

    onError: (error) => {
      const message = getErrorMessage(
        error,
        `Failed to ${isEditMode ? "update" : "create"} staff`,
      );
      setServerError(message);
      notify.error(message);
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
            <Label className="text-sm font-medium text-text-primary">
              Designation
            </Label>

            {isAddingDesignation ? (
              <div className="space-y-3 rounded-lg border border-border bg-surface-secondary/50 p-4">
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newDesignationName}
                    onChange={(e) => {
                      setNewDesignationName(e.target.value);
                      setNewDesignationError(null);
                    }}
                    placeholder="e.g. Librarian, Lab Assistant"
                    className="h-11 rounded-lg border-border bg-surface"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingDesignation(false);
                      setNewDesignationName("");
                      setNewDesignationModules([]);
                      setNewDesignationError(null);
                    }}
                    className="h-11 shrink-0 rounded-lg border-border px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    Allowed modules for this designation
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ALL_MODULES.map((mod) => (
                      <label
                        key={mod}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-secondary hover:bg-surface"
                      >
                        <input
                          type="checkbox"
                          checked={newDesignationModules.includes(mod)}
                          onChange={() => toggleModule(mod)}
                          className="h-3.5 w-3.5 rounded border-border"
                        />
                        {formatModuleLabel(mod)}
                      </label>
                    ))}
                  </div>
                </div>

                {newDesignationError && (
                  <p className="text-xs text-red-500">{newDesignationError}</p>
                )}

                <Button
                  type="button"
                  onClick={handleAddDesignation}
                  disabled={createDesignationMutation.isPending}
                  className="h-10 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  {createDesignationMutation.isPending
                    ? "Adding..."
                    : "Add Designation"}
                </Button>
              </div>
            ) : (
              <Controller
                control={control}
                name="designationId"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      if (value === "__add_new__") {
                        setIsAddingDesignation(true);
                        return;
                      }
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="designationId"
                      className="h-11 w-full max-w-md rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
                    >
                      <SelectValue placeholder="Select designation">
                        {(value: string) =>
                          designations.find((d) => d.id === value)?.name ??
                          "Select designation"
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {designations.map((designation) => (
                        <SelectItem key={designation.id} value={designation.id}>
                          {designation.name}
                        </SelectItem>
                      ))}

                      <div className="my-1 border-t border-border" />

                      <SelectItem
                        value="__add_new__"
                        className="font-medium text-primary focus:bg-primary-soft focus:text-primary"
                      >
                        <span className="flex items-center cursor-pointer gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Add new designation
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            )}

            {errors.designationId && (
              <p className="text-xs text-red-500">
                {errors.designationId.message}
              </p>
            )}
          </div>

          {/* ===================================================== */}
          {/* Status */}
          {/* ===================================================== */}

          <section className="border-t border-border py-2">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-text-primary">
                Status
              </h3>

              <p className="mt-1 text-xs text-text-muted">
                Inactive staff members are hidden from active listings but their
                records are kept.
              </p>
            </div>

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <label className="flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-secondary/50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={field.value ?? true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-border"
                  />

                  <span className="text-sm font-medium text-text-primary">
                    {(field.value ?? true) ? "Active" : "Inactive"}
                  </span>
                </label>
              )}
            />
          </section>

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
