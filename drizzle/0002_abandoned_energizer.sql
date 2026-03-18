CREATE TYPE "public"."geography_type_enum" AS ENUM('PROVINCE', 'VILLE', 'TERRITOIRE', 'CITE', 'SECTEUR', 'CHEFFERIE', 'COMMUNE', 'QUARTIER', 'GROUPEMENT');--> statement-breakpoint
CREATE TYPE "public"."location_category_enum" AS ENUM('URBAINE', 'URBANO_RURALE', 'RURALE');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status_enum" AS ENUM('pending', 'step_1_done', 'step_2_done', 'step_3_done', 'completed');--> statement-breakpoint
CREATE TYPE "public"."sous_type_pm_enum" AS ENUM('pmta', 'ppta', 'pm');--> statement-breakpoint
CREATE TYPE "public"."statut_controle_terrain_enum" AS ENUM('en_cours', 'finalise', 'pv_genere');--> statement-breakpoint
CREATE TYPE "public"."statut_paiement_terrain_enum" AS ENUM('non_paye', 'paye', 'en_attente');--> statement-breakpoint
CREATE TYPE "public"."statut_validation_admin_controle_enum" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."type_activite_enum" AS ENUM('hotel', 'restaurant', 'bar', 'lounge', 'paris_sportifs', 'guest_house', 'chaine_tv', 'autre');--> statement-breakpoint
CREATE TYPE "public"."type_structure_enum" AS ENUM('societe', 'etablissement', 'asbl');--> statement-breakpoint
CREATE TYPE "public"."validation_status_enum" AS ENUM('pending', 'validated', 'rejected', 'none');--> statement-breakpoint
CREATE TABLE "controles_terrain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assujetti_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"exercice" integer NOT NULL,
	"nb_tv_declare" integer NOT NULL,
	"nb_radio_declare" integer NOT NULL,
	"nb_tv_constate" integer NOT NULL,
	"nb_radio_constate" integer NOT NULL,
	"ecart_tv" integer NOT NULL,
	"ecart_radio" integer NOT NULL,
	"activites_constatees" jsonb DEFAULT '[]'::jsonb,
	"precision_autre" text,
	"adresse_constatee" text,
	"statut" "statut_controle_terrain_enum" DEFAULT 'en_cours' NOT NULL,
	"observations" text,
	"date_controle" timestamp DEFAULT now(),
	"geolocalisation" jsonb,
	"data_constatee_identification" jsonb,
	"statut_validation_admin" "statut_validation_admin_controle_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "geographies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar(255) NOT NULL,
	"type" "geography_type_enum" NOT NULL,
	"parent_id" uuid,
	"category" "location_category_enum",
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "missions_terrain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"commune_id" uuid NOT NULL,
	"date_debut" date NOT NULL,
	"date_fin" date NOT NULL,
	"objectif" text,
	"statut" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notes_rectificatives_terrain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"controle_id" uuid NOT NULL,
	"assujetti_id" uuid NOT NULL,
	"montant_ecart" numeric(10, 2) NOT NULL,
	"montant_penalite" numeric(10, 2) NOT NULL,
	"montant_total" numeric(10, 2) NOT NULL,
	"statut_paiement" "statut_paiement_terrain_enum" DEFAULT 'non_paye' NOT NULL,
	"reference_paiement" varchar(100),
	"date_paiement" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "onboarding_status_enum" DEFAULT 'pending' NOT NULL,
	"last_step" integer DEFAULT 0 NOT NULL,
	"step_1_data" jsonb,
	"step_2_data" jsonb,
	"step_3_data" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "onboarding_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "taxation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "location_category_enum" NOT NULL,
	"entity_type" "sous_type_pm_enum" NOT NULL,
	"categorie_appareil" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD'
);
--> statement-breakpoint
ALTER TABLE "app_users" DROP CONSTRAINT "admin_users_email_unique";--> statement-breakpoint
ALTER TABLE "assujettis" DROP CONSTRAINT "assujettis_commune_id_communes_id_fk";
--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "identification_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "must_setup_2fa" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_users" ADD COLUMN "identification_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app_users" ADD COLUMN "must_setup_2fa" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_users" ADD COLUMN "identifiant_agent" varchar(50);--> statement-breakpoint
ALTER TABLE "app_users" ADD COLUMN "assigned_commune_id" uuid;--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "id_nat" varchar(50);--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "nif_url" varchar(512);--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "rccm_url" varchar(512);--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "id_nat_url" varchar(512);--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "type_structure" "type_structure_enum";--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "type_activite" "type_activite_enum";--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "activites" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "precision_autre" text;--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "sous_type_pm" "sous_type_pm_enum";--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "profil_complet" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "validation_status" "validation_status_enum" DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "date_validation" timestamp;--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "validateur_id" uuid;--> statement-breakpoint
ALTER TABLE "assujettis" ADD COLUMN "commentaire_validation" text;--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD COLUMN "montant_paye" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD COLUMN "solde" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "controles_terrain" ADD CONSTRAINT "controles_terrain_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controles_terrain" ADD CONSTRAINT "controles_terrain_agent_id_app_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographies" ADD CONSTRAINT "geographies_parent_id_geographies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."geographies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_terrain" ADD CONSTRAINT "missions_terrain_agent_id_app_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_terrain" ADD CONSTRAINT "missions_terrain_commune_id_geographies_id_fk" FOREIGN KEY ("commune_id") REFERENCES "public"."geographies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_rectificatives_terrain" ADD CONSTRAINT "notes_rectificatives_terrain_controle_id_controles_terrain_id_fk" FOREIGN KEY ("controle_id") REFERENCES "public"."controles_terrain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_rectificatives_terrain" ADD CONSTRAINT "notes_rectificatives_terrain_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_assigned_commune_id_geographies_id_fk" FOREIGN KEY ("assigned_commune_id") REFERENCES "public"."geographies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_commune_id_geographies_id_fk" FOREIGN KEY ("commune_id") REFERENCES "public"."geographies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_validateur_id_app_users_id_fk" FOREIGN KEY ("validateur_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lignes_declaration" DROP COLUMN "sous_categorie";--> statement-breakpoint
ALTER TABLE "lignes_declaration" DROP COLUMN "operateur";--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_identifiant_agent_unique" UNIQUE("identifiant_agent");