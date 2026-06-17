import { useCallback } from "react";
import { db } from "../store/db";
import { FileManagerService } from "../services/FileManagerService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client/apiClient";
import type { ContextAction } from "@/types/context";

export function useDesktopActions(folderId: string) {
    const queryClient = useQueryClient();

    const setBackgroundMutation = useMutation({
        mutationFn: async (uuid: string) => {
            const desktopItems = queryClient.getQueryData<any[]>(["desktopIcons", folderId]);
            const item = desktopItems?.find((i) => i?.id === uuid);
            const url = item?.url;
            if (!url) throw new Error("File URL not found");

            await apiClient.post("/background", { json: { backgroundUuid: uuid } });
            await db.saveBackground(url, url);
            return { uuid, url };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["background"] });
        },
        onError: (err) => {
            console.error("Background update failed with: ", err);
        },
    });

    const deleteFileMutation = useMutation({
        mutationFn: async (uuid: string) => {
            await FileManagerService.deleteFile(uuid);
            return uuid;
        },
        onSuccess: (_uuid: string) => {
            queryClient.invalidateQueries({ queryKey: ["desktopIcons", folderId] });
        },
        onError: (err) => {
            console.error("File deletion failed with: ", err);
        },
    });

    const addFolderMutation = useMutation({
        mutationFn: async ({ folderName, folderId, cell }: { folderName: string; folderId: string; cell: number }) => {
            await FileManagerService.addFolder(folderName, folderId, cell);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["desktopIcons", folderId] });
        },
    });

    const { mutate: bgMutate, isPending: bgIsPending } = setBackgroundMutation;
    const { mutate: deleteMutate, isPending: deleteIsPending } = deleteFileMutation;
    const { mutate: addFolderMutate, isPending: folderIsPending } = addFolderMutation;

    const getActionsForId = useCallback(
        (id: number | null): ContextAction[] => {
            const actions: ContextAction[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const currentGrid = queryClient.getQueryData(["desktopIcons", folderId]) as any[];
            const activeData = id !== null && currentGrid ? currentGrid[id] : undefined;

            if (activeData?.type?.startsWith("image/")) {
                actions.push({
                    contextName: "Set Desktop Background",
                    contextAction: () => bgMutate(activeData.id),
                    isDisabled: bgIsPending,
                });
            }

            if (activeData) {
                actions.push({
                    contextName: "Delete",
                    contextAction: () => deleteMutate(activeData.id),
                    isDisabled: deleteIsPending,
                });
            }

            if (!activeData) {
                actions.push({
                    contextName: "Create folder",
                    contextAction: () => {
                        const newFolderId = Math.random().toString().substring(2, 16);
                        addFolderMutate({
                            folderName: newFolderId,
                            folderId: folderId,
                            cell: id ?? 0,
                        });
                    },
                    isDisabled: folderIsPending,
                });
            }

            return actions;
        },
        [addFolderMutate, bgIsPending, bgMutate, deleteIsPending, deleteMutate, folderId, folderIsPending, queryClient],
    );

    return {
        getActionsForId,
        isBackgroundSetting: bgIsPending,
    };
}
