import React, { useEffect, useState } from "react";
import "./DesktopIcon.css";
import { FileIconFactory } from "./IconFactory";
import { useBlob } from "../context/BlobContext";
import { ThumbnailService } from "../services/ThumbnailService";

// data is going to be a x * y grid, with cell being either undefined or an object
const DesktopIcon = React.memo(
    ({ id, data, isActive, onMouseUpCallback, onMouseDownCallback, onCellDrop, onDoubleClick, onContextMenu }: any) => {
        const [thumbUrl, setThumbUrl] = useState<string | null>(null);
        const { getUrl, revokeUrl } = useBlob();

        useEffect(() => {
            if (!data?.id) return;

            const fetchThumbnail = async () => {
                const blob = await ThumbnailService.getThumbnail(data?.id);
                if (blob) {
                    const url = getUrl(data?.id, blob);
                    setThumbUrl(url);
                }
            };

            fetchThumbnail();
            return () => {
                revokeUrl(data?.id);
            };
        }, [data?.id, data?.thumbnail, getUrl, revokeUrl]);

        return (
            <div
                id={`icon-${id}`}
                className="position-relative text-black bg-transparent d-flex align-items-center justify-content-center"
                draggable={false}
                onMouseDown={(e) => {
                    e.button === 2 ? onContextMenu(e, id) : onMouseDownCallback(id, data?.id);
                }}
                onMouseUp={(e) => onMouseUpCallback(id)}
                onDragStart={(e) => e.preventDefault()}
                onDrop={(e) => onCellDrop(e, id)}
                onDragOver={(e) => e.preventDefault()}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (onDoubleClick) onDoubleClick(id, data);
                }}
            >
                <div
                    className={`icon icon-grabbable d-flex align-items-center justify-content-center position-relative pe-none ${isActive ? "icon-highlight" : ""}`}
                    style={{ zIndex: 2 }}
                >
                    {thumbUrl ? (
                        <img
                            src={thumbUrl}
                            draggable={false}
                            className="w-100 h-100 object-fit-contain pe-none user-select-none native-drag-none"
                        />
                    ) : (
                        <FileIconFactory fileType={data?.fileType} />
                    )}
                </div>
            </div>
        );
    },
);
export default DesktopIcon;
