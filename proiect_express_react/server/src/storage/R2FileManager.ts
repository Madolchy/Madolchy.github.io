import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { FileManager } from "../interfaces/storage.js";
import { logger } from "../app.js";

export type R2Config = {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    devUrl: string | null;
};

export class R2FileManager implements FileManager {
    private R2Client: S3Client;
    private bucketName: string;
    private devUrl: string | null;

    constructor(config: R2Config) {
        if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
            throw new Error("Missing R2 credentials endpoint, accessKeyId, secretAccessKey and bucketName required.");
        }

        this.R2Client = new S3Client({
            region: "auto",
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });

        if (!config.devUrl) logger.info("[R2] No devUrl provided, some endpoints are not accesible.");
        this.devUrl = config.devUrl;

        this.bucketName = config.bucketName;
    }

    async registerFile(uuid: string, buffer: Buffer) {
        await this.R2Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
                Body: buffer,
            }),
        );
        return true;
    }

    async getFile(uuid: string) {
        const response = await this.R2Client.send(
            new GetObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
            }),
        );

        return response.Body!.transformToByteArray();
    }

    getFileUrl(id: string) {
        if (this.devUrl === null) throw new Error("[R2] Tried to grab a dev url while one wasn't provided.");

        return new URL(`${this.devUrl}/${id}`);
    }

    async deleteFile(uuid: string): Promise<any> {
        await this.R2Client.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: uuid,
            }),
        );
        return true;
    }
}
