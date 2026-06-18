import { Router, type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";
import ms from "ms";
import { DBService } from "../db/DBService.js";
import { AuthService } from "../services/AuthService.js";
import { requireLogin } from "../middleware/RequireLogin.js";
import { logger } from "../app.js";

const authRouter = Router();
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const authLimiter = isTest
    ? (req: Request, res: Response, next: NextFunction) => next()
    : rateLimit({
          windowMs: ms("1m"),
          max: 3,
          message: { success: false, message: "Too many attempts, please try again later." },
      });

authRouter.post("/register", authLimiter, async (req: Request, res: Response) => {
    if (isProd && !isTest)
        return res.status(503).json({ success: false, message: "Registration is currently disabled" });

    const result = await DBService.registerUser(req);
    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, message: "yay" });
});

authRouter.post("/login", authLimiter, async (req: Request, res: Response) => {
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

authRouter.post("/refresh", async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("Refresh Token is: ", refreshToken);
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

    const decoded = AuthService.verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    const token = AuthService.generateToken({ id: decoded.id, rootFolderId: decoded.rootFolderId });
    return res.status(200).json({ success: true, token: token });
});

authRouter.post("/logout", requireLogin, async (req: Request, res: Response) => {
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

export { authRouter };
