import { useState, useCallback } from "react";
import Pica from "pica";

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => resolve({ img, objectUrl });
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl); // Cleanup on load failure
            reject(new Error(`Failed to load image: ${file.name}`));
        };
    });
};

async function resizeSingleImage(file, pica, maxWidth, maxHeight) {
    let objectUrl = null;

    try {
        const loaded = await loadImage(file);
        const img = loaded.img;
        objectUrl = loaded.objectUrl;

        const widthRatio = maxWidth / img.width;
        const heightRatio = maxHeight / img.height;

        const scaleRatio = Math.min(widthRatio, heightRatio, 1);

        const targetWidth = Math.round(img.width * scaleRatio);
        const targetHeight = Math.round(img.height * scaleRatio);

        const fromCanvas = document.createElement("canvas");
        fromCanvas.width = img.width;
        fromCanvas.height = img.height;
        fromCanvas.getContext("2d").drawImage(img, 0, 0);

        const toCanvas = document.createElement("canvas");
        toCanvas.width = targetWidth;
        toCanvas.height = targetHeight;

        await pica.resize(fromCanvas, toCanvas);
        const blob = await pica.toBlob(toCanvas, file.type || "image/jpeg", 0.9);
        const finalUrl = URL.createObjectURL(blob);

        return { success: true, file, blob, url: finalUrl, width: targetWidth, height: targetHeight };
    } catch (error) {
        console.error(`Failed to resize ${file?.name}`, error);
        return { success: false, file, error: error.message };
    } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
}


export default function useThumbnail(defaultWidth = 128, defaultHeight = 128) {
    const [pica] = useState(() => new Pica());

    const processImage = useCallback(
        async (file) => {
            if (!file) return { success: false, error: "No file provided" };
            return await resizeSingleImage(file, pica, defaultWidth, defaultHeight);
        },
        [pica, defaultWidth, defaultHeight]
    );

    return {
        processImage,
    };
}