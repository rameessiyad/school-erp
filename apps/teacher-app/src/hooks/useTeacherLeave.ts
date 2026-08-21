import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveApi, ApplyLeavePayload } from "../api/leave.api";

export function useMyLeaveApplications() {
  return useQuery({
    queryKey: ["leave", "mine"],
    queryFn: () => leaveApi.findMine(),
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyLeavePayload) => leaveApi.apply(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave"] });
    },
  });
}
