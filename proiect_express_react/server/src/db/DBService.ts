import type { Request } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../client/prisma.js";
import { AuthService } from "../services/AuthService.js";
import { LoginSchema, SignupRequestSchema } from "../types/login.js";
import type { User } from "../generated/prisma/client.js";

interface DesktopItemData {
    id: string;
    type: string;
    name: string;
    cell: number;
    bytes?: number | null;
    folderId: string;
}

// ── Private helpers ──

async function getRootFolder(uuid: string) {
    const root = await prisma.folder.findFirst({
        where: { userId: uuid, parentId: null },
    });
    if (!root) throw new Error(`Root folder not found for user ${uuid}`);
    return root;
}

async function resolveFolderId(uuid: string, raw: string): Promise<string> {
    if (raw !== "root") return raw;
    const root = await getRootFolder(uuid);
    return root.id;
}

async function bumpVersion(folderId: string) {
    await prisma.folder.update({
        where: { id: folderId },
        data: { version: { increment: 1 } },
    });
}

// ── Public API ──

export const DBService = {
    registerUser: async (req: Request) => {
        const validationResult = SignupRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body." };
        }

        const { password, ...publicValidData } = validationResult.data;
        const uuid = uuidv4();

        await prisma.user.create({
            data: {
                ...publicValidData,
                passwordHash: password,
                uuid: uuid,
                folders: {
                    create: { name: "root", cell: 0, parentId: null },
                },
            },
        });

        return { success: true };
    },

    loginUser: async (req: Request) => {
        const validationResult = LoginSchema.safeParse(req.body);
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body" };
        }

        const { email, password } = validationResult.data;
        const user = await prisma.user.findFirst({ where: { email: email } });

        if (!user) {
            return { success: false, message: "Invalid email or password" };
        }

        const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isCorrectPassword) {
            return { success: false, message: "Invalid email or password" };
        }

        const token = AuthService.generateToken({ id: user.uuid });
        const refreshToken = AuthService.generateRefreshToken({ id: user.uuid });

        return { success: true, token: token, refreshToken: refreshToken };
    },

    logoutUser: async (_req: Request) => {
        return { success: true };
    },

    getUserBackground: async (req: Request) => {
        const uuid = req.auth.id;

        const user = await prisma.user.findUnique({
            where: { uuid: uuid },
            select: {
                backgroundIcon: { select: { id: true, name: true } },
            },
        });

        if (!user) return { success: false, message: "User not found" };

        if (!user.backgroundIcon) {
            return { success: true, message: "User has no background set", data: null };
        }

        // it should pass the file manager here instead of using raw
        const r2Base = process.env.R2_PUBLIC_URL || "";

        return {
            success: true,
            data: {
                backgroundUrl: r2Base ? `${r2Base}/${user.backgroundIcon.id}` : null,
            },
        };
    },

    setUserBackground: async (req: Request) => {
        const uuid = req.auth.id;
        const { backgroundUuid } = req.body;

        if (!backgroundUuid) {
            return { success: false, message: "No backgroundUuid provided" };
        }

        const icon = await prisma.desktopItem.findFirst({
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
        const actualFolderId = await resolveFolderId(uuid, folderId);

        const [folder, items, childFolders] = await Promise.all([
            prisma.folder.findUnique({ where: { id: actualFolderId }, select: { version: true } }),
            prisma.desktopItem.findMany({ where: { userId: uuid, folderId: actualFolderId } }),
            prisma.folder.findMany({ where: { userId: uuid, parentId: actualFolderId } }),
        ]);

        const files = items.map((item) => ({ ...item }));
        const folders = childFolders.map((f) => ({
            ...f,
            type: "type/folder",
            folderId: f.parentId ?? actualFolderId,
        }));

        return { items: [...files, ...folders], version: folder?.version ?? 0 };
    },

    updateUserDesktop: async (uuid: string, folderId: string, newDesktop: DesktopItemData[], version: number) => {
        const actualFolderId = await resolveFolderId(uuid, folderId);

        const current = await prisma.folder.findUnique({
            where: { id: actualFolderId },
            select: { version: true },
        });
        if (!current || version < current.version) {
            return { success: false, message: "Version conflict" };
        }

        const ops: Promise<any>[] = [];

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

        try {
            await Promise.all(ops);
        } catch (error) {
            console.error("Desktop sync failed!", error);
            return { success: false, message: "Sync failed" };
        }

        await prisma.folder.update({
            where: { id: actualFolderId },
            data: { version },
        });
        return { success: true };
    },

    /** Collect all folder IDs in the subtree rooted at the given folder IDs. */
    _collectDescendantFolderIds: async (uuid: string, rootIds: string[]): Promise<string[]> => {
        const result = [...rootIds];
        const queue = [...rootIds];
        while (queue.length > 0) {
            const current = queue.shift()!;
            const children = await prisma.folder.findMany({
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
        if (!folder.parentId) return { success: false, message: "Cannot delete root folder" };

        const allIds = await DBService._collectDescendantFolderIds(uuid, [folderId]);

        await prisma.desktopItem.deleteMany({ where: { folderId: { in: allIds }, userId: uuid } });
        await prisma.folder.deleteMany({ where: { id: { in: allIds }, userId: uuid } });

        if (folder.parentId) {
            await bumpVersion(folder.parentId);
        }

        return { success: true };
    },

    createUserFolder: async (uuid: string, folderName: string, parentFolderId: string, cell: number) => {
        const user = await DBService.getUser(uuid);
        if (!user) return { success: false, message: "User not found" };

        const actualParentId = await resolveFolderId(uuid, parentFolderId);

        try {
            const folder = await prisma.folder.create({
                data: { name: folderName, parentId: actualParentId, cell, userId: uuid },
            });
            await bumpVersion(actualParentId);
            return { success: true, data: folder };
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            return { success: false, message: "Failed to create folder", error: errMsg };
        }
    },

    getUser: async (uuid: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { uuid: uuid } });
    },
};
