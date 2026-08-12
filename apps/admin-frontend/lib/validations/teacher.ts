import { z } from "zod";

export const genders = ["MALE", "FEMALE", "OTHERS"] as const;

export const allocationSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  sectionId: z.string().min(1, "Section is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
});

export function getTeacherSchema(isEditMode: boolean) {
  return z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    password: isEditMode
      ? z
          .string()
          .min(6, "Password must be at least 6 characters")
          .optional()
          .or(z.literal(""))
      : z.string().min(6, "Password must be at least 6 characters"),
    employeeId: z.string().optional(),
    gender: z.enum(genders).optional(),
    dob: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.coerce.number().int().nonnegative().optional(),
    joiningDate: z.string().optional(),
    allocations: z.array(allocationSchema).optional(),
    photo: z.string().optional(),
  });
}

export const createTeacherSchema = getTeacherSchema(false);

export type Gender = (typeof genders)[number];

export type CreateTeacherValues = z.infer<typeof createTeacherSchema>;

export interface TeacherAllocation {
  id: string;
  subjectId: string;
  sectionId: string;
  academicYearId: string;
  subject: { id: string; name: string; code: string };
  section: {
    id: string;
    name: string;
    classId: string;
    class: { id: string; name: string };
  };
  academicYear: { id: string; label: string };
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  employeeId: string | null;
  gender: Gender | null;
  dob: string | null;
  qualification: string | null;
  experience: number | null;
  joiningDate: string | null;
  isActive: boolean;
  photoUrl?: string | null;
  teacherSubjectAllocations?: TeacherAllocation[];
}
