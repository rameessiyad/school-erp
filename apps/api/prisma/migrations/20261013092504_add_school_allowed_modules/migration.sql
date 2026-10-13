-- AlterTable
ALTER TABLE "School" ADD COLUMN     "allowedModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
