import { createContext, useContext } from 'react';

interface BlobContextType {
    getUrl: (id: string, blob: Blob) => string;
    revokeUrl: (id: string) => void;
}

export const BlobContext = createContext<BlobContextType | null>(null);

export const useBlob = () => {
    const context = useContext(BlobContext);
    if (!context) {
        throw new Error("useBlob must be used within a BlobProvider");
    }
    return context;
};