"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  academicYearApi,
  AcademicYear,
  CreateAcademicYearValues,
} from "@/lib/api/academic-year";
import { PageLoader } from "@/components/common/page-loader";
import { AxiosError } from "axios";

const emptyForm: CreateAcademicYearValues = {
  label: "",
  startDate: "",
  endDate: "",
  isActive: false,
};

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAcademicYearValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data: years = [], isLoading } = useQuery({
    queryKey: ["academicYears"],
    queryFn: academicYearApi.getAll,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["academicYears"] });

  const createMutation = useMutation({
    mutationFn: academicYearApi.create,
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err?.response?.data?.message ?? "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateAcademicYearValues>;
    }) => academicYearApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err?.response?.data?.message ?? "Failed to update"),
  });

  const removeMutation = useMutation({
    mutationFn: academicYearApi.remove,
    onSuccess: invalidate,
  });

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function openEdit(year: AcademicYear) {
    setEditingId(year.id);
    setForm({
      label: year.label,
      startDate: year.startDate.slice(0, 10),
      endDate: year.endDate.slice(0, 10),
      isActive: year.isActive,
    });
    setShowForm(true);
  }

  function handleSubmit() {
    setError(null);

    if (!form.label || !form.startDate || !form.endDate) {
      setError("Label, start date and end date are all required.");
      return;
    }

    if (
      new Date(form.endDate).getTime() <= new Date(form.startDate).getTime()
    ) {
      setError("End date must be after start date.");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  if (isLoading) return <PageLoader text="Loading academic years..." />;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Settings</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Academic Years
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Set the start and end dates for each academic year and mark the
            current one active.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Academic Year
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">
            {editingId ? "Edit Academic Year" : "New Academic Year"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Label
              </label>
              <input
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
                placeholder="e.g. 2027-2028"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Start date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                End date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <label className="mt-4 flex w-fit items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.isActive ?? false}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border"
            />
            Set as the active academic year
          </label>

          {error && <p className="mt-3 text-sm text-error">{error}</p>}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="divide-y divide-border">
          {years.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-text-muted">
              No academic years yet.
            </p>
          ) : (
            years.map((year) => (
              <div
                key={year.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="flex items-center gap-2 font-medium text-text-primary">
                      {year.label}
                      {year.isActive && (
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(year.startDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      —{" "}
                      {new Date(year.endDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(year)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(year.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition hover:bg-error-soft hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
