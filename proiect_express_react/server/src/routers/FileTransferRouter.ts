import { Router } from "express";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { requireLogin } from "../middleware/RequireLogin.js";
import { FileManagerService } from "../services/FileManagerService.js";
import { DBService } from "../db/DBService.js";
import type { FileManager } from "../interfaces/storage.js";
import { DesktopItemSchema } from "../generated/zod/index.js";
import { FileUploadInputSchema } from "../types/upload.js";
import type { AuthRequest } from "../interfaces/request.js";
import type { Request, Response } from "express";
import { validateBody, validateParams } from "../middleware/zodValidation.js";
import { FileTransferDeleteSchema } from "../types/transfer.js";
import { fileIdLength } from "../config.js";

export function createFileTransferRouter(fm: FileManager, multer: multer.Multer) {
    const router = Router();
    router.use(requireLogin);

    router.post("/upload", multer.single("myFile"), validateBody(FileUploadInputSchema), async (req: Request, res: Response) => {
        const uuid = req.auth!.id;

        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: "No file upload" });

        const fileId = crypto.randomBytes(fileIdLength).toString("hex");
        const desktopItem = {
            id: fileId,
            userId: uuid,
            name: file.originalname,
            type: file.mimetype,
            bytes: file.size,
            cell: req.validatedBody.index,
            folderId: req.validatedBody.folderPath,
        };

        const [_, dbResult] = await Promise.all([fm.registerFile(fileId, file.buffer), DBService.registerDesktopItem(uuid, desktopItem)]);

        // Handle the database result
        if (!dbResult.success) {
            return res.status(400).json(dbResult);
        }
        return res.status(200).json({
            ...dbResult.data,
            url: fm.getFileUrl(fileId),
        });
    });

    router.delete("/files/:id", validateParams(FileTransferDeleteSchema), async (req, res) => {
        const uuid = req.auth!.id;
        const fileUuid = String(req.validatedParams.id);

        const safeFileUuid = path.basename(fileUuid);
        const [_, dbResult] = await Promise.all([fm.deleteFile(safeFileUuid), FileManagerService.deleteFile(uuid, safeFileUuid)]);

        if (!dbResult.success) {
            return res.status(404).json(dbResult);
        }

        return res.status(200).json(dbResult);
    });

    router.get("/download/:filename", async (req, res) => {
        return res.status(404).json("Not implemented.");
    });

    return router;
}
