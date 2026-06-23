import { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileManagerService } from "../services/FileManagerService";

export function useDesktopIcons(folderId, rows) {
    const queryClient = useQueryClient();
    const versionRef = useRef(0);

    const {
        data: gridData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["desktopIcons", folderId],
        queryFn: async () => {
            const raw = await FileManagerService.getUserDesktop(folderId);
            if (!raw) return undefined;
            versionRef.current = Math.max(versionRef.current, raw.version);
            const gridArray = Array.from({ length: rows * rows });
            raw.items.forEach((el) => {
                gridArray[el.cell] = el;
            });
            return gridArray;
        },
        staleTime: Infinity,
    });

    const { mutate: updateDesktop } = useMutation({
        mutationFn: (newDesktop: any[]) => FileManagerService.putUserDesktop(newDesktop, folderId, versionRef.current),
        onMutate: (newDesktop) => {
            versionRef.current += 1;

            queryClient.cancelQueries({ queryKey: ["desktopIcons", folderId] });

            const previous = queryClient.getQueryData(["desktopIcons", folderId]);
            queryClient.setQueryData(["desktopIcons", folderId], newDesktop);

            return { previous };
        },
        onSuccess: (data) => {
            if (data?.newVersion != null) {
                versionRef.current = data.newVersion;
            }
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(["desktopIcons", folderId], context?.previous);
            queryClient.invalidateQueries({ queryKey: ["desktopIcons", folderId] });
        },
    });

    const handleSwap = useCallback(
        (currentPosition: number, newPosition: number) => {
            if (currentPosition === undefined || currentPosition === newPosition) return;

            const currentData = queryClient.getQueryData<any[]>(["desktopIcons", folderId]);
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

    return { gridData, isLoading, isError, handleSwap };
}
