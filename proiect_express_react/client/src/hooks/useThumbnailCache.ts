import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBlob } from "@/context/BlobContext";
import { ThumbnailService } from "@/services/ThumbnailService";
import type { DesktopItem } from "@/types/data";

export function useThumbnailCache({ id, type, url }: Partial<Pick<DesktopItem, "id" | "type" | "url">>) {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    const { getUrl, revokeUrl } = useBlob();

    // TODO: thumbnail should just return null inside of explicitly checking for folder
    const { data: blob } = useQuery({
        queryKey: ["file", id],
        queryFn: () => ThumbnailService.getThumbnail(id, type, url),
        staleTime: Infinity,
        enabled: !!id && !!url && type !== "type/folder",
    });

    useEffect(() => {
        if (!blob) return;

        const blobUrl = getUrl(id, blob);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThumbUrl(blobUrl);

        return () => {
            revokeUrl(id);
        };
    }, [blob, id, getUrl, revokeUrl]);

    return thumbUrl;
}
