import { useState, useCallback, useRef } from "react";
import Pica from "pica";

export default function useThumbnail(defaultWidth = 128, defaultHeight = 128) {
    const [isResizing, setIsResizing] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });

    const [pica] = useState(() => new Pica());

    const isProcessingRef = useRef(false);

    const processImages = useCallback(async (files) => {
        if (!files || files.length === 0 || isProcessingRef.current) return [];

        isProcessingRef.current = true;
        setIsResizing(true);
        setProgress({ done: 0, total: files.length });

        console.log("Processing files: ", files);
        
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                img.src = objectUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const fromCanvas = document.createElement('canvas');
                fromCanvas.width = img.width;
                fromCanvas.height = img.height;
                fromCanvas.getContext('2d').drawImage(img, 0, 0);

                const toCanvas = document.createElement('canvas');
                toCanvas.width = defaultWidth;
                toCanvas.height = defaultHeight;

                await pica.resize(fromCanvas, toCanvas);

                const blob = await pica.toBlob(toCanvas, file.type || 'image/jpeg', 0.90);
                const finalUrl = URL.createObjectURL(blob);

                URL.revokeObjectURL(objectUrl);

                results.push({ success: true, file, blob, url: finalUrl });

            } catch (error) {
                console.error(`Failed to resize ${file?.name}`, error);
                results.push({ success: false, file, error: error.message });
            }

            setProgress(prev => ({ ...prev, done: i + 1 }));
        }

        isProcessingRef.current = false;
        setIsResizing(false);

        return results;

    }, [pica, defaultWidth, defaultHeight]);

    return {
        isResizing,
        progress,
        processImages
    };
}