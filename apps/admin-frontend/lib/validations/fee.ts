import { z } from "zod";

export const paymentMethods = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
  "CHEQUE",
] as const;

export const feeStatuses = [
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "WAIVED",
] as const;

export const createPaymentSchema = z.object({
  studentFeeId: z.string().min(1, "Student fee is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(paymentMethods, {
    errorMap: () => ({ message: "Select a payment method" }),
  }),
  remarks: z.string().optional(),
});

export type CreatePaymentValues = z.infer<typeof createPaymentSchema>;

export interface FeePayment {
  id: string;
  amount: string;
  paymentMethod: (typeof paymentMethods)[number];
  receiptNumber: string;
  paymentDate: string;
  remarks: string | null;
  collectedBy?: { id: string; email: string };
  createdAt: string;
}

export interface StudentFee {
  id: string;
  totalAmount: string;
  discountAmount: string;
  dueDate: string | null;
  status: (typeof feeStatuses)[number];
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  feeStructure?: {
    id: string;
    name: string;
    amount: string;
    frequency: string;
    dueDate: string;
    class?: { id: string; name: string };
  };
  payments?: FeePayment[];
  createdAt: string;
}

export interface StudentFeeQuery {
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  status?: (typeof feeStatuses)[number];
  search?: string;
}
