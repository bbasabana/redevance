-- Journal audit console admin (à exécuter une fois si la table n’existe pas).
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "action" varchar(120) NOT NULL,
    "target_type" varchar(80),
    "target_id" varchar(80),
    "summary" text,
    "metadata" jsonb,
    "ip_address" varchar(45),
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_created_at_idx" ON "admin_audit_logs" ("created_at" DESC);
