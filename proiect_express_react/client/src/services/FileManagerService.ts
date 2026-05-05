import { apiClient } from "../client/apiClient";
import { db } from "../store/db";

export const FileManagerService = {
    getUserDesktop: async (dir: string) => {
        try {
            const response = await apiClient.get("desktop");
            if (!response.ok) return undefined;

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Failed to get desktop: ", error);
            return undefined;
        }
    },

    getUserBackground: async () => {
        const response = await apiClient.get("background");
        if (!response.ok) return undefined;
        const { backgroundUuid } = await response.json();

        const cached = await db.getBackground();
        if (cached?.backgroundBlob && cached.uuid === backgroundUuid) {
            return { backgroundUuid: cached.uuid, backgroundBlob: cached.backgroundBlob };
        }

        const backgroundBlob = await FileManagerService.getRawFile(backgroundUuid);
        await db.saveBackground(backgroundUuid, backgroundBlob);

        return { backgroundUuid, backgroundBlob };
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
    uploadFile: async (files, index) => {
        const formData = new FormData();

        formData.append("index", index);
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
};
