import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Manually read .env
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    .split('=')[1]
    .trim();

if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL not found in .env");
    process.exit(1);
}

async function updateSchema() {
    const sql = neon(dbUrl);
    console.log("🚀 Starting Agent Schema Update...");

    try {
        console.log("Adding 'identifiant_agent' column...");
        await sql`ALTER TABLE "app_users" ADD COLUMN IF NOT EXISTS "identifiant_agent" varchar(50) UNIQUE`;

        console.log("Adding 'assigned_commune_id' column...");
        await sql`ALTER TABLE "app_users" ADD COLUMN IF NOT EXISTS "assigned_commune_id" uuid REFERENCES "geographies"("id")`;

        console.log("✅ Success: app_users table updated with agent columns.");
    } catch (e) {
        console.error("❌ Error during schema update:", e);
    }
}

updateSchema();
