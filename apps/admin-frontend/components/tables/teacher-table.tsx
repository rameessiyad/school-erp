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
import { TeacherRowActions } from "@/components/teachers/teacher-row-actions";
import { Teacher } from "@/lib/validations/teacher";

interface TeacherTableProps {
  teachers: Teacher[];
}

export function TeacherTable({ teachers }: TeacherTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Teacher</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Qualification</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {teachers.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-12 text-center text-text-muted"
            >
              No teachers yet.
            </TableCell>
          </TableRow>
        ) : (
          teachers.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {t.photoUrl ? (
                    <Image
                      src={t.photoUrl}
                      alt={`${t.firstName} ${t.lastName ?? ""}`}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                      {t.firstName.slice(0, 1).toUpperCase()}
                      {t.lastName?.slice(0, 1).toUpperCase() ?? ""}
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-text-primary">
                      {t.firstName} {t.lastName ?? ""}
                    </p>
                    <p className="text-xs text-text-muted">Teacher</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-text-secondary">{t.email}</TableCell>

              <TableCell>
                {t.employeeId ? (
                  <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                    {t.employeeId}
                  </span>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </TableCell>

              <TableCell className="text-text-secondary">
                {t.qualification ?? "—"}
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    t.isActive
                      ? "bg-success-soft text-success"
                      : "bg-surface-secondary text-text-muted"
                  }`}
                >
                  {t.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <TeacherRowActions
                  teacherId={t.id}
                  teacherName={`${t.firstName} ${t.lastName ?? ""}`}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
