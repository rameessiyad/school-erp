-- AlterTable
ALTER TABLE "StaffDesignation" ADD COLUMN     "allowedModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
