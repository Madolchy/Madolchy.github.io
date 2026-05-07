import { createContext, useContext } from "react";

interface DesktopManagerContextType {
    backgroundUrl: string | null;
}

export const DesktopManagerContext = createContext<DesktopManagerContextType | null>(null);

export const useDesktopManager = () => {
    const ctx = useContext(DesktopManagerContext);
    if (!ctx) {
        throw new Error("useDesktopManager must be used within DesktopManagerProvider");
    }
    return ctx;
};
