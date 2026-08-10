import { z } from "zod";

export const relationships = ["FATHER", "MOTHER", "GUARDIAN"] as const;

export const createParentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  relationship: z.enum(relationships, {
    errorMap: () => ({ message: "Select a relationship" }),
  }),
  isPrimary: z.boolean().optional(),
});

export type CreateParentValues = z.infer<typeof createParentSchema>;

export interface Parent {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  parentStudents?: {
    relationship: string;
    isPrimary: boolean;
    student: { id: string; firstName: string; lastName: string | null };
  }[];
}
