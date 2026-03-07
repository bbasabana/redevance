-- Run in Neon SQL Editor if assujettis is missing sous_type_pm (and related enums/columns).
-- Fixes: Failed query ... from "assujettis" ... sous_type_pm

-- 1. Enums used by assujettis (skip if already exist)
DO $$ BEGIN
  CREATE TYPE "public"."sous_type_pm_enum" AS ENUM('pmta', 'ppta', 'pm');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."type_structure_enum" AS ENUM('societe', 'etablissement', 'asbl');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."type_activite_enum" AS ENUM('hotel', 'restaurant', 'bar', 'lounge', 'paris_sportifs', 'guest_house', 'chaine_tv', 'autre');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."validation_status_enum" AS ENUM('pending', 'validated', 'rejected', 'none');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add missing columns to assujettis (skip if column exists)
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "id_nat" varchar(50);
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "nif_url" varchar(512);
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "rccm_url" varchar(512);
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "id_nat_url" varchar(512);
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "type_structure" "type_structure_enum";
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "type_activite" "type_activite_enum";
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "activites" jsonb DEFAULT '[]';
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "precision_autre" text;
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "sous_type_pm" "sous_type_pm_enum";
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "profil_complet" boolean DEFAULT false;
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "validation_status" "validation_status_enum" DEFAULT 'none';
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "date_validation" timestamp;
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "validateur_id" uuid REFERENCES "public"."app_users"("id");
ALTER TABLE "assujettis" ADD COLUMN IF NOT EXISTS "commentaire_validation" text;
