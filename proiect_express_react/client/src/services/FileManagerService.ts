import { apiClient } from "../client/apiClient";

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

    getRawFile: async (fileUuid: string): Promise<Blob | undefined> => {
        const response = await apiClient.get(`download/${fileUuid}`);
        if (!response.ok) return undefined;

        const blob = await response.blob();
        return blob;
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
