import jwt from "jsonwebtoken";
import type { jwtData } from "../types/jwt.js";
import { TokenType } from "../types/jwt.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const AuthService = {
    generateToken: (payload: jwtData) => {
        return jwt.sign({ ...payload, tokenType: TokenType.ACCESS }, JWT_SECRET, { expiresIn: "20m" });
    },

    generateRefreshToken: (payload: jwtData) => {
        return jwt.sign({ ...payload, tokenType: TokenType.REFRESH }, JWT_SECRET, { expiresIn: "7d" });
    },

    decodeToken: (token: string) => jwt.verify(token, JWT_SECRET) as jwtData,
    verifyRefreshToken: (token: string): jwtData | null => {
        try {
            const decoded = AuthService.decodeToken(token);
            if (decoded.tokenType !== TokenType.REFRESH) {
                console.error("Attempted to use a non-refresh token for a refresh operation");
                return null;
            }

            return decoded;
        } catch (error) {
            return null;
        }
    },
};
