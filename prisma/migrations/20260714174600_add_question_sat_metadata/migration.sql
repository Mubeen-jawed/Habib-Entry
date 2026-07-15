-- AlterTable: add SAT metadata + image field to Question
ALTER TABLE "Question" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Question" ADD COLUMN "domain" TEXT;
ALTER TABLE "Question" ADD COLUMN "skill" TEXT;
ALTER TABLE "Question" ADD COLUMN "stemImageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "Question"("externalId");
