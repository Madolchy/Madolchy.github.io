import { meta } from "zod/v4/core";
import { prisma } from "../client/prisma.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { DesktopIconUncheckedCreateInputSchema } from "../generated/zod/index.js";
import z from "zod";
import path from "node:path";
import fs from "node:fs";

const UploadPayloadSchema = z.object({
    id: z.string().optional(),
    filename: z.string(),
    fileType: z.string(),
    bytes: z.number().int(),
    cell: z.number().int(),
});

const cellSchema = z.number().int().min(0).max(255);

export const FileManagerService = {
    registerFile: async (uuid, metadata) => {
        console.log(metadata);
        const validData = UploadPayloadSchema.safeParse(metadata);
        if (!validData.success) {
            return { success: false, message: "Got a invalid metadata" };
        }

        const data = validData.data;
        console.log("Data id is: ", data);

        try {
            const result = await prisma.desktopIcon.create({
                data: {
                    ...(data.id ? { id: data.id } : {}),
                    filename: data.filename,
                    fileType: data.fileType,
                    bytes: data.bytes,
                    cell: data.cell,
                    userId: uuid,
                },
            });
            return { success: true, data: result };
        } catch (e) {
            return { success: false, message: "Failed to create the desktop icon", error: e };
        }
    },

    getUserDesktop: async (uuid: string) => {
        try {
            const icons = await prisma.desktopIcon.findMany({
                where: {
                    userId: uuid,
                },
            });

            return icons;
        } catch (error) {
            console.error("Error fetching icons: ", error);
            return undefined;
        }
    },
    getFilePath: async (uuid: string, fileId: string) => {
        const safeFileId = path.basename(fileId);
        const userDir = path.join(process.cwd(), "uploads", uuid);

        if (!fs.existsSync(userDir)) {
            return { success: false, message: "User directory not found" };
        }

        const files = fs.readdirSync(userDir);
        const actualFile = files.find((f) => path.parse(f).name === safeFileId);

        if (!actualFile) {
            return { success: false, message: "File not found" };
        }

        const filePath = path.join(userDir, actualFile);
        return { success: true, filePath };
    },

    deleteFile: async (uuid: string, fileId: string) => {
        const safeFileId = path.basename(fileId);

        if (!safeFileId) {
            return { success: false, message: "Invalid file id" };
        }

        try {
            const icon = await prisma.desktopIcon.findFirst({
                where: { id: safeFileId, userId: uuid },
            });

            if (!icon) {
                return { success: false, message: "File not found" };
            }

            const userDir = path.join(process.cwd(), "uploads", uuid);
            if (fs.existsSync(userDir)) {
                const files = fs.readdirSync(userDir);
                const actualFile = files.find((f) => path.parse(f).name === safeFileId);
                if (actualFile) {
                    fs.unlinkSync(path.join(userDir, actualFile));
                }
            }

            await prisma.desktopIcon.delete({ where: { id: safeFileId } });
            return { success: true };
        } catch (e) {
            return { success: false, message: "Failed to delete file", error: e };
        }
    },

    swap_items: async (firstCellPayload, secondCellPayload, userUuid) => {
        const [validFirst, validSecond] = [
            cellSchema.safeParse(firstCellPayload),
            cellSchema.safeParse(secondCellPayload),
        ];

        if (!validFirst.success || !validSecond.success) {
            return { success: false, message: "Invalid cell data provided" };
        }

        const firstCell = validFirst.data;
        const secondCell = validSecond.data;

        try {
            const user = await prisma.user.findUnique({
                where: { uuid: userUuid },
                select: { id: true },
            });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            const userId = user.id;

            const icon1 = await prisma.desktopIcon.findFirst({
                where: { userId: userId, cell: firstCell },
            });
            const icon2 = await prisma.desktopIcon.findFirst({
                where: { userId: userId, cell: secondCell },
            });

            if (!icon1) {
                return { success: false, message: "Source icon does not exist." };
            }

            if (!icon2) {
                await prisma.desktopIcon.update({
                    where: { id: icon1.id },
                    data: { cell: secondCell },
                });
            } else {
                const tempCell = -Math.floor(Math.random() * 1000000) - 1;

                await prisma.desktopIcon.update({
                    where: { id: icon1.id },
                    data: { cell: tempCell },
                });

                await prisma.desktopIcon.update({
                    where: { id: icon2.id },
                    data: { cell: firstCell },
                });

                await prisma.desktopIcon.update({
                    where: { id: icon1.id },
                    data: { cell: secondCell },
                });
            }

            return { success: true, data: {} };
        } catch (error) {
            console.error("Move/Swap transaction failed:", error);
            return { success: false, message: "Failed to update layout." };
        }
    },
};
