import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentAttendanceApi } from "../api/studentAttendance.api";
import { MarkStudentAttendancePayload } from "../types/studentAttendance";

export function useMyClassStudents(date: string) {
  return useQuery({
    queryKey: ["student-attendance", "my-class", date],
    queryFn: () => studentAttendanceApi.getMyClass(date),
    retry: false, // a 404 here just means "not a class teacher" — don't retry it
  });
}

export function useMarkStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkStudentAttendancePayload) =>
      studentAttendanceApi.mark(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["student-attendance", "my-class", variables.date],
      });
    },
  });
}
