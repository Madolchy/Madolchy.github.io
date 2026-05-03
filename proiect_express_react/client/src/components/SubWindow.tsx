import React from "react";
import { Rnd } from "react-rnd";
import { useBlob } from "../context/BlobContext";
import { FileManagerService } from "../services/FileManagerService";
import { FileFactory } from "./FileFactory";

export const SubWindow = React.memo(function SubWindow({ onDragStart, windowData, onClose, onBringToFront }) {
    const { title, zIndex, data, id } = windowData;

    const defaultPosition = React.useMemo(
        () => ({
            x: 300,
            y: 400,
            width: 320,
            height: 200,
        }),
        [],
    );

    return (
        <Rnd
            default={defaultPosition}
            bounds="window"
            dragHandleClassName="window-header"
            onDragStart={() => {
                onBringToFront(id);
                onDragStart();
            }}
            onMouseDown={() => {
                onBringToFront(id);
            }}
            style={{
                zIndex,
                top: 0,
                left: 0,
                willChange: "transform",
                userSelect: "none",
            }}

            // enableUserSelectHack={false}
        >
            <div className="border bg-card h-full flex flex-col shadow-sm">
                <div
                    className="window-header bg-primary text-primary-foreground px-2 flex justify-between items-center"
                    style={{ cursor: "grab" }}
                >
                    <span className="truncate" style={{ fontSize: "0.9rem" }}>
                        {title || data?.name || "Window"}
                    </span>
                    <button
                        className="p-0 ms-2 size-5 flex items-center justify-center rounded text-destructive hover:bg-destructive/20 text-sm leading-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(id);
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div className="flex-1 overflow-hidden bg-muted">
                    <FileFactory uuid={data.id} thumbnail={data?.thumbnail} fileType={data?.fileType} />
                </div>
            </div>
        </Rnd>
    );
});
