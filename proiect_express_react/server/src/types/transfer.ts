import z from "zod";

export const FileTransferDeleteSchema = z.object({
    backgroundUuid: z.string().length(36),
});
