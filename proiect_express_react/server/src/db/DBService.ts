import type { Request, Response } from "express";
import z, { success } from "zod";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../client/prisma.js";
import { AuthService } from "../services/AuthService.js";

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

const saltRounds = 10;

export const DBService = {
    registerUser: async (req: Request) => {
        console.log(req.body);
        const validationResult = SignupRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body." };
        }

        const { password, ...publicValidData } = validationResult.data;
        const pwHash = await bcrypt.hash(password, saltRounds);
        const uuid = uuidv4();

        try {
            await prisma.user.create({
                data: { ...publicValidData, passwordHash: pwHash, uuid: uuid },
            });
        } catch (e) {
            return { success: false, message: "Failed to create the user", error: e };
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
            return { succes: false, message: "Invalid email or password" };
        }

        const token = AuthService.generateToken({ id: user.uuid });
        const refreshToken = AuthService.generateRefreshToken({ id: user.uuid });

        return { success: true, token: token, refreshToken: refreshToken };
    },

    logoutUser: async () => {},

    setUserBackground: async (req: Request) => {
        const uuid = req.auth.id;
        const { backgroundUuid } = req.body;

        if (!backgroundUuid) {
            return { success: false, message: "No backgroundUuid provided" };
        }

        try {
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
