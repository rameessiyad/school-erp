"use client";

import Image from "next/image";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StaffRowActions } from "@/components/staff/staff-row-actions";
import { Staff } from "@/lib/validations/staff";

interface StaffTableProps {
  staff: Staff[];
}

export function StaffTable({ staff }: StaffTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {staff.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-12 text-center text-text-muted"
            >
              No staff members yet.
            </TableCell>
          </TableRow>
        ) : (
          staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {s.photoUrl ? (
                    <Image
                      src={s.photoUrl}
                      alt={`${s.firstName} ${s.lastName ?? ""}`}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                      {s.firstName?.[0]?.toUpperCase() ?? ""}
                      {s.lastName?.[0]?.toUpperCase() ?? ""}
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-text-primary">
                      {s.firstName} {s.lastName ?? ""}
                    </p>
                    <p className="text-xs text-text-muted">Staff member</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-text-secondary">{s.email}</TableCell>

              <TableCell className="text-text-secondary">
                {s.phone ?? "—"}
              </TableCell>

              <TableCell>
                <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium capitalize text-text-secondary">
                  {s.designation.replace(/_/g, " ")}
                </span>
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.isActive
                      ? "bg-success-soft text-success"
                      : "bg-surface-secondary text-text-muted"
                  }`}
                >
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <StaffRowActions
                  staffId={s.id}
                  staffName={`${s.firstName} ${s.lastName ?? ""}`}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
