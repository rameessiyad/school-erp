import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "../api/teacher.api";

export function useTeacherProfile() {
  return useQuery({
    queryKey: ["teacher", "me"],
    queryFn: () => teacherApi.getMe(),
    staleTime: 1000 * 60 * 5, // profile rarely changes mid-session, cache 5min
  });
}
