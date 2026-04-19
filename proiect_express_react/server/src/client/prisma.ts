import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";


const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
export const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                // await new Promise((resolve) => setTimeout(resolve, 200));
                return query(args);
            },
        },
    },
});;


