import "dotenv/config";

import express from "express";
import type { Request, Response, NextFunction } from "express";
import { DBService } from "./db/DBService.js";
import { uploadService } from "./services/diskStorageService.js";
import { requireLogin } from "./middleware/RequireLogin.js";
import { VisitCounter } from "./middleware/VisitCounter.js";
import cookieParser from "cookie-parser";
import ms from "ms";
import { AuthService } from "./services/AuthService.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { isProd, port, bindAddress } from "./settings.js";
import { FileManagerService } from "./services/FileManagerService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const isTest = process.env.NODE_ENV === "test";

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

const authLimiter = isTest
    ? (req: Request, res: Response, next: NextFunction) => next()
    : rateLimit({
          windowMs: ms("1m"),
          max: 3,
          message: { success: false, message: "Too many attempts, please try again later." },
      });

// ---------- API routes ----------

app.get("/", VisitCounter, (req: Request, res: Response) => {
    res.send("hello world");
});

app.post("/api/register", authLimiter, async (req: Request, res: Response) => {
    if (isProd && !isTest)
        return res.status(503).json({ success: false, message: "Registration is currently disabled" });
    const result = await DBService.registerUser(req);
    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, message: "yay" });
});

app.post("/api/login", authLimiter, async (req: Request, res: Response) => {
    const result = await DBService.loginUser(req);
    if (!result.success) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: isProd || process.env.SECURE_COOKIE === "true",
            sameSite: isProd ? "none" : "lax",
            maxAge: ms("7d"),
        });
    }

    return res.status(200).json({ success: true, token: result.token });
});

app.post("/api/refresh", async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("Refresh Token is: ", refreshToken);
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

    const decoded = AuthService.verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    const token = AuthService.generateToken({ id: decoded.id });
    return res.status(200).json({ success: true, token: token });
});

app.post("/api/logout", requireLogin, async (req: Request, res: Response) => {
    const result = await DBService.logoutUser(req);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd || process.env.SECURE_COOKIE === "true",
        sameSite: isProd ? "none" : "lax",
    });

    if (!result.success) {
        return res.status(400).json({ success: false, message: "Logout failed" });
    }
    return res.status(200).json({ success: true });
});

app.get("/api/background", requireLogin, async (req: Request, res: Response) => {
    const result = await DBService.getUserBackground(req);
    if (result.success && !result.data) {
        return res.status(200).json({ success: true, message: "User has no background set" });
    }
    if (result.success && result.data) {
        return res.status(200).json({ success: true, backgroundUuid: result.data.backgroundUuid });
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

app.post("/api/upload", requireLogin, uploadService.single("myFile"), async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file upload" });

    const uuid = req.auth.id;
    const cell = parseInt(req.body.index, 10);

    const metadata = {
        id: path.parse(file.filename).name,
        filename: file.originalname,
        fileType: file.mimetype,
        bytes: file.size,
        cell: cell,
    };

    const result = await FileManagerService.registerFile(uuid, metadata);
    if (result.success && result.data) {
        return res.status(200).json(result.data);
    } else {
        return res.status(400).json({ success: false, message: "File registration failed" });
    }
});

// app.post("/api/desktop/swap", requireLogin, async (req: Request, res: Response) => {
//     const uuid = req.auth.id;
//     const { first, second } = req.body;

//     const result = await FileManagerService.swap_items(first, second, uuid);
//     if (result.success) return res.status(200).json({});
//     return res.status(400).json({});
// });

app.get("/api/desktop", VisitCounter, requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const items = await DBService.getUserDesktop(uuid);
    if (!items) return res.status(400).json({});
    return res.status(200).json(items);
});

app.put("/api/desktop", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const { newDesktop } = req.body;
    const result = await DBService.updateUserDesktop(uuid, newDesktop);
    console.log(result.message);
    if (!result.success) {
        console.log("Failed with: ", result.message);
        return res.status(400).json(result.message);
    }

    return res.status(200).json({ data: result.data });
});

app.delete("/api/files/:id", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const result = await FileManagerService.deleteFile(uuid, req.params.id);
    if (!result.success) {
        console.log(result);
        return res.status(404).json(result);
    }
    return res.status(200).json(result);
});

app.get("/api/download/:filename", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const fileId = path.basename(req.params.filename);
    const result = await FileManagerService.getFilePath(uuid, fileId);
    if (!result.success || !result.filePath) {
        return res.status(404).json({ message: result.message });
    }
    res.sendFile(result.filePath);
});

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});
