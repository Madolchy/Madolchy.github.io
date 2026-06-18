import { Router, type Request, type Response } from "express";
import { DBService } from "../db/DBService.js";
import { requireLogin } from "../middleware/RequireLogin.js";
import { VisitCounter } from "../middleware/VisitCounter.js";

const desktopRouter = Router();

desktopRouter.get("/background", requireLogin, async (req: Request, res: Response) => {
    const result = await DBService.getUserBackground(req);
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
    const result = await DBService.setUserBackground(req);
    console.log("Api Background: ", result);
    if (result.success) {
        return res.status(200).json({ success: true, message: "Background set successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Failed to set background" });
    }
});

desktopRouter.post("/folder", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth!.id;
    const { folderName, folderId, cell } = req.body;

    if (!folderName || !folderId || cell == null) {
        return res.status(400).json({ success: false, message: "folderName and id and cell required" });
    }

    const result = await DBService.createUserFolder(uuid, folderName, folderId, cell);
    console.log(result);
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

desktopRouter.get("/desktop", VisitCounter, requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth.id;
    const folderId = String(req.query.folderId);
    if (!folderId) return res.status(400).json({ success: false, message: "folderId required" });

    const { items, version } = await DBService.getUserDesktop(uuid, folderId);

    const r2Base = process.env.R2_PUBLIC_URL || "";
    const withUrl = items.map((item) => ({ ...item, url: r2Base ? `${r2Base}/${item.id}` : undefined }));

    return res.status(200).json({ items: withUrl, version });
});

desktopRouter.put("/desktop", requireLogin, async (req: Request, res: Response) => {
    const uuid = req.auth!.id;
    const { newDesktop, folderId, version } = req.body;
    if (!folderId) return res.status(400).json({ success: false, message: "folderId required" });
    if (version == null) return res.status(400).json({ success: false, message: "version required" });

    const result = await DBService.updateUserDesktop(uuid, folderId, newDesktop, version);

    if (!result.success) {
        const status = result.message === "Version conflict" ? 409 : 400;
        return res.status(status).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true });
});

export { desktopRouter };
