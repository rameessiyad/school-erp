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
import { AttendanceStaff } from "@/lib/validations/staff-attendance";

interface AttendanceStaffTableProps {
  staff: AttendanceStaff[];
  isSearching?: boolean;
  searchTerm?: string;
}

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-success-soft text-success",
  ABSENT: "bg-error-soft text-error",
  HALF_DAY: "bg-warning-soft text-warning",
  LATE: "bg-warning-soft text-warning",
};

export function AttendanceStaffTable({
  staff,
  isSearching = false,
  searchTerm = "",
}: AttendanceStaffTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {staff.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={2}
              className="py-12 text-center text-text-muted"
            >
              {isSearching
                ? `No staff match "${searchTerm}".`
                : "No staff found."}
            </TableCell>
          </TableRow>
        ) : (
          staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {s.photoUrl ? (
                      <Image
                        src={s.photoUrl}
                        alt={s.firstName}
                        className="h-full w-full object-cover"
                        width={36}
                        height={36}
                      />
                    ) : (
                      <>
                        {s.firstName.slice(0, 1).toUpperCase()}
                        {s.lastName?.slice(0, 1).toUpperCase() ?? ""}
                      </>
                    )}
                  </div>
                  <p className="font-medium text-text-primary">
                    {s.firstName} {s.lastName ?? ""}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {s.status ? (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[s.status] ??
                      "bg-surface-secondary text-text-muted"
                    }`}
                  >
                    {s.status.replace("_", " ")}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-muted">
                    Not marked
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
