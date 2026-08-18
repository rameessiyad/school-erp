import { z } from "zod";

export const genders = ["MALE", "FEMALE", "OTHER"] as const;

export const createStudentSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  gender: z.enum(genders).optional(),
  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  admissionDate: z.string().optional(),
  // enrollment (optional)
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  academicYearId: z.string().optional(),
  rollNo: z.string().optional(),
  photo: z.string().optional(),
});

export type CreateStudentValues = z.infer<typeof createStudentSchema>;

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  bloodGroup: string | null;
  isActive: boolean;
  photo: string | null;
}
