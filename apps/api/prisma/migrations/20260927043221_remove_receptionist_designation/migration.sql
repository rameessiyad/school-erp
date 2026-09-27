/*
  Warnings:

  - The values [RECEPTIONIST] on the enum `StaffDesignationEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StaffDesignationEnum_new" AS ENUM ('ACCOUNTANT', 'ADMISSION_OFFICER');
ALTER TABLE "Staff" ALTER COLUMN "designationOld" TYPE "StaffDesignationEnum_new" USING ("designationOld"::text::"StaffDesignationEnum_new");
ALTER TYPE "StaffDesignationEnum" RENAME TO "StaffDesignationEnum_old";
ALTER TYPE "StaffDesignationEnum_new" RENAME TO "StaffDesignationEnum";
DROP TYPE "public"."StaffDesignationEnum_old";
COMMIT;
