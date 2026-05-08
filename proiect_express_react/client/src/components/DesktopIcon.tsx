import React, { useEffect, useState } from "react";
import "./DesktopIcon.css";
import { FileIconFactory } from "./IconFactory";
import { useBlob } from "../context/BlobContext";
import { ThumbnailService } from "../services/ThumbnailService";
import { useQuery } from "@tanstack/react-query";

// data is going to be a x * y grid, with cell being either undefined or an object
const DesktopIcon = React.memo(
    ({ id, data, isActive, onMouseUpCallback, onMouseDownCallback, onCellDrop, onDoubleClick, onContextMenu }: any) => {
        const [thumbUrl, setThumbUrl] = useState<string | null>(null);
        const { getUrl, revokeUrl } = useBlob();

        const { data: blob } = useQuery({
            queryKey: ["file", data?.id],
            queryFn: () => ThumbnailService.getThumbnail(data?.id, data?.fileType),
            staleTime: Infinity,
            enabled: !!data?.id,
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
                    else onMouseDownCallback(id, data?.id);
                }}
                onMouseUp={() => onMouseUpCallback(id)}
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
                    className={`icon icon-grabbable flex items-center justify-center relative pointer-events-none ${isActive ? "icon-highlight" : ""}`}
                    style={{ zIndex: 2 }}
                >
                    <FileIconFactory fileType={data?.fileType} thumbUrl={thumbUrl} />
                </div>
            </div>
        );
    },
);
export default DesktopIcon;
