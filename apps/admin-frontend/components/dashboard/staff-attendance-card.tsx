"use client";

import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { staffAttendanceApi } from "@/lib/api/staff-attendance";
import { notify } from "@/lib/toast";
import { getErrorMessage } from "@/lib/api/error";
import { StaffAttendanceStatus } from "@/lib/validations/staff-attendance";

export function StaffAttendanceCard() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: myAttendance, isLoading } = useQuery({
    queryKey: ["staff-attendance-mine", today],
    queryFn: () => staffAttendanceApi.getMine({ from: today, to: today }),
  });

  const todaysRecord = myAttendance?.find(
    (r) => format(new Date(r.date), "yyyy-MM-dd") === today,
  );

  const markMutation = useMutation({
    mutationFn: (status: StaffAttendanceStatus) =>
      staffAttendanceApi.mark({ status, date: today }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["staff-attendance-mine"] });
      notify.success(
        status === "PRESENT"
          ? "Marked as present for today"
          : "Marked as absent for today",
      );
    },
    onError: (err) => {
      notify.error(getErrorMessage(err, "Failed to mark attendance"));
    },
  });

  if (isLoading) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <CalendarCheck className="h-4 w-4 text-primary" />
          Today&apos;s Attendance
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {format(new Date(), "EEEE, MMM d")}
        </p>
      </div>

      <div className="mt-4">
        {todaysRecord ? (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
              todaysRecord.status === "PRESENT"
                ? "bg-success-soft text-success"
                : "bg-error-soft text-error"
            }`}
          >
            {todaysRecord.status === "PRESENT" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            You marked yourself as {todaysRecord.status.toLowerCase()} today
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => markMutation.mutate("PRESENT")}
              disabled={markMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 cursor-pointer rounded-lg bg-success-soft px-4 py-2.5 text-sm font-medium text-success transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Present
            </button>

            <button
              type="button"
              onClick={() => markMutation.mutate("ABSENT")}
              disabled={markMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 cursor-pointer rounded-lg bg-error-soft px-4 py-2.5 text-sm font-medium text-error transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Absent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
