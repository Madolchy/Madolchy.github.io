import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DesktopManagerContext } from "./DesktopManagerContext";
import { useBlob } from "./BlobContext";
import { FileManagerService } from "../services/FileManagerService";

export function DesktopManagerProvider({ children }: { children: ReactNode }) {
    const { getUrl } = useBlob();

    const { data: backgroundData } = useQuery({
        queryKey: ["background"],
        queryFn: () => FileManagerService.getUserBackground(),
        staleTime: Infinity,
    });

    const backgroundUrl = useMemo(() => {
        if (!backgroundData?.backgroundBlob) return null;
        return getUrl(backgroundData.backgroundUuid + "_full", backgroundData.backgroundBlob);
    }, [backgroundData, getUrl]);

    return <DesktopManagerContext.Provider value={{ backgroundUrl }}>{children}</DesktopManagerContext.Provider>;
}
