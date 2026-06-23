import request from "supertest";
import { app } from "../app.js";
import { cleanup } from "./global.js";
import { register, login } from "./test-helpers.js";
import { beforeEach, describe, it, expect } from "vitest";

describe("Test the deletion of a file", () => {
    beforeEach(async () => {
        await cleanup();
    });

    it("Tries to delete a non existent file", async () => {
        await register();
        const token = await login();
        const res = await request(app).delete("/api/files/nonexistentid").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("Adds a file, and then deletes it", async () => {
        await register();
        const token = await login();

        const uploadRes = await request(app)
            .post("/api/upload")
            .set("Authorization", `Bearer ${token}`)
            .field("index", "0")
            .attach("myFile", Buffer.from("hello world"), "test-upload.txt");

        if (uploadRes.status !== 200) {
            console.log("Upload failed:", uploadRes.status, uploadRes.body);
        }

        expect(uploadRes.status).toBe(200);
        const fileId = uploadRes.body.id;
        expect(fileId).toBeDefined();

        const deleteRes = await request(app).delete(`/api/files/${fileId}`).set("Authorization", `Bearer ${token}`);

        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.success).toBe(true);
    });

    it("Send invalid location", async () => {
        await register();
        const token = await login();
        const res = await request(app).delete("/api/files/").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    it("Tries path traversal", async () => {
        await register();
        const token = await login();
        const res = await request(app).delete("/api/files/../../../etc/passwd").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    it("Tries to delete while not being autenthicated", async () => {
        const res = await request(app).delete("/api/files/someid");
        expect(res.status).toBe(401);
    });
});
