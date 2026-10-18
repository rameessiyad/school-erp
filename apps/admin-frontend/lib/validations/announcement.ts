import { z } from "zod";

export const ANNOUNCEMENT_CATEGORIES = [
  "IMPORTANT_NOTICE",
  "LEAVE",
  "EXAM",
  "HOLIDAY",
  "EVENT",
  "GENERAL",
] as const;

export const ANNOUNCEMENT_AUDIENCES = [
  "ALL",
  "TEACHERS",
  "PARENTS",
  "STAFF",
] as const;

// "keep" is only offered in edit mode (leaves the current expiry untouched)
export const EXPIRY_VALUES = ["1", "3", "7", "14", "30", "keep"] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  IMPORTANT_NOTICE: "Important Notice",
  LEAVE: "Leave Notification",
  EXAM: "Exam",
  HOLIDAY: "Holiday",
  EVENT: "Event",
  GENERAL: "General",
};

export const CATEGORY_STYLES: Record<AnnouncementCategory, string> = {
  IMPORTANT_NOTICE: "bg-red-100 text-red-700",
  LEAVE: "bg-amber-100 text-amber-700",
  EXAM: "bg-purple-100 text-purple-700",
  HOLIDAY: "bg-green-100 text-green-700",
  EVENT: "bg-blue-100 text-blue-700",
  GENERAL: "bg-surface-secondary text-text-secondary",
};

export const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  ALL: "Everyone",
  TEACHERS: "Teachers",
  PARENTS: "Parents",
  STAFF: "Staff",
};

export const EXPIRY_LABELS: Record<(typeof EXPIRY_VALUES)[number], string> = {
  "1": "1 day",
  "3": "3 days",
  "7": "1 week",
  "14": "2 weeks",
  "30": "1 month",
  keep: "Keep current expiry",
};

export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title must be 150 characters or less"),
  content: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be 5000 characters or less"),
  category: z.enum(ANNOUNCEMENT_CATEGORIES),
  audience: z.enum(ANNOUNCEMENT_AUDIENCES),
  expiryDays: z.enum(EXPIRY_VALUES),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
