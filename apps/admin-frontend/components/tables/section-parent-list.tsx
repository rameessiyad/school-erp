"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ParentRowActions } from "@/components/parents/parent-row-actions";
import { Parent } from "@/lib/validations/parent";

interface SectionParentsTableProps {
  parents: Parent[];
  isSearching?: boolean;
  searchTerm?: string;
}

export function SectionParentsTable({
  parents,
  isSearching = false,
  searchTerm = "",
}: SectionParentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Parent</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Linked Student(s)</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {parents.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-12 text-center text-text-muted"
            >
              {isSearching
                ? `No parents match "${searchTerm}".`
                : "No parents linked to students in this section yet."}
            </TableCell>
          </TableRow>
        ) : (
          parents.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {p.firstName.slice(0, 1).toUpperCase()}
                    {p.lastName?.slice(0, 1).toUpperCase() ?? ""}
                  </div>

                  <p className="font-medium text-text-primary">
                    {p.firstName} {p.lastName ?? ""}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-text-secondary">
                {p.email ?? "—"}
              </TableCell>

              <TableCell className="text-text-secondary">
                {p.phone ?? "—"}
              </TableCell>

              <TableCell>
                {p.parentStudents?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {p.parentStudents.map((ps) => (
                      <span
                        key={ps.studentId}
                        className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {ps.student.firstName} {ps.student.lastName ?? ""}{" "}
                        <span className="opacity-70">
                          ({ps.relationship}
                          {ps.isPrimary ? ", primary" : ""})
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </TableCell>

              <TableCell className="text-right">
                <ParentRowActions
                  parentId={p.id}
                  parentName={`${p.firstName} ${p.lastName ?? ""}`}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
