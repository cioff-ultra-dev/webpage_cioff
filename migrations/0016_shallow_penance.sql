ALTER TABLE "national_section" DROP CONSTRAINT "national_section_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "national_section" DROP COLUMN IF EXISTS "owner_id";