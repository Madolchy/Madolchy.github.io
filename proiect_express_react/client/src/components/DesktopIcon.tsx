import React from "react";
import "./DesktopIcon.css";
import { FileIconFactory } from "./FileIconFactory";
import { useThumbnailCache } from "@/hooks/useThumbnailCache";
import type { DesktopItem } from "@/types/data";
import { getSelection, handleSelect, resetSelect, useIsSelected } from "@/context/IconSelectionContext";
import type { useDesktopDrop } from "@/hooks/useDesktopDrop";
import type { useWindowManager } from "@/context/WindowManagerContext";
import type { useDesktopIcons } from "@/hooks/useDesktopIcons";

interface DesktopIconProps {
    id: number;
    data: DesktopItem | undefined;
    onMouseUpCallback: ReturnType<typeof useDesktopIcons>["handleSwap"];
    onMouseDownCallback: typeof handleSelect;
    onCellDrop: ReturnType<typeof useDesktopDrop>;
    onDoubleClick: ReturnType<typeof useWindowManager>["openWindow"];
    onContextMenu: (e: React.MouseEvent, id: number) => void; // need to that function from desktop to somewhere else
}

const DesktopIcon = React.memo(
    ({
        id,
        data,
        onMouseDownCallback,
        onMouseUpCallback,
        onCellDrop,
        onDoubleClick,
        onContextMenu,
    }: DesktopIconProps) => {
        const isSelected = useIsSelected(id, data?.folderId ?? "root");
        const { id: itemId, type, url } = data ?? {};
        const thumbUrl = useThumbnailCache({ id: itemId, type, url });

        function handleMouseDown(e: React.MouseEvent) {
            const isRightClick = () => e.button === 2;

            if (isRightClick()) onContextMenu(e, id);
            else onMouseDownCallback(data?.folderId ?? "root", id, data?.id);
        }

        function handleDoubleClick(e: React.MouseEvent) {
            e.stopPropagation();
            onDoubleClick(id, data);
        }

        function handleMouseUp() {
            const sel = getSelection();
            if (!sel) return;

            onMouseUpCallback(sel.cell, id);
            resetSelect();
        }
        return (
            <div
                id={`icon-${id}`}
                className="relative text-foreground bg-transparent flex flex-col items-center justify-start"
                draggable={false}
                onMouseDown={(e) => {
                    handleMouseDown(e);
                }}
                onMouseUp={() => {
                    handleMouseUp();
                }}
                onDragStart={(e) => e.preventDefault()}
                onDrop={(e) => onCellDrop(e, id)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => e.preventDefault()}
                onDoubleClick={(e) => {
                    handleDoubleClick(e);
                }}
            >
                <div
                    className={`icon icon-grabbable flex items-center justify-center relative pointer-events-none ${isSelected ? "icon-highlight" : ""}`}
                    style={{ zIndex: 2 }}
                >
                    <FileIconFactory type={data?.type} thumbUrl={thumbUrl} />
                </div>
                <span
                    className={`text-xs text-center mt-1 pointer-events-none select-none w-full shrink-0 ${isSelected ? "whitespace-normal wrap-break-word" : "truncate"}`}
                >
                    {data?.name}
                </span>
            </div>
        );
    },
);
export default DesktopIcon;
