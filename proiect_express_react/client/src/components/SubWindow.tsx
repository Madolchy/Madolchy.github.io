import React from "react";
import { Rnd } from "react-rnd";
import { FileFactory } from "./FileFactory";
import "./SubWindow.css";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useIconSelection } from "../context/IconSelectionContext";

interface WindowData {
    id: string | number;
    title: string;
    zIndex: number;
    data: {
        id: string;
        type: string;
        name: string;
        thumbnail?: Blob;
    };
}

interface SubWindowProps {
    onDragStart: () => void;
    windowData: WindowData;
    onClose: (winId: string | number) => void;
    onBringToFront: (winId: string | number) => void;
}

export const SubWindow = React.memo(function SubWindow({
    onDragStart,
    windowData,
    onClose,
    onBringToFront,
}: SubWindowProps) {
    const { resetSelect } = useIconSelection();
    const { title, zIndex, data, id } = windowData;

    const defaultPosition = {
        x: 300,
        y: 400,
        width: 320,
        height: 200,
    };

    return (
        <Rnd
            default={defaultPosition}
            dragHandleClassName="window-draggable"
            onDragStart={() => {
                onBringToFront(id);
                onDragStart();
            }}
            onMouseDown={(e) => {
                onBringToFront(id);
                if (e.target.closest(".window-draggable")) resetSelect();
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
            onContextMenu={(e) => e.preventDefault()}
        >
            <Card className="w-full h-full flex flex-col p-4 overflow-hidden">
                <CardHeader className="flex flex-row window-draggable items-start justify-between p-0 mb-3 flex-none">
                    <Breadcrumb className="flex-1 min-w-0">
                        <BreadcrumbList>
                            <BreadcrumbItem className="truncate block">{title}</BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Button variant="ghost" size="icon" className="h-auto p-1 -mt-1" onClick={() => onClose(id)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </CardHeader>

                <CardContent className="p-0 flex-1 min-h-0">
                    <div className="w-full h-full overflow-hidden rounded-md">
                        <FileFactory data={data} />
                    </div>
                </CardContent>
            </Card>
        </Rnd>
    );
});
