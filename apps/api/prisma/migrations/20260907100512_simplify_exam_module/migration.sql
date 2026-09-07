/*
  Warnings:

  - The values [UNIT_TEST,MID_TERM,ONAM,CHRISTMAS,FINAL,CUSTOM] on the enum `ExamType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ExamTimeTable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endDate` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExamType_new" AS ENUM ('MODEL', 'TERM');
ALTER TABLE "Exam" ALTER COLUMN "examType" TYPE "ExamType_new" USING ("examType"::text::"ExamType_new");
ALTER TYPE "ExamType" RENAME TO "ExamType_old";
ALTER TYPE "ExamType_new" RENAME TO "ExamType";
DROP TYPE "public"."ExamType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ExamTimeTable" DROP CONSTRAINT "ExamTimeTable_classId_fkey";

-- DropForeignKey
ALTER TABLE "ExamTimeTable" DROP CONSTRAINT "ExamTimeTable_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamTimeTable" DROP CONSTRAINT "ExamTimeTable_uploadedById_fkey";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "ExamTimeTable";

-- DropEnum
DROP TYPE "FileType";
