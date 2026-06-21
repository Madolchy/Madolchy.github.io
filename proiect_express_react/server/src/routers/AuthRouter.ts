import { Router, type Request, type Response, type NextFunction } from "express";
import ms from "ms";
import { DBService } from "../db/DBService.js";
import { AuthService } from "../services/AuthService.js";
import { requireLogin } from "../middleware/RequireLogin.js";
import { logger } from "../app.js";
import { validateBody } from "../middleware/zodValidation.js";
import { LoginSchema, SignupRequestSchema } from "../types/login.js";
import { authLimiter } from "../middleware/authLimiter.js";
import { TokenType } from "../types/jwt.js";

const authRouter = Router();
const isProd = () => process.env.NODE_ENV === "production";
const isTest = () => process.env.NODE_ENV === "test";

authRouter.post("/register", authLimiter, validateBody(SignupRequestSchema), async (req: Request, res: Response) => {
    if (isProd() && !isTest())
        return res.status(503).json({ success: false, message: "Registration is currently disabled" });

    const { name, password, email } = req.body;

    const result = await DBService.registerUser(name, password, email);
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Failed to create user" });
    }

    return res.status(200).json({ success: true, message: "User has been created." });
});

authRouter.post("/login", authLimiter, validateBody(LoginSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await DBService.loginUser(email, password);
    if (!result.success || !result.user) {
        return res.status(401).json({ success: false, message: "Login failed." });
    }

    const token = AuthService.generateToken({
        id: result.user.uuid,
        rootFolderId: result.rootFolderId,
        tokenType: TokenType.ACCESS,
    });
    const refreshToken = AuthService.generateRefreshToken({
        id: result.user.uuid,
        rootFolderId: result.rootFolderId,
        tokenType: TokenType.REFRESH,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd() || process.env.SECURE_COOKIE === "true",
        sameSite: isProd() ? "none" : "lax",
        maxAge: ms("7d"),
    });

    return res.status(200).json({ success: true, token: token });
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

    const decoded = AuthService.verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    const token = AuthService.generateToken({
        id: decoded.id,
        rootFolderId: decoded.rootFolderId,
        tokenType: TokenType.ACCESS,
    });
    return res.status(200).json({ success: true, token: token });
});

authRouter.post("/logout", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth!.id;
    const result = await DBService.logoutUser(uuid);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd() || process.env.SECURE_COOKIE === "true",
        sameSite: isProd() ? "none" : "lax",
    });

    if (!result.success) {
        return res.status(400).json({ success: false, message: "Logout failed" });
    }
    return res.status(200).json({ success: true });
});

export { authRouter };
