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

export interface SubjectTeacherAllocation {
  id: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string | null;
    photoUrl: string | null;
  };
  section: {
    id: string;
    name: string;
    class: { id: string; name: string };
  };
  academicYear: { id: string; label: string };
}

export interface SubjectDetail extends Subject {
  teacherAllocations: SubjectTeacherAllocation[];
}
