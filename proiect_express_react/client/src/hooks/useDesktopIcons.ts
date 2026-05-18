import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileManagerService } from "../services/FileManagerService";
import { apiClient } from "../client/apiClient";
export function useDesktopIcons(folderId, rows) {
    console.log("Folder id is: ", folderId);
    const queryClient = useQueryClient();
    const {
        data: gridData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["desktopIcons", folderId],
        queryFn: async () => {
            const raw = await FileManagerService.getUserDesktop(folderId);
            const gridArray = Array.from({ length: rows * rows });
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
        mutationFn: (newDesktop) => FileManagerService.putUserDesktop(newDesktop, folderId),
        onMutate: (newDesktop) => {
            queryClient.cancelQueries({ queryKey: ["desktopIcons", folderId] });

            const previous = queryClient.getQueryData(["desktopIcons", folderId]);

            queryClient.setQueryData(["desktopIcons", folderId], newDesktop);

            return { previous };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["desktopIcons", folderId], context.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["desktopIcons", folderId] });
        },
    });

    const handleSwap = useCallback(
        (currentPosition: number, newPosition: number) => {
            console.log("Handling swap yo c:");

            if (currentPosition === undefined || currentPosition === newPosition) return;

            const currentData = queryClient.getQueryData(["desktopIcons", folderId]);
            if (!currentData || currentData.length === 0) return;

            const newGrid = [...currentData];

            const sourceIcon = newGrid[currentPosition];
            const targetIcon = newGrid[newPosition];

            newGrid[newPosition] = sourceIcon ? { ...sourceIcon, cell: newPosition } : undefined;
            newGrid[currentPosition] = targetIcon ? { ...targetIcon, cell: currentPosition } : undefined;

            updateDesktop(newGrid);
        },
        [folderId, queryClient, updateDesktop],
    );

    return {
        gridData,
        isLoading,
        isError,
        handleSwap,
    };
}
