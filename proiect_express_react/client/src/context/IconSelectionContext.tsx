import { create } from "zustand";

export interface SelectionState {
    folderId: string;
    cell: number;
}

interface SelectionStore {
    selection: SelectionState | undefined;
    select: (folderId: string, cell: number, uuid: string) => void;
    deselect: () => void;
}

const useSelectionStore = create<SelectionStore>((set, get) => ({
    selection: undefined,
    select: (folderId, cell, uuid) => {
        const { selection } = get();
        if (selection?.folderId === folderId && selection?.cell === cell) return;
        if (!uuid) {
            set({ selection: undefined });
            return;
        }
        set({ selection: { folderId, cell } });
    },
    deselect: () => set({ selection: undefined }),
}));

export function useIsSelected(cell: number, folderId: string): boolean {
    return useSelectionStore((s) => s.selection?.cell === cell && s.selection?.folderId === folderId);
}

export const handleSelect = (folderId: string, cell: number, uuid: string) =>
    useSelectionStore.getState().select(folderId, cell, uuid);

export const resetSelect = () => useSelectionStore.getState().deselect();

export const getSelection = () => useSelectionStore.getState().selection;
