// src/lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
