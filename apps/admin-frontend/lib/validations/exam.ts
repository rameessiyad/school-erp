import { z } from "zod";

export const examTypes = ["MODEL", "TERM"] as const;
export const examStatuses = ["DRAFT", "PUBLISHED", "COMPLETED"] as const;

export const createExamSchema = z
  .object({
    name: z.string().min(1, "Exam name is required"),
    examType: z.enum(examTypes, {
      errorMap: () => ({ message: "Select an exam type" }),
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    academicYearId: z.string().uuid("Select an academic year"),
    status: z.enum(examStatuses).optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type CreateExamValues = z.infer<typeof createExamSchema>;

export interface Exam {
  id: string;
  name: string;
  examType: (typeof examTypes)[number];
  startDate: string;
  endDate: string;
  academicYearId: string;
  academicYear?: {
    id: string;
    label: string;
  };
  status: (typeof examStatuses)[number];
  createdAt: string;
  updatedAt: string;
}
