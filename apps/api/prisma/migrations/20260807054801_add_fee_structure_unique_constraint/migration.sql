/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,academicYearId,classId,name]` on the table `FeeStructure` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_schoolId_academicYearId_classId_name_key" ON "FeeStructure"("schoolId", "academicYearId", "classId", "name");
