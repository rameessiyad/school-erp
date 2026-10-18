/*
  Warnings:

  - Added the required column `expiresAt` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('IMPORTANT_NOTICE', 'LEAVE', 'EXAM', 'HOLIDAY', 'EVENT', 'GENERAL');

-- DropIndex
DROP INDEX "Announcement_schoolId_idx";

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "category" "AnnouncementCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Announcement_schoolId_expiresAt_idx" ON "Announcement"("schoolId", "expiresAt");
