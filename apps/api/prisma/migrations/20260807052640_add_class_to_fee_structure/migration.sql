/*
  Warnings:

  - Added the required column `classId` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "classId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
