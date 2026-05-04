import React from "react";
import { Rnd } from "react-rnd";
import { useBlob } from "../context/BlobContext";
import { FileManagerService } from "../services/FileManagerService";
import { FileFactory } from "./FileFactory";
import "./SubWindow.css";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { X } from "lucide-react";

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
            dragHandleClassName="window-draggable"
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
            minWidth={300}
            minHeight={250}

            // enableUserSelectHack={false}
        >
            <Card className="w-full h-full window-draggable flex flex-col p-4 overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between p-0 mb-3 flex-none">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>Elysia</BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>Elysia</BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Button variant="ghost" size="icon" className="h-auto p-1 -mt-1" onClick={() => onClose(id)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </CardHeader>

                <CardContent className="p-0 flex-1 min-h-0">
                    <div className="w-full h-full overflow-hidden rounded-md">
                        <FileFactory uuid={data.id} thumbnail={data?.thumbnail} fileType={data?.fileType} />
                    </div>
                </CardContent>
            </Card>
            {/*<div className="windowDraggable h-full">
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
            </div>*/}
        </Rnd>
    );
});
