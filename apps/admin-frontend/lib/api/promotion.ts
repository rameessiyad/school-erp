import { apiClient } from "../axios/client";

export interface PromotionPreviewItem {
  fromSectionId: string;
  fromSectionLabel: string;
  studentCount: number;
  isGraduating: boolean;
  suggestedToSectionId: string | null;
  availableToSections: { id: string; label: string }[];
}

export const promotionApi = {
  preview: async (
    fromAcademicYearId: string,
    toAcademicYearId: string,
  ): Promise<PromotionPreviewItem[]> => {
    const { data } = await apiClient.get("/academic-year/promotion/preview", {
      params: { fromAcademicYearId, toAcademicYearId },
    });
    return data;
  },

  promote: async (payload: {
    fromAcademicYearId: string;
    toAcademicYearId: string;
    sectionMappings: { fromSectionId: string; toSectionId: string }[];
  }): Promise<{ studentsPromoted: number; feeStructuresCopied: number }> => {
    const { data } = await apiClient.post("/academic-year/promotion", payload);
    return data;
  },
};
