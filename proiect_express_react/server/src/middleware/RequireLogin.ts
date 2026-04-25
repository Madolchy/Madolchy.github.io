import { expressjwt } from "express-jwt";
import { AuthService } from "../services/AuthService.js";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

export const jwtMiddleware = expressjwt({
    secret: JWT_SECRET as string,
    algorithms: ["HS256"],
});

export const requireLogin = (req: Request, res: Response, next: NextFunction) => {
    jwtMiddleware(req, res, (err) => {
        if (err) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized: Invalid or missing access token" 
            });
        }
        next();
    });
};