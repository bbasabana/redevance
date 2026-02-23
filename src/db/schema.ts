import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, pgEnum, date, primaryKey, jsonb } from "drizzle-orm/pg-core";

// Enums (Keep relevant ones, add new ones if needed)
export const typePersonneEnum = pgEnum("type_personne_enum", ["pp", "pm", "pp_advantage", "pm_advantage"]);
export const zoneTarifaireEnum = pgEnum("zone_tarifaire_enum", ["urbaine", "rurale"]);
export const statutAssujettiEnum = pgEnum("statut_assujetti_enum", ["nouveau", "en_cours", "redevable", "en_regle", "relance", "mise_en_demeure", "contentieux", "exonere"]);
export const statutDeclarationEnum = pgEnum("statut_declaration_enum", ["brouillon", "soumise", "validee", "contestee", "archivee"]);
export const statutNoteEnum = pgEnum("statut_note_enum", ["brouillon", "en_attente_signature1", "en_attente_signature2", "emise", "payee", "partiellement_payee", "en_retard", "contentieux"]);
export const statutPaiementEnum = pgEnum("statut_paiement_enum", ["en_attente", "confirme", "rejete", "rembourse"]);
export const canalPaiementEnum = pgEnum("canal_paiement_enum", ["banque", "mtn_money", "airtel_money", "orange_money", "autre"]);
export const typeControleEnum = pgEnum("type_controle_enum", ["sur_pieces", "sur_place", "visite_domiciliaire", "perquisition"]);
export const statutControleEnum = pgEnum("statut_controle_enum", ["planifie", "en_cours", "realise", "annule"]);
export const canalNotificationEnum = pgEnum("canal_notification_enum", ["email", "sms", "push", "in_app"]);
export const typeRappelEnum = pgEnum("type_rappel_enum", ["j15", "j30", "j38", "relance", "mise_en_demeure", "fin_exercice", "personnalise"]);
export const statutReclamationEnum = pgEnum("statut_reclamation_enum", ["deposee", "en_instruction", "acceptee", "rejetee", "classee"]);
export const typeRecouvrementEnum = pgEnum("type_recouvrement_enum", ["amiable", "force"]);
export const statutDossierRecouvrementEnum = pgEnum("statut_dossier_recouvrement_enum", ["ouvert", "en_cours", "transmis_omp", "cloture", "suspendu"]);
export const typeStructureEnum = pgEnum("type_structure_enum", ["societe", "etablissement", "asbl"]);
export const typeActiviteEnum = pgEnum("type_activite_enum", ["hotel", "restaurant", "bar", "lounge", "paris_sportifs", "guest_house", "chaine_tv", "autre"]);
export const sousTypePmEnum = pgEnum("sous_type_pm_enum", ["pmta", "ppta", "pm"]);
export const onboardingStatusEnum = pgEnum("onboarding_status_enum", ["pending", "step_1_done", "step_2_done", "step_3_done", "completed"]);
export const validationStatusEnum = pgEnum("validation_status_enum", ["pending", "validated", "rejected", "none"]);

export const geographyTypeEnum = pgEnum("geography_type_enum", [
    "PROVINCE", "VILLE", "TERRITOIRE", "CITE", "SECTEUR", "CHEFFERIE", "COMMUNE", "QUARTIER", "GROUPEMENT"
]);

export const locationCategoryEnum = pgEnum("location_category_enum", [
    "URBAINE", "URBANO_RURALE", "RURALE"
]);

// --- RBAC TABLES ---

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).unique().notNull(), // admin, agent, assujetti, etc.
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).unique().notNull(), // e.g., 'declaration:create', 'payment:validate'
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// --- AUTH TABLES (SEPARATED) ---

// Columns common to both user tables (using a helper-like pattern to avoid repetition in definition if needed, 
// but Drizzle requires explicit definitions for each table)

