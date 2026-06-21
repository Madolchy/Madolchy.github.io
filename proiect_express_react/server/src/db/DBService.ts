import type { Request } from "express";
import bcrypt from "bcrypt";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../client/prisma.js";
import { LoginSchema, SignupRequestSchema } from "../types/login.js";
import type { Prisma, User } from "../generated/prisma/client.js";
import type { FileManager } from "../interfaces/storage.js";
import { logger } from "../app.js";
import type { DesktopItem } from "../generated/zod/index.js";
import type { DesktopItemData } from "../types/desktop.js";

// ── Schemas ──

const UploadPayloadSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    fileType: z.string(),
    bytes: z.number().int(),
    cell: z.number().int(),
    folderId: z.string(),
});

const cellSchema = z.number().int().min(0).max(255);

async function bumpVersion(folderId: string, tx?: any) {
    const client = tx || prisma;

    await client.folder.update({
        where: { id: folderId },
        data: { version: { increment: 1 } },
    });
}

export const DBService = {
    registerUser: async (name: string, password: string, email: string) => {
        const uuid = uuidv4();

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: name,
                    email: email,
                    passwordHash: password,
                    uuid: uuid,
                },
            });

            const folder = await tx.folder.create({
                data: {
                    name: "root",
                    cell: 0,
                    parentId: null,
                    userId: user.id,
                },
                select: { id: true },
            });

            return folder.id;
        });

        return { success: true, rootFolderId: result };
    },

    loginUser: async (email: string, password: string) => {
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            return { success: false, message: "Invalid email or password" };
        }

        const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isCorrectPassword) {
            return { success: false, message: "Invalid email or password" };
        }

        const rootFolder = await prisma.folder.findFirst({
            where: { userId: user.uuid, parentId: null },
            select: { id: true },
        });

        if (!rootFolder) {
            return { success: false, message: "Root folder not found" };
        }

        return { success: true, user: user, rootFolderId: rootFolder.id };
    },

    logoutUser: async (uuid: string) => {
        return { success: true };
    },

    getUserBackground: async (uuid: string, fm: FileManager) => {
        const user = await prisma.user.findUnique({
            where: { uuid },
            include: { backgroundIcon: true },
        });

        if (!user) return { success: false, message: "User not found" };
        if (!user.backgroundIcon) {
            return { success: true, message: "User has no background set", data: null };
        }

        return {
            success: true,
            data: {
                backgroundUrl: fm.getFileUrl(user.backgroundIcon.id),
            },
        };
    },

    setUserBackground: async (uuid: string, backgroundUuid: string) => {
        const icon = await prisma.desktopItem.findUnique({
            where: { id: backgroundUuid, user: { uuid: uuid } },
            select: { id: true },
        });

        if (!icon) {
            return { success: false, message: "Icon not found or doesn't belong to user" };
        }

        await prisma.user.update({
            where: { uuid },
            data: { backgroundIconId: backgroundUuid },
        });

        return { success: true };
    },

    getUserDesktop: async (uuid: string, folderId: string) => {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            select: { version: true, items: { where: { userId: uuid } }, children: { where: { userId: uuid } } },
        });
        return { items: folder?.items ?? [], folders: folder?.children ?? [], version: folder?.version ?? 0 };
    },

    updateUserDesktop: async (uuid: string, folderId: string, newDesktop: DesktopItemData[], version: number) => {
        const current = await prisma.folder.findUnique({
            where: { id: folderId },
            select: { version: true },
        });
        if (!current || version < current.version) {
            return { success: false, message: "Version conflict" };
        }

        const ops: any[] = [];
        for (const item of newDesktop) {
            if (item.type === "type/folder") {
                ops.push(
                    prisma.folder.updateMany({
                        where: { id: item.id, userId: uuid },
                        data: { cell: item.cell },
                    }),
                );
            } else {
                ops.push(
                    prisma.desktopItem.updateMany({
                        where: { id: item.id, userId: uuid },
                        data: { cell: item.cell },
                    }),
                );
            }
        }

        if (ops.length === 0) return { success: true };
        ops.push(
            prisma.folder.update({
                where: { id: folderId },
                data: { version },
            }),
        );

        try {
            await prisma.$transaction(ops);
            return { success: true };
        } catch (error) {
            console.error("Desktop sync failed!", error);
            return { success: false, message: "Sync failed" };
        }
    },

    /** Collect all folder IDs in the subtree rooted at the given folder IDs. */
    _collectDescendantFolderIds: async (uuid: string, rootIds: string[], tx?: any): Promise<string[]> => {
        const client = tx || prisma;

        const result = [...rootIds];
        const queue = [...rootIds];

        while (queue.length > 0) {
            const current = queue.shift()!;
            const children = await client.folder.findMany({
                where: { parentId: current, userId: uuid },
                select: { id: true },
            });

            for (const child of children) {
                result.push(child.id);
                queue.push(child.id);
            }
        }
        return result;
    },

    deleteFolder: async (uuid: string, folderId: string) => {
        const folder = await prisma.folder.findFirst({ where: { id: folderId, userId: uuid } });
        if (!folder) return { success: false, message: "Folder not found" };

        const parentId = folder.parentId;
        if (parentId === null) return { success: false, message: "Cannot delete root folder" };

        const result = await prisma.$transaction(async (tx) => {
            const allIds = await DBService._collectDescendantFolderIds(uuid, [folderId], tx);
            await tx.desktopItem.deleteMany({ where: { folderId: { in: allIds }, userId: uuid } });
            await tx.folder.deleteMany({ where: { id: { in: allIds }, userId: uuid } });
            await bumpVersion(parentId, tx);
        });

        logger.info("[deleteFolder] Result is: " + result);
        return { success: true };
    },

    createUserFolder: async (uuid: string, folderName: string, parentFolderId: string, cell: number) => {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const folder = await tx.folder.create({
                    data: { name: folderName, parentId: parentFolderId, cell, userId: uuid },
                });

                await bumpVersion(parentFolderId, tx);
            });

            return { success: true, data: result };
        } catch (e) {
            return { success: false, message: "Failed to create folder", error: e };
        }
    },

    registerDesktopItem: async (uuid: string, desktopItem: DesktopItem) => {
        try {
            const result = await prisma.desktopItem.create({
                data: {
                    id: desktopItem.id,
                    type: desktopItem.type,
                    name: desktopItem.name,
                    bytes: desktopItem.bytes,
                    cell: desktopItem.cell,
                    userId: uuid,
                    folderId: desktopItem.folderId,
                },
            });
            return { success: true, data: result };
        } catch (e) {
            return { success: false, message: "Failed to create the desktop item", error: e };
        }
    },

    getUser: async (uuid: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { uuid: uuid } });
    },
};
