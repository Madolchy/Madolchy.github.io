import React, { useState, useRef, useMemo } from 'react';
import DesktopIcon from './DesktopIcon';
import "./DesktopGrid.css";

import { useGrid } from '../hooks/useGrid';
import { useDesktopIcons } from '../hooks/useDesktopIcons';

export default function DesktopGrid({ handleDrop, handleDragOver }) {
    const [boxNumberPerRow, setBoxNumberPerRow] = useState(16);
    const containerRef = useRef<HTMLDivElement>(null);

    const { gridData, isLoading, isError, handleSelect, handleSwap } = useDesktopIcons();

    const boxSize = useGrid(containerRef, boxNumberPerRow, isLoading);

    const items = useMemo(() => {
        if (!gridData) return [];

        const gridArray = Array.from({ length: boxNumberPerRow * boxNumberPerRow });
        gridData.forEach((element) => { gridArray[element.cell] = element; });
        
        return gridArray;
    }, [gridData, boxNumberPerRow]);

    if (isLoading) return <div>Loading Desktop...</div>;
    if (isError || !gridData) return <div>Failed to load icons!</div>;

    return (
        <div
            ref={containerRef}
            className="w-100 vh-100 dynamic-grid-container flex-grow-1 border border-dark p-0"
            style={{
                '--box-width': `${boxSize.width}px`,
                '--box-height': `${boxSize.height}px`,
                '--box-count': boxNumberPerRow
            } as React.CSSProperties}
        >
            {items.map((data, index) => (
                <DesktopIcon
                    key={index}
                    id={index}
                    data={data}
                    onMouseDownCallback={handleSelect}
                    onMouseUpCallback={handleSwap}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                />
            ))}
        </div>
    );
}