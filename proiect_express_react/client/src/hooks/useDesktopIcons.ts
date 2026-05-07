import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        queryFn: async () => {
            const raw = await FileManagerService.getUserDesktop(dir);
            const gridArray = Array.from({ length: 16 * 16 });
            raw.forEach((el) => {
                gridArray[el.cell] = el;
            });
            return gridArray;
        },
        staleTime: Infinity,
    });

    const {
        mutate: updateDesktop,
        isLoading: isUpdateLoading,
        isError: isUpdateError,
    } = useMutation({
        mutationFn: (newDesktop) => FileManagerService.putUserDesktop(newDesktop),
        onMutate: async (newDesktop) => {
            await queryClient.cancelQueries({ queryKey: ["desktopIcons"] });

            const previous = queryClient.getQueryData(["desktopIcons"]);

            queryClient.setQueryData(["desktopIcons"], newDesktop);

            return { previous };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["desktopIcons"], context.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["desktopIcons"] });
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

    const handleSwap = useCallback(
        (newPosition: number) => {
            console.log("Handling swap yo c:");

            const currentPosition = draggedBoxRef.current;
            if (currentPosition === undefined || currentPosition === newPosition) return;

            const currentData = queryClient.getQueryData(["desktopIcons"]);
            if (!currentData || currentData.length === 0) return;

            const newGrid = [...currentData];

            const sourceIcon = newGrid[currentPosition];
            const targetIcon = newGrid[newPosition];

            newGrid[newPosition] = sourceIcon ? { ...sourceIcon, cell: newPosition } : undefined;
            newGrid[currentPosition] = targetIcon ? { ...targetIcon, cell: currentPosition } : undefined;

            updateDesktop(newGrid);
            resetSelect();
        },
        [queryClient, updateDesktop, resetSelect],
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
