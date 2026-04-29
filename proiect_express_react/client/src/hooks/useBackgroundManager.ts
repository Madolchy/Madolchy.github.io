import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { db } from '../store/db';
import { FileManagerService } from '../services/FileManagerService';

export function useBackgroundManager(contextActiveId: number | null, gridData: any) {
    const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(undefined);
    const prevBackgroundUrl = useRef<string | undefined>(undefined);

    // Initial load and cleanup
    useEffect(() => {
        db.getBackground().then((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                prevBackgroundUrl.current = url;
                setBackgroundUrl(url);
            }
        });

        return () => {
            if (prevBackgroundUrl.current) {
                URL.revokeObjectURL(prevBackgroundUrl.current);
            }
        };
    }, []);

    const canSetBackground = useMemo(() => {
        if (contextActiveId === null || !gridData) return false;
        const data = (gridData as any[])[contextActiveId];
        return !!(data && data.fileType && data.fileType.startsWith('image/'));
    }, [contextActiveId, gridData]);

    const handleSetBackground = useCallback(async () => {
        if (contextActiveId === null || !gridData) return;
        const data = (gridData as any[])[contextActiveId];
        if (!data || !data.id) return;

        try {
            const blob = await FileManagerService.getRawFile(data.id);
            if (!blob) return;

            await db.saveBackground(blob);

            const url = URL.createObjectURL(blob);
            if (prevBackgroundUrl.current) {
                URL.revokeObjectURL(prevBackgroundUrl.current);
            }
            prevBackgroundUrl.current = url;
            setBackgroundUrl(url);
        } catch (error) {
            console.error("Failed to set background:", error);
        }
    }, [contextActiveId, gridData]);

    return { backgroundUrl, canSetBackground, handleSetBackground };
}
