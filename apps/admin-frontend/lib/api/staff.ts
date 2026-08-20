import { apiClient } from "@/lib/axios/client";
import { CreateStaffValues, Staff } from "@/lib/validations/staff";

function buildStaffFormData(
  values: Partial<CreateStaffValues>,
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
  if (values.designation !== undefined)
    formData.append("designation", values.designation);

  if (photo) {
    formData.append("photo", photo);
  }

  return formData;
}

export const staffApi = {
  list: async (): Promise<Staff[]> => {
    const { data } = await apiClient.get("/staff");
    return data;
  },

  get: async (id: string): Promise<Staff> => {
    const { data } = await apiClient.get(`/staff/${id}`);
    return data;
  },

  create: async (
    values: CreateStaffValues,
    photo?: File | null,
  ): Promise<Staff> => {
    const formData = buildStaffFormData(values, photo);
    const { data } = await apiClient.post("/staff/create", formData);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateStaffValues>,
    photo?: File | null,
  ): Promise<Staff> => {
    const formData = buildStaffFormData(payload, photo);
    const { data } = await apiClient.patch(`/staff/${id}`, formData);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/staff/${id}`);
    return data;
  },
};
