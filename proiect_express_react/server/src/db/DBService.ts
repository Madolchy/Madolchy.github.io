import type { Request, Response } from "express";
import z, { success } from "zod";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../client/prisma.js";
import { AuthService } from "../services/AuthService.js";
import { FileManagerService } from "../tests/FileManagerService.js";

export const SignupRequestSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

type SignupRequest = z.infer<typeof SignupRequestSchema>;

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

    getUsers: async () => {
        return prisma.user.findMany();
    },
};
