import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileManagerService } from "../services/FileManagerService";
import { useBlob } from "../context/BlobContext";
import { queryClient } from "@/client/queryClient";

const ImagePreview = ({ url }: { url: string }) => (
    <img src={url} className="w-full h-full object-contain" alt="Preview" draggable={false} />
);

const TextPreview = ({ blob }: { blob: Blob }) => {
    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (blob) {
            blob.text()
                .then(setText)
                .catch((err) => console.error("Failed to read text blob:", err));
        }
    }, [blob]);

    return (
        <div
            className="w-full h-full p-3 overflow-auto bg-card text-card-foreground"
            style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
        >
            {text}
        </div>
    );
};

const DefaultPreview = () => null;

interface FilePreviewProps {
    url: string;
    blob: Blob;
}

const previewMap: Record<string, React.ComponentType<FilePreviewProps>> = {
    "image/png": ImagePreview,
    "image/jpeg": ImagePreview,
    "image/jpg": ImagePreview,
    "image/gif": ImagePreview,
    "text/plain": TextPreview,
};

export const FileFactory = ({ uuid, thumbnail, fileType }: { uuid: string; fileType: string; thumbnail?: Blob }) => {
    const { getUrl, revokeUrl } = useBlob();
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const cachedThumbnail = queryClient.getQueryData<Blob>(["file", uuid]);
    const {
        data: blob,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["file", uuid + "_full"],
        queryFn: () => FileManagerService.getRawFile(uuid),
        staleTime: Infinity,
        enabled: !!uuid,
    });

    useEffect(() => {
        if (!blob) return;

        const url = getUrl(uuid + "_full", blob);
        console.log("Generated new Full URL:", url);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFileUrl(url);
        return () => {
            console.log("Component unmounting, revoking Full URL:", url);
            revokeUrl(uuid + "_full");
        };
    }, [blob, getUrl, revokeUrl, uuid]);

    // problem: we don't have thumbnail, itrs undefined
    console.log("Cached thumbnail is: ", cachedThumbnail);
    if (isLoading && cachedThumbnail) {
        console.log("Still grabbing thumbnail... using small");
        return <ImagePreview url={getUrl(uuid, thumbnail)} />;
    }

    // anything else or if thumbnail missing
    if (isLoading && !thumbnail) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div
                    className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                >
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (isError || !blob) {
        return null;
    }

    const PreviewComponent = previewMap[fileType] || DefaultPreview;

    return <PreviewComponent url={fileUrl} blob={blob} />;
};
