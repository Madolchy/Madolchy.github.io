import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { db } from "../store/db";
import { FileManagerService } from "../services/FileManagerService";
import { useBlob } from "../context/BlobContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client/apiClient";
import type { ContextAction } from "@/types/context";

export function useDesktopManager(contextActiveId: number | null, gridData: any) {
    const { getUrl } = useBlob();
    const queryClient = useQueryClient();

    // later will add t his inside of the user data check, when ill display settings etc
    const { data: backgroundData, isError } = useQuery({
        queryKey: ["background"],
        queryFn: async () => await FileManagerService.getUserBackground(),
    });

    const backgroundUrl = useMemo(() => {
        if (!backgroundData?.backgroundBlob) return null;

        return getUrl(backgroundData.backgroundUuid + "_full", backgroundData.backgroundBlob);
    }, [backgroundData, getUrl]);

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

    const canSetBackground = useMemo(() => {
        if (contextActiveId === null || !gridData) return false;
        const data = gridData[contextActiveId];

        return !!(data && data.fileType && data.fileType.startsWith("image/"));
    }, [contextActiveId, gridData]);

    const handleSetBackground = useCallback(async () => {
        if (setBackgroundMutation.isPending) return; // prevent double mutations at same time
        if (contextActiveId === null || !gridData) return;

        const data = gridData[contextActiveId];
        if (!data?.id) {
            console.error("No valid file data found for the active context");
            return;
        }

        setBackgroundMutation.mutate(data.id);
    }, [contextActiveId, gridData, setBackgroundMutation]);

    const canDelete = useMemo(() => {
        if (contextActiveId === null || !gridData) return false;
        const data = gridData[contextActiveId];

        return !!data;
    }, [contextActiveId, gridData]);
    const availableContextActions = useMemo((): ContextAction[] => {
        const actions: ContextAction[] = [];

        if (canSetBackground) {
            actions.push({
                contextName: "Set Desktop Background",
                contextAction: handleSetBackground,
            });
        }

        if (canDelete) {
            actions.push({
                contextName: "Delete",
                contextAction: () => console.log("e"),
            });
        }

        return actions;
    }, [canDelete, canSetBackground, handleSetBackground]);

    return {
        backgroundUrl,
        availableContextActions,
        isBackgroundSetting: setBackgroundMutation.isPending,
    };
}
