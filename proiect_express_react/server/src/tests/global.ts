import { app } from "../app.js";
import request from "supertest";
import { prisma } from "../client/prisma.js";

export async function cleanup() {
    if (process.env.NODE_ENV === "production") return;

    const collectionsResult = await prisma.$runCommandRaw({
        listCollections: 1,
        nameOnly: true,
    });

    const collections = (collectionsResult as any).cursor.firstBatch;

    for (const collection of collections) {
        const collectionName = collection.name;

        if (collectionName.startsWith("system.")) continue;

        await prisma.$runCommandRaw({
            delete: collectionName,
            deletes: [{ q: {}, limit: 0 }],
        });
    }
}
