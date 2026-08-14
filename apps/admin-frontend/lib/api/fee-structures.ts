import { apiClient } from "../axios/client";
import {
  CreateFeeStructureValues,
  FeeStructure,
} from "../validations/fee-structure";

export const feeStructureApi = {
  list: async (): Promise<FeeStructure[]> => {
    const { data } = await apiClient.get("/fee-structure");
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/fee-structure/${id}`);
    return data;
  },

  create: async (payload: Partial<CreateFeeStructureValues>) => {
    const { data } = await apiClient.post("/fee-structure/create", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateFeeStructureValues>,
  ): Promise<FeeStructure> => {
    const { data } = await apiClient.patch(`/fee-structure/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/fee-structure/${id}`);
    return data;
  },

  deactivate: async (id: string) => {
    const { data } = await apiClient.patch(`/fee-structure/${id}/deactivate`);
    return data;
  },
};
