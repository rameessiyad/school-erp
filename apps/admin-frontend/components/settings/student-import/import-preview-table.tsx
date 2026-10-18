"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportRow, ImportRowStatus } from "@/lib/validations/student-import";

const PAGE = 100;

const BADGE: Record<ImportRowStatus, string> = {
  VALID: "bg-success-soft text-success",
  INVALID: "bg-red-100 text-red-700",
  DUPLICATE: "bg-amber-100 text-amber-700",
};

type Filter = "ALL" | ImportRowStatus;

export function ImportPreviewTable({ rows }: { rows: ImportRow[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [visible, setVisible] = useState(PAGE);

  const count = (s: ImportRowStatus) =>
    rows.filter((r) => r.status === s).length;

  const tabs: { key: Filter; label: string; n: number }[] = [
    { key: "ALL", label: "All", n: rows.length },
    { key: "VALID", label: "Valid", n: count("VALID") },
    { key: "INVALID", label: "Invalid", n: count("INVALID") },
    { key: "DUPLICATE", label: "Duplicate", n: count("DUPLICATE") },
  ];

  const filtered = rows.filter((r) => filter === "ALL" || r.status === filter);
  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border px-6 py-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setFilter(t.key);
              setVisible(PAGE);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              filter === t.key
                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                : "border-border bg-surface text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-text-muted">{t.n}</span>
          </button>
        ))}
      </div>

      <div className="max-h-[520px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Class / Section</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-text-muted"
                >
                  No rows in this view.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((r) => (
                <TableRow key={r.rowNumber}>
                  <TableCell className="text-text-muted">
                    {r.rowNumber}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${BADGE[r.status]}`}
                    >
                      {r.status.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-text-primary">
                    {r.admissionNo || "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {`${r.firstName} ${r.lastName}`.trim() || "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {r.gender || "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {r.dob || "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {r.className && r.sectionName
                      ? `${r.className} - ${r.sectionName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="min-w-64">
                    {r.errors.length === 0 ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      <ul className="space-y-0.5 text-xs text-red-600">
                        {r.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > visible && (
        <div className="border-t border-border p-4 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisible((v) => v + PAGE)}
            className="rounded-lg border-border"
          >
            Show more ({filtered.length - visible} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
