import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
});

export type CreateClassValues = z.infer<typeof createClassSchema>;

export interface SchoolClass {
  id: string;
  name: string;
  createdAt: string;
}
