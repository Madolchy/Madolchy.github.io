import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Extend Express Request to hold validated data without mutating req.body/req.query/req.params
declare global {
    namespace Express {
        interface Request {
            validatedBody: Record<string, any>;
            validatedQuery: Record<string, string>;
            validatedParams: Record<string, string>;
        }
    }
}

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.validatedBody = schema.parse(req.body) as Record<string, any>;
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
            req.validatedParams = schema.parse(req.params) as Record<string, string>;
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
            req.validatedQuery = schema.parse(req.query) as Record<string, string>;
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
