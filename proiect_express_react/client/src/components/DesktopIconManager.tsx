import React, { useCallback } from "react";
import Desktop from "./Desktop";
import { FileManagerService } from "../services/FileManagerService";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "../store/db";
import { WindowManagerProvider } from "@/context/WindowManagerProvider";
import { ContextMenuProvider } from "@/context/ContextMenuProvider";
import { DesktopManagerProvider } from "@/context/DesktopManagerProvider";

export default function DesktopIconManager() {
    const queryClient = useQueryClient();

    const handleDropOnCell = useCallback(
        async (e: React.DragEvent<HTMLDivElement>, cellId: number) => {
            e.preventDefault();
            e.stopPropagation();

            if (!e.dataTransfer || e.dataTransfer.files.length <= 0) return;

            const files = Array.from(e.dataTransfer.files);

            files.forEach(async (file) => {
                const metadata = await FileManagerService.uploadFile(file, cellId);
                if (!metadata) return;

                queryClient.setQueryData(["desktopIcons"], (oldData: any) => {
                    if (!oldData) return [metadata];
                    const newGrid = [...oldData];
                    newGrid[cellId] = metadata;
                    return newGrid;
                });
            });
        },
        [queryClient],
    );

    return (
        <>
            <WindowManagerProvider>
                <ContextMenuProvider>
                    <DesktopManagerProvider>
                        <Desktop onCellDrop={handleDropOnCell} />
                    </DesktopManagerProvider>
                </ContextMenuProvider>
            </WindowManagerProvider>
        </>
    );
}
