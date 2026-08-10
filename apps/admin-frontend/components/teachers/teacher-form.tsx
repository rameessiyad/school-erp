"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTeacherSchema,
  CreateTeacherValues,
  genders,
} from "@/lib/validations/teacher";
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
import { Trash2, Plus } from "lucide-react";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

export function TeacherForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState<Option[]>([]);
  // const [sections, setSections] = useState<Option[]>([]);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [selectedClassByRow, setSelectedClassByRow] = useState<
    Record<number, string | null>
  >({});
  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Option[]>>(
    {},
  );

  useEffect(() => {
    async function loadOptions() {
      const [subjectsRes, classesRes, yearsRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/classes"),
        fetch("/api/academic-year"),
      ]);

      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (yearsRes.ok) setAcademicYears(await yearsRes.json());
    }

    loadOptions();
  }, []);

  async function handleClassChange(index: number, classId: string) {
    const res = await fetch(`/api/sections?classId=${classId}`);
    if (res.ok) {
      const data = await res.json();
      setSectionsByRow((prev) => ({ ...prev, [index]: data }));
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTeacherValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: { allocations: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const onSubmit = async (values: CreateTeacherValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message ?? "Failed to create teacher");
        return;
      }

      router.push("/dashboard/teachers");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Teacher Information
        </CardTitle>

        <p className="text-sm text-slate-500">
          Enter the teacher&apos;s personal, professional, and allocation
          details.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Basic Information
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Personal and account information of the teacher.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
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

              <div className="grid gap-5 sm:grid-cols-2">
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
                    placeholder="teacher@school.com"
                    {...register("email")}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />

                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
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

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </Label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    {...register("password")}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />

                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="employeeId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Employee ID
                  </Label>

                  <Input
                    id="employeeId"
                    placeholder="e.g. TCH001"
                    {...register("employeeId")}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-slate-700"
                  >
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
                          className="h-11 rounded-lg border-slate-200 bg-slate-50/50"
                        >
                          <SelectValue placeholder="Select gender" />
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
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="joiningDate"
                    className="text-sm font-medium text-slate-700"
                  >
                    Joining Date
                  </Label>

                  <Input
                    id="joiningDate"
                    type="date"
                    {...register("joiningDate")}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="qualification"
                    className="text-sm font-medium text-slate-700"
                  >
                    Qualification
                  </Label>

                  <Input
                    id="qualification"
                    placeholder="e.g. M.Sc Mathematics"
                    {...register("qualification")}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="experience"
                    className="text-sm font-medium text-slate-700"
                  >
                    Experience (years)
                  </Label>

                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    {...register("experience")}
                    className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-7">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Subject Allocations
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Assign subjects, sections, and academic years to this teacher.
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
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Allocation
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No allocations added
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Add an allocation to assign subjects and sections.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Allocation {index + 1}
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-8 w-8 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-600">
                          Subject
                        </Label>

                        <Controller
                          control={control}
                          name={`allocations.${index}.subjectId`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select subject">
                                  {(value: string) =>
                                    subjects.find((s) => s.id === value)
                                      ?.name ?? "Select subject"
                                  }
                                </SelectValue>
                              </SelectTrigger>

                              <SelectContent>
                                {subjects.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Class</Label>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Class">
                              {(value: string) =>
                                classes.find((c) => c.id === value)?.name ?? "select class"
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
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Section</Label>
                        <Controller
                          control={control}
                          name={`allocations.${index}.sectionId`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Section">
                                  {(value: string) =>
                                    (sectionsByRow[index] ?? []).find(
                                      (s) => s.id === value,
                                    )?.name ?? "Select section"
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {(sectionsByRow[index] ?? []).map((s) => (
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
                        <Label className="text-xs font-medium text-slate-600">
                          Academic Year
                        </Label>

                        <Controller
                          control={control}
                          name={`allocations.${index}.academicYearId`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select year">
                                  {(value: string) =>
                                    academicYears.find((y) => y.id === value)
                                      ?.label ?? "Select year"
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
                    </div>
                  </div>
                ))}
              </div>
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
              disabled={loading}
              className="h-11 rounded-lg border-slate-200 px-5 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Teacher"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
