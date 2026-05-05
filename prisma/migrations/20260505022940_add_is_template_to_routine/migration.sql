-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Routine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientName" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    CONSTRAINT "Routine_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Routine" ("clientId", "clientName", "createdAt", "daysCount", "id", "updatedAt") SELECT "clientId", "clientName", "createdAt", "daysCount", "id", "updatedAt" FROM "Routine";
DROP TABLE "Routine";
ALTER TABLE "new_Routine" RENAME TO "Routine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
