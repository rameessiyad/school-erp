import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance.api";
import { TeacherAttendanceStatus } from "../types/attendance";
import { todayISODate } from "../lib/date";

export function useTodayAttendance() {
  const today = todayISODate();
  return useQuery({
    queryKey: ["attendance", "today", today],
    queryFn: () => attendanceApi.findMine(today, today),
    select: (records) => records[0] ?? null,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: TeacherAttendanceStatus) => attendanceApi.mark(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
