import { config } from "dotenv";
import { defineConfig } from "prisma/config";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
config({ path: envFile });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["MONGO_URL"],
  },
});
