import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileManagerService } from "../services/FileManagerService";
import { apiClient } from "../client/apiClient";

export function useDesktopIcons(dir = "") {
    const queryClient = useQueryClient();
    const {
        data: gridData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["desktopIcons"],
        queryFn: async () => await FileManagerService.getUserDesktop(dir),
        staleTime: Infinity,
        select: (gridData) => {
            if (!gridData) return [];

            // will need to use grid boxes depenncy later instead of 16
            const gridArray = Array.from({ length: 16 * 16 });

            gridData.forEach((element) => {
                gridArray[element.cell] = element;
            });

            return gridArray;
        },
    });

    const [draggedBox, setDraggedBox] = useState<number | undefined>(undefined);
    const draggedBoxRef = useRef<number | undefined>(undefined);

    const resetSelect = useCallback(() => {
        draggedBoxRef.current = undefined;
        setDraggedBox(undefined);
    }, []);

    const handleSelect = useCallback(
        (index: number, uuid: string) => {
            if (draggedBoxRef.current === index) return;
            if (!uuid) {
                resetSelect();
                return;
            }

            draggedBoxRef.current = index;
            setDraggedBox(index);
        },
        [resetSelect],
    );

    // use tanstack mutate later
    // bug: if you try to swap empty space with a icon space, the swap happens locally but server refreshes correct one later.
    const handleSwap = useCallback(
        async (newPosition: number) => {
            const sourceIndex = draggedBoxRef.current;

            if (sourceIndex === undefined || sourceIndex === newPosition) return;

            // handle this on failed
            draggedBoxRef.current = newPosition;
            setDraggedBox(newPosition);

            const previousData = queryClient.getQueryData(["desktopIcons"]);
            queryClient.setQueryData(["desktopIcons"], (oldData: any[]) => {
                if (!oldData) return [];
                return oldData.map((icon) => {
                    if (icon.cell === sourceIndex) return { ...icon, cell: newPosition };
                    if (icon.cell === newPosition) return { ...icon, cell: sourceIndex };
                    return icon;
                });
            });

            try {
                await apiClient
                    .post("/desktop/swap", {
                        json: { first: sourceIndex, second: newPosition },
                    })
                    .json();
            } catch (error) {
                console.error("Server rejected the swap. Rolling back UI...", error);

                if (previousData) {
                    queryClient.setQueryData(["desktopIcons"], previousData);
                }
            }
        },
        [queryClient],
    );

    return {
        gridData,
        isLoading,
        isError,
        draggedBox,
        resetSelect,
        handleSelect,
        handleSwap,
    };
}
