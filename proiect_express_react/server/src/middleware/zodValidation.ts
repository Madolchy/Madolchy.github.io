import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: error.flatten().fieldErrors,
                });
            }
            next(error);
        }
    };
}

export function validateParams<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params) as Record<string, string>;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: "Invalid route parameters",
                    details: error.flatten().fieldErrors,
                });
            }
            next(error);
        }
    };
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query) as Record<string, string>;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: "Invalid query parameters",
                    details: error.flatten().fieldErrors,
                });
            }
            next(error);
        }
    };
}
