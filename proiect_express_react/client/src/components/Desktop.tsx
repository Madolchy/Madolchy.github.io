import React, { useState, useCallback, useMemo } from "react";
import DesktopIcon from "./DesktopIcon";
import "./Desktop.css";

import { useGrid } from "../hooks/useGrid";
import { useDesktopIcons } from "../hooks/useDesktopIcons";

import { GridContainer } from "./GridContainer";
import { useWindowManager } from "@/context/WindowManagerContext";
import { useDesktopManager } from "@/context/DesktopManagerContext";
import { useDesktopActions } from "@/hooks/useDesktopActions";
import { useContextMenu } from "@/context/ContextMenuContext";
import { useDesktopDrop } from "@/hooks/useDesktopDrop";
import { handleSelect } from "@/context/IconSelectionContext";
import type { DesktopItem } from "@/types/data";

export default function Desktop({ folderId = "root", boxPerRow = 16 }) {
    const [boxNumberPerRow] = useState(boxPerRow);
    const onCellDrop = useDesktopDrop(folderId);

    const { gridData, isLoading, isError, handleSwap } = useDesktopIcons(folderId, boxPerRow);
    const { boxSize, containerRef, actualColumns } = useGrid(boxNumberPerRow, isLoading);
    const { openWindow } = useWindowManager();
    const { backgroundUrl } = useDesktopManager();
    const { openContext } = useContextMenu();
    const { getActionsForId } = useDesktopActions(folderId);

    const handleContextMenu = useCallback(
        (e: React.MouseEvent, id: number) => {
            const actions = getActionsForId(id);
            openContext(e, id, actions);
        },
        [openContext, getActionsForId],
    );

    if (isLoading) return <div>Loading Desktop...</div>;
    if (isError || !gridData) return <div>Failed to load icons!</div>;

    return (
        <GridContainer
            ref={containerRef}
            boxSize={boxSize}
            actualColumns={actualColumns}
            onContextMenu={(e) => e.preventDefault()}
            backgroundImage={backgroundUrl}
        >
            {gridData.map((data: DesktopItem, index: number) => (
                <DesktopIcon
                    key={data?.id || index}
                    id={index}
                    data={data}
                    onMouseUpCallback={handleSwap}
                    onMouseDownCallback={handleSelect}
                    onCellDrop={onCellDrop}
                    onDoubleClick={openWindow}
                    onContextMenu={handleContextMenu}
                />
            ))}
        </GridContainer>
    );
}
