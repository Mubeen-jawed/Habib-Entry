-- AlterTable: add optional per-school pool tag on Question.
ALTER TABLE "Question" ADD COLUMN "schoolSlug" TEXT;

-- Backfill: existing SAT math questions (already in DB) are DSSE-only.
UPDATE "Question" SET "schoolSlug" = 'dsse'
WHERE "externalId" IS NOT NULL
  AND "sectionId" IN (SELECT "id" FROM "Section" WHERE "key" = 'MATH');
