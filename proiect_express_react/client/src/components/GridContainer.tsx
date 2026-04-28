import React, { forwardRef } from 'react';

interface GridContainerProps {
    boxSize: { width: number; height: number };
    actualColumns: number;
    children: React.ReactNode;
    onContextMenu?: (e: React.MouseEvent) => void;
    onMouseDown?: (e: React.MouseEvent) => void;
}

export const GridContainer = React.memo(forwardRef<HTMLDivElement, GridContainerProps>(
    ({ boxSize, actualColumns, children, onContextMenu, onMouseDown }, ref) => {
        return (
            <div
                ref={ref}
                onContextMenu={onContextMenu}
                onMouseDown={onMouseDown}
                className="w-100 vh-100 dynamic-grid-container flex-grow-1 border border-dark p-0 position-relative overflow-hidden"
                style={{
                    '--box-width': `${boxSize.width}px`,
                    '--box-height': `${boxSize.height}px`,
                    '--box-count': actualColumns
                } as React.CSSProperties}
            >
                {children}
            </div>
        );
    }
));

GridContainer.displayName = 'GridContainer';
