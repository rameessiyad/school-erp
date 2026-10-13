import { apiClient } from "../axios/client";
import {
  CreateSchoolValues,
  School,
  SchoolStatus,
  UpdateSchoolModulesValues,
  UpdateSchoolValues,
} from "../validations/school";

const BASE = "/super-admin/schools";

export const schoolsApi = {
  list: async (status?: SchoolStatus): Promise<School[]> => {
    const { data } = await apiClient.get<School[]>(BASE, {
      params: status ? { status } : undefined,
    });
    return data;
  },

  get: async (id: string): Promise<School> => {
    const { data } = await apiClient.get<School>(`${BASE}/${id}`);
    return data;
  },

  availableModules: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>(`${BASE}/modules/available`);
    return data;
  },

  create: async (payload: CreateSchoolValues) => {
    const { data } = await apiClient.post(`${BASE}/create`, payload);
    return data;
  },

  update: async (id: string, payload: UpdateSchoolValues) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data;
  },

  updateModules: async (id: string, payload: UpdateSchoolModulesValues) => {
    const { data } = await apiClient.patch(`${BASE}/${id}/modules`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`${BASE}/${id}`);
    return data;
  },
};
