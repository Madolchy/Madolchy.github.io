import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";

export interface SelectionState {
    folderId: string;
    cell: number;
}

// ---- Module-level selection (outside React = no context re-renders) ----

let selectionSnapshot: SelectionState | undefined = undefined;
const listeners = new Set<() => void>();

function emitSelection(next: SelectionState | undefined) {
    selectionSnapshot = next;
    listeners.forEach((fn) => fn());
}

/** Subscribe to selection changes. Returns unsubscribe function. */
function onSelectionChange(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Hook: only re-renders when THIS icon's selected state actually changes */
export function useIsSelected(cell: number, folderId: string): boolean {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const prevRef = useRef(selectionSnapshot?.cell === cell && selectionSnapshot?.folderId === folderId);

    // Keep prevRef in sync on every render (in case selection changed externally)
    prevRef.current = selectionSnapshot?.cell === cell && selectionSnapshot?.folderId === folderId;

    useEffect(() => {
        return onSelectionChange(() => {
            const next = selectionSnapshot?.cell === cell && selectionSnapshot?.folderId === folderId;
            if (next !== prevRef.current) {
                prevRef.current = next;
                forceUpdate();
            }
        });
    }, [cell, folderId]);

    return prevRef.current;
}

// ---- Context: only stable values, Desktop never re-renders from this ----

interface IconSelectionContextType {
    selectionRef: React.MutableRefObject<SelectionState | undefined>;
    handleSelect: (folderId: string, cell: number, uuid: string) => void;
    resetSelect: () => void;
}

export const IconSelectionContext = createContext<IconSelectionContextType | null>(null);

export function IconSelectionProvider({ children }: { children: React.ReactNode }) {
    const selectionRef = useRef<SelectionState | undefined>(undefined);

    const resetSelect = useCallback(() => {
        selectionRef.current = undefined;
        emitSelection(undefined);
    }, []);

    const handleSelect = useCallback(
        (folderId: string, cell: number, uuid: string) => {
            if (selectionRef.current?.folderId === folderId && selectionRef.current?.cell === cell) return;
            if (!uuid) {
                resetSelect();
                return;
            }
            const next = { folderId, cell };
            selectionRef.current = next;
            emitSelection(next);
        },
        [resetSelect],
    );

    return (
        <IconSelectionContext.Provider value={{ selectionRef, handleSelect, resetSelect }}>
            {children}
        </IconSelectionContext.Provider>
    );
}

export function useIconSelection() {
    const ctx = useContext(IconSelectionContext);
    if (!ctx) throw new Error("useIconSelection must be inside IconSelectionProvider");
    return ctx;
}
