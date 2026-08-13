"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStudentSchema,
  CreateStudentValues,
  genders,
} from "@/lib/validations/student";
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
import { optionsApi } from "@/lib/api/options";
import { getErrorMessage } from "@/lib/api/error";
import { studentsApi } from "@/lib/api/students";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

interface StudentFormProps {
  studentId?: string;
  defaultValues?: Partial<CreateStudentValues>;
  initialEnrollmentEnabled?: boolean;
}

export function StudentForm({
  studentId,
  defaultValues,
  initialEnrollmentEnabled = false,
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
  }, []);

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

  async function handleClassChange(classId: string) {
    setValue("sectionId", "");
    const sectionsData = await optionsApi.sections(classId);
    setSections(sectionsData);
  }

  const saveStudentMutation = useMutation({
    mutationFn: async (values: CreateStudentValues) => {
      const { sectionId, academicYearId, rollNo, ...studentPayload } = values;

      const student = isEditMode
        ? await studentsApi.update(studentId!, studentPayload)
        : await studentsApi.create(studentPayload);

      if (!isEditMode && enableEnrollment && sectionId && academicYearId) {
        try {
          await studentsApi.createEnrollment(student.id, {
            sectionId,
            academicYearId,
            rollNo,
          });
        } catch (enrollError) {
          throw new Error(
            `Student created, but enrollment failed: ${getErrorMessage(enrollError)}`,
          );
        }
      }
      return student;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });

      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["student", studentId] });
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

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Student Information
        </CardTitle>

        <p className="text-sm text-slate-500">
          Enter the student&apos;s personal and admission details.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Admission Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Admission Details
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Basic information related to the student&apos;s admission.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="admissionNo"
                  className="text-sm font-medium text-slate-700"
                >
                  Admission No.
                </Label>

                <Input
                  id="admissionNo"
                  placeholder="e.g. ADM2026001"
                  {...register("admissionNo")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />

                {errors.admissionNo && (
                  <p className="text-xs text-red-500">
                    {errors.admissionNo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="admissionDate"
                  className="text-sm font-medium text-slate-700"
                >
                  Admission Date
                </Label>

                <Input
                  id="admissionDate"
                  type="date"
                  {...register("admissionDate")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Personal Details
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Enter the student&apos;s personal information.
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Gender
                </Label>

                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select gender">
                          {(value: string) => value || "Select gender"}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {genders.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dob"
                  className="text-sm font-medium text-slate-700"
                >
                  Date of Birth
                </Label>

                <Input
                  id="dob"
                  type="date"
                  {...register("dob")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bloodGroup"
                  className="text-sm font-medium text-slate-700"
                >
                  Blood Group
                </Label>

                <Input
                  id="bloodGroup"
                  placeholder="e.g. O+"
                  {...register("bloodGroup")}
                  className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Enrollment */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Enrollment
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Optionally assign the student to a class and section.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEnableEnrollment((prev) => !prev)}
                className="rounded-lg border-slate-200"
              >
                {enableEnrollment ? "Remove Enrollment" : "Add Enrollment"}
              </Button>
            </div>

            {!enableEnrollment && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
                <p className="text-sm text-blue-700">
                  Enrollment is optional. You can enroll this student into a
                  class or section later.
                </p>
              </div>
            )}

            {enableEnrollment && (
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/40 p-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
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
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Section
                  </Label>

                  <Controller
                    control={control}
                    name="sectionId"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                          <SelectValue placeholder="Select section">
                            {(value: string) =>
                              sections.find((s) => s.id === value)?.name ??
                              "Select section"
                            }
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          {sections.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                      >
                        <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                          <SelectValue placeholder="Select academic year">
                            {(value: string) =>
                              academicYears.find((y) => y.id === value)
                                ?.label ?? "Select academic year"
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
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="rollNo"
                    className="text-sm font-medium text-slate-700"
                  >
                    Roll No.
                  </Label>

                  <Input
                    id="rollNo"
                    placeholder="e.g. 12"
                    {...register("rollNo")}
                    className="h-11 rounded-lg border-slate-200 bg-white transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            )}
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
              disabled={saveStudentMutation.isPending}
              className="h-11 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveStudentMutation.isPending}
              className="h-11 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStudentMutation.isPending
                ? studentId
                  ? "Updating..."
                  : "Creating..."
                : studentId
                  ? "Update Student"
                  : "Create Student"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
