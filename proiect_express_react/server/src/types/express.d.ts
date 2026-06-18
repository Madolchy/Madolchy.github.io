declare global {
    namespace Express {
        interface Request {
            auth?: {
                id: string;
                rootFolderId: string;
            };
        }
    }
}

export {};
