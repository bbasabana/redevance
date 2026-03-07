-- Run this in Neon Dashboard → SQL Editor (or any PostgreSQL client)
-- Creates onboarding_status_enum and onboarding_progress table

CREATE TYPE "public"."onboarding_status_enum" AS ENUM('pending', 'step_1_done', 'step_2_done', 'step_3_done', 'completed');

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

ALTER TABLE "onboarding_progress"
  ADD CONSTRAINT "onboarding_progress_user_id_app_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
