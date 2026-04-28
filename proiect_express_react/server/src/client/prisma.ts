import { PrismaClient } from "../generated/prisma/client.js";

export const prisma = new PrismaClient().$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                return query(args);
            },
        },
    },
});