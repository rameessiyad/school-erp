import { apiClient } from "../axios/client";
import {
  CreateSectionValues,
  Section,
  SectionDetails,
} from "../validations/section";

export const sectionsApi = {
  list: async (): Promise<Section[]> => {
    const { data } = await apiClient.get("/section");
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/section/${id}`);
    return data;
  },

  create: async (payload: Partial<CreateSectionValues>) => {
    const { data } = await apiClient.post("/section/create", payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateSectionValues>) => {
    const { data } = await apiClient.patch(`/section/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/section/${id}`);
    return data;
  },

  getDetails: async (id: string): Promise<SectionDetails> => {
    const { data } = await apiClient.get(`/section/${id}/details`);
    return data;
  },
};
