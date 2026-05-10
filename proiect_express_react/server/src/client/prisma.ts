import { PrismaClient } from "../generated/prisma/client.js";
import {
    DesktopItemUncheckedCreateInputSchema,
    DesktopItemUncheckedUpdateInputSchema,
} from "../generated/zod/index.js";
import bcrypt from "bcrypt";
import { saltRounds } from "../settings.js";

export const prisma = new PrismaClient().$extends({
    query: {
        user: {
            async create({ args, query }) {
                if (args.data.passwordHash) {
                    args.data.passwordHash = await bcrypt.hash(args.data.passwordHash, saltRounds);
                }
                return query(args);
            },
            async update({ args, query }) {
                if (args.data.passwordHash) {
                    args.data.passwordHash = await bcrypt.hash(args.data.passwordHash, saltRounds);
                }
                return query(args);
            },
        },
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                return query(args);
            },
        },
    },
});
