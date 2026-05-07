import { useMemo } from "react";
import { db } from "../store/db";
import { FileManagerService } from "../services/FileManagerService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client/apiClient";
import type { ContextAction } from "@/types/context";
import { useContextMenu } from "@/context/ContextMenuContext";

export function useDesktopActions(gridData: any) {
    const { contextActiveId } = useContextMenu();
    const queryClient = useQueryClient();

    const setBackgroundMutation = useMutation({
        mutationFn: async (uuid: string) => {
            const blob = await FileManagerService.getRawFile(uuid);
            if (!blob) throw new Error("File not found");

            await apiClient.post("/background", { json: { backgroundUuid: uuid } });
            await db.saveBackground(uuid, blob);
            return { uuid, blob };
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
        onSuccess: (uuid: string) => {
            queryClient.invalidateQueries({ queryKey: ["desktopIcons"] });
        },
        onError: (err) => {
            console.error("File deletion failed with: ", err);
        },
    });

    const { mutate: bgMutate, isPending: bgIsPending } = setBackgroundMutation;
    const { mutate: deleteMutate, isPending: deleteIsPending } = deleteFileMutation;

    const availableContextActions: ContextAction[] = useMemo(() => {
        const actions: ContextAction[] = [];
        const activeData = contextActiveId !== null && gridData ? gridData[contextActiveId] : undefined;

        if (activeData?.fileType?.startsWith("image/")) {
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

        return actions;
    }, [bgIsPending, bgMutate, contextActiveId, deleteIsPending, deleteMutate, gridData]);

    return {
        availableContextActions,
        isBackgroundSetting: bgIsPending,
    };
}
