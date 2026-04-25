import { useState, useCallback, useRef } from 'react';

export function useWindowManager() {
    const [windows, setWindows] = useState<any[]>([]);

    const topZIndex = useRef(100);

    const openWindow = useCallback((id: number, data: any) => {
        if (!data || !data.id) return; // Only open windows for actual files

        topZIndex.current += 1

        setWindows(prev => [...prev, {
            id: data.id,
            data: data,
            title: data.filename || 'New Window',
            zIndex: topZIndex.current
        }]);
    }, []);

    const closeWindow = useCallback((winId: number | string) => {
        setWindows(prev => prev.filter(w => w.id !== winId));
    }, []);

    const bringToFront = useCallback((winId: number | string) => {
        setWindows(prev => {
            const win = prev.find(w => w.id === winId);
            if (!win || win.zIndex === topZIndex.current) return prev;

            topZIndex.current += 1;
            return prev.map(w => w.id === winId ? { ...w, zIndex: topZIndex.current } : w);
        });
    }, []);

    return {
        windows,
        openWindow,
        closeWindow,
        bringToFront
    };
}
