import { z } from "zod";

export const createSectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  classId: z.string().min(1, "Class is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
});

export type CreateSectionValues = z.infer<typeof createSectionSchema>;

export interface Section {
  id: string;
  name: string;
  classId: string;
  academicYearId: string;
  class?: { id: string; name: string };
  academicYear?: { id: string; label: string };
  createdAt: string;
}
