import { useState, useLayoutEffect, type RefObject } from 'react';

type BoxSize = {
    width: number;
    height: number;
};

export function useGrid(
    containerRef: RefObject<HTMLDivElement>, 
    boxNumberPerRow: number, 
    isLoading: boolean
) {
    const [boxSize, setBoxSize] = useState<BoxSize>({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const calculateCapacity = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            if (clientWidth === 0 || clientHeight === 0) return;

            setBoxSize({
                width: clientWidth / boxNumberPerRow,
                height: clientHeight / boxNumberPerRow,
            });
        };

        calculateCapacity();
        const observer = new ResizeObserver(calculateCapacity);
        
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        
        return () => observer.disconnect();
    }, [boxNumberPerRow, isLoading, containerRef]);

    return boxSize;
}