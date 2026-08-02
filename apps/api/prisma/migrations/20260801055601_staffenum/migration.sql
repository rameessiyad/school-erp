/*
  Warnings:

  - Added the required column `designation` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StaffDesignation" AS ENUM ('ACCOUNTANT', 'ADMISSION_OFFICER', 'RECEPTIONIST');

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "designation",
ADD COLUMN     "designation" "StaffDesignation" NOT NULL;
