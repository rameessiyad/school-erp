import { z } from "zod";

const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

export const createSchoolSchema = z.object({
  name: z.string().trim().min(1, "School name is required"),
  subdomain: z
    .string()
    .trim()
    .min(1, "Subdomain is required")
    .regex(
      subdomainRegex,
      "Only letters, numbers and hyphens (not at the start or end)",
    ),
  allowedModules: z.array(z.string()).optional(),
  admin: z.object({
    email: z
      .string()
      .min(1, "Admin email is required")
      .email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
  }),
});

export const updateSchoolSchema = z.object({
  name: z.string().trim().min(1, "School name is required").optional(),
  subdomain: z
    .string()
    .trim()
    .regex(subdomainRegex, "Only letters, numbers and hyphens")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateSchoolModulesSchema = z.object({
  allowedModules: z.array(z.string()),
});

export type CreateSchoolValues = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolValues = z.infer<typeof updateSchoolSchema>;
export type UpdateSchoolModulesValues = z.infer<
  typeof updateSchoolModulesSchema
>;

export type SchoolStatus = "ACTIVE" | "INACTIVE";

export interface SchoolAdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  lastLogin?: string | null;
}

export interface School {
  id: string;
  name: string;
  subdomain: string;
  status: SchoolStatus;
  allowedModules: string[];
  createdAt: string;
  _count: {
    students: number;
    teachers: number;
    parents: number;
    staffs: number;
    classes?: number;
  };
  users: SchoolAdminUser[];
  academicYears?: {
    id: string;
    label: string;
    startDate: string;
    endDate: string;
  }[];
}
