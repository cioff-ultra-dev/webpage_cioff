ALTER TABLE "festivals" DROP CONSTRAINT "festivals_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "festivals" DROP COLUMN IF EXISTS "owner_id";