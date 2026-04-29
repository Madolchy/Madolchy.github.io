import "dotenv/config";

import express from "express";
import type { Request, Response, NextFunction } from "express";
import { DBService } from "./db/DBService.js";
import { uploadService } from "./services/diskStorageService.js";
import { requireLogin } from "./middleware/RequireLogin.js";
import { FileManagerService } from "./services/FileManagerService.js";
import { VisitCounter } from "./middleware/VisitCounter.js";
import cookieParser from "cookie-parser";
import ms from "ms";
import { AuthService } from "./services/AuthService.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const bindAddress = process.env.BIND_ADDRESS || (isProd ? "0.0.0.0" : "127.0.0.1");

// Tells Express it is behind a trusted proxy (Cloudflare)
// and to use the real user's IP from the X-Forwarded-For header.
app.set("trust proxy", 1);

app.use(helmet());

app.use(
    cors({
        origin: isProd ? ["https://lastendconductor.lunaticbadrabbit.workers.dev", "https://madolchy.github.io"] : "http://localhost:5173",
        credentials: true,
    }),
);

// 3. Rate limiting prevents brute-force login attacks
const authLimiter = rateLimit({
    windowMs: ms("1m"),
    max: 3,
    message: { success: false, message: "Too many attempts, please try again later." },
});

app.use(express.json());
app.use(cookieParser());

// ---------- API routes ----------

app.get("/", VisitCounter, (req: Request, res: Response) => {
    res.send("Hello from Express and TypeScript!");
});

app.post("/api/register", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
    if (isProd) return res.status(503).json({ success: false, message: "Registration is currently disabled" });
    try {
        const result = await DBService.registerUser(req);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true, message: "yay" });
    } catch (error) {
        next(error); // Pass to global error handler
    }
});

app.post("/api/login", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await DBService.loginUser(req);
        if (!result.success) {
            return res.status(401).json({ success: false, message: "Invalid credentials" }); // Changed 400 to 401 Unauthorized
        }

        if (result.refreshToken) {
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: isProd || process.env.SECURE_COOKIE === "true",
                sameSite: isProd ? "none" : "lax", // Note: 'none' requires 'secure: true' to work in browsers!
                maxAge: ms("7d"),
            });
        }

        return res.status(200).json({ success: true, token: result.token });
    } catch (error) {
        next(error);
    }
});

app.post("/api/refresh", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

        const decoded = AuthService.verifyToken(refreshToken);
        if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

        const token = AuthService.generateToken({ id: decoded.id });
        return res.status(200).json({ success: true, token: token });
    } catch (error) {
        next(error);
    }
});

app.post("/api/logout", requireLogin, async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
        next(error);
    }
});

app.post(
    "/api/upload",
    requireLogin,
    uploadService.single("myFile"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
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

            const result = await FileManagerService.register_file(uuid, metadata);
            if (result.success && result.data) {
                return res.status(200).json(result.data);
            } else {
                return res.status(400).json({ success: false, message: "File registration failed" });
            }
        } catch (error) {
            next(error);
        }
    },
);

app.post("/api/desktop/swap", requireLogin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uuid = req.auth.id;
        const { first, second } = req.body;

        const result = await FileManagerService.swap_items(first, second, uuid);
        if (result.success) return res.status(200).json({});
        return res.status(400).json({});
    } catch (error) {
        next(error);
    }
});

app.get("/api/desktop", VisitCounter, requireLogin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uuid = req.auth.id;
        const items = await FileManagerService.getUserDesktop(uuid);
        if (!items) return res.status(400).json({});
        return res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

app.get("/api/download/:filename", requireLogin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uuid = req.auth.id;
        // path.basename prevents Directory Traversal Attacks (e.g. users requesting ../../../etc/passwd)
        const fileId = path.basename(req.params.filename);
        const userDir = path.join(process.cwd(), "uploads", uuid);

        if (!fs.existsSync(userDir)) return res.status(404).json({ message: "User directory not found" });

        const files = fs.readdirSync(userDir);
        const actualFile = files.find((f) => path.parse(f).name === fileId);

        if (!actualFile) return res.status(404).json({ message: "File not found" });

        const filePath = path.join(userDir, actualFile);
        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// --- START THE SERVER ---
app.listen(Number(port), bindAddress, (err?: Error) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running in ${isProd ? "PRODUCTION" : "DEVELOPMENT"} mode.`);
    console.log(`Listening on http://${bindAddress}:${port}`);
});
