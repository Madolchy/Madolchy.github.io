/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `DesktopIcon` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DesktopIcon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "cell" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "DesktopIcon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DesktopIcon" ("bytes", "cell", "file_type", "filename", "id", "userId") SELECT "bytes", "cell", "file_type", "filename", "id", "userId" FROM "DesktopIcon";
DROP TABLE "DesktopIcon";
ALTER TABLE "new_DesktopIcon" RENAME TO "DesktopIcon";
CREATE UNIQUE INDEX "DesktopIcon_userId_filename_key" ON "DesktopIcon"("userId", "filename");
CREATE UNIQUE INDEX "DesktopIcon_userId_cell_key" ON "DesktopIcon"("userId", "cell");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
