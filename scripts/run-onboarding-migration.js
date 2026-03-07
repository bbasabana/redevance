/**
 * Run onboarding_progress migration from your machine (TCP, no WebSocket).
 * Usage: node scripts/run-onboarding-migration.js
 * Requires: DATABASE_URL in .env.local (or env). Uses "pg" (devDependency) — not used on Vercel.
 */
const fs = require("fs");
const path = require("path");

// Load .env.local so DATABASE_URL is set (Next.js convention)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set. Add it to .env.local or the environment.");
  process.exit(1);
}

async function main() {
  // Use pg (TCP) — install with: npm i -D pg
  const { Client } = require("pg");
  const client = new Client({
    connectionString: url,
    ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const sqlPath = path.join(process.cwd(), "drizzle", "run-onboarding-migration.sql");
    let sql = fs.readFileSync(sqlPath, "utf8");
    sql = sql.replace(/--[^\n]*/g, "").trim();
    const statements = sql.split(";").map((s) => s.trim()).filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement.startsWith("CREATE TYPE") || statement.startsWith("CREATE TABLE") || statement.startsWith("ALTER TABLE")) {
        await client.query(statement + ";");
        console.log("OK:", statement.slice(0, 60) + "...");
      }
    }
    console.log("Migration completed. Table onboarding_progress is ready.");
  } catch (e) {
    if (e.code === "42P07" || (e.message && e.message.includes("already exists"))) {
      console.log("Table or type already exists. Nothing to do.");
    } else {
      throw e;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
