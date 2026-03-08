-- Contrôles terrain : données constatées (identification) + statut validation admin
-- Permet à l'admin de comparer ancien vs nouveau et d'approuver/rejeter.

DO $$ BEGIN
  CREATE TYPE "public"."statut_validation_admin_controle_enum" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "controles_terrain" ADD COLUMN IF NOT EXISTS "data_constatee_identification" jsonb;
ALTER TABLE "controles_terrain" ADD COLUMN IF NOT EXISTS "statut_validation_admin" "public"."statut_validation_admin_controle_enum" NOT NULL DEFAULT 'pending';

COMMENT ON COLUMN "controles_terrain"."data_constatee_identification" IS 'Snapshot: nomRaisonSociale, typePersonne, nif, rccm, representantLegal, adresseSiege, idNat, typeActivite, sousTypePm';
COMMENT ON COLUMN "controles_terrain"."statut_validation_admin" IS 'pending = à vérifier par admin, approved = assujetti mis à jour, rejected = rejeté';
