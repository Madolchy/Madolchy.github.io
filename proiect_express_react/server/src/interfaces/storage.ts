export interface FileManager {
    registerFile(uuid: string, buffer: Buffer): Promise<any>;
    getFile(uuid: string): Promise<any>;
    deleteFile(uuid: string): Promise<any>;
}
