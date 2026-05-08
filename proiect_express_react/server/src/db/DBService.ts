import type { Request, Response } from "express";
import z, { success } from "zod";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../client/prisma.js";
import { AuthService } from "../services/AuthService.js";
import { FileManagerService } from "../services/FileManagerService.js";
import { LoginSchema, SignupRequestSchema } from "../types/login.js";
import type { User } from "../generated/prisma/client.js";
import type { DesktopIconModel } from "../generated/prisma/models.js";
import type { PrismaPromise } from "../generated/prisma/internal/prismaNamespace.js";

export const DBService = {
    registerUser: async (req: Request) => {
        console.log(req.body);
        const validationResult = SignupRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body." };
        }

        const { password, ...publicValidData } = validationResult.data;
        const uuid = uuidv4();

        try {
            await prisma.user.create({
                data: { ...publicValidData, passwordHash: password, uuid: uuid },
            });
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.log("DB REGISTER ERROR:", errMsg);
            return { success: false, message: "Failed to create the user", error: errMsg };
        }

        return { success: true };
    },

    loginUser: async (req: Request) => {
        const validationResult = LoginSchema.safeParse(req.body);
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body" };
        }

        const { email, password } = validationResult.data;
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });

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

    logoutUser: async (req: Request) => {
        return { success: true };
    },

    getUserBackground: async (req: Request) => {
        const uuid = req.auth.id;

        try {
            const user = await prisma.user.findUnique({
                where: { uuid: uuid },
                select: {
                    backgroundIcon: {
                        select: {
                            id: true,
                            filename: true,
                        },
                    },
                },
            });

            if (!user) {
                return { success: false, message: "User not found" };
            }

            if (!user.backgroundIcon) {
                return { success: true, message: "User has no background set", data: null };
            }

            const backgroundPath = await FileManagerService.getFilePath(uuid, user.backgroundIcon.id);
            if (!backgroundPath.success) {
                return { success: false, message: "The specified background is not on the server." };
            }

            return {
                success: true,
                data: {
                    backgroundUuid: user.backgroundIcon.id,
                    backgroundPath: backgroundPath.filePath,
                },
            };
        } catch (e) {
            return { success: false, message: "Failed to retrieve background", error: e };
        }
    },
    setUserBackground: async (req: Request) => {
        const uuid = req.auth.id;
        const { backgroundUuid } = req.body;

        if (!backgroundUuid) {
            return { success: false, message: "No backgroundUuid provided" };
        }

        try {
            console.log("Trying to get icon: ", backgroundUuid, " by user: ", uuid);
            const icon = await prisma.desktopIcon.findFirst({
                where: {
                    id: backgroundUuid,
                    user: { uuid: uuid },
                },
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
        } catch (e) {
            return { success: false, message: "Failed to set background", error: e };
        }
    },

    updateUserDesktop: async (uuid: string, newDesktop: DesktopIconModel[]) => {
        if (!uuid || !newDesktop) {
            return { success: false, message: "Uuid or new desktop positions are missing" };
        }

        const user = await DBService.getUser(uuid);
        if (!user) {
            return { success: false, message: "User not found" };
        }

        const userDesktop = await DBService.getUserDesktop(uuid);
        if (!userDesktop) {
            return { success: false, message: "Failed to get user desktop" };
        }

        const newDesktopMap = new Map(newDesktop.map((icon) => [icon.id, icon]));
        const existingIds = new Set(userDesktop.map((icon) => icon.id));

        const ops: PrismaPromise<any>[] = [];

        // 1. Delete icons removed from desktop
        const toDelete = userDesktop.filter((old) => !newDesktopMap.has(old.id));
        toDelete.forEach((icon) => {
            ops.push(prisma.desktopIcon.delete({ where: { id: icon.id } }));
        });

        // 2. Create new icons not yet in DB
        const toCreate = newDesktop.filter((icon) => !existingIds.has(icon.id));
        toCreate.forEach((icon) => {
            ops.push(
                prisma.desktopIcon.create({
                    data: {
                        id: icon.id,
                        filename: icon.filename,
                        fileType: icon.fileType,
                        bytes: icon.bytes,
                        cell: icon.cell,
                        userId: uuid,
                    },
                }),
            );
        });

        // 3. Update cell positions for existing icons that moved
        userDesktop.forEach((oldIcon) => {
            const match = newDesktopMap.get(oldIcon.id);
            if (!match) return;

            if (oldIcon.cell !== match.cell) {
                ops.push(
                    prisma.desktopIcon.update({
                        where: { id: oldIcon.id },
                        data: { cell: match.cell },
                    }),
                );
            }
        });

        if (ops.length === 0) {
            return { success: true, message: "No updates necessary", data: newDesktop };
        }

        try {
            await prisma.$transaction(ops);
            console.log(`Desktop synced: ${toDelete.length} deleted, ${toCreate.length} created, rest updated.`);
        } catch (error) {
            console.error("Desktop sync failed!", error);
            return { success: false, message: "Database sync failed during transaction" };
        }

        return { success: true, message: "Desktop synced successfully", data: newDesktop };
    },

    getUser: async (uuid: string): Promise<User | null> => {
        const user = await prisma.user.findUnique({
            where: {
                uuid: uuid,
            },
        });
        return user;
    },

    getUserDesktop: async (uuid: string) => {
        const icons = await prisma.desktopIcon.findMany({
            where: {
                userId: uuid,
            },
        });
        return icons;
    },
};
