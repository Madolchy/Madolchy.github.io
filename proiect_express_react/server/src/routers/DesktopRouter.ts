import { Router, type Request, type Response } from "express";
import { DBService } from "../db/DBService.js";
import { requireLogin } from "../middleware/RequireLogin.js";
import { VisitCounter } from "../middleware/VisitCounter.js";
import type { FileManager } from "../interfaces/storage.js";

export function createDesktopRouter(fm: FileManager) {
    const desktopRouter = Router();

    desktopRouter.get("/background", requireLogin, async (req: Request, res: Response) => {
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

    desktopRouter.post("/background", requireLogin, async (req: Request, res: Response) => {
        const uuid = req.auth!.id;

        const { backgroundUuid } = req.body;
        if (!backgroundUuid) return res.status(400).json({ success: false, message: "Background is required" });

        const result = await DBService.setUserBackground(uuid, backgroundUuid);
        if (result.success) {
            return res.status(200).json({ success: true, message: "Background set successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Failed to set background" });
        }
    });

    desktopRouter.post("/folder", requireLogin, async (req: Request, res: Response) => {
        const uuid = req.auth!.id;
        const rootFolderId = req.auth!.rootFolderId;
        const { folderName, folderId, cell } = req.body;

        if (!folderName || !folderId || cell == null) {
            return res.status(400).json({ success: false, message: "folderName and id and cell required" });
        }

        const result = await DBService.createUserFolder(uuid, rootFolderId, folderName, folderId, cell);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true, data: result.data });
    });

    desktopRouter.delete("/folder/:id", requireLogin, async (req: Request, res: Response) => {
        const uuid = req.auth!.id;
        const folderId = req.params.id;

        if (!folderId) {
            return res.status(400).json({ success: false, message: "folderId required" });
        }

        if (folderId === "root") {
            return res.status(400).json({ success: false, message: "Cannot delete root folder" });
        }

        const result = await DBService.deleteFolder(uuid, folderId);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true });
    });

    desktopRouter.get("/desktop", requireLogin, async (req: Request, res: Response) => {
        if (!fm) return res.status(501).json({ message: "This feature is currently disabled." });

        const uuid = req.auth.id;
        const rootFolderId = req.auth.rootFolderId;
        const folderId = String(req.query.folderId);
        if (!folderId) return res.status(400).json({ success: false, message: "folderId required" });

        const { items, version } = await DBService.getUserDesktop(uuid, rootFolderId, folderId);

        const withUrl = items.map((item) => ({
            ...item,
            url: fm.getFileUrl(item.id),
        }));

        return res.status(200).json({ items: withUrl, version });
    });

    desktopRouter.put("/desktop", requireLogin, async (req: Request, res: Response) => {
        const uuid = req.auth!.id;
        const rootFolderId = req.auth!.rootFolderId;
        const { newDesktop, folderId, version } = req.body;
        if (!folderId) return res.status(400).json({ success: false, message: "folderId required" });
        if (version == null) return res.status(400).json({ success: false, message: "version required" });

        const result = await DBService.updateUserDesktop(uuid, rootFolderId, folderId, newDesktop, version);

        if (!result.success) {
            const status = result.message === "Version conflict" ? 409 : 400;
            return res.status(status).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true });
    });

    return desktopRouter;
}
