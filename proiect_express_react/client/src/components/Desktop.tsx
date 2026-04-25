import React, { useState, useRef, useMemo } from 'react';
import DesktopIcon from './DesktopIcon';
import { SubWindow } from './SubWindow';
import "./Desktop.css";

import { useGrid } from '../hooks/useGrid';
import { useDesktopIcons } from '../hooks/useDesktopIcons';
import { useWindowManager } from '../hooks/useWindowManager';

import { GridContainer } from './GridContainer';

export default function Desktop({ onCellDrop }) {
    const [boxNumberPerRow] = useState(16);
    const { gridData, draggedBox, isLoading, isError, resetSelect, handleSelect, handleSwap } = useDesktopIcons();
    const { boxSize, containerRef, actualColumns } = useGrid(boxNumberPerRow, isLoading);
    const { windows, openWindow, closeWindow, bringToFront } = useWindowManager();


    if (isLoading) return <div>Loading Desktop...</div>;
    if (isError || !gridData) return <div>Failed to load icons!</div>;

    return (
        <>
            <GridContainer
                ref={containerRef}
                boxSize={boxSize}
                actualColumns={actualColumns}
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
                    />
                ))}
            </GridContainer>

            {windows.map(win => (
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