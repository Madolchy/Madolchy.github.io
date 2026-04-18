export enum FileType {
    PDF = 'pdf',
    PNG = 'png',
    JPEG = 'jpeg',
    DEFAULT = 'default'
}

export const DesktopIconService = {
    getUserDesktop: async (): Promise<Record<number, object>> => {
        return {};
    },
}