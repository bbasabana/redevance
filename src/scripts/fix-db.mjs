import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Manually read .env
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    .split('=')[1]
    .trim();

async function fix() {
    const sql = neon(dbUrl);
    console.log("Starting manual FK fix with tagged templates...");

    try {
        console.log("Dropping old constraint...");
        await sql`ALTER TABLE "assujettis" DROP CONSTRAINT IF EXISTS "assujettis_commune_id_communes_id_fk"`;

        console.log("Adding new constraint to geographies...");
        await sql`ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_commune_id_geographies_id_fk" FOREIGN KEY ("commune_id") REFERENCES "geographies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`;

        console.log("✅ Success: Foreign key constraint updated successfully to reference geographies.");
    } catch (e) {
        console.error("❌ Error during fix:", e);
    }
}

fix();
