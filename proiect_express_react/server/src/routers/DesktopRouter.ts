import { Router, type Request, type Response } from "express";
import { DBService } from "../db/DBService.js";
import { requireLogin } from "../middleware/RequireLogin.js";
import type { FileManager } from "../interfaces/storage.js";
import { validateBody, validateParams, validateQuery } from "../middleware/zodValidation.js";
import {
    BackgroundRequestSchema,
    DesktopGetRequestSchema,
    DesktopPutRequetSchema,
    FolderDeleteRequestSchema,
    FolderPostRequestSchema,
} from "../types/desktop.js";
import { FolderDeleteArgsSchema } from "../generated/zod/index.js";

export function createDesktopRouter(fm: FileManager) {
    const desktopRouter = Router();
    desktopRouter.use(requireLogin);

    desktopRouter.get("/background", async (req: Request, res: Response) => {
        if (!fm) return res.status(501).json({ message: "This feature is currently disabled." });

        const uuid = req.auth!.id;

        const result = await DBService.getUserBackground(uuid, fm);
        if (result.success && !result.data) {
            return res.status(200).json({ success: true, message: "User has no background set" });
        }
        if (result.success && result.data) {
            return res.status(200).json({ success: true, backgroundUrl: result.data.backgroundUrl });
        } else {
            return res.status(400).json({ success: false, message: "Could not find background" });
        }
    });

    desktopRouter.post("/background", validateBody(BackgroundRequestSchema), async (req: Request, res: Response) => {
        const uuid = req.auth!.id;

        const { backgroundUuid } = req.validatedBody;
        const result = await DBService.setUserBackground(uuid, backgroundUuid);
        if (result.success) {
            return res.status(200).json({ success: true, message: "Background set successfully" });
        }

        return res.status(400).json({ success: false, message: "Failed to set background" });
    });

    desktopRouter.post("/folder", validateBody(FolderPostRequestSchema), async (req: Request, res: Response) => {
        const { id: uuid } = req.auth!;
        const { folderName, folderId, cell } = req.validatedBody;

        const result = await DBService.createUserFolder(uuid, folderName, folderId, cell);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, data: result.data });
    });

    desktopRouter.delete("/folder/:id", validateParams(FolderDeleteRequestSchema), async (req: Request, res: Response) => {
        const uuid = req.auth!.id;
        const folderId = req.validatedParams.id;

        if (folderId === "root") {
            return res.status(400).json({ success: false, message: "Cannot delete root folder" });
        }

        const result = await DBService.deleteFolder(uuid, folderId);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true });
    });

    desktopRouter.get("/desktop", validateQuery(DesktopGetRequestSchema), async (req: Request, res: Response) => {
        if (!fm) return res.status(501).json({ message: "This feature is currently disabled." });
        const uuid = req.auth!.id;

        const folderId = String(req.validatedQuery.folderId);
        if (!folderId) return res.status(400).json({ success: false, message: "folderId required" });

        const { items, folders, version } = await DBService.getUserDesktop(uuid, folderId);

        const desktopItems = [
            ...items.map((item) => ({ ...item, url: fm.getFileUrl(item.id) })),
            ...folders.map((f) => ({ ...f, type: "type/folder", folderId: f.parentId ?? folderId })),
        ];

        return res.status(200).json({ items: desktopItems, version });
    });

    desktopRouter.put("/desktop", validateBody(DesktopPutRequetSchema), async (req: Request, res: Response) => {
        const uuid = req.auth!.id;
        const { newDesktop, folderId, version } = req.validatedBody;

        const result = await DBService.updateUserDesktop(uuid, folderId, newDesktop, version);
        if (!result.success) {
            const status = result.message === "Version conflict" ? 409 : 400;
            return res.status(status).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, newVersion: result.newVersion });
    });

    return desktopRouter;
}
