-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN "essayPrompt" TEXT;
ALTER TABLE "Attempt" ADD COLUMN "essayText" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MockTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalTimeSeconds" INTEGER NOT NULL DEFAULT 12600,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_MockTest" ("createdAt", "description", "id", "title") SELECT "createdAt", "description", "id", "title" FROM "MockTest";
DROP TABLE "MockTest";
ALTER TABLE "new_MockTest" RENAME TO "MockTest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
