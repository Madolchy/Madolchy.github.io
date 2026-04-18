-- CreateTable
CREATE TABLE "DesktopIcon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "DesktopIcon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DesktopIcon_userId_filename_key" ON "DesktopIcon"("userId", "filename");
