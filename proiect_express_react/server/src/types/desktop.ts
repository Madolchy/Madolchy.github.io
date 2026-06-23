import { z } from "zod";
import { fileIdLength } from "../config.js";

export const FolderBaseSchema = z.object({
    folderId: z.string().length(24),
});

export const DesktopItemDataSchema = FolderBaseSchema.extend({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    cell: z.number(),
    bytes: z.number().nullable().optional(), // Handles both 'null' and '?' (undefined)
});
export type DesktopItemData = z.infer<typeof DesktopItemDataSchema>;

export const FolderPostRequestSchema = FolderBaseSchema.extend({
    folderName: z.string().min(1),
    cell: z.number().int().min(1).max(1024),
});

export const FolderDeleteRequestSchema = FolderBaseSchema;
export const DesktopGetRequestSchema = FolderBaseSchema;
export const DesktopPutRequetSchema = FolderBaseSchema.extend({
    newDesktop: z.array(DesktopItemDataSchema),
    version: z.number().int().min(0),
});

export const BackgroundRequestSchema = z.object({
    backgroundUuid: z.string().length(fileIdLength * 2), // 12 byte count = 24 characters
});
