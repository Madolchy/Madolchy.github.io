import type { Request, Response } from "express";

export interface AuthRequest extends Request {
    auth: { id: string; rootFolderId: string };
}
