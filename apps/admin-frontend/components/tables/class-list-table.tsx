"use client";

import Link from "next/link";
import { SchoolClass } from "@/lib/validations/class";
import { ClassesRow } from "@/components/classes/classes-row-actions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ClassListTableProps {
  classes: SchoolClass[];
  isSearching?: boolean;
  searchTerm?: string;
}

export function ClassListTable({
  classes,
  isSearching = false,
  searchTerm = "",
}: ClassListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Sections</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {classes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="py-12 text-center">
              {isSearching ? (
                <p className="text-sm text-text-muted">
                  No classes match &quot;{searchTerm}&quot;.
                </p>
              ) : (
                <div className="mx-auto flex max-w-sm flex-col items-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <span className="text-lg font-semibold">+</span>
                  </div>

                  <p className="font-medium text-text-primary">
                    No classes yet
                  </p>

                  <p className="mt-1 text-sm text-text-muted">
                    Add your first class to get started.
                  </p>

                  <Link
                    href="/dashboard/classes/new"
                    className="mt-4 text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    Add Class →
                  </Link>
                </div>
              )}
            </TableCell>
          </TableRow>
        ) : (
          classes.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                    {c.name.slice(0, 1).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-muted">School class</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {c.sections && c.sections.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {[...c.sections]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((s) => (
                        <Link
                          key={s.id}
                          href={`/dashboard/sections/${s.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-secondary/50 text-sm font-semibold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary"
                        >
                          {s.name}
                        </Link>
                      ))}
                  </div>
                ) : (
                  <Link
                    href={`/dashboard/classes/${c.id}/edit`}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-dashed border-border px-2.5 text-xs font-medium text-text-muted transition hover:border-primary hover:bg-primary-soft hover:text-primary"
                  >
                    + Add Section
                  </Link>
                )}
              </TableCell>

              <TableCell className="text-right">
                <ClassesRow classId={c.id} className={c.name} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
