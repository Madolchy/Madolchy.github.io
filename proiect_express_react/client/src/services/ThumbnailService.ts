import { db } from "../store/db";
import Pica from "pica";

const pica = new Pica();
const inflightRequests = new Map<string, Promise<Blob | null>>();

const THUMBNAIL_MAX = 128;

function loadImage(file: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image`));
        };
    });
}

async function generateThumbnail(file: Blob, mimeType: string): Promise<Blob | null> {
    try {
        const img = await loadImage(file);

        const scale = Math.min(THUMBNAIL_MAX / img.width, THUMBNAIL_MAX / img.height, 1);
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const fromCanvas = document.createElement("canvas");
        fromCanvas.width = img.width;
        fromCanvas.height = img.height;
        fromCanvas.getContext("2d")!.drawImage(img, 0, 0);

        const toCanvas = document.createElement("canvas");
        toCanvas.width = targetWidth;
        toCanvas.height = targetHeight;

        await pica.resize(fromCanvas, toCanvas);
        const blob = await pica.toBlob(toCanvas, mimeType || "image/jpeg", 0.9);

        return blob;
    } catch (error) {
        console.error("Failed to generate thumbnail:", error);
        return null;
    }
}

export const ThumbnailService = {
    getThumbnail: async (uuid: string, type?: string, r2Url?: string): Promise<Blob | null> => {
        const cached = await db.getThumbnail(uuid);
        if (cached) return cached;

        if (!r2Url) return null;

        const pending = inflightRequests.get(uuid);
        if (pending) return pending;

        const promise = (async () => {
            try {
                const res = await fetch(r2Url);
                if (!res.ok) return undefined;
                const fileBlob = await res.blob();

                const mimeType = type || fileBlob.type;
                if (!mimeType || !mimeType.startsWith("image/")) return null;

                const thumbnail = await generateThumbnail(fileBlob, mimeType);
                if (thumbnail) {
                    await db.saveThumbnail(uuid, thumbnail);
                }
                return thumbnail;
            } finally {
                inflightRequests.delete(uuid);
            }
        })();

        inflightRequests.set(uuid, promise);
        return promise;
    },

    getThumbnails: async () => {
        const values = await db.getAllThumbnails();
        const keys = await db.getAllThumbnailsKeys();

        const thumbnailMap: Record<string, Blob> = {};
        keys.forEach((id, index) => {
            thumbnailMap[id as string] = values[index] as Blob;
        });

        return thumbnailMap;
    },
};
