import { beforeEach, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanup } from "./global.js";
import { TEST_USER, register, login } from "./test-helpers.js";

describe("Auth API", () => {
    beforeEach(async () => {
        await cleanup();
    });

    describe("POST /api/register", () => {
        it("registers new user", async () => {
            const res = await register();
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("rejects duplicate email", async () => {
            await register();

            const res = await register();
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("rejects invalid body", async () => {
            const res = await request(app).post("/api/register").send({ name: "A", email: "bad", password: "short" });
            expect(res.status).toBe(400);
        });
    });

    describe("POST /api/login", () => {
        // 3. Setup state needed for all login tests
        beforeEach(async () => {
            await register(); // Just seed the user, DB is already clean
        });

        it("logs in with valid credentials", async () => {
            const res = await request(app)
                .post("/api/login")
                .send({ email: TEST_USER.email, password: TEST_USER.password });
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        });

        it("sets refresh token cookie", async () => {
            const res = await request(app)
                .post("/api/login")
                .send({ email: TEST_USER.email, password: TEST_USER.password });
            expect(res.headers["set-cookie"][0]).toContain("refreshToken");
        });

        it("rejects wrong password", async () => {
            const res = await request(app)
                .post("/api/login")
                .send({ email: TEST_USER.email, password: "wrongpassword" });
            expect(res.status).toBe(401);
        });
    });

    describe("POST /api/refresh", () => {
        let cookies: string[];

        // Use beforeEach here too, so every test gets fresh cookies
        // and doesn't accidentally mutate state for the next test.
        beforeEach(async () => {
            await register();
            const loginRes = await request(app)
                .post("/api/login")
                .send({ email: TEST_USER.email, password: TEST_USER.password });
            cookies = loginRes.headers["set-cookie"];
        });

        it("issues new token with valid refresh cookie", async () => {
            const res = await request(app)
                .post("/api/refresh")
                .set("Cookie", cookies as any);
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        });

        it("rejects without refresh cookie", async () => {
            const res = await request(app).post("/api/refresh");
            expect(res.status).toBe(401);
        });
    });

    describe("Protected endpoints", () => {
        beforeEach(async () => {
            await register();
        });

        it("GET /api/desktop rejects no token", async () => {
            const res = await request(app).get("/api/desktop");
            expect(res.status).toBe(401);
        });

        it("GET /api/desktop accepts valid token", async () => {
            const token = await login();
            const res = await request(app).get("/api/desktop").set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        // ... (logout test remains the same)
    });
});
