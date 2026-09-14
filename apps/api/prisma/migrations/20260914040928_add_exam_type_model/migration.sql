-- 0. Rename the old enum type out of the way so it doesn't collide
--    with the new "ExamType" table Postgres is about to create
--    (table creation implicitly creates a row type with the table's name)
ALTER TYPE "ExamType" RENAME TO "ExamType_enum_old";

-- 1. Create the new ExamType table
CREATE TABLE "ExamType" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExamType_schoolId_name_key" ON "ExamType"("schoolId", "name");

ALTER TABLE "ExamType" ADD CONSTRAINT "ExamType_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Seed default "Model" and "Term" types for every existing school
INSERT INTO "ExamType" ("id", "schoolId", "name", "isDefault", "updatedAt")
SELECT gen_random_uuid(), "id", 'Model', true, CURRENT_TIMESTAMP
FROM "School";

INSERT INTO "ExamType" ("id", "schoolId", "name", "isDefault", "updatedAt")
SELECT gen_random_uuid(), "id", 'Term', true, CURRENT_TIMESTAMP
FROM "School";

-- 3. Add examTypeId as NULLABLE first
ALTER TABLE "Exam" ADD COLUMN "examTypeId" TEXT;

-- 4. Backfill via the proper school chain, matching case-insensitively
--    (note: the old column is now typed "ExamType_enum_old")
UPDATE "Exam" e
SET "examTypeId" = et.id
FROM "AcademicYear" ay
JOIN "ExamType" et ON et."schoolId" = ay."schoolId"
WHERE e."academicYearId" = ay.id
  AND LOWER(et.name) = LOWER(e."examType"::text);

-- 5. Fallback: for any exam that still has no match, assign ANY ExamType
--    belonging to its own school, so nothing is ever left NULL.
UPDATE "Exam" e
SET "examTypeId" = (
  SELECT et.id
  FROM "AcademicYear" ay
  JOIN "ExamType" et ON et."schoolId" = ay."schoolId"
  WHERE ay.id = e."academicYearId"
  LIMIT 1
)
WHERE e."examTypeId" IS NULL;

-- 6. Final safety check
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM "Exam" WHERE "examTypeId" IS NULL;
  IF remaining_count > 0 THEN
    RAISE EXCEPTION 'Migration aborted: % exam(s) have no resolvable school/academicYear chain.', remaining_count;
  END IF;
END $$;

-- 7. Enforce NOT NULL, add FK, drop old column
ALTER TABLE "Exam" ALTER COLUMN "examTypeId" SET NOT NULL;

ALTER TABLE "Exam" ADD CONSTRAINT "Exam_examTypeId_fkey"
  FOREIGN KEY ("examTypeId") REFERENCES "ExamType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Exam" DROP COLUMN "examType";

-- 8. Now safe to drop the renamed old enum type entirely
DROP TYPE "ExamType_enum_old";