import React from "react";
import DesktopGrid from "./DesktopGrid";
import useThumbnail from "../hooks/useThumbnail";
import { FileManagerService } from "../services/FileUploadService";
import { useQueryClient } from '@tanstack/react-query';
import { getDB } from "../store/db";

export default function DesktopIconManager() {
    const queryClient = useQueryClient();
    const { processImages, isResizing } = useThumbnail(128, 128);

    const handleDropOnCell = async (e: React.DragEvent<HTMLDivElement>, cellId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer || e.dataTransfer.files.length <= 0) return;

        // const files = Array.from(e.dataTransfer.files);
        const file = e.dataTransfer.files[0]
        const metadata = await FileManagerService.uploadFile(file, cellId);

        if (metadata) {
            queryClient.setQueryData(['desktopIcons'], (oldData: any) => {
                if (!oldData) return [metadata];
                return [...oldData, metadata];
            });
        }

        const db = await getDB();
        const results = await processImages([file])
        results.forEach((result, idx) => {
            if (!result.success) {
                console.error("Failed on: ", result)
            }
            


        })
    };

    return (
        <>
            {/* {isResizing && (
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50 z-index-master">
                    Creating icons...
                </div>
            )} */}

            <DesktopGrid onCellDrop={handleDropOnCell} />
        </>
    );
}

