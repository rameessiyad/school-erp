"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ExamStatusBadge } from "@/components/exams/exam-status-badge";
import { ExamRowActions } from "@/components/exams/exam-row-actions";
import { Exam } from "@/lib/validations/exam";

interface ExamTableProps {
  exams: Exam[];
  isSearching?: boolean;
  searchTerm?: string;
}

export function ExamTable({
  exams,
  isSearching = false,
  searchTerm = "",
}: ExamTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exam</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {exams.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-12 text-center text-text-muted"
            >
              {isSearching
                ? `No exams match "${searchTerm}".`
                : "No exams created yet."}
            </TableCell>
          </TableRow>
        ) : (
          exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium text-text-primary">
                {exam.name}
              </TableCell>

              <TableCell className="text-text-secondary capitalize">
                {exam.examType.toLowerCase()}
              </TableCell>

              <TableCell className="text-text-secondary">
                {exam.academicYear?.label ?? "—"}
              </TableCell>

              <TableCell className="text-text-secondary">
                {new Date(exam.startDate).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-text-secondary">
                {new Date(exam.endDate).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <ExamStatusBadge status={exam.status} />
              </TableCell>

              <TableCell className="text-right">
                <ExamRowActions examId={exam.id} examName={exam.name} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
