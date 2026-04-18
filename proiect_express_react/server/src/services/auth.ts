import type { Request, Response } from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { UserCreateInputSchema, UserSchema } from '../generated/zod/index.js';
import { PrismaClient } from '../generated/prisma/client.js';
import z, { success } from 'zod';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../client/prisma.js';

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
    register_user: async (req: Request) => {
        console.log(req.body)
        const validationResult = SignupRequestSchema.safeParse(req.body)
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body." }
        }

        const { password, ...publicValidData } = validationResult.data
        const pwHash = await bcrypt.hash(password, saltRounds);
        const uuid = uuidv4();

        try {
            await prisma.user.create({
                data: { ...publicValidData, password_hash: pwHash, uuid:uuid}
            })
        }
        catch (e) {
            return { success: false, message: "Failed to create the user", error: e }
        }

        return { success: true }
    },

    login_user: async (req: Request) => {
        const validationResult = LoginSchema.safeParse(req.body)
        if (!validationResult.success) {
            return { success: false, message: "Failed to parse the body" }
        }

        const { email, password } = validationResult.data
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (!user) {
            return { success: false, message: "Invalid email or password" }
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password_hash)
        if (!isCorrectPassword) {
            return { succes: false, message: "Invalid email or password" }
        }

        const token = jwt.sign(
            { id: user.uuid },
            process.env.JWT_SECRET as jwt.PrivateKey,
            { expiresIn: '1h' }
        );

        return { success: true, token: token}

    },

    get_users: async () => {
        return prisma.user.findMany();
    }
}