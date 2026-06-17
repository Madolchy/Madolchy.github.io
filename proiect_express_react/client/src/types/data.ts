export type DesktopItem = {
    id: string;
    type: string;
    name: string;
    cell: number;
    bytes: number | null;
    userId: string;
    folderId: string | null;
    url?: string;
};
