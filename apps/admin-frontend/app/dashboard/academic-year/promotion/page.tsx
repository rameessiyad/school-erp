"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { academicYearApi } from "@/lib/api/academic-year";
import { promotionApi } from "@/lib/api/promotion";
import { PageLoader } from "@/components/common/page-loader";

export default function PromoteStudentsPage() {
  const queryClient = useQueryClient();

  const { data: years = [], isLoading: yearsLoading } = useQuery({
    queryKey: ["academicYears"],
    queryFn: academicYearApi.getAll,
  });

  const [fromYearId, setFromYearId] = useState("");
  const [toYearId, setToYearId] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ["promotionPreview", fromYearId, toYearId],
    queryFn: () => promotionApi.preview(fromYearId, toYearId),
    enabled: !!fromYearId && !!toYearId && fromYearId !== toYearId,
  });

  const mappings = useMemo(() => {
    if (!preview) return [];
    return preview
      .filter((item) => !item.isGraduating)
      .map((item) => ({
        fromSectionId: item.fromSectionId,
        toSectionId:
          overrides[item.fromSectionId] ?? item.suggestedToSectionId ?? "",
      }))
      .filter((m) => m.toSectionId);
  }, [preview, overrides]);

  const promoteMutation = useMutation({
    mutationFn: () =>
      promotionApi.promote({
        fromAcademicYearId: fromYearId,
        toAcademicYearId: toYearId,
        sectionMappings: mappings,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  if (yearsLoading) return <PageLoader text="Loading academic years..." />;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Academic Year</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Promote Students
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Move students into next year&apos;s sections and copy fee structures
          forward.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            From year
          </label>
          <select
            value={fromYearId}
            onChange={(e) => setFromYearId(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label} {y.isActive ? "(active)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            To year
          </label>
          <select
            value={toYearId}
            onChange={(e) => setToYearId(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {previewLoading && <PageLoader text="Loading sections..." />}

      {preview && preview.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="divide-y divide-border">
            {preview.map((item) => (
              <div
                key={item.fromSectionId}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-text-primary">
                    {item.fromSectionLabel}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.studentCount} active student
                    {item.studentCount === 1 ? "" : "s"}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-text-muted" />

                {item.isGraduating ? (
                  <div className="flex items-center gap-1.5 text-xs text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Graduating — not promoted
                  </div>
                ) : item.availableToSections.length > 0 ? (
                  <select
                    value={
                      overrides[item.fromSectionId] ??
                      item.suggestedToSectionId ??
                      ""
                    }
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [item.fromSectionId]: e.target.value,
                      }))
                    }
                    className="h-9 rounded-lg border border-border bg-surface px-2 text-sm"
                  >
                    <option value="">Select section</option>
                    {item.availableToSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-warning">
                    No target sections found — create them in the new year
                    first.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border bg-surface-secondary/40 px-6 py-4">
            <button
              type="button"
              disabled={mappings.length === 0 || promoteMutation.isPending}
              onClick={() => promoteMutation.mutate()}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-50"
            >
              {promoteMutation.isPending
                ? "Promoting..."
                : `Promote ${mappings.length} section${mappings.length === 1 ? "" : "s"}`}
            </button>

            {promoteMutation.isSuccess && (
              <p className="mt-3 text-sm text-success">
                Promoted {promoteMutation.data.studentsPromoted} students and
                copied {promoteMutation.data.feeStructuresCopied} fee
                structures.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
