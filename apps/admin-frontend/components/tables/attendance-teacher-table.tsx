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
import { AttendanceTeacher } from "@/lib/validations/teacher-attendance";

interface AttendanceTeacherTableProps {
  teachers: AttendanceTeacher[];
  isSearching?: boolean;
  searchTerm?: string;
}

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-success-soft text-success",
  ABSENT: "bg-error-soft text-error",
  HALF_DAY: "bg-warning-soft text-warning",
  LATE: "bg-warning-soft text-warning",
};

export function AttendanceTeacherTable({
  teachers,
  isSearching = false,
  searchTerm = "",
}: AttendanceTeacherTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Teacher</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {teachers.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={2}
              className="py-12 text-center text-text-muted"
            >
              {isSearching
                ? `No teachers match "${searchTerm}".`
                : "No teachers found."}
            </TableCell>
          </TableRow>
        ) : (
          teachers.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {t.photoUrl ? (
                      <Image
                        src={t.photoUrl}
                        alt={t.firstName}
                        className="h-full w-full object-cover"
                        width={36}
                        height={36}
                      />
                    ) : (
                      <>
                        {t.firstName.slice(0, 1).toUpperCase()}
                        {t.lastName?.slice(0, 1).toUpperCase() ?? ""}
                      </>
                    )}
                  </div>
                  <p className="font-medium text-text-primary">
                    {t.firstName} {t.lastName ?? ""}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {t.status ? (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[t.status] ??
                      "bg-surface-secondary text-text-muted"
                    }`}
                  >
                    {t.status.replace("_", " ")}
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
