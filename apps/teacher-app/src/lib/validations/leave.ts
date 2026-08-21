import { z } from "zod";

export const applyLeaveSchema = z
  .object({
    fromDate: z.date({ message: "From date is required" }),
    toDate: z.date({ message: "To date is required" }),
    reason: z.string().min(5, "Please provide a reason (min 5 characters)"),
  })
  .refine((data) => data.fromDate <= data.toDate, {
    message: "From date cannot be after to date",
    path: ["toDate"],
  });

export type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;
