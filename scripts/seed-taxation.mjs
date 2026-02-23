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

async function seed() {
    const client = await pool.connect();
    try {
        console.log("Starting seeding...");

        // 1. Seed Taxation Rules
        const rules = [
            { category: 'URBAINE', entityType: 'ppta', price: 9.00 },
            { category: 'URBAINE', entityType: 'pmta', price: 90.00 },
            { category: 'URBAINE', entityType: 'pm', price: 120.00 },
            { category: 'URBANO_RURALE', entityType: 'ppta', price: 7.50 },
            { category: 'URBANO_RURALE', entityType: 'pmta', price: 70.00 },
            { category: 'URBANO_RURALE', entityType: 'pm', price: 60.00 },
            { category: 'RURALE', entityType: 'ppta', price: 6.00 },
            { category: 'RURALE', entityType: 'pmta', price: 40.00 },
            { category: 'RURALE', entityType: 'pm', price: 50.00 },
        ];

        for (const rule of rules) {
            await client.query(
                `INSERT INTO taxation_rules (id, category, entity_type, price, currency) 
                 VALUES (gen_random_uuid(), $1, $2, $3, 'USD')
                 ON CONFLICT DO NOTHING`,
                [rule.category, rule.entityType, rule.price]
            );
        }
        console.log("✅ Taxation rules seeded.");

        // 2. Seed Geography Hierarchy for Kinshasa
        // Province
        const kinRes = await client.query(
            "INSERT INTO geographies (id, nom, type) VALUES (gen_random_uuid(), 'Kinshasa', 'PROVINCE') RETURNING id"
        );
        const provinceId = kinRes.rows[0].id;

        // Ville
        const villeRes = await client.query(
            "INSERT INTO geographies (id, nom, type, parent_id) VALUES (gen_random_uuid(), 'Ville de Kinshasa', 'VILLE', $1) RETURNING id",
            [provinceId]
        );
        const villeId = villeRes.rows[0].id;

        // Communes Urbaines
        const urbaines = ["Gombe", "Linguala", "Barumbu", "Kitambo", "Kasa-Vubu", "Kalamu", "Limete", "Bandalungwa", "Ngiri-Ngiri"];
        for (const com of urbaines) {
            await client.query(
                "INSERT INTO geographies (id, nom, type, parent_id, category) VALUES (gen_random_uuid(), $1, 'COMMUNE', $2, 'URBAINE')",
                [com, villeId]
            );
        }

        console.log("✅ Kinshasa geography seeded.");

    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
