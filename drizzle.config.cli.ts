/**
 * Drizzle config for CLI (push / migrate) from your machine.
 * Use: npx drizzle-kit push --config drizzle.config.cli.ts
 * The app on Vercel still uses @neondatabase/serverless in src/db/index.ts — this file is never run on Vercel.
 */
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
});
