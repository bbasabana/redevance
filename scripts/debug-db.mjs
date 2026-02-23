import { readFileSync } from "fs";
import { Pool } from "@neondatabase/serverless";

const envFile = readFileSync(".env", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        env[key] = val;
    }
}

const pool = new Pool({ connectionString: env.DATABASE_URL });

async function debug() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM geographies");
        console.log("Geographies in DB:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

debug();
