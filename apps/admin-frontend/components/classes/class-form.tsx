"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { createClassSchema, CreateClassValues } from "@/lib/validations/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classesApi } from "@/lib/api/classes";
import { sectionsApi } from "@/lib/api/sections";
import { getErrorMessage } from "@/lib/api/error";

type SectionRow = { id: string; name: string };

function getNextSectionName(existing: string[]): string {
  const used = new Set(existing.map((s) => s.trim().toUpperCase()));
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    if (!used.has(letter)) return letter;
  }
  return `Section ${existing.length + 1}`;
}

interface ClassFormProps {
  classId?: string;
  defaultValues?: Partial<CreateClassValues>;
  initialSections?: SectionRow[];
  activeAcademicYearId?: string;
}

export function ClassForm({
  classId,
  defaultValues,
  initialSections,
  activeAcademicYearId,
}: ClassFormProps) {
  const isEditMode = !!classId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const [newSections, setNewSections] = useState<string[]>([]);

  const [localSections, setLocalSections] = useState<SectionRow[]>(
    initialSections ?? [],
  );
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionError, setSectionError] = useState<string | null>(null);

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
      if (isEditMode) {
        return classesApi.update(classId!, { name: values.name });
      }

      const cleanSections = newSections.map((s) => s.trim()).filter(Boolean);
      return classesApi.create({ name: values.name, sections: cleanSections });
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

  const addSectionMutation = useMutation({
    mutationFn: (name: string) => {
      if (!activeAcademicYearId) {
        return Promise.reject(
          new Error("No active academic year found for this school"),
        );
      }
      return sectionsApi.create({
        name,
        classId: classId!,
        academicYearId: activeAcademicYearId,
      });
    },
    onSuccess: (created) => {
      setLocalSections((prev) => [
        ...prev,
        { id: created.id, name: created.name },
      ]);
      setNewSectionName("");
      setSectionError(null);
      queryClient.invalidateQueries({ queryKey: ["schoolClass", classId] });
      queryClient.invalidateQueries({ queryKey: ["schoolClasses"] });
    },
    onError: (error) => {
      setSectionError(getErrorMessage(error, "Failed to add section"));
    },
  });

  const removeSectionMutation = useMutation({
    mutationFn: (sectionId: string) => sectionsApi.remove(sectionId),
    onSuccess: (_data, sectionId) => {
      setLocalSections((prev) => prev.filter((s) => s.id !== sectionId));
      setSectionError(null);
      queryClient.invalidateQueries({ queryKey: ["schoolClass", classId] });
      queryClient.invalidateQueries({ queryKey: ["schoolClasses"] });
    },
    onError: (error) => {
      setSectionError(getErrorMessage(error, "Failed to remove section"));
    },
  });

  function handleAddNewSectionRow() {
    setNewSections((prev) => [...prev, getNextSectionName(prev)]);
  }

  function handleUpdateNewSection(index: number, value: string) {
    setNewSections((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function handleRemoveNewSection(index: number) {
    setNewSections((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddExistingSection() {
    const trimmed = newSectionName.trim();
    if (!trimmed) return;
    addSectionMutation.mutate(trimmed);
  }

  function handleRemoveExistingSection(section: SectionRow) {
    const confirmed = window.confirm(
      `Remove section "${section.name}"? This cannot be undone.`,
    );
    if (confirmed) removeSectionMutation.mutate(section.id);
  }

  const onSubmit = (values: CreateClassValues) => {
    setServerError(null);
    saveClassMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-border bg-surface shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold text-text-primary">
          Class Information
        </CardTitle>

        <p className="text-sm text-text-secondary">
          Enter the details of the class you want to add.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-text-secondary"
            >
              Class Name
            </Label>

            <Input
              id="name"
              placeholder="e.g. Grade 8"
              {...register("name")}
              className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>

          {/* Sections — create mode */}
          {!isEditMode && (
            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-text-secondary">
                  Sections{" "}
                  <span className="font-normal text-text-muted">
                    (optional)
                  </span>
                </Label>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewSectionRow}
                  className="h-8 rounded-lg border-border text-text-secondary hover:bg-surface-secondary"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Section
                </Button>
              </div>

              {newSections.length === 0 ? (
                <p className="text-sm text-text-muted">
                  No sections added. You can add sections now or later from the
                  class page.
                </p>
              ) : (
                <div className="space-y-2">
                  {newSections.map((section, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={section}
                        onChange={(e) =>
                          handleUpdateNewSection(index, e.target.value)
                        }
                        placeholder="e.g. A"
                        className="h-10 rounded-lg border-border bg-surface-secondary/50"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveNewSection(index)}
                        className="h-10 shrink-0 rounded-lg border-border text-text-secondary hover:bg-surface-secondary"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sections — edit mode */}
          {isEditMode && (
            <div className="space-y-3 border-t border-border pt-5">
              <Label className="text-sm font-medium text-text-secondary">
                Sections
              </Label>

              {!activeAcademicYearId && (
                <p className="text-xs text-warning">
                  No active academic year found — adding sections is disabled.
                </p>
              )}

              <div className="space-y-2">
                {localSections.length === 0 && (
                  <p className="text-sm text-text-muted">
                    No sections yet for the active academic year.
                  </p>
                )}

                {localSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-text-secondary">
                      {section.name}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={removeSectionMutation.isPending}
                      onClick={() => handleRemoveExistingSection(section)}
                      className="h-8 rounded-lg border-border text-text-secondary hover:bg-error-soft hover:text-error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExistingSection();
                    }
                  }}
                  placeholder={getNextSectionName(
                    localSections.map((s) => s.name),
                  )}
                  disabled={!activeAcademicYearId}
                  className="h-10 rounded-lg border-border bg-surface-secondary/50"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    !activeAcademicYearId || addSectionMutation.isPending
                  }
                  onClick={handleAddExistingSection}
                  className="h-10 shrink-0 rounded-lg border-border text-text-secondary hover:bg-surface-secondary"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              {sectionError && (
                <p className="text-xs text-error">{sectionError}</p>
              )}
            </div>
          )}

          {serverError && (
            <div className="rounded-lg border border-error/20 bg-error-soft px-4 py-3">
              <p className="text-center text-sm text-error">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saveClassMutation.isPending}
              className="h-11 rounded-lg border-border px-5 text-text-secondary hover:bg-surface-secondary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveClassMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
