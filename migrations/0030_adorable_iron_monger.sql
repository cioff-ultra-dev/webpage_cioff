CREATE TABLE IF NOT EXISTS "groups_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" text,
	"general_director_profile" text,
	"artistic_director_profile" text,
	"lang" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "ns_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups_lang" ADD CONSTRAINT "groups_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups_lang" ADD CONSTRAINT "groups_lang_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN IF EXISTS "owner_id";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN IF EXISTS "general_director_profile";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN IF EXISTS "artistic_director_profile";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN IF EXISTS "address";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN IF EXISTS "description";