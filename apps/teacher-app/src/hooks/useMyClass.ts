import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  myClassApi,
  AttendanceStatus,
  AttendanceStudent,
  MarkAttendancePayload,
} from "../api/my-class.api";

export type { AttendanceStatus, AttendanceStudent, MarkAttendancePayload };

export function useMyClass() {
  return useQuery({
    queryKey: ["my-class"],
    queryFn: () => myClassApi.getMyClass(),
    staleTime: 1000 * 60 * 5, // section assignment rarely changes mid-session
  });
}

export function useMyClassStudents() {
  return useQuery({
    queryKey: ["my-class", "students"],
    queryFn: () => myClassApi.getStudents(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAttendanceForDate(date: string) {
  return useQuery({
    queryKey: ["my-class", "attendance", date],
    queryFn: () => myClassApi.getAttendanceForDate(date),
    enabled: !!date,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) =>
      myClassApi.markAttendance(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["my-class", "attendance", variables.date],
      });
    },
  });
}
