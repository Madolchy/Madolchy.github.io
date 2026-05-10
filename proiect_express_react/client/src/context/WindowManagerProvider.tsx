import { useState, useCallback, useRef, type ReactNode } from "react";
import { WindowManagerContext } from "./WindowManagerContext";

export function WindowManagerProvider({ children }: { children: ReactNode }) {
    const [windows, setWindows] = useState<any[]>([]);
    const topZIndex = useRef(100);

    const openWindow = useCallback((id: number, data: any) => {
        if (!data || !data.id) return;
        topZIndex.current += 1;
        setWindows((prev) => [
            ...prev,
            {
                id: data.id + topZIndex.current,
                data,
                title: data.name || "New Window",
                zIndex: topZIndex.current,
            },
        ]);
    }, []);

    const closeWindow = useCallback((winId: number | string) => {
        setWindows((prev) => prev.filter((w) => w.id !== winId));
    }, []);

    const bringToFront = useCallback((winId: number | string) => {
        setWindows((prev) => {
            const win = prev.find((w) => w.id === winId);
            if (!win || win.zIndex === topZIndex.current) return prev;
            topZIndex.current += 1;
            return prev.map((w) => (w.id === winId ? { ...w, zIndex: topZIndex.current } : w));
        });
    }, []);

    return (
        <WindowManagerContext.Provider value={{ windows, openWindow, closeWindow, bringToFront }}>
            {children}
        </WindowManagerContext.Provider>
    );
}
