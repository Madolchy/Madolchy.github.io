import { apiClient } from "../client/apiClient";
import { db } from "../store/db";


export const FileManagerService = {
    getUserDesktop: async () => {
        try {
            const response = await apiClient.get('desktop');
            if (!response.ok) return undefined;

            const data = await response.json();

            const values = await db.getAllThumbnails();
            const keys = await db.getAllThumbnailsKeys();

            const thumbnailMap = {};
            keys.forEach((id, index) => {
                thumbnailMap[id] = values[index];
            });

            const mappedData = data.map((icon) => ({
                ...icon,
                thumbnail: thumbnailMap[icon.id] || null
            }));

            console.log("After adding thumbnails: ", mappedData)
            return mappedData

        } catch (error) {
            console.error("Failed to get desktop: ", error);
            return undefined;
        }
    },

    uploadFile: async (files, index) => {
        const formData = new FormData()

        formData.append('index', index)
        formData.append('myFile', files);

        try {
            const response = await apiClient.post('upload', { body: formData })
            if (response.ok) {
                return await response.json();
            }
        }
        catch (error) {
            console.error("Upload failed: ", error)
            return undefined;
        }
    }
}