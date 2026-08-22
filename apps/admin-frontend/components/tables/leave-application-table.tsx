import { format } from "date-fns";
import { UserRound, Eye } from "lucide-react";
import Image from "next/image";
import { UnifiedLeaveApplication } from "@/lib/api/leave-unified";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface LeaveApplicationTableProps {
  leaves: UnifiedLeaveApplication[];
  onView: (leave: UnifiedLeaveApplication) => void;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-surface-secondary text-text-secondary",
  APPROVED: "bg-success-soft text-success",
  REJECTED: "bg-error-soft text-error",
};

export function LeaveApplicationTable({
  leaves,
  onView,
}: LeaveApplicationTableProps) {
  if (leaves.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-text-muted">
        No leave applications found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaves.map((leave) => (
          <TableRow key={`${leave.source}-${leave.id}`}>
            <TableCell>
              <div className="flex items-center gap-3">
                {leave.person.photoUrl ? (
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
                    <Image
                      src={leave.person.photoUrl}
                      alt={leave.person.firstName}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary">
                    <UserRound className="h-4 w-4 text-text-muted" />
                  </div>
                )}
                <span className="text-sm font-medium text-text-primary">
                  {leave.person.firstName} {leave.person.lastName}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                {leave.source === "TEACHER" ? "Teaching" : "Non-Teaching"}
              </span>
            </TableCell>
            <TableCell className="text-sm text-text-secondary">
              {format(new Date(leave.fromDate), "dd MMM")} –{" "}
              {format(new Date(leave.toDate), "dd MMM yyyy")}
            </TableCell>
            <TableCell>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[leave.status]}`}
              >
                {leave.status}
              </span>
            </TableCell>
            <TableCell className="text-sm text-text-muted">
              {format(new Date(leave.appliedAt), "dd MMM yyyy")}
            </TableCell>
            <TableCell className="text-right">
              <button
                type="button"
                onClick={() => onView(leave)}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
