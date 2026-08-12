import { apiClient } from "@/lib/axios/client";
import { CreateStudentValues, Student } from "@/lib/validations/student";

interface EnrollmentPayload {
  sectionId: string;
  academicYearId: string;
  rollNo?: string;
}

export const studentsApi = {
  list: async (): Promise<Student[]> => {
    const { data } = await apiClient.get("/student");
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/student/${id}`);
    return data;
  },

  create: async (payload: Partial<CreateStudentValues>): Promise<Student> => {
    const { data } = await apiClient.post("/student/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateStudentValues>,
  ): Promise<Student> => {
    const { data } = await apiClient.patch(`/student/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/student/${id}`);
    return data;
  },

  createEnrollment: async (studentId: string, payload: EnrollmentPayload) => {
    const { data } = await apiClient.post(
      `/student/${studentId}/enrollment/create`,
      payload,
    );
    return data;
  },

  getEnrollment: async (studentId: string, academicYearId?: string) => {
    const { data } = await apiClient.get(`/student/${studentId}/enrollment`, {
      params: academicYearId ? { academicYearId } : undefined,
    });
    return data;
  },
};
