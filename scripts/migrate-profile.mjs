import { readFileSync } from "fs";

const envFile = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        env[key] = val;
    }
}

import { Pool } from "@neondatabase/serverless";
const pool = new Pool({ connectionString: env.DATABASE_URL });

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_structure_enum') THEN
          CREATE TYPE type_structure_enum AS ENUM ('societe', 'etablissement', 'asbl');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_activite_enum') THEN
          CREATE TYPE type_activite_enum AS ENUM ('hotel', 'restaurant', 'bar', 'lounge', 'paris_sportifs', 'guest_house', 'chaine_tv', 'autre');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sous_type_pm_enum') THEN
          CREATE TYPE sous_type_pm_enum AS ENUM ('pmta', 'ppta', 'pm');
        END IF;
      END $$;
    `);
        await client.query(`
      ALTER TABLE assujettis
        ADD COLUMN IF NOT EXISTS type_structure type_structure_enum,
        ADD COLUMN IF NOT EXISTS type_activite type_activite_enum,
        ADD COLUMN IF NOT EXISTS sous_type_pm sous_type_pm_enum,
        ADD COLUMN IF NOT EXISTS profil_complet boolean NOT NULL DEFAULT false;
    `);
        console.log("✅ Migration completed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
