import { FileManagerService } from "@/services/FileManagerService";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useDesktopDrop(folderId: string) {
    const queryClient = useQueryClient();

    return useCallback(
        async (e: React.DragEvent, cellId: number) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.dataTransfer?.files.length) return;

            const files = Array.from(e.dataTransfer.files);
            files.forEach(async (file) => {
                console.log("Attempting to upload file: ", file);
                const metadata = await FileManagerService.uploadFile(file, cellId, folderId);
                if (!metadata) return;

                queryClient.setQueryData(["desktopIcons", folderId], (old: any) => {
                    if (!old) return [metadata];
                    const next = [...old];
                    next[cellId] = metadata;
                    console.log("[useDesktopDrop] old data: ", old, " new data: ", next);
                    return next;
                });
            });
        },
        [queryClient, folderId],
    );
}
