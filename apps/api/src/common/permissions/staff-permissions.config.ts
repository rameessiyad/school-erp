import { StaffDesignation } from 'generated/prisma/enums';
import { Module } from './module.enum';

export const STAFF_MODULE_PERMISSIONS: Record<StaffDesignation, Module[]> = {
  ACCOUNTANT: [Module.STUDENT_FEES, Module.FEE_REPORTS, Module.PAYMENT_HISTORY],
  ADMISSION_OFFICER: [
    Module.STUDENT_ADMISSIONS,
    Module.STUDENT_REGISTRATION,
    Module.PARENT_DETAILS,
  ],
  RECEPTIONIST: [],
};
