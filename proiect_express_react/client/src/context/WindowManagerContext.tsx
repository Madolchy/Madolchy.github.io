import { createContext, useContext } from "react";

interface WindowManagerContextType {
    windows: any[];
    openWindow: (id: number, data: any) => void;
    closeWindow: (winId: number | string) => void;
    bringToFront: (winId: number | string) => void;
}

export const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export const useWindowManager = () => {
    const ctx = useContext(WindowManagerContext);
    if (!ctx) throw new Error("useWindowManager must be inside WindowManagerProvider");
    return ctx;
};
