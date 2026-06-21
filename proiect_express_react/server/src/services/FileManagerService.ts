// import path from "node:path";
import fs from "node:fs";
import { prisma } from "../client/prisma.js";
import path from "node:path";

export const FileManagerService = {
    getFilePath: async (uuid: string, fileId: string) => {
        const safeFileId = path.basename(fileId);

        const userDir = path.join(process.cwd(), "uploads", uuid);

        if (!fs.existsSync(userDir)) {
            return { success: false, message: "User directory not found" };
        }

        const subDirs = fs
            .readdirSync(userDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => path.join(userDir, d.name));

        for (const dir of subDirs) {
            const files = fs.readdirSync(dir);
            const actualFile = files.find((f) => path.parse(f).name === safeFileId);

            if (actualFile) {
                const filePath = path.join(dir, actualFile);
                return { success: true, filePath };
            }
        }

        return { success: false, message: "File not found" };
    },

    deleteFile: async (uuid: string, fileId: string) => {
        const safeFileId = path.basename(fileId);

        if (!safeFileId) {
            return { success: false, message: "Invalid file id" };
        }

        try {
            const item = await prisma.desktopItem.findFirst({
                where: { id: safeFileId, userId: uuid },
            });

            if (!item) {
                return { success: false, message: "File not found" };
            }

            await prisma.desktopItem.delete({ where: { id: safeFileId } });

            const userDir = path.join(process.cwd(), "uploads", uuid);
            if (fs.existsSync(userDir)) {
                const files = fs.readdirSync(userDir);
                const actualFile = files.find((f) => path.parse(f).name === safeFileId);
                if (actualFile) {
                    fs.unlinkSync(path.join(userDir, actualFile));
                }
            }

            return { success: true };
        } catch (e) {
            return { success: false, message: "Failed to delete file", error: e };
        }
    },
};
