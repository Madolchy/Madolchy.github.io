import { useState, useCallback, useEffect, type ReactNode } from "react";
import { ContextMenuContext } from "./ContextMenuContext";
import type { vec2 } from "../types/default";
import type { ContextAction } from "@/types/context";

export function ContextMenuProvider({ children }: { children: ReactNode }) {
    const [contextActiveId, setActiveContextId] = useState<number | null>(null);
    const [contextPosition, setContextPosition] = useState<vec2>({ x: 0, y: 0 });
    const [availableContextActions, setAvailableContextActions] = useState<ContextAction[]>([]);

    const openContext = useCallback((e: React.MouseEvent, id: number, actions: ContextAction[]) => {
        e.preventDefault();
        e.stopPropagation();

        setContextPosition({ x: e.pageX, y: e.pageY });
        setAvailableContextActions(actions);
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
        <ContextMenuContext.Provider
            value={{ contextActiveId, contextPosition, availableContextActions, openContext, closeContext }}
        >
            {children}
        </ContextMenuContext.Provider>
    );
}
