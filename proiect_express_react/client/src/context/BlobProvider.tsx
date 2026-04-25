import React, { useRef, useCallback, useEffect } from 'react';
import { BlobContext } from './BlobContext';


export const BlobProvider = ({ children }) => {
    const urlMap = useRef(new Map());

    // Type the parameters
    const getUrl = useCallback((id: string, blob: Blob) => {
        if (urlMap.current.has(id)) {
            return urlMap.current.get(id) as string;
        }

        const url = URL.createObjectURL(blob);
        urlMap.current.set(id, url);

        return url;
    }, []);

    const revokeUrl = useCallback((id: string) => {
        if (urlMap.current.has(id)) {
            URL.revokeObjectURL(urlMap.current.get(id) as string);
            urlMap.current.delete(id);
        }
    }, []);

    useEffect(() => {
        const currentMap = urlMap.current;
        return () => {
            currentMap.forEach((url) => URL.revokeObjectURL(url));
            currentMap.clear();
        };
    }, []);

    return (
        <BlobContext.Provider value={{ getUrl, revokeUrl }}>
            {children}
        </BlobContext.Provider>
    );
};