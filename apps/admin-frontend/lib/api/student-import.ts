import { apiClient } from "@/lib/axios/client";
import {
  CommitResponse,
  ImportOptions,
  ImportTarget,
  ValidateResponse,
} from "@/lib/validations/student-import";

function buildForm(file: File, target: ImportTarget) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("academicYearId", target.academicYearId);
  if (target.sectionId) formData.append("sectionId", target.sectionId);
  return formData;
}

export const studentImportApi = {
  options: async (): Promise<ImportOptions> => {
    const { data } = await apiClient.get("/student-import/options");
    return data;
  },

  template: async (target: ImportTarget): Promise<Blob> => {
    const { data } = await apiClient.get("/student-import/template", {
      params: target,
      responseType: "blob",
    });
    return data;
  },

  validate: async (
    file: File,
    target: ImportTarget,
  ): Promise<ValidateResponse> => {
    const { data } = await apiClient.post(
      "/student-import/validate",
      buildForm(file, target),
    );
    return data;
  },

  errorReport: async (file: File, target: ImportTarget): Promise<Blob> => {
    const { data } = await apiClient.post(
      "/student-import/error-report",
      buildForm(file, target),
      { responseType: "blob" },
    );
    return data;
  },

  commit: async (file: File, target: ImportTarget): Promise<CommitResponse> => {
    const { data } = await apiClient.post(
      "/student-import/commit",
      buildForm(file, target),
    );
    return data;
  },
};
