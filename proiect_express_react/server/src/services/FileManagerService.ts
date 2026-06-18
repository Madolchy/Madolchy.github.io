import { prisma } from "../client/prisma.js";
import z from "zod";
import path from "node:path";
import fs from "node:fs";
import type { FileManager } from "../interfaces/storage.js";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logger } from "../app.js";

const UploadPayloadSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    fileType: z.string(),
    bytes: z.number().int(),
    cell: z.number().int(),
    folderId: z.string(),
});

const cellSchema = z.number().int().min(0).max(255);

export type R2Config = {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    devUrl: string | null;
};

export class R2FileManager implements FileManager {
    private R2Client: S3Client;
    private bucketName: string;
    private devUrl: string | null;

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

        if (!config.devUrl) logger.info("[R2] No devUrl provided, some endpoints are not accesible.");
        this.devUrl = config.devUrl;

        this.bucketName = config.bucketName;
    }

    async registerFile(uuid: string, buffer: Buffer) {
        await this.R2Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
                Body: buffer,
            }),
        );
        return true;
    }

    async getFile(uuid: string) {
        const response = await this.R2Client.send(
            new GetObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
            }),
        );

        return response.Body!.transformToByteArray();
    }

    getFileUrl(id: string) {
        if (this.devUrl === null) throw new Error("[R2] Tried to grab a dev url while one wasn't provided.");

        return new URL(`${this.devUrl}/${id}`);
    }

    async deleteFile(uuid: string): Promise<any> {
        await this.R2Client.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
            }),
        );
        return true;
    }
}

async function resolveFolderId(uuid: string, raw: string): Promise<string> {
    if (raw !== "root") return raw;
    const root = await prisma.folder.findFirst({
        where: { userId: uuid, parentId: null },
    });
    if (!root) throw new Error(`Root folder not found for user ${uuid}`);
    return root.id;
}

export const FileManagerService = {
    registerFile: async (uuid: string, metadata: unknown) => {
        const validData = UploadPayloadSchema.safeParse(metadata);
        if (!validData.success) {
            return { success: false, message: "Got invalid metadata" };
        }

        const data = validData.data;
        const actualFolderId = await resolveFolderId(uuid, data.folderId);

        try {
            const result = await prisma.desktopItem.create({
                data: {
                    ...(data.id ? { id: data.id } : {}),
                    type: data.fileType,
                    name: data.name,
                    bytes: data.bytes,
                    cell: data.cell,
                    userId: uuid,
                    folderId: actualFolderId,
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

    swap_items: async (firstCellPayload: unknown, secondCellPayload: unknown, userUuid: string) => {
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
