import { prisma } from "../client/prisma.js";
import z from "zod";
import path from "node:path";
import fs from "node:fs";
import type { FileManager } from "../interfaces/storage.js";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const UploadPayloadSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    fileType: z.string(),
    bytes: z.number().int(),
    cell: z.number().int(),
    folderId: z.string().optional(),
});

const cellSchema = z.number().int().min(0).max(255);

export type R2Config = {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
};

export class R2FileManager implements FileManager {
    private R2Client: S3Client;
    private bucketName: string;

    constructor(config: R2Config) {
        if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
            throw new Error("Missing R2 credentials endpoint, accessKeyId, secretAccessKey and bucketName required.");
        }

        this.R2Client = new S3Client({
            region: "auto",
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });

        this.bucketName = config.bucketName;
    }

    async registerFile(uuid: string, buffer: Buffer): Promise<any> {
        const response = await this.R2Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
                Body: buffer,
            }),
        );

        return true;
    }

    async getFile(uuid: string): Promise<Uint8Array> {
        const response = await this.R2Client.send(
            new GetObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
            }),
        );

        return response.Body?.transformToByteArray();
    }

    async deleteFile(uuid: string): Promise<any> {
        const response = await this.R2Client.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
            }),
        );

        return true;
    }
}

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
            const result = await prisma.desktopItem.create({
                data: {
                    ...(data.id ? { id: data.id } : {}),
                    type: data.fileType,
                    name: data.name,
                    bytes: data.bytes,
                    cell: data.cell,
                    userId: uuid,
                    ...(data.folderId ? { folderId: data.folderId } : {}),
                },
            });
            return { success: true, data: result };
        } catch (e) {
            return { success: false, message: "Failed to create the desktop item", error: e };
        }
    },

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

            const item1 = await prisma.desktopItem.findFirst({
                where: { userId: userId, cell: firstCell },
            });
            const item2 = await prisma.desktopItem.findFirst({
                where: { userId: userId, cell: secondCell },
            });

            if (!item1) {
                return { success: false, message: "Source item does not exist." };
            }

            if (!item2) {
                await prisma.desktopItem.update({
                    where: { id: item1.id },
                    data: { cell: secondCell },
                });
            } else {
                const tempCell = -Math.floor(Math.random() * 1000000) - 1;

                await prisma.desktopItem.update({
                    where: { id: item1.id },
                    data: { cell: tempCell },
                });

                await prisma.desktopItem.update({
                    where: { id: item2.id },
                    data: { cell: firstCell },
                });

                await prisma.desktopItem.update({
                    where: { id: item1.id },
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
