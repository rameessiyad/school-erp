import { cn } from "@/lib/utils";
import { examStatuses } from "@/lib/validations/exam";

const statusStyles: Record<(typeof examStatuses)[number], string> = {
  DRAFT: "bg-surface-secondary text-text-secondary",
  PUBLISHED: "bg-primary-soft text-primary",
  COMPLETED: "bg-success-soft text-success",
};

export function ExamStatusBadge({
  status,
}: {
  status: (typeof examStatuses)[number];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
