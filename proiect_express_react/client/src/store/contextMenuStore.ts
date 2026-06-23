import type { ContextAction } from "@/types/context";
import type { vec2 } from "@/types/default";
import { create } from "zustand";

interface ContextMenuState {
    activeId: number | null;
    position: vec2;
    actions: ContextAction[];
    openContext: (e: React.MouseEvent, id: number, actions: ContextAction[]) => void;
    closeContext: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set, get) => {
    function handleClickOutside() {
        get().closeContext();
    }

    return {
        activeId: null,
        position: { x: 0, y: 0 },
        actions: [],

        openContext: (e, id, actions) => {
            e.preventDefault();
            e.stopPropagation();

            const prevId = get().activeId;
            const nextId = prevId === id ? null : id;

            set({
                activeId: nextId,
                position: { x: e.pageX, y: e.pageY },
                actions,
            });

            if (nextId === null) {
                window.removeEventListener("click", handleClickOutside, { capture: true });
            } else if (prevId === null) {
                window.addEventListener("click", handleClickOutside, { capture: true });
            }
        },

        closeContext: () => {
            set({ activeId: null });
            window.removeEventListener("click", handleClickOutside, { capture: true });
        },
    };
});
