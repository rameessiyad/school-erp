"use client";

import { SectionStudent } from "@/lib/validations/section";
import { StudentRowActions } from "@/components/students/student-row-actions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Image from "next/image";

interface SectionStudentsTableProps {
  students: SectionStudent[];
  isSearching?: boolean;
  searchTerm?: string;
}

export function SectionStudentsTable({
  students,
  isSearching = false,
  searchTerm = "",
}: SectionStudentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Roll No.</TableHead>
          <TableHead>Admission No.</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-12 text-center text-text-muted"
            >
              {isSearching
                ? `No students match "${searchTerm}".`
                : "No students enrolled in this section yet."}
            </TableCell>
          </TableRow>
        ) : (
          students.map((s) => (
            <TableRow key={s.enrollmentId}>
              <TableCell className="text-text-secondary">
                {s.rollNo ?? "—"}
              </TableCell>

              <TableCell>
                <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {s.admissionNo}
                </span>
              </TableCell>

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

              <TableCell className="text-text-secondary">
                {s.gender ?? "—"}
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
                <StudentRowActions
                  studentId={s.id}
                  studentName={`${s.firstName} ${s.lastName ?? ""}`}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
