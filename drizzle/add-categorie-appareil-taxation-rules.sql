-- Migration: Add categorie_appareil column to taxation_rules table
-- This column stores the device category ("Téléviseurs" or "Radios") for pricing rules

ALTER TABLE "taxation_rules" ADD COLUMN IF NOT EXISTS "categorie_appareil" varchar(100);

-- Update existing rules to set device categories (create separate rows for TV and Radio)
-- Assuming existing rules apply to both device types, duplicate them

-- First, update existing rows to be for "Téléviseurs"
UPDATE "taxation_rules" SET "categorie_appareil" = 'Téléviseurs' WHERE "categorie_appareil" IS NULL;

-- Then create duplicate rows for "Radios" with same pricing
INSERT INTO "taxation_rules" (id, category, entity_type, categorie_appareil, price, currency)
SELECT gen_random_uuid(), category, entity_type, 'Radios', price, currency
FROM "taxation_rules"
WHERE "categorie_appareil" = 'Téléviseurs'
ON CONFLICT DO NOTHING;
