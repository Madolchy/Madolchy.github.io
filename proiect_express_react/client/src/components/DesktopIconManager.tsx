import React, { useCallback } from "react";
import Desktop from "./Desktop";
import useThumbnail from "../hooks/useThumbnail";
import { FileManagerService } from "../services/FileManagerService";
import { useQueryClient } from '@tanstack/react-query';
import { db, getDB } from "../store/db";
import { meta } from "zod/v4/core";


async function onResizeDone(result, index) {

}


export default function DesktopIconManager() {
    const queryClient = useQueryClient();
    const { processImage } = useThumbnail(128, 128);

    const handleDropOnCell = useCallback(async (e: React.DragEvent<HTMLDivElement>, cellId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer || e.dataTransfer.files.length <= 0) return;

        const files = Array.from(e.dataTransfer.files);

        files.forEach(async (file) => {
            const metadata = await FileManagerService.uploadFile(file, cellId);
            if (!metadata) return;

            queryClient.setQueryData(['desktopIcons'], (oldData: any) => {
                if (!oldData) return [metadata];
                return [...oldData, metadata];
            });

            processImage(file).then((result: any) => {
                if (!result.success) {
                    console.error("Failed to process image: ", result.error);
                    return
                }

                console.log(`Image finished! Saving to DB...`);
                db.saveThumbnail(metadata.id, result.blob);

                queryClient.setQueryData(['desktopIcons'], (oldData: any) => {
                    if (!oldData) return oldData;

                    const newData = oldData.map(icon =>
                        icon.id === metadata.id ? { ...icon, thumbnail: result.blob } : icon
                    );

                    console.log("After the map, newData is: ", newData);
                    return newData;
                });
            });
        });
    }, [queryClient, processImage]);

    return (
        <>
            <Desktop onCellDrop={handleDropOnCell} />
        </>
    );
}

