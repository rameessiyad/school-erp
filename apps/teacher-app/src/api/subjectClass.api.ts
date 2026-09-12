import { apiClient } from "./client";
import { SubjectClassResponse } from "../types/subjectClass";

export const subjectClassApi = {
  async getByAllocation(allocationId: string) {
    const { data } = await apiClient.get<SubjectClassResponse>(
      `/teacher/allocation/${allocationId}/students`,
    );
    return data;
  },
};
