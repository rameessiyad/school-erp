import { apiClient } from "@/lib/axios/client";
import { CreateStudentValues, Student } from "@/lib/validations/student";

function buildStudentFormData(
  values: Partial<CreateStudentValues>,
  photo?: File | null,
): FormData {
  const formData = new FormData();

  if (values.firstName !== undefined)
    formData.append("firstName", values.firstName ?? "");
  if (values.lastName !== undefined)
    formData.append("lastName", values.lastName ?? "");
  if (values.admissionNo !== undefined)
    formData.append("admissionNo", values.admissionNo ?? "");
  if (values.admissionDate !== undefined)
    formData.append("admissionDate", values.admissionDate ?? "");
  if (values.gender !== undefined)
    formData.append("gender", values.gender ?? "");
  if (values.dob !== undefined) formData.append("dob", values.dob ?? "");
  if (values.bloodGroup !== undefined)
    formData.append("bloodGroup", values.bloodGroup ?? "");
  if (values.classId !== undefined)
    formData.append("classId", values.classId ?? "");
  if (values.rollNo !== undefined)
    formData.append("rollNo", values.rollNo ?? "");
  if (values.sectionId !== undefined)
    formData.append("sectionId", values.sectionId ?? "");
  if (values.academicYearId !== undefined)
    formData.append("academicYearId", values.academicYearId ?? "");

  if (photo) {
    formData.append("photo", photo);
  }

  return formData;
}

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

  listUnassigned: async (): Promise<Student[]> => {
    const { data } = await apiClient.get("/student/unassigned");
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/student/${id}`);
    return data;
  },

  create: async (
    values: CreateStudentValues,
    photo?: File | null,
  ): Promise<Student> => {
    const formData = buildStudentFormData(values, photo);
    const { data } = await apiClient.post("/student/create", formData);
    return data;
  },

  update: async (
    id: string,
    values: Partial<CreateStudentValues>,
    photo?: File | null,
  ): Promise<Student> => {
    const formData = buildStudentFormData(values, photo);
    const { data } = await apiClient.patch(`/student/${id}`, formData);
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
