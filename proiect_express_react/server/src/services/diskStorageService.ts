import type { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";


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
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});



export const uploadService = multer({ storage });