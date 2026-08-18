"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTeacherSchema,
  CreateTeacherValues,
  genders,
  getTeacherSchema,
} from "@/lib/validations/teacher";
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
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { optionsApi } from "@/lib/api/options";
import { teachersApi } from "@/lib/api/teachers";
import { getErrorMessage } from "@/lib/api/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

interface AllocationMeta {
  subjectId: string;
  sectionId: string;
  academicYearId: string;
  classId?: string;
}

interface TeacherFormProps {
  teacherId?: string;
  defaultValues?: Partial<CreateTeacherValues> & {
    photoUrl?: string | null;
  };
  initialAllocationsMeta?: AllocationMeta[];
}

export function TeacherForm({
  teacherId,
  defaultValues,
  initialAllocationsMeta,
}: TeacherFormProps) {
  const isEditMode = !!teacherId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Option[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.photoUrl ?? null,
  );

  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);

  const [selectedClassByRow, setSelectedClassByRow] = useState<
    Record<number, string | null>
  >({});

  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Option[]>>(
    {},
  );

  useEffect(() => {
    if (!initialAllocationsMeta?.length) return;

    initialAllocationsMeta.forEach(async (alloc, index) => {
      if (!alloc.classId) return;

      setSelectedClassByRow((prev) => ({
        ...prev,
        [index]: alloc.classId!,
      }));

      const sections = await optionsApi.sections(alloc.classId);

      setSectionsByRow((prev) => ({
        ...prev,
        [index]: sections,
      }));
    });
  }, [initialAllocationsMeta]);

  useEffect(() => {
    async function loadOptions() {
      const [subjectsData, classesData, yearsData] = await Promise.all([
        optionsApi.subjects(),
        optionsApi.classes(),
        optionsApi.academicYears(),
      ]);

      setSubjects(subjectsData);
      setClasses(classesData);
      setAcademicYears(yearsData);
    }

    loadOptions();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTeacherValues>({
    resolver: zodResolver(getTeacherSchema(isEditMode)),
    defaultValues: {
      allocations: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  async function handleClassChange(index: number, classId: string) {
    const sections = await optionsApi.sections(classId);

    setSectionsByRow((prev) => ({
      ...prev,
      [index]: sections,
    }));
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPhoto(null);
      setPhotoPreview(defaultValues?.photoUrl ?? null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setServerError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image size must be less than 5MB.");
      return;
    }

    setServerError(null);
    setPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const saveTeacherMutation = useMutation({
    mutationFn: (values: CreateTeacherValues) => {
      const payload = { ...values };

      if (isEditMode && !payload.password) {
        delete payload.password;
      }

      return isEditMode
        ? teachersApi.update(teacherId!, payload, photo)
        : teachersApi.create(payload, photo);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teachers"],
      });

      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["teacher", teacherId],
        });
      }

      router.push("/dashboard/teachers");
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} teacher`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateTeacherValues) => {
    setServerError(null);
    saveTeacherMutation.mutate(values);
  };

  /*
   * Shared theme classes
   * Same semantic color system used by ParentForm.
   */
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
              {isEditMode ? "Edit Teacher" : "Teacher Information"}
            </h2>

            <p className="text-sm text-text-secondary">
              {isEditMode
                ? "Update the teacher's personal, professional, and allocation information."
                : "Add a teacher and assign their subjects, classes, and academic years."}
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
                  Basic personal and account information of the teacher.
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

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className={labelClass}>
                    Gender
                  </Label>

                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="gender"
                          className="h-11 w-full rounded-lg border-border bg-surface-secondary text-text-primary transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>

                        <SelectContent className="border-border bg-surface text-text-primary">
                          {genders.map((gender) => (
                            <SelectItem
                              key={gender}
                              value={gender}
                              className="focus:bg-primary-soft focus:text-text-primary"
                            >
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.gender && (
                    <p className="text-xs text-error">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className={labelClass}>
                    Date of Birth
                  </Label>

                  <Input
                    id="dob"
                    type="date"
                    {...register("dob")}
                    className={inputClass}
                  />

                  {errors.dob && (
                    <p className="text-xs text-error">{errors.dob.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Contact & Account */}
            {/* ===================================================== */}

            <section className="border-t border-border px-6 py-7 lg:px-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Contact & Account
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Contact details and login information for the teacher.
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
                    placeholder="teacher@school.com"
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

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className={labelClass}>
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
                    className={inputClass}
                  />

                  {isEditMode && (
                    <p className="text-xs text-text-muted">
                      Only fill this in if you want to set a new password.
                    </p>
                  )}

                  {errors.password && (
                    <p className="text-xs text-error">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Employee ID */}
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className={labelClass}>
                    Employee ID
                  </Label>

                  <Input
                    id="employeeId"
                    placeholder="e.g. TCH001"
                    {...register("employeeId")}
                    className={inputClass}
                  />

                  {errors.employeeId && (
                    <p className="text-xs text-error">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Professional Details */}
            {/* ===================================================== */}

            <section className="border-t border-border px-6 py-7 lg:px-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Professional Details
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Add the teacher&apos;s qualification, experience, and joining
                  information.
                </p>
              </div>

              <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Joining Date */}
                <div className="space-y-2">
                  <Label htmlFor="joiningDate" className={labelClass}>
                    Joining Date
                  </Label>

                  <Input
                    id="joiningDate"
                    type="date"
                    {...register("joiningDate")}
                    className={inputClass}
                  />

                  {errors.joiningDate && (
                    <p className="text-xs text-error">
                      {errors.joiningDate.message}
                    </p>
                  )}
                </div>

                {/* Qualification */}
                <div className="space-y-2">
                  <Label htmlFor="qualification" className={labelClass}>
                    Qualification
                  </Label>

                  <Input
                    id="qualification"
                    placeholder="e.g. M.Sc Mathematics"
                    {...register("qualification")}
                    className={inputClass}
                  />

                  {errors.qualification && (
                    <p className="text-xs text-error">
                      {errors.qualification.message}
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2 md:max-w-[50%]">
                  <Label htmlFor="experience" className={labelClass}>
                    Experience (years)
                  </Label>

                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    {...register("experience")}
                    className={inputClass}
                  />

                  {errors.experience && (
                    <p className="text-xs text-error">
                      {errors.experience.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Teacher Photo */}
            {/* ===================================================== */}

            <section className="border-t border-border px-6 py-7 lg:px-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Teacher Photo
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Upload a profile photo for the teacher.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-secondary/50 p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Teacher preview"
                      width={96}
                      height={96}
                      className="h-24 w-24 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-surface text-xs text-text-muted">
                      No Photo
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="photo" className={labelClass}>
                      Profile Photo
                    </Label>

                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="h-11 max-w-sm cursor-pointer rounded-lg border-border bg-surface text-text-primary file:mr-4 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-secondary"
                    />

                    <p className="text-xs text-text-muted">
                      JPG, PNG or WEBP. Maximum 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================== */}
            {/* Subject Allocations */}
            {/* ===================================================== */}

            <section className="border-t border-border px-6 py-7 lg:px-8">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Subject Allocations
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Assign subjects, classes, sections, and academic years to
                    this teacher.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      subjectId: "",
                      sectionId: "",
                      academicYearId: "",
                    })
                  }
                  className="h-9 rounded-lg border-border bg-surface px-4 text-primary hover:bg-primary-soft hover:text-primary"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Allocation
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface-secondary/50 px-5 py-9 text-center">
                  <p className="text-sm font-medium text-text-secondary">
                    No allocations added
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    Add an allocation to assign subjects and sections to this
                    teacher.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        subjectId: "",
                        sectionId: "",
                        academicYearId: "",
                      })
                    }
                    className="mt-4 h-9 rounded-lg border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add First Allocation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border bg-surface-secondary/50 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Allocation {index + 1}
                          </p>

                          <p className="mt-0.5 text-xs text-text-muted">
                            Assign the teacher&apos;s teaching responsibility.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-8 w-8 rounded-lg text-text-muted hover:bg-error-soft hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2 lg:grid-cols-4">
                        {/* Subject */}
                        <div className="space-y-2">
                          <Label className={labelClass}>Subject</Label>

                          <Controller
                            control={control}
                            name={`allocations.${index}.subjectId`}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface text-text-primary">
                                  <SelectValue placeholder="Select subject">
                                    {(value: string) =>
                                      subjects.find(
                                        (subject) => subject.id === value,
                                      )?.name ?? "Select subject"
                                    }
                                  </SelectValue>
                                </SelectTrigger>

                                <SelectContent className="border-border bg-surface text-text-primary">
                                  {subjects.map((subject) => (
                                    <SelectItem
                                      key={subject.id}
                                      value={subject.id}
                                      className="focus:bg-primary-soft focus:text-text-primary"
                                    >
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          {errors.allocations?.[index]?.subjectId && (
                            <p className="text-xs text-error">
                              {errors.allocations[index]?.subjectId?.message}
                            </p>
                          )}
                        </div>

                        {/* Class */}
                        <div className="space-y-2">
                          <Label className={labelClass}>Class</Label>

                          <Select
                            value={selectedClassByRow[index] ?? ""}
                            onValueChange={(value: string | null) => {
                              if (!value) return;

                              setSelectedClassByRow((prev) => ({
                                ...prev,
                                [index]: value,
                              }));

                              handleClassChange(index, value);

                              setValue(`allocations.${index}.sectionId`, "");
                            }}
                          >
                            <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface text-text-primary">
                              <SelectValue placeholder="Select class">
                                {(value: string) =>
                                  classes.find(
                                    (classItem) => classItem.id === value,
                                  )?.name ?? "Select class"
                                }
                              </SelectValue>
                            </SelectTrigger>

                            <SelectContent className="border-border bg-surface text-text-primary">
                              {classes.map((classItem) => (
                                <SelectItem
                                  key={classItem.id}
                                  value={classItem.id}
                                  className="focus:bg-primary-soft focus:text-text-primary"
                                >
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Section */}
                        <div className="space-y-2">
                          <Label className={labelClass}>Section</Label>

                          <Controller
                            control={control}
                            name={`allocations.${index}.sectionId`}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface text-text-primary">
                                  <SelectValue placeholder="Select section">
                                    {(value: string) =>
                                      (sectionsByRow[index] ?? []).find(
                                        (section) => section.id === value,
                                      )?.name ?? "Select section"
                                    }
                                  </SelectValue>
                                </SelectTrigger>

                                <SelectContent className="border-border bg-surface text-text-primary">
                                  {(sectionsByRow[index] ?? []).map(
                                    (section) => (
                                      <SelectItem
                                        key={section.id}
                                        value={section.id}
                                        className="focus:bg-primary-soft focus:text-text-primary"
                                      >
                                        {section.name}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          {errors.allocations?.[index]?.sectionId && (
                            <p className="text-xs text-error">
                              {errors.allocations[index]?.sectionId?.message}
                            </p>
                          )}
                        </div>

                        {/* Academic Year */}
                        <div className="space-y-2">
                          <Label className={labelClass}>Academic Year</Label>

                          <Controller
                            control={control}
                            name={`allocations.${index}.academicYearId`}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface text-text-primary">
                                  <SelectValue placeholder="Select year">
                                    {(value: string) =>
                                      academicYears.find(
                                        (year) => year.id === value,
                                      )?.label ?? "Select year"
                                    }
                                  </SelectValue>
                                </SelectTrigger>

                                <SelectContent className="border-border bg-surface text-text-primary">
                                  {academicYears.map((year) => (
                                    <SelectItem
                                      key={year.id}
                                      value={year.id}
                                      className="focus:bg-primary-soft focus:text-text-primary"
                                    >
                                      {year.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          {errors.allocations?.[index]?.academicYearId && (
                            <p className="text-xs text-error">
                              {
                                errors.allocations[index]?.academicYearId
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                disabled={saveTeacherMutation.isPending}
                className="h-10 rounded-lg border-border bg-surface px-5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saveTeacherMutation.isPending}
                className="h-10 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveTeacherMutation.isPending
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Teacher"
                    : "Create Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
