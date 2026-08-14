import { apiClient } from "@/lib/axios/client";
import { CreateTeacherValues, Teacher } from "@/lib/validations/teacher";

function buildTeacherFormData(
  values: Partial<CreateTeacherValues>,
  photo?: File | null,
): FormData {
  const formData = new FormData();

  if (values.firstName !== undefined)
    formData.append("firstName", values.firstName);
  if (values.lastName !== undefined)
    formData.append("lastName", values.lastName ?? "");
  if (values.email !== undefined) formData.append("email", values.email);
  if (values.phone !== undefined) formData.append("phone", values.phone ?? "");
  if (values.password !== undefined)
    formData.append("password", values.password);
  if (values.employeeId !== undefined)
    formData.append("employeeId", values.employeeId ?? "");
  if (values.gender !== undefined)
    formData.append("gender", values.gender ?? "");
  if (values.dob !== undefined) formData.append("dob", values.dob ?? "");
  if (values.qualification !== undefined)
    formData.append("qualification", values.qualification ?? "");
  if (values.experience !== undefined) {
    formData.append("experience", String(values.experience));
  }
  if (values.joiningDate !== undefined)
    formData.append("joiningDate", values.joiningDate ?? "");

  if (photo) {
    formData.append("photo", photo);
  }

  if (values.allocations !== undefined) {
    formData.append("allocations", JSON.stringify(values.allocations ?? []));
  }

  return formData;
}

export const teachersApi = {
  list: async (): Promise<Teacher[]> => {
    const { data } = await apiClient.get("/teacher");
    return data;
  },

  get: async (id: string): Promise<Teacher> => {
    const { data } = await apiClient.get(`/teacher/${id}`);
    return data;
  },

  create: async (
    values: CreateTeacherValues,
    photo?: File | null,
  ): Promise<Teacher> => {
    const formData = buildTeacherFormData(values, photo);
    const { data } = await apiClient.post("/teacher/create", formData);
    return data;
  },

  update: async (
    id: string,
    values: Partial<CreateTeacherValues>,
    photo?: File | null,
  ): Promise<Teacher> => {
    const formData = buildTeacherFormData(values, photo);
    const { data } = await apiClient.patch(`/teacher/${id}`, formData);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/teacher/${id}`);
    return data;
  },
};
