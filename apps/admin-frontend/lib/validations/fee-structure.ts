import { z } from "zod";

export const feeFrequencies = [
  "ONE_TIME",
  "MONTHLY",
  "TERM",
  "YEARLY",
] as const;

export const createFeeStructureSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  classId: z.string().min(1, "Class is required"),
  name: z.string().min(1, "Fee name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  frequency: z.enum(feeFrequencies, {
    errorMap: () => ({ message: "Select a frequency" }),
  }),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

export type CreateFeeStructureValues = z.infer<typeof createFeeStructureSchema>;

export interface FeeStructure {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  dueDate: string;
  description: string | null;
  isActive: boolean;
  class?: { id: string; name: string };
  academicYear?: { id: string; label: string };
  createdAt: string;
}
