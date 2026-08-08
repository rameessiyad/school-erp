import { z } from "zod";

export const loginSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
