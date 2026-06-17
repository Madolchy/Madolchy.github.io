import { apiClient } from "../client/apiClient";
import { db } from "../store/db";

export const FileManagerService = {
    getUserDesktop: async (dir: string) => {
        try {
            const response = await apiClient.get("desktop", { searchParams: { folderId: dir } });
            if (!response.ok) return undefined;

            const data = await response.json();
            console.log("Got data: ", data);
            return data;
        } catch (error) {
            console.error("Failed to get desktop: ", error);
            return undefined;
        }
    },

    putUserDesktop: async (newDesktop, folderId) => {
        const cleanedDesktop = newDesktop.filter(Boolean);
        const response = await apiClient.put("desktop", { json: { newDesktop: cleanedDesktop, folderId: folderId } });
        if (!response.ok) throw new Error("Failed to update desktop");

        return response.json();
    },

    getUserBackground: async () => {
        const response = await apiClient.get("background");
        if (!response.ok) return undefined;
        const { backgroundUrl } = await response.json();

        if (!backgroundUrl) return null;

        const cached = await db.getBackground();
        if (cached?.backgroundUrl && cached.uuid === backgroundUrl) {
            return { backgroundUrl: cached.backgroundUrl };
        }

        await db.saveBackground(backgroundUrl, backgroundUrl);

        return { backgroundUrl };
    },

    getRawFile: async (fileUuid: string): Promise<Blob | undefined> => {
        const response = await apiClient.get(`download/${fileUuid}`);
        if (!response.ok) return undefined;

        const blob = await response.blob();
        return blob;
    },

    deleteFile: async (fileUuid: string): Promise<void> => {
        const response = await apiClient.delete(`files/${fileUuid}`);
        if (!response.ok) {
            throw new Error("Failed to delete file");
        }
    },
    uploadFile: async (files, index, folderPath) => {
        const formData = new FormData();

        formData.append("index", index);
        formData.append("folderPath", folderPath);
        formData.append("myFile", files);

        try {
            const response = await apiClient.post("upload", { body: formData });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Upload failed: ", error);
            return undefined;
        }
    },
    addFolder: async (folderName: string, folderId: string, cell: number) => {
        const response = await apiClient.post("folder", { json: { folderName, folderId, cell } });
        if (!response.ok) {
            throw new Error("Failed to create folder");
        }
        return response.json();
    },
};
