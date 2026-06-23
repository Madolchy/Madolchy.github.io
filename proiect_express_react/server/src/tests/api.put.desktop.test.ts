import request from "supertest";
import { app } from "../app.js";
import { cleanup } from "./global.js";
import { register, login } from "./test-helpers.js";
import { beforeEach, describe, it, expect } from "vitest";

async function uploadFile(token: string, index: number, filename: string) {
    const res = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .field("index", String(index))
        .attach("myFile", Buffer.from("hello world"), filename);
    return res;
}

describe("Test the update of a desktop", () => {
    beforeEach(async () => {
        await cleanup();
    });

    it("Get current desktop, try to send current desktop and update with same desktop, should receive no changes", async () => {
        await register();
        const token = await login();

        const uploadRes = await uploadFile(token, 0, "file1.txt");
        expect(uploadRes.status).toBe(200);

        const getRes = await request(app).get("/api/desktop").set("Authorization", `Bearer ${token}`);
        expect(getRes.status).toBe(200);
        const currentDesktop = getRes.body;

        const putRes = await request(app)
            .put("/api/desktop")
            .set("Authorization", `Bearer ${token}`)
            .send({ newDesktop: currentDesktop });

        expect(putRes.status).toBe(200);
        expect(putRes.body).toBe("No updates necessary");
    });

    it("Update current desktop with new cells, it should result into existing ones being already updated", async () => {
        await register();
        const token = await login();

        const uploadRes1 = await uploadFile(token, 0, "file1.txt");
        expect(uploadRes1.status).toBe(200);
        const uploadRes2 = await uploadFile(token, 1, "file2.txt");
        expect(uploadRes2.status).toBe(200);

        const getRes = await request(app).get("/api/desktop").set("Authorization", `Bearer ${token}`);
        expect(getRes.status).toBe(200);
        const currentDesktop = getRes.body;

        expect(currentDesktop.length).toBe(2);

        const updatedDesktop = currentDesktop.map((icon: any, idx: number) => ({
            ...icon,
            cell: idx === 0 ? 5 : 10,
        }));

        const putRes = await request(app)
            .put("/api/desktop")
            .set("Authorization", `Bearer ${token}`)
            .send({ newDesktop: updatedDesktop });

        expect(putRes.status).toBe(200);
        expect(putRes.body).toBe("Desktop updated successfully");

        const getResAfter = await request(app).get("/api/desktop").set("Authorization", `Bearer ${token}`);
        expect(getResAfter.status).toBe(200);
        const afterDesktop = getResAfter.body;

        const icon1 = afterDesktop.find((icon: any) => icon.id === currentDesktop[0].id);
        const icon2 = afterDesktop.find((icon: any) => icon.id === currentDesktop[1].id);

        expect(icon1.cell).toBe(5);
        expect(icon2.cell).toBe(10);
    });

    it("Send a completly different desktop compared to what user has, it should return no changes", async () => {
        await register();
        const token = await login();

        const uploadRes = await uploadFile(token, 0, "file1.txt");
        expect(uploadRes.status).toBe(200);

        const fakeDesktop = [
            {
                id: "non-existent-id-123",
                filename: "fake.txt",
                type: "text/plain",
                bytes: 5,
                cell: 99,
                userId: "fake-user-id",
            },
        ];

        const putRes = await request(app)
            .put("/api/desktop")
            .set("Authorization", `Bearer ${token}`)
            .send({ newDesktop: fakeDesktop });

        expect(putRes.status).toBe(200);
        expect(putRes.body).toBe("No updates necessary");
    });

    it("Send a completly empty desktop, it should return no changes", async () => {
        await register();
        const token = await login();

        const uploadRes = await uploadFile(token, 0, "file1.txt");
        expect(uploadRes.status).toBe(200);

        const putRes = await request(app)
            .put("/api/desktop")
            .set("Authorization", `Bearer ${token}`)
            .send({ newDesktop: [] });

        expect(putRes.status).toBe(200);
        expect(putRes.body).toBe("No updates necessary");
    });

    it("Try to send an update while user is not logged in, should not not be able o", async () => {
        const putRes = await request(app).put("/api/desktop").send({ newDesktop: [] });
        expect(putRes.status).toBe(401);
    });
});
