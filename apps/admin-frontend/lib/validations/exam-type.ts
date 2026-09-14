import { z } from "zod";

export const createExamTypeSchema = z.object({
  name: z.string().min(1, "Exam type name is required").max(50),
});

export type CreateExamTypeValues = z.infer<typeof createExamTypeSchema>;

export interface ExamType {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
