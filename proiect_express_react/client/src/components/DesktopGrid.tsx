import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DesktopIcon from './DesktopIcon';
import "./DesktopGrid.css";
import { FileManagerService } from '../services/FileUploadService';

type BoxSize = {
    width: number;
    height: number;
}

export default function DesktopGrid({ handleDrop, handleDragOver }) {
    const queryClient = useQueryClient();

    const containerRef = useRef<HTMLDivElement>(null);

    const draggedBoxRef = useRef<number | undefined>(undefined);

    const [boxNumberPerRow, setBoxNumberPerRow] = useState(16);
    const [boxSize, setBoxSize] = useState<BoxSize>({ width: 0, height: 0 });

    const { data: gridData, isLoading, isError } = useQuery({
        queryKey: ['desktopIcons'],
        queryFn: () => FileManagerService.getUserDesktop() ,
        initialData: {} as Record<number, any>,
        staleTime: Infinity,
    });

    const handleSelect = useCallback((index: number) => {
        draggedBoxRef.current = index;
    }, []);

    const handleSwap = useCallback((newPosition: number) => {
        const sourceIndex = draggedBoxRef.current;
        draggedBoxRef.current = undefined; // Reset ref immediately

        if (sourceIndex === undefined || sourceIndex === newPosition) return;

        // Optimistic UI Update
        queryClient.setQueryData(['desktopIcons'], (oldData: any) => {
            if (!oldData) return oldData;

            const newData = { ...oldData };

            const sourceItem = newData[sourceIndex];
            const targetItem = newData[newPosition];

            if (!sourceItem) return oldData;

            if (targetItem) {
                newData[sourceIndex] = targetItem;
            } else {
                delete newData[sourceIndex];
            }
            newData[newPosition] = sourceItem;

            return newData;
        });
    }, [queryClient]);

    useLayoutEffect(() => {
        const calculateCapacity = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            if (clientWidth === 0 || clientHeight === 0) return;

            const boxWidth = clientWidth / boxNumberPerRow;
            const boxHeight = clientHeight / boxNumberPerRow;

            setBoxSize({ width: boxWidth, height: boxHeight });
        };

        calculateCapacity();
        const observer = new ResizeObserver(calculateCapacity);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [boxNumberPerRow, isLoading]);

    if (isLoading) return <div>Loading Desktop...</div>;
    if (isError || !gridData) return <div>Failed to load icons!</div>;

    const items = Array.from({ length: boxNumberPerRow * boxNumberPerRow });

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
            {items.map((_, index) => (
                <DesktopIcon
                    key={index}
                    id={index}
                    data={gridData[index]}
                    
                    onMouseDownCallback={handleSelect}
                    onMouseUpCallback={handleSwap}

                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                />
            ))}
        </div>
    );
}