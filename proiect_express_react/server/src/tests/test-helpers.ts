import request from "supertest";
import { app } from "../app.js";

export const TEST_USER = {
    name: "Test User",
    email: "test-integration@example.com",
    password: "testpassword123",
};

export async function register() {
    return request(app).post("/api/register").send(TEST_USER);
}

export async function login() {
    const res = await request(app)
        .post("/api/login")
        .send({ email: TEST_USER.email, password: TEST_USER.password });
    return res.body.token;
}
