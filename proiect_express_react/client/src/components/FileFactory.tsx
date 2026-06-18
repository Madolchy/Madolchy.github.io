import { useState, useEffect } from "react";
import { useBlob } from "../context/BlobContext";
import { queryClient } from "@/client/queryClient";
import Desktop from "./Desktop";

const ImagePreview = ({ url }: { url: string }) => (
    <img src={url} className="w-full h-full object-contain" alt="Preview" draggable={false} />
);

const TextPreview = ({ url }: { url: string }) => {
    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (url) {
            fetch(url)
                .then((res) => res.text())
                .then(setText)
                .catch((err) => console.error("Failed to fetch text:", err));
        }
    }, [url]);

    console.log("Resulting text: ", text);
    return (
        <div
            className="w-full h-full p-3 overflow-auto bg-card text-card-foreground"
            style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
        >
            {text}
        </div>
    );
};

const FolderPreview = ({ id }: { id: string }) => {
    return <Desktop folderId={id} boxPerRow={4} />;
};

const AudioPreview = ({ url }: { url: string }) => {
    return <audio controls src={url} className="w-full" />;
};

const DefaultPreview = () => null;

interface FilePreviewProps {
    url?: string;
    name?: string;
    id?: string;
}

const previewMap: Record<string, React.ComponentType<FilePreviewProps>> = {
    "image/png": ImagePreview,
    "image/jpeg": ImagePreview,
    "image/jpg": ImagePreview,
    "image/gif": ImagePreview,
    "audio/mpeg": AudioPreview,
    "text/plain": TextPreview,
    "type/folder": FolderPreview,
};

export const FileFactory = ({ data }: { data: { id: string; type: string; name: string; url?: string } }) => {
    const { id: uuid, type: fileType, name, url } = data;
    const { getUrl } = useBlob();

    const cachedThumbnail = queryClient.getQueryData<Blob>(["file", uuid]);

    // image-specific: use thumbnail while it loads, then full URL
    if (fileType?.startsWith("image/")) {
        if (!url) {
            if (cachedThumbnail) {
                return <ImagePreview url={getUrl(uuid, cachedThumbnail)} />;
            }
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
        return <ImagePreview url={url} />;
    }

    const PreviewComponent = previewMap[fileType] || DefaultPreview;

    return <PreviewComponent url={url} name={name} id={uuid} />;
};
