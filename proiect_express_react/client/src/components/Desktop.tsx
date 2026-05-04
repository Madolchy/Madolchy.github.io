import React, { useState } from "react";
import DesktopIcon from "./DesktopIcon";
import { SubWindow } from "./SubWindow";
import "./Desktop.css";

import { useGrid } from "../hooks/useGrid";
import { useDesktopIcons } from "../hooks/useDesktopIcons";
import { useWindowManager } from "../hooks/useWindowManager";

import { GridContainer } from "./GridContainer";
import ContextMenu from "./ContextMenu";
import { useContextMenu } from "../hooks/useContextMenu";
import { useDesktopManager } from "../hooks/useDesktopManager";

export default function Desktop({ onCellDrop }) {
    const [boxNumberPerRow] = useState(16);
    const { gridData, draggedBox, isLoading, isError, resetSelect, handleSelect, handleSwap } = useDesktopIcons();
    const { boxSize, containerRef, actualColumns } = useGrid(boxNumberPerRow, isLoading);
    const { windows, openWindow, closeWindow, bringToFront } = useWindowManager();
    const { contextActiveId, contextPosition, openContext, closeContext } = useContextMenu();
    const { backgroundUrl, availableContextActions } = useDesktopManager(contextActiveId, gridData);

    if (isLoading) return <div>Loading Desktop...</div>;
    if (isError || !gridData) return <div>Failed to load icons!</div>;

    return (
        <>
            <GridContainer
                ref={containerRef}
                boxSize={boxSize}
                actualColumns={actualColumns}
                onContextMenu={(e) => e.preventDefault()}
                backgroundImage={backgroundUrl}
            >
                {gridData.map((data, index) => (
                    <DesktopIcon
                        key={data?.id || index}
                        id={index}
                        data={data}
                        isActive={draggedBox === index}
                        onMouseDownCallback={handleSelect}
                        onMouseUpCallback={handleSwap}
                        onCellDrop={onCellDrop}
                        onDoubleClick={openWindow}
                        onContextMenu={openContext}
                    />
                ))}
            </GridContainer>

            <ContextMenu
                isActive={contextActiveId !== null}
                position={contextPosition}
                availableContextActions={availableContextActions}
                closeContext={closeContext}
            />

            {windows.map((win) => (
                <SubWindow
                    key={win.id}
                    windowData={win}
                    onClose={closeWindow}
                    onDragStart={resetSelect}
                    onBringToFront={bringToFront}
                />
            ))}
        </>
    );
}
