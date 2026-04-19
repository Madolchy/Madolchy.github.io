import { apiClient } from "../client/apiClient";


export const FileManagerService = {
    getUserDesktop: async () => {
        try {
            const response = await apiClient.get('desktop')
            if (response.ok) {
                const data = await response.json()
                console.log("Got response: ", data)
                return data;
            }
        }
        catch (error) {
            console.error("Failed to get desktop: ", error)
            return undefined
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