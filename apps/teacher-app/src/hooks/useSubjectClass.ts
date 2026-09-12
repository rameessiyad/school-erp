import { useQuery } from "@tanstack/react-query";
import { subjectClassApi } from "../api/subjectClass.api";

export function useSubjectClass(allocationId: string) {
  return useQuery({
    queryKey: ["subject-class", allocationId],
    queryFn: () => subjectClassApi.getByAllocation(allocationId),
    enabled: !!allocationId,
  });
}
