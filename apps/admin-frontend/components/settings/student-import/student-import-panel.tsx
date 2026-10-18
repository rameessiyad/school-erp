"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/common/page-loader";
import { ImportPreviewTable } from "@/components/settings/student-import/import-preview-table";
import { studentImportApi } from "@/lib/api/student-import";
import { getErrorMessage } from "@/lib/api/error";
import { downloadBlob } from "@/lib/download";
import { notify } from "@/lib/toast";
import {
  CommitResponse,
  ImportTarget,
  ValidateResponse,
} from "@/lib/validations/student-import";

type Stage = "setup" | "review" | "done";

const triggerClass =
  "h-11 w-full rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20";

export function StudentImportPanel() {
  const queryClient = useQueryClient();

  const [stage, setStage] = useState<Stage>("setup");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [multiClass, setMultiClass] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidateResponse | null>(null);
  const [result, setResult] = useState<CommitResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: options, isLoading } = useQuery({
    queryKey: ["student-import-options"],
    queryFn: studentImportApi.options,
  });

  const year = options?.academicYears.find((y) => y.id === academicYearId);

  const classOptions = useMemo(() => {
    const map = new Map<string, string>();
    year?.sections.forEach((s) => map.set(s.classId, s.className));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [year]);

  const sectionOptions =
    year?.sections.filter((s) => s.classId === classId) ?? [];
  const selectedSection = sectionOptions.find((s) => s.id === sectionId);

  const target: ImportTarget | null = academicYearId
    ? {
        academicYearId,
        sectionId: multiClass ? undefined : sectionId || undefined,
      }
    : null;
  const targetReady = !!academicYearId && (multiClass || !!sectionId);

  const reset = () => {
    setStage("setup");
    setFile(null);
    setValidation(null);
    setResult(null);
  };

  const handleTemplate = async () => {
    if (!target || !targetReady) return;
    setDownloading(true);
    try {
      const blob = await studentImportApi.template(target);
      const label = multiClass
        ? "multi-class"
        : `${selectedSection?.className}-${selectedSection?.name}`;
      downloadBlob(blob, `student-import-${year?.label}-${label}.xlsx`);
    } catch (e) {
      notify.error(getErrorMessage(e, "Failed to download template"));
    } finally {
      setDownloading(false);
    }
  };

  const validateMutation = useMutation({
    mutationFn: () => studentImportApi.validate(file!, target!),
    onSuccess: (data) => {
      setValidation(data);
      setStage("review");
    },
    onError: (e) => notify.error(getErrorMessage(e, "Failed to validate file")),
  });

  const commitMutation = useMutation({
    mutationFn: () => studentImportApi.commit(file!, target!),
    onSuccess: (data) => {
      setResult(data);
      setConfirmOpen(false);
      setStage("done");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      notify.success(`${data.imported} students imported`);
    },
    onError: (e) => {
      setConfirmOpen(false);
      notify.error(getErrorMessage(e, "Import failed"));
    },
  });

  const handleErrorReport = async () => {
    if (!file || !target) return;
    try {
      const blob = await studentImportApi.errorReport(file, target);
      downloadBlob(blob, "student-import-errors.xlsx");
    } catch (e) {
      notify.error(getErrorMessage(e, "Failed to download error report"));
    }
  };

  if (isLoading) return <PageLoader text="Loading..." />;

  // ───────────────────────── done ─────────────────────────
  if (stage === "done" && result) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 text-xl font-semibold text-text-primary">
          Import complete
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {result.imported} students were added and enrolled for{" "}
          {result.academicYear}.
        </p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
          <Stat label="Imported" value={result.imported} tone="success" />
          <Stat
            label="Invalid (skipped)"
            value={result.invalid}
            tone="danger"
          />
          <Stat
            label="Duplicate (skipped)"
            value={result.duplicate}
            tone="warn"
          />
        </div>

        <Button
          onClick={reset}
          className="mt-8 h-11 rounded-lg bg-primary px-6 text-primary-foreground hover:bg-primary-hover"
        >
          Import another file
        </Button>
      </div>
    );
  }

  // ───────────────────────── review ─────────────────────────
  if (stage === "review" && validation) {
    const { summary, rows } = validation;
    const problems = summary.invalid + summary.duplicate;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Total rows" value={summary.total} />
          <Stat label="Valid" value={summary.valid} tone="success" />
          <Stat label="Invalid" value={summary.invalid} tone="danger" />
          <Stat label="Duplicate" value={summary.duplicate} tone="warn" />
        </div>

        {problems > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {problems} row{problems === 1 ? "" : "s"} will be skipped.
              Download the error report, fix them, and import again later, or
              continue with the {summary.valid} valid rows.
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <ImportPreviewTable rows={rows} />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setStage("setup")}
            className="h-11 rounded-lg border-border px-5"
          >
            Back
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {problems > 0 && (
              <Button
                variant="outline"
                onClick={handleErrorReport}
                className="h-11 rounded-lg border-border px-5"
              >
                <Download className="mr-2 h-4 w-4" />
                Download error report
              </Button>
            )}

            <Button
              disabled={summary.valid === 0}
              onClick={() => setConfirmOpen(true)}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover disabled:opacity-60"
            >
              Import {summary.valid} students
            </Button>
          </div>
        </div>

        <Dialog
          open={confirmOpen}
          onOpenChange={(o) => !commitMutation.isPending && setConfirmOpen(o)}
        >
          <DialogContent className="rounded-xl border-border bg-surface sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-text-primary">
                Import {summary.valid} students?
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                They will be added to {year?.label} and enrolled in their
                sections.
                {problems > 0 &&
                  ` ${problems} invalid/duplicate rows will be skipped.`}{" "}
                This cannot be undone in bulk.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                disabled={commitMutation.isPending}
                onClick={() => setConfirmOpen(false)}
                className="h-10 rounded-lg border-border"
              >
                Cancel
              </Button>
              <Button
                disabled={commitMutation.isPending}
                onClick={() => commitMutation.mutate()}
                className="h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                {commitMutation.isPending ? "Importing..." : "Confirm import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ───────────────────────── setup ─────────────────────────
  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <StepHeading n={1} title="Choose where students go" />

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-primary">
              Academic year
            </Label>
            <Select
              value={academicYearId}
              onValueChange={(v) => {
                setAcademicYearId(v);
                setClassId("");
                setSectionId("");
              }}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select academic year">
                  {(v: string) =>
                    options?.academicYears.find((y) => y.id === v)?.label ??
                    "Select academic year"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {options?.academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.label}
                    {y.isActive ? " (active)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-primary">
              Class
            </Label>
            <Select
              value={classId}
              disabled={!academicYearId || multiClass}
              onValueChange={(v) => {
                setClassId(v);
                setSectionId("");
              }}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select class">
                  {(v: string) =>
                    classOptions.find((c) => c.id === v)?.name ?? "Select class"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-primary">
              Section
            </Label>
            <Select
              value={sectionId}
              disabled={!classId || multiClass}
              onValueChange={setSectionId}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select section">
                  {(v: string) =>
                    sectionOptions.find((s) => s.id === v)?.name ??
                    "Select section"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={multiClass}
            onChange={(e) => setMultiClass(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          This workbook contains multiple classes (Class and Section required on
          every row)
        </label>

        {options?.academicYears.length === 0 && (
          <p className="mt-4 text-sm text-text-muted">
            No academic years found. Create an academic year, classes and
            sections first.
          </p>
        )}
      </section>

      {/* Step 2 */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <StepHeading n={2} title="Download the Excel template" />
        <p className="mt-2 text-sm text-text-secondary">
          Fill one student per row. Admission No and First Name are required.
          Dates use DD/MM/YYYY. Up to 2,000 students per file.
        </p>
        <Button
          variant="outline"
          disabled={!targetReady || downloading}
          onClick={handleTemplate}
          className="mt-4 h-11 rounded-lg border-border px-5"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {downloading ? "Preparing..." : "Download template"}
        </Button>
      </section>

      {/* Step 3 */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <StepHeading n={3} title="Upload the completed file" />

        <Input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-4 h-11 max-w-md rounded-lg border-border bg-surface-secondary/50"
        />

        <Button
          disabled={!file || !targetReady || validateMutation.isPending}
          onClick={() => validateMutation.mutate()}
          className="mt-4 h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover disabled:opacity-60"
        >
          <Upload className="mr-2 h-4 w-4" />
          {validateMutation.isPending ? "Validating..." : "Validate & preview"}
        </Button>
      </section>
    </div>
  );
}

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {n}
      </span>
      <h3 className="font-semibold text-text-primary">{title}</h3>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "danger" | "warn";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-red-600"
        : tone === "warn"
          ? "text-amber-600"
          : "text-text-primary";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-left shadow-sm">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${color}`}>
        {value}
      </p>
    </div>
  );
}
