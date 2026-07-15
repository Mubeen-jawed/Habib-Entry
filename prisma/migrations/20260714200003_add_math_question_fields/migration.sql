-- AlterTable: math-question support fields on Question
ALTER TABLE "Question" ADD COLUMN "questionType" TEXT NOT NULL DEFAULT 'MCQ';
ALTER TABLE "Question" ADD COLUMN "explanationImageUrl" TEXT;
