import React, { useEffect, useState, type RefObject } from "react";
import "./DesktopIcon.css";
import { FileIconFactory } from "./FileIconFactory";
import { useBlob } from "../context/BlobContext";
import { ThumbnailService } from "../services/ThumbnailService";
import { useQuery } from "@tanstack/react-query";
import type { DesktopItem } from "@/types/data";
import type { SelectionState } from "@/context/IconSelectionContext";
import { useIsSelected } from "@/context/IconSelectionContext";

interface DesktopIconProps {
    id: number;
    data: DesktopItem;
    selectionRef: RefObject<SelectionState>;
    resetSelect: () => void;
    onMouseUpCallback: (currentPosition: number, newPosition: number) => void;
    onMouseDownCallback: (folderId: string, cell: number, uuid: string) => void;
    onCellDrop: (e: React.DragEvent, cellId: number) => void;
    onDoubleClick: (id: number, data: any) => void;
    onContextMenu: (e: React.MouseEvent, id: number) => void;
}

const DesktopIcon = React.memo(
    ({
        id,
        data,
        selectionRef,
        resetSelect,
        onMouseDownCallback,
        onMouseUpCallback,
        onCellDrop,
        onDoubleClick,
        onContextMenu,
    }: DesktopIconProps) => {
        const isSelected = useIsSelected(id, data?.folderId ?? "root");
        const [thumbUrl, setThumbUrl] = useState<string | null>(null);
        const { getUrl, revokeUrl } = useBlob();

        const { data: blob } = useQuery({
            queryKey: ["file", data?.id],
            queryFn: () => ThumbnailService.getThumbnail(data?.id, data?.type),
            staleTime: Infinity,
            enabled: !!data?.id && data?.type !== "type/folder",
        });

        useEffect(() => {
            if (!blob) return;

            const url = getUrl(data?.id, blob);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThumbUrl(url);
            return () => {
                revokeUrl(data?.id);
            };
        }, [blob, data?.id, data?.thumbnail, getUrl, revokeUrl]);

        return (
            <div
                id={`icon-${id}`}
                className="relative text-foreground bg-transparent flex items-center justify-center"
                draggable={false}
                onMouseDown={(e) => {
                    if (e.button === 2) onContextMenu(e, id);
                    else onMouseDownCallback(data.folderId, id, data?.id);
                }}
                onMouseUp={(e) => {
                    if (!selectionRef.current) return;
                    onMouseUpCallback(selectionRef.current.cell, id);
                    resetSelect();
                }}
                onDragStart={(e) => e.preventDefault()}
                onDrop={(e) => onCellDrop(e, id)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => e.preventDefault()}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (onDoubleClick) onDoubleClick(id, data);
                }}
            >
                <div
                    className={`icon icon-grabbable flex items-center justify-center relative pointer-events-none ${isSelected ? "icon-highlight" : ""}`}
                    style={{ zIndex: 2 }}
                >
                    <FileIconFactory type={data?.type} thumbUrl={thumbUrl} />
                </div>
            </div>
        );
    },
);
export default DesktopIcon;
