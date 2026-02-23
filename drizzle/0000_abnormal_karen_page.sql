CREATE TYPE "public"."canal_notification_enum" AS ENUM('email', 'sms', 'push', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."canal_paiement_enum" AS ENUM('banque', 'mtn_money', 'airtel_money', 'orange_money', 'autre');--> statement-breakpoint
CREATE TYPE "public"."statut_assujetti_enum" AS ENUM('nouveau', 'en_cours', 'redevable', 'en_regle', 'relance', 'mise_en_demeure', 'contentieux', 'exonere');--> statement-breakpoint
CREATE TYPE "public"."statut_controle_enum" AS ENUM('planifie', 'en_cours', 'realise', 'annule');--> statement-breakpoint
CREATE TYPE "public"."statut_declaration_enum" AS ENUM('brouillon', 'soumise', 'validee', 'contestee', 'archivee');--> statement-breakpoint
CREATE TYPE "public"."statut_dossier_recouvrement_enum" AS ENUM('ouvert', 'en_cours', 'transmis_omp', 'cloture', 'suspendu');--> statement-breakpoint
CREATE TYPE "public"."statut_note_enum" AS ENUM('brouillon', 'en_attente_signature1', 'en_attente_signature2', 'emise', 'payee', 'partiellement_payee', 'en_retard', 'contentieux');--> statement-breakpoint
CREATE TYPE "public"."statut_paiement_enum" AS ENUM('en_attente', 'confirme', 'rejete', 'rembourse');--> statement-breakpoint
CREATE TYPE "public"."statut_reclamation_enum" AS ENUM('deposee', 'en_instruction', 'acceptee', 'rejetee', 'classee');--> statement-breakpoint
CREATE TYPE "public"."type_controle_enum" AS ENUM('sur_pieces', 'sur_place', 'visite_domiciliaire', 'perquisition');--> statement-breakpoint
CREATE TYPE "public"."type_personne_enum" AS ENUM('pp', 'pm', 'pp_advantage', 'pm_advantage');--> statement-breakpoint
CREATE TYPE "public"."type_rappel_enum" AS ENUM('j15', 'j30', 'j38', 'relance', 'mise_en_demeure', 'fin_exercice', 'personnalise');--> statement-breakpoint
CREATE TYPE "public"."type_recouvrement_enum" AS ENUM('amiable', 'force');--> statement-breakpoint
CREATE TYPE "public"."zone_tarifaire_enum" AS ENUM('urbaine', 'rurale');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"nom_prenom" varchar(255) NOT NULL,
	"telephone" varchar(30),
	"two_factor_secret" varchar(255),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_setup_at" timestamp,
	"recovery_codes" text[],
	"last_login_at" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"super_admin" boolean DEFAULT false,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"nom_prenom" varchar(255) NOT NULL,
	"telephone" varchar(30),
	"two_factor_secret" varchar(255),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_setup_at" timestamp,
	"recovery_codes" text[],
	"last_login_at" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "assujettis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"identifiant_fiscal" varchar(30),
	"type_personne" "type_personne_enum" NOT NULL,
	"nom_raison_sociale" varchar(255) NOT NULL,
	"nif" varchar(50),
	"rccm" varchar(100),
	"representant_legal" varchar(255),
	"adresse_siege" text NOT NULL,
	"commune_id" uuid,
	"zone_tarifaire" "zone_tarifaire_enum" NOT NULL,
	"telephone_principal" varchar(30),
	"telephone_secondaire" varchar(30),
	"email" varchar(255),
	"canal_prefere" "canal_notification_enum" DEFAULT 'email',
	"statut" "statut_assujetti_enum" DEFAULT 'nouveau',
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"agent_createur_id" uuid,
	"derniere_declaration_id" uuid,
	"exercice_courant" integer,
	"date_premiere_identification" date,
	"notes_internes" text,
	"is_exonere" boolean DEFAULT false,
	"motif_exoneration" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assujettis_identifiant_fiscal_unique" UNIQUE("identifiant_fiscal")
);
--> statement-breakpoint
CREATE TABLE "communes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar(100) NOT NULL,
	"ville" varchar(100) NOT NULL,
	"province" varchar(100) NOT NULL,
	"prefixe_fiscal" varchar(5) NOT NULL,
	"zone_tarifaire" "zone_tarifaire_enum" NOT NULL,
	"sequence_courante" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "communes_prefixe_fiscal_unique" UNIQUE("prefixe_fiscal")
);
--> statement-breakpoint
CREATE TABLE "controles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assujetti_id" uuid,
	"type_controle" "type_controle_enum" NOT NULL,
	"agent_id" uuid,
	"date_planifiee" date NOT NULL,
	"date_realisee" date,
	"observations" text,
	"statut" "statut_controle_enum" DEFAULT 'planifie',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "declarations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assujetti_id" uuid,
	"exercice" integer NOT NULL,
	"date_declaration" date NOT NULL,
	"statut" "statut_declaration_enum" DEFAULT 'brouillon',
	"total_appareils" integer DEFAULT 0,
	"signature_assujetti_url" varchar(512),
	"signature_date" timestamp,
	"agent_id" uuid,
	"valide_par_id" uuid,
	"valide_at" timestamp,
	"remarques" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dossiers_recouvrement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assujetti_id" uuid,
	"type" "type_recouvrement_enum" NOT NULL,
	"statut" "statut_dossier_recouvrement_enum" DEFAULT 'ouvert',
	"date_ouverture" timestamp DEFAULT now(),
	"date_cloture" timestamp,
	"transmis_omp_at" timestamp,
	"notes_internes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lignes_declaration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"declaration_id" uuid,
	"categorie_appareil" varchar(100) NOT NULL,
	"sous_categorie" varchar(100),
	"operateur" varchar(100),
	"nombre" integer NOT NULL,
	"tarif_unitaire" numeric(10, 2),
	"montant_ligne" numeric(10, 2),
	"remarque" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "notes_rectificatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_original_id" uuid,
	"assujetti_id" uuid,
	"pv_id" uuid,
	"penalites" numeric(10, 2) NOT NULL,
	"motif" text NOT NULL,
	"statut" "statut_note_enum" DEFAULT 'brouillon',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notes_taxation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_note" varchar(30),
	"assujetti_id" uuid,
	"declaration_id" uuid,
	"exercice" integer NOT NULL,
	"montant_brut" numeric(10, 2) NOT NULL,
	"reduction_pct" numeric(5, 2) DEFAULT '0',
	"montant_reduction" numeric(10, 2) DEFAULT '0',
	"montant_net" numeric(10, 2) NOT NULL,
	"montant_penalites" numeric(10, 2) DEFAULT '0',
	"montant_total_du" numeric(10, 2) NOT NULL,
	"devise" varchar(3) DEFAULT 'USD',
	"statut" "statut_note_enum" DEFAULT 'brouillon',
	"date_emission" date,
	"date_remise" date,
	"date_echeance" date,
	"pdf_url" varchar(512),
	"genere_par_id" uuid,
	"signe_par_sous_dir_id" uuid,
	"signe_par_sous_dir_at" timestamp,
	"signe_par_directeur_id" uuid,
	"signe_par_directeur_at" timestamp,
	"banque_nom" varchar(100),
	"banque_iban" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notes_taxation_numero_note_unique" UNIQUE("numero_note")
);
--> statement-breakpoint
CREATE TABLE "paiements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_taxation_id" uuid,
	"assujetti_id" uuid,
	"montant" numeric(10, 2) NOT NULL,
	"devise" varchar(3) DEFAULT 'USD',
	"canal" "canal_paiement_enum" NOT NULL,
	"reference_transaction" varchar(100),
	"banque_nom" varchar(100),
	"numero_compte_debiteur" varchar(50),
	"date_paiement" date NOT NULL,
	"preuve_url" varchar(512),
	"statut" "statut_paiement_enum" DEFAULT 'en_attente',
	"confirme_par_id" uuid,
	"confirme_at" timestamp,
	"motif_rejet" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "periodes_declaration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercice" integer NOT NULL,
	"date_ouverture" date NOT NULL,
	"date_fermeture" date NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "proces_verbaux" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"controle_id" uuid,
	"agent_opj_id" uuid,
	"date_pv" timestamp DEFAULT now(),
	"infractions_constatees" text NOT NULL,
	"pdf_url" varchar(512),
	"transmis_directeur_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rappels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assujetti_id" uuid,
	"note_taxation_id" uuid,
	"type_rappel" "type_rappel_enum" NOT NULL,
	"canal" "canal_notification_enum" NOT NULL,
	"statut" varchar(20) DEFAULT 'planifie',
	"contenu_objet" varchar(255),
	"contenu_corps" text,
	"date_planifiee" timestamp NOT NULL,
	"date_envoi" timestamp,
	"erreur" text,
	"declenche_par_id" uuid,
	"is_automatique" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reclamations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assujetti_id" uuid,
	"note_taxation_id" uuid,
	"date_depot" timestamp DEFAULT now(),
	"motif" text NOT NULL,
	"statut" "statut_reclamation_enum" DEFAULT 'deposee',
	"decision_text" text,
	"date_decision" timestamp,
	"traite_par_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid,
	"permission_id" uuid,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"user_type" varchar(10) NOT NULL,
	"session_token" varchar(512) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"is_valid" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_personne" "type_personne_enum" NOT NULL,
	"zone_tarifaire" "zone_tarifaire_enum" NOT NULL,
	"categorie_appareil" varchar(100) NOT NULL,
	"tarif_unitaire" numeric(10, 2) NOT NULL,
	"valide_du" date NOT NULL,
	"valide_au" date,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid,
	"role_id" uuid,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_commune_id_communes_id_fk" FOREIGN KEY ("commune_id") REFERENCES "public"."communes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assujettis" ADD CONSTRAINT "assujettis_agent_createur_id_app_users_id_fk" FOREIGN KEY ("agent_createur_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controles" ADD CONSTRAINT "controles_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controles" ADD CONSTRAINT "controles_agent_id_app_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_agent_id_app_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_valide_par_id_app_users_id_fk" FOREIGN KEY ("valide_par_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossiers_recouvrement" ADD CONSTRAINT "dossiers_recouvrement_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lignes_declaration" ADD CONSTRAINT "lignes_declaration_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_rectificatives" ADD CONSTRAINT "notes_rectificatives_note_original_id_notes_taxation_id_fk" FOREIGN KEY ("note_original_id") REFERENCES "public"."notes_taxation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_rectificatives" ADD CONSTRAINT "notes_rectificatives_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_rectificatives" ADD CONSTRAINT "notes_rectificatives_pv_id_proces_verbaux_id_fk" FOREIGN KEY ("pv_id") REFERENCES "public"."proces_verbaux"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD CONSTRAINT "notes_taxation_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD CONSTRAINT "notes_taxation_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD CONSTRAINT "notes_taxation_genere_par_id_app_users_id_fk" FOREIGN KEY ("genere_par_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD CONSTRAINT "notes_taxation_signe_par_sous_dir_id_app_users_id_fk" FOREIGN KEY ("signe_par_sous_dir_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_taxation" ADD CONSTRAINT "notes_taxation_signe_par_directeur_id_app_users_id_fk" FOREIGN KEY ("signe_par_directeur_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_note_taxation_id_notes_taxation_id_fk" FOREIGN KEY ("note_taxation_id") REFERENCES "public"."notes_taxation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_confirme_par_id_app_users_id_fk" FOREIGN KEY ("confirme_par_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proces_verbaux" ADD CONSTRAINT "proces_verbaux_controle_id_controles_id_fk" FOREIGN KEY ("controle_id") REFERENCES "public"."controles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proces_verbaux" ADD CONSTRAINT "proces_verbaux_agent_opj_id_app_users_id_fk" FOREIGN KEY ("agent_opj_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rappels" ADD CONSTRAINT "rappels_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rappels" ADD CONSTRAINT "rappels_note_taxation_id_notes_taxation_id_fk" FOREIGN KEY ("note_taxation_id") REFERENCES "public"."notes_taxation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rappels" ADD CONSTRAINT "rappels_declenche_par_id_app_users_id_fk" FOREIGN KEY ("declenche_par_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamations" ADD CONSTRAINT "reclamations_assujetti_id_assujettis_id_fk" FOREIGN KEY ("assujetti_id") REFERENCES "public"."assujettis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamations" ADD CONSTRAINT "reclamations_note_taxation_id_notes_taxation_id_fk" FOREIGN KEY ("note_taxation_id") REFERENCES "public"."notes_taxation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamations" ADD CONSTRAINT "reclamations_traite_par_id_app_users_id_fk" FOREIGN KEY ("traite_par_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;