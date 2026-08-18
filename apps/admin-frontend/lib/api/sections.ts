import { apiClient } from "../axios/client";
import {
  ClassTeacher,
  CreateSectionValues,
  Section,
  SectionAllocationDetails,
  SectionDetails,
  SectionParentDetails,
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

  assignClassTeacher: async (
    sectionId: string,
    payload: { teacherId: string; academicYearId: string },
  ) => {
    const { data } = await apiClient.post(
      `/section/${sectionId}/class-teacher/create`,
      payload,
    );
    return data;
  },

  getClassTeacher: async (
    sectionId: string,
    academicYearId: string,
  ): Promise<ClassTeacher> => {
    const { data } = await apiClient.get(
      `/section/${sectionId}/class-teacher`,
      { params: { academicYearId } },
    );
    return data;
  },

  getAllocations: async (
    sectionId: string,
  ): Promise<SectionAllocationDetails> => {
    const { data } = await apiClient.get(
      `/section/${sectionId}/subject-allocations`,
    );
    return data;
  },

  getParents: async (id: string): Promise<SectionParentDetails> => {
    const { data } = await apiClient.get(`/section/${id}/parents`);
    return data;
  },
};
