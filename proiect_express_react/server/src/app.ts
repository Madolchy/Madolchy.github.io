import "dotenv/config";

import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";
import { isProd, port, bindAddress, storageBackend } from "./config.js";
import { createFileTransferRouter } from "./routers/FileTransferRouter.js";
import type { FileManager } from "./interfaces/storage.js";
import { authRouter } from "./routers/AuthRouter.js";
import { createDesktopRouter } from "./routers/DesktopRouter.js";
import multer from "multer";
import { R2FileManager } from "./storage/R2FileManager.js";

export const logger = pino({
    transport: {
        target: "pino-pretty",
    },
});

function createFileManager(): FileManager {
    switch (storageBackend) {
        case "r2":
            return new R2FileManager({
                endpoint: process.env.R2_ENDPOINT!,
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
                bucketName: process.env.R2_RW_BUCKET!,
                devUrl: process.env.R2_PUBLIC_URL!,
            });
        case "local":
            throw new Error(`Storage backend "${storageBackend}" not implemented yet.`);
        default:
            throw new Error(`Unsupported storage backend: ${storageBackend}`);
    }
}

export const app = express();

app.set("trust proxy", 1);

app.use(
    cors({
        origin: isProd
            ? ["https://lastendconductor.lunaticbadrabbit.workers.dev", "https://madolchy.github.io"]
            : ["http://localhost:5173", "http://localhost:4173"],
        credentials: true,
    }),
);

app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

const multerInstance = multer({ storage: multer.memoryStorage() });

const fm = createFileManager();
app.use("/api", authRouter);
app.use("/api", createFileTransferRouter(fm, multerInstance));
app.use("/api", createDesktopRouter(fm));

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error("Unhandled Server Error:" + err);
    res.status(500).json({ success: false, message: "Internal server error" });
});
