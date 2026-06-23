import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DesktopManagerContext } from "./DesktopManagerContext";
import { FileManagerService } from "../services/FileManagerService";

export function DesktopManagerProvider({ children }: { children: ReactNode }) {
    const { data: backgroundData } = useQuery({
        queryKey: ["background"],
        queryFn: () => FileManagerService.getUserBackground(),
        staleTime: Infinity,
    });

    const backgroundUrl = backgroundData?.backgroundUrl ?? null;

    return <DesktopManagerContext.Provider value={{ backgroundUrl }}>{children}</DesktopManagerContext.Provider>;
}
