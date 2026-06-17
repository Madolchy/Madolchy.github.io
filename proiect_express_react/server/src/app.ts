import "dotenv/config";

import express from "express";
import type { Request, Response, NextFunction } from "express";
import { DBService } from "./db/DBService.js";
import { requireLogin } from "./middleware/RequireLogin.js";
import { VisitCounter } from "./middleware/VisitCounter.js";
import cookieParser from "cookie-parser";

import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { isProd, port, bindAddress, storageBackend } from "./settings.js";
import { R2FileManager } from "./services/FileManagerService.js";
import { createFileTransferRouter } from "./routers/fileManagers/FileTransferRouter.js";
import type { FileManager } from "./interfaces/storage.js";
import { authRouter } from "./routers/Authenticator.js";

function createFileManager(): FileManager {
    switch (storageBackend) {
        case "r2":
            return new R2FileManager({
                endpoint: process.env.R2_ENDPOINT!,
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
                bucketName: process.env.R2_RW_BUCKET!,
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

const fm = createFileManager();
app.use("/api", createFileTransferRouter(fm));
app.use("/api", authRouter);

// ---------- API routes ----------

app.get("/api/background", requireLogin, async (req: Request, res: Response) => {
    const result = await DBService.getUserBackground(req);
    if (result.success && !result.data) {
        return res.status(200).json({ success: true, message: "User has no background set" });
    }
    if (result.success && result.data) {
        return res.status(200).json({ success: true, backgroundUrl: result.data.backgroundUrl });
    } else {
        return res.status(400).json({ success: false, message: "Could not find background" });
    }
});

app.post("/api/background", requireLogin, async (req: Request, res: Response) => {
    const result = await DBService.setUserBackground(req);
    console.log("Api Background: ", result);
    if (result.success) {
        return res.status(200).json({ success: true, message: "Background set successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Failed to set background" });
    }
});

app.post("/api/folder", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const { folderName, folderId, cell } = req.body;

    if (!folderName || !folderId || cell == null) {
        return res.status(400).json({ success: false, message: "folderName and id and cell required" });
    }

    const result = await DBService.createUserFolder(uuid, folderName, folderId, cell);
    console.log(result);
    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, data: result.data });
});

app.get("/api/desktop", VisitCounter, requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const folderId = req.query.folderId;
    const items = await DBService.getUserDesktop(uuid, folderId);
    if (!items) return res.status(400).json({});

    const r2Base = process.env.R2_PUBLIC_URL || "";
    const withUrl = items.map((item) => ({ ...item, url: r2Base ? `${r2Base}/${item.id}` : undefined }));

    return res.status(200).json(withUrl);
});

app.put("/api/desktop", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const { folderId, newDesktop } = req.body;

    console.log("Folder id is: ", folderId);
    const result = await DBService.updateUserDesktop(uuid, folderId, newDesktop);

    console.log(result.message);
    if (!result.success) {
        console.log("Failed with: ", result.message);
        return res.status(400).json(result.message);
    }

    return res.status(200).json({ data: result.data });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});
