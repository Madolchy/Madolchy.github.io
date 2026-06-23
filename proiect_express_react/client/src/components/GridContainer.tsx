import React, { forwardRef } from 'react';
import './GridContainer.css';

interface GridContainerProps {
    boxSize: { width: number; height: number };
    actualColumns: number;
    children: React.ReactNode;
    onContextMenu?: (e: React.MouseEvent) => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    backgroundImage?: string;
}

export const GridContainer = React.memo(forwardRef<HTMLDivElement, GridContainerProps>(
    ({ boxSize, actualColumns, children, onContextMenu, onMouseDown, backgroundImage }, ref) => {
        return (
            <div
                ref={ref}
                onContextMenu={onContextMenu}
                onMouseDown={onMouseDown}
                className="grid-container-layout dynamic-grid-container"
                style={{
                    '--box-width': `${boxSize.width}px`,
                    '--box-height': `${boxSize.height}px`,
                    '--box-count': actualColumns,
                    ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {})
                } as React.CSSProperties}
            >
                {children}
            </div>
        );
    }
));

GridContainer.displayName = 'GridContainer';
