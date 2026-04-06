import React, { useCallback } from "react";
import { AuthService } from "../services/AuthService";
import { FileManagerService } from "../services/FileUploadService"
import { useQueryClient } from '@tanstack/react-query';

export default function DragDropZone({ children, onDropFiles }) {
    const queryClient = useQueryClient();

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(async (e: DragEvent, idx) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer || e.dataTransfer.files.length <= 0) {
            return
        }

        const token = AuthService.getToken();
        if (!token) return;

        const file = e.dataTransfer.files[0];
        const metadata = await FileManagerService.uploadFile(file, idx)

        if (!metadata) {
            console.log("Failed to upload file :C :C :C: C: :C: ")
            return
        }

        queryClient.setQueryData(['desktopIcons'], (oldData: any) => {
            if (!oldData) return oldData;
            return [...oldData, metadata];
        });

    }, [queryClient]);

    return (
        <>
            <div onDragOver={handleDragOver} onDrop={handleDrop}>
                {children}
            </div>
        </>
    )
}