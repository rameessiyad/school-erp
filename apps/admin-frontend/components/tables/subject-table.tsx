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
import { Subject } from "@/lib/validations/subject";
import { SubjectRowActions } from "../subjects/subject-row-actions";

interface TeacherTableProps {
  subjects: Subject[];
}

export function SubjectTable({ subjects }: TeacherTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Code</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {subjects.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-12 text-center text-text-muted"
            >
              No subjects yet.
            </TableCell>
          </TableRow>
        ) : (
          subjects.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  {s.name}
                </div>
              </TableCell>

              <TableCell className="text-text-secondary">
                {s.code ? s.code : "N/A"}
              </TableCell>

              <TableCell className="text-right">
                <SubjectRowActions subjectId={s.id} subjectName={s.name} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
