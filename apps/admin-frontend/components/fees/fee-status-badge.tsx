const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PARTIALLY_PAID: "bg-blue-50 text-blue-700",
  PAID: "bg-green-50 text-green-700",
  OVERDUE: "bg-red-50 text-red-700",
  WAIVED: "bg-slate-100 text-slate-500",
};

export function FeeStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
