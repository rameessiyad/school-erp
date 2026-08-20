"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserRound,
  GraduationCap,
  IdCard,
  Plus,
  X,
  Loader2,
  Camera,
} from "lucide-react";

import {
  createStudentSchema,
  CreateStudentValues,
  genders,
} from "@/lib/validations/student";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { optionsApi } from "@/lib/api/options";
import { getErrorMessage } from "@/lib/api/error";
import { studentsApi } from "@/lib/api/students";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { DatePicker } from "../ui/date-picker";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

interface StudentFormProps {
  studentId?: string;
  defaultValues?: Partial<CreateStudentValues>;
  initialEnrollmentEnabled?: boolean;
  initialPhotoUrl?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Shared Section Heading                                                     */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>

        <p className="mt-0.5 text-xs leading-5 text-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared Input Class                                                         */
/* -------------------------------------------------------------------------- */

const inputClassName =
  "h-11 w-full min-w-0 rounded-lg border-border bg-surface px-3 text-sm text-text-primary shadow-none transition placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function StudentForm({
  studentId,
  defaultValues,
  initialEnrollmentEnabled = false,
  initialPhotoUrl = null,
}: StudentFormProps) {
  const isEditMode = !!studentId;

  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState<string | null>(null);

  const [enableEnrollment, setEnableEnrollment] = useState(
    initialEnrollmentEnabled,
  );

  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialPhotoUrl,
  );

  /* ---------------------------------------------------------------------- */
  /* Load Options                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadOptions() {
      const [classesData, yearsData] = await Promise.all([
        optionsApi.classes(),
        optionsApi.academicYears(),
      ]);

      setClasses(classesData);
      setAcademicYears(yearsData);

      if (defaultValues?.classId) {
        const sectionsData = await optionsApi.sections(defaultValues.classId);

        setSections(sectionsData);
      }
    }

    loadOptions();
  }, [defaultValues?.classId]);

  /* ---------------------------------------------------------------------- */
  /* sections loading                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadOptions() {
      const [classesData, yearsData] = await Promise.all([
        optionsApi.classes(),
        optionsApi.academicYears(),
      ]);

      setClasses(classesData);
      setAcademicYears(yearsData);

      if (defaultValues?.classId) {
        setSectionsLoading(true);
        try {
          const sectionsData = await optionsApi.sections(defaultValues.classId);
          setSections(sectionsData);
        } finally {
          setSectionsLoading(false);
        }
      }
    }

    loadOptions();
  }, [defaultValues?.classId]);

  /* ---------------------------------------------------------------------- */
  /* Photo Cleanup                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  /* ---------------------------------------------------------------------- */
  /* Form                                                                    */
  /* ---------------------------------------------------------------------- */

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateStudentValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues,
  });

  /* ---------------------------------------------------------------------- */
  /* Handlers                                                                */
  /* ---------------------------------------------------------------------- */

  async function handleClassChange(classId: string) {
    setValue("sectionId", "");
    setSections([]);
    setSectionsLoading(true);

    try {
      const sectionsData = await optionsApi.sections(classId);
      setSections(sectionsData);
    } finally {
      setSectionsLoading(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhotoFile(file);

    setPhotoPreview((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }

      return URL.createObjectURL(file);
    });
  }

  function handleRemovePhoto() {
    setPhotoFile(null);

    setPhotoPreview((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }

      return null;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Mutation                                                                */
  /* ---------------------------------------------------------------------- */

  const saveStudentMutation = useMutation({
    mutationFn: async (values: CreateStudentValues) => {
      const { sectionId, academicYearId, rollNo, ...studentPayload } = values;

      const student = isEditMode
        ? await studentsApi.update(studentId!, studentPayload, photoFile)
        : await studentsApi.create(studentPayload, photoFile);

      if (!isEditMode && enableEnrollment && sectionId && academicYearId) {
        try {
          await studentsApi.createEnrollment(student.id, {
            sectionId,
            academicYearId,
            rollNo,
          });
        } catch (enrollError) {
          throw new Error(
            `Student created, but enrollment failed: ${getErrorMessage(
              enrollError,
            )}`,
          );
        }
      }

      return student;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["student", studentId],
        });
      }

      router.push("/dashboard/students");
    },

    onError: (error) => {
      setServerError(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} student`,
        ),
      );
    },
  });

  const onSubmit = (values: CreateStudentValues) => {
    setServerError(null);

    saveStudentMutation.mutate(values);
  };

  /* ---------------------------------------------------------------------- */
  /* UI                                                                      */
  /* ---------------------------------------------------------------------- */

  return (
    <Card className="w-full overflow-hidden rounded-2xl border-border bg-surface shadow-sm">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <CardHeader className="border-b border-border bg-surface px-6 py-5 lg:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <IdCard className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold text-text-primary">
              Student Information
            </CardTitle>

            <p className="mt-0.5 text-sm text-text-secondary">
              Enter the student&apos;s personal and admission details.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 lg:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ============================================================ */}
          {/* Photo                                                         */}
          {/* ============================================================ */}

          <section className="space-y-4">
            <SectionHeading
              icon={Camera}
              title="Photo"
              description="Upload a passport-size photo of the student (optional)."
            />

            <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface-secondary/40 p-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Student photo preview"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8 text-text-muted" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Label
                    htmlFor="photo"
                    className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
                  >
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </Label>

                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {photoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-10 rounded-lg border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>

                <p className="mt-2 text-xs text-text-muted">
                  JPG, PNG or WEBP. Use a clear passport-size photo.
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Admission Details                                             */}
          {/* ============================================================ */}

          <section className="space-y-4 border-t border-border pt-7">
            <SectionHeading
              icon={IdCard}
              title="Admission Details"
              description="Basic information related to the student's admission."
            />

            <div className="rounded-xl border border-border bg-surface-secondary/40 p-5 lg:p-6">
              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                {/* Admission Number */}

                <div className="min-w-0 space-y-2">
                  <Label
                    htmlFor="admissionNo"
                    className="text-sm font-medium text-text-secondary"
                  >
                    Admission No.
                  </Label>

                  <Input
                    id="admissionNo"
                    placeholder="e.g. ADM2026001"
                    {...register("admissionNo")}
                    className={inputClassName}
                  />

                  {errors.admissionNo && (
                    <p className="text-xs text-error">
                      {errors.admissionNo.message}
                    </p>
                  )}
                </div>

                {/* Admission Date */}

                <div className="min-w-0 space-y-2">
                  <Label className="text-sm font-medium text-text-secondary">
                    Admission Date
                  </Label>

                  <Controller
                    control={control}
                    name="admissionDate"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select admission date"
                        minDate={new Date(2000, 0, 1)}
                        maxDate={new Date()}
                      />
                    )}
                  />

                  {errors.admissionDate && (
                    <p className="text-xs text-error">
                      {errors.admissionDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Personal Details                                              */}
          {/* ============================================================ */}

          <section className="space-y-4 border-t border-border pt-7">
            <SectionHeading
              icon={UserRound}
              title="Personal Details"
              description="Enter the student's personal information."
            />

            <div className="rounded-xl border border-border bg-surface-secondary/40 p-5 lg:p-6">
              <div className="space-y-5">
                {/* Names */}

                <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                  {/* First Name */}

                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-text-secondary"
                    >
                      First Name
                    </Label>

                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      {...register("firstName")}
                      className={inputClassName}
                    />

                    {errors.firstName && (
                      <p className="text-xs text-error">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}

                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Last Name
                    </Label>

                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      {...register("lastName")}
                      className={inputClassName}
                    />
                  </div>
                </div>

                {/* Other Details */}

                <div className="grid min-w-0 gap-5 md:grid-cols-3">
                  {/* Gender */}

                  <div className="min-w-0 space-y-2">
                    <Label className="text-sm font-medium text-text-secondary">
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
                          <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select gender">
                              {(value: string) => value || "Select gender"}
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            {genders.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Date of Birth */}

                  <div className="min-w-0 space-y-2">
                    <Label className="text-sm font-medium text-text-secondary">
                      Date of Birth
                    </Label>

                    <Controller
                      control={control}
                      name="dob"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select date of birth"
                          minDate={new Date(1950, 0, 1)}
                          maxDate={new Date()}
                        />
                      )}
                    />

                    {errors.dob && (
                      <p className="text-xs text-error">{errors.dob.message}</p>
                    )}
                  </div>

                  {/* Blood Group */}

                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="bloodGroup"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Blood Group
                    </Label>

                    <Input
                      id="bloodGroup"
                      placeholder="e.g. O+"
                      {...register("bloodGroup")}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Enrollment                                                     */}
          {/* ============================================================ */}

          <section className="space-y-4 border-t border-border pt-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading
                icon={GraduationCap}
                title="Enrollment"
                description="Optionally assign the student to a class and section."
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEnableEnrollment((prev) => !prev)}
                className="h-10 shrink-0 rounded-lg border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                {enableEnrollment ? (
                  <>
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Remove Enrollment
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Enrollment
                  </>
                )}
              </Button>
            </div>

            {!enableEnrollment && (
              <div className="rounded-xl border border-info/20 bg-info-soft px-4 py-3.5">
                <p className="text-sm leading-5 text-info">
                  Enrollment is optional. You can enroll this student into a
                  class or section later.
                </p>
              </div>
            )}

            {enableEnrollment && (
              <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-5 lg:p-6">
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  {/* Class */}

                  <div className="min-w-0 space-y-2">
                    <Label className="text-sm font-medium text-text-secondary">
                      Class
                    </Label>

                    <Controller
                      control={control}
                      name="classId"
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);

                            if (value) {
                              handleClassChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select class">
                              {(value: string) =>
                                classes.find((item) => item.id === value)
                                  ?.name ?? "Select class"
                              }
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            {classes.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Section */}

                  <div className="min-w-0 space-y-2">
                    <Label className="text-sm font-medium text-text-secondary">
                      Section
                    </Label>

                    <Controller
                      control={control}
                      name="sectionId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={sectionsLoading}
                        >
                          <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60">
                            <SelectValue placeholder="Select section">
                              {(value: string) => {
                                if (sectionsLoading)
                                  return "Loading sections...";
                                return (
                                  sections.find((item) => item.id === value)
                                    ?.name ?? "Select section"
                                );
                              }}
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            {sectionsLoading ? (
                              <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-text-muted">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Loading sections...
                              </div>
                            ) : (
                              sections.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border-border bg-surface text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select academic year">
                              {(value: string) =>
                                academicYears.find((item) => item.id === value)
                                  ?.label ?? "Select academic year"
                              }
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            {academicYears.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Roll Number */}

                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="rollNo"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Roll No.
                    </Label>

                    <Input
                      id="rollNo"
                      placeholder="e.g. 12"
                      {...register("rollNo")}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/* Server Error                                                   */}
          {/* ============================================================ */}

          {serverError && (
            <div className="rounded-xl border border-error/20 bg-error-soft px-4 py-3.5">
              <p className="text-center text-sm text-error">{serverError}</p>
            </div>
          )}

          {/* ============================================================ */}
          {/* Actions                                                        */}
          {/* ============================================================ */}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saveStudentMutation.isPending}
              className="h-11 rounded-lg border-border bg-surface px-5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveStudentMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStudentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {studentId ? "Updating..." : "Creating..."}
                </>
              ) : studentId ? (
                "Update Student"
              ) : (
                "Create Student"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
