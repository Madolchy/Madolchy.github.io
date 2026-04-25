import { useState, useLayoutEffect, type RefObject, useRef } from 'react';

type BoxSize = {
    width: number;
    height: number;
};

export function useGrid(baseBoxNumber: number, isLoading: boolean) {
    const [boxSize, setBoxSize] = useState<BoxSize>({ width: 0, height: 0 });
    const [actualColumns, setActualColumns] = useState<number>(baseBoxNumber);

    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const calculateCapacity = () => {
            const el = containerRef.current;
            if (!el?.clientWidth || !el?.clientHeight) return;

            const { clientWidth: w, clientHeight: h } = el;
            const isLandscape = w >= h;

            const cols = isLandscape ? baseBoxNumber : Math.max(1, Math.round(baseBoxNumber * (w / h)));
            const rows = isLandscape ? Math.max(1, Math.round(baseBoxNumber * (h / w))) : baseBoxNumber;

            setActualColumns(cols);
            setBoxSize({ width: w / cols, height: h / rows });
        };


        calculateCapacity();
        const observer = new ResizeObserver(calculateCapacity);

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [baseBoxNumber, isLoading]);

    return { containerRef, boxSize, actualColumns };
}