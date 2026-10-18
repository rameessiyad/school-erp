import { apiClient } from "@/lib/axios/client";
import {
  Announcement,
  AnnouncementFormValues,
} from "@/lib/validations/announcement";

// Backend expects expiryDays as a number, and "keep" means "don't send it"
function buildPayload(values: Partial<AnnouncementFormValues>) {
  const { expiryDays, ...rest } = values;

  return {
    ...rest,
    ...(expiryDays && expiryDays !== "keep"
      ? { expiryDays: Number(expiryDays) }
      : {}),
  };
}

export const announcementApi = {
  list: async (): Promise<Announcement[]> => {
    const { data } = await apiClient.get("/announcements");
    return data;
  },

  get: async (id: string): Promise<Announcement> => {
    const { data } = await apiClient.get(`/announcements/${id}`);
    return data;
  },

  create: async (values: AnnouncementFormValues): Promise<Announcement> => {
    const { data } = await apiClient.post(
      "/announcements",
      buildPayload(values),
    );
    return data;
  },

  update: async (
    id: string,
    values: Partial<AnnouncementFormValues>,
  ): Promise<Announcement> => {
    const { data } = await apiClient.patch(
      `/announcements/${id}`,
      buildPayload(values),
    );
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/announcements/${id}`);
    return data;
  },
};
