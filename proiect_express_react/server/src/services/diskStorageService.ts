import type { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";


const cwd = process.cwd()

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uuid = req.auth?.id;
        if (!uuid) {
            return cb(new Error("User not auth"), "")
        }

        const uploadDirectory = path.join(cwd, 'uploads', uuid);
        if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory, { recursive: true });
        }

        cb(null, uploadDirectory);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const id = crypto.randomBytes(12).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, id + ext);
    }
});



export const uploadService = multer({ storage });