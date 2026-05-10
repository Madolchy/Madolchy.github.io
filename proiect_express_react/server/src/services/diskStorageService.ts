import type { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uuid = req.auth?.id;
        const { folderPath } = req.body;
        console.log(folderPath);
        if (!uuid) {
            return cb(new Error("User not auth"), "");
        }

        const uploadDirectory = path.join(process.cwd(), "uploads");
        const userDirectory = path.basename(folderPath);
        const finalPath = path.resolve(uploadDirectory, uuid, userDirectory);

        if (!finalPath.startsWith(uploadDirectory)) {
            throw new Error("Invalid Path");
        }

        if (!fs.existsSync(finalPath)) {
            fs.mkdirSync(finalPath, { recursive: true });
        }

        cb(null, finalPath);
    },

    filename: (req: Request, file: Express.Multer.File, cb) => {
        const id = crypto.randomBytes(12).toString("hex");
        const ext = path.extname(file.originalname);
        cb(null, id + ext);
    },
});

export const uploadService = multer({ storage });
