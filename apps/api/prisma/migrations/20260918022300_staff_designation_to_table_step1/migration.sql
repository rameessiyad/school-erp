/*
  Warnings:

  - You are about to drop the column `designation` on the `Staff` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StaffDesignationEnum" AS ENUM ('ACCOUNTANT', 'ADMISSION_OFFICER', 'RECEPTIONIST');

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "designation",
ADD COLUMN     "designationId" TEXT,
ADD COLUMN     "designationOld" "StaffDesignationEnum";

-- DropEnum
DROP TYPE "StaffDesignation";

-- CreateTable
CREATE TABLE "StaffDesignation" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffDesignation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffDesignation_schoolId_idx" ON "StaffDesignation"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDesignation_schoolId_name_key" ON "StaffDesignation"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "StaffDesignation" ADD CONSTRAINT "StaffDesignation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "StaffDesignation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
