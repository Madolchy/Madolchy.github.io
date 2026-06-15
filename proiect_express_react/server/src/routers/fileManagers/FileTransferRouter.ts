import { Router } from "express";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { requireLogin } from "../../middleware/RequireLogin.js";
import { FileManagerService } from "../../services/FileManagerService.js";
import type { FileManager } from "../../interfaces/storage.js";

const upload = multer({ storage: multer.memoryStorage() });

export function createFileTransferRouter(fm: FileManager) {
    const router = Router();

    router.post("/upload", requireLogin, upload.single("myFile"), async (req, res) => {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: "No file upload" });

        const uuid = req.auth.id;
        const fileId = crypto.randomBytes(12).toString("hex");
        const cell = parseInt(req.body.index, 10);

        const metadata = {
            id: fileId,
            name: file.originalname,
            fileType: file.mimetype,
            bytes: file.size,
            cell,
            folderId: req.body.folderPath,
        };

        return Promise.all([
            fm.registerFile(fileId, file.buffer),
            FileManagerService.registerFile(uuid, metadata),
        ]).then(([_, dbResult]) => {
            if (!dbResult.success) return res.status(400).json(dbResult);
            const r2Base = process.env.R2_PUBLIC_URL || "";
            return res.status(200).json({ ...dbResult.data, url: r2Base ? `${r2Base}/${fileId}` : undefined });
        });
    });

    router.delete("/files/:id", requireLogin, async (req, res) => {
        const userUuid = req.auth.id;
        const safeFile = path.basename(req.params.id ?? "");
        if (!safeFile) return res.status(404).json("Need to provide a file to delete.");

        return Promise.all([fm.deleteFile(safeFile), FileManagerService.deleteFile(userUuid, safeFile)]).then(
            ([_, dbResult]) => {
                if (!dbResult.success) return res.status(404).json(dbResult);
                return res.status(200).json(dbResult);
            },
        );
    });

    router.get("/download/:filename", requireLogin, async (req, res) => {
        return res.status(404).json("Not implemented.");
    });

    return router;
}
