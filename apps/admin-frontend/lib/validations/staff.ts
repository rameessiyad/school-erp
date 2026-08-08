import { z } from "zod";

export const staffDesignations = [
  "ACCOUNTANT",
  "ADMISSION_OFFICER",
  "RECEPTIONIST",
] as const;

export const createStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  designation: z.enum(staffDesignations, {
    errorMap: () => ({ message: "Select a designation" }),
  }),
});

export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export interface Staff {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  designation: string;
  isActive: boolean;
  createdAt: string;
}
