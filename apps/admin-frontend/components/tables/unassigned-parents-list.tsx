"use client";

import { Parent } from "@/lib/validations/parent";
import { ParentRowActions } from "@/components/parents/parent-row-actions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface UnassignedParentsTableProps {
  parents: Parent[];
  isSearching?: boolean;
  searchTerm?: string;
}

export function UnassignedParentsTable({
  parents,
  isSearching = false,
  searchTerm = "",
}: UnassignedParentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Parent</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Occupation</TableHead>
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
                : "No unassigned parents."}
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

              <TableCell className="text-text-secondary">
                {p.occupation ?? "—"}
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
