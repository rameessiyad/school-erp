-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "isGraduatingClass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promotesToClassId" TEXT;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_promotesToClassId_fkey" FOREIGN KEY ("promotesToClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
