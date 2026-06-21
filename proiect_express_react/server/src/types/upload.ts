import z from "zod";
import { DesktopItemSchema } from "../generated/zod/index.js";

export const FileUploadInputSchema = DesktopItemSchema.pick({
    folderId: true,
}).extend({
    cell: z.coerce.number({ message: "Index must be a valid number" }).int(),
});