const getCommonAuthFields = () => ({
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    nomPrenom: varchar("nom_prenom", { length: 255 }).notNull(),
    telephone: varchar("telephone", { length: 30 }),

    // Mandatory 2FA fields
    twoFactorSecret: varchar("two_factor_secret", { length: 255 }), // Encrypted
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    twoFactorSetupAt: timestamp("two_factor_setup_at"),
    recoveryCodes: text("recovery_codes").array(), // Hashed

    // Security & Audit
    lastLoginAt: timestamp("last_login_at"),
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    lockedUntil: timestamp("locked_until"),
    isActive: boolean("is_active").default(true),
    identificationCompleted: boolean("identification_completed").default(false).notNull(),
    mustSetup2Fa: boolean("must_setup_2fa").default(false), // Forced 2FA for first-time login of agents created by admin
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// IT Admins Only - Created manually, no public interface
export const adminUsers = pgTable("admin_users", {
    ...getCommonAuthFields(),
    superAdmin: boolean("super_admin").default(false),
});

// Assujettis, Agents, Controllers, etc.
export const appUsers = pgTable("app_users", {
    ...getCommonAuthFields(),
});

// Relation M:M for RBAC on app_users
export const userRoles = pgTable("user_roles", {
    userId: uuid("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// --- APPLICATION TABLES ---

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(), // Points to either table; check logic in app
    userType: varchar("user_type", { length: 10 }).notNull(), // 'admin' or 'app'
    sessionToken: varchar("session_token", { length: 512 }).unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    isValid: boolean("is_valid").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const communes = pgTable("communes", {
    id: uuid("id").primaryKey().defaultRandom(),
    nom: varchar("nom", { length: 100 }).notNull(),
    ville: varchar("ville", { length: 100 }).notNull(),
    province: varchar("province", { length: 100 }).notNull(),
    prefixeFiscal: varchar("prefixe_fiscal", { length: 5 }).unique().notNull(),
    zoneTarifaire: zoneTarifaireEnum("zone_tarifaire").notNull(),
    sequenceCourante: integer("sequence_courante").default(0),
    isActive: boolean("is_active").default(true),
});

export const assujettis = pgTable("assujettis", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => appUsers.id),
    identifiantFiscal: varchar("identifiant_fiscal", { length: 30 }).unique(),
    typePersonne: typePersonneEnum("type_personne").notNull(),
    nomRaisonSociale: varchar("nom_raison_sociale", { length: 255 }).notNull(),
    nif: varchar("nif", { length: 50 }),
    rccm: varchar("rccm", { length: 100 }),
    representantLegal: varchar("representant_legal", { length: 255 }),
    adresseSiege: text("adresse_siege").notNull(),
    communeId: uuid("commune_id").references(() => geographies.id),
    zoneTarifaire: zoneTarifaireEnum("zone_tarifaire").notNull(),
    telephonePrincipal: varchar("telephone_principal", { length: 30 }),
    telephoneSecondaire: varchar("telephone_secondaire", { length: 30 }),
    email: varchar("email", { length: 255 }),
    canalPrefere: canalNotificationEnum("canal_prefere").default("email"),
    statut: statutAssujettiEnum("statut").default("nouveau"),
    idNat: varchar("id_nat", { length: 50 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    agentCreateurId: uuid("agent_createur_id").references(() => appUsers.id),
    derniereDeclarationId: uuid("derniere_declaration_id"),
    exerciceCourant: integer("exercice_courant"),
    datePremiereIdentification: date("date_premiere_identification"),
    notesInternes: text("notes_internes"),
    isExonere: boolean("is_exonere").default(false),
    motifExoneration: text("motif_exoneration"),
    // Profile completion and documents
    nifUrl: varchar("nif_url", { length: 512 }),
    rccmUrl: varchar("rccm_url", { length: 512 }),
    idNatUrl: varchar("id_nat_url", { length: 512 }),
    typeStructure: typeStructureEnum("type_structure"),
    typeActivite: typeActiviteEnum("type_activite"),
    activites: jsonb("activites").default([]),
    precisionAutre: text("precision_autre"),
    sousTypePm: sousTypePmEnum("sous_type_pm"),
    profilComplet: boolean("profil_complet").default(false),
    validationStatus: validationStatusEnum("validation_status").default("none"),
    dateValidation: timestamp("date_validation"),
    validateurId: uuid("validateur_id").references(() => appUsers.id),
    commentaireValidation: text("commentaire_validation"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const declarations = pgTable("declarations", {
    id: uuid("id").primaryKey().defaultRandom(),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    exercice: integer("exercice").notNull(),
    dateDeclaration: date("date_declaration").notNull(),
    statut: statutDeclarationEnum("statut").default("brouillon"),
    totalAppareils: integer("total_appareils").default(0),
    signatureAssujettiUrl: varchar("signature_assujetti_url", { length: 512 }),
    signatureDate: timestamp("signature_date"),
    agentId: uuid("agent_id").references(() => appUsers.id),
    valideParId: uuid("valide_par_id").references(() => appUsers.id),
    valideAt: timestamp("valide_at"),
    remarques: text("remarques"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const lignesDeclaration = pgTable("lignes_declaration", {
    id: uuid("id").primaryKey().defaultRandom(),
    declarationId: uuid("declaration_id").references(() => declarations.id),
    categorieAppareil: varchar("categorie_appareil", { length: 100 }).notNull(),
    sousCategorie: varchar("sous_categorie", { length: 100 }),
    operateur: varchar("operateur", { length: 100 }),
    nombre: integer("nombre").notNull(),
    tarifUnitaire: decimal("tarif_unitaire", { precision: 10, scale: 2 }),
    montantLigne: decimal("montant_ligne", { precision: 10, scale: 2 }),
    remarque: varchar("remarque", { length: 255 }),
});

export const notesTaxation = pgTable("notes_taxation", {
    id: uuid("id").primaryKey().defaultRandom(),
    numeroNote: varchar("numero_note", { length: 30 }).unique(),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    declarationId: uuid("declaration_id").references(() => declarations.id),
    exercice: integer("exercice").notNull(),
    montantBrut: decimal("montant_brut", { precision: 10, scale: 2 }).notNull(),
    reductionPct: decimal("reduction_pct", { precision: 5, scale: 2 }).default("0"),
    montantReduction: decimal("montant_reduction", { precision: 10, scale: 2 }).default("0"),
    montantNet: decimal("montant_net", { precision: 10, scale: 2 }).notNull(),
    montantPenalites: decimal("montant_penalites", { precision: 10, scale: 2 }).default("0"),
    montantTotalDu: decimal("montant_total_du", { precision: 10, scale: 2 }).notNull(),
    devise: varchar("devise", { length: 3 }).default("USD"),
    statut: statutNoteEnum("statut").default("brouillon"),
    dateEmission: date("date_emission"),
    dateRemise: date("date_remise"),
    dateEcheance: date("date_echeance"),
    pdfUrl: varchar("pdf_url", { length: 512 }),
    genereParId: uuid("genere_par_id").references(() => appUsers.id),
    signeParSousDirId: uuid("signe_par_sous_dir_id").references(() => appUsers.id),
    signeParSousDirAt: timestamp("signe_par_sous_dir_at"),
    signeParDirecteurId: uuid("signe_par_directeur_id").references(() => appUsers.id),
    signeParDirecteurAt: timestamp("signe_par_directeur_at"),
    banqueNom: varchar("banque_nom", { length: 100 }),
    banqueIban: varchar("banque_iban", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const paiements = pgTable("paiements", {
    id: uuid("id").primaryKey().defaultRandom(),
    noteTaxationId: uuid("note_taxation_id").references(() => notesTaxation.id),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
    devise: varchar("devise", { length: 3 }).default("USD"),
    canal: canalPaiementEnum("canal").notNull(),
    referenceTransaction: varchar("reference_transaction", { length: 100 }),
    banqueNom: varchar("banque_nom", { length: 100 }),
    numeroCompteDebiteur: varchar("numero_compte_debiteur", { length: 50 }),
    datePaiement: date("date_paiement").notNull(),
    preuveUrl: varchar("preuve_url", { length: 512 }),
    statut: statutPaiementEnum("statut").default("en_attente"),
    confirmeParId: uuid("confirme_par_id").references(() => appUsers.id),
    confirmeAt: timestamp("confirme_at"),
    motifRejet: text("motif_rejet"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const rappels = pgTable("rappels", {
    id: uuid("id").primaryKey().defaultRandom(),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    noteTaxationId: uuid("note_taxation_id").references(() => notesTaxation.id),
    typeRappel: typeRappelEnum("type_rappel").notNull(),
    canal: canalNotificationEnum("canal").notNull(),
    statut: varchar("statut", { length: 20 }).default("planifie"),
    contenuObjet: varchar("contenu_objet", { length: 255 }),
    contenuCorps: text("contenu_corps"),
    datePlanifiee: timestamp("date_planifiee").notNull(),
    dateEnvoi: timestamp("date_envoi"),
    erreur: text("erreur"),
    declencheParId: uuid("declenche_par_id").references(() => appUsers.id),
    isAutomatique: boolean("is_automatique").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const tarifs = pgTable("tarifs", {
    id: uuid("id").primaryKey().defaultRandom(),
    typePersonne: typePersonneEnum("type_personne").notNull(),
    zoneTarifaire: zoneTarifaireEnum("zone_tarifaire").notNull(),
    categorieAppareil: varchar("categorie_appareil", { length: 100 }).notNull(),
    tarifUnitaire: decimal("tarif_unitaire", { precision: 10, scale: 2 }).notNull(),
    valideDu: date("valide_du").notNull(),
    valideAu: date("valide_au"),
    isActive: boolean("is_active").default(true),
});

export const periodesDeclaration = pgTable("periodes_declaration", {
    id: uuid("id").primaryKey().defaultRandom(),
    exercice: integer("exercice").notNull(),
    dateOuverture: date("date_ouverture").notNull(),
    dateFermeture: date("date_fermeture").notNull(),
    isActive: boolean("is_active").default(true),
});

export const controles = pgTable("controles", {
    id: uuid("id").primaryKey().defaultRandom(),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    typeControle: typeControleEnum("type_controle").notNull(),
    agentId: uuid("agent_id").references(() => appUsers.id),
    datePlanifiee: date("date_planifiee").notNull(),
    dateRealisee: date("date_realisee"),
    observations: text("observations"),
    statut: statutControleEnum("statut").default("planifie"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const procesVerbaux = pgTable("proces_verbaux", {
    id: uuid("id").primaryKey().defaultRandom(),
    controleId: uuid("controle_id").references(() => controles.id),
    agentOpjId: uuid("agent_opj_id").references(() => appUsers.id),
    datePv: timestamp("date_pv").defaultNow(),
    infractionsConstatees: text("infractions_constatees").notNull(),
    pdfUrl: varchar("pdf_url", { length: 512 }),
    transmisDirecteurAt: timestamp("transmis_directeur_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const notesRectificatives = pgTable("notes_rectificatives", {
    id: uuid("id").primaryKey().defaultRandom(),
    noteOriginalId: uuid("note_original_id").references(() => notesTaxation.id),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    pvId: uuid("pv_id").references(() => procesVerbaux.id),
    penalites: decimal("penalites", { precision: 10, scale: 2 }).notNull(),
    motif: text("motif").notNull(),
    statut: statutNoteEnum("statut").default("brouillon"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const reclamations = pgTable("reclamations", {
    id: uuid("id").primaryKey().defaultRandom(),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    noteTaxationId: uuid("note_taxation_id").references(() => notesTaxation.id),
    dateDepot: timestamp("date_depot").defaultNow(),
    motif: text("motif").notNull(),
    statut: statutReclamationEnum("statut").default("deposee"),
    decisionText: text("decision_text"),
    dateDecision: timestamp("date_decision"),
    traiteParId: uuid("traite_par_id").references(() => appUsers.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const dossiersRecouvrement = pgTable("dossiers_recouvrement", {
    id: uuid("id").primaryKey().defaultRandom(),
    assujettiId: uuid("assujetti_id").references(() => assujettis.id),
    type: typeRecouvrementEnum("type").notNull(),
    statut: statutDossierRecouvrementEnum("statut").default("ouvert"),
    dateOuverture: timestamp("date_ouverture").defaultNow(),
    dateCloture: timestamp("date_cloture"),
    transmisOmpAt: timestamp("transmis_omp_at"),
    notesInternes: text("notes_internes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const geographies = pgTable("geographies", {
    id: uuid("id").primaryKey().defaultRandom(),
    nom: varchar("nom", { length: 255 }).notNull(),
    type: geographyTypeEnum("type").notNull(),
    parentId: uuid("parent_id").references((): any => geographies.id),
    category: locationCategoryEnum("category"), // Used for pricing rules
    isActive: boolean("is_active").default(true),
});

export const taxationRules = pgTable("taxation_rules", {
    id: uuid("id").primaryKey().defaultRandom(),
    category: locationCategoryEnum("category").notNull(),
    entityType: sousTypePmEnum("entity_type").notNull(), // ppta, pmta, pm
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
});

// --- ONBOARDING & IDENTIFICATION PERSISTENCE ---

export const onboardingProgress = pgTable("onboarding_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique().references(() => appUsers.id, { onDelete: "cascade" }),
    status: onboardingStatusEnum("status").default("pending").notNull(),
    lastStep: integer("last_step").default(0).notNull(), // 0, 1, 2, 3, 4
    step1Data: jsonb("step_1_data"), // Business/Personal info
    step2Data: jsonb("step_2_data"), // Device declarations
    step3Data: jsonb("step_3_data"), // Documents/Signatures
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const settings = pgTable("settings", {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 100 }).unique().notNull(), // e.g., 'exchange_rate_usd_fc'
    value: text("value").notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
