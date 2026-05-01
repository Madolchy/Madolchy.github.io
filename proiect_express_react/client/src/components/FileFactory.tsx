import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileManagerService } from "../services/FileManagerService";
import { useBlob } from "../context/BlobContext";

const ImagePreview = ({ url }: { url: string }) => (
    <img src={url} className="w-100 h-100 object-fit-contain" alt="Preview" />
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
            className="w-100 h-100 p-3 overflow-auto bg-white text-dark"
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

    const {
        data: blob,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["file", uuid],
        queryFn: () => FileManagerService.getRawFile(uuid),
        enabled: !!uuid,
    });

    useEffect(() => {
        return () => {
            console.log("Cleanup ran!");
            revokeUrl(uuid + "_full");
        };
    }, [revokeUrl, uuid]);

    // while image is grabbed from server, show thumbnail
    if (isLoading && thumbnail) {
        return <ImagePreview url={getUrl(uuid, thumbnail)} />;
    }

    // anything else or if thumbnail missing
    if (isLoading && !thumbnail) {
        return (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (isError || !blob) {
        return null;
    }

    const fileUrl = getUrl(uuid + "_full", blob);

    const PreviewComponent = previewMap[fileType] || DefaultPreview;

    return <PreviewComponent url={fileUrl} blob={blob} />;
};
