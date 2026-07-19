import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prefer Next.js local env; fall back to `.env` for Prisma CLI.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon: DIRECT_URL = non-pooler (migrations). DATABASE_URL = pooled (app).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
