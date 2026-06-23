import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import ms from "ms";

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export const authLimiter = isTest
    ? (req: Request, res: Response, next: NextFunction) => next()
    : rateLimit({
          windowMs: ms("1m"),
          max: 3,
          message: { success: false, message: "Too many attempts, please try again later." },
      });
