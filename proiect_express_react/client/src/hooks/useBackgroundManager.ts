import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { db } from "../store/db";
import { FileManagerService } from "../services/FileManagerService";
import { useBlob } from "../context/BlobContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client/apiClient";

export function useBackgroundManager(contextActiveId: number | null, gridData: any) {
    const { getUrl } = useBlob();
    const queryClient = useQueryClient();

    const { data: backgroundData } = useQuery({
        queryKey: ["background"],
        queryFn: async () => await db.getBackground(),
    });

    const backgroundUrl = useMemo(() => {
        if (!backgroundData?.backgroundBlob) return null;

        return getUrl(backgroundData.uuid + "_full", backgroundData.backgroundBlob);
    }, [backgroundData, getUrl]);

    const setBackgroundMutation = useMutation({
        mutationFn: async (uuid: string) => {
            const blob = await FileManagerService.getRawFile(uuid);
            if (!blob) throw new Error("Failed to retrieve file for background");

            await Promise.all([
                db.saveBackground(uuid, blob),
                apiClient.post("/background", { json: { backgroundUuid: uuid } }),
            ]);
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

    return {
        backgroundUrl,
        canSetBackground,
        handleSetBackground,
        isBackgroundSetting: setBackgroundMutation.isPending,
    };
}
