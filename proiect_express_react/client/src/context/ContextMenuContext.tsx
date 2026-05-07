import { createContext, useContext } from "react";
import type { vec2 } from "../types/default";

interface ContextMenuContextType {
    contextActiveId: number | null;
    contextPosition: vec2;
    openContext: (e: React.MouseEvent, id: number) => void;
    closeContext: () => void;
}

export const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const useContextMenu = () => {
    const ctx = useContext(ContextMenuContext);
    if (!ctx) {
        throw new Error("useContextMenuCtx must be used within a ContextMenuProvider");
    }
    return ctx;
};
