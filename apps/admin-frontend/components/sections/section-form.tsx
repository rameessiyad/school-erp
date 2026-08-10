"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSectionSchema,
  CreateSectionValues,
} from "@/lib/validations/section";
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

interface Option {
  id: string;
  name?: string;
  label?: string;
}

export function SectionForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Option[]>([]);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);

  useEffect(() => {
    async function loadOptions() {
      const [classesRes, yearsRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/academic-year"),
      ]);

      if (classesRes.ok) setClasses(await classesRes.json());
      if (yearsRes.ok) setAcademicYears(await yearsRes.json());
    }

    loadOptions();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateSectionValues>({
    resolver: zodResolver(createSectionSchema),
  });

  const onSubmit = async (values: CreateSectionValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message ?? "Failed to create section");
        return;
      }

      router.push("/dashboard/sections");
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
          Section Information
        </CardTitle>

        <p className="text-sm text-slate-500">
          Enter the section details and assign it to a class.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Section Name
            </Label>

            <Input
              id="name"
              placeholder="e.g. A"
              {...register("name")}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Class</Label>

            <Controller
              control={control}
              name="classId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
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

            {errors.classId && (
              <p className="text-xs text-red-500">{errors.classId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Academic Year
            </Label>

            <Controller
              control={control}
              name="academicYearId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select academic year">
                      {(value: string) =>
                        academicYears.find((y) => y.id === value)?.label ??
                        "Select academic year"
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

            {errors.academicYearId && (
              <p className="text-xs text-red-500">
                {errors.academicYearId.message}
              </p>
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
              {loading ? "Creating..." : "Create Section"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
