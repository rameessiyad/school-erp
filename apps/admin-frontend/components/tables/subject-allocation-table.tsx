"use client";

import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { SubjectTeacherAllocation } from "@/lib/validations/subject";

interface SubjectAllocationsTableProps {
  allocations: SubjectTeacherAllocation[];
}

export function SubjectAllocationsTable({
  allocations,
}: SubjectAllocationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Academic Year</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {allocations.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="py-12 text-center text-text-muted"
            >
              No classes assigned.
            </TableCell>
          </TableRow>
        ) : (
          allocations.map((allocation) => {
            const teacherName = `${allocation.teacher.firstName} ${
              allocation.teacher.lastName ?? ""
            }`.trim();

            return (
              <TableRow key={allocation.id}>
                <TableCell className="font-medium text-text-primary">
                  {allocation.section.class.name}
                </TableCell>

                <TableCell className="text-text-secondary">
                  {allocation.section.name}
                </TableCell>

                <TableCell>
                  <Link
                    href={`/dashboard/teachers/${allocation.teacher.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {teacherName}
                  </Link>
                </TableCell>

                <TableCell className="text-text-secondary">
                  {allocation.academicYear.label}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
