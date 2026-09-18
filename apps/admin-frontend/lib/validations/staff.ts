import { z } from "zod";

export const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().optional(),
  designationId: z.string().min(1, "Select a designation"),
  isActive: z.boolean(),
  photo: z.string().optional(),
});

export function getStaffSchema(isEditMode: boolean) {
  return staffSchema.superRefine((data, ctx) => {
    if (!isEditMode) {
      // Creating a new staff member: password is required
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 6 characters",
          path: ["password"],
        });
      }
      return;
    }

    // Editing: password optional, but if provided must still be valid
    if (data.password && data.password.length > 0 && data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 6 characters",
        path: ["password"],
      });
    }
  });
}

export const createStaffSchema = staffSchema;

export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export interface StaffDesignationSummary {
  id: string;
  name: string;
  allowedModules: string[];
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  designationId: string;
  designation: StaffDesignationSummary | null;
  isActive: boolean;
  photoUrl?: string | null;
  createdAt: string;
}
