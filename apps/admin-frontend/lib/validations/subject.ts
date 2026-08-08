import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
});

export type CreateSubjectValues = z.infer<typeof createSubjectSchema>;

export interface Subject {
  id: string;
  name: string;
  code: string | null;
  createdAt: string;
}
