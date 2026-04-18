/*
  Warnings:

  - Added the required column `bytes` to the `DesktopIcon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cell` to the `DesktopIcon` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DesktopIcon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "cell" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "DesktopIcon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DesktopIcon" ("filename", "id", "userId") SELECT "filename", "id", "userId" FROM "DesktopIcon";
DROP TABLE "DesktopIcon";
ALTER TABLE "new_DesktopIcon" RENAME TO "DesktopIcon";
CREATE UNIQUE INDEX "DesktopIcon_userId_filename_key" ON "DesktopIcon"("userId", "filename");
CREATE UNIQUE INDEX "DesktopIcon_userId_cell_key" ON "DesktopIcon"("userId", "cell");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
