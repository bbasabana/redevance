import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Manually read .env
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    .split('=')[1]
    .trim();

async function migrate() {
    const sql = neon(dbUrl);
    console.log("🚀 Starting Mobile-First Migration (v1)...");

    try {
        // 1. Enums
        console.log("Creating new enums...");
        await sql`DO $$ BEGIN
            CREATE TYPE statut_controle_terrain_enum AS ENUM ('en_cours', 'finalise', 'pv_genere');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;`;

        await sql`DO $$ BEGIN
            CREATE TYPE statut_paiement_terrain_enum AS ENUM ('non_paye', 'paye', 'en_attente');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;`;

        // 2. Remove columns from lignes_declaration
        console.log("Removing decoder-related columns from lignes_declaration...");
        await sql`ALTER TABLE "lignes_declaration" DROP COLUMN IF EXISTS "sous_categorie"`;
        await sql`ALTER TABLE "lignes_declaration" DROP COLUMN IF EXISTS "operateur"`;

        // 3. Create controles_terrain
        console.log("Creating table controles_terrain...");
        await sql`CREATE TABLE IF NOT EXISTS "controles_terrain" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "assujetti_id" uuid NOT NULL REFERENCES "assujettis"("id"),
            "agent_id" uuid NOT NULL REFERENCES "app_users"("id"),
            "exercice" integer NOT NULL,
            "nb_tv_declare" integer NOT NULL,
            "nb_radio_declare" integer NOT NULL,
            "nb_tv_constate" integer NOT NULL,
            "nb_radio_constate" integer NOT NULL,
            "ecart_tv" integer NOT NULL,
            "ecart_radio" integer NOT NULL,
            "statut" statut_controle_terrain_enum DEFAULT 'en_cours' NOT NULL,
            "date_controle" timestamp DEFAULT now(),
            "geolocalisation" jsonb,
            "created_at" timestamp DEFAULT now(),
            "updated_at" timestamp DEFAULT now()
        )`;

        // 4. Create notes_rectificatives_terrain
        console.log("Creating table notes_rectificatives_terrain...");
        await sql`CREATE TABLE IF NOT EXISTS "notes_rectificatives_terrain" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "controle_id" uuid NOT NULL REFERENCES "controles_terrain"("id"),
            "assujetti_id" uuid NOT NULL REFERENCES "assujettis"("id"),
            "montant_ecart" numeric(10, 2) NOT NULL,
            "montant_penalite" numeric(10, 2) NOT NULL,
            "montant_total" numeric(10, 2) NOT NULL,
            "statut_paiement" statut_paiement_terrain_enum DEFAULT 'non_paye' NOT NULL,
            "reference_paiement" varchar(100),
            "date_paiement" timestamp,
            "created_at" timestamp DEFAULT now()
        )`;

        console.log("✅ Success: Mobile-First Migration (v1) complete.");
    } catch (e) {
        console.error("❌ Error during migration:", e);
    }
}

migrate();
