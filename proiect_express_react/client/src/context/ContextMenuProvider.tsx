import { useState, useCallback, useEffect, type ReactNode } from "react";
import { ContextMenuContext } from "./ContextMenuContext";
import type { vec2 } from "../types/default";

export function ContextMenuProvider({ children }: { children: ReactNode }) {
    const [contextActiveId, setActiveContextId] = useState<number | null>(null);
    const [contextPosition, setContextPosition] = useState<vec2>({ x: 0, y: 0 });

    const openContext = useCallback((e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();

        setContextPosition({ x: e.pageX, y: e.pageY });
        setActiveContextId((prevId) => (prevId === id ? null : id));
    }, []);

    const closeContext = useCallback(() => {
        setActiveContextId(null);
    }, []);

    useEffect(() => {
        if (contextActiveId !== null) {
            window.addEventListener("click", closeContext);
            return () => window.removeEventListener("click", closeContext);
        }
    }, [contextActiveId, closeContext]);

    return (
        <ContextMenuContext.Provider value={{ contextActiveId, contextPosition, openContext, closeContext }}>
            {children}
        </ContextMenuContext.Provider>
    );
}
