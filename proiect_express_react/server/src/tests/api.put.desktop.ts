import request from "supertest";
import { app } from "../app.js";
import { cleanup } from "./global.js";
import { register, login } from "./test-helpers.js";
import { beforeEach, describe, it, expect } from "vitest";

describe("Test the update of a desktop", () => {
    beforeEach(async () => {
        await cleanup();
    });

    it("Get current desktop, try to send current desktop and update with same desktop, should receive no changes");
    it("Update current desktop with new cells, it should result into existing ones being already updated");
    it("Send a completly different desktop compared to what user has, it should return no changes");
    it("Send a completly empty desktop, it should return no changes");
    it("Try to send an update while user is not logged in, should not not be able o");
});
